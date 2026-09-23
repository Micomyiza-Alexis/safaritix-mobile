import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="tickets" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="support" />

        {/* Legacy screens — kept temporarily during migration */}
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