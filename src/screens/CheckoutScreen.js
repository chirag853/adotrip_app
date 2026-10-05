import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, PrimaryBtn, Chip, ScreenHeader } from '../components/UI';
import { COLORS } from '../theme';

export default function CheckoutScreen({ navigation, route }) {
  const { type = 'Flight', title = 'Booking', price = 4999, meta = '' } = route.params || {};
  const [name, setName] = useState('Chirag');
  const [phone, setPhone] = useState('98765 43210');
  const [code, setCode] = useState('HOLIDAY50');
  const [pay, setPay] = useState('UPI');
  const discount = 500;
  const total = Math.max(0, price - discount);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title={`💳 Checkout — ${type}`} onBack={() => navigation.goBack()} />
      <ScrollView style={{ padding: 16 }}>
        <View style={s.card}>
          <Text style={s.t}>{title}</Text>
          <Text style={s.m}>{meta}</Text>
          <View style={s.row}><Text style={s.k}>Base Fare</Text><Text style={s.v}>₹{price.toLocaleString('en-IN')}</Text></View>
          <View style={s.row}><Text style={s.k}>Promo ({code})</Text><Text style={[s.v, { color: COLORS.success }]}>- ₹{discount}</Text></View>
          <View style={s.row}><Text style={s.k}>Taxes & Fees</Text><Text style={s.v}>Included</Text></View>
          <View style={[s.row, s.total]}><Text style={s.kB}>Total Payable</Text><Text style={s.vB}>₹{total.toLocaleString('en-IN')}</Text></View>
        </View>
        <View style={s.card}>
          <Text style={s.sec}>Traveller Details</Text>
          <Field label="Full Name" value={name} onChangeText={setName} icon="person-outline" />
          <Field label="Mobile Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />
          <Field label="Promo Code" value={code} onChangeText={setCode} icon="pricetag-outline" />
        </View>
        <View style={s.card}>
          <Text style={s.sec}>Payment Method</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {['UPI', 'Card', 'NetBanking', 'EMI'].map((m) => <Chip key={m} label={m} active={pay === m} onPress={() => setPay(m)} />)}
          </View>
          <Text style={s.note}>🔒 100% Safe payments • No-Cost EMI • Instant confirmation</Text>
          <PrimaryBtn title={`Pay ₹${total.toLocaleString('en-IN')} • ${pay}`} icon="lock-closed" onPress={() => navigation.navigate('Confirm', { type, title, price: total, meta: `${meta} • ${pay}` })} />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  t: { fontWeight: '900', color: COLORS.secondary, fontSize: 15 },
  m: { color: COLORS.textLight, fontSize: 12, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  k: { color: COLORS.textLight, fontSize: 13 },
  v: { fontWeight: '700', fontSize: 13 },
  total: { borderTopWidth: 1, borderColor: COLORS.border, marginTop: 6, paddingTop: 10 },
  kB: { fontWeight: '900', color: COLORS.secondary },
  vB: { fontWeight: '900', color: COLORS.secondary, fontSize: 17 },
  sec: { fontWeight: '800', color: COLORS.secondary, fontSize: 15, marginBottom: 10 },
  note: { fontSize: 11, color: COLORS.textLight, marginVertical: 10, textAlign: 'center' },
});
