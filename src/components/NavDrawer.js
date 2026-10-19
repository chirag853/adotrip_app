import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW_LG } from '../theme';
import AdoLogo from './AdoLogo';

// Right side slide-in navigation drawer — top bar ke nav (menu) icon se khulta hai.
// items: [{ id, label, icon, isNew, active, onPress }]
let NEW_BADGE = null;
try {
  NEW_BADGE = require('../../assets/new-badge.png');
} catch (e) {
  NEW_BADGE = null;
}

const PANEL_W = Math.min(320, Math.round(Dimensions.get('window').width * 0.84));

export default function NavDrawer({ visible, onClose, items = [] }) {
  const anim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.root}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            s.panel,
            {
              paddingTop: insets.top + 14,
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PANEL_W + 60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={s.head}>
            <AdoLogo width={112} />
            <TouchableOpacity onPress={onClose} hitSlop={10} style={s.close}>
              <Ionicons name="close" size={22} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={s.row}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  it.onPress?.();
                }}
              >
                <View style={s.rowIc}>
                  <Ionicons name={it.icon || 'ellipse-outline'} size={19} color={COLORS.primaryText} />
                </View>
                <Text style={[s.rowT, it.active && { color: COLORS.primaryText, fontWeight: '900' }]}>
                  {it.label}
                </Text>
                {it.isNew && NEW_BADGE ? (
                  <Image source={NEW_BADGE} style={s.badge} resizeMode="contain" />
                ) : null}
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.foot}>adotrip • NOTHING IS FAR</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: PANEL_W,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingBottom: 14,
    ...SHADOW_LG,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  rowIc: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowT: { fontSize: 14.5, fontWeight: '700', color: COLORS.secondary },
  // Ribbon label ke top-right par — row ke andar hi (clip safe)
  badge: { width: 26, height: 26, marginLeft: 6, marginTop: -10 },
  foot: { textAlign: 'center', fontSize: 10.5, color: COLORS.textLight, marginTop: 10, letterSpacing: 1 },
});
