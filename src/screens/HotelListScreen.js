import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';
import { Rating } from '../components/UI';
import { HOTELS } from '../data/appData';

export default function HotelListScreen({ navigation, route }) {
  const city = route.params?.city || 'Goa';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.headT}>Hotels in {city}</Text>
          <Text style={s.headS}>12 - 14 Oct • 2 Guests • {HOTELS.length * 37} properties</Text>
        </View>
      </View>
      <ScrollView style={{ padding: 16 }}>
        {HOTELS.map((h) => (
          <TouchableOpacity key={h.id} style={s.card} onPress={() => navigation.navigate('HotelDetail', { item: h })}>
            <View style={[s.img, { backgroundColor: h.color }]}><Text style={{ fontSize: 44 }}>{h.emoji}</Text></View>
            <View style={{ padding: 12 }}>
              <Text style={s.tag}>{h.tag}</Text>
              <Text style={s.name}>{h.name}</Text>
              <Text style={s.loc}>📍 {h.location}</Text>
              <View style={{ marginVertical: 6 }}><Rating value={h.rating} reviews={h.reviews} /></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={s.price}>₹{h.price.toLocaleString('en-IN')}<Text style={s.per}> /night</Text> <Text style={s.old}>₹{h.oldPrice.toLocaleString('en-IN')}</Text></Text>
                <Text style={s.view}>View →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 16 },
  headS: { color: '#B9C4D6', fontSize: 11 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', ...SHADOW },
  img: { height: 130, alignItems: 'center', justifyContent: 'center' },
  tag: { color: COLORS.primaryText, fontWeight: '800', fontSize: 11 },
  name: { fontWeight: '800', color: COLORS.secondary, fontSize: 15, marginTop: 2 },
  loc: { fontSize: 12, color: COLORS.textLight },
  price: { fontWeight: '900', color: COLORS.secondary, fontSize: 16 },
  per: { fontSize: 11, color: COLORS.textLight, fontWeight: '400' },
  old: { fontSize: 11, color: COLORS.textLight, textDecorationLine: 'line-through', fontWeight: '400' },
  view: { color: COLORS.primaryText, fontWeight: '800' },
});
