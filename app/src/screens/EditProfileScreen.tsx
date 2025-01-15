import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, reload } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDoc, setDoc, doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function EditProfileScreen({ navigation }: Props) {
  const { user, signOut, loadUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadUsername(user.uid);
    }
  }, []);

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz');
      return;
    }

    try {
      setLoading(true);

      // Önce yeni kullanıcı adının kullanılıp kullanılmadığını kontrol et
      const newUsernameDoc = await getDoc(doc(db, 'usernames', username));
      if (newUsernameDoc.exists() && newUsernameDoc.data().uid !== user!.uid) {
        Alert.alert('Hata', 'Bu kullanıcı adı zaten kullanılıyor');
        return;
      }

      // Kullanıcının mevcut kullanıcı adını bul
      const currentUserDoc = await getDoc(doc(db, 'users', user!.uid));
      if (currentUserDoc.exists()) {
        const currentUsername = currentUserDoc.data().username;
        
        // Eski kullanıcı adını sil
        if (currentUsername && currentUsername !== username) {
          await deleteDoc(doc(db, 'usernames', currentUsername));
        }
      }

      // Yeni kullanıcı adını kaydet
      await setDoc(doc(db, 'usernames', username), {
        uid: user!.uid,
        email: user!.email,
        createdAt: new Date().toISOString()
      });

      // Kullanıcı bilgilerini güncelle
      await setDoc(doc(db, 'users', user!.uid), {
        username: username,
        email: user!.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await loadUsername(user!.uid);
      Alert.alert('Başarılı', 'Kullanıcı adı güncellendi');
      navigation.goBack();
    } catch (error) {
      console.error('Kullanıcı adı güncelleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı adı güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm şifre alanlarını doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!user?.email) {
      Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
      return;
    }

    try {
      setLoading(true);
      
      // Önce mevcut şifreyi doğrula
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Yeniden kimlik doğrulama
      try {
        await reauthenticateWithCredential(user, credential);
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          Alert.alert('Hata', 'Mevcut şifreniz yanlış');
        } else {
          Alert.alert('Hata', 'Kimlik doğrulama başarısız');
        }
        return;
      }

      // Şifre değişikliği beklemede olduğunu işaretle
      await AsyncStorage.setItem(`@password_change_${user.uid}`, 'true');
      await AsyncStorage.setItem(`@pending_password_${user.uid}`, newPassword);

      // Email doğrulama gönder
      await sendEmailVerification(user);
      
      Alert.alert(
        'Doğrulama Gerekli',
        'Email adresinize bir doğrulama linki gönderdik. Lütfen doğrulama yapın ve tekrar giriş yapın. Email doğrulamasından sonra yeni şifreniz aktif olacaktır.',
        [
          {
            text: 'Tamam',
            onPress: async () => {
              try {
                await signOut();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (error) {
                console.error('Çıkış yapılırken hata:', error);
              }
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('İşlem hatası:', error);
      Alert.alert('Hata', 'Bir sorun oluştu, lütfen daha sonra tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kullanıcı Adı</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Kullanıcı Adı"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateUsername}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Kullanıcı Adını Güncelle</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Mevcut Şifre"
            secureTextEntry
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Yeni Şifre"
            secureTextEntry
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Yeni Şifre Tekrar"
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.padding,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: SIZES.base,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.padding,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 