import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const ITEMS = [
  { t: 'My Bookings', i: 'briefcase-outline', r: 'Bookings' },
  { t: 'Offers & Coupons', i: 'pricetags-outline', r: 'Offers' },
  { t: 'AI Circuit Planner', i: 'sparkles-outline', r: 'Circuit' },
  { t: 'Travel Blog', i: 'newspaper-outline', r: 'Blog' },
  { t: 'About Us', i: 'information-circle-outline', r: 'About' },
  { t: 'Contact Us', i: 'call-outline', r: 'Contact' },
  { t: 'Help & Support / FAQ', i: 'help-circle-outline', r: 'Support' },
];

export default function AccountScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.hero}>
        <View style={s.av}><Text style={{ fontSize: 34 }}>🧳</Text></View>
        <Text style={s.name}>Namaste, Traveller 🙏</Text>
        <Text style={s.sub}>traveller@adotrip.app • Join deals & track trips</Text>
        <TouchableOpacity style={s.login} onPress={() => navigation.navigate('Auth')}><Text style={s.loginT}>Login / Signup</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 16 }}>
        {ITEMS.map((x) => (
          <TouchableOpacity key={x.t} style={s.row} onPress={() => navigation.navigate(x.r === 'Bookings' ? 'Main' : x.r, x.r === 'Bookings' ? { screen: 'Bookings' } : undefined)}>
            <Ionicons name={x.i} size={20} color={COLORS.primaryText} />
            <Text style={s.rowT}>{x.t}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
        <View style={s.app}>
          <Text style={s.appT}>📱 Adotrip App v1.0.0</Text>
          <Text style={s.appS}>Flights • Hotels • Bus • Holidays • Visa{'\n'}Made inspired by adotrip.com</Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  hero: { backgroundColor: COLORS.secondary, alignItems: 'center', padding: 22, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  av: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 10 },
  sub: { color: '#B9C4D6', fontSize: 12, marginTop: 4 },
  login: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 9, marginTop: 12 },
  loginT: { color: COLORS.onPrimary, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  rowT: { flex: 1, marginLeft: 12, fontWeight: '700', color: COLORS.secondary },
  app: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  appT: { fontWeight: '800', color: COLORS.secondary },
  appS: { color: COLORS.textLight, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
