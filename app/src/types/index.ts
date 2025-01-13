export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
  reviews: Review[];
  location: {
    latitude: number;
    longitude: number;
  };
  cuisineType: string;
  distance: number;
  image: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}