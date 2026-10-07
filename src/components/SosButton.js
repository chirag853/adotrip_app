import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW_LG } from '../theme';

const NUMBERS = [
  { label: 'National Emergency', num: '112', icon: 'warning-outline' },
  { label: 'Police', num: '100', icon: 'shield-outline' },
  { label: 'Ambulance', num: '102', icon: 'medkit-outline' },
  { label: 'Women Helpline', num: '1090', icon: 'call-outline' },
  { label: 'Adotrip Support (Toll Free)', num: '18001234567', icon: 'headset-outline' },
];

function dial(num) {
  Linking.openURL(`tel:${num}`).catch(() => Alert.alert('Call failed', `Please dial ${num} manually.`));
}

// Floating SOS button + emergency numbers sheet - rendered inside Tabs
export default function SosButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={s.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={s.fabT}>SOS</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            <View style={s.grab} />
            <View style={s.head}>
              <Ionicons name="warning" size={22} color={COLORS.danger} />
              <Text style={s.title}> Emergency SOS</Text>
            </View>
            <Text style={s.sub}>Tap a number to call immediately</Text>
            {NUMBERS.map((n) => (
              <TouchableOpacity key={n.num + n.label} style={s.row} onPress={() => dial(n.num)}>
                <View style={s.ic}><Ionicons name={n.icon} size={20} color={COLORS.danger} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.lbl}>{n.label}</Text>
                  <Text style={s.num}>{n.num}</Text>
                </View>
                <Ionicons name="call" size={20} color={COLORS.success} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.close} onPress={() => setOpen(false)}>
              <Text style={s.closeT}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute', right: 16, bottom: 92,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', ...SHADOW_LG,
  },
  fabT: { color: '#fff', fontWeight: '900', fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 30 },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.secondary },
  sub: { color: COLORS.textLight, fontSize: 12, marginTop: 2, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.button, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  ic: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  lbl: { fontWeight: '800', color: COLORS.secondary, fontSize: 14 },
  num: { color: COLORS.textLight, fontSize: 13, fontWeight: '700' },
  close: { backgroundColor: COLORS.secondary, borderRadius: RADIUS.button, padding: 14, alignItems: 'center', marginTop: 6 },
  closeT: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
