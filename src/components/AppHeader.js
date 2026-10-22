import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AdoLogo from './AdoLogo';
import { COLORS } from '../theme';

// App ka common header — Home, Holidays, Offers, Himachal, Circuit Planner,
// aur baaki screens sab yahi component use karte hain.
export default function AppHeader({
  title,
  subtitle,
  onBack,
  right,
  showBack,
  showMenu = false,
  showSupport = true,
  showAccount = true,
  onMenu,
}) {
  const navigation = useNavigation();
  const backVisible = showBack ?? !!onBack;
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={s.header}>
      <View style={s.topRow}>
        {backVisible ? (
          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleBack}
            hitSlop={8}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : null}

        <View style={s.logoWrap}>
          <AdoLogo width={104} />
        </View>

        {title ? (
          <View style={s.titleWrap}>
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={s.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {right ? <View style={s.right}>{right}</View> : null}

        {showSupport ? (
          <TouchableOpacity
            style={[s.iconBtn, { marginLeft: 8 }]}
            onPress={() => navigation.navigate('Support')}
            hitSlop={8}
            accessibilityLabel="Support"
          >
            <Ionicons name="headset-outline" size={19} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : null}

        {showAccount ? (
          <TouchableOpacity
            style={[s.iconBtn, { marginLeft: 8 }]}
            onPress={() => navigation.navigate('Auth')}
            hitSlop={8}
            accessibilityLabel="Account"
          >
            <Ionicons name="person-outline" size={19} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : null}

        {showMenu ? (
          <TouchableOpacity
            style={[s.iconBtn, { marginLeft: 8 }]}
            onPress={onMenu}
            hitSlop={8}
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu-outline" size={21} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoWrap: { alignItems: 'flex-start' },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6FB',
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleWrap: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 1,
  },
});
