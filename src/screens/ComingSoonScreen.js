import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { PrimaryBtn, ScreenHeader } from '../components/UI';

// "Himachal Tourism" / "Luxury Trains" — website ke special sections. App me
// content abhi ban raha hai; tab tak clean landing + enquiry CTA.
export default function ComingSoonScreen({ navigation, route }) {
  const p = route.params || {};
  const title = String(p.title || 'Coming Soon');
  const emoji = String(p.emoji || '✨');
  const blurb = String(p.blurb || 'Ye section jald hi aa raha hai.');
  const highlights = Array.isArray(p.highlights) ? p.highlights : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader
        title={title}
        onBack={() => {
          try {
            navigation.goBack();
          } catch {}
        }}
      />
      <View style={s.center}>
        <View style={s.iconCircle}>
          <Text style={{ fontSize: 56 }}>{emoji}</Text>
        </View>
        <Text style={s.title}>{title}</Text>
        <View style={s.newPill}>
          <Text style={s.newPillT}>NEW</Text>
        </View>
        <Text style={s.blurb}>{blurb}</Text>

        {highlights.length ? (
          <View style={s.chips}>
            {highlights.map((x) => (
              <View key={x} style={s.chip}>
                <Text style={s.chipT}>{x}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={s.actions}>
          <PrimaryBtn
            title="Explore Holiday Packages"
            icon="map-outline"
            onPress={() => navigation.navigate('Main', { screen: 'Holidays' })}
          />
          <TouchableOpacity
            style={s.ghost}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.8}
          >
            <Ionicons name="headset-outline" size={18} color={COLORS.secondary} />
            <Text style={s.ghostT}>Talk to our team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 44 },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.secondary, marginTop: 18, textAlign: 'center' },
  newPill: { backgroundColor: COLORS.danger, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 },
  newPillT: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  blurb: { fontSize: 13.5, color: COLORS.textLight, textAlign: 'center', lineHeight: 21, marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...SHADOW,
  },
  chipT: { fontSize: 12.5, fontWeight: '700', color: COLORS.text },
  actions: { alignSelf: 'stretch', marginTop: 28 },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  ghostT: { fontWeight: '800', color: COLORS.secondary, fontSize: 14, marginLeft: 6 },
});
