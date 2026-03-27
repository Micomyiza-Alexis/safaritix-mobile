import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const COLORS = {
  primary: '#0077B6',
  muted: '#64748B',
};

export default function TrackBusMap({ loading, coordinates, region, busPlate, locationLabel }) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading live location...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      region={region}
      showsUserLocation={false}
      showsMyLocationButton={false}
    >
      {coordinates ? (
        <Marker
          coordinate={coordinates}
          title={busPlate}
          description={locationLabel}
          pinColor={COLORS.primary}
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
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
});
