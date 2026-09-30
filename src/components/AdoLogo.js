import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

// Adotrip-style logo (original inspired design - yellow #FEE400 + navy)
export default function AdoLogo({ size = 30, light = false, showTagline = false }) {
  return (
    <View>
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
    </View>
  );
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
});
