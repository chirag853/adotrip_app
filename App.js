import 'react-native-gesture-handler';
import { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

// Native splash ko tab tak roke rakho jab tak wahi logo wala JS splash ready na ho
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Yahan fonts / data load ho sakta hai. Abhi 1.8s wahi logo dikhao.
        await new Promise((resolve) => setTimeout(resolve, 1800));
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRoot = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  // App start par wahi asli Adotrip logo (assets/logo.webp)
  if (!appReady) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRoot}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 80,
  },
});
