import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function BlogDetailScreen({ navigation, route }) {
  const b = route.params?.item || { title: 'Travel Guide', cat: 'Guide', read: '5 min', emoji: '🌍', color: '#0284C7', desc: 'Details' };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={[s.hero, { backgroundColor: b.color }]}>
        {b.image ? (
          <Image source={{ uri: b.image }} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 72 }}>{b.emoji}</Text>
        )}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}><Ionicons name="arrow-back" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 18 }}>
        <Text style={s.cat}>{b.cat} • {b.read} • 5747 views</Text>
        <Text style={s.title}>{b.title}</Text>
        <Text style={s.body}>{b.desc}</Text>
        <Text style={s.body}>Adotrip ke travel experts ke according, best time to travel, budget tips, hotel picks aur local experiences — sab kuch plan karke chalein. Flights + Hotels + Packages ek sath book karne par extra 10% OFF milta hai app par.</Text>
        <Text style={s.h}>Top 3 Tips</Text>
        <Text style={s.body}>1. Long weekend par 2-3 mahine pehle booking karein — fares 40% tak kam milte hain.{'\n'}2. Circuit Planner se day-wise itinerary banayein.{'\n'}3. Newsletter subscribe karke exclusive deals payein.</Text>
        <Text style={s.h}>Popular Packages</Text>
        <TouchableOpacity style={s.cta} onPress={() => navigation.navigate('Holidays')}>
          <Text style={s.ctaT}>View Holiday Packages →</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  hero: { height: 200, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  cat: { color: COLORS.primaryText, fontWeight: '800', fontSize: 12 },
  title: { fontSize: 21, fontWeight: '900', color: COLORS.secondary, marginTop: 6 },
  body: { color: '#4B5563', fontSize: 14, lineHeight: 22, marginTop: 12 },
  h: { fontWeight: '900', color: COLORS.secondary, fontSize: 16, marginTop: 16 },
  cta: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: 14, marginTop: 10, alignItems: 'center' },
  ctaT: { color: '#fff', fontWeight: '800' },
});
