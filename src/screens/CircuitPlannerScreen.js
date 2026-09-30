import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Field, PrimaryBtn } from '../components/UI';
import { COLORS } from '../theme';

export default function CircuitPlannerScreen({ navigation }) {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Goa');
  const [days, setDays] = useState('4');
  const [plan, setPlan] = useState(null);

  const generate = () => {
    const n = Math.max(2, Math.min(7, parseInt(days) || 4));
    const acts = ['Arrival + local market & sunset point 🌅', 'Main sightseeing + famous food trail 🍛', 'Adventure / beach / nature day 🏖️', 'Shopping + cultural show 🎭', 'Hidden gems + photography tour 📸', 'Day trip to nearby attraction 🚗', 'Leisure + departure 🛬'];
    setPlan(Array.from({ length: n }, (_, i) => ({ d: `Day ${i + 1}`, t: acts[i % acts.length] })));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headT}>✨ AI Circuit Planner</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={{ padding: 16 }}>
        <LinearGradient colors={['#7C3AED', '#0E2A47']} style={s.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={s.bT}>Leave Stress Behind — Plan Effortlessly with AI</Text>
          <Text style={s.bS}>Origin + Destination + Days = Custom travel plan in seconds</Text>
        </LinearGradient>
        <View style={s.card}>
          <Field label="Origin City" value={from} onChangeText={setFrom} icon="flight-takeoff" />
          <Field label="Destination" value={to} onChangeText={setTo} icon="location-outline" />
          <Field label="Trip Days (2-7)" value={days} onChangeText={setDays} keyboardType="numeric" icon="calendar-outline" />
          <PrimaryBtn title="Create My Itinerary" icon="sparkles" onPress={generate} />
        </View>
        {plan ? (
          <View style={s.card}>
            <Text style={s.pTitle}>🗺️ {from} → {to} • {plan.length} Days Plan</Text>
            {plan.map((p) => (
              <View key={p.d} style={s.it}>
                <Text style={s.itD}>{p.d}</Text>
                <Text style={s.itT}>{p.t}</Text>
              </View>
            ))}
            <PrimaryBtn title="Book This Trip" icon="checkmark-circle-outline" onPress={() => navigation.navigate('Holidays')} />
          </View>
        ) : null}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 17 },
  banner: { borderRadius: 14, padding: 16, marginBottom: 12 },
  bT: { color: '#fff', fontWeight: '900', fontSize: 15 },
  bS: { color: '#E9D5FF', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  pTitle: { fontWeight: '900', color: COLORS.secondary, fontSize: 15, marginBottom: 10 },
  it: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  itD: { fontWeight: '800', color: COLORS.primaryText, fontSize: 13 },
  itT: { color: COLORS.text, fontSize: 13, marginTop: 2 },
});
