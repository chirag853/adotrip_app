import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

// Home hero ke neeche government / tourism partner logos ka infinite
// right-to-left marquee. Local assets use kiye hain taaki Expo Go me
// network/proxy fail hone par bhi logos turant dikhein.
const LOGO_HEIGHT = 40;
const LOGO_GAP = 22;

const LOGOS = [
  { source: require('../../assets/logos/nid.png'), width: 53 },
  { source: require('../../assets/logos/hptdc.png'), width: 192 },
  { source: require('../../assets/logos/dt.png'), width: 84 },
  { source: require('../../assets/logos/mot.png'), width: 84 },
  { source: require('../../assets/logos/ic-india.png'), width: 92 },
];

// Ek set ki width (trailing gap ke saath). Doosra set exactly isi distance
// par shuru hota hai, isliye loop reset hone par koi jump nahi dikhta.
const SET_WIDTH = LOGOS.reduce((sum, logo) => sum + logo.width + LOGO_GAP, 0);

export default function PartnerLogoMarquee({ plain = false }) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -SET_WIDTH,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View style={[s.wrap, plain && s.wrapPlain]} accessibilityLabel="Tourism partners">
      <Animated.View
        style={[s.track, { transform: [{ translateX }] }]}
      >
        {[...LOGOS, ...LOGOS].map((logo, index) => (
          <View key={`${index}-${logo.width}`} style={s.item}>
            <Image
              source={logo.source}
              style={{ width: logo.width, height: LOGO_HEIGHT }}
              resizeMode="contain"
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 12,
    height: LOGO_HEIGHT + 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  wrapPlain: {
    marginTop: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    width: SET_WIDTH * 2 + 28,
  },
  item: {
    marginRight: LOGO_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
