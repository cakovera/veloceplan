import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import { Restaurant } from '../types';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  Home: undefined;
  RestaurantList: undefined;
  RestaurantDetail: { restaurant: Restaurant };
  Profile: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user } = useAuth();

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
        </>
      )}
    </Stack.Navigator>
  );
};