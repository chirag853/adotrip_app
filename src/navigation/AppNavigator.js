import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import AppShell from '../components/AppShell';
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
import HimachalScreen from '../screens/HimachalScreen';
import HptdcHotelDetailScreen from '../screens/HptdcHotelDetailScreen';
import { AboutScreen, ContactScreen, SupportScreen } from '../screens/InfoScreens';
import ComingSoonScreen from '../screens/ComingSoonScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={() => null}
        screenOptions={{ headerShown: false }}
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
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      screenLayout={({ children, navigation }) => (
        <AppShell navigation={navigation}>{children}</AppShell>
      )}
    >
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
      <Stack.Screen name="Himachal" component={HimachalScreen} />
      <Stack.Screen name="HptdcHotelDetail" component={HptdcHotelDetailScreen} />
      <Stack.Screen
        name="LuxuryTrains"
        component={ComingSoonScreen}
        initialParams={{
          title: 'Luxury Trains',
          emoji: '🚂',
          blurb: 'Palace on Wheels jaisi royal train journeys — routes, itineraries aur booking jald hi yahan.',
          highlights: ['Palace on Wheels', "Maharajas' Express", 'Golden Chariot', 'Deccan Odyssey'],
        }}
      />
    </Stack.Navigator>
  );
}
