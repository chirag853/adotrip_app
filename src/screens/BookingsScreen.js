import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';

const DEMO = [
  { id: 'ADO882341', type: '✈️ Flight', title: 'Delhi → Mumbai • IndiGo', date: '12 Oct 2026', status: 'Confirmed', color: '#16A34A' },
  { id: 'ADO771209', type: '🏨 Hotel', title: 'Hotel Savera, Goa • 2N', date: '20 Oct 2026', status: 'Confirmed', color: '#16A34A' },
  { id: 'ADO650123', type: '🏖️ Holiday', title: 'Kerala 4N/5D Package', date: '05 Nov 2026', status: 'Upcoming', color: '#B89B00' },
];

export default function BookingsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <Text style={s.headT}>🧳 My Bookings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Support')}><Ionicons name="help-circle-outline" size={22} color="#fff" /></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 16 }}>
        {DEMO.map((b) => (
          <View key={b.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.type}>{b.type}</Text>
              <Text style={[s.st, { color: b.color }]}>● {b.status}</Text>
            </View>
            <Text style={s.title}>{b.title}</Text>
            <Text style={s.meta}>{b.id} • {b.date}</Text>
            <View style={s.row}>
              <TouchableOpacity style={s.btnO}><Text style={s.btnOT}>Download Ticket</Text></TouchableOpacity>
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Support')}><Text style={s.btnT}>Need Help?</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={s.new} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <Text style={s.newT}>+ Book New Trip ✈️</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 17 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, ...SHADOW },
  type: { fontWeight: '800', color: COLORS.secondary },
  st: { fontWeight: '800', fontSize: 12 },
  title: { fontWeight: '700', marginTop: 6, fontSize: 14 },
  meta: { color: COLORS.textLight, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnO: { flex: 1, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 10, padding: 10, alignItems: 'center' },
  btnOT: { color: COLORS.primaryText, fontWeight: '800' },
  btn: { flex: 1, backgroundColor: COLORS.secondary, borderRadius: 10, padding: 10, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '800' },
  new: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  newT: { color: COLORS.onPrimary, fontWeight: '800' },
});
