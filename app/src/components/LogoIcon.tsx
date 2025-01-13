import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const LogoIcon = () => {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name="restaurant" size={40} color={COLORS.white} />
      </View>
      <View style={[styles.circle, styles.smallCircle]}>
        <Ionicons name="location" size={24} color={COLORS.white} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  smallCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary || '#FF6B6B',
  },
});

export default LogoIcon; 