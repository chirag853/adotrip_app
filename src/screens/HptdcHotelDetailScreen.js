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
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../theme';
import { fetchHptdcHotelDetail } from '../utils/hptdcApi';

const W = Dimensions.get('window').width;
const HERO_H = 250;
const BLUE = '#0284C7';
const NAVY = COLORS.secondary;
const MUTED = '#64748B';
const BORDER = '#E5E7EB';
const PAGE_BG = '#F4F6FB';

const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const imageSource = (value) => (typeof value === 'string' ? { uri: value } : value);

function Gallery({ images, badge, badgeColor }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  const scroller = useRef(null);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  const listKey = list.join('|');

  useEffect(() => {
    setIndex(0);
    setFailed({});
  }, [listKey]);

  const goTo = (i) => {
    setIndex(i);
    scroller.current?.scrollTo({ x: i * W, animated: true });
  };

  return (
    <View>
      <View style={s.heroWrap}>
        {list.length ? (
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const next = Math.round(e.nativeEvent.contentOffset.x / W);
              setIndex(Math.max(0, Math.min(next, list.length - 1)));
            }}
          >
            {list.map((uri, i) =>
              failed[i] ? (
                <View key={`${uri}-${i}`} style={[s.hero, s.heroPlaceholder, { width: W }]}>
                  <Ionicons name="image-outline" size={42} color="#94A3B8" />
                </View>
              ) : (
                <Image
                  key={`${uri}-${i}`}
                  source={imageSource(uri)}
                  style={[s.hero, { width: W }]}
                  resizeMode="cover"
                  onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
                />
              )
            )}
          </ScrollView>
        ) : (
          <View style={[s.hero, s.heroPlaceholder, { width: W }]}>
            <Ionicons name="image-outline" size={42} color="#94A3B8" />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(2,6,23,0.72)']}
          style={s.heroGradient}
          pointerEvents="none"
        />

        {badge ? (
          <View style={[s.heroBadge, { backgroundColor: badgeColor || BLUE }]}>
            <Text style={s.heroBadgeText}>{badge}</Text>
          </View>
        ) : null}

        {list.length > 1 ? (
          <View style={s.heroCount}>
            <Ionicons name="images-outline" size={13} color="#FFFFFF" />
            <Text style={s.heroCountText}>
              {index + 1}/{list.length}
            </Text>
          </View>
        ) : null}
      </View>

      {list.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.thumbs}
        >
          {list.map((uri, i) => (
            <TouchableOpacity
              key={`${uri}-thumb-${i}`}
              activeOpacity={0.85}
              onPress={() => goTo(i)}
              style={[s.thumb, index === i && s.thumbActive]}
            >
              {failed[i] ? (
                <View style={[s.thumbImg, s.thumbPlaceholder]}>
                  <Ionicons name="image-outline" size={16} color="#94A3B8" />
                </View>
              ) : (
                <Image source={imageSource(uri)} style={s.thumbImg} resizeMode="cover" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
  collapsible = false,
  open = true,
  onToggle,
}) {
  const isOpen = collapsible ? open : true;

  return (
    <View style={s.section}>
      <TouchableOpacity
        style={[s.sectionHead, { marginBottom: isOpen ? 12 : 0 }]}
        activeOpacity={collapsible ? 0.7 : 1}
        disabled={!collapsible}
        onPress={() => collapsible && onToggle?.(id)}
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={collapsible ? { expanded: isOpen } : undefined}
      >
        <View style={s.sectionTitleWrap}>
          <Text style={s.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={s.sectionSub}>{subtitle}</Text> : null}
        </View>
        {collapsible ? (
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={BLUE}
          />
        ) : null}
      </TouchableOpacity>
      {isOpen ? children : null}
    </View>
  );
}

function ContactButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={s.contactBtn} activeOpacity={0.85} onPress={onPress}>
      <Ionicons name={icon} size={15} color={BLUE} />
      <Text style={s.contactBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function RoomCard({ room, onBook }) {
  const note = /breakfast/i.test(room.tariff) ? 'Breakfast included' : 'Government tariff';
  return (
    <View style={s.roomCard}>
      <View style={s.roomTop}>
        <View style={s.roomInfo}>
          <Text style={s.roomName}>{room.name}</Text>
          <Text style={s.roomNote}>{note}</Text>
          <View style={s.roomMetaRow}>
            <Text style={s.roomMeta}>{room.taxesExtra ? '+ taxes extra' : 'Taxes included'}</Text>
            <Text style={s.roomMetaDot}>•</Text>
            <Text style={s.roomMeta}>
              {room.totalRooms ? `${room.totalRooms} rooms` : 'Live availability'}
            </Text>
          </View>
        </View>
        <View style={s.roomPriceBox}>
          {room.price && room.cutPrice > room.price ? (
            <Text style={s.roomCut}>{inr(room.cutPrice)}</Text>
          ) : null}
          <Text style={s.roomPrice}>{room.price ? inr(room.price) : 'On request'}</Text>
          {room.price ? <Text style={s.roomPer}>/ night</Text> : null}
        </View>
      </View>

      {room.facilities.length ? (
        <View style={s.roomFacilities}>
          {room.facilities.slice(0, 4).map((facility) => (
            <View key={facility} style={s.roomFacilityRow}>
              <View style={s.roomBullet} />
              <Text style={s.roomFacility} numberOfLines={2}>
                {facility}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity style={s.roomBookBtn} activeOpacity={0.88} onPress={() => onBook(room)}>
        <Text style={s.roomBookText}>BOOK ROOM</Text>
      </TouchableOpacity>
    </View>
  );
}

function fallbackDetail(item) {
  if (!item) return null;
  const images = [...new Set([item.image, ...(Array.isArray(item.gallery) ? item.gallery : [])].filter(Boolean))];
  const facilities = Array.isArray(item.facilitiesRaw)
    ? item.facilitiesRaw
    : (Array.isArray(item.facilities) ? item.facilities : [])
        .map((f) => (typeof f === 'string' ? f : f?.label))
        .filter(Boolean);

  return {
    id: String(item.id || item.slug || ''),
    name: item.name || 'HPTDC Hotel',
    slug: item.slug || '',
    circuit: item.circuit || '',
    hotelType: item.hotelType || '',
    class: item.class || '',
    className: item.className || item.class || '',
    badge: item.badge || 'HPTDC',
    badgeColor: item.badgeColor || '#2563EB',
    location: item.location || '',
    subHeading: item.subHeading || '',
    notes: '',
    about: item.desc ? [item.desc] : [],
    faqs: [],
    image: images[0] || '',
    images,
    gallery: images.slice(1),
    facilities: [...new Set(facilities)],
    nearbyAttractions: [],
    contact: {
      phone: String(item.contact?.phone || '').trim(),
      email: String(item.contact?.email || '').trim(),
      fax: String(item.contact?.fax || '').trim(),
    },
    roomsCount: Number(item.rooms) || 0,
    startingPrice: Number(item.price) || 0,
    rooms: [],
    webUrl: item.webUrl || '',
    detailUrl: item.detailUrl || '',
    coupon: null,
  };
}

export default function HptdcHotelDetailScreen({ navigation, route }) {
  const slug = String(route.params?.slug || route.params?.item?.slug || '').trim();
  const fallback = fallbackDetail(route.params?.item);
  const similar = Array.isArray(route.params?.similar) ? route.params.similar : [];

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({ about: false, faqs: false });
  const [showStickyName, setShowStickyName] = useState(false);
  const stickyNameRef = useRef(false);

  const load = useCallback(
    async (signal) => {
      if (!slug) {
        setLoading(false);
        setError(new Error('Hotel not found.'));
        return;
      }

      setLoading(true);
      setError(null);
      setDetail(null);

      try {
        const data = await fetchHptdcHotelDetail({ slug, signal });
        if (signal?.aborted) return;
        setDetail(data);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(e);
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

  const d = detail || fallback;
  const retry = () => load();
  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const onScroll = (e) => {
    const next = e.nativeEvent.contentOffset.y > 110;
    if (next === stickyNameRef.current) return;
    stickyNameRef.current = next;
    setShowStickyName(next);
  };

  const openLink = async (url) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', 'This link is not available on this device.');
    }
  };

  const callHotel = () => {
    const phone = String(d?.contact?.phone || '')
      .split(',')[0]
      .replace(/[^\d+]/g, '');
    if (phone) openLink(`tel:${phone}`);
    else Alert.alert('Contact', 'Phone number is not available for this hotel.');
  };

  const emailHotel = () => {
    if (d?.contact?.email) openLink(`mailto:${d.contact.email}`);
    else Alert.alert('Contact', 'Email is not available for this hotel.');
  };

  const openMap = () => {
    const query = encodeURIComponent([d?.name, d?.location].filter(Boolean).join(', '));
    openLink(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const openBooking = (room) => {
    if (!d) return;
    navigation.navigate('HptdcBooking', {
      slug: d.slug,
      hotel: d,
      room: room || (d.rooms && d.rooms[0]) || null,
    });
  };

  const openSimilar = (hotel) => {
    if (!hotel?.slug) return;
    navigation.push('HptdcHotelDetail', {
      slug: hotel.slug,
      item: hotel,
      similar: similar.filter((h) => h.slug !== hotel.slug),
    });
  };

  if (!d) {
    return (
      <SafeAreaView edges={['top']} style={s.safe}>
        <StatusBar style="dark" />
        <AppHeader title="Hotel Details" onBack={() => navigation.goBack()} />
        <View style={s.center}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={BLUE} />
              <Text style={s.centerTitle}>Loading hotel details…</Text>
              <Text style={s.centerText}>Live HPTDC data from Adotrip</Text>
            </>
          ) : (
            <>
              <Text style={s.centerEmoji}>⚠️</Text>
              <Text style={s.centerTitle}>Couldn't load this hotel</Text>
              <Text style={s.centerText}>{error?.message || 'Hotel not found.'}</Text>
              <TouchableOpacity style={s.retryBtn} activeOpacity={0.85} onPress={retry}>
                <Text style={s.retryText}>RETRY</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const phone = String(d.contact?.phone || '').trim();
  const email = String(d.contact?.email || '').trim();
  const hasContact = Boolean(phone || email || d.webUrl);
  const faqs = Array.isArray(d.faqs) ? d.faqs : [];
  const about = Array.isArray(d.about) ? d.about : [];
  const facilities = Array.isArray(d.facilities) ? d.facilities : [];
  const nearby = Array.isArray(d.nearbyAttractions) ? d.nearbyAttractions : [];
  const rooms = Array.isArray(d.rooms) ? d.rooms : [];

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar style="dark" />
      {showStickyName ? (
        <View style={s.stickyHeader}>
          <TouchableOpacity
            style={s.stickyBack}
            onPress={() => navigation.goBack()}
            hitSlop={8}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={NAVY} />
          </TouchableOpacity>
          <Text style={s.stickyTitle} numberOfLines={1}>
            {d.name}
          </Text>
          <View style={s.stickySpacer} />
        </View>
      ) : (
        <AppHeader
          title="Hotel Details"
          subtitle={d.circuit || 'Himachal Tourism'}
          onBack={() => navigation.goBack()}
        />
      )}

      {loading ? (
        <View style={s.loadingStrip}>
          <ActivityIndicator size="small" color={BLUE} />
          <Text style={s.loadingStripText}>Loading live hotel details…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={s.errorStrip}>
          <Ionicons name="alert-circle-outline" size={16} color="#B45309" />
          <Text style={s.errorStripText} numberOfLines={2}>
            {error.message}
          </Text>
          <TouchableOpacity onPress={retry} hitSlop={8}>
            <Text style={s.errorRetry}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Gallery images={d.images} badge={d.badge} badgeColor={d.badgeColor} />

        <View style={s.content}>
          <View style={s.titleCard}>
            <Text style={s.name}>{d.name}</Text>
            <View style={s.locationRow}>
              <Ionicons name="location" size={14} color="#EF4444" />
              <Text style={s.location}>{d.location}</Text>
            </View>
            <Text style={s.type}>{[d.hotelType, d.circuit].filter(Boolean).join(' • ')}</Text>

            {d.subHeading ? (
              <View style={s.guarantee}>
                <Ionicons name="shield-checkmark" size={15} color={COLORS.success} />
                <Text style={s.guaranteeText}>{d.subHeading}</Text>
              </View>
            ) : null}

            <View style={s.factRow}>
              <View style={s.fact}>
                <Ionicons name="bed-outline" size={15} color={BLUE} />
                <Text style={s.factText}>
                  {d.roomsCount ? `${d.roomsCount} room types` : 'Rooms on request'}
                </Text>
              </View>
              <View style={s.fact}>
                <Ionicons name="pricetag-outline" size={15} color={BLUE} />
                <Text style={s.factText}>
                  {d.startingPrice ? `From ${inr(d.startingPrice)}` : 'Tariff on request'}
                </Text>
              </View>
            </View>

            {hasContact ? (
              <View style={s.contactRow}>
                {phone ? (
                  <ContactButton icon="call-outline" label="Call hotel" onPress={callHotel} />
                ) : null}
                {email ? (
                  <ContactButton icon="mail-outline" label="Email" onPress={emailHotel} />
                ) : null}
                {d.webUrl ? (
                  <ContactButton
                    icon="globe-outline"
                    label="Website"
                    onPress={() => openLink(d.webUrl)}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          {rooms.length ? (
            <Section
              title="Rooms & Tariffs"
              subtitle={`${rooms.length} room types · Government rates`}
            >
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onBook={openBooking} />
              ))}
            </Section>
          ) : null}

          {facilities.length ? (
            <Section title="Amenities" subtitle={`${facilities.length} facilities at the property`}>
              <View style={s.facilityGrid}>
                {facilities.map((facility) => (
                  <View key={facility} style={s.facilityItem}>
                    <Ionicons name="checkmark-circle" size={15} color={BLUE} />
                    <Text style={s.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {nearby.length ? (
            <Section title="Nearby Attractions">
              {nearby.map((item, idx) => (
                <View key={`${item}-${idx}`} style={s.nearbyRow}>
                  <Ionicons name="navigate-circle-outline" size={18} color={BLUE} />
                  <Text style={s.nearbyText}>{item}</Text>
                </View>
              ))}
            </Section>
          ) : null}

          <Section title="Location">
            <Text style={s.address}>{d.location}</Text>
            <TouchableOpacity style={s.mapBtn} activeOpacity={0.88} onPress={openMap}>
              <Ionicons name="map-outline" size={16} color={BLUE} />
              <Text style={s.mapBtnText}>OPEN IN GOOGLE MAPS</Text>
            </TouchableOpacity>
          </Section>

          {about.length ? (
            <Section
              id="about"
              title="About this hotel"
              subtitle={openSections.about ? 'Tap to collapse' : 'Tap to read more'}
              collapsible
              open={!!openSections.about}
              onToggle={toggleSection}
            >
              {about.map((paragraph, idx) => (
                <Text key={`${paragraph.slice(0, 24)}-${idx}`} style={s.aboutText}>
                  {paragraph}
                </Text>
              ))}
              {d.notes ? (
                <View style={s.noteBox}>
                  <Ionicons name="bulb-outline" size={16} color="#B45309" />
                  <Text style={s.noteText}>{d.notes}</Text>
                </View>
              ) : null}
            </Section>
          ) : null}

          {faqs.length ? (
            <Section
              id="faqs"
              title="Frequently Asked Questions"
              subtitle={
                openSections.faqs
                  ? 'Tap to collapse'
                  : `${faqs.length} questions · Tap to open`
              }
              collapsible
              open={!!openSections.faqs}
              onToggle={toggleSection}
            >
              {faqs.map((faq, idx) => (
                <View key={`${faq.q}-${idx}`} style={[s.faqItem, idx > 0 && s.faqDivider]}>
                  <Text style={s.faqQ}>{faq.q}</Text>
                  <Text style={s.faqA}>{faq.a}</Text>
                </View>
              ))}
            </Section>
          ) : null}

          {similar.length ? (
            <Section title="Similar HPTDC Hotels">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.similarRow}
              >
                {similar.map((hotel) => (
                  <TouchableOpacity
                    key={hotel.slug || hotel.id}
                    style={s.similarCard}
                    activeOpacity={0.88}
                    onPress={() => openSimilar(hotel)}
                  >
                    {hotel.image ? (
                      <Image
                        source={imageSource(hotel.image)}
                        style={s.similarImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[s.similarImg, s.similarImgEmpty]}>
                        <Ionicons name="image-outline" size={24} color="#94A3B8" />
                      </View>
                    )}
                    <View style={s.similarBody}>
                      <Text style={s.similarName} numberOfLines={2}>
                        {hotel.name}
                      </Text>
                      <Text style={s.similarPrice}>
                        {hotel.price ? inr(hotel.price) : 'On request'}
                        {hotel.price ? <Text style={s.similarPer}> / night</Text> : null}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>
          ) : null}
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <View style={s.bottomPriceWrap}>
          <Text style={s.bottomFrom}>FROM</Text>
          <Text style={s.bottomPrice}>
            {d.startingPrice ? inr(d.startingPrice) : 'On request'}
            {d.startingPrice ? <Text style={s.bottomPer}> / night</Text> : null}
          </Text>
        </View>
        <TouchableOpacity
          style={s.bookNow}
          activeOpacity={0.88}
          onPress={() => openBooking(null)}
        >
          <Text style={s.bookNowText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  stickyHeader: {
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
  },
  stickyBack: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6FB',
  },
  stickyTitle: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: -0.2,
  },
  stickySpacer: { width: 34, height: 34 },

  heroWrap: {
    height: HERO_H,
    width: '100%',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  hero: { height: HERO_H, backgroundColor: '#E2E8F0' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    left: 16,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  heroCount: {
    position: 'absolute',
    right: 16,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(2,6,23,0.62)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  heroCountText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  thumbs: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  thumb: {
    width: 64,
    height: 46,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: BLUE },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2E8F0' },

  content: { padding: 16, paddingTop: 14 },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  location: { flex: 1, fontSize: 12, lineHeight: 18, color: MUTED, marginLeft: 4 },
  type: {
    fontSize: 10.5,
    fontWeight: '800',
    color: BLUE,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 6,
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 9,
    padding: 10,
    marginTop: 12,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#065F46',
    fontWeight: '600',
  },
  factRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  factText: { fontSize: 11.5, color: NAVY, fontWeight: '700' },
  contactRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  contactBtn: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  contactBtnText: { fontSize: 10.5, fontWeight: '800', color: BLUE },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitleWrap: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: NAVY, letterSpacing: -0.2 },
  sectionSub: { fontSize: 10.5, color: MUTED, marginTop: 3 },

  roomCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  roomTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 13.5, fontWeight: '800', color: NAVY, lineHeight: 18 },
  roomNote: { fontSize: 10.5, color: '#059669', fontWeight: '700', marginTop: 3 },
  roomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  roomMeta: { fontSize: 10, color: MUTED },
  roomMetaDot: { fontSize: 10, color: '#CBD5E1' },
  roomPriceBox: { alignItems: 'flex-end', minWidth: 76 },
  roomCut: { fontSize: 10, color: '#94A3B8', textDecorationLine: 'line-through' },
  roomPrice: { fontSize: 16, fontWeight: '900', color: NAVY, marginTop: 1 },
  roomPer: { fontSize: 9, color: MUTED, marginTop: 1 },
  roomFacilities: { marginTop: 10, gap: 4 },
  roomFacilityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  roomBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BLUE,
    marginTop: 6,
  },
  roomFacility: { flex: 1, fontSize: 10.5, lineHeight: 15, color: '#475569' },
  roomBookBtn: {
    marginTop: 12,
    height: 38,
    borderRadius: 8,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBookText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },

  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  facilityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingRight: 8,
    marginBottom: 9,
  },
  facilityText: { flex: 1, fontSize: 11, lineHeight: 16, color: '#334155' },

  nearbyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 9 },
  nearbyText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#334155' },

  address: { fontSize: 12.5, lineHeight: 19, color: '#334155' },
  mapBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapBtnText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3, color: BLUE },

  aboutText: { fontSize: 12, lineHeight: 19, color: '#334155', marginBottom: 9 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 9,
    padding: 10,
    marginTop: 2,
  },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16, color: '#92400E' },

  faqItem: { paddingVertical: 2 },
  faqDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 12, paddingTop: 12 },
  faqQ: { fontSize: 12.5, fontWeight: '800', color: NAVY, lineHeight: 18 },
  faqA: { fontSize: 11.5, lineHeight: 17, color: '#475569', marginTop: 4 },

  similarRow: { gap: 10, paddingRight: 4 },
  similarCard: {
    width: 190,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  similarImg: { width: '100%', height: 100, backgroundColor: '#E2E8F0' },
  similarImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  similarBody: { padding: 10 },
  similarName: { fontSize: 12, fontWeight: '800', color: NAVY, lineHeight: 16, minHeight: 32 },
  similarPrice: { fontSize: 12, fontWeight: '900', color: NAVY, marginTop: 6 },
  similarPer: { fontSize: 9, fontWeight: '400', color: MUTED },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  bottomPriceWrap: { flex: 1 },
  bottomFrom: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6, color: MUTED },
  bottomPrice: { fontSize: 17, fontWeight: '900', color: NAVY, marginTop: 1 },
  bottomPer: { fontSize: 10, fontWeight: '400', color: MUTED },
  bookNow: {
    height: 48,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5, color: COLORS.onPrimary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerEmoji: { fontSize: 38, marginBottom: 10 },
  centerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
    marginTop: 12,
  },
  centerText: {
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'center',
    marginTop: 6,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: BLUE,
    borderRadius: 9,
    paddingHorizontal: 24,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#FFFFFF' },

  loadingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingStripText: { fontSize: 11, color: '#1D4ED8', fontWeight: '600' },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorStripText: { flex: 1, fontSize: 10.5, lineHeight: 15, color: '#92400E' },
  errorRetry: { fontSize: 10, fontWeight: '900', color: '#B45309' },
});
