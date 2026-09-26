import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />

        {/* Booking */}
        <Stack.Screen name="booking/search" />

        {/* Tickets & support */}
        <Stack.Screen name="tickets" />
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
