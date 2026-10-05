import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import "react-native-reanimated";
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuth = segments[0] === 'auth';
    if (!isAuthenticated && !inAuth) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuth) {
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
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        {/* Booking */}
        <Stack.Screen name="booking/search" />

        {/* Tickets & support */}
        <Stack.Screen name="tickets" />
        <Stack.Screen name="tickets/[id]" />
        <Stack.Screen name="support/contact" />

        {/* Legacy screens — temporary during migration */}
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
