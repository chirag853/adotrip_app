import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';
import { PrimaryBtn } from '../components/UI';

export default function ConfirmScreen({ navigation, route }) {
  const { type = 'Booking', title = '', price = 0, meta = '' } = route.params || {};
  const id = 'ADO' + Math.floor(100000 + Math.random() * 900000);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, padding: 20, justifyContent: 'center' }} edges={['top']}>
      <View style={s.card}>
        <Text style={{ fontSize: 64, textAlign: 'center' }}>✅</Text>
        <Text style={s.t}>Booking Confirmed!</Text>
        <Text style={s.s}>{type} booking successful — details have been sent via email & SMS.</Text>
        <View style={s.box}>
          <Text style={s.bk}>Booking ID: {id}</Text>
          <Text style={s.tt}>{title}</Text>
          <Text style={s.mm}>{meta}</Text>
          <Text style={s.pp}>Paid: ₹{price.toLocaleString('en-IN')}</Text>
        </View>
        <PrimaryBtn title="View My Bookings" icon="briefcase-outline" onPress={() => navigation.navigate('Main', { screen: 'Bookings' })} />
        <TouchableOpacity style={s.home} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <Text style={s.homeT}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 22 },
  t: { fontSize: 22, fontWeight: '900', color: COLORS.secondary, textAlign: 'center', marginTop: 8 },
  s: { color: COLORS.textLight, textAlign: 'center', marginTop: 6, fontSize: 13 },
  box: { backgroundColor: COLORS.bg, borderRadius: 12, padding: 14, marginVertical: 16, borderWidth: 1, borderColor: COLORS.border },
  bk: { fontWeight: '800', color: COLORS.primaryText },
  tt: { fontWeight: '800', color: COLORS.secondary, marginTop: 6 },
  mm: { color: COLORS.textLight, fontSize: 12, marginTop: 2 },
  pp: { fontWeight: '900', color: COLORS.success, marginTop: 8, fontSize: 16 },
  home: { alignItems: 'center', marginTop: 12 },
  homeT: { color: COLORS.primaryText, fontWeight: '700' },
});
