import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';
import { Chip, ScreenHeader, TabGap } from '../components/UI';
import { OFFERS } from '../data/appData';

export default function OffersScreen({ navigation }) {
  const [f, setF] = useState('All Offers');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title="🎁 Exclusive Offers" onBack={() => { try { navigation.goBack(); } catch {} }} />
      <ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {['All Offers', 'Flights', 'Hotels', 'Holiday'].map((x) => <Chip key={x} label={x} active={f === x} onPress={() => setF(x)} />)}
        </ScrollView>
        {OFFERS.map((o, i) => (
          <View key={o.id} style={[s.card, { backgroundColor: o.color }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>{o.emoji}</Text>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={s.t}>{o.title}</Text>
                <Text style={s.sub}>{o.subtitle}</Text>
              </View>
              <Text style={s.off}>{i === 0 ? '30%' : i === 1 ? '50%' : '20%'}</Text>
            </View>
            <View style={s.codeRow}>
              <Text style={s.code}>Code: {o.code}</Text>
              <TouchableOpacity style={s.copy}><Text style={s.copyT}>Copy Code</Text></TouchableOpacity>
            </View>
            <Text style={s.valid}>Valid till 31 Dec 2026 • T&C apply</Text>
          </View>
        ))}
        <TabGap />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 16 },
  t: { color: '#fff', fontWeight: '900', fontSize: 18 },
  sub: { color: '#fff', opacity: 0.85, fontSize: 13 },
  off: { color: '#FEE400', fontWeight: '900', fontSize: 22 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
  code: { color: '#fff', fontWeight: '800' },
  copy: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  copyT: { fontWeight: '800', fontSize: 12, color: COLORS.secondary },
  valid: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 8 },
});
