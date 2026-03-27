import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmMobilePayment } from '../services/bookingService';

const COLORS = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  secondary: '#F4A261',
  success: '#27AE60',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  danger: '#B42318',
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(String(value || '').trim());

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const scheduleId = String(params?.scheduleId || '');
  const from = String(params?.from || '');
  const to = String(params?.to || '');
  const departureDate = String(params?.departureDate || '');
  const departureTime = String(params?.departureTime || '');
  const busPlate = String(params?.busPlate || 'Bus');
  const price = Number(params?.price || 0);
  const selectedSeats = useMemo(() => {
    try {
      const parsed = JSON.parse(String(params?.seats || '[]'));
      return Array.isArray(parsed) ? parsed.map((seat) => Number(seat)).filter((seat) => Number.isInteger(seat)) : [];
    } catch {
      return [];
    }
  }, [params?.seats]);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = selectedSeats.length * price;

  const handleConfirmPayment = async () => {
    if (!scheduleId || !from || !to || selectedSeats.length === 0) {
      setError('Missing booking details. Please go back and select seats again.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = await confirmMobilePayment({
        phone,
        email,
        from,
        to,
        seatNumbers: selectedSeats,
        scheduleId,
      });

      router.replace({
        pathname: '/booking-success',
        params: {
          booking: JSON.stringify(payload?.booking || {}),
          tickets: JSON.stringify(payload?.tickets || []),
        },
      });
    } catch (err) {
      const message = err?.message || 'Payment confirmation failed. Please try again.';
      setError(message);
      Alert.alert('Booking failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={18} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <Text style={styles.routeText}>{from} {'->'} {to}</Text>
          <Text style={styles.metaText}>Seats: {selectedSeats.join(', ')}</Text>
          <Text style={styles.metaText}>Departure: {departureDate || 'TBA'} {departureTime || ''}</Text>
          <Text style={styles.metaText}>Bus: {busPlate}</Text>
          <Text style={styles.totalText}>Total: RWF {totalAmount.toLocaleString()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Passenger Contact</Text>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+2507XXXXXXXX"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.noticeText}>
              Payment is simulated for now. Tapping confirm will create the booking, generate the ticket and send it to the email above.
            </Text>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleConfirmPayment}
            disabled={submitting}
            style={({ pressed }) => [
              styles.confirmButton,
              submitting && styles.confirmButtonDisabled,
              pressed && !submitting && styles.confirmButtonPressed,
            ]}
          >
            {submitting ? (
              <View style={styles.confirmContent}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirming...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  iconButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  totalText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.success,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E6F4FB',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  confirmButton: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmButtonPressed: {
    opacity: 0.9,
  },
  confirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
