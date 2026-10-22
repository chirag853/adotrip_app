import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../theme';
import { fetchAiItinerary } from '../utils/aiPlannerApi';
import { geocodeStops } from '../utils/geocodeApi';

// AI Circuit Planner — Adotrip website jaisa full landing page:
// hero -> smart itinerary generator -> how it works -> why AI -> social proof
// -> FAQ -> final CTA. Generator niche wala plan bhi kaam karta hai.
const NAVY = COLORS.secondary;
const INPUT_BG = '#F2F5FB';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HERO_POINTS = [
  'Get a Free Personalized Itinerary',
  'Real-time Availability',
  'Instant Booking & 24/7 Support',
];

const STEPS = [
  {
    icon: 'create-outline',
    title: 'Plan Your Travel Details',
    text: 'Tell us where you want to go, your dates and how many people are travelling.',
  },
  {
    icon: 'options-outline',
    title: 'Select Preferences',
    text: 'Pick your travel style, budget and interests — beaches, mountains, food or adventure.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Get Instant Personalized Itinerary',
    text: 'Our AI creates a complete day-wise plan with stays, activities and smart tips in seconds.',
  },
];

const WHY = [
  { icon: 'person-outline', title: 'Personalized Itineraries', text: 'Tailored to your taste, budget and pace.' },
  { icon: 'bulb-outline', title: 'Smart Recommendations', text: 'Best stays, food and hidden gems.' },
  { icon: 'flash-outline', title: 'Instant Planning', text: 'A complete trip plan in seconds.' },
  { icon: 'headset-outline', title: '24/7 Support', text: 'Real humans whenever you need help.' },
];

const TESTIMONIALS = [
  {
    initials: 'AS',
    name: 'Aarav Sharma',
    city: 'Mumbai, India',
    text: 'The AI planned our 6-day Bali trip perfectly — hotels, transfers and sightseeing all sorted in minutes. Saved us hours of research!',
    color: '#FFE3C2',
  },
  {
    initials: 'PM',
    name: 'Priya Menon',
    city: 'Bengaluru, India',
    text: "Loved the personalization — it suggested hidden gems we'd never have found. Our Manali itinerary was spot on.",
    color: '#DCE8FF',
  },
];

const FAQS = [
  {
    q: 'What is the AI-based itinerary planner?',
    a: 'It is a smart tool that creates a complete day-wise travel plan — stays, activities, transfers and tips — based on your destination, dates and preferences.',
  },
  {
    q: 'How accurate are the generated itineraries?',
    a: 'Our AI uses live destination data, verified attractions and traveller reviews. Plans are highly accurate and you can customise every detail.',
  },
  {
    q: 'Can I customize the itinerary?',
    a: 'Absolutely. Add or remove destinations, change dates and traveller count, then regenerate — the plan updates instantly.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account is needed to generate your first itinerary. Sign in only when you want to save trips or book directly from the app.',
  },
  {
    q: 'Is the AI planner free to use?',
    a: 'Yes — generating personalised itineraries is completely free. You only pay when you choose to book a trip.',
  },
];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function fmtDate(d) {
  if (!d) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "Delhi to Manali" / "Delhi → Manali" / "Delhi -> Manali" ko alag stops me
// todo, taaki ek hi field me poori route likhne par bhi map ke saare pins aayein.
function splitDestinationInput(value) {
  return String(value || '')
    .split(/\s+to\s+|→|->/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (c) => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}

// Leaflet + OpenStreetMap inside a WebView. Google Maps par Expo Go/dev build
// me API-key/tile issues aa rahe the, isliye yeh route key-free source use
// karta hai. The card is intentionally non-interactive (pointerEvents none) so
// vertical page scrolling never gets stuck on the map.
function buildRouteMapHtml(stops, proxyBase) {
  const base = String(proxyBase || '').replace(/\/+$/, '');
  const leafletCss = base
    ? `${base}/api/leaflet.css`
    : 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  const leafletJs = base
    ? `${base}/api/leaflet.js`
    : 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  const tileUrl = base
    ? `${base}/api/tile?z={z}&x={x}&y={y}`
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; OpenStreetMap contributors';
  const data = JSON.stringify(
    (stops || []).map((stop) => ({
      lat: Number(stop.latitude),
      lon: Number(stop.longitude),
      idx: Number(stop.index) + 1,
      name: escapeHtml(stop.name || ''),
    }))
  ).replace(/<\//g, '<\\/');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="${leafletCss}" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
    #map { position: relative; }
    body { overflow: hidden; background: #eaf2e8; }
    .leaflet-container { background: #eaf2e8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .stop-pin {
      width: 24px; height: 24px; border-radius: 50%;
      background: #FEE400; border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(14,42,71,0.35);
      display: flex; align-items: center; justify-content: center;
      color: #0E2A47; font-weight: 900; font-size: 11px;
    }
    .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.86); }
    #map-error {
      position: absolute; inset: 0; z-index: 999;
      display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 20px; color: #6B7280;
      font-size: 12px; background: #eaf2e8;
    }
  </style>
</head>
<body>
  <div id="map"><div id="map-error">Loading map…</div></div>
  <script>
    // If the proxy/Leaflet is unreachable, never leave the card stuck on
    // "Loading map…" forever.
    window.setTimeout(function () {
      if (!window.__mapReady) {
        var el = document.getElementById('map-error');
        if (el) el.textContent = 'Map load failed. Check your internet connection.';
      }
    }, 8000);
  </script>
  <script
    src="${leafletJs}"
    onerror="var el=document.getElementById('map-error');if(el)el.textContent='Map load failed. Check your internet connection.';"
  ></script>
  <script>
    (function () {
      var stops = ${data};
      var fallback = document.getElementById('map-error');
      if (!window.L) {
        if (fallback) fallback.textContent = 'Map load failed. Check your internet connection.';
        return;
      }
      var map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false
      });
      // Leaflet keeps existing children inside the container; without this the
      // fallback stays on top of the rendered map and looks like an endless
      // "Loading map…" state.
      if (fallback) fallback.style.display = 'none';
      L.tileLayer('${tileUrl}', {
        maxZoom: 19,
        attribution: '${attribution}'
      }).addTo(map);
      var coords = stops.map(function (s) { return [s.lat, s.lon]; });
      if (coords.length > 1) {
        L.polyline(coords, { color: '#0E2A47', weight: 3, opacity: 0.9 }).addTo(map);
      }
      stops.forEach(function (s) {
        var icon = L.divIcon({
          className: 'stop-pin',
          html: '<span>' + s.idx + '</span>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([s.lat, s.lon], { icon: icon }).addTo(map);
      });
      function fitRoute() {
        map.invalidateSize();
        if (coords.length > 1) {
          map.fitBounds(coords, { padding: [34, 34], maxZoom: 11 });
        } else if (coords.length === 1) {
          map.setView(coords[0], 11);
        } else {
          map.setView([20.5937, 78.9629], 4);
        }
      }
      fitRoute();
      window.__mapReady = true;
      setTimeout(fitRoute, 120);
      setTimeout(fitRoute, 600);
      setTimeout(fitRoute, 1500);
      if (window.ResizeObserver) {
        try {
          new ResizeObserver(function () {
            fitRoute();
          }).observe(document.getElementById('map'));
        } catch (e) {}
      }
    })();
  </script>
</body>
</html>`;
}

function SectionHead({ kicker, title, sub }) {
  return (
    <View style={s.secHead}>
      {kicker ? (
        <View style={s.kicker}>
          <Text style={s.kickerT}>{kicker}</Text>
        </View>
      ) : null}
      <Text style={s.secTitle}>{title}</Text>
      {sub ? <Text style={s.secSub}>{sub}</Text> : null}
    </View>
  );
}

export default function CircuitPlannerScreen({ navigation }) {
  const [to, setTo] = useState('');
  const [extraDests, setExtraDests] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateField, setDateField] = useState(null); // 'start' | 'end'
  const [adults, setAdults] = useState(2);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [planError, setPlanError] = useState('');
  const [mapStops, setMapStops] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapRenderError, setMapRenderError] = useState('');
  const [openFaq, setOpenFaq] = useState(-1);

  const scrollRef = useRef(null);
  const formY = useRef(0);
  const howY = useRef(0);
  const planY = useRef(0);
  const aiPulse = useRef(new Animated.Value(0)).current;
  const aiShimmer = useRef(new Animated.Value(0)).current;

  const proxyBase = useMemo(
    () =>
      String(process.env.EXPO_PUBLIC_PACKAGES_PROXY_URL || '')
        .trim()
        .replace(/\/+$/, ''),
    []
  );

  const dates = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 60; i += 1) {
      list.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
    }
    return list;
  }, []);

  const tripDays =
    startDate && endDate
      ? Math.max(2, Math.min(7, Math.round((startOfDay(endDate) - startOfDay(startDate)) / 86400000) + 1))
      : 4;

  const selectedStops = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const raw of [to, ...extraDests]) {
      for (const stop of splitDestinationInput(raw)) {
        const key = stop.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(stop);
      }
    }
    return out;
  }, [to, extraDests]);

  // Destinations badalte hi map ke pins refresh karo. 900ms debounce se
  // typing ke beech har letter par geocoding request nahi jaati.
  useEffect(() => {
    if (!selectedStops.length) {
      setMapStops([]);
      setMapError('');
      setMapRenderError('');
      setMapLoading(false);
      return undefined;
    }

    const ctrl = new AbortController();
    let active = true;
    setMapStops([]);
    setMapError('');
    setMapRenderError('');
    setMapLoading(true);

    const timer = setTimeout(async () => {
      try {
        const coords = await geocodeStops(selectedStops, { signal: ctrl.signal });
        if (!active) return;
        setMapStops(coords);
        setMapRenderError('');
        if (!coords.length) {
          setMapError('Could not locate these destinations. Try a city or region name.');
        }
      } catch (e) {
        if (!active || e?.name === 'AbortError') return;
        setMapStops([]);
        setMapError(e?.message || 'Could not load the map. Please try again.');
      } finally {
        if (active) setMapLoading(false);
      }
    }, 900);

    return () => {
      active = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [selectedStops]);

  const mapHtml = useMemo(() => buildRouteMapHtml(mapStops, proxyBase), [mapStops, proxyBase]);

  // AI-style "thinking" animation while the itinerary is being generated:
  // a pulsing sparkle orb plus a light sweep across the Generate button.
  useEffect(() => {
    let pulseLoop;
    let shimmerLoop;
    if (generating) {
      aiPulse.setValue(0);
      aiShimmer.setValue(0);
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(aiPulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      shimmerLoop = Animated.loop(
        Animated.timing(aiShimmer, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      pulseLoop.start();
      shimmerLoop.start();
    } else {
      aiPulse.stopAnimation();
      aiShimmer.stopAnimation();
      aiPulse.setValue(0);
      aiShimmer.setValue(0);
    }
    return () => {
      pulseLoop?.stop();
      shimmerLoop?.stop();
    };
  }, [generating, aiPulse, aiShimmer]);

  const aiScale = aiPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const aiGlow = aiPulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const shimmerX = aiShimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 380] });

  const missingStops =
    !mapLoading && mapStops.length
      ? selectedStops.filter((_, index) => !mapStops.some((stop) => stop.index === index))
      : [];

  const scrollTo = (ref) => {
    scrollRef.current?.scrollTo({ y: Math.max(0, ref.current - 12), animated: true });
  };

  const pickDate = (d) => {
    if (dateField === 'start') {
      setStartDate(d);
      if (endDate && startOfDay(endDate) < startOfDay(d)) setEndDate(null);
    } else {
      setEndDate(d);
    }
    setDateField(null);
  };

  const addDestination = () => {
    setExtraDests((list) => (list.length >= 5 ? list : [...list, '']));
  };

  const updateDestination = (index, value) => {
    setExtraDests((list) => list.map((x, i) => (i === index ? value : x)));
  };

  const removeDestination = (index) => {
    setExtraDests((list) => list.filter((_, i) => i !== index));
  };

  const generate = async () => {
    if (!selectedStops.length) {
      Alert.alert(
        'Destination required',
        'Please enter where you want to go, or add a destination.'
      );
      return;
    }

    setGenerating(true);
    setPlanError('');
    try {
      const itinerary = await fetchAiItinerary({
        route: selectedStops.join(' to '),
        days: tripDays,
        adults,
        startDate: startDate ? fmtDate(startDate) : '',
        endDate: endDate ? fmtDate(endDate) : '',
      });
      setPlan(itinerary);
      setTimeout(() => scrollTo(planY), 300);
    } catch (e) {
      setPlanError(e?.message || 'Could not generate your itinerary. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const destinationLabel = to.trim() || 'Your Trip';
  const extraStopCount = extraDests.filter((d) => String(d || '').trim()).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Common app header */}
      <AppHeader onBack={() => navigation.goBack()} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#F6F7FB' }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Offer strip */}
        <TouchableOpacity
          style={s.offer}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Main', { screen: 'Holidays' })}
        >
          <Ionicons name="pricetag" size={12} color={NAVY} />
          <Text style={s.offerT}>HOLIDAY SPECIAL</Text>
          <View style={s.offerDivider} />
          <Text style={s.offerS} numberOfLines={1}>Up to 50% OFF on your next trip</Text>
          <Ionicons name="arrow-forward" size={12} color={NAVY} />
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Hero */}
          <LinearGradient
            colors={['#0A1626', '#0E2A47', '#12375D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroTop}>
              <View style={s.heroBadge}>
                <Ionicons name="sparkles" size={10} color={COLORS.primary} />
                <Text style={s.heroBadgeT}>AI-POWERED TRIP PLANNER</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={s.heroOrb}>
                  <Ionicons name="sparkles" size={13} color={COLORS.primary} />
                </View>
                <View style={[s.heroOrb, { marginLeft: 6, backgroundColor: 'rgba(255,255,255,0.10)' }]}>
                  <Ionicons name="airplane" size={13} color="#BFD3EA" />
                </View>
              </View>
            </View>

            <Text style={s.heroT}>
              Plan Your Perfect trip in Minutes with{' '}
              <Text style={{ color: COLORS.primary }}>AI</Text>
            </Text>
            <Text style={s.heroS}>
              A free personalised itinerary for your next adventure — planned in seconds, booked in a tap.
            </Text>

            <View style={{ marginTop: 14 }}>
              {HERO_POINTS.map((p) => (
                <View key={p} style={s.heroPoint}>
                  <View style={s.heroCheck}>
                    <Ionicons name="checkmark" size={10} color={NAVY} />
                  </View>
                  <Text style={s.heroPointT}>{p}</Text>
                </View>
              ))}
            </View>

            <View style={s.heroBtns}>
              <TouchableOpacity style={s.heroBtn} onPress={() => scrollTo(formY)} activeOpacity={0.9}>
                <Text style={s.heroBtnT}>Start Planning</Text>
                <Ionicons name="arrow-forward" size={14} color={NAVY} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              <TouchableOpacity style={s.heroBtnGhost} onPress={() => scrollTo(howY)} activeOpacity={0.9}>
                <Text style={s.heroBtnGhostT}>How It Works</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Smart Itinerary Generator */}
          <View
            style={s.card}
            onLayout={(e) => {
              formY.current = e.nativeEvent.layout.y;
            }}
          >
            <View style={s.genHead}>
              <View style={s.genIcon}>
                <Ionicons name="sparkles" size={17} color={NAVY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.genTitle}>Smart Itinerary Generator</Text>
                <Text style={s.genSub}>AI-powered, free & instant</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'Holidays' })}
                hitSlop={8}
              >
                <Text style={s.explore}>Explore →</Text>
              </TouchableOpacity>
            </View>

            <View style={s.field}>
              <Ionicons name="location-outline" size={17} color="#7E8AA0" style={{ marginRight: 9 }} />
              <TextInput
                style={s.input}
                value={to}
                onChangeText={setTo}
                placeholder="Where do you want to go?"
                placeholderTextColor="#96A0B5"
                autoCorrect={false}
              />
            </View>

            <View style={s.twoCol}>
              <TouchableOpacity style={s.halfField} onPress={() => setDateField('start')} activeOpacity={0.85}>
                <Ionicons name="calendar-outline" size={16} color="#7E8AA0" style={{ marginRight: 7 }} />
                <Text style={[s.halfT, !startDate && { color: '#96A0B5' }]} numberOfLines={1}>
                  {startDate ? fmtDate(startDate) : 'Start Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.halfField} onPress={() => setDateField('end')} activeOpacity={0.85}>
                <Ionicons name="calendar-outline" size={16} color="#7E8AA0" style={{ marginRight: 7 }} />
                <Text style={[s.halfT, !endDate && { color: '#96A0B5' }]} numberOfLines={1}>
                  {endDate ? fmtDate(endDate) : 'End Date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.travelRow}>
              <Ionicons name="people-outline" size={17} color="#7E8AA0" />
              <Text style={s.travelLabel}>Travellers</Text>
              <Text style={s.travelVal}>{adults} Adult{adults > 1 ? 's' : ''}</Text>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setAdults((n) => Math.max(1, n - 1))}
                hitSlop={6}
              >
                <Ionicons name="remove" size={14} color={NAVY} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.stepBtn}
                onPress={() => setAdults((n) => Math.min(12, n + 1))}
                hitSlop={6}
              >
                <Ionicons name="add" size={14} color={NAVY} />
              </TouchableOpacity>
            </View>

            {extraDests.map((d, i) => (
              <View key={`dest-${i}`} style={s.extraRow}>
                <Ionicons name="location-outline" size={16} color="#7E8AA0" style={{ marginRight: 8 }} />
                <TextInput
                  style={s.extraInput}
                  value={d}
                  onChangeText={(v) => updateDestination(i, v)}
                  placeholder={`Destination ${i + 2}`}
                  placeholderTextColor="#96A0B5"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => removeDestination(i)} hitSlop={8}>
                  <Ionicons name="close-circle" size={17} color="#A0AABD" />
                </TouchableOpacity>
              </View>
            ))}

            {extraDests.length < 5 && (
              <TouchableOpacity style={s.addDest} onPress={addDestination} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={15} color={NAVY} />
                <Text style={s.addDestT}>Add Destination (Max 5)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.generateBtn, generating && { opacity: 0.92 }]}
              onPress={generate}
              activeOpacity={0.9}
              disabled={generating}
            >
              {generating ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s.aiShimmer,
                    { transform: [{ translateX: shimmerX }, { skewX: '-18deg' }] },
                  ]}
                />
              ) : null}
              {generating ? (
                <ActivityIndicator size="small" color={NAVY} />
              ) : (
                <Ionicons name="sparkles" size={16} color={NAVY} />
              )}
              <Text style={[s.generateT, { marginLeft: 7 }]}>
                {generating ? 'Generating your itinerary…' : 'Generate Now'}
              </Text>
              {!generating ? (
                <Ionicons name="arrow-forward" size={16} color={NAVY} style={{ marginLeft: 7 }} />
              ) : null}
            </TouchableOpacity>

            {generating ? (
              <View style={s.aiThinking}>
                <Animated.View
                  style={[s.aiOrb, { opacity: aiGlow, transform: [{ scale: aiScale }] }]}
                >
                  <Ionicons name="sparkles" size={18} color={NAVY} />
                </Animated.View>
                <View style={{ flex: 1 }}>
                  <Text style={s.aiThinkingTitle}>AI is crafting your itinerary…</Text>
                  <Text style={s.aiThinkingSub}>Checking routes • stays • local experiences</Text>
                </View>
                <View style={s.aiDots}>
                  <Animated.View style={[s.aiDot, { opacity: aiGlow }]} />
                  <Animated.View
                    style={[
                      s.aiDot,
                      { opacity: aiPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }) },
                    ]}
                  />
                  <Animated.View
                    style={[
                      s.aiDot,
                      { opacity: aiPulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <Text style={s.aiNote}>
                AI itinerary powered by OpenRouter • Verify timings & prices before booking.
              </Text>
            )}

            {planError ? (
              <View style={s.errBox}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={s.errT}>{planError}</Text>
              </View>
            ) : null}

            <View style={s.trustRow}>
              <View style={[s.miniAvatar, { backgroundColor: '#FFD9B0', marginLeft: 0 }]}>
                <Text style={s.miniAvatarT}>A</Text>
              </View>
              <View style={[s.miniAvatar, { backgroundColor: '#CFE0FF' }]}>
                <Text style={s.miniAvatarT}>P</Text>
              </View>
              <View style={[s.miniAvatar, { backgroundColor: '#D7F3DE' }]}>
                <Text style={s.miniAvatarT}>R</Text>
              </View>
              <Text style={s.trustT}>Trusted by 50,000+ travelers</Text>
            </View>
          </View>

          {/* Selected destinations map */}
          <View style={[s.card, { marginTop: 12 }]}>
            <View style={s.mapHead}>
              <View style={s.mapIcon}>
                <Ionicons name="map" size={17} color={NAVY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.mapTitle}>Your Route Map</Text>
                <Text style={s.mapSub}>
                  {selectedStops.length
                    ? `${selectedStops.length} destination${selectedStops.length > 1 ? 's' : ''} selected`
                    : 'Add destinations to see them on the map'}
                </Text>
              </View>
              {mapLoading ? (
                <ActivityIndicator size="small" color={COLORS.primaryText} />
              ) : mapStops.length ? (
                <View style={s.mapCount}>
                  <Text style={s.mapCountT}>
                    {mapStops.length}/{selectedStops.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {selectedStops.length ? (
              <View style={s.stopChips}>
                {selectedStops.map((stop, index) => (
                  <View key={`${stop}-${index}`} style={s.stopChip}>
                    <View style={s.stopChipNum}>
                      <Text style={s.stopChipNumT}>{index + 1}</Text>
                    </View>
                    <Text style={s.stopChipT} numberOfLines={1}>
                      {stop}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {!mapLoading && mapStops.length && !mapRenderError ? (
              <View style={s.mapWrap}>
                <View pointerEvents="none" style={s.map}>
                  <WebView
                    key={mapStops
                      .map((stop) => `${stop.index}:${stop.latitude.toFixed(3)},${stop.longitude.toFixed(3)}`)
                      .join('|')}
                    source={{ html: mapHtml }}
                    style={s.map}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    scrollEnabled={false}
                    bounces={false}
                    overScrollMode="never"
                    setSupportMultipleWindows={false}
                    onError={() =>
                      setMapRenderError('Map load failed. Check your internet connection.')
                    }
                    onHttpError={() =>
                      setMapRenderError('Map load failed. Check your internet connection.')
                    }
                  />
                </View>
              </View>
            ) : (
              <View style={s.mapPlaceholder}>
                {mapLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primaryText} />
                ) : (
                  <Ionicons
                    name={mapError || mapRenderError ? 'cloud-offline-outline' : 'map-outline'}
                    size={22}
                    color={mapError || mapRenderError ? COLORS.danger : '#9AA5B8'}
                  />
                )}
                <Text
                  style={[
                    s.mapPlaceholderT,
                    (mapError || mapRenderError) && { color: COLORS.danger },
                  ]}
                >
                  {mapLoading
                    ? 'Locating your destinations…'
                    : mapError ||
                      mapRenderError ||
                      (selectedStops.length
                        ? 'Map preview will appear here.'
                        : 'Add your destinations above and they will appear on the map.')}
                </Text>
              </View>
            )}

            {missingStops.length ? (
              <Text style={s.mapNote}>Could not locate: {missingStops.join(', ')}</Text>
            ) : null}
          </View>

          {/* Generated plan */}
          {plan ? (
            <View
              style={[s.card, { marginTop: 12 }]}
              onLayout={(e) => {
                planY.current = e.nativeEvent.layout.y;
              }}
            >
              <Text style={s.planTag}>YOUR AI ITINERARY</Text>
              <Text style={s.planTitle}>
                {destinationLabel}
                {extraStopCount
                  ? ` + ${extraStopCount} stop${extraStopCount > 1 ? 's' : ''}`
                  : ''}
              </Text>
              <Text style={s.planMeta}>
                {plan.length} Days • {adults} Adult{adults > 1 ? 's' : ''}
                {startDate ? ` • ${fmtDate(startDate)}${endDate ? ` → ${fmtDate(endDate)}` : ''}` : ''}
              </Text>
              <View style={{ marginTop: 10 }}>
                {plan.map((p, index) => (
                  <View key={p.id || `${p.dayLabel}-${index}`} style={s.itRow}>
                    <View style={s.itBadge}>
                      <Text style={s.itBadgeT}>{p.dayNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.itTop}>
                        <Text style={s.itD}>{p.dayLabel}</Text>
                        {p.city ? (
                          <Text style={s.itCity} numberOfLines={1}>
                            {p.city}
                          </Text>
                        ) : null}
                      </View>
                      {p.title ? <Text style={s.itTitle}>{p.title}</Text> : null}
                      {p.attraction ? (
                        <View style={s.itAttractionRow}>
                          <Ionicons
                            name="location-outline"
                            size={11}
                            color={COLORS.primaryText}
                          />
                          <Text style={s.itAttraction}>{p.attraction}</Text>
                        </View>
                      ) : null}
                      {p.summary ? <Text style={s.itSummary}>{p.summary}</Text> : null}
                      <View style={s.itDetails}>
                        {p.morning ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Morning: </Text>
                            {p.morning}
                          </Text>
                        ) : null}
                        {p.afternoon ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Afternoon: </Text>
                            {p.afternoon}
                          </Text>
                        ) : null}
                        {p.food ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Food: </Text>
                            {p.food}
                          </Text>
                        ) : null}
                        {p.hotel ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Stay: </Text>
                            {p.hotel}
                          </Text>
                        ) : null}
                        {p.transport ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Transport: </Text>
                            {p.transport}
                          </Text>
                        ) : null}
                        {p.duration ? (
                          <Text style={s.itDetail}>
                            <Text style={s.itDetailLabel}>Duration: </Text>
                            {p.duration}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={s.bookBtn}
                onPress={() => navigation.navigate('Main', { screen: 'Holidays' })}
                activeOpacity={0.9}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={NAVY} />
                <Text style={s.bookT}>Book This Trip</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* How it works */}
          <View
            onLayout={(e) => {
              howY.current = e.nativeEvent.layout.y;
            }}
          >
            <SectionHead
              kicker="HOW IT WORKS"
              title="Plan Your Dream Trip in 3 Easy Steps"
              sub="Your personalised itinerary is just a few taps away."
            />
            {STEPS.map((step, i) => (
              <View key={step.title} style={s.stepCard}>
                <View style={s.stepIcon}>
                  <Ionicons name={step.icon} size={19} color={NAVY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepText}>{step.text}</Text>
                </View>
                <Text style={s.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
            ))}
          </View>

          {/* Why AI planner */}
          <SectionHead
            kicker="WHY ADOTRIP AI"
            title="Why Use Our AI Travel Planner"
            sub="Smarter planning, better trips — every single time."
          />
          <View style={s.whyGrid}>
            {WHY.map((w) => (
              <View key={w.title} style={s.whyCard}>
                <View style={s.whyIcon}>
                  <Ionicons name={w.icon} size={18} color={NAVY} />
                </View>
                <Text style={s.whyTitle}>{w.title}</Text>
                <Text style={s.whyText}>{w.text}</Text>
              </View>
            ))}
          </View>

          {/* Social proof */}
          <SectionHead
            kicker="SOCIAL PROOF & TRUST"
            title="Loved by Travellers Like You"
            sub="Real trips, real reviews — from our travel community."
          />
          <View style={s.logoRow}>
            {['MakeMyTrip', 'Cleartrip', 'Booking.com'].map((brand) => (
              <View key={brand} style={s.logoBox}>
                <Text style={s.logoT}>{brand}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={312}
            decelerationRate="fast"
            style={{ marginTop: 12 }}
          >
            {TESTIMONIALS.map((t) => (
              <View key={t.name} style={s.reviewCard}>
                <View style={s.reviewTop}>
                  <View style={[s.reviewAvatar, { backgroundColor: t.color }]}>
                    <Text style={s.reviewAvatarT}>{t.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.reviewName}>{t.name}</Text>
                    <Text style={s.reviewCity}>{t.city}</Text>
                  </View>
                  <View style={s.stars}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Ionicons key={i} name="star" size={10} color="#F5B301" />
                    ))}
                  </View>
                </View>
                <Text style={s.reviewText}>{t.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={s.stats}>
            {[
              { v: '50K+', l: 'Happy travellers' },
              { v: '4.8★', l: 'Average rating' },
              { v: '120+', l: 'Destinations' },
            ].map((st, i) => (
              <View key={st.l} style={[s.statCol, i > 0 && s.statDivider]}>
                <Text style={s.statV}>{st.v}</Text>
                <Text style={s.statL}>{st.l}</Text>
              </View>
            ))}
          </View>

          {/* FAQ */}
          <SectionHead
            kicker="FAQ"
            title="Frequently Asked Questions"
            sub="Everything you need to know about AI trip planning."
          />
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <View key={f.q} style={[s.faqCard, open && { borderColor: '#F3DE63' }]}>
                <TouchableOpacity
                  style={s.faqRow}
                  onPress={() => setOpenFaq(open ? -1 : i)}
                  activeOpacity={0.85}
                >
                  <Text style={s.faqQ}>{f.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#7E8AA0"
                  />
                </TouchableOpacity>
                {open ? <Text style={s.faqA}>{f.a}</Text> : null}
              </View>
            );
          })}

          {/* Final CTA */}
          <LinearGradient
            colors={['#0A1626', '#0E2A47', '#12375D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.ctaBanner}
          >
            <View style={s.ctaSpark}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
            </View>
            <Text style={s.ctaT}>Ready to Plan Your Perfect Trip?</Text>
            <Text style={s.ctaS}>Let AI do the planning — you just pack your bags.</Text>
            <TouchableOpacity style={s.ctaBtn} onPress={() => scrollTo(formY)} activeOpacity={0.9}>
              <Text style={s.ctaBtnT}>Start Planning</Text>
              <Ionicons name="arrow-forward" size={15} color={NAVY} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerT}>© 2026 Adotrip • Nothing Is Far</Text>
            <View style={s.footerRow}>
              <TouchableOpacity onPress={() => navigation.navigate('Support')}>
                <Text style={s.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={s.footerDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Support')}>
                <Text style={s.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={s.footerDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Support')}>
                <Text style={s.footerLink}>Help Center</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date picker modal */}
      <Modal
        visible={!!dateField}
        transparent
        animationType="slide"
        onRequestClose={() => setDateField(null)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setDateField(null)}>
          <Pressable style={s.dateSheet} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>
              {dateField === 'end' ? 'Select End Date' : 'Select Start Date'}
            </Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {dates.map((d) => {
                const disabled = dateField === 'end' && startDate && startOfDay(d) < startOfDay(startDate);
                const selected =
                  (dateField === 'end' ? endDate : startDate) &&
                  startOfDay(d) === startOfDay(dateField === 'end' ? endDate : startDate);
                return (
                  <TouchableOpacity
                    key={`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}
                    style={[s.dateRow, disabled && { opacity: 0.32 }]}
                    disabled={!!disabled}
                    onPress={() => pickDate(d)}
                  >
                    <Text style={s.dateRowT}>{fmtDate(d)}</Text>
                    <Text style={s.dateRowD}>{WEEKDAYS[d.getDay()]}</Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={18} color={NAVY} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  offerT: { fontSize: 9, fontWeight: '900', letterSpacing: 0.9, color: NAVY, marginLeft: 5 },
  offerDivider: { width: 1, height: 12, backgroundColor: 'rgba(14,42,71,0.25)', marginHorizontal: 8 },
  offerS: { flex: 1, fontSize: 10.5, fontWeight: '700', color: NAVY, marginRight: 6 },

  hero: { borderRadius: 20, padding: 16, marginTop: 14, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,228,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(254,228,0,0.42)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroBadgeT: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8, color: COLORS.primary, marginLeft: 4 },
  heroOrb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(254,228,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroT: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
    marginTop: 14,
  },
  heroS: { fontSize: 11.5, lineHeight: 17, color: '#C7D2E0', marginTop: 7 },
  heroPoint: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  heroCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  heroPointT: { fontSize: 11.5, color: '#E6EDF7', fontWeight: '600' },
  heroBtns: { flexDirection: 'row', marginTop: 16, gap: 10 },
  heroBtn: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnT: { fontSize: 12.5, fontWeight: '900', color: NAVY },
  heroBtnGhost: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    borderWidth: 1.2,
    borderColor: '#3B5779',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnGhostT: { fontSize: 12.5, fontWeight: '800', color: '#DCE5F2' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    padding: 15,
    marginTop: 14,
    shadowColor: '#0E2A47',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  genHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  genIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  genTitle: { fontSize: 14.5, fontWeight: '900', color: NAVY },
  genSub: { fontSize: 10.5, color: '#8A94A6', marginTop: 2 },
  explore: { fontSize: 11, fontWeight: '800', color: COLORS.primaryText },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    paddingHorizontal: 13,
    height: 50,
  },
  input: { flex: 1, fontSize: 13, color: NAVY, paddingVertical: 0 },
  twoCol: { flexDirection: 'row', gap: 10, marginTop: 10 },
  halfField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    paddingHorizontal: 11,
    height: 50,
  },
  halfT: { flex: 1, fontSize: 12, color: NAVY },

  travelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    paddingHorizontal: 13,
    height: 50,
    marginTop: 10,
  },
  travelLabel: { flex: 1, fontSize: 13, color: NAVY, marginLeft: 9 },
  travelVal: { fontSize: 12.5, fontWeight: '700', color: NAVY, marginRight: 8 },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE3F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    paddingHorizontal: 13,
    height: 46,
    marginTop: 10,
  },
  extraInput: { flex: 1, fontSize: 12.5, color: NAVY, paddingVertical: 0 },
  addDest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#C9D2E3',
    marginTop: 10,
  },
  addDestT: { fontSize: 11.5, fontWeight: '800', color: NAVY, marginLeft: 6 },

  generateBtn: {
    height: 52,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#E0C300',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  generateT: { fontSize: 14.5, fontWeight: '900', color: NAVY },
  aiShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  aiThinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#F2E3A0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 10,
  },
  aiOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiThinkingTitle: { fontSize: 11.5, fontWeight: '900', color: NAVY },
  aiThinkingSub: { fontSize: 9, lineHeight: 13, color: '#8A7B3E', marginTop: 2 },
  aiDots: { flexDirection: 'row', gap: 4, alignItems: 'center', marginLeft: 2 },
  aiDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.primaryText },
  aiNote: {
    fontSize: 9.5,
    lineHeight: 14,
    color: '#8A94A6',
    textAlign: 'center',
    marginTop: 9,
    paddingHorizontal: 8,
  },
  errBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 9,
  },
  errT: { flex: 1, fontSize: 10.5, lineHeight: 15, color: COLORS.danger, fontWeight: '600' },

  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  miniAvatarT: { fontSize: 8.5, fontWeight: '900', color: NAVY },
  trustT: { fontSize: 10, fontWeight: '600', color: '#6B7280', marginLeft: 8 },

  mapHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mapIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFF4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mapTitle: { fontSize: 14.5, fontWeight: '900', color: NAVY },
  mapSub: { fontSize: 10.5, color: '#8A94A6', marginTop: 2 },
  mapCount: {
    minWidth: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  mapCountT: { fontSize: 9.5, fontWeight: '800', color: '#6B7280' },
  stopChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FD',
    borderWidth: 1,
    borderColor: '#E6ECF7',
    borderRadius: 999,
    paddingLeft: 4,
    paddingRight: 9,
    paddingVertical: 3,
  },
  stopChipNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopChipNumT: { fontSize: 9, fontWeight: '900', color: NAVY },
  stopChipT: { fontSize: 10, fontWeight: '600', color: NAVY, marginLeft: 5, maxWidth: 160 },
  mapWrap: {
    height: 210,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    overflow: 'hidden',
    backgroundColor: '#EAF2E8',
  },
  map: { flex: 1 },
  mapPlaceholder: {
    height: 150,
    borderRadius: 14,
    backgroundColor: '#F7F9FD',
    borderWidth: 1,
    borderColor: '#EDF1F8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  mapPlaceholderT: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  mapNote: { fontSize: 9.5, lineHeight: 14, color: COLORS.danger, marginTop: 7 },

  planTag: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1, color: COLORS.primaryText },
  planTitle: { fontSize: 16, fontWeight: '900', color: NAVY, marginTop: 5 },
  planMeta: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  itRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F7F9FD',
    borderRadius: 12,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#EDF1F8',
  },
  itBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFF4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  itBadgeT: { fontSize: 11, fontWeight: '900', color: NAVY },
  itTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  itD: { fontSize: 11, fontWeight: '800', color: COLORS.primaryText },
  itCity: { flex: 1, fontSize: 9.5, color: '#8A94A6', textAlign: 'right' },
  itTitle: { fontSize: 12.5, fontWeight: '900', color: NAVY, marginTop: 3 },
  itAttractionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itAttraction: { flex: 1, fontSize: 10.5, lineHeight: 15, color: COLORS.primaryText, fontWeight: '600' },
  itSummary: { fontSize: 10.5, lineHeight: 15.5, color: '#4B5563', marginTop: 5 },
  itDetails: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#E8EDF6', paddingTop: 6 },
  itDetail: { fontSize: 10, lineHeight: 15, color: '#5B667A', marginBottom: 3 },
  itDetailLabel: { fontWeight: '800', color: NAVY },
  bookBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  bookT: { fontSize: 13, fontWeight: '900', color: NAVY, marginLeft: 6 },

  secHead: { alignItems: 'center', marginTop: 28, marginBottom: 12 },
  kicker: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 9,
  },
  kickerT: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: NAVY },
  secTitle: { fontSize: 17.5, fontWeight: '900', color: NAVY, textAlign: 'center', letterSpacing: -0.2 },
  secSub: { fontSize: 11, lineHeight: 16, color: '#6B7280', textAlign: 'center', marginTop: 5 },

  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    padding: 13,
    marginBottom: 10,
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  stepTitle: { fontSize: 12.5, fontWeight: '900', color: NAVY, paddingRight: 24 },
  stepText: { fontSize: 10.5, lineHeight: 15.5, color: '#6B7280', marginTop: 3 },
  stepNum: { position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: '900', color: '#D8DEEA' },

  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    padding: 13,
  },
  whyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFF4B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  whyTitle: { fontSize: 11.5, fontWeight: '900', color: NAVY },
  whyText: { fontSize: 10, lineHeight: 14.5, color: '#6B7280', marginTop: 3 },

  logoRow: { flexDirection: 'row', gap: 8 },
  logoBox: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EDF0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoT: { fontSize: 10.5, fontWeight: '900', color: '#4B5563' },

  reviewCard: {
    width: 302,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    padding: 14,
    marginRight: 10,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center' },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewAvatarT: { fontSize: 12, fontWeight: '900', color: NAVY },
  reviewName: { fontSize: 12.5, fontWeight: '900', color: NAVY },
  reviewCity: { fontSize: 10, color: '#8A94A6', marginTop: 1 },
  stars: { flexDirection: 'row' },
  reviewText: { fontSize: 11.5, lineHeight: 18, color: '#4B5563', marginTop: 10 },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    paddingVertical: 13,
    marginTop: 12,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: '#EDF0F6' },
  statV: { fontSize: 15, fontWeight: '900', color: NAVY },
  statL: { fontSize: 9, color: '#8A94A6', marginTop: 3 },

  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF0F6',
    paddingHorizontal: 13,
    paddingVertical: 2,
    marginBottom: 8,
  },
  faqRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  faqQ: { flex: 1, fontSize: 12, fontWeight: '800', color: NAVY, paddingRight: 10 },
  faqA: { fontSize: 11, lineHeight: 17, color: '#6B7280', paddingBottom: 13, paddingRight: 12 },

  ctaBanner: { borderRadius: 20, padding: 20, marginTop: 26, alignItems: 'center', overflow: 'hidden' },
  ctaSpark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(254,228,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ctaT: { fontSize: 18, fontWeight: '900', color: '#fff', textAlign: 'center' },
  ctaS: { fontSize: 11, lineHeight: 16, color: '#C7D2E0', textAlign: 'center', marginTop: 5 },
  ctaBtn: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnT: { fontSize: 12.5, fontWeight: '900', color: NAVY },

  footer: { alignItems: 'center', marginTop: 24 },
  footerT: { fontSize: 10, color: '#8A94A6', fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  footerLink: { fontSize: 10, color: '#6B7280' },
  footerDot: { fontSize: 10, color: '#9CA3AF', marginHorizontal: 7 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(14,42,71,0.38)', justifyContent: 'flex-end' },
  dateSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 26,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E3E8F1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 14, fontWeight: '900', color: NAVY, marginBottom: 6 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F9',
  },
  dateRowT: { flex: 1, fontSize: 13, color: NAVY, fontWeight: '600' },
  dateRowD: { fontSize: 11.5, color: '#8A94A6', marginRight: 10 },
});
