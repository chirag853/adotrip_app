// Home screen content — mirrors the Adotrip mobile web home reference.
// Photos are bundled locally so the Expo Go experience stays reliable.

export const HOME_PACKAGES = [
  {
    id: 'badrinath-temple',
    title: 'Badrinath Temple Tour',
    location: 'Uttarakhand',
    days: '4N / 5D',
    price: 14999,
    oldPrice: 18999,
    rating: 4.6,
    reviews: 820,
    category: 'Domestic',
    tag: 'Spiritual',
    emoji: '🛕',
    color: '#0E2A47',
    image: require('../../assets/home/badrinath.jpg'),
    desc:
      'Sacred Badrinath darshan with comfortable stays, private transfers, Mana village excursion and daily breakfast.',
  },
  {
    id: 'diwali-varanasi-ayodhya',
    title: 'Diwali Tour Packages',
    location: 'Varanasi & Ayodhya',
    days: '5N / 6D',
    price: 18500,
    oldPrice: 22999,
    rating: 4.7,
    reviews: 960,
    category: 'Domestic',
    tag: 'Festive',
    emoji: '🪔',
    color: '#B45309',
    image: require('../../assets/home/package-diwali.jpg'),
    desc:
      'Celebrate the festival of lights with Ganga aarti, Ayodhya Ram Mandir darshan, festive meals and handpicked stays.',
  },
  {
    id: 'andaman-family',
    title: 'Andaman Family Tour',
    location: 'Port Blair & Havelock',
    days: '6N / 7D',
    price: 24999,
    oldPrice: 30999,
    rating: 4.5,
    reviews: 740,
    category: 'Domestic',
    tag: 'Beach',
    emoji: '🏝️',
    color: '#0284C7',
    image: require('../../assets/home/package-andaman.jpg'),
    desc:
      'Island-hopping, Radhanagar beach sunsets, Cellular Jail, private ferry transfers and family-friendly resorts.',
  },
  {
    id: 'bali-escape',
    title: 'Bali Island Escape',
    location: 'Kuta • Ubud • Nusa Penida',
    days: '5N / 6D',
    price: 54999,
    oldPrice: 67999,
    rating: 4.7,
    reviews: 1180,
    category: 'International',
    tag: 'Trending',
    emoji: '🌊',
    color: '#7C3AED',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    desc:
      'Private pool villa, Nusa Penida day trip, Ubud rice terraces, airport transfers and daily breakfast.',
  },
];

export const HOME_PACKAGE_FILTERS = ['All', 'Domestic', 'International'];

export const HOME_HOTELS = [
  {
    id: 'lemon-tree-premier',
    name: 'Lemon Tree Premier',
    city: 'Patna',
    location: 'Patna, India',
    price: 7335,
    oldPrice: 8999,
    rating: 4.5,
    ratingWord: 'Excellent',
    reviews: 560,
    stars: 4,
    tag: '★ Trending',
    emoji: '🏨',
    color: '#0E2A47',
    image: require('../../assets/home/hotel-lemon-tree.jpg'),
    amenities: ['WiFi', 'Pool', 'Breakfast'],
    inclusions: ['Free WiFi', 'Breakfast included', 'Swimming pool'],
    desc:
      'Contemporary rooms, a rooftop pool and all-day dining in the heart of Patna — perfect for business and leisure.',
  },
  {
    id: 'cross-winds-west',
    name: 'Cross Winds West',
    city: 'Solan',
    location: 'Solan District, HP',
    price: 2339,
    oldPrice: 3100,
    rating: 4.2,
    ratingWord: 'Very Good',
    reviews: 340,
    stars: 3,
    tag: '★ Trending',
    emoji: '🏔️',
    color: '#334155',
    image: require('../../assets/home/hotel-crosswinds.jpg'),
    amenities: ['WiFi', 'Parking', 'Dining'],
    inclusions: ['Free WiFi', 'Free parking', 'Restaurant'],
    desc:
      'A peaceful hillside stay amid pine forests with spacious rooms, warm hospitality and easy access to Solan.',
  },
  {
    id: 'wow-crest-ihcl',
    name: 'Wow Crest - IHCL',
    city: 'Indore',
    location: 'Indore, MP',
    price: 5720,
    oldPrice: 7200,
    rating: 4.7,
    ratingWord: 'Luxury',
    reviews: 690,
    stars: 5,
    tag: '★ SeleQtions',
    emoji: '✨',
    color: '#7C3AED',
    image: require('../../assets/home/hotel-wowcrest.jpg'),
    amenities: ['WiFi', 'Spa', 'Bar'],
    inclusions: ['Free WiFi', 'Spa access', 'Breakfast included'],
    desc:
      'A refined SeleQtions address with elegant rooms, a spa, rooftop dining and impeccable IHCL service.',
  },
];

export const HOME_FLIGHT_ROUTES = [
  {
    id: 'maa-bom',
    from: 'Chennai',
    to: 'Mumbai',
    fromCode: 'MAA',
    toCode: 'BOM',
    tint: '#D97706',
    bg: '#FFFBEB',
  },
  {
    id: 'del-amd',
    from: 'Delhi',
    to: 'Ahmedabad',
    fromCode: 'DEL',
    toCode: 'AMD',
    tint: '#0284C7',
    bg: '#F0F9FF',
  },
  {
    id: 'del-lko',
    from: 'Delhi',
    to: 'Lucknow',
    fromCode: 'DEL',
    toCode: 'LKO',
    tint: '#059669',
    bg: '#ECFDF5',
  },
  {
    id: 'bom-maa',
    from: 'Mumbai',
    to: 'Chennai',
    fromCode: 'BOM',
    toCode: 'MAA',
    tint: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    id: 'bom-dxb',
    from: 'Mumbai',
    to: 'Dubai',
    fromCode: 'BOM',
    toCode: 'DXB',
    tint: '#E11D48',
    bg: '#FFF1F2',
  },
  {
    id: 'hyd-blr',
    from: 'Hyderabad',
    to: 'Bangalore',
    fromCode: 'HYD',
    toCode: 'BLR',
    tint: '#2563EB',
    bg: '#EFF6FF',
  },
];

export const HOME_DESTINATIONS = [
  { id: 'delhi', name: 'Delhi', image: require('../../assets/home/dest-delhi.jpg') },
  { id: 'mumbai', name: 'Mumbai', image: require('../../assets/home/dest-mumbai.jpg') },
  { id: 'chennai', name: 'Chennai', image: require('../../assets/home/dest-chennai.jpg') },
  { id: 'kolkata', name: 'Kolkata', image: require('../../assets/home/dest-kolkata.jpg') },
  { id: 'ahmedabad', name: 'Ahmedabad', image: require('../../assets/home/dest-ahmedabad.jpg') },
  { id: 'pune', name: 'Pune', image: require('../../assets/home/dest-pune.jpg') },
  { id: 'jaipur', name: 'Jaipur', image: require('../../assets/home/dest-jaipur.jpg') },
  { id: 'goa', name: 'Goa', image: require('../../assets/home/dest-goa.jpg') },
  { id: 'manali', name: 'Manali', image: require('../../assets/home/dest-manali.jpg') },
  { id: 'shimla', name: 'Shimla', image: require('../../assets/home/dest-shimla.jpg') },
  { id: 'nainital', name: 'Nainital', image: require('../../assets/home/dest-nainital.jpg') },
  { id: 'ooty', name: 'Ooty', image: require('../../assets/home/dest-ooty.jpg') },
];

export const HOME_OFFERS = [
  {
    id: 'hotel-deal',
    category: 'Hotels',
    badge: 'HOTEL DEAL',
    title: 'YOUR PERFECT STAY AWAITS',
    desc: 'Get FLAT ',
    highlight: '₹200 OFF',
    descAfter: ' on all domestic stays.',
    code: 'ADOHOTEL',
    cta: 'Book Now',
    gradient: ['#101827', '#171717', '#000000'],
    badgeBg: '#FEE400',
    badgeText: '#0F172A',
    accent: '#FEE400',
    ctaBg: '#FEE400',
    ctaText: '#0F172A',
  },
  {
    id: 'flight-deal',
    category: 'Flights',
    badge: 'TRAVEL FAR PAY LESS',
    title: 'Sign Up & Save ₹200',
    desc: 'Exclusive flight discounts on first booking with code.',
    highlight: '',
    descAfter: '',
    code: 'FLYFAR',
    cta: 'Avail Deal',
    gradient: ['#0C4A6E', '#1E3A8A', '#312E81'],
    badgeBg: '#7DD3FC',
    badgeText: '#0F172A',
    accent: '#FEE400',
    ctaBg: '#FFFFFF',
    ctaText: '#0F172A',
  },
];

export const HOME_OFFER_FILTERS = ['All', 'Flights', 'Hotels'];

export const HOME_WHY = [
  {
    id: 'easy',
    title: 'Easy Booking',
    desc: 'Search hundreds of flights & hotels instantly.',
    icon: 'flash',
    iconColor: '#0F172A',
    iconBg: 'rgba(254,228,0,0.34)',
  },
  {
    id: 'price',
    title: 'Best Price Guarantee',
    desc: 'No surprise charges, transparent fee structure.',
    icon: 'pricetag',
    iconColor: '#047857',
    iconBg: '#D1FAE5',
  },
  {
    id: 'refund',
    title: 'Hassle-Free Refunds',
    desc: 'Quick cancellation processing directly to bank.',
    icon: 'refresh',
    iconColor: '#0369A1',
    iconBg: '#E0F2FE',
  },
  {
    id: 'support',
    title: '24x7 Support',
    desc: 'Live agents ready to solve booking queries.',
    icon: 'headset',
    iconColor: '#6D28D9',
    iconBg: '#EDE9FE',
  },
];

export const HOME_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      '"I was impressed by the wide range of hotel options on Adotrip. Perfect for budget & luxury stays!"',
    name: 'Saanvi D',
    role: 'Verified Guest',
  },
  {
    id: 't2',
    quote:
      '"Prompt customer support saved my day when flight rescheduling was needed at the last minute."',
    name: 'Vansh Gaurwal',
    role: 'Frequent Flyer',
  },
  {
    id: 't3',
    quote:
      '"Competitive prices offered by Adotrip helped me get best deals without sacrificing quality."',
    name: 'Shelly M.',
    role: 'Holiday Planner',
  },
];

export const HOME_FAQS = [
  {
    q: 'Q1. What is the best time to book flights and hotels?',
    a: 'Booking 3 to 4 weeks in advance usually secures the most competitive airfares and allows full choice of hotel room categories.',
  },
  {
    q: 'Q2. What are the available payment options?',
    a: 'We support UPI (GPay, PhonePe, Paytm), major Credit/Debit cards (Visa, MasterCard, Amex), and Net Banking across all Indian banks.',
  },
  {
    q: 'Q3. Where do I find flight and hotel offers?',
    a: "All active promo codes are listed under the 'Exclusive Offers' section on this home screen or automatically applied during checkout.",
  },
  {
    q: 'Q4. How do I connect with Adotrip customer support?',
    a: 'Tap the floating WhatsApp icon on the right side or reach our 24x7 helpdesk at support@adotrip.com.',
  },
];
