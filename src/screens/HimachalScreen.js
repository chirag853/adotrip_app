import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AppHeader from '../components/AppHeader';
import { fetchHptdcHotels } from '../utils/hptdcApi';

// Adotrip x Himachal Tourism (HPTDC) — official GSA hotel page.
// Web reference ka mobile-first design app me: hero, flagship pills, circuits,
// HPTDC hotel cards, portfolio map, reviews, FAQ, footer + app tab bar.

const C = {
  yellow: '#FEE400',
  yellowHover: '#EDD400',
  blue: '#0284C7',
  darkBlue: '#0369A1',
  navy: '#0E2A47',
  charcoal: '#1E293B',
  grayBg: '#F8FAFC',
  pageBg: '#F4F7F9',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
};

const IMG_HERO = require('../../assets/himachal/hero.jpg');
const IMG_MAP = require('../../assets/himachal/map.jpg');
const CIRCUIT_INFO = {
  'Satluj Circuit': {
    color: '#0284C7',
    about:
      'Named after the sacred Satluj river, encompassing Shimla, Chail, Kasauli, Narkanda, Sarahan, Kalpa & Sangla. Renowned for pine forests, apple orchards, and regal heritage architecture.',
  },
  'Dhauladhar Circuit': {
    color: '#10B981',
    about:
      'Covers Dharamshala, McLeod Ganj, Palampur, Dalhousie & Khajjiar — dramatic Dhauladhar views, tea gardens, Tibetan culture and colonial-era retreats.',
  },
  'Beas Circuit': {
    color: '#F59E0B',
    about:
      'Follows the Beas river through Mandi, Kullu, Naggar & Manali — apple valleys, ancient temples, riverside resorts and high-altitude adventure.',
  },
  'Tribal Circuit': {
    color: '#8B5CF6',
    about:
      'The wild high-altitude route across Kinnaur, Spiti & Lahaul — rugged landscapes, ancient monasteries and some of the highest motorable villages on earth.',
  },
};

const CIRCUIT_COLORS = ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6'];

// Quick pills ke liye preferred flagship slugs — API me na mile to top
// premium/deluxe hotels se fill ho jayenge.
const PREFERRED_PILL_SLUGS = [
  'the-palace-chail',
  'the-holiday-home-shimla',
  'the-kunzam-manali',
  'the-manimahesh-dalhousie',
];

const WHY = [
  {
    icon: '💻',
    iconBg: '#EFF6FF',
    title: 'Centralised Access',
    text: 'One unified digital portal for all state-managed rest houses.',
  },
  {
    icon: '🛡️',
    iconBg: '#ECFDF5',
    title: '100% Verified Govt',
    text: 'Guaranteed fixed rates with zero hidden markups or sudden surges.',
  },
  {
    icon: '🗺️',
    iconBg: '#FFFBEB',
    title: 'Curated Circuits',
    text: 'Pre-designed packages that seamlessly chain multiple rest stays.',
  },
  {
    icon: '📞',
    iconBg: '#F5F3FF',
    title: 'On-Ground Support',
    text: 'Local Himachal helpline assistance throughout your entire stay.',
  },
];

const CATEGORIES = [
  {
    title: '👑 Premium & Heritage Stays',
    badge: 'Colonial/Palace',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    text: 'Ideal for leisure travelers & history enthusiasts. Flagship properties like The Peterhof (Shimla), The Castle (Naggar), and The Palace (Chail).',
  },
  {
    title: '✨ Deluxe Mountain Hotels',
    badge: 'Panoramic Views',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    text: 'Equipped with modern facilities, spacious balconies, and on-site multi-cuisine restaurants like Hotel Golf Glade (Naldehra) and The Kunzam (Manali).',
  },
  {
    title: '🏷️ Affordable Budget Lodges',
    badge: 'Best Value',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    text: 'Clean, dependable, certified government lodgings ideal for solo backpackers, road trippers, and extended workation stays.',
  },
];

const TESTIMONIALS = [
  {
    initial: 'R',
    avatarBg: C.yellow,
    avatarText: C.slate900,
    name: 'Ritika Sharma',
    role: 'Travel Blogger, New Delhi',
    quote:
      'Booking The Peterhof in Shimla was so seamless on Adotrip. The heritage charm and government hospitality were extraordinary.',
  },
  {
    initial: 'A',
    avatarBg: '#3B82F6',
    avatarText: '#FFFFFF',
    name: 'Arjun Mehta',
    role: 'Software Engineer, Chandigarh',
    quote:
      'Loved the budget stay in Kasauli. Clean rooms, official rates, friendly staff, and the peace of mind of government verified hotels.',
  },
  {
    initial: 'N',
    avatarBg: '#10B981',
    avatarText: '#FFFFFF',
    name: 'Neha Kapoor',
    role: 'Homemaker, Mumbai',
    quote:
      'The Castle in Naggar was like walking into history. Wonderful views and official support whenever needed during the trip.',
  },
];

const FAQS = [
  {
    q: 'How can I book an HPTDC hotel online?',
    a: 'You can select your preferred circuit, pick the government hotel on this Adotrip portal, select your check-in dates, and receive instant digital confirmation with government booking voucher.',
  },
  {
    q: 'What types of HPTDC hotels are available?',
    a: 'HPTDC properties are categorized into Premium & Heritage (palaces/colonial rest houses), Deluxe hotels in prime scenic points, and Budget stays for cost-conscious travelers.',
  },
  {
    q: 'Are HPTDC hotel tariffs fixed?',
    a: 'Yes, all room rates are regulated and fixed by the Himachal Pradesh Tourism Development Corporation, providing standardized rates without arbitrary dynamic surge pricing.',
  },
  {
    q: 'Which are the flagship heritage properties?',
    a: 'Flagship properties include The Palace (Chail), The Peterhof (Shimla), The Naggar Castle (Kullu), and Hotel Ros Common (Kasauli).',
  },
  {
    q: 'Can I modify or cancel my booking?',
    a: 'Yes, cancellations and modifications follow standard official HPTDC rules directly manageable via your Adotrip booking dashboard.',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtDate = (d) => (d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : null);

const buildDates = () => {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 90; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
};
const DATES = buildDates();

const imageSource = (image) => (typeof image === 'string' ? { uri: image } : image);

export default function HimachalScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const hotelsY = useRef(0);
  const faqY = useRef(0);

  const [quickActive, setQuickActive] = useState(-1);
  const [activeCircuit, setActiveCircuit] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const [openFaq, setOpenFaq] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);

  const [hptdc, setHptdc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [booking, setBooking] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  const [dateField, setDateField] = useState(null);

  const load = useCallback(async (signal, opts = {}) => {
    if (opts.refresh) setRefreshing(true);
    else {
      setLoading(true);
      setApiError(null);
    }
    try {
      const data = await fetchHptdcHotels({ signal });
      if (signal?.aborted) return;
      setHptdc(data);
      setApiError(null);
      setActiveCircuit((prev) =>
        prev === 'All' || data.circuits.some((c) => c.name === prev) ? prev : 'All'
      );
    } catch (e) {
      if (e?.name === 'AbortError') return;
      setApiError(e);
      setHptdc(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const onRefresh = () => load(undefined, { refresh: true });

  const scrollTo = (y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 6), animated: true });
  const goHotels = () => scrollTo(hotelsY.current);
  const goFaq = () => scrollTo(faqY.current);

  const allHotels = hptdc?.hotels || [];
  const apiCircuits = hptdc?.circuits || [];
  const totalHotels = hptdc?.total || allHotels.length;
  const circuitTabs = [{ name: 'All', count: totalHotels }, ...apiCircuits];
  const filteredHotels =
    activeCircuit === 'All' ? allHotels : allHotels.filter((h) => h.circuit === activeCircuit);
  const hotels = filteredHotels.slice(0, visibleCount);
  const hasMore = filteredHotels.length > visibleCount;
  const canCollapse = visibleCount > 6;

  const activeCircuitAbout =
    activeCircuit === 'All'
      ? 'All official HPTDC properties across Himachal Pradesh, grouped by circuit. Use the tabs above to filter by circuit.'
      : CIRCUIT_INFO[activeCircuit]?.about ||
        `Official HPTDC properties across the ${activeCircuit}.`;

  // Live API se 4 flagship pills. Preferred slugs na mile to top premium/
  // deluxe hotels se fill hota hai.
  const quickPills = (() => {
    const bySlug = new Map(allHotels.map((h) => [h.slug, h]));
    const picks = PREFERRED_PILL_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);
    if (picks.length < 4) {
      const used = new Set(picks.map((h) => h.slug));
      const rank = (h) => (h.className === 'Premium' ? 0 : h.className === 'Deluxe' ? 1 : 2);
      const rest = allHotels
        .filter((h) => !used.has(h.slug))
        .sort((a, b) => rank(a) - rank(b));
      picks.push(...rest.slice(0, 4 - picks.length));
    }
    return picks.slice(0, 4).map((h) => ({ label: h.name, slug: h.slug, hotel: h }));
  })();

  const selectCircuit = (name) => {
    setActiveCircuit(name);
    setVisibleCount(6);
    setQuickActive(-1);
  };

  const openBooking = (hotel) => {
    setBooking(hotel);
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
  };

  const openHotelDetail = (hotel) => {
    const similar = allHotels
      .filter((h) => h.slug && h.slug !== hotel.slug && h.circuit === hotel.circuit)
      .slice(0, 4);
    navigation.navigate('HptdcHotelDetail', {
      slug: hotel.slug,
      item: hotel,
      similar,
    });
  };
  const closeBooking = () => {
    setBooking(null);
    setDateField(null);
  };

  const nights = checkIn && checkOut ? Math.max(1, Math.round((checkOut - checkIn) / 86400000)) : 0;
  const total = booking && nights ? booking.price * nights : 0;

  const pickQuick = (index) => {
    setQuickActive(index);
    const pill = quickPills[index];
    if (!pill) return;
    setActiveCircuit(pill.hotel.circuit);
    const circuitHotels = allHotels.filter((h) => h.circuit === pill.hotel.circuit);
    const targetIndex = circuitHotels.findIndex((h) => h.slug === pill.hotel.slug);
    setVisibleCount(Math.max(6, targetIndex + 1));
    setTimeout(goHotels, 60);
  };

  const pickDate = (d) => {
    if (dateField === 'in') {
      setCheckIn(d);
      if (checkOut && checkOut <= d) setCheckOut(null);
    } else if (dateField === 'out') {
      setCheckOut(d);
    }
    setDateField(null);
  };

  const confirmBooking = () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Select dates', 'Please choose your check-in and check-out dates.');
      return;
    }
    Alert.alert(
      'Booking request sent',
      `${booking.name}\n${fmtDate(checkIn)} → ${fmtDate(checkOut)}\n${guests} guest${guests > 1 ? 's' : ''} · ₹${total.toLocaleString('en-IN')}\n\nHPTDC team will contact you shortly.`
    );
    closeBooking();
  };

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar style="dark" />

      {/* Common app header */}
      <AppHeader onBack={() => navigation.goBack()} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.blue}
            colors={[C.blue]}
          />
        }
      >
        {/* Hero */}
        <ImageBackground source={IMG_HERO} style={s.hero} resizeMode="cover">
          <LinearGradient
            colors={['rgba(2,6,23,0.15)', 'rgba(15,23,42,0.82)', 'rgba(2,6,23,0.97)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroContent}>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>Official Government GSA Partner</Text>
            </View>
            <Text style={s.heroTitle}>Book Official Government Himachal Tourism Hotels Instantly</Text>
            <Text style={s.heroSub}>
              Adotrip, in collaboration with Himachal Pradesh Tourism Development Corporation,
              guarantees verified pricing and authentic heritage stays across majestic circuits.
            </Text>

            <View style={s.heroActions}>
              <TouchableOpacity style={s.heroPrimary} activeOpacity={0.85} onPress={goHotels}>
                <Text style={s.heroPrimaryText}>Explore Hotels</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.heroSecondary} activeOpacity={0.85} onPress={goFaq}>
                <Text style={s.heroSecondaryText}>Tariff &amp; FAQs</Text>
              </TouchableOpacity>
            </View>

            <View style={s.heroStats}>
              <View style={s.heroStat}>
                <Text style={s.heroStatValue}>{totalHotels ? totalHotels : '—'}</Text>
                <Text style={s.heroStatLabel}>Govt Properties</Text>
              </View>
              <View style={s.heroStat}>
                <Text style={s.heroStatValue}>{apiCircuits.length || '—'}</Text>
                <Text style={s.heroStatLabel}>Scenic Circuits</Text>
              </View>
              <View style={s.heroStat}>
                <Text style={s.heroStatValue}>100%</Text>
                <Text style={s.heroStatLabel}>Price Guarantee</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Quick flagship pills */}
        {quickPills.length ? (
          <View style={s.pillsWrap}>
            <Text style={s.pillsLabel}>POPULAR FLAGSHIP HOTELS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
              {quickPills.map((pill, idx) => {
                const active = quickActive === idx;
                return (
                  <TouchableOpacity
                    key={pill.slug || pill.label}
                    onPress={() => pickQuick(idx)}
                    activeOpacity={0.85}
                    style={[s.pill, active && s.pillActive]}
                  >
                    <Text style={[s.pillText, active && s.pillTextActive]}>{pill.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Joint initiative */}
        <View style={s.introSection}>
          <LinearGradient colors={['#FFFBEB', '#FFF7ED']} style={s.introCard}>
            <View style={s.introHeadRow}>
              <View style={s.amberDot} />
              <Text style={s.introTitle}>ADOTRIP X HIMACHAL TOURISM</Text>
            </View>
            <Text style={s.introText}>
              Adotrip is honored to be the <Text style={s.introBold}>General Sales Agent (GSA)</Text>{' '}
              bridging government hospitality with next-gen travelers. We ensure seamless booking
              for authentic colonial retreats, lake-view rest houses, and mountain lodges with fixed
              transparent rates.
            </Text>
            <View style={s.introFoot}>
              <View style={s.ratingRow}>
                <Text style={s.introStars}>★★★★★</Text>
                <Text style={s.introRating}>4.8 / 5.0 Rating</Text>
              </View>
              <TouchableOpacity onPress={goHotels} hitSlop={6}>
                <Text style={s.introLink}>Official GSA Portal →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Circuits */}
        <View style={s.circuitsSection}>
          <View style={s.sectionHead}>
            <Text style={s.kicker}>CURATED REGIONAL ROUTES</Text>
            <Text style={s.h2}>Discover Himachal By Circuit</Text>
            <Text style={s.sectionSub}>
              Explore properties organized across {apiCircuits.length || 'official'} historical circuits.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.circuitTabs}>
            {circuitTabs.map((item) => {
              const active = activeCircuit === item.name;
              const label = item.name === 'All' ? 'All Circuits' : item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => selectCircuit(item.name)}
                  activeOpacity={0.85}
                  style={[s.circuitTab, active && s.circuitTabActive]}
                >
                  <Text style={[s.circuitTabText, active && s.circuitTabTextActive]}>
                    {label}
                    {item.count ? ` (${item.count})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.circuitAbout}>
            <Text style={s.circuitAboutText}>
              <Text style={s.circuitAboutBold}>
                About {activeCircuit === 'All' ? 'All Circuits' : activeCircuit}:{' '}
              </Text>
              {activeCircuitAbout}
            </Text>
          </View>
        </View>

        {/* Hotel cards */}
        <View
          style={s.hotelsSection}
          onLayout={(e) => {
            hotelsY.current = e.nativeEvent.layout.y;
          }}
        >
          {loading ? (
            <View style={s.stateCard}>
              <ActivityIndicator color={C.blue} />
              <Text style={s.stateTitle}>Loading HPTDC properties…</Text>
              <Text style={s.stateText}>Live data from adotrip.com/api/v1/hptdc</Text>
            </View>
          ) : apiError ? (
            <View style={s.stateCard}>
              <Text style={s.stateEmoji}>⚠️</Text>
              <Text style={s.stateTitle}>Live HPTDC data is not loaded yet</Text>
              <Text style={s.stateText}>{apiError.message}</Text>
              <TouchableOpacity style={s.retryBtn} activeOpacity={0.85} onPress={() => load()}>
                <Text style={s.retryText}>RETRY</Text>
              </TouchableOpacity>
            </View>
          ) : hotels.length === 0 ? (
            <View style={s.stateCard}>
              <Text style={s.stateEmoji}>🏔️</Text>
              <Text style={s.stateTitle}>No properties found</Text>
              <Text style={s.stateText}>
                Is circuit me abhi koi HPTDC property listed nahi hai.
              </Text>
            </View>
          ) : (
            hotels.map((hotel) => (
              <View key={hotel.id} style={s.hotelCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openHotelDetail(hotel)}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${hotel.name}`}
                >
                  <View style={s.hotelImgWrap}>
                    <Image
                      source={imageSource(hotel.image || IMG_HERO)}
                      style={s.hotelImg}
                      resizeMode="cover"
                    />
                    <View style={[s.hotelBadge, { backgroundColor: hotel.badgeColor }]}>
                      <Text style={s.hotelBadgeText}>{hotel.badge}</Text>
                    </View>
                    {hotel.approved ? (
                      <View style={s.govtApproved}>
                        <Text style={s.govtApprovedText}>{hotel.approved}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={[s.hotelBody, { paddingBottom: 0 }]}>
                    <View style={s.hotelLocationRow}>
                      <Ionicons name="location" size={13} color="#EF4444" />
                      <Text style={s.hotelLocation} numberOfLines={2}>
                        {hotel.location}
                      </Text>
                    </View>
                    <Text style={s.hotelCircuit}>{hotel.circuit}</Text>
                    <View style={s.hotelNameRow}>
                      <Text style={s.hotelName}>{hotel.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={C.slate400} />
                    </View>
                    <Text style={s.hotelDesc}>{hotel.desc}</Text>

                    <View style={s.amenities}>
                      {hotel.amenities.map((a) => (
                        <View key={a.label} style={s.amenity}>
                          <Text style={s.amenityIcon}>{a.icon}</Text>
                          <Text style={s.amenityText}>{a.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={[s.hotelBody, { paddingTop: 0 }]}>
                  <View style={s.hotelFoot}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      activeOpacity={0.7}
                      onPress={() => openHotelDetail(hotel)}
                      accessibilityRole="button"
                      accessibilityLabel={`View details for ${hotel.name}`}
                    >
                      <Text style={s.tariffLabel}>{hotel.tariffLabel}</Text>
                      <Text style={s.price}>
                        {hotel.price
                          ? `₹${hotel.price.toLocaleString('en-IN')}`
                          : 'Tariff on request'}
                        {hotel.price ? <Text style={s.pricePer}> / night</Text> : null}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.bookBtn}
                      activeOpacity={0.85}
                      onPress={() => openBooking(hotel)}
                    >
                      <Text style={s.bookBtnText}>BOOK ONLINE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          {!loading && !apiError && (hasMore || canCollapse) ? (
            <TouchableOpacity
              style={s.loadMore}
              activeOpacity={0.85}
              onPress={() => setVisibleCount(hasMore ? filteredHotels.length : 6)}
            >
              <Text style={s.loadMoreText}>
                {hasMore ? `View All ${filteredHotels.length} Properties` : 'Show Less Properties'}
              </Text>
              <Ionicons
                name={hasMore ? 'chevron-down' : 'chevron-up'}
                size={16}
                color={C.slate400}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Accommodation portfolio map */}
        <View style={s.mapSection}>
          <View style={s.sectionHead}>
            <Text style={s.kicker}>INTERACTIVE CIRCUIT MAP</Text>
            <Text style={s.h2}>Accommodation Portfolio</Text>
            <Text style={s.sectionSub}>
              Official HPTDC hotels classified by tier &amp; category across circuits.
            </Text>
          </View>

          <View style={s.mapCard}>
            <Image source={IMG_MAP} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(15,23,42,0.35)', 'rgba(15,23,42,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.mapOverlay}>
              <View style={s.mapPill}>
                <Text style={s.mapPillText}>CIRCUIT EXPLORER</Text>
              </View>
              <Text style={s.mapText}>
                Explore all {totalHotels ? `${totalHotels} ` : ''}official properties tagged on interactive live route map
              </Text>
              <TouchableOpacity style={s.mapBtn} activeOpacity={0.85} onPress={() => setMapOpen(true)}>
                <Text style={s.mapBtnText}>Open Circuit Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.categoryList}>
            {CATEGORIES.map((cat) => (
              <View key={cat.badge} style={s.categoryCard}>
                <View style={s.categoryHead}>
                  <Text style={s.categoryTitle}>{cat.title}</Text>
                  <View style={[s.categoryBadge, { backgroundColor: cat.badgeBg }]}>
                    <Text style={[s.categoryBadgeText, { color: cat.badgeText }]}>{cat.badge}</Text>
                  </View>
                </View>
                <Text style={s.categoryText}>{cat.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Why book */}
        <View style={s.whySection}>
          <View style={s.centerHead}>
            <Text style={s.whyTitle}>Why Book Your Himachal Trip With Adotrip?</Text>
            <Text style={s.whySub}>Direct government integration with state-of-the-art tech</Text>
          </View>
          <View style={s.whyGrid}>
            {WHY.map((item) => (
              <View key={item.title} style={s.whyCard}>
                <View style={[s.whyIconWrap, { backgroundColor: item.iconBg }]}>
                  <Text style={s.whyIcon}>{item.icon}</Text>
                </View>
                <Text style={s.whyCardTitle}>{item.title}</Text>
                <Text style={s.whyCardText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={s.reviewsSection}>
          <View style={s.reviewHeadRow}>
            <View style={s.reviewHeadLeft}>
              <View style={s.reviewRatingRow}>
                <Text style={s.reviewStars}>★★★★★</Text>
                <Text style={s.reviewScore}>4.8</Text>
                <Text style={s.reviewCount}>(56+ verified reviews)</Text>
              </View>
              <Text style={s.reviewTitle}>Loved By Customers Worldwide</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.reviewRow}>
            {TESTIMONIALS.map((t) => (
              <View key={t.name} style={s.reviewCard}>
                <Text style={s.reviewCardStars}>★★★★★</Text>
                <Text style={s.reviewQuote}>"{t.quote}"</Text>
                <View style={s.reviewFoot}>
                  <View style={[s.avatar, { backgroundColor: t.avatarBg }]}>
                    <Text style={[s.avatarText, { color: t.avatarText }]}>{t.initial}</Text>
                  </View>
                  <View>
                    <Text style={s.reviewName}>{t.name}</Text>
                    <Text style={s.reviewRole}>{t.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FAQ */}
        <View
          style={s.faqSection}
          onLayout={(e) => {
            faqY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={s.sectionHead}>
            <Text style={s.kicker}>GOT QUESTIONS?</Text>
            <Text style={s.h2}>Frequently Asked Questions</Text>
          </View>
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <View key={item.q} style={s.faqItem}>
                <TouchableOpacity
                  style={s.faqQRow}
                  activeOpacity={0.8}
                  onPress={() => setOpenFaq(open ? -1 : idx)}
                >
                  <Text style={s.faqQ}>{item.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={C.slate400}
                  />
                </TouchableOpacity>
                {open ? <Text style={s.faqA}>{item.a}</Text> : null}
              </View>
            );
          })}
        </View>

        {/* Footer — exact pehle wala app footer */}
        <View style={s.footer}>
          <Text style={s.footerT}>© 2026 Adotrip • Himachal Tourism</Text>
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
      </ScrollView>

      {/* Booking sheet */}
      <Modal visible={!!booking} transparent animationType="slide" onRequestClose={closeBooking}>
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={closeBooking} />
          <View style={[s.sheet, { paddingBottom: 22 + insets.bottom }]}>
            <View style={s.sheetHandle} />
            {booking ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                <View style={s.bookHead}>
                  <Image
                    source={imageSource(booking.image || IMG_HERO)}
                    style={s.bookImg}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <View style={[s.bookBadge, { backgroundColor: booking.badgeColor }]}>
                      <Text style={s.bookBadgeText}>{booking.badge}</Text>
                    </View>
                    <Text style={s.bookName}>{booking.name}</Text>
                    <Text style={s.bookLocation} numberOfLines={2}>
                      {booking.location}
                    </Text>
                  </View>
                </View>

                {booking.gallery?.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.bookGalleryRow}
                  >
                    {booking.gallery.slice(0, 6).map((uri) => (
                      <Image
                        key={uri}
                        source={{ uri }}
                        style={s.bookGalleryImg}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                ) : null}

                <View style={s.bookDivider} />

                <Text style={s.bookLabel}>SELECT DATES</Text>
                <View style={s.dateRow}>
                  <TouchableOpacity
                    style={s.dateField}
                    activeOpacity={0.8}
                    onPress={() => setDateField('in')}
                  >
                    <Text style={s.dateFieldLabel}>CHECK-IN</Text>
                    <View style={s.dateFieldRow}>
                      <Ionicons name="calendar-outline" size={14} color={C.blue} />
                      <Text style={[s.dateFieldValue, !checkIn && s.datePlaceholder]}>
                        {checkIn ? fmtDate(checkIn) : 'Add date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.dateField}
                    activeOpacity={0.8}
                    onPress={() => setDateField('out')}
                  >
                    <Text style={s.dateFieldLabel}>CHECK-OUT</Text>
                    <View style={s.dateFieldRow}>
                      <Ionicons name="calendar-outline" size={14} color={C.blue} />
                      <Text style={[s.dateFieldValue, !checkOut && s.datePlaceholder]}>
                        {checkOut ? fmtDate(checkOut) : 'Add date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={s.guestRow}>
                  <View>
                    <Text style={s.bookLabel}>GUESTS</Text>
                    <Text style={s.guestHint}>Rooms & extra beds on request</Text>
                  </View>
                  <View style={s.stepper}>
                    <TouchableOpacity
                      style={s.stepBtn}
                      onPress={() => setGuests((g) => Math.max(1, g - 1))}
                    >
                      <Ionicons name="remove" size={16} color={C.slate700} />
                    </TouchableOpacity>
                    <Text style={s.stepValue}>{guests}</Text>
                    <TouchableOpacity
                      style={s.stepBtn}
                      onPress={() => setGuests((g) => Math.min(6, g + 1))}
                    >
                      <Ionicons name="add" size={16} color={C.slate700} />
                    </TouchableOpacity>
                  </View>
                </View>

                {booking.facilities?.length ? (
                  <>
                    <Text style={[s.bookLabel, { marginTop: 14 }]}>PROPERTY FACILITIES</Text>
                    <View style={s.facilityChips}>
                      {booking.facilities.slice(0, 8).map((facility) => (
                        <View key={facility} style={s.facilityChip}>
                          <Text style={s.facilityChipText} numberOfLines={1}>
                            {facility}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}

                <View style={s.summary}>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>
                      ₹{booking.price.toLocaleString('en-IN')} × {nights || '—'} night{nights === 1 ? '' : 's'}
                    </Text>
                    <Text style={s.summaryValue}>
                      {nights ? `₹${total.toLocaleString('en-IN')}` : '—'}
                    </Text>
                  </View>
                  <Text style={s.summaryNote}>No payment now · Pay at the hotel</Text>
                </View>

                {booking.contact?.phone || booking.contact?.email ? (
                  <View style={s.bookContact}>
                    {booking.contact.phone ? (
                      <View style={s.contactRow}>
                        <Ionicons name="call-outline" size={13} color={C.blue} />
                        <Text style={s.contactText}>{booking.contact.phone}</Text>
                      </View>
                    ) : null}
                    {booking.contact.email ? (
                      <View style={s.contactRow}>
                        <Ionicons name="mail-outline" size={13} color={C.blue} />
                        <Text style={s.contactText}>{booking.contact.email}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <TouchableOpacity style={s.confirmBtn} activeOpacity={0.88} onPress={confirmBooking}>
                  <Text style={s.confirmBtnText}>CONFIRM BOOKING</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.callSupport}
                  onPress={() => {
                    closeBooking();
                    navigation.navigate('Support');
                  }}
                >
                  <Ionicons name="call-outline" size={14} color={C.blue} />
                  <Text style={s.callSupportText}>Call HPTDC Support</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Date picker sheet */}
      <Modal
        visible={!!dateField}
        transparent
        animationType="fade"
        onRequestClose={() => setDateField(null)}
      >
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={() => setDateField(null)} />
          <View style={[s.sheet, { maxHeight: '72%', paddingBottom: 22 + insets.bottom }]}>
            <View style={s.sheetHandle} />
            <View style={s.dateSheetHead}>
              <Text style={s.dateSheetTitle}>
                {dateField === 'in' ? 'Select check-in date' : 'Select check-out date'}
              </Text>
              <TouchableOpacity onPress={() => setDateField(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={C.slate500} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DATES.map((d) => {
                const disabled = dateField === 'out' && checkIn ? d <= checkIn : false;
                const selected =
                  dateField === 'in'
                    ? checkIn && d.getTime() === checkIn.getTime()
                    : checkOut && d.getTime() === checkOut.getTime();
                return (
                  <TouchableOpacity
                    key={d.toISOString()}
                    disabled={disabled}
                    onPress={() => pickDate(d)}
                    activeOpacity={0.8}
                    style={[
                      s.dateOption,
                      selected && s.dateOptionActive,
                      disabled && { opacity: 0.32 },
                    ]}
                  >
                    <View>
                      <Text style={[s.dateOptionMain, selected && { color: C.blue }]}>
                        {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
                      </Text>
                      <Text style={s.dateOptionSub}>{WEEKDAYS[d.getDay()]}</Text>
                    </View>
                    {selected ? <Ionicons name="checkmark-circle" size={19} color={C.blue} /> : null}
                    {disabled ? <Text style={s.dateDisabled}>Unavailable</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Circuit map sheet */}
      <Modal visible={mapOpen} transparent animationType="slide" onRequestClose={() => setMapOpen(false)}>
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={() => setMapOpen(false)} />
          <View style={[s.sheet, { paddingBottom: 22 + insets.bottom }]}>
            <View style={s.sheetHandle} />
            <View style={s.dateSheetHead}>
              <View>
                <Text style={s.kicker}>INTERACTIVE CIRCUIT MAP</Text>
                <Text style={s.dateSheetTitle}>Himachal Accommodation Portfolio</Text>
              </View>
              <TouchableOpacity onPress={() => setMapOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={C.slate500} />
              </TouchableOpacity>
            </View>
            <Image source={IMG_MAP} style={s.mapSheetImg} resizeMode="cover" />
            <View style={{ marginTop: 12 }}>
              {apiCircuits.length ? (
                apiCircuits.map((item, idx) => (
                  <TouchableOpacity
                    key={item.name}
                    style={s.mapCircuitRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      selectCircuit(item.name);
                      setMapOpen(false);
                      setTimeout(goHotels, 250);
                    }}
                  >
                    <View
                      style={[
                        s.mapCircuitDot,
                        {
                          backgroundColor:
                            CIRCUIT_INFO[item.name]?.color ||
                            CIRCUIT_COLORS[idx % CIRCUIT_COLORS.length],
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={s.mapCircuitName}>{item.name}</Text>
                      <Text style={s.mapCircuitCount}>
                        {item.count} official properties
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={C.slate300} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={s.mapCircuitCount}>Circuits load ho rahe hain…</Text>
              )}
            </View>
            <TouchableOpacity
              style={s.confirmBtn}
              activeOpacity={0.88}
              onPress={() => {
                selectCircuit('All');
                setMapOpen(false);
                setTimeout(goHotels, 250);
              }}
            >
              <Text style={s.confirmBtnText}>EXPLORE ALL HOTELS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pageBg },
  scroll: { flex: 1, backgroundColor: C.pageBg },

  /* Hero */
  hero: { width: '100%', backgroundColor: C.slate900 },
  heroContent: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 20 },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254,228,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(254,228,0,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: C.yellow,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: -0.4,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 11.5,
    lineHeight: 17.5,
    color: '#CBD5E1',
    marginBottom: 18,
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  heroPrimary: {
    flex: 1,
    height: 43,
    borderRadius: 9,
    backgroundColor: C.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  heroPrimaryText: { fontSize: 12, fontWeight: '800', color: C.slate900 },
  heroSecondary: {
    flex: 1,
    height: 43,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  heroStats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 16, fontWeight: '900', color: C.yellow },
  heroStatLabel: { fontSize: 9.5, color: C.slate400, marginTop: 2 },

  /* Pills */
  pillsWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingVertical: 10,
  },
  pillsLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: C.slate400,
    marginBottom: 7,
    paddingHorizontal: 16,
  },
  pillsRow: { paddingHorizontal: 16, gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.slate100,
  },
  pillActive: { backgroundColor: C.blue },
  pillText: { fontSize: 11.5, fontWeight: '600', color: C.slate700 },
  pillTextActive: { color: '#FFFFFF' },

  /* Intro */
  introSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    padding: 16,
    marginTop: 2,
  },
  introCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 15,
  },
  introHeadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  amberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 7,
  },
  introTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#78350F',
    textTransform: 'uppercase',
  },
  introText: { fontSize: 11.5, lineHeight: 18, color: C.slate700 },
  introBold: { fontWeight: '700', color: C.slate900 },
  introFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,158,11,0.28)',
    marginTop: 12,
    paddingTop: 11,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  introStars: { fontSize: 11, color: '#F59E0B', letterSpacing: 1 },
  introRating: { fontSize: 10.5, fontWeight: '700', color: C.slate800, marginLeft: 6 },
  introLink: { fontSize: 10.5, fontWeight: '700', color: C.blue },

  /* Circuits */
  circuitsSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingTop: 15,
    paddingBottom: 14,
    marginTop: 2,
  },
  sectionHead: { paddingHorizontal: 16 },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: C.blue,
    textTransform: 'uppercase',
  },
  h2: { fontSize: 18.5, fontWeight: '900', color: C.slate900, marginTop: 2, letterSpacing: -0.3 },
  sectionSub: { fontSize: 11, color: C.slate500, marginTop: 2, lineHeight: 16 },
  circuitTabs: { paddingHorizontal: 16, gap: 8, paddingTop: 12, paddingBottom: 2 },
  circuitTab: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.slate100,
  },
  circuitTabActive: { backgroundColor: C.blue },
  circuitTabText: { fontSize: 11, fontWeight: '600', color: C.slate700 },
  circuitTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  circuitAbout: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 8,
    padding: 11,
  },
  circuitAboutText: { fontSize: 10.5, lineHeight: 16.5, color: C.slate600 },
  circuitAboutBold: { fontWeight: '700', color: C.slate800 },

  /* Hotels */
  hotelsSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, gap: 16 },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 13,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 7,
  },
  stateEmoji: { fontSize: 26 },
  stateTitle: { fontSize: 13.5, fontWeight: '800', color: C.slate900, textAlign: 'center' },
  stateText: { fontSize: 11, lineHeight: 16, color: C.slate500, textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    backgroundColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 18,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.4, color: '#FFFFFF' },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.slate200,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hotelImgWrap: { width: '100%', height: 176, backgroundColor: C.slate200 },
  hotelImg: { width: '100%', height: '100%' },
  hotelBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  hotelBadgeText: { fontSize: 8.5, fontWeight: '800', letterSpacing: 0.4, color: '#FFFFFF' },
  govtApproved: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  govtApprovedText: { fontSize: 9, fontWeight: '600', color: '#FFFFFF' },
  hotelBody: { padding: 13.5 },
  hotelLocationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  hotelCircuit: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: C.blue,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  hotelLocation: { flex: 1, fontSize: 10.5, color: C.slate500, marginLeft: 3, lineHeight: 15 },
  hotelNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hotelName: { flex: 1, fontSize: 16, fontWeight: '800', color: C.slate900, letterSpacing: -0.2 },
  hotelDesc: { fontSize: 11.5, lineHeight: 17, color: C.slate600, marginTop: 4 },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 7,
    marginVertical: 12,
  },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityIcon: { fontSize: 11 },
  amenityText: { fontSize: 10.5, color: C.slate400 },
  hotelFoot: { flexDirection: 'row', alignItems: 'center' },
  tariffLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: C.slate400,
    textTransform: 'uppercase',
  },
  price: { fontSize: 14.5, fontWeight: '900', color: C.slate900, marginTop: 1 },
  pricePer: { fontSize: 10, fontWeight: '400', color: C.slate500 },
  bookBtn: {
    backgroundColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookBtnText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3, color: '#FFFFFF' },
  loadMore: {
    marginTop: -2,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.slate300,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  loadMoreText: { fontSize: 11, fontWeight: '700', color: C.slate700 },

  /* Map section */
  mapSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    marginTop: 8,
    paddingVertical: 16,
  },
  mapCard: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.slate200,
    backgroundColor: C.slate200,
  },
  mapOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mapPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  mapPillText: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8, color: C.slate900 },
  mapText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 270,
  },
  mapBtn: {
    marginTop: 10,
    backgroundColor: C.yellow,
    borderRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapBtnText: { fontSize: 10.5, fontWeight: '800', color: C.slate900 },
  categoryList: { paddingHorizontal: 16, marginTop: 12, gap: 9 },
  categoryCard: {
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 9,
    padding: 11,
  },
  categoryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryTitle: { flex: 1, fontSize: 11, fontWeight: '800', color: C.slate900 },
  categoryBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  categoryBadgeText: { fontSize: 8.5, fontWeight: '800' },
  categoryText: { fontSize: 10.5, lineHeight: 16, color: C.slate600, marginTop: 4 },

  /* Why */
  whySection: {
    backgroundColor: C.slate50,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  centerHead: { alignItems: 'center', marginBottom: 14 },
  whyTitle: {
    fontSize: 17.5,
    fontWeight: '900',
    color: C.slate900,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  whySub: { fontSize: 11, color: C.slate500, marginTop: 3, textAlign: 'center' },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9 },
  whyCard: {
    width: '48.6%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 9,
    alignItems: 'center',
  },
  whyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  whyIcon: { fontSize: 15 },
  whyCardTitle: { fontSize: 11, fontWeight: '800', color: C.slate900, textAlign: 'center' },
  whyCardText: {
    fontSize: 9.5,
    lineHeight: 13.5,
    color: C.slate500,
    textAlign: 'center',
    marginTop: 3,
  },

  /* Reviews */
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingVertical: 16,
  },
  reviewHeadRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-end' },
  reviewHeadLeft: { flex: 1 },
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center' },
  reviewStars: { fontSize: 11, color: '#F59E0B', letterSpacing: 1 },
  reviewScore: { fontSize: 11, fontWeight: '800', color: C.slate800, marginLeft: 5 },
  reviewCount: { fontSize: 9, color: C.slate400, marginLeft: 4 },
  reviewTitle: { fontSize: 16.5, fontWeight: '800', color: C.slate900, marginTop: 2 },
  reviewRow: { paddingHorizontal: 16, paddingTop: 12, gap: 11 },
  reviewCard: {
    width: 256,
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 12,
    padding: 14,
  },
  reviewCardStars: { fontSize: 10.5, color: '#F59E0B', letterSpacing: 1, marginBottom: 5 },
  reviewQuote: { fontSize: 11, lineHeight: 17, color: C.slate700, fontStyle: 'italic' },
  reviewFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.7)',
    paddingTop: 9,
    marginTop: 12,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '800' },
  reviewName: { fontSize: 11, fontWeight: '800', color: C.slate900 },
  reviewRole: { fontSize: 8.5, color: C.slate400, marginTop: 1 },

  /* FAQ */
  faqSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    paddingVertical: 16,
    marginTop: 2,
  },
  faqItem: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },
  faqQRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQ: { flex: 1, fontSize: 11.5, fontWeight: '700', color: C.slate800, lineHeight: 16 },
  faqA: { fontSize: 10.5, lineHeight: 16.5, color: C.slate600, marginTop: 6, paddingRight: 12 },

  /* Footer */
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerT: { fontSize: 10, color: '#8A94A6', fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  footerLink: { fontSize: 10, color: '#6B7280' },
  footerDot: { fontSize: 10, color: '#9CA3AF', marginHorizontal: 7 },

  /* Modals */
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2,6,23,0.55)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 26,
    maxHeight: '88%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.slate200,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bookHead: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  bookGalleryRow: { paddingTop: 10, gap: 8 },
  bookGalleryImg: { width: 86, height: 62, borderRadius: 8, backgroundColor: C.slate200 },
  bookImg: { width: 66, height: 66, borderRadius: 10, backgroundColor: C.slate200 },
  bookBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  bookBadgeText: { fontSize: 7.5, fontWeight: '800', letterSpacing: 0.4, color: '#FFFFFF' },
  bookName: { fontSize: 14.5, fontWeight: '800', color: C.slate900, marginTop: 3 },
  bookLocation: { fontSize: 10, color: C.slate500, marginTop: 1, lineHeight: 14 },
  bookDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 13 },
  bookContact: { marginTop: 10, gap: 4 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { flex: 1, fontSize: 10.5, color: C.slate600 },
  facilityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  facilityChip: {
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 240,
  },
  facilityChipText: { fontSize: 9.5, color: C.slate600 },
  bookLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7, color: C.slate400 },
  dateRow: { flexDirection: 'row', gap: 9, marginTop: 6 },
  dateField: {
    flex: 1,
    backgroundColor: C.slate50,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateFieldLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, color: C.slate400 },
  dateFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  dateFieldValue: { fontSize: 11.5, fontWeight: '700', color: C.slate800 },
  datePlaceholder: { color: C.slate400, fontWeight: '500' },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  guestHint: { fontSize: 9.5, color: C.slate400, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.slate200,
    backgroundColor: C.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 14, fontWeight: '800', color: C.slate900, minWidth: 16, textAlign: 'center' },
  summary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 11,
    marginTop: 15,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 11, color: C.slate600 },
  summaryValue: { fontSize: 14, fontWeight: '900', color: C.slate900 },
  summaryNote: { fontSize: 9, color: C.slate500, marginTop: 4 },
  confirmBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: C.blue,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  confirmBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.7, color: '#FFFFFF' },
  callSupport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 12,
  },
  callSupportText: { fontSize: 11, fontWeight: '700', color: C.blue },
  dateSheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateSheetTitle: { fontSize: 15.5, fontWeight: '800', color: C.slate900 },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dateOptionActive: { backgroundColor: '#EFF6FF' },
  dateOptionMain: { fontSize: 12.5, fontWeight: '600', color: C.slate800 },
  dateOptionSub: { fontSize: 9.5, color: C.slate400, marginTop: 1 },
  dateDisabled: { fontSize: 9, color: C.slate400 },
  mapSheetImg: { width: '100%', height: 190, borderRadius: 12, backgroundColor: C.slate200 },
  mapCircuitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mapCircuitDot: { width: 9, height: 9, borderRadius: 5 },
  mapCircuitName: { fontSize: 12, fontWeight: '700', color: C.slate800 },
  mapCircuitCount: { fontSize: 9.5, color: C.slate400, marginTop: 1 },
});
