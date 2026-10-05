import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

// assets/logo.webp me asli Adotrip logo hai (adotrip + nothing is far)
let LOGO_SRC = null;
try {
  LOGO_SRC = require('../../assets/logo.webp');
} catch (e) {
  LOGO_SRC = null;
}

export default function AdoLogo({ width = 140, light = false, showTagline = false }) {
  const [failed, setFailed] = useState(false);
  const height = width * 0.36;

  // Agar image missing / load fail ho to purana text logo dikhao taaki app crash na ho
  if (!LOGO_SRC || failed) {
    const size = 30;
    return (
      <View style={styles.row}>
        <View style={[styles.iconBox, { width: size, height: size, borderRadius: size * 0.28 }]}>
          <Text style={[styles.iconText, { fontSize: size * 0.52 }]}>A</Text>
          <View style={styles.dot} />
        </View>
        <View style={{ marginLeft: 8 }}>
          <Text style={[styles.name, { fontSize: size * 0.62, color: light ? '#fff' : COLORS.secondary }]}>
            ado<Text style={{ color: light ? COLORS.primary : COLORS.primaryText }}>trip</Text>
          </Text>
          {showTagline ? <Text style={styles.tag}>NOTHING IS FAR</Text> : null}
        </View>
      </View>
    );
  }

  const img = (
    <Image
      source={LOGO_SRC}
      style={{ width, height }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );

  if (light) {
    // Dark (navy) background par kala logo dikhega nahi, isliye white pill me dikhao
    return <View style={styles.lightWrap}>{img}</View>;
  }
  return img;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: COLORS.onPrimary, fontWeight: '900', fontStyle: 'italic' },
  dot: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: '#fff',
  },
  name: { fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
  tag: { fontSize: 9, letterSpacing: 2.2, color: '#8A94A6', fontWeight: '700', marginTop: -2 },
  lightWrap: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
