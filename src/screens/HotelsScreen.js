import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, PrimaryBtn } from '../components/UI';
import { COLORS } from '../theme';

export default function HotelsScreen({ navigation }) {
  const [city, setCity] = useState('Goa');
  const [checkin, setCheckin] = useState('12 Oct 2026');
  const [checkout, setCheckout] = useState('14 Oct 2026');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.head}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <Text style={s.headT}>🏨 Hotel Booking</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={{ padding: 16 }}>
        <View style={s.card}>
          <Field label="Destination City" value={city} onChangeText={setCity} placeholder="Goa" icon="location-outline" />
          <Field label="Check-In Date" value={checkin} onChangeText={setCheckin} icon="calendar-outline" />
          <Field label="Check-Out Date" value={checkout} onChangeText={setCheckout} icon="calendar-outline" />
          <Field label="Guests & Rooms" value="2 Guests • 1 Room" placeholder="Guests" icon="people-outline" />
          <PrimaryBtn title="Search Hotels" icon="search" onPress={() => navigation.navigate('HotelList', { city })} />
        </View>
        <View style={s.note}>
          <Text style={s.noteT}>💡 Tip: HOTEL20 code se Flat 20% OFF — sirf app par!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headT: { color: '#fff', fontWeight: '900', fontSize: 17 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  note: { backgroundColor: '#FFFDE7', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#FDE047' },
  noteT: { color: '#713F12', fontWeight: '600', fontSize: 13 },
});
