import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Konum izni reddedildi');
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
}; 