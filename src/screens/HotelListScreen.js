import { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '../theme';
import { HotelImg, ScreenHeader, TabGap } from '../components/UI';
import { HOTELS } from '../data/appData';

const AMEN_ICON = {
  WiFi: 'wifi-outline',
  Breakfast: 'fast-food-outline',
  Parking: 'car-outline',
  Pool: 'water-outline',
  Spa: 'flower-outline',
  Restaurant: 'restaurant-outline',
};

const AMENITIES = ['WiFi', 'Breakfast', 'Parking', 'Pool', 'Spa', 'Restaurant'];
const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', test: () => true },
  { id: 'u3k', label: 'Under ₹3000', test: (p) => p < 3000 },
  { id: '3k6k', label: '₹3000 – ₹6000', test: (p) => p >= 3000 && p <= 6000 },
  { id: '6k12k', label: '₹6000 – ₹12000', test: (p) => p > 6000 && p <= 12000 },
  { id: '12k', label: '₹12000+', test: (p) => p > 12000 },
];
const STAR_OPTS = ['All', '3', '4', '5'];
const RATING_OPTS = ['All', '3', '4', '5'];
const SORTS = [
  { id: 'rec', label: 'Recommended' },
  { id: 'plo', label: 'Price: Low to High' },
  { id: 'phi', label: 'Price: High to Low' },
  { id: 'star', label: 'Star Rating' },
  { id: 'rate', label: 'Guest Rating' },
];

function ratingWord(r) {
  if (r >= 4.5) return 'Excellent';
  if (r >= 4.0) return 'Very Good';
  return 'Good';
}

export default function HotelListScreen({ navigation, route }) {
  const p = route.params || {};
  // Modify-search fields (website top bar jaisa)
  const [city, setCity] = useState(p.city || 'Goa');
  const [appliedCity, setAppliedCity] = useState(p.city || 'Goa');
  const [checkin, setCheckin] = useState(p.checkin || '12 Oct 2026');
  const [checkout, setCheckout] = useState(p.checkout || '14 Oct 2026');
  const [rooms, setRooms] = useState(p.rooms || 1);
  const [adults, setAdults] = useState(p.adults || 2);
  const [children, setChildren] = useState(p.children || 0);
  const [stayRating, setStayRating] = useState(p.rating || 'All');
  const [modifyOpen, setModifyOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  // Working filters (website left panel jaisa)
  const [q, setQ] = useState('');
  const [priceId, setPriceId] = useState('all');
  const [stars, setStars] = useState('All');
  const [amen, setAmen] = useState([]);
  const [sort, setSort] = useState('rec');

  const toggleAmen = (a) =>
    setAmen((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const clearFilters = () => {
    setQ('');
    setPriceId('all');
    setStars('All');
    setAmen([]);
    setSort('rec');
  };
  const filterCount =
    (q ? 1 : 0) + (priceId !== 'all' ? 1 : 0) + (stars !== 'All' ? 1 : 0) + amen.length;

  const list = useMemo(() => {
    const cq = appliedCity.trim().toLowerCase();
    let out = HOTELS.filter((h) => {
      if (!cq) return true;
      return (
        String(h.city || '').toLowerCase().includes(cq) ||
        String(h.location || '').toLowerCase().includes(cq) ||
        String(h.name || '').toLowerCase().includes(cq)
      );
    });
    const nq = q.trim().toLowerCase();
    if (nq) out = out.filter((h) => String(h.name || '').toLowerCase().includes(nq));
    if (stars !== 'All') out = out.filter((h) => Number(h.stars) === Number(stars));
    const pr = PRICE_RANGES.find((r) => r.id === priceId) || PRICE_RANGES[0];
    out = out.filter((h) => pr.test(Number(h.price) || 0));
    if (amen.length) {
      out = out.filter((h) => amen.every((a) => (h.amenities || []).includes(a)));
    }
    const sorted = [...out];
    if (sort === 'plo') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'phi') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'star') sorted.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    else if (sort === 'rate') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [appliedCity, q, stars, priceId, amen, sort]);

  const guests = adults + children;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader
        title={`Hotels in ${appliedCity || 'India'}`}
        subtitle={`${checkin} - ${checkout} • ${guests} Guests • ${rooms} Room${rooms > 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Modify Search — website top bar */}
        <View style={s.card}>
          <TouchableOpacity style={s.rowH} onPress={() => setModifyOpen((v) => !v)} activeOpacity={0.8}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={s.modIcon}>
                <Ionicons name="search-outline" size={16} color="#fff" />
              </View>
              <View>
                <Text style={s.cardT}>Modify Search</Text>
                <Text style={s.cardS}>{appliedCity || 'All cities'} • {guests} Guests • {rooms} Room{rooms > 1 ? 's' : ''}</Text>
              </View>
            </View>
            <Ionicons name={modifyOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primaryText} />
          </TouchableOpacity>
          {modifyOpen && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.lbl}>City Name</Text>
              <View style={s.inpRow}>
                <Ionicons name="location-outline" size={18} color={COLORS.textLight} />
                <TextInput value={city} onChangeText={setCity} placeholder="New Delhi, Goa, Mumbai…" style={s.inp} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.lbl}>Check-In</Text>
                  <View style={s.inpRow}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
                    <TextInput value={checkin} onChangeText={setCheckin} style={s.inp} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.lbl}>Check-Out</Text>
                  <View style={s.inpRow}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
                    <TextInput value={checkout} onChangeText={setCheckout} style={s.inp} />
                  </View>
                </View>
              </View>
              <Text style={s.lbl}>Rooms & Guests</Text>
              <View style={s.stepWrap}>
                <Stepper label="Rooms" value={rooms} min={1} max={4} onChange={setRooms} />
                <Stepper label="Adults" value={adults} min={1} max={8} onChange={setAdults} />
                <Stepper label="Children" value={children} min={0} max={6} onChange={setChildren} />
              </View>
              <Text style={s.lbl}>Rating</Text>
              <View style={s.segRow}>
                {RATING_OPTS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setStayRating(r)}
                    style={[s.seg, stayRating === r && s.segOn]}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.segT, stayRating === r && s.segTOn]}>
                      {r === 'All' ? 'All' : '★'.repeat(Number(r))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={s.modSearchBtn}
                onPress={() => {
                  setAppliedCity(city.trim());
                  if (stayRating !== 'All') setStars(stayRating);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="search" size={18} color="#000" />
                <Text style={s.modSearchT}>  Search Hotels</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Filter + Sort bar */}
        <View style={s.barRow}>
          <TouchableOpacity style={s.barBtn} onPress={() => setFilterOpen((v) => !v)} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={16} color={COLORS.secondary} />
            <Text style={s.barT}> Filters{filterCount ? ` (${filterCount})` : ''}</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {SORTS.map((o) => (
              <TouchableOpacity
                key={o.id}
                onPress={() => setSort(o.id)}
                style={[s.sortChip, sort === o.id && s.sortOn]}
              >
                <Text style={[s.sortT, sort === o.id && s.sortTOn]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {!!filterCount && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pills}>
            {!!q && <Pill label={`"${q}"`} onX={() => setQ('')} />}
            {priceId !== 'all' && (
              <Pill label={(PRICE_RANGES.find((r) => r.id === priceId) || {}).label || ''} onX={() => setPriceId('all')} />
            )}
            {stars !== 'All' && <Pill label={`${stars} Star`} onX={() => setStars('All')} />}
            {amen.map((a) => (
              <Pill key={a} label={a} onX={() => toggleAmen(a)} />
            ))}
          </ScrollView>
        )}

        {filterOpen && (
          <View style={s.card}>
            <View style={s.rowH}>
              <Text style={s.cardT}>Filters</Text>
              <TouchableOpacity onPress={clearFilters}><Text style={s.clear}>Clear all</Text></TouchableOpacity>
            </View>
            <Text style={s.lbl}>Hotel name</Text>
            <View style={s.inpRow}>
              <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
              <TextInput value={q} onChangeText={setQ} placeholder="Search hotel…" style={s.inp} />
            </View>
            <Text style={s.lbl}>Price per night</Text>
            <View style={s.radioGroup}>
              {PRICE_RANGES.map((r) => (
                <TouchableOpacity key={r.id} style={s.radioRow} onPress={() => setPriceId(r.id)} activeOpacity={0.7}>
                  <View style={[s.radioDot, priceId === r.id && s.radioDotOn]}>
                    {priceId === r.id && <View style={s.radioIn} />}
                  </View>
                  <Text style={[s.radioT, priceId === r.id && s.radioTOn]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lbl}>Star rating</Text>
            <View style={s.segRowPad}>
              <View style={s.segRow}>
                {STAR_OPTS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setStars(r)}
                    style={[s.seg, stars === r && s.segOn]}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.segT, stars === r && s.segTOn]}>
                      {r === 'All' ? 'All' : '★'.repeat(Number(r))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={s.lbl}>Amenities <Text style={s.lblSub}>(must have all)</Text></Text>
            <View style={s.tileGrid}>
              {AMENITIES.map((a) => {
                const on = amen.includes(a);
                return (
                  <TouchableOpacity key={a} style={[s.tile, on && s.tileOn]} onPress={() => toggleAmen(a)} activeOpacity={0.8}>
                    <Ionicons name={AMEN_ICON[a] || 'checkmark-circle-outline'} size={20} color={on ? COLORS.secondary : COLORS.textLight} />
                    <Text style={[s.tileT, on && s.tileTOn]}>{a}</Text>
                    <View style={[s.check, on && s.checkOn]}>
                      {on && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={s.countRow}>
          <View style={s.countPill}>
            <Ionicons name="bed-outline" size={14} color={COLORS.secondary} />
            <Text style={s.count}> {list.length} Hotel{list.length === 1 ? '' : 's'} found</Text>
          </View>
          {!!filterCount && (
            <TouchableOpacity onPress={clearFilters}><Text style={s.clear}>Clear all</Text></TouchableOpacity>
          )}
        </View>

        {list.map((h) => {
          const off = h.oldPrice > h.price ? Math.round((1 - h.price / h.oldPrice) * 100) : 0;
          return (
          <TouchableOpacity key={h.id} style={s.hcard} onPress={() => navigation.navigate('HotelDetail', { item: h })} activeOpacity={0.92}>
            <View style={s.imgWrap}>
              <HotelImg hotel={h} height={180} emojiSize={48} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={s.imgGrad}>
                <View style={s.imgBottom}>
                  <View style={s.starPill}>
                    <Text style={s.starPillT}>{'★'.repeat(Number(h.stars) || 3)}</Text>
                  </View>
                  <Text style={s.imgLoc} numberOfLines={1}>📍 {h.location}</Text>
                </View>
              </LinearGradient>
              {off > 0 && (
                <View style={s.offBadge}><Text style={s.offT}>{off}% OFF</Text></View>
              )}
              <View style={s.rateBadge}>
                <Text style={s.rateT}>★ {h.rating}</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={s.tag}>{h.tag}</Text>
              <Text style={s.name}>{h.name}</Text>
              {!!(h.amenities || []).length && (
                <View style={s.amenRow}>
                  {h.amenities.slice(0, 6).map((a) => (
                    <View key={a} style={s.amen}>
                      <Ionicons name={AMEN_ICON[a] || 'checkmark-circle-outline'} size={13} color={COLORS.primaryText} />
                      <Text style={s.amenT}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}
              {!!(h.inclusions || []).length && (
                <Text style={s.inc} numberOfLines={1}>✓ {h.inclusions.join(' • ')}</Text>
              )}
              <View style={s.metaRow}>
                <Text style={s.rw}>{ratingWord(h.rating)} <Text style={s.rev}>({h.reviews} reviews)</Text></Text>
              </View>
              <View style={s.priceRow}>
                <View>
                  <Text style={s.old}>₹{Number(h.oldPrice).toLocaleString('en-IN')}</Text>
                  <Text style={s.price}>₹{Number(h.price).toLocaleString('en-IN')}<Text style={s.per}> + taxes</Text></Text>
                </View>
                <View style={s.bookBtn}><Text style={s.bookT}>Book Now →</Text></View>
              </View>
            </View>
          </TouchableOpacity>
          );
        })}

        {!list.length && (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="bed-outline" size={36} color={COLORS.secondary} />
            </View>
            <Text style={s.emptyT}>No hotels match these filters.</Text>
            <Text style={s.emptyS}>Try a different city, price range or fewer amenities.</Text>
            <TouchableOpacity style={s.searchBtnFull} onPress={() => { clearFilters(); setAppliedCity(''); setCity(''); }}>
              <Text style={s.searchT}>Clear & show all</Text>
            </TouchableOpacity>
          </View>
        )}
        <TabGap />
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, onX }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillT} numberOfLines={1}>{label}</Text>
      <TouchableOpacity onPress={onX} hitSlop={8}>
        <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
      </TouchableOpacity>
    </View>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <View style={s.step}>
      <Text style={s.stepL}>{label}</Text>
      <View style={s.stepR}>
        <TouchableOpacity style={s.stepB} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={s.stepBT}>−</Text>
        </TouchableOpacity>
        <Text style={s.stepV}>{value}</Text>
        <TouchableOpacity style={s.stepB} onPress={() => onChange(Math.min(max, value + 1))}>
          <Text style={s.stepBT}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', ...SHADOW },
  rowH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14 },
  cardT: { fontWeight: '900', color: COLORS.secondary, fontSize: 15 },
  clear: { color: COLORS.primaryText, fontWeight: '700', fontSize: 13 },
  lbl: { fontSize: 11, fontWeight: '800', color: COLORS.textLight, marginTop: 14, marginBottom: 8, paddingHorizontal: 14, textTransform: 'uppercase', letterSpacing: 0.8 },
  lblSub: { textTransform: 'none', letterSpacing: 0, fontWeight: '400' },
  segRowPad: { paddingHorizontal: 14 },
  segRow: { flexDirection: 'row', backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 4, gap: 4, marginHorizontal: 14 },
  seg: { flex: 1, borderRadius: 9, paddingVertical: 10, alignItems: 'center' },
  segOn: { backgroundColor: COLORS.secondary },
  segT: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  segTOn: { color: '#fff' },
  modSearchBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', margin: 14, marginBottom: 14, ...SHADOW },
  modSearchT: { color: '#000', fontWeight: '900', fontSize: 15 },
  radioGroup: { marginHorizontal: 14, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9 },
  radioDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  radioDotOn: { borderColor: COLORS.secondary },
  radioIn: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary },
  radioT: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  radioTOn: { color: COLORS.secondary, fontWeight: '800' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14 },
  tile: { width: '31%', aspectRatio: 1.15, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tileOn: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryDark },
  tileT: { fontSize: 11, color: COLORS.textLight, fontWeight: '700' },
  tileTOn: { color: COLORS.secondary },
  check: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  pills: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondary, borderRadius: 16, paddingLeft: 12, paddingRight: 6, paddingVertical: 6, marginRight: 8 },
  pillT: { color: '#fff', fontSize: 12, fontWeight: '700', maxWidth: 140 },
  inpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, height: 48, marginHorizontal: 14 },
  inp: { flex: 1, fontSize: 14, color: COLORS.text },
  stepWrap: { marginHorizontal: 14, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10 },
  step: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  stepL: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  stepR: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepB: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepBT: { fontSize: 16, fontWeight: '800', color: COLORS.secondary },
  stepV: { fontSize: 14, fontWeight: '800', color: COLORS.secondary, minWidth: 20, textAlign: 'center' },
  searchBtn: { flexDirection: 'row', backgroundColor: COLORS.secondary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', margin: 14, marginBottom: 14 },
  searchT: { color: '#fff', fontWeight: '800', fontSize: 15 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  barBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  barT: { fontSize: 13, fontWeight: '800', color: COLORS.secondary },
  sortChip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sortOn: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  sortT: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  sortTOn: { color: '#fff' },
  modIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  cardS: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 10 },
  countPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  count: { fontSize: 13, fontWeight: '800', color: COLORS.secondary },
  hcard: { backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 16, marginBottom: 14, overflow: 'hidden', ...SHADOW },
  imgWrap: { height: 180 },
  imgGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, justifyContent: 'flex-end' },
  imgBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  starPill: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  starPillT: { color: '#FBBF24', fontSize: 12, fontWeight: '800' },
  imgLoc: { color: '#fff', fontSize: 11, fontWeight: '600', flex: 1, marginLeft: 8, textAlign: 'right' },
  offBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.success, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  offT: { color: '#fff', fontSize: 11, fontWeight: '900' },
  rateBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  rateT: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tag: { color: COLORS.primaryText, fontWeight: '800', fontSize: 11 },
  name: { fontWeight: '900', color: COLORS.secondary, fontSize: 17, marginTop: 2 },
  amenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  amen: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  amenT: { fontSize: 11, color: COLORS.secondary, fontWeight: '700' },
  inc: { fontSize: 12, color: COLORS.success, marginTop: 7, fontWeight: '600' },
  metaRow: { marginTop: 8 },
  rw: { fontSize: 13, color: COLORS.secondary, fontWeight: '800' },
  rev: { fontSize: 11, color: COLORS.textLight, fontWeight: '400' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 },
  old: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through' },
  price: { fontWeight: '900', color: COLORS.secondary, fontSize: 20 },
  per: { fontSize: 11, color: COLORS.textLight, fontWeight: '400' },
  bookBtn: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, ...SHADOW },
  bookT: { fontWeight: '900', color: COLORS.onPrimary, fontSize: 13 },
  empty: { alignItems: 'center', padding: 32, gap: 8, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  emptyT: { fontWeight: '800', color: COLORS.secondary, fontSize: 14 },
  emptyS: { fontSize: 12, color: COLORS.textLight, textAlign: 'center' },
  searchBtnFull: { backgroundColor: COLORS.secondary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', marginTop: 8 },
});
