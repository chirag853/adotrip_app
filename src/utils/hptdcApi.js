// Live HPTDC (Himachal Tourism) hotels API.
// GET https://www.adotrip.com/api/v1/hptdc
// GET https://www.adotrip.com/api/v1/hptdc/hotels/<slug>
// List response: { status, message, data: { circuits, filters, pagination } }
// Detail response: { status, message, data: { ...hotel, rooms, facilities } }
// Each circuit contains its hotels, so the app does not need any static hotel
// list. The API is fetched through the same local proxy as packages on Android
// because the upstream certificate chain is incomplete there.

import { proxiedImageUrl } from './packagesApi';

const HPTDC_BASE = 'https://www.adotrip.com/api/v1/hptdc';
const HPTDC_URL = `${HPTDC_BASE}?per_page=100&page=1`;

function resolveProxyUrl() {
  const v = process.env.EXPO_PUBLIC_PACKAGES_PROXY_URL;
  const s = String(v || '').trim().replace(/\/+$/, '');
  return s || null;
}

function resolveProxyCandidates() {
  const out = [];
  const envProxy = resolveProxyUrl();
  if (envProxy) out.push(envProxy);
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    for (const c of ['http://10.0.2.2:8787', 'http://localhost:8787']) {
      if (!out.includes(c)) out.push(c);
    }
  }
  return out;
}

function proxyTimeoutMs(timeoutMs) {
  return Math.min(Number(timeoutMs) || 20000, 8000);
}

function isRecoverableError(e) {
  return (
    e?.code === 'SSL_VERIFY_FAILED' ||
    e?.code === 'OFFLINE' ||
    e?.code === 'TIMEOUT' ||
    e?.code === 'BAD_SHAPE'
  );
}

function toFriendlyError(e) {
  const raw = String(e?.message || e || '');
  const cause = String(e?.cause?.message || e?.cause || '');
  const combined = `${raw} ${cause}`;
  if (e?.name === 'AbortError' || /aborted/i.test(combined)) return e;
  if (/ssl|cert|handshak|trust anchor|unable to verify/i.test(combined)) {
    const err = new Error(
      "Couldn't load HPTDC hotels. Check your connection and tap Retry."
    );
    err.code = 'SSL_VERIFY_FAILED';
    err.cause = raw || cause;
    return err;
  }
  if (/network request failed|failed to fetch|offline|internet/i.test(combined)) {
    const err = new Error('No internet connection. Check your network and tap Retry.');
    err.code = 'OFFLINE';
    err.cause = raw || cause;
    return err;
  }
  return e;
}

function htmlToText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlParagraphs(value) {
  const html = String(value || '');
  if (!html.trim()) return [];
  const blocks = html.match(/<(p|li|div)[^>]*>[\s\S]*?<\/\1>/gi);
  const source = blocks && blocks.length ? blocks : [html];
  const seen = new Set();
  const out = [];

  for (const block of source) {
    const text = htmlToText(block);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

// Detail API description me "About" ke baad "Frequently Asked Questions"
// section hota hai. Use alag sections me todte hain, taaki mobile par lamba
// HTML blob ek hi wall of text na bane.
function extractAboutAndFaqs(description) {
  const html = String(description || '');
  const marker = html.search(/frequently asked questions/i);
  const aboutHtml = marker >= 0 ? html.slice(0, marker) : html;
  const faqHtml = marker >= 0 ? html.slice(marker) : '';
  const about = htmlParagraphs(aboutHtml);
  const faqs = [];

  const blocks = faqHtml.match(/<(p|li|div)[^>]*>[\s\S]*?<\/\1>/gi) || [];
  for (const block of blocks) {
    const text = htmlToText(block);
    const m = text.match(/^(Q\d+[\.:)])\s*([\s\S]*?)\?\s*([\s\S]+)$/i);
    if (!m) continue;
    const a = m[3].trim();
    if (a) faqs.push({ q: `${m[1]} ${m[2].trim()}?`, a });
  }

  // Kuch descriptions me FAQ paragraphs nested hote hain; fallback plain text
  // split se Q/A still nikal aate hain.
  if (!faqs.length && faqHtml) {
    const text = htmlToText(faqHtml.replace(/frequently asked questions/i, ''));
    for (const chunk of text.split(/(?=Q\d+[\.:)]\s)/i)) {
      const m = chunk.match(/^(Q\d+[\.:)])\s*([\s\S]*?)\?\s*([\s\S]+)$/i);
      if (m) faqs.push({ q: `${m[1]} ${m[2].trim()}?`, a: m[3].trim() });
    }
  }

  return { about, faqs };
}

function shortDescription(hotel) {
  const text = htmlToText(hotel?.description);
  if (!text) {
    return 'Official HPTDC property with verified government tariffs and authentic Himachali hospitality.';
  }
  const stop = text.search(/[.!?](\s|$)/);
  let sentence = stop > 24 ? text.slice(0, stop + 1) : text;
  if (sentence.length > 165) sentence = `${sentence.slice(0, 162).trim()}…`;
  return sentence;
}

function amenityIcon(label) {
  const t = String(label || '').toLowerCase();
  if (/wi-?fi|internet/.test(t)) return '📶';
  if (/restaurant|dining|cuisine|food|breakfast/.test(t)) return '🍽️';
  if (/parking|drive|valet/.test(t)) return '🚗';
  if (/heat|fire|bonfire/.test(t)) return '🔥';
  if (/tv|cable|intercom/.test(t)) return '📺';
  if (/bar|lounge|coffee/.test(t)) return '☕';
  if (/spa|massage|sauna/.test(t)) return '💆';
  if (/gym|fitness/.test(t)) return '🏋️';
  if (/garden|lawn|play/.test(t)) return '🌿';
  if (/view|mountain|valley/.test(t)) return '🌄';
  if (/doctor|medical/.test(t)) return '🩺';
  if (/conference|meeting|banquet/.test(t)) return '💼';
  return '✓';
}

const AMENITY_PRIORITY = [
  { re: /wi[-\u2010\u2011]?fi|internet/i, icon: '📶', label: 'Free WiFi' },
  { re: /restaurant|dining|cuisine|food|breakfast|cafe/i, icon: '🍽️', label: 'Dining' },
  { re: /parking|drive[-\u2010\u2011\s]?in|valet/i, icon: '🚗', label: 'Parking' },
  { re: /heat|fire|bonfire/i, icon: '🔥', label: 'Heating' },
  { re: /bar|lounge|coffee/i, icon: '☕', label: 'Bar & Lounge' },
  { re: /tv|cable|television/i, icon: '📺', label: 'TV' },
  { re: /conference|meeting|banquet|hall/i, icon: '💼', label: 'Conference' },
  { re: /doctor|medical/i, icon: '🩺', label: 'Doctor on call' },
  { re: /taxi|transport/i, icon: '🚕', label: 'Taxi on demand' },
  { re: /laundry|dry[-\u2010\u2011\s]?clean/i, icon: '👕', label: 'Laundry' },
  { re: /garden|lawn|park/i, icon: '🌿', label: 'Garden' },
  { re: /spa|massage|ayurved/i, icon: '💆', label: 'Spa' },
  { re: /gym|fitness/i, icon: '🏋️', label: 'Gym' },
  { re: /view|mountain|valley/i, icon: '🌄', label: 'Valley View' },
];

function facilityLabels(hotel) {
  const raw = [
    ...(Array.isArray(hotel?.facilities) ? hotel.facilities : []),
    ...(Array.isArray(hotel?.additional_facilities) ? hotel.additional_facilities : []),
  ];
  const seen = new Set();
  const out = [];

  for (const item of raw) {
    const label = htmlToText(typeof item === 'string' ? item : item?.name || item?.title);
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }

  return out;
}

function facilityHighlights(hotel) {
  const labels = facilityLabels(hotel);
  const out = [];
  for (const rule of AMENITY_PRIORITY) {
    if (out.length === 10) break;
    if (labels.some((label) => rule.re.test(label))) out.push(rule.label);
  }
  return out;
}

function normalizeAmenities(hotel) {
  const labels = facilityLabels(hotel);
  const out = [];

  // Card par WiFi / Dining / Parking jaise decision-making amenities dikhao,
  // na ki "Rooms optionally sold on MAP basis..." jaisi lambi lines.
  for (const rule of AMENITY_PRIORITY) {
    if (out.length === 3) break;
    if (labels.some((label) => rule.re.test(label))) {
      out.push({ icon: rule.icon, label: rule.label });
    }
  }

  if (out.length < 3) {
    for (const label of labels) {
      if (out.length === 3) break;
      if (out.some((a) => a.label.toLowerCase() === label.toLowerCase())) continue;
      const short = label.length > 28 ? `${label.slice(0, 25).trim()}…` : label;
      out.push({ icon: amenityIcon(short), label: short });
    }
  }

  return out.length
    ? out
    : [
        { icon: '🛏️', label: 'Comfortable Rooms' },
        { icon: '🍽️', label: 'Dining' },
        { icon: '🚗', label: 'Parking' },
      ];
}

function badgeFor(hotel) {
  const cls = String(hotel?.class || '').trim();
  const type = String(hotel?.hotel_type || '');
  const name = String(hotel?.name || '');
  const base = cls ? cls.toUpperCase() : 'HPTDC';
  const heritage = /heritage|palace|castle/i.test(`${type} ${name}`);
  const badge = heritage
    ? base === 'PREMIUM'
      ? 'PREMIUM HERITAGE'
      : `${base} HERITAGE`
    : base;
  const badgeColor =
    cls === 'Premium' ? '#059669' : cls === 'Budget' ? '#B45309' : '#2563EB';
  return { badge, badgeColor };
}

function toAbsoluteUrl(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/')) return `https://www.adotrip.com${s}`;
  return `https://www.adotrip.com/${s}`;
}

function formatAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') return address.trim();
  if (Array.isArray(address)) {
    return address.map(formatAddress).filter(Boolean).join(', ');
  }
  if (typeof address === 'object') {
    return [
      address.street,
      address.city || address.district || address.town,
      address.state,
      address.postal_code,
      address.country,
    ]
      .map((x) => String(x || '').trim())
      .filter(Boolean)
      .join(', ');
  }
  return String(address).trim();
}

function normalizeContact(contact) {
  if (!contact || typeof contact !== 'object') return { phone: '', email: '', fax: '' };
  return {
    phone: String(contact.phone || '').trim(),
    email: String(contact.email || '').trim(),
    fax: String(contact.fax || '').trim(),
  };
}

function normalizeHotel(hotel, circuitName, proxyBase) {
  const image = toAbsoluteUrl(hotel?.image_url || hotel?.image || '');
  const gallery = Array.isArray(hotel?.gallery_urls)
    ? hotel.gallery_urls
        .map(toAbsoluteUrl)
        .map((g) => proxiedImageUrl(proxyBase, g))
        .filter(Boolean)
    : [];
  const { badge, badgeColor } = badgeFor(hotel);
  const location =
    formatAddress(hotel?.address) ||
    [hotel?.name, circuitName].filter(Boolean).join(', ');

  return {
    id: String(hotel?.id ?? hotel?.slug ?? hotel?.name ?? ''),
    name: String(hotel?.name || 'HPTDC Hotel').trim(),
    slug: String(hotel?.slug || '').trim(),
    circuit: circuitName,
    hotelType: String(hotel?.hotel_type || '').trim(),
    class: String(hotel?.class || '').trim(),
    className: String(hotel?.class || '').trim(),
    location,
    desc: shortDescription(hotel),
    badge,
    badgeColor,
    approved: 'Govt Approved',
    amenities: normalizeAmenities(hotel),
    facilities: facilityHighlights(hotel),
    facilitiesRaw: facilityLabels(hotel),
    tariffLabel: 'Government Tariff',
    price: Number(hotel?.starting_price) || 0,
    rooms: Number(hotel?.rooms_count) || 0,
    image: proxiedImageUrl(proxyBase, image),
    imageDirect: image,
    gallery,
    contact: normalizeContact(hotel?.contact),
    detailUrl: String(hotel?.detail_url || '').trim(),
    webUrl: String(hotel?.web_url || '').trim(),
    subHeading: String(hotel?.sub_heading || '').trim(),
  };
}

export function normalizeHptdc(raw, proxyBase = null) {
  const rawCircuits = Array.isArray(raw?.data?.circuits) ? raw.data.circuits : [];
  const seen = new Set();
  const hotels = [];

  const circuits = rawCircuits
    .map((circuit) => {
      const name = String(circuit?.name || 'Himachal Circuit').trim();
      const list = Array.isArray(circuit?.hotels) ? circuit.hotels : [];
      const normalized = list
        .map((hotel) => normalizeHotel(hotel, name, proxyBase))
        .filter((hotel) => {
          if (!hotel.id || seen.has(hotel.id)) return false;
          seen.add(hotel.id);
          hotels.push(hotel);
          return true;
        });

      return {
        name,
        count: Number(circuit?.count) || normalized.length,
        hotels: normalized,
      };
    })
    .filter((circuit) => circuit.name && (circuit.hotels.length || circuit.count));

  return {
    circuits,
    hotels,
    total: Number(raw?.data?.pagination?.total) || hotels.length,
    filters: raw?.data?.filters || null,
  };
}

function normalizeRoom(room, index) {
  const availability =
    room?.availability && typeof room.availability === 'object' ? room.availability : null;
  const facilities = (Array.isArray(room?.facilities) ? room.facilities : [])
    .map((item) => htmlToText(typeof item === 'string' ? item : item?.name || item?.title || ''))
    .filter(Boolean);

  return {
    id: String(room?.id ?? `room-${index}`),
    name: String(room?.room_type || 'Room').trim(),
    tariff: String(room?.tariff || '').trim(),
    price: Number(room?.price) || 0,
    cutPrice: Number(room?.cut_price_amount ?? room?.cut_price) || 0,
    taxesExtra: Boolean(room?.taxes_extra),
    cancellation: String(room?.cancellation_policy || '').trim(),
    facilities,
    totalRooms: Number(availability?.total_rooms) || 0,
  };
}

export function normalizeHptdcHotelDetail(raw, proxyBase = null) {
  const d = raw?.data && typeof raw.data === 'object' ? raw.data : {};
  const { about, faqs } = extractAboutAndFaqs(d.description);
  const directImages = [];
  const addImage = (value) => {
    const url = toAbsoluteUrl(value);
    if (url && !directImages.includes(url)) directImages.push(url);
  };

  addImage(d.image_url);
  addImage(d.image);
  if (Array.isArray(d.gallery_urls)) d.gallery_urls.forEach(addImage);
  if (Array.isArray(d.gallery)) d.gallery.forEach(addImage);

  const images = directImages.map((url) => proxiedImageUrl(proxyBase, url)).filter(Boolean);
  const { badge, badgeColor } = badgeFor(d);
  const rooms = (Array.isArray(d.rooms) ? d.rooms : []).map(normalizeRoom);
  const startingPrice =
    Number(d.starting_price) ||
    rooms.reduce(
      (min, room) => (room.price > 0 && (!min || room.price < min) ? room.price : min),
      0
    ) ||
    0;
  const location =
    formatAddress(d.address) || [d.name, d.circuit_type].filter(Boolean).join(', ');

  return {
    id: String(d.id ?? d.slug ?? ''),
    name: String(d.name || 'HPTDC Hotel').trim(),
    slug: String(d.slug || '').trim(),
    circuit: String(d.circuit_type || '').trim(),
    hotelType: String(d.hotel_type || '').trim(),
    class: String(d.class || '').trim(),
    className: String(d.class || '').trim(),
    badge,
    badgeColor,
    location,
    subHeading: String(d.sub_heading || '').trim(),
    notes: String(d.notes || '').trim(),
    about,
    faqs,
    image: images[0] || '',
    imageDirect: directImages[0] || '',
    images,
    gallery: images.slice(1),
    facilities: facilityLabels(d),
    nearbyAttractions: (Array.isArray(d.nearby_attractions) ? d.nearby_attractions : [])
      .map((item) =>
        htmlToText(typeof item === 'string' ? item : item?.name || item?.title || '')
      )
      .filter(Boolean),
    contact: normalizeContact(d.contact),
    roomsCount: Number(d.rooms_count) || rooms.length,
    startingPrice,
    rooms,
    webUrl: String(d.web_url || '').trim(),
    detailUrl: String(d.detail_url || '').trim(),
    coupon: d.coupon || null,
  };
}

async function getJson(url, signal, timeoutMs, kind = 'list') {
  const ctrl = new AbortController();
  let timedOut = false;
  const onOuterAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onOuterAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) {
      const err = new Error('HPTDC request timed out. Tap Retry.');
      err.code = 'TIMEOUT';
      err.cause = String(e?.message || e);
      throw err;
    }
    throw toFriendlyError(e);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onOuterAbort);
  }

  if (!res.ok) {
    const err = new Error(`HPTDC API failed (${res.status})`);
    err.code = res.status >= 500 ? 'SERVER' : 'HTTP';
    err.status = res.status;
    throw err;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    const err = new Error('Invalid HPTDC server response. Tap Retry.');
    err.code = 'BAD_JSON';
    err.cause = String(e?.message || e);
    throw err;
  }

  if (kind === 'detail') {
    if (!json?.data || typeof json.data !== 'object' || !json.data.slug) {
      const err = new Error('HPTDC hotel details returned an unexpected response. Tap Retry.');
      err.code = 'BAD_SHAPE';
      throw err;
    }
    return json;
  }

  if (!Array.isArray(json?.data?.circuits)) {
    // Purana proxy ?hptdc=1 ko packages samajh ke packages JSON de sakta hai.
    const err = new Error('HPTDC API returned an unexpected response. Tap Retry.');
    err.code = 'BAD_SHAPE';
    throw err;
  }
  return json;
}

async function fetchWithFallback({ directFn, proxyFn, signal }) {
  const candidates = resolveProxyCandidates();
  const preferProxy = Boolean(resolveProxyUrl()) && candidates.length > 0;

  if (preferProxy) {
    let proxyErr;
    for (const proxy of candidates) {
      try {
        return await proxyFn(proxy);
      } catch (pe) {
        if (pe?.name === 'AbortError') throw pe;
        proxyErr = pe;
      }
    }

    try {
      return await directFn();
    } catch (directErr) {
      if (directErr?.name === 'AbortError') throw directErr;
      if (proxyErr) directErr.cause = `${proxyErr.message} | direct: ${directErr.message}`;
      throw directErr;
    }
  }

  try {
    return await directFn();
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    if (!isRecoverableError(e)) throw e;

    let lastErr = e;
    for (const proxy of candidates) {
      try {
        return await proxyFn(proxy);
      } catch (pe) {
        if (pe?.name === 'AbortError') throw pe;
        lastErr = pe;
        lastErr.cause = `${e.message} | proxy ${proxy}: ${pe.message}`;
      }
    }
    throw lastErr;
  }
}

export async function fetchHptdcHotels({ signal, timeoutMs = 20000 } = {}) {
  return fetchWithFallback({
    signal,
    directFn: async () => normalizeHptdc(await getJson(HPTDC_URL, signal, timeoutMs), null),
    proxyFn: async (proxy) =>
      normalizeHptdc(
        await getJson(`${proxy}?hptdc=1`, signal, proxyTimeoutMs(timeoutMs)),
        proxy
      ),
  });
}

export async function fetchHptdcHotelDetail({ slug, signal, timeoutMs = 20000 } = {}) {
  const cleanSlug = String(slug || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (!cleanSlug) {
    const err = new Error('Hotel not found.');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const encodedSlug = encodeURIComponent(cleanSlug);
  return fetchWithFallback({
    signal,
    directFn: async () =>
      normalizeHptdcHotelDetail(
        await getJson(`${HPTDC_BASE}/hotels/${encodedSlug}`, signal, timeoutMs, 'detail'),
        null
      ),
    proxyFn: async (proxy) =>
      normalizeHptdcHotelDetail(
        await getJson(
          `${proxy}?hptdc_detail=${encodedSlug}`,
          signal,
          proxyTimeoutMs(timeoutMs),
          'detail'
        ),
        proxy
      ),
  });
}

// Backwards-compatible alias for earlier drafts.
export const fetchHptdcData = fetchHptdcHotels;
