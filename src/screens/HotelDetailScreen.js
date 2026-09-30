import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { Rating, PrimaryBtn } from '../components/UI';

export default function HotelDetailScreen({ navigation, route }) {
  const h = route.params?.item || { name: 'Hotel Savera', location: 'Goa', price: 3499, oldPrice: 5999, rating: 4.3, reviews: 2100, emoji: '🏨', color: '#0284C7', tag: 'Couple Friendly' };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={[s.hero, { backgroundColor: h.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
        <Text style={{ fontSize: 72 }}>{h.emoji}</Text>
        <Text style={s.tag}>{h.tag}</Text>
      </View>
      <ScrollView style={{ padding: 16 }}>
        <Text style={s.name}>{h.name}</Text>
        <Text style={s.loc}>📍 {h.location}</Text>
        <View style={{ marginVertical: 8 }}><Rating value={h.rating} reviews={h.reviews} /></View>
        <View style={s.fac}>
          {['Free WiFi', 'Pool', 'Breakfast', 'Parking', 'Spa', 'Beach View'].map((f) => (
            <View key={f} style={s.pill}><Text style={s.pillT}>✓ {f}</Text></View>
          ))}
        </View>
        <Text style={s.sec}>About this property</Text>
        <Text style={s.desc}>Premium rooms, 24x7 room service, multi-cuisine restaurant aur family-friendly stay. Adotrip price guarantee ke sath best deal — free cancellation 48 hrs pehle tak.</Text>
        <View style={s.priceBox}>
          <View>
            <Text style={s.price}>₹{h.price.toLocaleString('en-IN')}<Text style={s.per}> /night</Text></Text>
            <Text style={s.old}>₹{h.oldPrice?.toLocaleString('en-IN')} • + taxes</Text>
          </View>
          <Text style={s.off}>40% OFF</Text>
        </View>
        <PrimaryBtn title="Book This Hotel" icon="bed-outline" onPress={() => navigation.navigate('Checkout', { type: 'Hotel', title: h.name, price: h.price, meta: h.location })} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  hero: { height: 220, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  tag: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8, fontWeight: '700', fontSize: 12 },
  name: { fontSize: 20, fontWeight: '900', color: COLORS.secondary },
  loc: { color: COLORS.textLight, marginTop: 4 },
  fac: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  pill: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  pillT: { fontSize: 12, fontWeight: '600' },
  sec: { fontWeight: '800', color: COLORS.secondary, marginTop: 8, fontSize: 15 },
  desc: { color: COLORS.textLight, fontSize: 13, marginTop: 6, lineHeight: 19 },
  priceBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  price: { fontSize: 20, fontWeight: '900', color: COLORS.secondary },
  per: { fontSize: 12, color: COLORS.textLight, fontWeight: '400' },
  old: { fontSize: 12, color: COLORS.textLight },
  off: { color: COLORS.success, fontWeight: '900' },
});
