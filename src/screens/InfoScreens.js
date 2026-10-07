import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdoLogo from '../components/AdoLogo';
import { ScreenHeader } from '../components/UI';
import { COLORS } from '../theme';

function Page({ navigation, title, emoji, children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title={`${emoji} ${title}`} onBack={() => navigation.goBack()} />
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
        <Text style={s.p}>Adotrip is a smart, integrated travel tech platform — flights, hotels, buses, holidays, visa, currency exchange, travel insurance and web check-in, all in one place.</Text>
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
        <View style={s.cta}><Text style={s.ctaT}>Say “May I Help You” on chat — we reply instantly 🙋</Text></View>
      </View>
    </Page>
  );
}

export function SupportScreen({ navigation }) {
  const faqs = [
    ['Where can I find flight/hotel offers?', 'Go to Home → Exclusive Offers. Apply the code at checkout.'],
    ['How many days does a refund take?', '5-7 working days to your source account.'],
    ['Is EMI available?', 'Yes, No-Cost EMI on major credit cards.'],
    ['How do I do Web Check-In?', 'Go to the Flights page → Web Check-In banner → enter your PNR.'],
    ['What is the Circuit Planner?', 'An AI tool that builds a day-wise itinerary — try it in the Circuit tab.'],
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
        <Text style={s.p}>• Terms of Use: Fair usage, transparent fares.{'\n'}• Privacy: Data is encrypted and never sold.{'\n'}• Cancellation: Every booking shows its policy before checkout.</Text>
      </View>
    </Page>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  h: { fontWeight: '900', color: COLORS.secondary, fontSize: 15, marginTop: 14 },
  p: { color: '#4B5563', fontSize: 13, lineHeight: 20, marginTop: 6 },
  faq: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, marginTop: 8 },
  q: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  cta: { backgroundColor: COLORS.sky, borderRadius: 10, padding: 12, marginTop: 12 },
  ctaT: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
});
