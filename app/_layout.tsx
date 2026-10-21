import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import "react-native-reanimated";
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    // Do not leave users on the native launch screen if Expo's automatic
    // dismissal is delayed while the router is mounting.
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuth = segments[0] === 'auth';
    const isPublicEntry = !segments[0] || segments[0] === 'LandingPage';
    if (!isAuthenticated && !inAuth && !isPublicEntry) {
      router.replace('/');
    } else if (isAuthenticated && inAuth && segments[1] !== 'reset-password') {
      router.replace('/(main)');
    } else if (isAuthenticated && isPublicEntry) {
      router.replace('/(main)');
    }
  }, [isAuthenticated, isInitialized, router, segments]);

  if (!isInitialized) {
    return <View style={styles.loading}><ActivityIndicator color="#0077B6" /></View>;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/reset-password" />

        {/* Booking */}
        <Stack.Screen name="booking/search" />

        {/* Tickets & support */}
        <Stack.Screen name="tickets" />
        <Stack.Screen name="tickets/[id]" />
        <Stack.Screen name="support/contact" />

        {/* Legacy screens Ã¢â‚¬â€ temporary during migration */}
        <Stack.Screen name="LandingPage" />
        <Stack.Screen name="my-tickets" />
        <Stack.Screen name="track-bus" />
        <Stack.Screen name="seat-map" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="booking-success" />
        <Stack.Screen name="contact-us" />
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
});
