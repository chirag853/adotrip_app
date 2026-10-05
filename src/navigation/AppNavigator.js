import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { COLORS, RADIUS } from '../theme';
import SosButton from '../components/SosButton';

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
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: COLORS.secondary,
          tabBarInactiveTintColor: 'rgba(90,100,115,0.85)',
          tabBarItemStyle: { borderRadius: RADIUS.button, marginHorizontal: 4, paddingVertical: 4 },
          tabBarStyle: { position: 'absolute', bottom: 12, left: 16, right: 16, height: 68, borderRadius: RADIUS.xl, backgroundColor: '#fff', borderTopWidth: 1, borderColor: COLORS.border, paddingBottom: 8, paddingTop: 8, elevation: 8, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
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
      <SosButton />
    </View>
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
