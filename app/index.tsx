import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import { Restaurant } from './src/types';

type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  RestaurantList: undefined;
  RestaurantDetail: { restaurant: Restaurant };
  Profile: undefined;
  Login: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
} 