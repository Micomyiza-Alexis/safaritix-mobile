import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0077B6',
  text: '#0F172A',
  muted: '#64748B',
};

export default function TrackBusMap({ loading, coordinates }) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading live location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.webMapFallback}>
      <Ionicons name="map-outline" size={42} color={COLORS.primary} />
      <Text style={styles.fallbackTitle}>Map tracking is not available on web</Text>
      <Text style={styles.fallbackText}>
        {coordinates
          ? `Latest known position: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
          : 'We can still show the latest trip status and tracking updates here.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  webMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    backgroundColor: '#F8FBFF',
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
