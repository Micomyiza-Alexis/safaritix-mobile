import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

const COLORS = {
  primary: '#0077B6',
  muted: '#64748B',
  white: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function ExpoGoMapFallback({ loading, coordinates, busPlate, locationLabel }) {
  return (
    <View style={styles.fallback}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <Text style={styles.pin}>📍</Text>
      )}
      <Text style={styles.title}>
        {loading ? 'Loading bus location...' : (busPlate || 'SafariTix bus')}
      </Text>
      <Text style={styles.description}>
        {loading
          ? 'Please wait while we retrieve tracking information.'
          : (locationLabel || 'Live map preview is unavailable in Expo Go.')}
      </Text>
      {coordinates ? (
        <Text style={styles.coordinates}>
          {Number(coordinates.latitude).toFixed(5)}, {Number(coordinates.longitude).toFixed(5)}
        </Text>
      ) : null}
      <Text style={styles.note}>
        Use a SafariTix development build to display the native live map.
      </Text>
    </View>
  );
}

function NativeMap({ loading, coordinates, region, busPlate, locationLabel }) {
  const { Map, Camera, Marker } = require('@maplibre/maplibre-react-native');
  const cameraRef = useRef(null);

  const latitude = coordinates?.latitude ?? region?.latitude ?? -1.9441;
  const longitude = coordinates?.longitude ?? region?.longitude ?? 30.0619;
  const latitudeDelta = region?.latitudeDelta ?? 0.08;
  const zoom = Math.max(3, Math.min(18, Math.log2(360 / Math.max(latitudeDelta, 0.001))));

  useEffect(() => {
    if (!loading && coordinates) {
      cameraRef.current?.setCamera?.({
        centerCoordinate: [coordinates.longitude, coordinates.latitude],
        animationDuration: 500,
      });
    }
  }, [coordinates?.latitude, coordinates?.longitude, loading]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.description}>Loading live location...</Text>
      </View>
    );
  }

  return (
    <Map style={styles.map} mapStyle={MAP_STYLE}>
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [longitude, latitude],
          zoomLevel: zoom,
        }}
      />
      {coordinates &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude) ? (
        <Marker
          id="safaritix-live-bus"
          coordinate={[coordinates.longitude, coordinates.latitude]}
        >
          <View style={styles.marker}>
            <Text style={styles.markerTitle}>{busPlate || 'SafariTix bus'}</Text>
            {!!locationLabel && (
              <Text style={styles.description}>{locationLabel}</Text>
            )}
          </View>
        </Marker>
      ) : null}
    </Map>
  );
}

export default function TrackBusMap(props) {
  // Expo Go cannot load custom native modules that aren't built into its binary.
  if (Constants.executionEnvironment === 'storeClient') {
    return <ExpoGoMapFallback {...props} />;
  }

  return <NativeMap {...props} />;
}

const styles = StyleSheet.create({
  map: { flex: 1, width: '100%', height: '100%', minHeight: 1 },
  fallback: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  pin: { fontSize: 36, marginBottom: 8 },
  title: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  coordinates: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  note: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  marker: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 220,
  },
  markerTitle: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
