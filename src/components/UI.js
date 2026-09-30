import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../theme';

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

const s = StyleSheet.create({
  secRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  secTitle: { fontSize: 18, fontWeight: '800', color: COLORS.secondary },
  secSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  viewAll: { color: COLORS.primaryText, fontWeight: '700', fontSize: 13 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, marginBottom: 6 },
  field: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: 12, height: 48, ...SHADOW,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.text },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 6, borderWidth: 1, borderColor: COLORS.primaryDark,
  },
  btnText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '800' },
  star: { backgroundColor: COLORS.success, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  rev: { fontSize: 11, color: COLORS.textLight, marginLeft: 6 },
});
