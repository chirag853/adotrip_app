import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

// Website jaisi header menu — Home, Flights, Hotels, Holidays, …
// "New" wale items (Himachal Tourism / Luxury Trains) par assets/new-badge.png
// ka red NEW ribbon. items: [{ id, label, isNew, active, onPress }]
let NEW_BADGE = null;
try {
  NEW_BADGE = require('../../assets/new-badge.png');
} catch (e) {
  NEW_BADGE = null;
}

export default function TopMenu({ items = [] }) {
  return (
    <View style={s.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {items.map((it) => (
          <TouchableOpacity key={it.id} style={s.item} onPress={it.onPress} activeOpacity={0.7}>
            <Text style={[s.label, it.active && s.labelActive]}>{it.label}</Text>
            {it.isNew && NEW_BADGE ? (
              <Image source={NEW_BADGE} style={s.badge} resizeMode="contain" />
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border },
  row: { paddingHorizontal: 16, alignItems: 'center' },
  item: { paddingTop: 12, paddingBottom: 12, paddingHorizontal: 2, marginRight: 22 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  labelActive: { color: COLORS.primaryText, fontWeight: '900' },
  // Ribbon text ke top-right par, item ke andar hi (clip safe)
  badge: { position: 'absolute', top: 0, right: -14, width: 34, height: 34 },
});
