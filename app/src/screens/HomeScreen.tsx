import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: Props) => {
  const { user, signOut } = useAuth();

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
          <Text style={styles.username}>{user?.email}</Text>
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
          <Image
            source={{ uri: 'https://source.unsplash.com/800x400/?restaurant' }}
            style={styles.featuredImage}
          />
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
};

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
  featuredImage: {
    width: '100%',
    height: 200,
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

export default HomeScreen;