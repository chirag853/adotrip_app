import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import NavDrawer from '../components/NavDrawer';
import PartnerLogoMarquee from '../components/PartnerLogoMarquee';
import { COLORS } from '../theme';
import {
  HOME_DESTINATIONS,
  HOME_FAQS,
  HOME_FLIGHT_ROUTES,
  HOME_HOTELS,
  HOME_OFFER_FILTERS,
  HOME_OFFERS,
  HOME_PACKAGE_FILTERS,
  HOME_PACKAGES,
  HOME_TESTIMONIALS,
  HOME_WHY,
} from '../data/homeData';

const SEARCH_TABS = [
  { id: 'Flights', icon: 'airplane-outline' },
  { id: 'Hotels', icon: 'bed-outline' },
  { id: 'Trains', icon: 'train-outline' },
  { id: 'Holidays', icon: 'sunny-outline' },
];

const TRIP_TYPES = ['Oneway', 'Round Trip', 'Multi Trip'];
const FLIGHT_FARES = ['Regular', 'Student', 'Senior Citizen', 'Armed Forces', 'Doctor & Nurses'];
const TRAIN_CLASSES = ['Sleeper', '3A', '2A', '1A'];
const HOLIDAY_STYLES = ['Family', 'Honeymoon', 'Adventure'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AIRPORTS = {
  delhi: { code: 'DEL', name: 'Indira Gandhi Intl' },
  mumbai: { code: 'BOM', name: 'Chhatrapati Shivaji Intl' },
  chennai: { code: 'MAA', name: 'Chennai Intl' },
  kolkata: { code: 'CCU', name: 'Netaji Subhas Chandra Bose' },
  bengaluru: { code: 'BLR', name: 'Kempegowda Intl' },
  bangalore: { code: 'BLR', name: 'Kempegowda Intl' },
  hyderabad: { code: 'HYD', name: 'Rajiv Gandhi Intl' },
  goa: { code: 'GOI', name: 'Dabolim Airport' },
  jaipur: { code: 'JAI', name: 'Jaipur Intl' },
  ahmedabad: { code: 'AMD', name: 'Sardar Vallabhbhai Patel' },
  lucknow: { code: 'LKO', name: 'Chaudhary Charan Singh' },
  pune: { code: 'PNQ', name: 'Pune Airport' },
  dubai: { code: 'DXB', name: 'Dubai Intl' },
  patna: { code: 'PAT', name: 'Jay Prakash Narayan' },
  varanasi: { code: 'VNS', name: 'Lal Bahadur Shastri' },
  shimla: { code: 'SLV', name: 'Shimla Airport' },
};

function formatDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const TODAY = new Date();
const CHECKIN = formatDate(TODAY);
const CHECKOUT = formatDate(addDays(TODAY, 2));
const TRAVEL_DATE = {
  short: `${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]} '${String(TODAY.getFullYear()).slice(-2)}`,
  weekday: WEEKDAYS[TODAY.getDay()],
};

function airportFor(city) {
  const key = String(city || '').trim().toLowerCase();
  return AIRPORTS[key] || { code: key.slice(0, 3).toUpperCase() || '—', name: 'India' };
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <View style={s.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={s.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={s.sectionSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function Radio({ active }) {
  return (
    <View style={[s.radioOuter, active && s.radioOuterActive]}>
      {active ? <View style={s.radioDot} /> : null}
    </View>
  );
}

function SearchWidget({
  searchTab,
  setSearchTab,
  tripType,
  setTripType,
  from,
  setFrom,
  to,
  setTo,
  hotelCity,
  setHotelCity,
  holidayDest,
  setHolidayDest,
  selectedFare,
  setSelectedFare,
  onSearch,
}) {
  const fromAirport = airportFor(from);
  const toAirport = airportFor(to);
  const isHotel = searchTab === 'Hotels';
  const isHoliday = searchTab === 'Holidays';
  const isTrain = searchTab === 'Trains';
  const [trainClass, setTrainClass] = useState('Sleeper');
  const [holidayStyle, setHolidayStyle] = useState('Family');
  const chips = isTrain ? TRAIN_CLASSES : isHoliday ? HOLIDAY_STYLES : FLIGHT_FARES;
  const chipLabel = isTrain ? 'CLASS' : isHoliday ? 'TRAVEL STYLE' : 'SPECIAL FARES';
  const chipSelected = isTrain ? trainClass : isHoliday ? holidayStyle : selectedFare;

  return (
    <View style={s.searchCard}>
      <View style={s.searchTabs}>
        {SEARCH_TABS.map((tab) => {
          const active = searchTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.searchTab, active && s.searchTabActive]}
              activeOpacity={0.8}
              onPress={() => setSearchTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={active ? COLORS.secondary : '#64748B'}
              />
              <Text style={[s.searchTabText, active && s.searchTabTextActive]}>{tab.id}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.searchBody}>
        {(searchTab === 'Flights' || isTrain) && (
          <View style={s.tripRow}>
            {TRIP_TYPES.map((type) => {
              const active = tripType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={s.tripOption}
                  activeOpacity={0.8}
                  onPress={() => setTripType(type)}
                >
                  <Radio active={active} />
                  <Text style={[s.tripText, active && s.tripTextActive]}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isHotel || isHoliday ? (
          <View style={s.singleField}>
            <Text style={s.fieldLabel}>{isHotel ? 'DESTINATION' : 'DESTINATION / THEME'}</Text>
            <View style={s.singleFieldRow}>
              <Ionicons name="location-outline" size={16} color="#94A3B8" />
              <TextInput
                value={isHotel ? hotelCity : holidayDest}
                onChangeText={isHotel ? setHotelCity : setHolidayDest}
                style={s.singleInput}
                placeholder={isHotel ? 'City or hotel name' : 'Where do you want to go?'}
                placeholderTextColor="#94A3B8"
                underlineColorAndroid="transparent"
              />
              <Ionicons name="chevron-down" size={14} color="#94A3B8" />
            </View>
          </View>
        ) : (
          <View style={s.routeBox}>
            <View style={s.routeField}>
              <Text style={s.fieldLabel}>FROM</Text>
              <View style={s.cityLine}>
                <TextInput
                  value={from}
                  onChangeText={setFrom}
                  style={[s.cityInput, { width: Math.max(54, from.length * 9.3 + 10) }]}
                  placeholder="Delhi"
                  placeholderTextColor="#94A3B8"
                  underlineColorAndroid="transparent"
                />
                <Text style={s.cityCode}>({fromAirport.code})</Text>
              </View>
              <Text style={s.airportName} numberOfLines={1}>
                {fromAirport.name}
              </Text>
            </View>

            <View style={s.routeDivider} />

            <View style={s.routeField}>
              <Text style={s.fieldLabel}>TO</Text>
              <View style={s.cityLine}>
                <TextInput
                  value={to}
                  onChangeText={setTo}
                  style={[s.cityInput, { width: Math.max(54, to.length * 9.3 + 10) }]}
                  placeholder="Mumbai"
                  placeholderTextColor="#94A3B8"
                  underlineColorAndroid="transparent"
                />
                <Text style={s.cityCode}>({toAirport.code})</Text>
              </View>
              <Text style={s.airportName} numberOfLines={1}>
                {toAirport.name}
              </Text>
            </View>

            <TouchableOpacity
              style={s.swapBtn}
              activeOpacity={0.8}
              onPress={() => {
                setFrom(to);
                setTo(from);
              }}
              accessibilityLabel="Swap origin and destination"
            >
              <Ionicons name="swap-horizontal" size={15} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {isHotel ? (
          <>
            <View style={s.twoCol}>
              <View style={s.smallField}>
                <Text style={s.fieldLabel}>CHECK-IN</Text>
                <View style={s.fieldValueRow}>
                  <View>
                    <Text style={s.fieldValue}>{CHECKIN}</Text>
                    <Text style={s.fieldSub}>{TRAVEL_DATE.weekday}</Text>
                  </View>
                  <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
                </View>
              </View>
              <View style={s.smallField}>
                <Text style={s.fieldLabel}>CHECK-OUT</Text>
                <View style={s.fieldValueRow}>
                  <View>
                    <Text style={s.fieldValue}>{CHECKOUT}</Text>
                    <Text style={s.fieldSub}>2 nights stay</Text>
                  </View>
                  <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
                </View>
              </View>
            </View>
            <View style={[s.smallField, { marginTop: 8 }]}>
              <Text style={s.fieldLabel}>GUESTS & ROOMS</Text>
              <View style={s.fieldValueRow}>
                <View>
                  <Text style={s.fieldValue}>2 Guests • 1 Room</Text>
                  <Text style={s.fieldSub}>Room 1 • 2 Adults</Text>
                </View>
                <Ionicons name="chevron-down" size={14} color="#94A3B8" />
              </View>
            </View>
          </>
        ) : (
          <View style={s.twoCol}>
            <View style={s.smallField}>
              <Text style={s.fieldLabel}>{isHoliday ? 'TRAVEL DATE' : 'DEPARTURE'}</Text>
              <View style={s.fieldValueRow}>
                <View>
                  <Text style={s.fieldValue}>{TRAVEL_DATE.short}</Text>
                  <Text style={s.fieldSub}>{TRAVEL_DATE.weekday}</Text>
                </View>
                <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
              </View>
            </View>
            <View style={s.smallField}>
              <Text style={s.fieldLabel}>
                {isHoliday ? 'DURATION' : 'TRAVELLERS & CLASS'}
              </Text>
              <View style={s.fieldValueRow}>
                <View>
                  <Text style={s.fieldValue}>
                    {isHoliday ? '4 - 6 Days' : isTrain ? '1 Adult' : '1 Adult'}
                  </Text>
                  <Text style={s.fieldSub}>
                    {isHoliday ? 'Flexible dates' : isTrain ? 'Sleeper class' : 'Economy'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={14} color="#94A3B8" />
              </View>
            </View>
          </View>
        )}

        <View style={s.fareBlock}>
          <Text style={s.fieldLabel}>{chipLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRail}
          >
            {chips.map((chip) => {
              const active = chipSelected === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isTrain) setTrainClass(chip);
                    else if (isHoliday) setHolidayStyle(chip);
                    else setSelectedFare(chip);
                  }}
                  style={[s.fareChip, active && s.fareChipActive]}
                >
                  {active ? (
                    <Ionicons name="checkmark" size={9} color={COLORS.secondary} />
                  ) : null}
                  <Text style={[s.fareChipText, active && s.fareChipTextActive]}>{chip}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity style={s.searchBtn} activeOpacity={0.88} onPress={onSearch}>
          <Ionicons name="search" size={14} color={COLORS.secondary} />
          <Text style={s.searchBtnText}>SEARCH {searchTab.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function OfferCard({ offer, onPress }) {
  return (
    <LinearGradient
      colors={offer.gradient}
      style={s.offerCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[s.offerGlow, { backgroundColor: offer.accent }]} />
      <View style={s.offerTop}>
        <View style={[s.offerBadge, { backgroundColor: offer.badgeBg }]}>
          <Text style={[s.offerBadgeText, { color: offer.badgeText }]}>{offer.badge}</Text>
        </View>
        <Text style={s.offerTitle}>{offer.title}</Text>
        <Text style={s.offerDesc}>
          {offer.desc}
          {offer.highlight ? (
            <Text style={[s.offerHighlight, { color: offer.accent }]}>{offer.highlight}</Text>
          ) : null}
          {offer.descAfter}
        </Text>
      </View>
      <View style={s.offerBottom}>
        <View style={s.offerCodeBox}>
          <Text style={s.offerCode}>CODE: {offer.code}</Text>
        </View>
        <TouchableOpacity
          style={[s.offerCta, { backgroundColor: offer.ctaBg }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={[s.offerCtaText, { color: offer.ctaText }]}>{offer.cta}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function PackageCard({ item, onPress }) {
  return (
    <TouchableOpacity style={s.packageCard} activeOpacity={0.9} onPress={onPress}>
      <View style={s.packageImageWrap}>
        <Image source={item.image} style={s.packageImage} resizeMode="cover" />
        <View style={s.durationBadge}>
          <Ionicons name="time-outline" size={9} color="#FFFFFF" />
          <Text style={s.durationText}>{item.days}</Text>
        </View>
      </View>
      <View style={s.packageBody}>
        <View style={s.locationRow}>
          <Ionicons name="location" size={10} color="#D97706" />
          <Text style={s.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <Text style={s.packageTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={s.packageBottom}>
          <View>
            <Text style={s.startingFrom}>Starting from</Text>
            <Text style={s.packagePrice}>₹{Number(item.price).toLocaleString('en-IN')}</Text>
          </View>
          <View style={s.exploreBtn}>
            <Text style={s.exploreText}>Explore</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HotelCard({ item, favorite, onFavorite, onPress }) {
  return (
    <TouchableOpacity style={s.hotelCard} activeOpacity={0.9} onPress={onPress}>
      <View style={s.hotelImageWrap}>
        <Image source={item.image} style={s.hotelImage} resizeMode="cover" />
        <View style={s.hotelTag}>
          <Text style={s.hotelTagText}>{item.tag}</Text>
        </View>
        <TouchableOpacity
          style={s.favoriteBtn}
          activeOpacity={0.8}
          onPress={(event) => {
            event?.stopPropagation?.();
            onFavorite();
          }}
          accessibilityLabel={favorite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={14}
            color={favorite ? '#E11D48' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>
      <View style={s.hotelBody}>
        <Text style={s.hotelName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={s.hotelLocationRow}>
          <Ionicons name="location-outline" size={10} color="#94A3B8" />
          <Text style={s.hotelLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View style={s.amenityRow}>
          {item.amenities.map((amenity) => (
            <View key={amenity} style={s.amenityChip}>
              <Text style={s.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
        <View style={s.hotelFooter}>
          <View style={{ flex: 1 }}>
            <Text style={s.hotelRating}>
              ★ {item.rating}/5 {item.ratingWord}
            </Text>
            <Text style={s.hotelPriceLabel}>
              From <Text style={s.hotelPrice}>INR {Number(item.price).toLocaleString('en-IN')}</Text>
              <Text style={s.perNight}>/night</Text>
            </Text>
          </View>
          <View style={s.viewMoreBtn}>
            <Text style={s.viewMoreText}>View More</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DestinationTile({ item, onPress }) {
  return (
    <TouchableOpacity style={s.destinationTile} activeOpacity={0.9} onPress={onPress}>
      <View style={s.destinationImageWrap}>
        <Image source={item.image} style={s.destinationImage} resizeMode="cover" />
      </View>
      <Text style={s.destinationName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

function WhyCard({ item }) {
  return (
    <View style={s.whyItem}>
      <View style={[s.whyIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={15} color={item.iconColor} />
      </View>
      <Text style={s.whyTitle}>{item.title}</Text>
      <Text style={s.whyDesc}>{item.desc}</Text>
    </View>
  );
}

function TestimonialCard({ item }) {
  return (
    <View style={s.testimonialCard}>
      <Text style={s.testimonialQuote}>{item.quote}</Text>
      <View style={s.testimonialFooter}>
        <Text style={s.testimonialName}>{item.name}</Text>
        <Text style={s.testimonialRole}>{item.role}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const scrollRef = useRef(null);
  const packagesRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('Flights');
  const [tripType, setTripType] = useState('Oneway');
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Mumbai');
  const [hotelCity, setHotelCity] = useState('Goa');
  const [holidayDest, setHolidayDest] = useState('Manali');
  const [selectedFare, setSelectedFare] = useState('Regular');
  const [offerFilter, setOfferFilter] = useState('All');
  const [packageFilter, setPackageFilter] = useState('All');
  const [favorites, setFavorites] = useState({});
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState('');

  const visibleOffers =
    offerFilter === 'All'
      ? HOME_OFFERS
      : HOME_OFFERS.filter((offer) => offer.category === offerFilter);
  const visiblePackages =
    packageFilter === 'All'
      ? HOME_PACKAGES
      : HOME_PACKAGES.filter((item) => item.category === packageFilter);

  const goSearch = () => {
    if (searchTab === 'Flights') {
      navigation.navigate('Flights', { from: from.trim() || 'Delhi', to: to.trim() || 'Mumbai' });
      return;
    }
    if (searchTab === 'Hotels') {
      navigation.navigate('HotelList', {
        city: hotelCity.trim() || 'Goa',
        checkin: CHECKIN,
        checkout: CHECKOUT,
        rooms: 1,
        adults: 2,
        children: 0,
      });
      return;
    }
    if (searchTab === 'Trains') {
      navigation.navigate('LuxuryTrains');
      return;
    }
    navigation.navigate('Holidays');
  };

  const toggleFavorite = (id) => {
    setFavorites((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const joinNewsletter = () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      Alert.alert('Enter your email', 'Please enter a valid email address to subscribe.');
      return;
    }
    setEmail('');
    Alert.alert('You are subscribed!', 'Exclusive travel deals will land in your inbox.');
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/').catch(() =>
      Alert.alert('WhatsApp unavailable', 'Please reach us at support@adotrip.com.')
    );
  };

  const MENU_ITEMS = [
    {
      id: 'home',
      label: 'Home',
      subtitle: "Discover what's new",
      group: 'EXPLORE',
      icon: 'home-outline',
      active: true,
      onPress: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
    },
    {
      id: 'flights',
      label: 'Flights',
      subtitle: 'Best fares, 100+ airlines',
      group: 'EXPLORE',
      icon: 'airplane-outline',
      onPress: () => navigation.navigate('Flights'),
    },
    {
      id: 'hotels',
      label: 'Hotels',
      subtitle: '50,000+ stays across India',
      group: 'EXPLORE',
      icon: 'bed-outline',
      onPress: () => navigation.navigate('Hotels'),
    },
    {
      id: 'holidays',
      label: 'Holidays',
      subtitle: 'Curated packages & offers',
      group: 'EXPLORE',
      icon: 'map-outline',
      onPress: () => navigation.navigate('Holidays'),
    },
    {
      id: 'himachal',
      label: 'Himachal Tourism',
      subtitle: 'Official HPTDC hotels',
      group: 'EXPERIENCES',
      icon: 'trail-sign-outline',
      isNew: true,
      onPress: () => navigation.navigate('Himachal'),
    },
    {
      id: 'luxury',
      label: 'Luxury Trains',
      subtitle: 'Royal rail journeys',
      group: 'EXPERIENCES',
      icon: 'train-outline',
      isNew: true,
      onPress: () => navigation.navigate('LuxuryTrains'),
    },
    {
      id: 'circuit',
      label: 'Circuit Planner',
      subtitle: 'Build an AI itinerary',
      group: 'EXPERIENCES',
      icon: 'sparkles-outline',
      onPress: () => navigation.navigate('Circuit'),
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader
        showMenu
        onMenu={() => setNavOpen(true)}
        showSupport={false}
        showAccount={false}
        right={
          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.currencyPill}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Currency', 'Indian Rupee (INR ₹) is selected.')}
              accessibilityLabel="Select currency and language"
            >
              <Text style={s.currencyText}>INR ₹</Text>
              <Ionicons name="chevron-down" size={9} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.headerIconBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Notifications', 'No new notifications right now.')}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={17} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.headerIconBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Auth')}
              accessibilityLabel="User profile"
            >
              <Ionicons name="person-outline" size={17} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.headline}>
          <Text style={s.headlineTitle}>Book Flights, Hotels & Holiday Packages Online</Text>
          <Text style={s.headlineSub}>Nothing is far with India's best travel planner</Text>
        </View>

        <SearchWidget
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          tripType={tripType}
          setTripType={setTripType}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          hotelCity={hotelCity}
          setHotelCity={setHotelCity}
          holidayDest={holidayDest}
          setHolidayDest={setHolidayDest}
          selectedFare={selectedFare}
          setSelectedFare={setSelectedFare}
          onSearch={goSearch}
        />

        <View style={s.partnerCard}>
          <Text style={s.partnerLabel}>GOVERNMENT & TOURISM PARTNERS</Text>
          <PartnerLogoMarquee plain />
        </View>

        <SectionTitle
          title="Exclusive Offers"
          subtitle="Curated discounts just for you"
          right={
            <View style={s.offerFilter}>
              {HOME_OFFER_FILTERS.map((filter) => {
                const active = offerFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.8}
                    onPress={() => setOfferFilter(filter)}
                    style={[s.offerFilterItem, active && s.offerFilterItemActive]}
                  >
                    <Text style={[s.offerFilterText, active && s.offerFilterTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.horizontalRail}
        >
          {visibleOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onPress={() => navigation.navigate('Offers')}
            />
          ))}
        </ScrollView>

        <SectionTitle
          title="Recommended Packages"
          subtitle="Handpicked holiday vacations"
          right={
            <View style={s.arrowGroup}>
              <TouchableOpacity
                style={s.arrowBtn}
                activeOpacity={0.8}
                onPress={() => packagesRef.current?.scrollTo({ x: 0, animated: true })}
                accessibilityLabel="Previous packages"
              >
                <Ionicons name="chevron-back" size={12} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.arrowBtn}
                activeOpacity={0.8}
                onPress={() => packagesRef.current?.scrollToEnd({ animated: true })}
                accessibilityLabel="Next packages"
              >
                <Ionicons name="chevron-forward" size={12} color="#475569" />
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.packageFilterRail}
        >
          {HOME_PACKAGE_FILTERS.map((filter) => {
            const active = packageFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.8}
                onPress={() => setPackageFilter(filter)}
                style={[s.packageFilterChip, active && s.packageFilterChipActive]}
              >
                <Text
                  style={[
                    s.packageFilterText,
                    active && s.packageFilterTextActive,
                  ]}
                >
                  {filter === 'All' ? 'All Packages' : filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          ref={packagesRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.horizontalRail}
        >
          {visiblePackages.map((item) => (
            <PackageCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('HolidayDetail', { item })}
            />
          ))}
        </ScrollView>

        <SectionTitle
          title="Top Flight Routes"
          subtitle="Most booked domestic & global connections"
        />
        <View style={s.routeGrid}>
          {HOME_FLIGHT_ROUTES.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={s.routeCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FlightResults', { from: route.from, to: route.to })}
            >
              <View style={[s.routeIcon, { backgroundColor: route.bg }]}>
                <Ionicons name="airplane" size={13} color={route.tint} />
              </View>
              <View style={s.routeTextWrap}>
                <Text style={s.routeName} numberOfLines={1}>
                  {route.from} <Text style={s.routeArrow}>➔</Text> {route.to}
                </Text>
                <Text style={s.routeCode}>
                  {route.fromCode} - {route.toCode}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <SectionTitle
          title="Recommended Hotels"
          subtitle="Verified stays with best tariffs"
          right={
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Hotels')}
              style={s.viewAllBtn}
            >
              <Text style={s.viewAllLink}>View All</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.horizontalRail}
        >
          {HOME_HOTELS.map((item) => (
            <HotelCard
              key={item.id}
              item={item}
              favorite={!!favorites[item.id]}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('HotelDetail', { item })}
            />
          ))}
        </ScrollView>

        <SectionTitle
          title="Explore Hotels by Destination"
          subtitle="Popular travel cities across India"
        />
        <View style={s.destinationGrid}>
          {HOME_DESTINATIONS.map((item) => (
            <DestinationTile
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate('HotelList', {
                  city: item.name,
                  checkin: CHECKIN,
                  checkout: CHECKOUT,
                  rooms: 1,
                  adults: 2,
                  children: 0,
                })
              }
            />
          ))}
        </View>

        <View style={s.whyCard}>
          <View style={s.whyHeader}>
            <Text style={s.whyHeading}>Why book with us?</Text>
            <Text style={s.whySubheading}>Unmatched benefits on every booking</Text>
          </View>
          <View style={s.whyGrid}>
            {HOME_WHY.map((item) => (
              <WhyCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        <View style={s.googleCard}>
          <View style={s.googleLeft}>
            <View style={s.googleIcon}>
              <Ionicons name="logo-google" size={14} color="#EA4335" />
            </View>
            <View>
              <View style={s.starsRow}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <Ionicons
                    key={index}
                    name={index === 4 ? 'star-half' : 'star'}
                    size={10}
                    color="#F59E0B"
                  />
                ))}
                <Text style={s.googleScore}>4.6</Text>
              </View>
              <Text style={s.googleReview}>Based on 56+ verified reviews</Text>
            </View>
          </View>
          <View style={s.travellerPill}>
            <Text style={s.travellerPillText}>10k+ Travellers</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.horizontalRail}
        >
          {HOME_TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <SectionTitle title="Frequently Asked Questions" subtitle="Quick answers before you book" />
        <View style={s.faqList}>
          {HOME_FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <View key={faq.q} style={[s.faqCard, open && s.faqCardOpen]}>
                <TouchableOpacity
                  style={s.faqHead}
                  activeOpacity={0.8}
                  onPress={() => setOpenFaq(open ? -1 : index)}
                >
                  <Text style={s.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={11}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
                {open ? <Text style={s.faqAnswer}>{faq.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <View style={s.newsletterCard}>
          <View style={s.newsletterHead}>
            <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
            <Text style={s.newsletterTitle}>Subscribe to Exclusive Travel Deals</Text>
          </View>
          <Text style={s.newsletterSub}>
            Get secret fares, flash vouchers, and destination guides directly in your inbox.
          </Text>
          <View style={s.newsletterForm}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={s.newsletterInput}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity style={s.joinBtn} activeOpacity={0.85} onPress={joinNewsletter}>
              <Text style={s.joinText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <TouchableOpacity
        style={s.whatsappBtn}
        activeOpacity={0.85}
        onPress={openWhatsApp}
        accessibilityLabel="Chat on WhatsApp"
      >
        <Ionicons name="logo-whatsapp" size={23} color="#FFFFFF" />
      </TouchableOpacity>

      <NavDrawer
        visible={navOpen}
        onClose={() => setNavOpen(false)}
        items={MENU_ITEMS}
        onSupport={openWhatsApp}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FA' },
  scrollContent: { paddingBottom: 16 },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currencyPill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
  },
  currencyText: { fontSize: 10, fontWeight: '700', color: '#334155' },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  searchCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  searchTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,250,252,0.75)',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchTab: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  searchTabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  searchTabText: { fontSize: 10.5, fontWeight: '600', color: '#64748B' },
  searchTabTextActive: { color: '#0F172A', fontWeight: '800' },

  searchBody: { padding: 16 },
  tripRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
  tripOption: { flexDirection: 'row', alignItems: 'center', marginRight: 13, paddingVertical: 2 },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  radioOuterActive: { borderColor: '#0F172A' },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0F172A' },
  tripText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  tripTextActive: { color: '#0F172A', fontWeight: '800' },

  routeBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  routeField: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, paddingRight: 54 },
  routeDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  cityLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 1 },
  cityInput: {
    padding: 0,
    margin: 0,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cityCode: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginLeft: 1 },
  airportName: { fontSize: 9.5, fontWeight: '500', color: '#94A3B8', marginTop: 1 },
  swapBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    transform: [{ rotate: '90deg' }],
  },

  singleField: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  singleFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  singleInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  twoCol: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 4,
  },
  fieldValue: { fontSize: 12.5, fontWeight: '800', color: '#0F172A' },
  fieldSub: { fontSize: 9.5, fontWeight: '500', color: '#64748B', marginTop: 1 },

  fareBlock: { marginTop: 12 },
  chipRail: { gap: 6, paddingTop: 6, paddingRight: 6 },
  fareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  fareChipActive: { backgroundColor: COLORS.primary },
  fareChipText: { fontSize: 9.5, fontWeight: '600', color: '#475569' },
  fareChipTextActive: { color: '#0F172A', fontWeight: '800' },

  searchBtn: {
    height: 48,
    borderRadius: 12,
    marginTop: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: { fontSize: 12, fontWeight: '900', color: '#0F172A', letterSpacing: 0.5 },

  headline: { marginHorizontal: 16, marginTop: 16, alignItems: 'center' },
  headlineTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headlineSub: { fontSize: 11.5, color: '#64748B', marginTop: 4, textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2 },
  sectionSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  horizontalRail: { paddingHorizontal: 16, gap: 12, paddingBottom: 2 },
  arrowGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  arrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBtn: { paddingVertical: 3 },
  viewAllLink: { fontSize: 10.5, fontWeight: '800', color: '#2563EB' },

  offerFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(226,232,240,0.8)',
    padding: 2,
    borderRadius: 8,
  },
  offerFilterItem: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  offerFilterItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  offerFilterText: { fontSize: 9.5, fontWeight: '600', color: '#475569' },
  offerFilterTextActive: { color: '#0F172A', fontWeight: '800' },

  offerCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  offerGlow: {
    position: 'absolute',
    right: -26,
    bottom: -26,
    width: 112,
    height: 112,
    borderRadius: 56,
    opacity: 0.16,
  },
  offerTop: { zIndex: 2 },
  offerBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  offerBadgeText: { fontSize: 8.5, fontWeight: '800', letterSpacing: 0.3 },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: -0.2,
  },
  offerDesc: { color: '#CBD5E1', fontSize: 10.5, marginTop: 3, lineHeight: 14 },
  offerHighlight: { fontWeight: '800' },
  offerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  offerCodeBox: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  offerCode: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  offerCta: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  offerCtaText: { fontSize: 10.5, fontWeight: '800' },

  packageFilterRail: { paddingHorizontal: 16, gap: 8, paddingBottom: 2 },
  packageFilterChip: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  packageFilterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  packageFilterText: { fontSize: 10.5, fontWeight: '600', color: '#475569' },
  packageFilterTextActive: { color: '#FFFFFF', fontWeight: '800' },

  packageCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  packageImageWrap: { height: 128, backgroundColor: '#E2E8F0' },
  packageImage: { width: '100%', height: '100%' },
  durationBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  durationText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '700' },
  packageBody: { padding: 11 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 9.5, fontWeight: '600', color: '#64748B', flex: 1 },
  packageTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  packageBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  startingFrom: { fontSize: 8.5, color: '#94A3B8' },
  packagePrice: { fontSize: 12, fontWeight: '900', color: '#0F172A', marginTop: 1 },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  exploreText: { fontSize: 9.5, fontWeight: '800', color: '#0F172A' },

  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginHorizontal: 16,
  },
  routeCard: {
    width: '48.4%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.85)',
    borderRadius: 12,
    padding: 9,
  },
  routeIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  routeTextWrap: { flex: 1 },
  routeName: { fontSize: 10, fontWeight: '800', color: '#0F172A' },
  routeArrow: { color: '#94A3B8', fontSize: 9 },
  routeCode: { fontSize: 8.5, fontWeight: '700', color: '#64748B', marginTop: 2, letterSpacing: 0.3 },

  hotelCard: {
    width: 262,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  hotelImageWrap: { height: 144, backgroundColor: '#E2E8F0' },
  hotelImage: { width: '100%', height: '100%' },
  hotelTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  hotelTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotelBody: { padding: 11 },
  hotelName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  hotelLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  hotelLocation: { fontSize: 9.5, color: '#64748B', flex: 1 },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  amenityChip: { backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  amenityText: { fontSize: 8.5, fontWeight: '500', color: '#475569' },
  hotelFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 9,
    marginTop: 9,
  },
  hotelRating: { fontSize: 9, fontWeight: '800', color: '#059669' },
  hotelPriceLabel: { fontSize: 8.5, color: '#94A3B8', marginTop: 2 },
  hotelPrice: { fontSize: 11.5, fontWeight: '900', color: '#0F172A' },
  perNight: { fontSize: 8.5, color: '#94A3B8' },
  viewMoreBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  viewMoreText: { fontSize: 9.5, fontWeight: '800', color: '#0F172A' },

  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    rowGap: 12,
  },
  destinationTile: { width: '23%' },
  destinationImageWrap: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  destinationImage: { width: '100%', height: '100%' },
  destinationName: { fontSize: 10.5, fontWeight: '800', color: '#334155', marginTop: 5, textAlign: 'center' },

  whyCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
  },
  whyHeader: { alignItems: 'center' },
  whyHeading: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  whySubheading: { fontSize: 10.5, color: '#64748B', marginTop: 2 },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 14,
  },
  whyItem: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
  },
  whyIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  whyTitle: { fontSize: 10.5, fontWeight: '800', color: '#0F172A' },
  whyDesc: { fontSize: 9.5, color: '#64748B', lineHeight: 13, marginTop: 2 },

  googleCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  googleLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  googleScore: { fontSize: 10, fontWeight: '900', color: '#0F172A', marginLeft: 3 },
  googleReview: { fontSize: 8.5, color: '#64748B', marginTop: 1 },
  travellerPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  travellerPillText: { fontSize: 8.5, fontWeight: '800', color: '#334155' },

  testimonialCard: {
    width: 245,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    borderRadius: 12,
    padding: 13,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  testimonialQuote: { fontSize: 10.5, fontStyle: 'italic', color: '#475569', lineHeight: 16 },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 12,
  },
  testimonialName: { fontSize: 10.5, fontWeight: '800', color: '#0F172A' },
  testimonialRole: { fontSize: 8.5, color: '#94A3B8' },

  faqList: { marginHorizontal: 16 },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
  },
  faqCardOpen: { borderColor: '#CBD5E1' },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  faqQuestion: { fontSize: 10.5, fontWeight: '800', color: '#334155', flex: 1 },
  faqAnswer: { fontSize: 10, color: '#475569', lineHeight: 16, marginTop: 8 },

  partnerCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.85)',
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  partnerLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  newsletterCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
  },
  newsletterHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  newsletterTitle: { fontSize: 11.5, fontWeight: '800', color: '#FFFFFF' },
  newsletterSub: { fontSize: 10, color: '#94A3B8', lineHeight: 14, marginTop: 5 },
  newsletterForm: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11 },
  newsletterInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  joinBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinText: { fontSize: 10.5, fontWeight: '800', color: '#0F172A' },

  whatsappBtn: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
});
