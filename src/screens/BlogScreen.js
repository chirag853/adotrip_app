import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme';
import { CoverImg, ScreenHeader } from '../components/UI';
import { BLOGS } from '../data/appData';

export default function BlogScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader title="📝 Travel Blog" onBack={() => navigation.goBack()} />
      <ScrollView style={{ padding: 16 }}>
        {BLOGS.map((b) => (
          <TouchableOpacity key={b.id} style={s.card} onPress={() => navigation.navigate('BlogDetail', { item: b })}>
            <CoverImg hotel={b} height={140} emojiSize={56} />
            <View style={{ padding: 12 }}>
              <Text style={s.cat}>{b.cat} • {b.read}</Text>
              <Text style={s.title}>{b.title}</Text>
              <Text style={s.desc} numberOfLines={2}>{b.desc}</Text>
              <Text style={s.read}>Read More →</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', ...SHADOW },
  img: { height: 140, alignItems: 'center', justifyContent: 'center' },
  cat: { color: COLORS.primaryText, fontWeight: '800', fontSize: 11 },
  title: { fontWeight: '800', color: COLORS.secondary, fontSize: 15, marginTop: 4 },
  desc: { color: COLORS.textLight, fontSize: 12, marginTop: 4 },
  read: { color: COLORS.primaryText, fontWeight: '800', marginTop: 8, fontSize: 13 },
});
