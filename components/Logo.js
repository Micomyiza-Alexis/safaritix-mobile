import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const logoSource = require('../assets/images/SafariTix-Logo.png');

export default function Logo({
  width = 168,
  height = 56,
  style,
  imageStyle,
}) {
  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        source={logoSource}
        style={[styles.image, imageStyle]}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="SafariTix"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
