import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme';
import { ScreenHeader } from '../components/UI';
import { BUSES } from '../data/appData';

export default function BusListScreen({ navigation, route }) {
  const { from = 'Delhi', to = 'Jaipur', date = '12 Oct 2026' } = route.params || {};
  const [seat, setSeat] = useState(null);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title={`${from} → ${to}`} subtitle={`${date} • ${BUSES.length} buses found`} onBack={() => navigation.goBack()} />
      <ScrollView style={{ padding: 16 }}>
        {BUSES.map((b) => (
          <View key={b.id} style={s.card}>
            <Text style={s.op}>{b.operator}</Text>
            <Text style={s.rt}>★ {b.rating} • A/C Sleeper • {b.seats} seats left</Text>
            <View style={s.times}>
              <Text style={s.t}>{b.dep}</Text>
              <Text style={s.d}>— {b.dur} —</Text>
              <Text style={s.t}>{b.arr}</Text>
            </View>
            <Text style={s.seatLbl}>Select Seat:</Text>
            <View style={s.seats}>
              {['A1', 'A2', 'A3', 'B1', 'B2', 'B3'].map((sn) => (
                <TouchableOpacity key={sn} style={[s.st, seat === b.id + sn && s.stOn]} onPress={() => setSeat(b.id + sn)}>
                  <Text style={[s.stT, seat === b.id + sn && { color: COLORS.onPrimary }]}>{sn}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.bottom}>
              <Text style={s.price}>₹{b.price}</Text>
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout', { type: 'Bus', title: `${b.operator} • ${from} → ${to}`, price: b.price, meta: `${b.dep} - ${b.arr} • Seat ${seat || 'A1'}` })}>
                <Text style={s.btnT}>Book Seat</Text>
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
  op: { fontWeight: '800', color: COLORS.secondary, fontSize: 14 },
  rt: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  t: { fontSize: 17, fontWeight: '900', color: COLORS.secondary },
  d: { color: COLORS.textLight, fontSize: 12 },
  seatLbl: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },
  seats: { flexDirection: 'row', gap: 8, marginTop: 6 },
  st: { width: 40, height: 36, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  stOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  stT: { fontWeight: '700', fontSize: 12, color: COLORS.text },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 },
  price: { fontSize: 19, fontWeight: '900', color: COLORS.secondary },
  btn: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  btnT: { color: COLORS.onPrimary, fontWeight: '800' },
});
