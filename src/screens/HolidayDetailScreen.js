import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { Rating, PrimaryBtn } from '../components/UI';

export default function HolidayDetailScreen({ navigation, route }) {
  const p = route.params?.item || { title: 'Kerala Tour', location: 'Kochi', price: 24999, oldPrice: 32999, rating: 4.6, reviews: 1200, days: '4N/5D', emoji: '🌴', color: '#0B6E4F', tag: 'Bestseller', desc: 'Package details' };
  const days = [
    { d: 'Day 1', t: 'Arrival + Kochi sightseeing', e: '🛬' },
    { d: 'Day 2', t: 'Munnar tea gardens & waterfalls', e: '🍃' },
    { d: 'Day 3', t: 'Thekkady + Kathakali show', e: '🎭' },
    { d: 'Day 4', t: 'Alleppey houseboat stay', e: '🛶' },
    { d: 'Day 5', t: 'Departure with memories', e: '📸' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={[s.hero, { backgroundColor: p.color }]}>
        {p.image ? (
          <Image source={{ uri: p.image }} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 76 }}>{p.emoji}</Text>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 16 }}>
        <Text style={s.tag}>{p.days} • {p.tag}</Text>
        <Text style={s.title}>{p.title}</Text>
        <Text style={s.loc}>📍 {p.location}</Text>
        <View style={{ marginVertical: 8 }}><Rating value={p.rating} reviews={p.reviews} /></View>
        <Text style={s.desc}>{p.desc}</Text>
        <Text style={s.sec}>Day-wise Itinerary</Text>
        {days.map((x) => (
          <View key={x.d} style={s.it}>
            <Text style={{ fontSize: 24 }}>{x.e}</Text>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={s.itD}>{x.d}</Text>
              <Text style={s.itT}>{x.t}</Text>
            </View>
          </View>
        ))}
        <Text style={s.sec}>Inclusions</Text>
        <View style={s.inc}>
          {['✓ Flights', '✓ 4★ Hotels', '✓ Daily Breakfast', '✓ Private Cab', '✓ Sightseeing', '✓ 24x7 Support'].map((i) => (
            <View key={i} style={s.pill}><Text style={s.pillT}>{i}</Text></View>
          ))}
        </View>
        <View style={s.priceBox}>
          <View>
            <Text style={s.price}>₹{p.price.toLocaleString('en-IN')}</Text>
            <Text style={s.old}>₹{p.oldPrice.toLocaleString('en-IN')} per person</Text>
          </View>
          <Text style={s.emi}>EMI from ₹{(Math.round(p.price / 12)).toLocaleString('en-IN')}/mo</Text>
        </View>
        <PrimaryBtn title="Book This Package" icon="checkmark-circle-outline" onPress={() => navigation.navigate('Checkout', { type: 'Holiday', title: p.title, price: p.price, meta: `${p.days} • ${p.location}` })} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  hero: { height: 200, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  tag: { color: COLORS.primaryText, fontWeight: '800', fontSize: 12 },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.secondary, marginTop: 4 },
  loc: { color: COLORS.textLight, marginTop: 4 },
  desc: { color: COLORS.textLight, fontSize: 13, lineHeight: 19 },
  sec: { fontWeight: '800', color: COLORS.secondary, fontSize: 15, marginTop: 14, marginBottom: 8 },
  it: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  itD: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  itT: { color: COLORS.textLight, fontSize: 12 },
  inc: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: '#E8FDF0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  pillT: { fontSize: 12, color: '#15803D', fontWeight: '700' },
  priceBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  price: { fontSize: 21, fontWeight: '900', color: COLORS.secondary },
  old: { fontSize: 12, color: COLORS.textLight },
  emi: { fontSize: 11, color: COLORS.primaryText, fontWeight: '700' },
});
