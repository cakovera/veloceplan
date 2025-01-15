import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (isLogin) {
      if (!emailOrUsername || !password) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
        return;
      }
      try {
        setLoading(true);
        await signIn(emailOrUsername, password);
      } catch (error: any) {
        Alert.alert('Hata', error.message);
      }
    } else {
      if (!email || !password || !username) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor');
        return;
      }

      try {
        setLoading(true);
        await signUp(email, password, username);
        Alert.alert(
          'Başarılı',
          'Hesabınız oluşturuldu. Lütfen email adresinizi doğrulayın.',
          [{ text: 'Tamam', onPress: () => setIsLogin(true) }]
        );
      } catch (error: any) {
        Alert.alert('Hata', error.message);
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>VelocePlan</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
        </Text>
      </View>


      <View style={styles.formContainer}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor={COLORS.gray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        )}
        {!isLogin ? (
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Email veya Kullanıcı Adı"
              placeholderTextColor={COLORS.gray}
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              autoCapitalize="none"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {!isLogin && (
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Şifre Tekrar"
              placeholderTextColor={COLORS.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsLogin(!isLogin);
            setPassword('');
            setConfirmPassword('');
          }}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? 'Hesabınız yok mu? Kayıt olun'
              : 'Zaten hesabınız var mı? Giriş yapın'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.base,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  formContainer: {
    flex: 0.6,
    paddingHorizontal: SIZES.padding * 2,
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
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: SIZES.padding * 2,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.primary,
    fontSize: 14,
  },
}); 