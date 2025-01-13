import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/location-animation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        onAnimationFinish={onFinish}
        speed={0.8}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
});

export default SplashScreen;
