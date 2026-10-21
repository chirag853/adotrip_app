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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW_LG } from '../theme';
import AdoLogo from './AdoLogo';

// Right side slide-in navigation drawer — top bar ke nav (menu) icon se khulta hai.
// items: [{ id, label, subtitle, group, icon, isNew, active, onPress }]
let NEW_BADGE = null;
try {
  NEW_BADGE = require('../../assets/new-badge.png');
} catch (e) {
  NEW_BADGE = null;
}

const PANEL_W = Math.min(342, Math.round(Dimensions.get('window').width * 0.86));

// Soft icon tiles keep the menu colourful without losing the navy/yellow brand.
const TINTS = {
  home: { bg: '#FFF6C7', fg: '#8A6D00' },
  flights: { bg: '#EAF2FF', fg: '#2563EB' },
  hotels: { bg: '#F3E8FF', fg: '#7C3AED' },
  holidays: { bg: '#E6FAF1', fg: '#0F9D58' },
  himachal: { bg: '#E8F0FF', fg: '#1D4ED8' },
  luxury: { bg: '#FFF0E6', fg: '#C2410C' },
  circuit: { bg: '#FCE7F3', fg: '#BE185D' },
  default: { bg: '#EEF2FF', fg: '#4F46E5' },
};

function tintFor(id) {
  return TINTS[id] || TINTS.default;
}

function groupItems(items) {
  const groups = [];
  items.forEach((it) => {
    const label = it.group || 'MORE';
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(it);
  });
  return groups;
}

export default function NavDrawer({ visible, onClose, items = [], onSupport }) {
  const anim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const groups = groupItems(items);

  useEffect(() => {
    if (!visible) return undefined;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      damping: 21,
      stiffness: 220,
      mass: 0.85,
      useNativeDriver: true,
    }).start();

    // Header is navy, so keep status bar icons readable while open.
    StatusBar.setStyle('light', true);
    return () => StatusBar.setStyle('dark', true);
  }, [visible, anim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.root}>
        <Animated.View style={[s.overlay, { opacity: anim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            s.panel,
            {
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
          <LinearGradient
            colors={['#0B2440', '#173C61']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.hero, { paddingTop: insets.top + 14 }]}
          >
            <View style={s.heroGlow} />
            <View style={s.heroRing} />
            <Ionicons name="airplane" size={118} color="rgba(255,255,255,0.055)" style={s.heroPlane} />

            <View style={s.heroTop}>
              <AdoLogo width={112} light />
              <TouchableOpacity
                onPress={onClose}
                hitSlop={10}
                style={s.close}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={s.eyebrow}>YOUR TRAVEL COMPANION</Text>
            <Text style={s.heroTitle}>Where to next?</Text>
            <Text style={s.heroSub}>Flights, hotels & handpicked holidays</Text>
          </LinearGradient>

          <Animated.View
            style={{
              flex: 1,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={s.body}
              showsVerticalScrollIndicator={false}
            >
              {groups.map((group) => (
                <View key={group.label} style={s.section}>
                  <Text style={s.sectionLabel}>{group.label}</Text>
                  <View style={s.groupCard}>
                    {group.items.map((it) => {
                      const tint = tintFor(it.id);
                      return (
                        <TouchableOpacity
                          key={it.id}
                          style={[s.row, it.active && s.rowActive]}
                          activeOpacity={0.72}
                          accessibilityRole="button"
                          accessibilityState={it.active ? { selected: true } : undefined}
                          onPress={() => {
                            onClose();
                            it.onPress?.();
                          }}
                        >
                          <View style={[s.rowIc, { backgroundColor: tint.bg }]}>
                            <Ionicons
                              name={it.icon || 'ellipse-outline'}
                              size={19}
                              color={tint.fg}
                            />
                          </View>

                          <View style={s.rowCopy}>
                            <View style={s.rowTitleLine}>
                              <Text
                                style={[s.rowT, it.active && s.rowTActive]}
                                numberOfLines={1}
                              >
                                {it.label}
                              </Text>
                              {it.isNew && NEW_BADGE ? (
                                <Image source={NEW_BADGE} style={s.badge} resizeMode="contain" />
                              ) : null}
                            </View>
                            {it.subtitle ? (
                              <Text style={s.rowSub} numberOfLines={1}>
                                {it.subtitle}
                              </Text>
                            ) : null}
                          </View>

                          {it.active ? (
                            <View style={s.activeDot} />
                          ) : (
                            <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={[s.bottomArea, { paddingBottom: insets.bottom + 8 }]}>
            {onSupport ? (
              <TouchableOpacity
                style={s.helpCard}
                activeOpacity={0.82}
                onPress={() => {
                  onClose();
                  onSupport();
                }}
                accessibilityRole="button"
                accessibilityLabel="Chat with a travel expert"
              >
                <View style={s.helpIc}>
                  <Ionicons name="headset-outline" size={20} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.helpTitle}>Need help planning?</Text>
                  <Text style={s.helpSub}>Chat with a travel expert</Text>
                </View>
                <View style={s.helpArrow}>
                  <Ionicons name="arrow-forward" size={15} color={COLORS.secondary} />
                </View>
              </TouchableOpacity>
            ) : null}
            <Text style={s.foot}>adotrip • NOTHING IS FAR</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,15,30,0.58)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: PANEL_W,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    ...SHADOW_LG,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderTopLeftRadius: 28,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(254,228,0,0.11)',
    top: -92,
    right: -56,
  },
  heroRing: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    bottom: -54,
    left: -42,
  },
  heroPlane: {
    position: 'absolute',
    right: -14,
    bottom: -18,
    transform: [{ rotate: '-22deg' }],
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    marginTop: 24,
    fontSize: 9.5,
    letterSpacing: 1.8,
    color: COLORS.primary,
    fontWeight: '800',
  },
  heroTitle: {
    marginTop: 5,
    fontSize: 23,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.4,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 12,
    color: '#B9C4D6',
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  section: { marginBottom: 16 },
  sectionLabel: {
    marginLeft: 6,
    marginBottom: 8,
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#94A3B8',
    fontWeight: '800',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    marginHorizontal: 5,
    marginVertical: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  rowActive: { backgroundColor: '#FFFBE0' },
  rowIc: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowCopy: { flex: 1, minWidth: 0, paddingRight: 8 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center' },
  rowT: {
    flexShrink: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  rowTActive: { fontWeight: '900' },
  rowSub: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#7B8794',
  },
  badge: {
    width: 34,
    height: 22,
    marginLeft: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F0F3F8',
    backgroundColor: '#fff',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 16,
    backgroundColor: '#FFFCEA',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  helpIc: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  helpTitle: { fontSize: 13, fontWeight: '800', color: COLORS.secondary },
  helpSub: { marginTop: 2, fontSize: 10.5, fontWeight: '600', color: '#7A6500' },
  helpArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF3B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foot: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 9.5,
    letterSpacing: 1.3,
    color: '#A0AAB8',
    fontWeight: '700',
  },
});
