import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, PrimaryBtn, Chip, ScreenHeader } from '../components/UI';
import { COLORS } from '../theme';

const METHODS = ['UPI', 'Credit Card', 'Debit Card', 'NetBanking'];
const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'];

function formatCardNum(v) {
  return String(v || '')
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export default function CheckoutScreen({ navigation, route }) {
  const { type = 'Flight', title = 'Booking', price = 4999, meta = '' } = route.params || {};
  const [name, setName] = useState('Chirag');
  const [phone, setPhone] = useState('98765 43210');
  const [code, setCode] = useState('HOLIDAY50');
  const [pay, setPay] = useState('UPI');
  // Method-wise details
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bank, setBank] = useState('HDFC');
  const [err, setErr] = useState('');

  const discount = 500;
  const total = Math.max(0, price - discount);

  const switchMethod = (m) => {
    setPay(m);
    setErr('');
  };

  function validate() {
    if (!name.trim()) return 'Please enter your full name.';
    if (String(phone).replace(/\D/g, '').length < 10) return 'Please enter a valid 10-digit mobile number.';
    if (pay === 'UPI') {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) return 'Please enter a valid UPI ID (e.g. name@okhdfc).';
    } else if (pay === 'Credit Card' || pay === 'Debit Card') {
      if (cardNum.replace(/\D/g, '').length !== 16) return 'Please enter the 16-digit card number.';
      if (!cardName.trim()) return 'Please enter the name on the card.';
      const m = cardExp.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!m) return 'Please enter expiry as MM/YY.';
      const yy = 2000 + parseInt(m[2], 10);
      const mm = parseInt(m[1], 10);
      const now = new Date();
      if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1))
        return 'This card has expired.';
      if (!/^\d{3,4}$/.test(cardCvv)) return 'Please enter a valid CVV.';
    } else if (pay === 'NetBanking') {
      if (!bank) return 'Please select your bank.';
    }
    return '';
  }

  // Receipt ke liye masked detail (CVV kabhi aage nahi jayegi)
  function payMeta() {
    if (pay === 'UPI') return `${pay} • ${upiId.trim()}`;
    if (pay === 'Credit Card' || pay === 'Debit Card')
      return `${pay} •••• ${cardNum.replace(/\D/g, '').slice(-4)}`;
    return `NetBanking • ${bank}`;
  }

  const onPay = () => {
    const e = validate();
    if (e) {
      setErr(e);
      return;
    }
    setErr('');
    navigation.navigate('Confirm', { type, title, price: total, meta: `${meta} • ${payMeta()}` });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title={`💳 Checkout — ${type}`} onBack={() => navigation.goBack()} />
      <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
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
          <Field label="Full Name" value={name} onChangeText={(v) => { setName(v); setErr(''); }} icon="person-outline" />
          <Field label="Mobile Number" value={phone} onChangeText={(v) => { setPhone(v); setErr(''); }} keyboardType="phone-pad" icon="call-outline" />
          <Field label="Promo Code" value={code} onChangeText={setCode} icon="pricetag-outline" />
        </View>
        <View style={s.card}>
          <Text style={s.sec}>Payment Method</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {METHODS.map((m) => <Chip key={m} label={m} active={pay === m} onPress={() => switchMethod(m)} />)}
          </View>

          {/* Method ke hisab se details */}
          {pay === 'UPI' && (
            <View style={s.sub}>
              <Field label="UPI ID" value={upiId} onChangeText={(v) => { setUpiId(v); setErr(''); }} placeholder="name@okhdfc" icon="phone-portrait-outline" />
              <Text style={s.note}>📲 Tapping Pay will send a collect request to your UPI app.</Text>
            </View>
          )}

          {(pay === 'Credit Card' || pay === 'Debit Card') && (
            <View style={s.sub}>
              <Field label={`${pay} Number`} value={cardNum} onChangeText={(v) => { setCardNum(formatCardNum(v)); setErr(''); }} placeholder="1234 5678 9012 3456" keyboardType="number-pad" icon="card-outline" />
              <Field label="Name on Card" value={cardName} onChangeText={(v) => { setCardName(v); setErr(''); }} placeholder="CHIRAG" icon="person-outline" />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Expiry (MM/YY)" value={cardExp} onChangeText={(v) => { setCardExp(formatExpiry(v)); setErr(''); }} placeholder="08/28" keyboardType="number-pad" icon="calendar-outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="CVV" value={cardCvv} onChangeText={(v) => { setCardCvv(v.replace(/\D/g, '').slice(0, 4)); setErr(''); }} placeholder="•••" keyboardType="number-pad" icon="lock-closed-outline" />
                </View>
              </View>
              <Text style={s.note}>🔒 Your CVV goes only to the bank and is never saved.</Text>
            </View>
          )}

          {pay === 'NetBanking' && (
            <View style={s.sub}>
              <Text style={s.lbl}>Choose your bank</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {BANKS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => { setBank(b); setErr(''); }}
                    style={[s.bank, bank === b && s.bankActive]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="business-outline" size={16} color={bank === b ? COLORS.onPrimary : COLORS.secondary} />
                    <Text style={[s.bankT, bank === b && { color: COLORS.onPrimary }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.note}>🏦 Tapping Pay will open the {bank} secure page.</Text>
            </View>
          )}

          {!!err && (
            <View style={s.errBox}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
              <Text style={s.errT}>{err}</Text>
            </View>
          )}
          <Text style={s.note}>🔒 100% Safe payments • No-Cost EMI • Instant confirmation</Text>
          <PrimaryBtn title={`Pay ₹${total.toLocaleString('en-IN')} • ${pay}`} icon="lock-closed" onPress={onPay} />
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
  sub: { marginTop: 12, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 12 },
  lbl: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginBottom: 8 },
  bank: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  bankActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  bankT: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  errBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 10, marginTop: 10 },
  errT: { flex: 1, fontSize: 12, color: COLORS.danger, fontWeight: '700' },
  note: { fontSize: 11, color: COLORS.textLight, marginVertical: 10, textAlign: 'center' },
});
