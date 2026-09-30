import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';
import { VISA_COUNTRIES } from '../data/appData';

export default function VisaScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headT}>🛂 Visa Services</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={{ padding: 16 }}>
        <View style={s.banner}>
          <Text style={s.bannerT}>Apply for Visa Online — Hassle Free ✈️</Text>
          <Text style={s.bannerS}>Documents pickup • Expert review • 99% approval</Text>
        </View>
        {VISA_COUNTRIES.map((v) => (
          <View key={v.id} style={s.card}>
            <View style={[s.flag, { backgroundColor: v.color }]}><Text style={{ fontSize: 30 }}>{v.emoji}</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.c}>{v.country} Tourist Visa</Text>
              <Text style={s.d}>⏱️ {v.days} • 📄 {v.validity}</Text>
              <Text style={s.p}>₹{v.price.toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout', { type: 'Visa', title: `${v.country} Tourist Visa`, price: v.price, meta: v.validity })}>
              <Text style={s.btnT}>Apply</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 17 },
  banner: { backgroundColor: COLORS.secondary, borderRadius: 14, padding: 16, marginBottom: 12 },
  bannerT: { color: '#fff', fontWeight: '900', fontSize: 15 },
  bannerS: { color: '#B9C4D6', fontSize: 12, marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, ...SHADOW },
  flag: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  c: { fontWeight: '800', color: COLORS.secondary, fontSize: 14 },
  d: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  p: { fontWeight: '900', color: COLORS.secondary, fontSize: 15, marginTop: 4 },
  btn: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  btnT: { color: COLORS.onPrimary, fontWeight: '800' },
});
