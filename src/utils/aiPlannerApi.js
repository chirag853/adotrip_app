// AI Circuit Planner — calls the Adotrip proxy, which forwards to OpenRouter.
// The OpenRouter key never lives in the app bundle: the proxy reads it from
// .env (local) or a Cloudflare/Render secret.

function resolveProxyCandidates() {
  const out = [];
  const envProxy = String(process.env.EXPO_PUBLIC_PACKAGES_PROXY_URL || '')
    .trim()
    .replace(/\/+$/, '');
  if (envProxy) out.push(envProxy);
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    for (const c of ['http://10.0.2.2:8787', 'http://localhost:8787']) {
      if (!out.includes(c)) out.push(c);
    }
  }
  return out;
}

function text(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' • ');
  if (typeof value === 'object') {
    return text(value.name || value.title || value.text || value.description || '');
  }
  return String(value).replace(/\s+/g, ' ').trim();
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(value.replace(/,\s*([}\]])/g, '$1'));
    } catch {
      return null;
    }
  }
}

function extractJson(content) {
  const raw = String(content || '').trim();
  if (!raw) return null;
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  const direct = tryParseJson(cleaned);
  if (direct) return direct;

  const firstArray = cleaned.indexOf('[');
  const lastArray = cleaned.lastIndexOf(']');
  if (firstArray >= 0 && lastArray > firstArray) {
    const parsed = tryParseJson(cleaned.slice(firstArray, lastArray + 1));
    if (parsed) return parsed;
  }

  const firstObject = cleaned.indexOf('{');
  const lastObject = cleaned.lastIndexOf('}');
  if (firstObject >= 0 && lastObject > firstObject) {
    const parsed = tryParseJson(cleaned.slice(firstObject, lastObject + 1));
    if (parsed) return parsed;
  }

  return null;
}

function collectDays(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    for (const key of ['itinerary', 'days', 'plan', 'data', 'results']) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
    if (parsed.day || parsed.title || parsed.city) return [parsed];
  }
  return [];
}

function normalizeDay(day, index) {
  const raw = day && typeof day === 'object' ? day : {};
  const rawDay = raw.day ?? raw.day_number ?? raw.dayNumber;
  const dayMatch = String(rawDay ?? '').match(/(\d{1,2})/);
  const parsedNumber = dayMatch ? parseInt(dayMatch[1], 10) : NaN;
  const dayNumber =
    Number.isFinite(parsedNumber) && parsedNumber > 0 && parsedNumber <= 31
      ? parsedNumber
      : index + 1;
  const dayLabel = `Day ${dayNumber}`;
  const city = text(raw.city || raw.destination || raw.location);
  const attraction = text(
    raw.attraction_name || raw.attraction || raw.place || raw.attractions
  );

  return {
    id: `${dayNumber}-${index}-${city}`,
    dayNumber,
    dayLabel,
    city,
    attraction,
    title: text(raw.title || attraction || `Day ${dayNumber}`),
    morning: text(raw.morning || raw.morning_activity),
    afternoon: text(raw.afternoon || raw.afternoon_activity),
    food: text(raw.food || raw.meals || raw.food_recommendation),
    hotel: text(raw.hotel || raw.stay || raw.accommodation),
    transport: text(raw.transport || raw.transportation),
    summary: text(raw.summary || raw.overview),
    duration: text(raw.estimated_visit_duration || raw.duration),
  };
}

export function parseItineraryContent(content) {
  const parsed = extractJson(content);
  const days = collectDays(parsed);
  if (!days.length) {
    throw new Error('The AI returned an unexpected itinerary format. Please try again.');
  }
  return days.map(normalizeDay);
}

function errorMessage(json, status, fallbackText) {
  const e = json?.error;
  if (typeof e === 'string' && e.trim()) return e.trim();
  if (e && typeof e === 'object') return e.message || e.detail || `AI planner failed (${status}).`;
  if (json?.detail) return String(json.detail);
  if (fallbackText) return fallbackText.slice(0, 220);
  return `AI planner failed (${status}).`;
}

async function postJson(url, body, signal, timeoutMs) {
  const ctrl = new AbortController();
  let timedOut = false;
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) throw new Error('AI planner timed out. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onAbort);
  }
}

export async function fetchAiItinerary({
  route,
  days = 4,
  adults = 2,
  startDate = '',
  endDate = '',
  signal,
  timeoutMs = 130000,
} = {}) {
  const cleanRoute = String(route || '').replace(/\s+/g, ' ').trim();
  if (!cleanRoute) throw new Error('Please enter a destination to plan your trip.');

  const candidates = resolveProxyCandidates();
  if (!candidates.length) {
    throw new Error(
      'AI planner proxy is not configured. Set EXPO_PUBLIC_PACKAGES_PROXY_URL and restart the app.'
    );
  }

  let lastError = null;
  for (const base of candidates) {
    let res;
    try {
      res = await postJson(
        `${base}/api/ai/plan`,
        { route: cleanRoute, days, adults, startDate, endDate },
        signal,
        timeoutMs
      );
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      lastError = e;
      continue;
    }

    const raw = await res.text();
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {}

    if (!res.ok) {
      // An older proxy/worker may not have the AI route yet. Try the next
      // candidate (e.g. local proxy) instead of failing immediately.
      if (res.status === 404 || res.status === 405) {
        lastError = new Error(errorMessage(json, res.status, raw));
        continue;
      }
      throw new Error(errorMessage(json, res.status, raw));
    }

    const choice = json?.choices?.[0];
    const content =
      typeof choice?.message?.content === 'string'
        ? choice.message.content
        : Array.isArray(choice?.message?.content)
          ? choice.message.content.map((part) => part?.text || '').join('')
          : '';

    if (!content.trim()) {
      if (choice?.finish_reason === 'length') {
        throw new Error(
          'The AI response was cut off before the itinerary. Please try again with fewer days.'
        );
      }
      throw new Error('The AI did not return an itinerary. Please try again.');
    }

    return parseItineraryContent(content);
  }

  throw lastError || new Error('Could not reach the AI planner. Please try again.');
}
