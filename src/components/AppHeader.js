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
  aiTheme = false,
}) {
  const navigation = useNavigation();
  const backVisible = showBack ?? !!onBack;
  const handleBack = onBack || (() => navigation.goBack());
  const iconColor = aiTheme ? '#DCEBFF' : COLORS.secondary;

  return (
    <View style={[s.header, aiTheme && s.headerAi]}>
      <View style={s.topRow}>
        {backVisible ? (
          <TouchableOpacity
            style={[s.iconBtn, aiTheme && s.iconBtnAi]}
            onPress={handleBack}
            hitSlop={8}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={iconColor} />
          </TouchableOpacity>
        ) : null}

        <View style={s.logoWrap}>
          <AdoLogo width={104} light={aiTheme} />
        </View>

        {title ? (
          <View style={s.titleWrap}>
            <Text style={[s.title, aiTheme && s.titleAi]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[s.subtitle, aiTheme && s.subtitleAi]} numberOfLines={1}>
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
            style={[s.iconBtn, { marginLeft: 8 }, aiTheme && s.iconBtnAi]}
            onPress={() => navigation.navigate('Support')}
            hitSlop={8}
            accessibilityLabel="Support"
          >
            <Ionicons name="headset-outline" size={19} color={iconColor} />
          </TouchableOpacity>
        ) : null}

        {showAccount ? (
          <TouchableOpacity
            style={[s.iconBtn, { marginLeft: 8 }, aiTheme && s.iconBtnAi]}
            onPress={() => navigation.navigate('Auth')}
            hitSlop={8}
            accessibilityLabel="Account"
          >
            <Ionicons name="person-outline" size={19} color={iconColor} />
          </TouchableOpacity>
        ) : null}

        {showMenu ? (
          <TouchableOpacity
            style={[s.iconBtn, { marginLeft: 8 }, aiTheme && s.iconBtnAi]}
            onPress={onMenu}
            hitSlop={8}
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu-outline" size={21} color={iconColor} />
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
  headerAi: {
    backgroundColor: 'rgba(5, 12, 23, 0.97)',
    borderBottomColor: 'rgba(92, 225, 255, 0.16)',
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
  iconBtnAi: {
    backgroundColor: 'rgba(92, 225, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(92, 225, 255, 0.15)',
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
  titleAi: { color: '#EEF6FF' },
  subtitle: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 1,
  },
  subtitleAi: { color: '#9FB4CE' },
});
