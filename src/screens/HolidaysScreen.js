import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
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
import { PACKAGES } from '../data/appData';

// Top chips: ONLY live subtheme `name`s from GET /api/v1/subthemes.
// Chip press -> us theme ka `packages_url` API response se utha kar wahi hit
// hota hai (e.g. /api/v1/holidays/beach-theme-tours-packages/packages).
// No hardcoded filters — API fail ho to sirf 'All' dikhega.

function applyFilter(base, f) {
  if (!Array.isArray(base)) return [];
  if (f === 'All') return base;
  const fl = String(f).toLowerCase();
  // "Beach Theme" -> match packages with "beach" in tag/location/title
  const words = fl.split(/[^a-z]+/i).filter((w) => w.length >= 4);
  const out = base.filter((p) => {
    const tag = String(p.tag || '').toLowerCase();
    const loc = String(p.location || '').toLowerCase();
    const title = String(p.title || '').toLowerCase();
    if (tag === fl) return true;
    if (loc.includes(fl) || title.includes(fl)) return true;
    return words.some((w) => tag.includes(w) || loc.includes(w) || title.includes(w));
  });
  return out.length ? out : base;
}

export default function HolidaysScreen({ navigation }) {
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
  // /api/v1/subthemes. API fail = error + Retry, with bundled fallback cards.
  const load = useCallback(async (searchText, themeUrl, signal, opts = {}) => {
    if (opts.refresh) setRefreshing(true);
    else setLoading(true);
    setApiError(null);
    try {
      const data = themeUrl
        ? await fetchPackagesByUrl({ url: themeUrl, signal })
        : await fetchPackages({ search: searchText, perPage: 10, signal });
      if (signal?.aborted) return;
      setApiList(data);
      // Empty result for a search query is still a successful API call —
      // show "No packages found", not the offline fallback.
      setHasApi(true);
      setApiError(null);
    } catch (e) {
      if (e?.name === 'AbortError') return;
      // Keep the full error (message + code) — the banner needs `code`
      // to tell SSL vs offline vs server apart.
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

  const onSearch = () => {
    setActiveFilter('All');
    setActiveThemeUrl('');
    setQuery(input.trim());
  };
  const onClear = () => {
    setInput('');
    setQuery('');
    setActiveFilter('All');
    setActiveThemeUrl('');
  };
  const onRefresh = () => load(query, activeThemeUrl, undefined, { refresh: true });

  const selectFilter = (name) => {
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

  // Live list first. API fail (subah chalta tha / proxy band / offline) ->
  // bundled PACKAGES fallback taaki screen kabhi blank na rahe.
  // Search ka genuine empty result (hasApi) par fallback nahi.
  const base = apiList.length ? apiList : (!hasApi && apiError ? PACKAGES : apiList);
  const show =
    activeThemeUrl && hasApi && !apiError ? apiList : applyFilter(base, activeFilter);
  const usingFallback = !hasApi && !!apiError;
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
          subtitle={`${show.length} packages • EMI available${query ? ` • "${query}"` : ''}${hasApi ? ' • Live' : usingFallback ? ' • Popular' : ''}`}
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
              <Text style={s.errS}>
                Showing popular packages • Run `npm run proxy:restart` • Tap Retry
                {(() => {
                  const m = String(apiError.cause || '').match(/proxy\s+(https?:\/\/[^/\s:]+(?::\d+)?)/i);
                  return m ? ` • Trying: ${m[1]}` : '';
                })()}
              </Text>
            </View>
            <TouchableOpacity style={s.retryBtn} onPress={() => load(query, activeThemeUrl, undefined, { refresh: true })} activeOpacity={0.85}>
              <Text style={s.retryT}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && apiList.length === 0 && (
          <View style={s.center}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={s.muted}>Loading packages…</Text>
          </View>
        )}

        {!loading && hasApi && !apiError && show.length === 0 && (
          <View style={s.center}>
            <Text style={s.muted}>No packages found{query ? ` for "${query}"` : ''}.</Text>
          </View>
        )}

        {show.map((p) => (
          <TouchableOpacity
            key={String(p.id)}
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
        ))}
        <TabGap />
      </ScrollView>
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
