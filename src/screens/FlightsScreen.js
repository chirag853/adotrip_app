import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, Chip, PrimaryBtn } from '../components/UI';
import { COLORS } from '../theme';
import { CITIES } from '../data/appData';

export default function FlightsScreen({ navigation, route }) {
  const [from, setFrom] = useState(route.params?.from || 'Delhi');
  const [to, setTo] = useState(route.params?.to || 'Mumbai');
  const [trip, setTrip] = useState('Round Trip');
  const [date, setDate] = useState('12 Oct 2026');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headT}>✈️ Flight Booking</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {['One Way', 'Round Trip'].map((t) => (
            <Chip key={t} label={t} active={trip === t} onPress={() => setTrip(t)} />
          ))}
        </View>
        <View style={s.card}>
          <Field label="From" value={from} onChangeText={setFrom} placeholder="Delhi" icon="airplane-outline" />
          <TouchableOpacity style={s.swap} onPress={() => { setFrom(to); setTo(from); }}>
            <Ionicons name="swap-vertical" size={18} color={COLORS.primaryText} />
          </TouchableOpacity>
          <Field label="To" value={to} onChangeText={setTo} placeholder="Mumbai" icon="location-outline" />
          <Field label="Departure Date" value={date} onChangeText={setDate} placeholder="12 Oct 2026" icon="calendar-outline" />
          <Text style={s.lbl}>Popular Cities</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CITIES.slice(0, 6).map((c) => (
              <TouchableOpacity key={c} style={s.city} onPress={() => setTo(c)}><Text style={s.cityT}>{c}</Text></TouchableOpacity>
            ))}
          </View>
          <PrimaryBtn title="Search Flights" icon="search" onPress={() => navigation.navigate('FlightResults', { from, to, date })} />
          <TouchableOpacity style={s.checkin} onPress={() => navigation.navigate('Support')}>
            <Text style={s.checkinT}>🎫 Web Check-In — Free & Easy →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 17 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  lbl: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginBottom: 8, marginTop: 4 },
  city: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  cityT: { fontSize: 12, fontWeight: '600' },
  swap: { alignSelf: 'center', width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF9C4', borderWidth: 1, borderColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center', marginVertical: -4, zIndex: 2 },
  checkin: { marginTop: 12, backgroundColor: COLORS.sky, borderRadius: 10, padding: 12, alignItems: 'center' },
  checkinT: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
});
