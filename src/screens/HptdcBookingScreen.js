import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AdoLogo from '../components/AdoLogo';
import { COLORS } from '../theme';
import { fetchHptdcHotelDetail } from '../utils/hptdcApi';

const PAGE_BG = '#FFFFFF';
const NAVY = COLORS.secondary;
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const FIELD_BG = '#F3F4F6';
const YELLOW = COLORS.primary;
const GREEN = '#059669';
const GOLD = '#B45309';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtDate = (d) => (d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '');

const addDays = (base, days) => {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const buildDates = () => {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 90; i += 1) out.push(addDays(base, i));
  return out;
};

const DATES = buildDates();

const STATES = [
  'Himachal Pradesh',
  'Delhi',
  'Punjab',
  'Haryana',
  'Chandigarh',
  'Uttarakhand',
  'Uttar Pradesh',
  'Rajasthan',
  'Jammu & Kashmir',
  'Ladakh',
  'Maharashtra',
  'Gujarat',
  'West Bengal',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
  'Assam',
];

function TopBar({ onClose }) {
  return (
    <View style={s.topBar}>
      <AdoLogo width={90} />
      <TouchableOpacity
        style={s.closeBtn}
        onPress={onClose}
        activeOpacity={0.8}
        accessibilityLabel="Close booking form"
      >
        <Ionicons name="close" size={20} color={NAVY} />
      </TouchableOpacity>
    </View>
  );
}

function PillField({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  style,
}) {
  return (
    <View style={[s.field, style]}>
      <Ionicons name={icon} size={15} color={MUTED} />
      <TextInput
        style={s.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
        autoCorrect={false}
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

function DateField({ date, placeholder, onPress }) {
  return (
    <TouchableOpacity style={[s.field, { flex: 1 }]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="calendar-outline" size={15} color={MUTED} />
      <Text style={[s.fieldText, !date && s.fieldPlaceholder]} numberOfLines={1}>
        {date ? fmtDate(date) : placeholder}
      </Text>
    </TouchableOpacity>
  );
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <View style={s.stepperRow}>
      <Text style={s.stepperLabel}>{label}</Text>
      <View style={s.stepper}>
        <TouchableOpacity
          style={[s.stepBtn, value <= min && s.stepBtnOff]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.8}
        >
          <Ionicons name="remove" size={16} color={value <= min ? '#C4C9D4' : NAVY} />
        </TouchableOpacity>
        <Text style={s.stepValue}>{value}</Text>
        <TouchableOpacity
          style={[s.stepBtn, value >= max && s.stepBtnOff]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={value >= max ? '#C4C9D4' : NAVY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HptdcBookingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialRoom = route.params?.room || null;
  const routeHotel = route.params?.hotel || null;
  const slug = String(route.params?.slug || routeHotel?.slug || '').trim();

  const [hotel, setHotel] = useState(routeHotel);
  const [room, setRoom] = useState(initialRoom);
  const [loading, setLoading] = useState(!initialRoom || !routeHotel?.name);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (signal) => {
      if (initialRoom && routeHotel?.name) {
        setLoading(false);
        return;
      }
      if (!slug) {
        setLoading(false);
        setError(new Error('Room details are not available for this hotel.'));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHptdcHotelDetail({ slug, signal });
        if (signal?.aborted) return;
        setHotel(data);
        if (initialRoom) {
          setRoom(initialRoom);
        } else {
          const firstRoom = data.rooms && data.rooms[0];
          if (!firstRoom) throw new Error('Rooms are not available for this hotel right now.');
          setRoom(firstRoom);
        }
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(e);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [initialRoom, routeHotel, slug]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const [checkIn, setCheckIn] = useState(() => addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState(() => addDays(new Date(), 3));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstEmail, setGstEmail] = useState('');
  const [gstMobile, setGstMobile] = useState('');
  const [address, setAddress] = useState('');
  const [guestState, setGuestState] = useState('Himachal Pradesh');
  const [coupon, setCoupon] = useState('SUMMERHILLS');
  const [appliedCoupon, setAppliedCoupon] = useState('SUMMERHILLS');
  const [couponError, setCouponError] = useState('');
  const [dateField, setDateField] = useState(null);
  const [guestOpen, setGuestOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  const displayHotel = hotel || routeHotel || {};
  const displayRoom = room || {};
  const nights = checkIn && checkOut ? Math.max(1, Math.round((checkOut - checkIn) / 86400000)) : 0;
  const unitPrice = Number(displayRoom.price || displayHotel.startingPrice || 0);
  const subtotal = unitPrice * (nights || 1);
  const discount = appliedCoupon ? Math.min(1000, Math.round(subtotal * 0.1)) : 0;
  const total = Math.max(0, subtotal - discount);

  const pickDate = (d) => {
    if (dateField === 'in') {
      setCheckIn(d);
      if (checkOut && checkOut <= d) setCheckOut(addDays(d, 2));
    } else if (dateField === 'out') {
      setCheckOut(d);
    }
    setDateField(null);
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon('');
      setCouponError('Enter a coupon code.');
      return;
    }
    if (code === 'SUMMERHILLS') {
      setCoupon(code);
      setAppliedCoupon(code);
      setCouponError('');
      return;
    }
    setAppliedCoupon('');
    setCouponError('This coupon code is not valid.');
  };

  const proceed = () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Select dates', 'Please choose your check-in and check-out dates.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Full name required', 'Please enter the guest full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Email required', 'Please enter a valid email address.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Phone required', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    navigation.navigate('Checkout', {
      type: 'Hotel',
      title: displayHotel.name,
      price: total,
      meta: `${displayRoom.name || 'Room'} • ${fmtDate(checkIn)} → ${fmtDate(checkOut)} • ${rooms} Room${
        rooms > 1 ? 's' : ''
      }, ${guests} Guest${guests > 1 ? 's' : ''}`,
      discount: 0,
      promoCode: '',
      guestName: name.trim(),
      guestPhone: phone.trim(),
    });
  };

  if (loading || (!room && !error)) {
    return (
      <SafeAreaView edges={['top']} style={s.safe}>
        <StatusBar style="dark" />
        <TopBar onClose={() => navigation.goBack()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primaryText} />
          <Text style={s.centerTitle}>Loading room details…</Text>
          <Text style={s.centerText}>{displayHotel.name || 'HPTDC hotel'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView edges={['top']} style={s.safe}>
        <StatusBar style="dark" />
        <TopBar onClose={() => navigation.goBack()} />
        <View style={s.center}>
          <Text style={s.centerEmoji}>⚠️</Text>
          <Text style={s.centerTitle}>Couldn't load rooms</Text>
          <Text style={s.centerText}>
            {error?.message || 'Room details are not available for this hotel.'}
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load()} activeOpacity={0.88}>
            <Text style={s.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar style="dark" />
      <TopBar onClose={() => navigation.goBack()} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroIcon}>
          <Ionicons name="calendar" size={26} color={NAVY} />
        </View>
        <Text style={s.hotelName}>{displayHotel.name}</Text>
        <Text style={s.roomName}>({displayRoom.name})</Text>
        <View style={s.badge}>
          <Ionicons name="shield-checkmark" size={13} color={GOLD} />
          <Text style={s.badgeText}>Official HPTDC Booking • Guaranteed Govt Rate</Text>
        </View>

        <View style={s.row}>
          <DateField date={checkIn} placeholder="Check-in" onPress={() => setDateField('in')} />
          <DateField date={checkOut} placeholder="Check-out" onPress={() => setDateField('out')} />
        </View>

        <View style={s.row}>
          <PillField
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            style={{ flex: 1 }}
          />
          <PillField
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
        </View>

        <View style={s.row}>
          <PillField
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            style={[s.field, { flex: 1 }]}
            onPress={() => setGuestOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={15} color={MUTED} />
            <Text style={s.fieldText} numberOfLines={1}>
              {rooms} Room{rooms > 1 ? 's' : ''}, {guests} Guest{guests > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>GST Details (Optional)</Text>

        <View style={s.row}>
          <PillField
            icon="document-text-outline"
            value={gstin}
            onChangeText={setGstin}
            placeholder="GSTIN"
            autoCapitalize="characters"
            style={{ flex: 1 }}
          />
          <PillField
            icon="business-outline"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Company Name"
            style={{ flex: 1 }}
          />
        </View>

        <View style={s.row}>
          <PillField
            icon="mail-outline"
            value={gstEmail}
            onChangeText={setGstEmail}
            placeholder="GST Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
          <PillField
            icon="call-outline"
            value={gstMobile}
            onChangeText={setGstMobile}
            placeholder="GST Mobile Number"
            keyboardType="phone-pad"
            style={{ flex: 1 }}
          />
        </View>

        <View style={s.row}>
          <PillField
            icon="location-outline"
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            style={[s.field, { flex: 1 }]}
            onPress={() => setStateOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={15} color={MUTED} />
            <Text style={s.fieldText} numberOfLines={1}>
              {guestState}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={s.couponRow}>
          <View style={s.couponField}>
            <Ionicons name="ticket-outline" size={15} color={MUTED} />
            <TextInput
              style={s.couponInput}
              value={coupon}
              onChangeText={(v) => {
                setCoupon(v);
                setCouponError('');
              }}
              placeholder="Coupon code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
          </View>
          <TouchableOpacity style={s.applyBtn} onPress={applyCoupon} activeOpacity={0.88}>
            <Text style={s.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {appliedCoupon ? (
          <View style={s.couponSuccess}>
            <Ionicons name="checkmark-circle" size={13} color={GREEN} />
            <Text style={s.couponSuccessText}>
              {appliedCoupon} applied • Extra savings unlocked!
            </Text>
          </View>
        ) : null}
        {couponError ? <Text style={s.couponError}>{couponError}</Text> : null}

        <View style={s.summary}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal</Text>
            <Text style={s.summaryValue}>INR {subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {discount > 0 ? (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Coupon Discount</Text>
              <Text style={[s.summaryValue, { color: GREEN }]}>
                - INR {discount.toLocaleString('en-IN')}
              </Text>
            </View>
          ) : null}
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>
              GST (0%) <Text style={s.summaryMuted}>(Govt. Inclusive)</Text>
            </Text>
            <Text style={s.summaryValue}>INR 0</Text>
          </View>
          <View style={[s.summaryRow, s.summaryTotal]}>
            <Text style={s.summaryTotalLabel}>Total</Text>
            <Text style={s.summaryTotalValue}>INR {total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={s.payBtn} activeOpacity={0.9} onPress={proceed}>
          <Text style={s.payBtnText}>Proceed to Pay • INR {total.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
        <View style={s.secureRow}>
          <Ionicons name="lock-closed" size={11} color={GREEN} />
          <Text style={s.secureText}>256-Bit SSL Encrypted</Text>
          <View style={s.secureDot} />
          <Ionicons name="flash" size={11} color="#D97706" />
          <Text style={s.secureText}>Instant Guest Slip</Text>
        </View>
      </View>

      <Modal
        visible={!!dateField}
        transparent
        animationType="slide"
        onRequestClose={() => setDateField(null)}
      >
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={() => setDateField(null)} />
          <View style={[s.sheet, { maxHeight: '72%', paddingBottom: Math.max(insets.bottom, 18) }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>
                {dateField === 'in' ? 'Select check-in date' : 'Select check-out date'}
              </Text>
              <TouchableOpacity onPress={() => setDateField(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {DATES.map((d) => {
                const disabled = dateField === 'out' && checkIn ? d <= checkIn : false;
                const selected =
                  dateField === 'in'
                    ? checkIn && d.getTime() === checkIn.getTime()
                    : checkOut && d.getTime() === checkOut.getTime();
                return (
                  <TouchableOpacity
                    key={d.toISOString()}
                    disabled={disabled}
                    onPress={() => pickDate(d)}
                    style={[
                      s.dateOption,
                      selected && s.dateOptionActive,
                      disabled && { opacity: 0.32 },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View>
                      <Text style={[s.dateOptionMain, selected && { color: COLORS.primaryText }]}>
                        {fmtDate(d)}
                      </Text>
                      <Text style={s.dateOptionSub}>{WEEKDAYS[d.getDay()]}</Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={19} color={COLORS.primaryText} />
                    ) : null}
                    {disabled ? <Text style={s.dateDisabled}>Unavailable</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={guestOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setGuestOpen(false)}
      >
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={() => setGuestOpen(false)} />
          <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>Rooms &amp; Guests</Text>
              <TouchableOpacity onPress={() => setGuestOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>
            <Stepper
              label="Rooms"
              value={rooms}
              min={1}
              max={5}
              onChange={(v) => {
                setRooms(v);
                setGuests((g) => Math.max(g, v));
              }}
            />
            <Stepper label="Guests" value={guests} min={1} max={10} onChange={setGuests} />
            <TouchableOpacity
              style={s.doneBtn}
              onPress={() => setGuestOpen(false)}
              activeOpacity={0.88}
            >
              <Text style={s.doneBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={stateOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStateOpen(false)}
      >
        <View style={s.modalRoot}>
          <Pressable style={s.backdrop} onPress={() => setStateOpen(false)} />
          <View style={[s.sheet, { maxHeight: '70%', paddingBottom: Math.max(insets.bottom, 18) }]}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStateOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {STATES.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={s.stateOption}
                  onPress={() => {
                    setGuestState(st);
                    setStateOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.stateOptionText, st === guestState && s.stateOptionActive]}>
                    {st}
                  </Text>
                  {st === guestState ? (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryText} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  topBar: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: PAGE_BG,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: FIELD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  centerEmoji: { fontSize: 42, marginBottom: 8 },
  centerTitle: { fontSize: 16, fontWeight: '800', color: NAVY, textAlign: 'center', marginTop: 12 },
  centerText: { fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  retryBtn: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { fontSize: 11, fontWeight: '900', color: NAVY, letterSpacing: 0.5 },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  hotelName: {
    fontSize: 19,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  roomName: { fontSize: 11.5, color: MUTED, textAlign: 'center', marginTop: 3 },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  badgeText: { fontSize: 10.5, color: GOLD, fontWeight: '700', flexShrink: 1 },

  row: { flexDirection: 'row', gap: 8, marginBottom: 8, marginTop: 0 },
  field: {
    height: 46,
    borderRadius: 10,
    backgroundColor: FIELD_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  fieldInput: { flex: 1, fontSize: 12, color: '#111827', paddingVertical: 0 },
  fieldText: { flex: 1, fontSize: 12, color: '#111827' },
  fieldPlaceholder: { color: '#9CA3AF' },
  sectionLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 18,
    marginBottom: 8,
  },

  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  couponField: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: FIELD_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  couponInput: { flex: 1, fontSize: 12, color: '#111827', paddingVertical: 0, letterSpacing: 0.5 },
  applyBtn: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: { fontSize: 12, fontWeight: '900', color: NAVY },
  couponSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
    paddingHorizontal: 3,
  },
  couponSuccessText: { fontSize: 10.5, color: GREEN, fontWeight: '700' },
  couponError: { fontSize: 10.5, color: COLORS.danger, marginTop: 6, paddingHorizontal: 3 },

  summary: { marginTop: 18, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    gap: 12,
  },
  summaryLabel: { fontSize: 12, color: MUTED },
  summaryMuted: { fontSize: 9, color: '#9CA3AF' },
  summaryValue: { fontSize: 12, color: '#111827', fontWeight: '600' },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 6,
    paddingTop: 10,
    paddingBottom: 0,
  },
  summaryTotalLabel: { fontSize: 13, fontWeight: '800', color: NAVY },
  summaryTotalValue: { fontSize: 14, fontWeight: '900', color: NAVY },

  bottomBar: {
    backgroundColor: PAGE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  payBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { fontSize: 13, fontWeight: '900', color: NAVY, letterSpacing: 0.2 },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 7,
  },
  secureText: { fontSize: 9.5, color: MUTED, fontWeight: '600' },
  secureDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 4 },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginBottom: 12,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: NAVY },

  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    marginBottom: 4,
  },
  dateOptionActive: { backgroundColor: '#FFF9C4' },
  dateOptionMain: { fontSize: 13, fontWeight: '700', color: '#111827' },
  dateOptionSub: { fontSize: 10, color: MUTED, marginTop: 2 },
  dateDisabled: { fontSize: 10, color: '#9CA3AF' },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepperLabel: { fontSize: 13, fontWeight: '700', color: NAVY },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FIELD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnOff: { backgroundColor: '#F8FAFC' },
  stepValue: { fontSize: 14, fontWeight: '800', color: NAVY, minWidth: 18, textAlign: 'center' },
  doneBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  doneBtnText: { fontSize: 12, fontWeight: '900', color: NAVY, letterSpacing: 0.5 },

  stateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stateOptionText: { fontSize: 13, color: '#111827' },
  stateOptionActive: { color: COLORS.primaryText, fontWeight: '800' },

});


