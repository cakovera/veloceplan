import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import { getCurrentLocation } from '../services/location';
import { Location } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut, username } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Konum alınamadı:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.username}>{username || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => navigation.navigate('RestaurantList')}
        >
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Konumunuz"
              />
            </MapView>
          ) : (
            <View style={styles.loadingMap}>
              <Ionicons name="location" size={32} color={COLORS.primary} />
              <Text style={styles.loadingText}>Konum yükleniyor...</Text>
            </View>
          )}
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Yakınındaki Restoranlar</Text>
            <Text style={styles.featuredDescription}>
              Konumuna yakın en iyi restoranları keşfet
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('RestaurantList')}
          >
            <Ionicons name="restaurant" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Restoranlar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  greeting: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  username: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
  },
  featuredSection: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.medium,
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  map: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  markerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  loadingMap: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SIZES.small,
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
  featuredContent: {
    padding: SIZES.medium,
  },
  featuredTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.small,
  },
  featuredDescription: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  quickActions: {
    padding: SIZES.medium,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    margin: SIZES.small,
    padding: SIZES.medium,
    borderRadius: 15,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionText: {
    marginTop: SIZES.small,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
});