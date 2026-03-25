import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

const COLORS = {
  available: '#27AE60',
  booked: '#E74C3C',
  selected: '#0077B6',
  label: '#FFFFFF',
};

export default function SeatItem({ seatNumber, state, onPress, size = 42 }) {
  const isBooked = state === 'booked';
  const isSelected = state === 'selected';
  const color = isSelected ? COLORS.selected : isBooked ? COLORS.booked : COLORS.available;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.08 : 1,
      friction: 7,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress(seatNumber)}
        disabled={isBooked}
        style={({ pressed }) => [
          styles.seat,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: Math.max(10, Math.floor(size * 0.24)),
          },
          isBooked && styles.bookedSeat,
          pressed && !isBooked && styles.seatPressed,
        ]}
      >
        <Text style={[styles.seatLabel, { fontSize: Math.max(11, Math.floor(size * 0.28)) }]}>{seatNumber}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  bookedSeat: {
    opacity: 0.7,
  },
  seatPressed: {
    transform: [{ scale: 0.94 }],
  },
  seatLabel: {
    color: COLORS.label,
    fontWeight: '800',
    fontSize: 12,
  },
});
