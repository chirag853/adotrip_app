import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW, SHADOW_LG } from '../theme';
import { Rating, PrimaryBtn } from '../components/UI';
import { fetchPackageDetail } from '../utils/packagesApi';

const W = Dimensions.get('window').width;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'terms', label: 'Terms' },
  { id: 'similar', label: 'Similar' },
];

function Gallery({ images, title }) {
  const [idx, setIdx] = useState(0);
  const [errs, setErrs] = useState({});
  const list = Array.isArray(images) && images.length ? images : [];
  if (!list.length) {
    return (
      <View style={[s.hero, { backgroundColor: '#0E2A47' }]}>
        <Text style={{ fontSize: 76 }}>🌴</Text>
      </View>
    );
  }
  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / W);
          setIdx(Math.min(Math.max(0, i), list.length - 1));
        }}
      >
        {list.map((u, i) =>
          errs[i] ? (
            <View key={i} style={[s.hero, { width: W, backgroundColor: '#0E2A47' }]}>
              <Text style={{ fontSize: 64 }}>🌴</Text>
            </View>
          ) : (
            <Image
              key={i}
              source={{ uri: u }}
              style={[s.hero, { width: W }]}
              resizeMode="cover"
              onError={() => setErrs((p) => ({ ...p, [i]: true }))}
            />
          )
        )}
      </ScrollView>
      <View style={s.count}>
        <Ionicons name="images-outline" size={12} color="#fff" />
        <Text style={s.countT}>
          {' '}
          {idx + 1} / {list.length}
        </Text>
      </View>
      {list.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.thumbs}
        >
          {list.map((u, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setIdx(i)}
              style={[s.thumb, idx === i && s.thumbActive]}
              activeOpacity={0.8}
            >
              {errs[i] ? (
                <View style={[s.thumbImg, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text>🌴</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: u }}
                  style={s.thumbImg}
                  resizeMode="cover"
                  onError={() => setErrs((p) => ({ ...p, [i]: true }))}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Stepper({ label, value, onMinus, onPlus }) {
  return (
    <View style={s.stepRow}>
      <Text style={s.stepLbl}>{label}</Text>
      <View style={s.stepCtl}>
        <TouchableOpacity style={s.stepBtn} onPress={onMinus} activeOpacity={0.7}>
          <Text style={s.stepBtnT}>−</Text>
        </TouchableOpacity>
        <Text style={s.stepVal}>{value}</Text>
        <TouchableOpacity style={s.stepBtn} onPress={onPlus} activeOpacity={0.7}>
          <Text style={s.stepBtnT}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Section({ id, title, children, onLayout, open = true, onToggle, collapsible = true }) {
  const body = (
    <View
      style={s.secCard}
      onLayout={(e) => onLayout?.(id, e.nativeEvent.layout.y)}
    >
      <TouchableOpacity
        style={s.secHead}
        onPress={() => collapsible && onToggle?.(id)}
        activeOpacity={collapsible ? 0.7 : 1}
        disabled={!collapsible}
      >
        <Text style={[s.sec, { marginBottom: 0, flex: 1 }]}>{title}</Text>
        {collapsible && (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.primaryText}
          />
        )}
      </TouchableOpacity>
      {open && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
  return body;
}

export default function HolidayDetailScreen({ navigation, route }) {
  const params = route.params || {};
  const slug = String(params.slug ?? params.item?.slug ?? '').trim();
  const fallbackItem = params.item || null;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState(null);
  const [openDay, setOpenDay] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  // Travellers popup (website jaisa): rooms + passengers + total
  const [showBook, setShowBook] = useState(false);
  const [roomDrop, setRoomDrop] = useState(false);
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  // Overview + Itinerary khule rahenge, baaki (Highlights / Inclusions /
  // Terms) collapsed — tap par khulenge.
  const [openSecs, setOpenSecs] = useState({
    overview: true,
    itinerary: true,
    highlights: false,
    inclusions: false,
    terms: false,
  });

  const scrollRef = useRef(null);
  const yMap = useRef({});
  const baseY = useRef(0);
  const insets = useSafeAreaInsets();

  const load = useCallback(
    async (signal) => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const d = await fetchPackageDetail({ slug, signal });
        if (signal?.aborted) return;
        setDetail(d);
        setError(null);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(e);
        setDetail(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const onLayout = useCallback((id, y) => {
    yMap.current[id] = y;
  }, []);

  const toggleSec = useCallback((id) => {
    setOpenSecs((p) => ({ ...p, [id]: !p[id] }));
    setActiveTab(id);
  }, []);

  const setRoomCount = (n) => {
    setRooms((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) next.push({ adults: 0, children: 0 });
      if (next.length && next[0].adults + next[0].children === 0)
        next[0] = { adults: 2, children: 0 };
      return next;
    });
    setRoomDrop(false);
  };

  const bump = (ri, key, delta, max) => {
    setRooms((prev) =>
      prev.map((r, i) =>
        i === ri ? { ...r, [key]: Math.min(max, Math.max(0, r[key] + delta)) } : r
      )
    );
  };

  const goTab = (id) => {
    setActiveTab(id);
    // Collapsed section par tap -> kholo taaki scroll ke baad content dikhe
    setOpenSecs((p) => (p[id] === false ? { ...p, [id]: true } : p));
    // Section ki y content-wrapper ke andar ki hai — usme wrapper ka
    // offset jodo, sticky tab (~70px) ka margin ghatao.
    requestAnimationFrame(() => {
      const y = yMap.current[id];
      if (typeof y === 'number') {
        scrollRef.current?.scrollTo({ y: Math.max(0, baseY.current + y - 70), animated: true });
      }
    });
  };

  // Live detail wins; else the card passed from the list (fallback PACKAGES included).
  const d = detail || (fallbackItem
    ? {
        title: fallbackItem.title,
        durationText: fallbackItem.days,
        price: fallbackItem.price,
        oldPrice: fallbackItem.oldPrice,
        state: fallbackItem.location,
        images: fallbackItem.image ? [fallbackItem.image] : [],
        description: fallbackItem.desc,
        highlights: [],
        itinerary: [],
        inclusions: [],
        exclusions: [],
        terms: [],
        cancellation: [],
        similar: [],
        rating: fallbackItem.rating,
        reviews: fallbackItem.reviews,
        tag: fallbackItem.tag,
      }
    : null);

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const perPerson = d?.price || 0;
  const pax = rooms.reduce((a, r) => a + r.adults + r.children, 0);
  const tourTotal = perPerson * pax;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.topT} numberOfLines={1}>
          {d?.title || 'Holiday Package'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {loading && !d && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={s.muted}>Loading package details…</Text>
        </View>
      )}

      {!loading && error && !d && (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={32} color={COLORS.danger} />
          <Text style={s.errT}>
            {error.code === 'NOT_FOUND' ? 'Package not found.' : "Couldn't load package details."}
          </Text>
          <TouchableOpacity
            style={s.retryBtn}
            onPress={() => {
              const ctrl = new AbortController();
              load(ctrl.signal);
            }}
          >
            <Text style={s.retryT}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {d && (
        <>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            stickyHeaderIndices={[2]}
          >
            <Gallery images={d.images} title={d.title} />

            <View style={{ padding: 16, paddingBottom: 0 }}>
              <Text style={s.tag}>
                {d.durationText}
                {d.state ? ` • ${d.state}` : ''}
                {d.tag ? ` • ${d.tag}` : ''}
              </Text>
              <Text style={s.title}>{d.title}</Text>
              {(d.rating || d.reviews) && (
                <View style={{ marginTop: 6 }}>
                  <Rating value={d.rating || 4.5} reviews={d.reviews || 100} />
                </View>
              )}
              <View style={s.priceRow}>
                <View>
                  <Text style={s.price}>{inr(d.price)}</Text>
                  <Text style={s.per}>per person • {inr(d.oldPrice)} onwards</Text>
                </View>
                <Text style={s.emi}>EMI from {inr(Math.round((d.price || 0) / 12))}/mo</Text>
              </View>
            </View>

            <View style={s.tabWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tabRow}
              >
                {TABS.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => goTab(t.id)}
                    style={[s.tab, activeTab === t.id && s.tabActive]}
                  >
                    <Text style={[s.tabT, activeTab === t.id && s.tabTActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View
              style={{ paddingHorizontal: 16 }}
              onLayout={(e) => { baseY.current = e.nativeEvent.layout.y; }}
            >
              <Section id="overview" title="Package Overview" onLayout={onLayout} open={openSecs.overview} onToggle={toggleSec}>
                <Text style={s.body}>{d.description || 'Details available on booking.'}</Text>
              </Section>

              {!!d.itinerary?.length && (
                <Section id="itinerary" title={`Day Wise Itinerary (${d.itinerary.length} days)`} onLayout={onLayout} open={openSecs.itinerary} onToggle={toggleSec}>
                  {d.itinerary.map((it) => {
                    const open = openDay === it.day;
                    return (
                      <View key={it.day} style={[s.dayCard, open && s.dayOpen]}>
                        <TouchableOpacity
                          style={s.dayHead}
                          onPress={() => setOpenDay(open ? 0 : it.day)}
                          activeOpacity={0.8}
                        >
                          <View style={s.dayBadge}>
                            <Text style={s.dayBadgeT}>Day {it.day}</Text>
                          </View>
                          <Text style={s.dayTitle} numberOfLines={open ? 0 : 1}>
                            {it.title}
                          </Text>
                          <Ionicons
                            name={open ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={COLORS.textLight}
                          />
                        </TouchableOpacity>
                        {open && (
                          <View style={s.dayBody}>
                            {it.points.map((pt, i) => (
                              <View key={i} style={s.bullet}>
                                <Text style={s.dot}>•</Text>
                                <Text style={s.bulletT}>{pt}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </Section>
              )}

              {!!d.highlights?.length && (
                <Section id="highlights" title="Highlights" onLayout={onLayout} open={openSecs.highlights} onToggle={toggleSec}>
                  {d.highlights.map((h, i) => (
                    <View key={i} style={s.bullet}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={[s.bulletT, { marginLeft: 8 }]}>{h}</Text>
                    </View>
                  ))}
                </Section>
              )}

              {(!!d.inclusions?.length || !!d.exclusions?.length) && (
                <Section id="inclusions" title="Inclusions / Exclusions" onLayout={onLayout} open={openSecs.inclusions} onToggle={toggleSec}>
                  {!!d.inclusions?.length && (
                    <>
                      <Text style={s.subH}>What's included</Text>
                      {d.inclusions.map((x, i) => (
                        <View key={i} style={s.bullet}>
                          <Ionicons name="checkmark" size={15} color={COLORS.success} />
                          <Text style={[s.bulletT, { marginLeft: 8 }]}>{x}</Text>
                        </View>
                      ))}
                    </>
                  )}
                  {!!d.exclusions?.length && (
                    <>
                      <Text style={[s.subH, { marginTop: d.inclusions?.length ? 12 : 0 }]}>
                        What's not included
                      </Text>
                      {d.exclusions.map((x, i) => (
                        <View key={i} style={s.bullet}>
                          <Ionicons name="close" size={15} color={COLORS.danger} />
                          <Text style={[s.bulletT, { marginLeft: 8 }]}>{x}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </Section>
              )}

              {(!!d.terms?.length || !!d.cancellation?.length) && (
                <Section id="terms" title="Terms & Cancellation" onLayout={onLayout} open={openSecs.terms} onToggle={toggleSec}>
                  {!!d.terms?.length && (
                    <>
                      <Text style={s.subH}>Terms & Conditions</Text>
                      {d.terms.slice(0, 12).map((x, i) => (
                        <View key={i} style={s.bullet}>
                          <Text style={s.dot}>{i + 1}.</Text>
                          <Text style={[s.bulletT, { marginLeft: 6 }]}>{x}</Text>
                        </View>
                      ))}
                    </>
                  )}
                  {!!d.cancellation?.length && (
                    <>
                      <Text style={[s.subH, { marginTop: 12 }]}>Cancellation Policy</Text>
                      {d.cancellation.map((x, i) => (
                        <View key={i} style={s.bullet}>
                          <Text style={s.dot}>•</Text>
                          <Text style={s.bulletT}>{x}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </Section>
              )}

              {!!d.similar?.length && (
                <Section id="similar" title="Similar Packages" onLayout={onLayout} collapsible={false}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {d.similar.map((p) => (
                      <TouchableOpacity
                        key={String(p.id)}
                        style={s.simCard}
                        onPress={() =>
                          navigation.push('HolidayDetail', { slug: p.slug, item: p })
                        }
                      >
                        {p.image ? (
                          <Image source={{ uri: p.image }} style={s.simImg} resizeMode="cover" />
                        ) : (
                          <View style={[s.simImg, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E2A47' }]}>
                            <Text style={{ fontSize: 32 }}>🌴</Text>
                          </View>
                        )}
                        <View style={{ padding: 10 }}>
                          <Text style={s.simT} numberOfLines={2}>
                            {p.title}
                          </Text>
                          <Text style={s.simP}>{inr(p.price)}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Section>
              )}

              <View style={{ height: 110 }} />
            </View>
          </ScrollView>

          <View style={[s.bookBar, { paddingBottom: Math.max(12, insets.bottom + 4) }]}>
            <View style={s.bookPriceWrap}>
              <Text style={s.bookPrice}>{inr(d.price)}</Text>
              <Text style={s.bookSub}>per person • Pay 25% to book</Text>
            </View>
            <View style={s.bookBtnWrap}>
              <PrimaryBtn
                title="Book Now"
                icon="checkmark-circle-outline"
                style={s.bookBtn}
                onPress={() => setShowBook(true)}
              />
            </View>
          </View>

          <Modal
            visible={showBook}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBook(false)}
          >
            <TouchableOpacity
              style={s.overlay}
              activeOpacity={1}
              onPress={() => setShowBook(false)}
            >
              <TouchableOpacity activeOpacity={1} style={s.sheet} onPress={() => {}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={s.sheetT}>Travellers</Text>

                  <TouchableOpacity
                    style={s.dropBtn}
                    onPress={() => setRoomDrop((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.dropT}>
                      0{rooms.length} Room{rooms.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={s.dropT}>{roomDrop ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {roomDrop && (
                    <View style={s.dropList}>
                      {[1, 2, 3].map((n) => (
                        <TouchableOpacity
                          key={n}
                          style={s.dropOpt}
                          onPress={() => setRoomCount(n)}
                        >
                          <Text style={s.dropOptT}>
                            0{n} Room{n > 1 ? 's' : ''}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {rooms.map((r, i) => (
                    <View key={i} style={s.roomBox}>
                      <Text style={s.roomT}>Room {i + 1}</Text>
                      <Stepper label="Adult" value={r.adults} onMinus={() => bump(i, 'adults', -1, 4)} onPlus={() => bump(i, 'adults', 1, 4)} />
                      <Stepper label="Child" value={r.children} onMinus={() => bump(i, 'children', -1, 3)} onPlus={() => bump(i, 'children', 1, 3)} />
                    </View>
                  ))}

                  <View style={s.tbl}>
                    <View style={s.tblRow}>
                      <Text style={s.tblHead}>Tour Passengers :</Text>
                      <View style={{ flex: 1 }}>
                        {rooms.map((r, i) => (
                          <Text key={i} style={s.tblVal}>
                            Room {i + 1}: Adult - {r.adults}, Child - {r.children}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <View style={s.tblRow}>
                      <Text style={s.tblHead}>Tour Cost (Per Person) :</Text>
                      <Text style={s.tblVal}>{inr(perPerson).replace('₹', '')}</Text>
                    </View>
                    <View style={s.tblRow}>
                      <Text style={s.tblHead}>Total Tour Cost :</Text>
                      <Text style={[s.tblVal, s.tblTotal]}>{inr(tourTotal).replace('₹', '')}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[s.bookBtn, s.sheetBtn, pax === 0 && s.sheetBtnOff]}
                    disabled={pax === 0}
                    onPress={() => {
                      setShowBook(false);
                      navigation.navigate('Checkout', {
                        type: 'Holiday',
                        title: d.title,
                        price: tourTotal,
                        meta: `${d.durationText}${d.state ? ` • ${d.state}` : ''} • ${pax} travellers • ${rooms.length} room${rooms.length > 1 ? 's' : ''}`,
                      });
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={s.sheetBtnT}>Book this Package</Text>
                  </TouchableOpacity>
                  {pax === 0 && (
                    <Text style={s.sheetHint}>Add at least 1 traveller to continue.</Text>
                  )}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topBar: { backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', padding: 12 },
  back: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  topT: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 15, marginHorizontal: 10 },
  hero: { height: 260 },
  count: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  countT: { color: '#fff', fontSize: 12, fontWeight: '700' },
  thumbs: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  thumb: { width: 72, height: 52, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', marginRight: 8 },
  thumbActive: { borderColor: COLORS.primary },
  thumbImg: { width: '100%', height: '100%' },
  tag: { color: COLORS.primaryText, fontWeight: '800', fontSize: 12 },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.secondary, marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border },
  price: { fontSize: 22, fontWeight: '900', color: COLORS.secondary },
  per: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  emi: { fontSize: 11, color: COLORS.primaryText, fontWeight: '700' },
  tabRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tabWrap: { backgroundColor: COLORS.bg },
  secHead: { flexDirection: 'row', alignItems: 'center' },
  tab: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  tabActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  tabT: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  tabTActive: { color: '#fff' },
  secCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOW },
  sec: { fontWeight: '900', color: COLORS.secondary, fontSize: 16, marginBottom: 10 },
  subH: { fontWeight: '800', color: COLORS.secondary, fontSize: 13, marginBottom: 8 },
  body: { color: COLORS.textLight, fontSize: 13.5, lineHeight: 21 },
  bullet: { flexDirection: 'row', marginBottom: 8, paddingRight: 4 },
  dot: { color: COLORS.primaryText, fontWeight: '900', marginRight: 8, fontSize: 14 },
  bulletT: { flex: 1, color: '#334155', fontSize: 13, lineHeight: 19 },
  dayCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  dayOpen: { borderColor: COLORS.primaryDark },
  dayHead: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, backgroundColor: '#fff' },
  dayBadge: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  dayBadgeT: { fontSize: 11, fontWeight: '800', color: COLORS.secondary },
  dayTitle: { flex: 1, fontWeight: '700', color: COLORS.secondary, fontSize: 13.5 },
  dayBody: { padding: 12, paddingTop: 4, backgroundColor: '#FAFBFC', borderTopWidth: 1, borderColor: COLORS.border },
  simCard: { width: 180, backgroundColor: '#F8FAFC', borderRadius: 12, marginRight: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  simImg: { width: '100%', height: 100 },
  simT: { fontWeight: '800', color: COLORS.secondary, fontSize: 12 },
  simP: { fontWeight: '900', color: COLORS.secondary, fontSize: 14, marginTop: 4 },
  bookBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookPriceWrap: { flexShrink: 0 },
  bookBtnWrap: { flex: 1 },
  bookBtn: { marginTop: 0, height: 50 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 16, padding: 18, maxHeight: '88%', ...SHADOW_LG },
  sheetT: { fontSize: 19, fontWeight: '900', color: COLORS.secondary, marginBottom: 12 },
  dropBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  dropT: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  dropList: { borderWidth: 1, borderTopWidth: 0, borderColor: COLORS.border, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: '#fff' },
  dropOpt: { paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderColor: COLORS.border },
  dropOptT: { fontSize: 15, color: COLORS.text },
  roomBox: { marginTop: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, backgroundColor: '#FAFBFC' },
  roomT: { fontWeight: '800', color: COLORS.secondary, fontSize: 14, marginBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  stepLbl: { fontSize: 14, color: COLORS.text },
  stepCtl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnT: { fontSize: 18, fontWeight: '800', color: COLORS.secondary, marginTop: -2 },
  stepVal: { fontSize: 15, fontWeight: '800', color: COLORS.secondary, minWidth: 20, textAlign: 'center' },
  tbl: { marginTop: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  tblRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tblHead: { flex: 1, fontSize: 14, color: COLORS.text, padding: 12 },
  tblVal: { flex: 1, fontSize: 14, color: COLORS.text, padding: 12, borderLeftWidth: 1, borderColor: COLORS.border },
  tblTotal: { fontWeight: '900', color: COLORS.secondary, fontSize: 16 },
  sheetBtn: { backgroundColor: COLORS.primary, borderRadius: 8, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderWidth: 1, borderColor: COLORS.primaryDark },
  sheetBtnT: { color: '#000', fontWeight: '900', fontSize: 16 },
  sheetBtnOff: { opacity: 0.5 },
  sheetHint: { fontSize: 12, color: COLORS.danger, textAlign: 'center', marginTop: 8 },
  bookPrice: { fontSize: 20, fontWeight: '900', color: COLORS.secondary },
  bookSub: { fontSize: 11, color: COLORS.textLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  muted: { fontSize: 12, color: COLORS.textLight },
  errT: { fontWeight: '800', color: COLORS.secondary, fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 24, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  retryT: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
