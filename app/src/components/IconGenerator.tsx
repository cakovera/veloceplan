import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const IconGenerator = () => {
  return (
    <View style={{
      width: 1024,
      height: 1024,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Ionicons name="restaurant" size={512} color={COLORS.white} />
    </View>
  );
};

export default IconGenerator; 