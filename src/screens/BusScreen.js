import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, PrimaryBtn, ScreenHeader } from '../components/UI';
import { COLORS } from '../theme';

export default function BusScreen({ navigation }) {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Jaipur');
  const [date, setDate] = useState('12 Oct 2026');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title="🚌 Bus Booking" onBack={() => navigation.goBack()} />
      <ScrollView style={{ padding: 16 }}>
        <View style={s.card}>
          <Field label="From" value={from} onChangeText={setFrom} icon="location-outline" />
          <Field label="To" value={to} onChangeText={setTo} icon="navigate-outline" />
          <Field label="Travel Date" value={date} onChangeText={setDate} icon="calendar-outline" />
          <PrimaryBtn title="Search Buses" icon="search" onPress={() => navigation.navigate('BusList', { from, to, date })} />
        </View>
        <View style={s.note}><Text style={s.noteT}>🎉 BUS2000 code se up to ₹2000 OFF on A/C Sleeper buses</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  note: { backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#C4B5FD' },
  noteT: { color: '#5B21B6', fontWeight: '600', fontSize: 13 },
});
