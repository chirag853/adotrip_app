import { COLORS, RADIUS } from '../theme';

// App ke bottom tab bar / footer ki single source of truth.
// Har screen ka footer AppShell -> AppFooter se aata hai, isliye CSS,
// height, icons, labels aur alignment har page pe bilkul same rehte hain.

export const TAB_ACTIVE_TINT = COLORS.secondary;
export const TAB_INACTIVE_TINT = 'rgba(90,100,115,0.85)';
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_BOTTOM = 12;

export const TAB_ICONS = {
  Home: 'home',
  Holidays: 'map',
  Offers: 'pricetags',
  Bookings: 'briefcase',
  Account: 'person',
};

export const TAB_BAR_STYLE = {
  position: 'absolute',
  bottom: TAB_BAR_BOTTOM,
  left: 16,
  right: 16,
  height: TAB_BAR_HEIGHT,
  borderRadius: RADIUS.xl,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: COLORS.border,
  paddingBottom: 8,
  paddingTop: 8,
  elevation: 8,
  shadowColor: COLORS.secondary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
};

export const TAB_ITEM_STYLE = {
  borderRadius: RADIUS.button,
  marginHorizontal: 4,
  paddingVertical: 4,
};

export const TAB_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '700',
  textAlign: 'center',
  backgroundColor: 'transparent',
};

// React Navigation ke BottomTabItem ke default styles (same structure replica ke liye)
export const TAB_ITEM_BASE_STYLE = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'column',
  padding: 5,
  borderRadius: 10,
  borderCurve: 'continuous',
};

// React Navigation ka TabBarIcon wrapper (icons isi 31x28 box me center hote hain)
export const TAB_ICON_WRAPPER_STYLE = {
  width: 31,
  height: 28,
  alignItems: 'center',
  justifyContent: 'center',
};
