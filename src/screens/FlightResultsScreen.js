import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';
import { ScreenHeader } from '../components/UI';
import { FLIGHT_RESULTS } from '../data/appData';

export default function FlightResultsScreen({ navigation, route }) {
  const { from = 'Delhi', to = 'Mumbai', date = '12 Oct 2026' } = route.params || {};
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title={`${from} → ${to}`} subtitle={`${date} • 2 Travellers • Economy`} onBack={() => navigation.goBack()} right={<Ionicons name="filter-outline" size={22} color="#fff" />} />
      <ScrollView style={{ padding: 16 }}>
        {FLIGHT_RESULTS.map((f) => (
          <View key={f.id} style={s.card}>
            {f.tag ? <View style={s.tag}><Text style={s.tagT}>{f.tag}</Text></View> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: f.tag ? 8 : 0 }}>
              <Text style={{ fontSize: 26 }}>✈️</Text>
              <View style={{ marginLeft: 8 }}>
                <Text style={s.air}>{f.airline}</Text>
                <Text style={s.code}>{f.code} • {f.stops}</Text>
              </View>
            </View>
            <View style={s.times}>
              <View><Text style={s.t}>{f.dep}</Text><Text style={s.c}>{from.slice(0, 3).toUpperCase()}</Text></View>
              <View style={s.lineWrap}><Text style={s.dur}>{f.dur}</Text><View style={s.line} /></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.t}>{f.arr}</Text><Text style={s.c}>{to.slice(0, 3).toUpperCase()}</Text></View>
            </View>
            <View style={s.bottom}>
              <Text style={s.price}>₹{f.price.toLocaleString('en-IN')}</Text>
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout', { type: 'Flight', title: `${f.airline} ${from} → ${to}`, price: f.price, meta: `${f.dep} - ${f.arr} • ${f.dur}` })}>
                <Text style={s.btnT}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, ...SHADOW },
  tag: { alignSelf: 'flex-start', backgroundColor: '#E8FDF0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tagT: { color: COLORS.success, fontSize: 10, fontWeight: '800' },
  air: { fontWeight: '800', color: COLORS.secondary },
  code: { fontSize: 11, color: COLORS.textLight },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  t: { fontSize: 18, fontWeight: '900', color: COLORS.secondary },
  c: { fontSize: 11, color: COLORS.textLight },
  dur: { fontSize: 11, color: COLORS.textLight, textAlign: 'center' },
  lineWrap: { flex: 1, marginHorizontal: 12 },
  line: { height: 2, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 4 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 },
  price: { fontSize: 19, fontWeight: '900', color: COLORS.secondary },
  btn: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  btnT: { color: COLORS.onPrimary, fontWeight: '800' },
});
