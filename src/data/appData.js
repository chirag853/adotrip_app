export const CITIES = ['Delhi', 'Mumbai', 'Jaipur', 'Goa', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Udaipur', 'Manali', 'Kerala', 'Dubai'];

export const OFFERS = [
  { id: '1', title: 'Up to 30% OFF', subtitle: 'Domestic Flights', code: 'FLYHIGH', color: '#0E2A47', emoji: '✈️' },
  { id: '2', title: 'Up to 50% OFF', subtitle: 'Holiday Packages', code: 'HOLIDAY50', color: '#B89B00', emoji: '🏖️' },
  { id: '3', title: 'Flat 20% OFF', subtitle: 'Premium Hotels', code: 'STAY20', color: '#0B6E4F', emoji: '🏨' },
  { id: '4', title: 'Up to ₹2000 OFF', subtitle: 'Bus Bookings', code: 'BUS2000', color: '#6D28D9', emoji: '🚌' },
  { id: '5', title: 'Visa at ₹4999', subtitle: 'Dubai Tourist Visa', code: 'VISA4999', color: '#0EA5E9', emoji: '🛂' },
];

export const PACKAGES = [
  { id: 'p1', title: '4N/5D Kerala Tour Package', location: 'Kochi • Munnar • Alleppey', price: 24999, oldPrice: 32999, rating: 4.6, reviews: 1240, days: '4N/5D', tag: 'Bestseller', emoji: '🌴', color: '#0B6E4F', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80', desc: 'Houseboat stay, tea gardens, Kathakali show, transfers & daily breakfast included.' },
  { id: 'p2', title: '7N Kerala Honeymoon Package', location: 'Kovalam • Poovar • Kanyakumari', price: 41999, oldPrice: 52999, rating: 4.8, reviews: 860, days: '6N/7D', tag: 'Honeymoon', emoji: '💑', color: '#DB2777', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', desc: 'Private cab, beach resort, candle-light dinner, flower bed decoration & sightseeing.' },
  { id: 'p3', title: 'Thailand Honeymoon 6N', location: 'Bangkok • Pattaya • Coral Island', price: 54999, oldPrice: 69999, rating: 4.7, reviews: 2100, days: '5N/6D', tag: 'International', emoji: '🏝️', color: '#0284C7', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', desc: 'Flights, 4-star stay, Coral island tour with lunch, Safari World & city tour.' },
  { id: 'p4', title: 'Bali Nusa Penida 7N', location: 'Kuta • Ubud • Nusa Penida', price: 62999, oldPrice: 79999, rating: 4.8, reviews: 1530, days: '6N/7D', tag: 'Trending', emoji: '🌊', color: '#7C3AED', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', desc: 'Visa assistance, private pool villa 1N, Kelingking beach, swings & transfers.' },
  { id: 'p5', title: '4N Andaman Tour', location: 'Port Blair • Havelock • Neil', price: 28999, oldPrice: 35999, rating: 4.5, reviews: 970, days: '3N/4D', tag: 'Beach', emoji: '🐠', color: '#0EA5E9', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80', desc: 'Cruise transfers, Radhanagar beach, Cellular Jail light & sound show.' },
  { id: 'p6', title: 'Kashmir Paradise 5N', location: 'Srinagar • Gulmarg • Pahalgam', price: 27999, oldPrice: 34999, rating: 4.6, reviews: 1870, days: '4N/5D', tag: 'Hill Station', emoji: '🏔️', color: '#334155', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', desc: 'Houseboat 1N, Gulmarg Gondola Phase 1, Dal Lake shikara ride & cab.' },
  { id: 'p7', title: 'Gujarat Heritage 5N', location: 'Ahmedabad • Gir • Somnath • Dwarka', price: 22999, oldPrice: 28999, rating: 4.4, reviews: 640, days: '4N/5D', tag: 'Family', emoji: '🦁', color: '#B45309', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', desc: 'Statue of Unity, Gir safari, Somnath aarti, Dwarkadhish darshan.' },
  { id: 'p8', title: 'Dubai Explorer 4N', location: 'Dubai • Abu Dhabi', price: 59999, oldPrice: 74999, rating: 4.7, reviews: 1980, days: '3N/4D', tag: 'International', emoji: '🌆', color: '#0E2A47', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', desc: 'Burj Khalifa, Desert safari, Marina cruise dinner, city tour & visa.' },
];

export const FLIGHT_ROUTES = [
  { id: 'f1', from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai', price: 4299, airline: 'IndiGo • Non-stop', time: '2h 10m', emoji: '✈️' },
  { id: 'f2', from: 'DEL', fromCity: 'Delhi', to: 'GOI', toCity: 'Goa', price: 5499, airline: 'Air India • Non-stop', time: '2h 35m', emoji: '✈️' },
  { id: 'f3', from: 'BOM', fromCity: 'Mumbai', to: 'DXB', toCity: 'Dubai', price: 12999, airline: 'Emirates • Non-stop', time: '3h 20m', emoji: '🛫' },
  { id: 'f4', from: 'CCU', fromCity: 'Kolkata', to: 'DEL', toCity: 'Delhi', price: 4799, airline: 'SpiceJet • Non-stop', time: '2h 25m', emoji: '✈️' },
  { id: 'f5', from: 'BLR', fromCity: 'Bengaluru', to: 'DEL', toCity: 'Delhi', price: 4999, airline: 'Akasa • Non-stop', time: '2h 50m', emoji: '✈️' },
  { id: 'f6', from: 'DEL', fromCity: 'Delhi', to: 'BKK', toCity: 'Bangkok', price: 14999, airline: 'Thai Airways • Non-stop', time: '4h 30m', emoji: '🛫' },
];

export const FLIGHT_RESULTS = [
  { id: 'r1', airline: 'IndiGo', code: '6E-203', dep: '06:00', arr: '08:10', dur: '2h 10m', stops: 'Non-stop', price: 4299, tag: 'Cheapest' },
  { id: 'r2', airline: 'Air India', code: 'AI-654', dep: '09:25', arr: '11:40', dur: '2h 15m', stops: 'Non-stop', price: 4899, tag: 'Flexible' },
  { id: 'r3', airline: 'SpiceJet', code: 'SG-871', dep: '14:15', arr: '16:30', dur: '2h 15m', stops: 'Non-stop', price: 4599, tag: '' },
  { id: 'r4', airline: 'Akasa Air', code: 'QP-1331', dep: '18:40', arr: '20:55', dur: '2h 15m', stops: 'Non-stop', price: 5199, tag: 'New' },
  { id: 'r5', airline: 'Vistara', code: 'UK-933', dep: '21:05', arr: '23:15', dur: '2h 10m', stops: 'Non-stop', price: 5999, tag: 'Premium' },
];

export const HOTELS = [
  { id: 'h1', name: 'Hotel Savera, Goa', location: 'Baga Beach, Goa', price: 3499, oldPrice: 5999, rating: 4.3, reviews: 2100, tag: 'Couple Friendly', emoji: '🏨', color: '#0284C7', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },
  { id: 'h2', name: 'Geetanjali International', location: 'Deoghar, Jharkhand', price: 1899, oldPrice: 2999, rating: 3.9, reviews: 840, tag: 'Budget', emoji: '🛎️', color: '#B45309', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { id: 'h3', name: 'The Leela Palace, Udaipur', location: 'Lake Pichola, Udaipur', price: 18999, oldPrice: 24999, rating: 4.9, reviews: 3200, tag: 'Luxury 5★', emoji: '👑', color: '#7C3AED', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80' },
  { id: 'h4', name: 'Taj Exotica, Andaman', location: 'Havelock Island', price: 12999, oldPrice: 16999, rating: 4.7, reviews: 1500, tag: 'Beach Resort', emoji: '🌅', color: '#0B6E4F', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' },
  { id: 'h5', name: 'ITC Grand, Mumbai', location: 'Lower Parel, Mumbai', price: 8999, oldPrice: 11999, rating: 4.5, reviews: 2700, tag: 'Business', emoji: '🏢', color: '#0E2A47', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' },
];

export const DESTINATIONS = [
  { id: 'd1', name: 'Goa', tag: 'Beaches', tours: 120, emoji: '🏖️', color: '#0EA5E9', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80' },
  { id: 'd2', name: 'Jaipur', tag: 'Heritage', tours: 95, emoji: '🕌', color: '#B89B00', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80' },
  { id: 'd3', name: 'Manali', tag: 'Hills', tours: 80, emoji: '⛰️', color: '#334155', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' },
  { id: 'd4', name: 'Kerala', tag: 'Backwaters', tours: 110, emoji: '🌴', color: '#0B6E4F', image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80' },
  { id: 'd5', name: 'Dubai', tag: 'International', tours: 65, emoji: '🌆', color: '#7C3AED', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80' },
  { id: 'd6', name: 'Bali', tag: 'International', tours: 58, emoji: '🌊', color: '#0284C7', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
];

export const BUSES = [
  { id: 'b1', operator: 'Adotrip Volvo A/C Sleeper', dep: '21:30', arr: '06:15', dur: '8h 45m', price: 899, seats: 22, rating: 4.4, from: 'Delhi', to: 'Jaipur' },
  { id: 'b2', operator: 'Sharma Travels A/C Seater', dep: '22:00', arr: '07:30', dur: '9h 30m', price: 649, seats: 31, rating: 4.1, from: 'Delhi', to: 'Jaipur' },
  { id: 'b3', operator: 'Raj Express Scania', dep: '23:15', arr: '07:45', dur: '8h 30m', price: 1099, seats: 18, rating: 4.6, from: 'Delhi', to: 'Jaipur' },
  { id: 'b4', operator: 'City Line Volvo 9400', dep: '06:00', arr: '14:30', dur: '8h 30m', price: 749, seats: 27, rating: 4.2, from: 'Mumbai', to: 'Goa' },
];

export const VISA_COUNTRIES = [
  { id: 'v1', country: 'Dubai', price: 4999, days: '3-4 Working Days', validity: '30 Days', emoji: '🇦🇪', color: '#0EA5E9' },
  { id: 'v2', country: 'Thailand', price: 2999, days: '2-3 Working Days', validity: '60 Days', emoji: '🇹🇭', color: '#0B6E4F' },
  { id: 'v3', country: 'Singapore', price: 5499, days: '4-5 Working Days', validity: '30 Days', emoji: '🇸🇬', color: '#DC2626' },
  { id: 'v4', country: 'Malaysia', price: 3499, days: '3-4 Working Days', validity: '30 Days', emoji: '🇲🇾', color: '#B45309' },
  { id: 'v5', country: 'USA', price: 14999, days: '15-20 Working Days', validity: '10 Years', emoji: '🇺🇸', color: '#0E2A47' },
  { id: 'v6', country: 'Schengen', price: 8999, days: '10-15 Working Days', validity: '90 Days', emoji: '🇪🇺', color: '#7C3AED' },
];

export const BLOGS = [
  { id: 'g1', title: 'Long Weekends In India 2026 - Complete List', cat: 'Travel Guide', read: '6 min read', emoji: '📅', color: '#B89B00', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80', desc: 'Plan smart with all long weekends, festivals and best places to visit month-wise.' },
  { id: 'g2', title: 'Must Visit Travel Destinations Around the World', cat: 'Destinations', read: '8 min read', emoji: '🌍', color: '#0284C7', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80', desc: 'From Bali to Santorini — iconic landscapes, cultures and sights made easy.' },
  { id: 'g3', title: 'How Travel Agencies Transform Your Trip', cat: 'Tips', read: '5 min read', emoji: '💡', color: '#0B6E4F', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', desc: 'Tailored packages, best deals and 24x7 support — why 2M+ travellers trust Adotrip.' },
  { id: 'g4', title: 'Chardham Yatra 2026: Dates, Route & Budget', cat: 'Pilgrimage', read: '10 min read', emoji: '🛕', color: '#B45309', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80', desc: 'Yamunotri, Gangotri, Kedarnath, Badrinath — complete itinerary with stay & transport.' },
];

export const FAQS = [
  { q: 'Flight aur hotel offers kahan milenge?', a: 'Home page par Exclusive Offers section me. Har offer ke sath promo code diya hai — booking ke time apply karein.' },
  { q: 'Kya booking ke baad cancellation / refund milega?', a: 'Haan. Har flight, hotel aur package par cancellation policy likhi hoti hai. Refund 5-7 working days me source account me aa jata hai.' },
  { q: 'Kya Adotrip par EMI available hai?', a: 'Haan, major credit cards par No-Cost EMI available hai Checkout page par.' },
  { q: 'Circuit Planner kya hai?', a: 'AI Trip Planner me origin, destination aur days daalein — app turant day-wise itinerary bana deta hai.' },
  { q: 'Customer support kaise contact karein?', a: 'Contact Us page par form bharein ya 24x7 helpline par call karein. App me Support section bhi hai.' },
];
