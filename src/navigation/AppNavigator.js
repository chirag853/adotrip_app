import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import HolidayDetailScreen from '../screens/HolidayDetailScreen';
import OffersScreen from '../screens/OffersScreen';
import BookingsScreen from '../screens/BookingsScreen';
import AccountScreen from '../screens/AccountScreen';
import FlightsScreen from '../screens/FlightsScreen';
import FlightResultsScreen from '../screens/FlightResultsScreen';
import HotelsScreen from '../screens/HotelsScreen';
import HotelListScreen from '../screens/HotelListScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import BusScreen from '../screens/BusScreen';
import BusListScreen from '../screens/BusListScreen';
import VisaScreen from '../screens/VisaScreen';
import BlogScreen from '../screens/BlogScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import CircuitPlannerScreen from '../screens/CircuitPlannerScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmScreen from '../screens/ConfirmScreen';
import AuthScreen from '../screens/AuthScreen';
import { AboutScreen, ContactScreen, SupportScreen } from '../screens/InfoScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryText,
        tabBarInactiveTintColor: '#8A94A6',
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const map = { Home: 'home', Holidays: 'map', Offers: 'pricetags', Bookings: 'briefcase', Account: 'person' };
          return <Ionicons name={map[route.name] || 'ellipse'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Holidays" component={HolidaysScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen name="Flights" component={FlightsScreen} />
      <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
      <Stack.Screen name="Hotels" component={HotelsScreen} />
      <Stack.Screen name="HotelList" component={HotelListScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="Bus" component={BusScreen} />
      <Stack.Screen name="BusList" component={BusListScreen} />
      <Stack.Screen name="HolidayDetail" component={HolidayDetailScreen} />
      <Stack.Screen name="Visa" component={VisaScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="Circuit" component={CircuitPlannerScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}
