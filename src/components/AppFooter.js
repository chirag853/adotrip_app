import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TAB_ACTIVE_TINT,
  TAB_INACTIVE_TINT,
  TAB_ICONS,
  TAB_BAR_STYLE,
  TAB_ITEM_STYLE,
  TAB_LABEL_STYLE,
  TAB_ITEM_BASE_STYLE,
  TAB_ICON_WRAPPER_STYLE,
} from '../navigation/tabBarConfig';

const TABS = ['Home', 'Holidays', 'Offers', 'Bookings', 'Account'];

function getActiveTab(state) {
  const main = state?.routes?.find((route) => route.name === 'Main');
  const tabState = main?.state;
  return tabState?.routes?.[tabState.index]?.name || 'Home';
}

// App ka common footer — har screen ke neeche yahi tab bar aata hai.
// AppShell isko render karta hai, isliye CSS/alignment har page pe same hai.
export default function AppFooter({ navigation: navigationProp }) {
  const fallbackNavigation = useNavigation();
  const navigation = navigationProp || fallbackNavigation;
  const state = useNavigationState((rootState) => rootState);
  const insets = useSafeAreaInsets();
  const activeTab = getActiveTab(state);

  const goToTab = (tab) => {
    navigation.navigate('Main', { screen: tab });
  };

  return (
    <View
      style={[
        TAB_BAR_STYLE,
        s.bar,
        { paddingHorizontal: Math.max(insets.left, insets.right) },
      ]}
    >
      {TABS.map((tab) => {
        const active = tab === activeTab;
        const color = active ? TAB_ACTIVE_TINT : TAB_INACTIVE_TINT;
        return (
          <View key={tab} style={[TAB_ITEM_STYLE, s.itemOuter]}>
            <TouchableOpacity
              style={TAB_ITEM_BASE_STYLE}
              activeOpacity={0.8}
              onPress={() => goToTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab}
            >
              <View style={TAB_ICON_WRAPPER_STYLE}>
                <Ionicons name={TAB_ICONS[tab]} size={22} color={color} />
              </View>
              <Text style={[TAB_LABEL_STYLE, { color }]} numberOfLines={1}>
                {tab}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row' },
  itemOuter: { flex: 1 },
});
