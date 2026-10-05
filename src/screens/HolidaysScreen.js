import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';
import { SectionHeader, Chip, Rating, CoverImg, ScreenHeader, TabGap } from '../components/UI';
import { PACKAGES } from '../data/appData';

const FILTERS = ['All', 'Domestic', 'International', 'Honeymoon', 'Beach', 'Hill Station', 'Family'];

export default function HolidaysScreen({ navigation }) {
  const [f, setF] = useState('All');
  const list = f === 'All' ? PACKAGES : PACKAGES.filter((p) => p.tag === f || p.location.includes(f) || (f === 'Domestic' && p.tag !== 'International') || (f === 'International' && p.tag === 'International'));
  const show = list.length ? list : PACKAGES;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title="🏖️ Holiday Packages" onBack={() => { try { navigation.goBack(); } catch {} }} right={<TouchableOpacity onPress={() => navigation.navigate('Circuit')}><Ionicons name="sparkles-outline" size={22} color="#FEE400" /></TouchableOpacity>} />
      <ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {FILTERS.map((x) => <Chip key={x} label={x} active={f === x} onPress={() => setF(x)} />)}
        </ScrollView>
        <SectionHeader title="Budget Tour Packages" subtitle={`${show.length} packages • EMI available`} />
        {show.map((p) => (
          <TouchableOpacity key={p.id} style={s.card} onPress={() => navigation.navigate('HolidayDetail', { item: p })}>
            <View style={s.img}>
              <CoverImg hotel={p} height={150} emojiSize={52} />
              <View style={s.tag}><Text style={s.tagT}>{p.days} • {p.tag}</Text></View>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={s.title}>{p.title}</Text>
              <Text style={s.loc}>📍 {p.location}</Text>
              <View style={{ marginVertical: 6 }}><Rating value={p.rating} reviews={p.reviews} /></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.price}>₹{p.price.toLocaleString('en-IN')} <Text style={s.old}>₹{p.oldPrice.toLocaleString('en-IN')}</Text></Text>
                <Text style={s.view}>Details →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TabGap />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', ...SHADOW },
  img: { height: 150, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagT: { color: '#fff', fontSize: 11, fontWeight: '800' },
  title: { fontWeight: '800', color: COLORS.secondary, fontSize: 15 },
  loc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  price: { fontWeight: '900', color: COLORS.secondary, fontSize: 16 },
  old: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through', fontWeight: '400' },
  view: { color: COLORS.primaryText, fontWeight: '800' },
});
