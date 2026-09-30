import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AdoLogo from '../components/AdoLogo';
import { COLORS } from '../theme';

function Page({ navigation, title, emoji, children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headT}>{emoji} {title}</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={{ padding: 16 }}>{children}<View style={{ height: 20 }} /></ScrollView>
    </SafeAreaView>
  );
}

export function AboutScreen({ navigation }) {
  return (
    <Page navigation={navigation} title="About Us" emoji="ℹ️">
      <View style={s.card}>
        <AdoLogo showTagline />
        <Text style={s.h}>India's Leading Online Travel Platform Since 2018</Text>
        <Text style={s.p}>Adotrip ek smart, integrated travel tech platform hai — flights, hotels, buses, holidays, visa, currency exchange, travel insurance aur web check-in sab ek jagah.</Text>
        <Text style={s.h}>Our Services</Text>
        <Text style={s.p}>✈️ Flights — 100+ airlines, best fares{'\n'}🏨 Hotels — 50,000+ properties{'\n'}🚌 Buses — Volvo, Sleeper, Seater{'\n'}🏖️ Holidays — Domestic + International{'\n'}🛂 Visa — 99% approval rate{'\n'}✨ AI Circuit Planner — Free itinerary tool</Text>
        <Text style={s.h}>Why 2M+ Travellers Trust Us</Text>
        <Text style={s.p}>• Transparent pricing, no hidden charges{'\n'}• 24x7 support{'\n'}• Best price guarantee{'\n'}• Easy cancellation & quick refunds</Text>
      </View>
    </Page>
  );
}

export function ContactScreen({ navigation }) {
  return (
    <Page navigation={navigation} title="Contact Us" emoji="📞">
      <View style={s.card}>
        <Text style={s.h}>24x7 Customer Support</Text>
        <Text style={s.p}>📞 Helpline: 1800-123-4567 (Toll Free){'\n'}📧 Email: support@adotrip.app{'\n'}💬 WhatsApp: +91 98765 43210{'\n'}📍 Address: Connaught Place, New Delhi 110001</Text>
        <Text style={s.h}>Business Queries</Text>
        <Text style={s.p}>🤝 B2B: partners@adotrip.app{'\n'}📢 Ads & Hiring: careers@adotrip.app</Text>
        <View style={s.cta}><Text style={s.ctaT}>Chat par “May I Help You” — hum turant reply karte hain 🙋</Text></View>
      </View>
    </Page>
  );
}

export function SupportScreen({ navigation }) {
  const faqs = [
    ['Flight/hotel offers kahan milenge?', 'Home → Exclusive Offers me. Code checkout par apply karein.'],
    ['Refund kitne din me aata hai?', '5-7 working days me source account me.'],
    ['EMI available hai?', 'Haan, major credit cards par No-Cost EMI.'],
    ['Web Check-In kaise karein?', 'Flights page → Web Check-In banner → PNR daalein.'],
    ['Circuit Planner kya hai?', 'AI tool jo day-wise itinerary banata hai — Circuit tab me try karein.'],
  ];
  return (
    <Page navigation={navigation} title="Help & Support" emoji="🎧">
      <View style={s.card}>
        <Text style={s.h}>Frequently Asked Questions</Text>
        {faqs.map((f, i) => (
          <View key={i} style={s.faq}>
            <Text style={s.q}>Q. {f[0]}</Text>
            <Text style={s.p}>{f[1]}</Text>
          </View>
        ))}
        <Text style={s.h}>Policies</Text>
        <Text style={s.p}>• Terms of Use: Fair usage, transparent fares.{'\n'}• Privacy: Data encrypted, kabhi sell nahi hota.{'\n'}• Cancellation: Har booking par policy checkout se pehle dikhti hai.</Text>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  h: { fontWeight: '900', color: COLORS.secondary, fontSize: 15, marginTop: 14 },
  p: { color: '#4B5563', fontSize: 13, lineHeight: 20, marginTop: 6 },
  faq: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, marginTop: 8 },
  q: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  cta: { backgroundColor: COLORS.sky, borderRadius: 10, padding: 12, marginTop: 12 },
  ctaT: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
});
