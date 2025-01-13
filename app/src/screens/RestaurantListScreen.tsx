import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { Restaurant } from '../types';
import { searchNearbyRestaurants } from '../services/api/mapService';
import { getCurrentLocation } from '../services/location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const RestaurantListScreen = ({ navigation }: Props) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [showFilters, setShowFilters] = useState(false);

  const cuisineTypes = [
    { label: 'Hepsi', value: 'all' },
    { label: 'Türk', value: 'turkish' },
    { label: 'İtalyan', value: 'italian' },
    { label: 'Cafe', value: 'cafe' },
    { label: 'Fast Food', value: 'fast_food' }
  ];

  const priceRanges = [
    { label: 'Hepsi', value: 'all' },
    { label: 'Ekonomik', value: 'Ekonomik' },
    { label: 'Orta', value: 'Orta' },
    { label: 'Pahalı', value: 'Pahalı' }
  ];

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const location = await getCurrentLocation();
      const nearbyRestaurants = await searchNearbyRestaurants(
        location.latitude,
        location.longitude
      );
      setRestaurants(nearbyRestaurants);
    } catch (err) {
      setError('Restoranlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    return restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCuisine = selectedCuisine === 'Hepsi' || 
        restaurant.cuisineType.toLowerCase().includes(
          cuisineTypes.find(c => c.label === selectedCuisine)?.value || ''
        );
      const matchesPrice = selectedPrice === 'all' || restaurant.priceLevel === selectedPrice;
      const matchesDistance = restaurant.distance ? restaurant.distance <= maxDistance : true;

      return matchesSearch && matchesCuisine && matchesPrice && matchesDistance;
    });
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
          style={styles.cardImage}
        />
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.cuisineType}>{item.cuisineType}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="pricetag" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.priceLevel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color={COLORS.gray} />
            <Text style={styles.infoText}>{item.distance}km</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restoran ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {cuisineTypes.map((cuisine) => (
          <TouchableOpacity
            key={cuisine.label}
            style={[
              styles.filterButton,
              selectedCuisine === cuisine.label && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCuisine(cuisine.label)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCuisine === cuisine.label && styles.filterButtonTextActive
            ]}>
              {cuisine.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Fiyat Aralığı</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {priceRanges.map((price) => (
            <TouchableOpacity
              key={price.value}
              style={[
                styles.filterButton,
                selectedPrice === price.value && styles.filterButtonActive
              ]}
              onPress={() => setSelectedPrice(price.value)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedPrice === price.value && styles.filterButtonTextActive
              ]}>
                {price.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Maksimum Mesafe: {maxDistance} km</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={maxDistance}
          onValueChange={setMaxDistance}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.primary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRestaurants}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <TouchableOpacity 
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options" size={24} color={COLORS.primary} />
        <Text style={styles.filterToggleText}>Filtreler</Text>
      </TouchableOpacity>
      {showFilters && renderFilters()}
      <FlatList
        data={filterRestaurants()}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.medium,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.medium,
    padding: SIZES.small,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
  header: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: SIZES.small,
  },
  searchIcon: {
    marginRight: SIZES.small,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  filterContainer: {
    marginTop: SIZES.medium,
  },
  filterButton: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.small,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SIZES.medium,
  },
  restaurantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: SIZES.medium,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  ratingContainer: {
    position: 'absolute',
    top: SIZES.small,
    right: SIZES.small,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.small,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  cardContent: {
    padding: SIZES.medium,
  },
  restaurantName: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
  },
  cuisineType: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: SIZES.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  infoText: {
    marginLeft: 4,
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterSection: {
    marginBottom: SIZES.medium,
  },
  filterTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.small,
  },
  slider: {
    height: 40,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.small,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterToggleText: {
    marginLeft: SIZES.small,
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
});

export default RestaurantListScreen; 