import { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AdoLogo from '../components/AdoLogo';
import { SectionHeader, Chip, Rating, HotelImg, CoverImg, TabGap } from '../components/UI';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { OFFERS, PACKAGES, FLIGHT_ROUTES, HOTELS, DESTINATIONS, BLOGS, FAQS } from '../data/appData';

const TABS = [
  { id: 'Flights', icon: '✈️', route: 'Flights' },
  { id: 'Hotels', icon: '🏨', route: 'Hotels' },
  { id: 'Bus', icon: '🚌', route: 'Bus' },
  { id: 'Holidays', icon: '🏖️', route: 'Holidays' },
  { id: 'Visa', icon: '🛂', route: 'Visa' },
];

// MakeMyTrip style bada photo card - photo fail ho to emoji fallback
function DestCard({ d, onPress }) {
  const [err, setErr] = useState(false);
  return (
    <TouchableOpacity style={[s.destCard, { backgroundColor: d.color }]} onPress={onPress} activeOpacity={0.9}>
      {d.image && !err ? (
        <View style={s.destImg}>
          <Image source={{ uri: d.image }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setErr(true)} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={s.destGrad} start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }}>
            <Text style={s.destN}>{d.name}</Text>
            <Text style={s.destT}>{d.tag} • {d.tours} tours</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={[s.destImg, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 44 }}>{d.emoji}</Text>
          <Text style={s.destN}>{d.name}</Text>
          <Text style={s.destT}>{d.tag} • {d.tours} tours</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [tab, setTab] = useState('Flights');
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Mumbai');

  const goSearch = () => {
    const r = TABS.find((t) => t.id === tab)?.route || 'Flights';
    if (r === 'Holidays') { navigation.navigate('Holidays'); return; }
    navigation.navigate(r, { from, to });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.topBar}>
          <AdoLogo showTagline />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Support')}>
              <Ionicons name="headset-outline" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Auth')}>
              <Ionicons name="person-outline" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero + Search */}
        <LinearGradient colors={['#0E2A47', '#4A4300', '#FEE400']} style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={s.heroTitle}>Book Flights, Hotels, Buses & Holidays</Text>
          <Text style={s.heroSub}>Nothing Is Far — Up to 50% OFF with code HOLIDAY50</Text>

          <View style={s.searchCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {TABS.map((t) => (
                <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tab, tab === t.id && s.tabActive]}>
                  <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                  <Text style={[s.tabText, tab === t.id && { color: COLORS.onPrimary }]}>{t.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={s.row2}>
              <View style={s.inpBox}>
                <Text style={s.lbl}>From</Text>
                <TextInput value={from} onChangeText={setFrom} style={s.inp} placeholder="Delhi" />
              </View>
              <TouchableOpacity style={s.swap} onPress={() => { setFrom(to); setTo(from); }}>
                <Ionicons name="swap-horizontal" size={20} color={COLORS.onPrimary} />
              </TouchableOpacity>
              <View style={s.inpBox}>
                <Text style={s.lbl}>To</Text>
                <TextInput value={to} onChangeText={setTo} style={s.inp} placeholder="Mumbai" />
              </View>
            </View>
            <View style={s.row2}>
              <View style={s.inpBox}>
                <Text style={s.lbl}>📅 Departure</Text>
                <Text style={s.inp}>12 Oct 2026</Text>
              </View>
              <View style={s.inpBox}>
                <Text style={s.lbl}>👥 Travellers</Text>
                <Text style={s.inp}>2 Adults</Text>
              </View>
            </View>
            <TouchableOpacity style={s.searchBtn} onPress={goSearch}>
              <Ionicons name="search" size={18} color={COLORS.onPrimary} />
              <Text style={s.searchTxt}>  Search {tab}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={s.quick} onPress={() => navigation.navigate('Circuit')}>
              <Text style={s.quickTxt}>✨ AI Trip Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quick} onPress={() => navigation.navigate('Offers')}>
              <Text style={s.quickTxt}>🎁 All Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quick} onPress={() => navigation.navigate('Blog')}>
              <Text style={s.quickTxt}>📝 Blogs</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Offers */}
        <SectionHeader title="Exclusive Offers" subtitle="Top deals on Flights • Hotels • Holidays" onViewAll={() => navigation.navigate('Offers')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {OFFERS.map((o) => (
            <TouchableOpacity key={o.id} onPress={() => navigation.navigate('Offers')} style={[s.offer, { backgroundColor: o.color }]}>
              <Text style={{ fontSize: 30 }}>{o.emoji}</Text>
              <Text style={s.offerT}>{o.title}</Text>
              <Text style={s.offerS}>{o.subtitle}</Text>
              <Text style={s.offerC}>Code: {o.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Packages */}
        <SectionHeader title="Recommended Packages" subtitle="Handpicked holidays loved by travellers" onViewAll={() => navigation.navigate('Holidays')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {PACKAGES.slice(0, 6).map((p) => (
            <TouchableOpacity key={p.id} style={s.pkg} onPress={() => navigation.navigate('HolidayDetail', { item: p })}>
              <View style={s.pkgImg}>
                <CoverImg hotel={p} height={120} />
                <View style={s.tag}><Text style={s.tagT}>{p.tag}</Text></View>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.pkgDays}>{p.days}</Text>
                <Text style={s.pkgTitle} numberOfLines={2}>{p.title}</Text>
                <Text style={s.pkgLoc} numberOfLines={1}>📍 {p.location}</Text>
                <View style={{ marginVertical: 4 }}><Rating value={p.rating} reviews={p.reviews} /></View>
                <Text style={s.price}>₹{p.price.toLocaleString('en-IN')} <Text style={s.old}>₹{p.oldPrice.toLocaleString('en-IN')}</Text></Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Flight routes */}
        <SectionHeader title="Top Flight Routes" subtitle="Cheapest fares, updated daily" onViewAll={() => navigation.navigate('Flights')} />
        {FLIGHT_ROUTES.slice(0, 4).map((f) => (
          <TouchableOpacity key={f.id} style={s.route} onPress={() => navigation.navigate('FlightResults', { from: f.fromCity, to: f.toCity })}>
            <Text style={{ fontSize: 28 }}>{f.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.routeT}>{f.fromCity} → {f.toCity}</Text>
              <Text style={s.routeS}>{f.airline} • {f.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.routeP}>₹{f.price.toLocaleString('en-IN')}</Text>
              <Text style={s.book}>Book →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Hotels */}
        <SectionHeader title="Recommended Hotels" subtitle="Premium stays at best price" onViewAll={() => navigation.navigate('Hotels')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {HOTELS.map((h) => (
            <TouchableOpacity key={h.id} style={s.pkg} onPress={() => navigation.navigate('HotelDetail', { item: h })}>
              <View style={s.pkgImg}>
                <HotelImg hotel={h} height={120} />
                <View style={s.tag}><Text style={s.tagT}>{h.tag}</Text></View>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.pkgTitle} numberOfLines={1}>{h.name}</Text>
                <Text style={s.pkgLoc} numberOfLines={1}>📍 {h.location}</Text>
                <View style={{ marginVertical: 4 }}><Rating value={h.rating} reviews={h.reviews} /></View>
                <Text style={s.price}>₹{h.price.toLocaleString('en-IN')}<Text style={s.per}> /night</Text></Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Destinations - MakeMyTrip style bade photo cards */}
        <SectionHeader title="Famous Tourist Destinations" subtitle="India + International top picks" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {DESTINATIONS.map((d) => (
            <DestCard key={d.id} d={d} onPress={() => navigation.navigate('Holidays')} />
          ))}
        </ScrollView>

        {/* Planner banner */}
        <TouchableOpacity onPress={() => navigation.navigate('Circuit')}>
          <LinearGradient colors={['#7C3AED', '#0E2A47']} style={s.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={s.bannerT}>✨ Circuit Planner — Build the perfect itinerary with AI</Text>
            <Text style={s.bannerS}>Origin + Destination + Days = Ready Day-wise Plan. Try Now →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Blogs */}
        <SectionHeader title="Travel Blogs" subtitle="Guides, tips & inspiration" onViewAll={() => navigation.navigate('Blog')} />
        {BLOGS.slice(0, 3).map((b) => (
          <TouchableOpacity key={b.id} style={s.blog} onPress={() => navigation.navigate('BlogDetail', { item: b })}>
            {b.image ? (
              <Image source={{ uri: b.image }} style={s.blogIc} />
            ) : (
              <View style={[s.blogIc, { backgroundColor: b.color }]}><Text style={{ fontSize: 26 }}>{b.emoji}</Text></View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.blogT} numberOfLines={2}>{b.title}</Text>
              <Text style={s.blogS}>{b.cat} • {b.read}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <SectionHeader title="FAQs" subtitle="Frequently Asked Questions" onViewAll={() => navigation.navigate('Support')} />
        {FAQS.slice(0, 3).map((f, i) => (
          <View key={i} style={s.faq}>
            <Text style={s.faqQ}>Q. {f.q}</Text>
            <Text style={s.faqA}>{f.a}</Text>
          </View>
        ))}

        {/* Footer links */}
        <View style={s.footer}>
          <AdoLogo light showTagline />
          <Text style={s.footTxt}>Flights • Hotels • Bus • Holidays • Visa • Blog • Offers</Text>
          <View style={s.footRow}>
            <TouchableOpacity onPress={() => navigation.navigate('About')}><Text style={s.footLink}>About Us</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Contact')}><Text style={s.footLink}>Contact</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Support')}><Text style={s.footLink}>Support</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Blog')}><Text style={s.footLink}>Blog</Text></TouchableOpacity>
          </View>
          <Text style={s.copy}>Made with ❤️ inspired by adotrip.com • v1.0.0</Text>
        </View>
        <TabGap />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginLeft: 6, borderWidth: 1, borderColor: COLORS.border },
  hero: { padding: 16, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroSub: { color: '#FFE9D6', fontSize: 12, marginTop: 4, marginBottom: 12 },
  searchCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, ...SHADOW },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bg, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  tabText: { fontSize: 13, fontWeight: '700', marginLeft: 4, color: COLORS.text },
  row2: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  inpBox: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  lbl: { fontSize: 11, color: COLORS.textLight, fontWeight: '700' },
  inp: { fontSize: 15, fontWeight: '700', color: COLORS.secondary, marginTop: 2 },
  swap: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  searchBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  searchTxt: { color: COLORS.onPrimary, fontWeight: '800', fontSize: 16 },
  quick: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  quickTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  offer: { width: 190, borderRadius: 14, padding: 14, marginRight: 10 },
  offerT: { color: '#fff', fontWeight: '900', fontSize: 17, marginTop: 8 },
  offerS: { color: '#fff', fontSize: 12, opacity: 0.9 },
  offerC: { color: COLORS.primary, fontWeight: '800', fontSize: 12, marginTop: 8 },
  pkg: { width: 230, backgroundColor: '#fff', borderRadius: 14, marginRight: 12, overflow: 'hidden', ...SHADOW },
  pkgImg: { height: 120, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagT: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pkgDays: { fontSize: 11, color: COLORS.primaryText, fontWeight: '800' },
  pkgTitle: { fontSize: 14, fontWeight: '800', color: COLORS.secondary, marginTop: 2 },
  pkgLoc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '900', color: COLORS.secondary },
  old: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through', fontWeight: '400' },
  per: { fontSize: 11, color: COLORS.textLight, fontWeight: '400' },
  route: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8, ...SHADOW },
  routeT: { fontWeight: '800', color: COLORS.secondary, fontSize: 14 },
  routeS: { fontSize: 12, color: COLORS.textLight },
  routeP: { fontWeight: '900', color: COLORS.secondary, fontSize: 15 },
  book: { color: COLORS.primaryText, fontWeight: '800', fontSize: 12 },
  destCard: { width: 168, height: 210, borderRadius: 16, marginRight: 12, overflow: 'hidden', ...SHADOW },
  destImg: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  destGrad: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  destN: { color: '#fff', fontWeight: '900', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  destT: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  banner: { margin: 16, borderRadius: 14, padding: 16 },
  bannerT: { color: '#fff', fontWeight: '900', fontSize: 15 },
  bannerS: { color: '#E9D5FF', fontSize: 12, marginTop: 4 },
  blog: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8, ...SHADOW },
  blogIc: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  blogT: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  blogS: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  faq: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8 },
  faqQ: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  faqA: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  footer: { backgroundColor: COLORS.secondary, marginTop: 16, padding: 20, alignItems: 'center' },
  footTxt: { color: '#B9C4D6', fontSize: 11, marginTop: 10, textAlign: 'center' },
  footRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  footLink: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  copy: { color: '#7C8AA0', fontSize: 10, marginTop: 12 },
});
