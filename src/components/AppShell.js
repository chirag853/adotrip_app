import { useEffect, useState } from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import AppFooter from './AppFooter';
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM } from '../navigation/tabBarConfig';

// Har screen ka common shell: content + bottom footer.
// Footer ke liye jagah reserve karta hai, isliye content kabhi footer ke
// neeche hide nahi hota aur alignment har page pe same rehta hai.
// Keyboard khulte waqt footer hide hota hai, taaki inputs ke upar na aaye.
export default function AppShell({ children, navigation }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={s.root}>
      <View style={s.content}>{children}</View>
      {!keyboardOpen ? (
        <>
          <View style={{ height: TAB_BAR_HEIGHT + TAB_BAR_BOTTOM }} />
          <AppFooter navigation={navigation} />
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1 },
});
