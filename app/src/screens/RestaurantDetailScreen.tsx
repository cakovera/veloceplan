import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import MapView, { Marker } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Restaurant } from '../types';
import { getPlaceReviews } from '../services/api/mapService';

type RootStackParamList = {
  RestaurantDetail: { restaurant: Restaurant };
};

type Props = {
  route: RouteProp<RootStackParamList, 'RestaurantDetail'>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const RestaurantDetailScreen = ({ route, navigation }: Props) => {
  const { restaurant } = route.params;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const placeReviews = await getPlaceReviews(restaurant.id);
        setReviews(placeReviews);
      } catch (error) {
        console.error('Yorumlar yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurant.id]);

  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' }) || 'geo:0,0?q=';
    const latLng = `${restaurant.location.latitude},${restaurant.location.longitude}`;
    const label = restaurant.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    }) || `geo:0,0?q=${latLng}(${label})`;

    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: restaurant.image }}
        style={styles.image}
      />

      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={COLORS.warning} />
          <Text style={styles.rating}>{restaurant.rating}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="restaurant" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{restaurant.cuisineType}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="pricetag" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{restaurant.priceLevel}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{restaurant.distance} km</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: restaurant.location.latitude,
            longitude: restaurant.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: restaurant.location.latitude,
              longitude: restaurant.location.longitude,
            }}
            title={restaurant.name}
          />
        </MapView>
      </View>

      <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
        <Ionicons name="navigate" size={24} color={COLORS.white} />
        <Text style={styles.directionsText}>Yol Tarifi Al</Text>
      </TouchableOpacity>

      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>Google Yorumları</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                <View style={styles.reviewRating}>
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.reviewRatingText}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewTime}>
                {new Date(review.time * 1000).toLocaleDateString()}
              </Text>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviews}>Henüz yorum yapılmamış</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  name: {
    flex: 1,
    fontSize: SIZES.extraLarge,
    fontWeight: '600',
    color: COLORS.black,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: SIZES.small,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: SIZES.small,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  mapContainer: {
    height: 300,
    margin: SIZES.medium,
    borderRadius: 15,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  map: {
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: SIZES.medium,
    padding: SIZES.medium,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  directionsText: {
    marginLeft: SIZES.small,
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.white,
  },
  reviewsContainer: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    marginTop: SIZES.small,
    ...SHADOWS.medium,
  },
  reviewsTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    marginBottom: SIZES.medium,
    color: COLORS.black,
  },
  reviewItem: {
    marginBottom: SIZES.medium,
    padding: SIZES.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: SIZES.font,
    fontWeight: '500',
    color: COLORS.black,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  reviewTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: SIZES.font,
    color: COLORS.black,
    lineHeight: 20,
  },
  noReviews: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: SIZES.font,
    padding: SIZES.medium,
  },
});

export default RestaurantDetailScreen; 