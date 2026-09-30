import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AdoLogo from '../components/AdoLogo';
import { Field, PrimaryBtn } from '../components/UI';
import { COLORS } from '../theme';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.secondary }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
        <View style={{ alignItems: 'center', marginVertical: 18 }}>
          <View style={s.logoWrap}><AdoLogo showTagline /></View>
          <Text style={s.wel}>Welcome to Adotrip ✈️</Text>
          <Text style={s.sub}>Sign in for faster bookings & exclusive deals</Text>
        </View>
        <View style={s.card}>
          <View style={s.tabs}>
            <TouchableOpacity style={[s.tab, mode === 'signin' && s.tabOn]} onPress={() => setMode('signin')}><Text style={[s.tabT, mode === 'signin' && { color: '#fff' }]}>SIGN IN</Text></TouchableOpacity>
            <TouchableOpacity style={[s.tab, mode === 'signup' && s.tabOn]} onPress={() => setMode('signup')}><Text style={[s.tabT, mode === 'signup' && { color: '#fff' }]}>SIGN UP</Text></TouchableOpacity>
          </View>
          {mode === 'signup' ? <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your name" icon="person-outline" /> : null}
          <Field label="Email / Mobile" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail-outline" />
          <Field label="Password" value={pass} onChangeText={setPass} placeholder="••••••••" icon="lock-closed-outline" />
          <PrimaryBtn title={mode === 'signin' ? 'Sign In' : 'Create Account'} icon="log-in-outline" onPress={() => navigation.navigate('Main', { screen: 'Account' })} />
          <TouchableOpacity><Text style={s.forgot}>Forgot Password?</Text></TouchableOpacity>
          <View style={s.or}><View style={s.line} /><Text style={s.orT}>OR</Text><View style={s.line} /></View>
          <TouchableOpacity style={s.social} onPress={() => navigation.navigate('Main', { screen: 'Account' })}>
            <Text style={s.socialT}>🔵  Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  logoWrap: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  wel: { color: '#fff', fontWeight: '900', fontSize: 19, marginTop: 14 },
  sub: { color: '#B9C4D6', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 14 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  tabOn: { backgroundColor: COLORS.secondary },
  tabT: { fontWeight: '800', fontSize: 13, color: COLORS.textLight },
  forgot: { color: COLORS.primaryText, textAlign: 'center', marginTop: 10, fontWeight: '700' },
  or: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orT: { marginHorizontal: 8, color: COLORS.textLight, fontSize: 12 },
  social: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 13, alignItems: 'center' },
  socialT: { fontWeight: '700' },
});
