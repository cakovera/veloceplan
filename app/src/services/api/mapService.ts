import axios from 'axios';
import { Restaurant, Location } from '../../types';

const GOOGLE_PLACES_API_KEY = 'AIzaSyBPiXfNvfFBWiJ-LDOaxIOd-Bgfg3AAUYQ';
const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place';

// Restoran türünü belirlemek için kelime eşleştirme
const getCuisineType = (place: any) => {
  const name = place.name.toLowerCase();
  const types = place.types || [];
  
  // Türk mutfağı için anahtar kelimeler
  const turkishKeywords = [
    'kebap', 'kebab', 'pide', 'döner', 'doner', 'kabab',
    'turkish', 'türk', 'lahmacun', 'köfte', 'kofte',
    'lokanta', 'ocakbaşı', 'ocakbasi', 'mangal', 'iskender',
    'adana', 'urfa', 'sultan', 'efendi', 'osmanli',
    'anadolu', 'borek', 'börek', 'king',
    'lokanta', 'kebap', 'pide', 'döner', 'köfte',
    'ocakbaşı', 'çorbacı', 'lahmacun', 'mantı',
    'ev yemekleri', 'balık', 'meyhane'
  ];

  // İtalyan mutfağı için anahtar kelimeler
  const italianKeywords = [
    'pizza', 'pasta', 'italian', 'italyan', 
    'trattoria', 'ristorante', 'pizzeria'
  ];

  // Cafe için anahtar kelimeler
  const cafeKeywords = [
    'cafe', 'kahve', 'coffee', 'bistro', 
    'patisserie', 'pastane', 'çay', 'cay'
  ];

  // Fast food için anahtar kelimeler
  const fastFoodKeywords = [
    'burger', 'fast', 'express', 'quick', 
    'mcdonalds', 'kfc', 'dominos', 'subway'
  ];

  if (place.cuisine) return place.cuisine;

  if (turkishKeywords.some(keyword => name.includes(keyword))) {
    return 'turkish';
  }
  if (italianKeywords.some(keyword => name.includes(keyword))) {
    return 'italian';
  }
  if (cafeKeywords.some(keyword => name.includes(keyword))) {
    return 'cafe';
  }
  if (fastFoodKeywords.some(keyword => name.includes(keyword))) {
    return 'fast_food';
  }

  if (types.includes('cafe')) return 'cafe';
  if (types.includes('fast_food')) return 'fast_food';

  const address = (place.formatted_address || '').toLowerCase();
  if (turkishKeywords.some(keyword => address.includes(keyword))) {
    return 'turkish';
  }

  return 'restaurant';
};

const getPriceLevel = (level: string | undefined) => {
  switch (level) {
    case '0':
    case '1':
      return 'Uygun';
    case '2':
      return 'Orta';
    case '3':
    case '4':
      return 'Lüks';
    default:
      return 'Orta';
  }
};

export const searchNearbyRestaurants = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
) => {
  const userLocation: Location = { latitude, longitude };
  
  try {
    const response = await axios.get(
      `${GOOGLE_PLACES_API}/nearbysearch/json`,
      {
        params: {
          location: `${latitude},${longitude}`,
          radius,
          type: 'restaurant',
          key: GOOGLE_PLACES_API_KEY,
          language: 'tr',
          region: 'TR'
        }
      }
    );

    // Her bir restoran için detay bilgisi alalım
    const detailedRestaurants = await Promise.all(
      response.data.results.map(async (place: any) => {
        try {
          const detailResponse = await axios.get(
            `${GOOGLE_PLACES_API}/details/json`,
            {
              params: {
                place_id: place.place_id,
                fields: 'name,type,cuisine,price_level,rating,photos,formatted_address',
                key: GOOGLE_PLACES_API_KEY
              }
            }
          );
          return { ...place, ...detailResponse.data.result };
        } catch (error) {
          console.error('Detay bilgisi alınamadı:', error);
          return place;
        }
      })
    );

    const restaurants: Restaurant[] = detailedRestaurants.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address || '',
      cuisine: place.types?.[0] || '',
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      cuisineType: getCuisineType(place),
      priceLevel: getPriceLevel(place.price_level?.toString()),
      rating: place.rating || 0,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      image: place.photos ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` :
        `https://source.unsplash.com/400x300/?restaurant,${place.name}`,
      reviews: []
    }));

    return restaurants;

  } catch (error) {
    console.error('Restoranlar getirilemedi:', error);
    throw error;
  }
};

// İki nokta arası mesafe hesaplama (km cinsinden)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Kilometre cinsinden mesafe
  return Math.round(distance * 10) / 10;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

export const getPlaceReviews = async (placeId: string) => {
  try {
    const response = await axios.get(
      `${GOOGLE_PLACES_API}/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'reviews',
          key: GOOGLE_PLACES_API_KEY
        }
      }
    );

    return response.data.result.reviews || [];
  } catch (error) {
    console.error('Yorumlar getirilemedi:', error);
    return [];
  }
};