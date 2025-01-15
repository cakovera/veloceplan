import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { user, username, signOut } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(`@profile_image_${user?.uid}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Profil fotoğrafı yüklenemedi:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni gerekiyor');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user?.uid) {
      try {
        await AsyncStorage.setItem(`@profile_image_${user.uid}`, result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      } catch (error) {
        Alert.alert('Hata', 'Fotoğraf kaydedilemedi');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={50} color={COLORS.gray} />
            </View>
          )}
          <View style={styles.editButton}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.username}>{username}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.primary} />
          <Text style={styles.menuText}>Profili Düzenle</Text>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
          <Text style={styles.menuText}>Bildirimler</Text>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
          <Text style={styles.menuText}>Ayarlar</Text>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileSection: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  username: {
    fontSize: SIZES.large,
    color: COLORS.black,
    marginTop: SIZES.base,
  },
  menuSection: {
    marginTop: SIZES.padding,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuText: {
    flex: 1,
    marginLeft: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding * 2,
    marginHorizontal: SIZES.padding * 2,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  logoutText: {
    marginLeft: SIZES.base,
    fontSize: SIZES.font,
    color: COLORS.error,
    fontWeight: '600',
  },
}); 