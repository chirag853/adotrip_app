import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, SHADOW_LG, TYPO } from '../theme';

export function SectionHeader({ title, subtitle, onViewAll }) {
  return (
    <View style={s.secRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.secTitle}>{title}</Text>
        {subtitle ? <Text style={s.secSub}>{subtitle}</Text> : null}
      </View>
      {onViewAll ? (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={s.viewAll}>View All →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark }]}
    >
      {icon ? <Text style={{ marginRight: 4 }}>{icon}</Text> : null}
      <Text style={[s.chipText, active && { color: COLORS.onPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, value, placeholder, onChangeText, icon, keyboardType }) {
  return (
    <View style={s.fieldWrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.field}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.textLight} style={{ marginRight: 8 }} /> : null}
        <TextInput
          style={s.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}

export function PrimaryBtn({ title, onPress, icon }) {
  return (
    <TouchableOpacity style={s.btn} onPress={onPress} activeOpacity={0.85}>
      {icon ? <Ionicons name={icon} size={18} color={COLORS.onPrimary} style={{ marginRight: 6 }} /> : null}
      <Text style={s.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function CoverImg({ hotel, height = 120, emojiSize = 48 }) {
  const item = hotel || {};
  if (item.image) {
    return <Image source={{ uri: item.image }} style={{ width: '100%', height }} resizeMode="cover" />;
  }
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center', backgroundColor: item.color }}>
      <Text style={{ fontSize: emojiSize }}>{item.emoji}</Text>
    </View>
  );
}

// Purana naam - compatibility ke liye alias
export const HotelImg = CoverImg;

export function Rating({ value, reviews }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={s.star}>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>★ {value}</Text>
      </View>
      {reviews ? <Text style={s.rev}>({reviews})</Text> : null}
    </View>
  );
}

// Shared navy header - sab screens me ek jaisa top bar
export function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={s.head}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={10} style={s.headBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textOnDark} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 34 }} />
      )}
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <Text style={s.headT} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.headS} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? <View style={{ width: 22 }} />}
    </View>
  );
}

// Floating tab bar ke neeche dabne se bachne ke liye list ke end me gap
export function TabGap() {
  return <View style={{ height: 96 }} />;
}

const s = StyleSheet.create({
  secRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  secTitle: { fontSize: TYPO.xl + 1, fontWeight: '900', color: COLORS.secondary, letterSpacing: -0.3 },
  secSub: { fontSize: TYPO.sm, color: COLORS.textLight, marginTop: 3 },
  viewAll: { color: COLORS.primaryText, fontWeight: '700', fontSize: 13 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.pill, marginRight: 8, ...SHADOW,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginBottom: 6 },
  field: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.button,
    paddingHorizontal: 14, height: 52, ...SHADOW,
  },
  input: { flex: 1, fontSize: TYPO.md, color: COLORS.text },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.button,
    height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 6, borderWidth: 1, borderColor: COLORS.primaryDark, ...SHADOW_LG,
  },
  btnText: { color: COLORS.onPrimary, fontSize: TYPO.lg, fontWeight: '800', letterSpacing: 0.3 },
  star: { backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rev: { fontSize: 11, color: COLORS.textLight, marginLeft: 6 },
  head: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', padding: 16 },
  headBack: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  headT: { color: COLORS.textOnDark, fontWeight: '900', fontSize: 17 },
  headS: { color: COLORS.mutedOnDark, fontSize: 11, marginTop: 1 },
});
