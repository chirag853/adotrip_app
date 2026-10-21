import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../theme';
import { SectionHeader, Chip, Rating, CoverImg, ScreenHeader, TabGap } from '../components/UI';
import { fetchPackages, fetchPackagesByUrl, fetchSubthemes } from '../utils/packagesApi';

// Top chips: ONLY live subtheme `name`s from GET /api/v1/subthemes.
// Chip press -> us theme ka `packages_url` response se utha kar wahi hit hota
// hai. API jo bhi packages deti hai (saare pages), bas wahi dikhte hain —
// koi local/static fallback nahi.

export default function HolidaysScreen({ navigation }) {
  const listRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeThemeUrl, setActiveThemeUrl] = useState('');
  // Text shown in the box vs text sent to the API — sent on Search press
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [apiList, setApiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hasApi, setHasApi] = useState(false);
  // Live subtheme names for the top chips (GET /api/v1/subthemes)
  const [themes, setThemes] = useState([]);

  // Chips: 'All' + live subtheme `name`s only. API fail -> sirf 'All'.
  const liveNames = themes.map((t) => t.name).filter(Boolean);
  const seen = new Set(['all']);
  const FILTERS = ['All', ...liveNames.filter((x) => {
    const k = String(x).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  })];

  useEffect(() => {
    const ctrl = new AbortController();
    fetchSubthemes({ signal: ctrl.signal })
      .then((list) => {
        if (!ctrl.signal.aborted) setThemes(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setThemes([]);
      });
    return () => ctrl.abort();
  }, []);

  // 'All' -> package search API. Theme chip -> exact `packages_url` from
  // /api/v1/subthemes. Both functions fetch every page; API fail = error +
  // Retry only. No local/static packages are ever mixed into this list.
  const load = useCallback(async (searchText, themeUrl, signal, opts = {}) => {
    if (opts.refresh) setRefreshing(true);
    else {
      setLoading(true);
      setApiList([]);
    }
    setApiError(null);
    try {
      const data = themeUrl
        ? await fetchPackagesByUrl({ url: themeUrl, signal })
        : await fetchPackages({ search: searchText, signal });
      if (signal?.aborted) return;
      setApiList(data);
      // Empty result for a search query is still a successful API call —
      // show "No packages found", not an offline fallback.
      setHasApi(true);
      setApiError(null);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      // Keep the full error (message + code) — the banner needs `code`
      // to tell SSL vs offline vs server apart.
      setApiList([]);
      setApiError(e);
      setHasApi(false);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(query, activeThemeUrl, ctrl.signal);
    return () => ctrl.abort();
  }, [query, activeThemeUrl, load]);

  const scrollTop = () => {
    try {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    } catch {}
  };

  const onSearch = () => {
    scrollTop();
    setActiveFilter('All');
    setActiveThemeUrl('');
    setQuery(input.trim());
  };
  const onClear = () => {
    scrollTop();
    setInput('');
    setQuery('');
    setActiveFilter('All');
    setActiveThemeUrl('');
  };
  const onRefresh = () => load(query, activeThemeUrl, undefined, { refresh: true });

  const selectFilter = (name) => {
    scrollTop();
    setActiveFilter(name);
    setInput('');
    setQuery('');
    if (name === 'All') {
      setActiveThemeUrl('');
      return;
    }
    const theme = themes.find((t) => t.name === name);
    setActiveThemeUrl(theme?.packages_url || '');
  };

  // Exactly what the API returned (all pages already merged in packagesApi).
  const show = apiList;
  const sectionTitle =
    activeFilter === 'All' ? 'Budget Tour Packages' : `${activeFilter} Packages`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <ScreenHeader
        title="Holidays"
        onBack={() => {
          try {
            navigation.goBack();
          } catch {}
        }}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('Circuit')}>
            <Ionicons name="sparkles-outline" size={22} color={COLORS.secondary} />
          </TouchableOpacity>
        }
      />
      <FlatList
        ref={listRef}
        data={show}
        keyExtractor={(p, i) => String(p.id || p.slug || p.title || `pkg-${i}`)}
        renderItem={({ item: p }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('HolidayDetail', { slug: p.slug, item: p })}
          >
            <View style={s.img}>
              <CoverImg hotel={p} height={150} emojiSize={52} />
              <View style={s.tag}>
                <Text style={s.tagT}>
                  {p.days} • {p.tag}
                </Text>
              </View>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={s.title}>{p.title}</Text>
              <Text style={s.loc}>📍 {p.location}</Text>
              <View style={{ marginVertical: 6 }}>
                <Rating value={p.rating} reviews={p.reviews} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.price}>
                  ₹{Number(p.price || 0).toLocaleString('en-IN')}{' '}
                  <Text style={s.old}>₹{Number(p.oldPrice || 0).toLocaleString('en-IN')}</Text>
                </Text>
                <Text style={s.view}>Details →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <>
            {/* 🔍 Search — this value is passed as `&search=kerala` */}
            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={s.searchInput}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Search: kerala, goa, dubai…"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  onSubmitEditing={onSearch}
                />
                {input.length > 0 && (
                  <TouchableOpacity onPress={onClear} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={s.searchBtn} onPress={onSearch} activeOpacity={0.85}>
                <Text style={s.searchBtnT}>Search</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {FILTERS.map((x) => (
                <Chip key={x} label={x} active={activeFilter === x} onPress={() => selectFilter(x)} />
              ))}
            </ScrollView>

            <SectionHeader
              title={sectionTitle}
              subtitle={`${show.length} packages • EMI available${query ? ` • "${query}"` : ''}${hasApi ? ' • Live' : ''}`}
            />

            {!loading && apiError && (
              <View style={s.errBox}>
                <Ionicons name="cloud-offline-outline" size={22} color={COLORS.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={s.errT}>
                    {apiError.code === 'OFFLINE'
                      ? 'No internet connection.'
                      : apiError.code === 'TIMEOUT'
                        ? 'Request timed out.'
                        : apiError.code === 'SERVER'
                          ? 'Server busy.'
                          : "Couldn't load live packages."}
                  </Text>
                  <Text style={s.errS}>Live API se data load nahi ho paaya. Tap Retry.</Text>
                </View>
                <TouchableOpacity
                  style={s.retryBtn}
                  onPress={() => load(query, activeThemeUrl, undefined, { refresh: true })}
                  activeOpacity={0.85}
                >
                  <Text style={s.retryT}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading && show.length === 0 && (
              <View style={s.center}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
                <Text style={s.muted}>Loading all packages…</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !apiError && hasApi ? (
            <View style={s.center}>
              <Text style={s.muted}>No packages found{query ? ` for "${query}"` : ''}.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={<TabGap />}
        contentContainerStyle={{ paddingBottom: 0 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={9}
      />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    ...SHADOW,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  searchBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnT: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', ...SHADOW },
  img: { height: 150, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagT: { color: '#fff', fontSize: 11, fontWeight: '800' },
  title: { fontWeight: '800', color: COLORS.secondary, fontSize: 15 },
  loc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  price: { fontWeight: '900', color: COLORS.secondary, fontSize: 16 },
  old: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through', fontWeight: '400' },
  view: { color: COLORS.primaryText, fontWeight: '800' },
  center: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  muted: { fontSize: 12, color: COLORS.textLight },
  errBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 12 },
  errT: { fontWeight: '800', color: COLORS.secondary, fontSize: 13 },
  errS: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  retryBtn: { backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 16, height: 40, alignItems: 'center', justifyContent: 'center' },
  retryT: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
