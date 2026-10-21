import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AdoLogo from '../components/AdoLogo';
import { COLORS } from '../theme';

// Auth screen design: light cream-yellow gradient + white card (Adotrip style).
// Sign in aur Sign up dono ek hi screen me, neeche ke link se switch hote hain.
const NAVY = COLORS.secondary; // #0E2A47
const INPUT_BG = '#EDF1FA';

const COUNTRIES = [
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
];

function AuthInput({
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  showToggle,
  onToggleSecure,
  keyboardType,
  autoCapitalize,
  right,
}) {
  return (
    <View style={s.input}>
      {icon ? <Ionicons name={icon} size={18} color="#7E8AA0" style={{ marginRight: 10 }} /> : null}
      <TextInput
        style={s.inputText}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#96A0B5"
        secureTextEntry={!!secure}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        autoCorrect={false}
      />
      {showToggle ? (
        <TouchableOpacity onPress={onToggleSecure} hitSlop={10}>
          <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={19} color="#7E8AA0" />
        </TouchableOpacity>
      ) : null}
      {right || null}
    </View>
  );
}

function CheckBox({ checked, onPress, color = NAVY }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={10} activeOpacity={0.8}>
      <View style={[s.checkbox, checked && { backgroundColor: color, borderColor: color }]}>
        {checked ? <Ionicons name="checkmark" size={13} color="#fff" /> : null}
      </View>
    </TouchableOpacity>
  );
}

function SocialBtn({ icon, color, onPress }) {
  return (
    <TouchableOpacity style={s.socialBtn} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
  );
}

function Divider({ label }) {
  return (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerT}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(true);
  const [countryOpen, setCountryOpen] = useState(false);

  const isSignin = mode === 'signin';

  const submit = () => navigation.navigate('Main', { screen: 'Account' });
  const socialLogin = () => navigation.navigate('Main', { screen: 'Account' });
  const forgot = () =>
    Alert.alert('Forgot Password?', 'Password reset link aapke email par bhej diya jayega (demo).');

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF3C4', '#FFFCF0', '#F3F5FC', '#F1F0FB']}
        locations={[0, 0.32, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.shell}>
              <View style={s.topRow}>
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                  <Ionicons name="chevron-back" size={20} color={NAVY} />
                </TouchableOpacity>
              </View>

              {/* Brand */}
              <View style={s.brand}>
                <View style={s.logoWrap}>
                  <AdoLogo width={132} />
                </View>
                <View style={s.badge}>
                  <View style={s.badgeDot}>
                    <Text style={s.badgeN}>N</Text>
                  </View>
                  <Text style={s.badgeT}>NOTHING IS FAR</Text>
                </View>
              </View>

              {/* Heading */}
              <Text style={s.h1}>
                {isSignin ? 'Welcome back, Explorer!' : 'Create Your Adotrip\nAccount'}
              </Text>
              <Text style={s.sub}>
                {isSignin
                  ? 'Sign in to unlock exclusive flight fares &\nluxury stays.'
                  : 'Unlock exclusive member rates on flights & luxury stays worldwide.'}
              </Text>

              {!isSignin && (
                <View style={s.credit}>
                  <Ionicons name="gift-outline" size={14} color={NAVY} />
                  <Text style={s.creditT}>Get $50 travel credit on your first trip</Text>
                </View>
              )}

              {/* Form card */}
              <View style={s.card}>
                {isSignin ? (
                  <View>
                    <View style={s.labelRow}>
                      <Text style={s.label}>Email or Mobile Number</Text>
                      <Text style={s.required}>Required</Text>
                    </View>
                    <AuthInput
                      icon="at-outline"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="wanderer@adotrip.com"
                      keyboardType="email-address"
                    />

                    <View style={[s.labelRow, { marginTop: 14 }]}>
                      <Text style={s.label}>Password</Text>
                      <TouchableOpacity onPress={forgot} hitSlop={8}>
                        <Text style={s.forgot}>Forgot Password?</Text>
                      </TouchableOpacity>
                    </View>
                    <AuthInput
                      icon="lock-closed-outline"
                      value={pass}
                      onChangeText={setPass}
                      placeholder="••••••••"
                      secure={!showPass}
                      showToggle
                      onToggleSecure={() => setShowPass((v) => !v)}
                    />

                    <View style={s.rememberRow}>
                      <CheckBox checked={remember} onPress={() => setRemember((v) => !v)} />
                      <Text style={s.rememberT}>Remember my journey</Text>
                      <View style={s.secureChip}>
                        <Ionicons name="shield-checkmark" size={11} color={NAVY} />
                        <Text style={s.secureT}>256-bit Secure</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={s.cta} onPress={submit} activeOpacity={0.9}>
                      <Text style={s.ctaT}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={18} color={NAVY} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <Divider label="OR CONTINUE WITH" />
                    <View style={s.socialRow}>
                      <SocialBtn icon="logo-google" color="#DB4437" onPress={socialLogin} />
                      <SocialBtn icon="logo-apple" color="#111111" onPress={socialLogin} />
                      <SocialBtn icon="phone-portrait-outline" color={NAVY} onPress={socialLogin} />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={s.upLabel}>Full Name</Text>
                    <AuthInput
                      icon="person-outline"
                      value={name}
                      onChangeText={setName}
                      placeholder="Elena Vance"
                      autoCapitalize="words"
                    />

                    <Text style={[s.upLabel, { marginTop: 14 }]}>Email Address</Text>
                    <AuthInput
                      icon="mail-outline"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="elena.vance@wanderlust.com"
                      keyboardType="email-address"
                    />

                    <Text style={[s.upLabel, { marginTop: 14 }]}>Mobile Phone Number</Text>
                    <View style={s.phoneBox}>
                      <TouchableOpacity
                        style={s.countryBtn}
                        onPress={() => setCountryOpen(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.countryCode}>{country.code}</Text>
                        <Text style={s.countryDial}>{country.dial}</Text>
                        <Ionicons name="chevron-down" size={14} color="#7E8AA0" style={{ marginLeft: 3 }} />
                      </TouchableOpacity>
                      <View style={s.phoneDivider} />
                      <TextInput
                        style={s.phoneInput}
                        value={mobile}
                        onChangeText={setMobile}
                        placeholder="98765 43210"
                        placeholderTextColor="#96A0B5"
                        keyboardType="phone-pad"
                      />
                    </View>

                    <Text style={[s.upLabel, { marginTop: 14 }]}>Create Password</Text>
                    <AuthInput
                      icon="lock-closed-outline"
                      value={pass}
                      onChangeText={setPass}
                      placeholder="At least 8 characters"
                      secure={!showPass}
                      showToggle
                      onToggleSecure={() => setShowPass((v) => !v)}
                    />

                    <View style={s.agreeRow}>
                      <CheckBox checked={agree} onPress={() => setAgree((v) => !v)} color="#E9C400" />
                      <Text style={s.agreeT}>
                        I agree to Adotrip's <Text style={s.agreeLink}>Terms of Service</Text> and{' '}
                        <Text style={s.agreeLink}>Privacy Policy</Text>.
                      </Text>
                    </View>

                    <TouchableOpacity style={s.cta} onPress={submit} activeOpacity={0.9}>
                      <Text style={s.ctaT}>Create Free Account</Text>
                      <Ionicons name="arrow-forward" size={18} color={NAVY} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <Divider label="OR JOIN WITH" />
                    <View style={s.socialRow}>
                      <SocialBtn icon="logo-google" color="#DB4437" onPress={socialLogin} />
                      <SocialBtn icon="logo-apple" color="#111111" onPress={socialLogin} />
                    </View>
                  </View>
                )}
              </View>

              {/* Mode switch */}
              <View style={s.switchRow}>
                <Text style={s.switchT}>
                  {isSignin ? "Don't have an account?" : 'Already have an account?'}
                </Text>
                <TouchableOpacity onPress={() => setMode(isSignin ? 'signup' : 'signin')} hitSlop={8}>
                  <Text style={s.switchLink}>{isSignin ? 'Sign Up' : 'Log In'}</Text>
                </TouchableOpacity>
              </View>

              {isSignin && (
                <View style={s.footer}>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Privacy Policy', 'Adotrip privacy policy jald hi app me aa rahi hai.')}
                  >
                    <Text style={s.footerLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={s.footerDot}>•</Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Terms of Service', 'Adotrip terms jald hi app me aa rahe hain.')}
                  >
                    <Text style={s.footerLink}>Terms of Service</Text>
                  </TouchableOpacity>
                  <Text style={s.footerDot}>•</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Support')}>
                    <Text style={s.footerLink}>Help Center</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Country code picker */}
      <Modal
        visible={countryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryOpen(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setCountryOpen(false)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Text style={s.modalTitle}>Select country</Text>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={s.modalRow}
                onPress={() => {
                  setCountry(c);
                  setCountryOpen(false);
                }}
              >
                <Text style={s.modalCode}>{c.code}</Text>
                <Text style={s.modalName}>{c.name}</Text>
                <Text style={s.modalDial}>{c.dial}</Text>
                {country.code === c.code ? (
                  <Ionicons name="checkmark-circle" size={18} color={NAVY} />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingBottom: 36, flexGrow: 1 },
  shell: { width: '100%', maxWidth: 430, alignSelf: 'center' },

  topRow: { height: 40, justifyContent: 'center' },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(14,42,71,0.06)',
  },

  brand: { alignItems: 'center', marginTop: 2 },
  logoWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#1B2A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFE9CE',
  },
  badgeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeN: { fontSize: 9, fontWeight: '900', color: NAVY, marginTop: -1 },
  badgeT: { fontSize: 8, letterSpacing: 1.4, fontWeight: '800', color: '#4B5563', marginLeft: 6 },

  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: 22,
  },
  sub: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#5D6878',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },

  credit: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 14,
    shadowColor: '#E5C800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  creditT: { fontSize: 11.5, fontWeight: '800', color: NAVY, marginLeft: 6 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    shadowColor: '#1B2A4A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 6,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  label: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  required: { fontSize: 10.5, fontStyle: 'italic', color: '#97A0B0' },
  forgot: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  upLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#5B6779',
    marginBottom: 7,
    textTransform: 'uppercase',
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E6ECF7',
  },
  inputText: { flex: 1, fontSize: 13.5, color: NAVY, paddingVertical: 0 },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C6D0E2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  rememberT: { fontSize: 12.5, color: '#374151', marginLeft: 8, flex: 1 },
  secureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4B8',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secureT: { fontSize: 9.5, fontWeight: '800', color: NAVY, marginLeft: 3 },

  cta: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0C300',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  ctaT: { fontSize: 15.5, fontWeight: '900', color: NAVY, letterSpacing: 0.1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E7EBF3' },
  dividerT: { marginHorizontal: 10, fontSize: 9, letterSpacing: 1.3, fontWeight: '700', color: '#8A94A6' },

  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F4FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF8',
  },

  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: '#E6ECF7',
    paddingHorizontal: 12,
  },
  countryBtn: { flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  countryCode: { fontSize: 13, fontWeight: '800', color: NAVY },
  countryDial: { fontSize: 13, color: '#7E8AA0', marginLeft: 5 },
  phoneDivider: { width: 1, height: 26, backgroundColor: '#D8E0EF', marginRight: 10 },
  phoneInput: { flex: 1, fontSize: 13.5, color: NAVY, paddingVertical: 0 },

  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  agreeT: { flex: 1, fontSize: 11.5, lineHeight: 17, color: '#5F6B7D', marginLeft: 9 },
  agreeLink: { fontWeight: '800', color: NAVY },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  switchT: { fontSize: 12.5, color: '#4B5563' },
  switchLink: {
    fontSize: 12.5,
    fontWeight: '900',
    color: NAVY,
    textDecorationLine: 'underline',
    marginLeft: 5,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  footerLink: { fontSize: 10.5, color: '#6B7280' },
  footerDot: { fontSize: 10.5, color: '#9CA3AF', marginHorizontal: 8 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14,42,71,0.35)',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  modalTitle: { fontSize: 14, fontWeight: '900', color: NAVY, marginBottom: 8 },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F4F9',
  },
  modalCode: { width: 34, fontSize: 13, fontWeight: '800', color: NAVY },
  modalName: { flex: 1, fontSize: 13, color: '#374151' },
  modalDial: { fontSize: 13, color: '#6B7280', marginRight: 8 },
});
