import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  signInWithCredential,
  sendEmailVerification,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  username: string;
  loadUsername: (uid: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '89712558937-27dfl060v4cuth3322d0or0gflk074aa.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.uid) {
        loadUsername(user.uid);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        enableNetwork(db);
      } else {
        disableNetwork(db);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('İnternet bağlantınızı kontrol edin');
    }

    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      try {
        await setDoc(doc(db, 'usernames', username), {
          uid: userCredential.user.uid,
          email: email,
          createdAt: new Date().toISOString()
        });

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: username,
          email: email,
          createdAt: new Date().toISOString()
        });

        await sendEmailVerification(userCredential.user);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        await userCredential.user.delete();
        throw new Error('Kullanıcı kaydı tamamlanamadı, lütfen tekrar deneyin');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('İnternet bağlantınızı kontrol edin');
    }

    try {
      let email = emailOrUsername;
      
      // Email formatında değilse, kullanıcı adı olarak kabul et
      if (!emailOrUsername.includes('@')) {
        const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername));
        if (!usernameDoc.exists()) {
          throw new Error('Kullanıcı bulunamadı');
        }
        email = usernameDoc.data().email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.emailVerified) {
        const pendingPasswordChange = await AsyncStorage.getItem(`@password_change_${userCredential.user.uid}`);
        if (pendingPasswordChange) {
          try {
            const credential = EmailAuthProvider.credential(email, password);
            await reauthenticateWithCredential(userCredential.user, credential);
            
            const newPassword = await AsyncStorage.getItem(`@pending_password_${userCredential.user.uid}`);
            if (newPassword) {
              await updatePassword(userCredential.user, newPassword);
              await AsyncStorage.removeItem(`@pending_password_${userCredential.user.uid}`);
              await AsyncStorage.removeItem(`@password_change_${userCredential.user.uid}`);
              Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi');
            }
          } catch (error) {
            console.error('Şifre güncelleme hatası:', error);
          }
        }
      } else {
        throw new Error('Lütfen email adresinizi doğrulayın');
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('Kullanıcı bulunamadı');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Hatalı şifre');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Giriş yapılamadı, lütfen tekrar deneyin');
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      throw error;
    }
  };

  const loadUsername = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      }
    } catch (error) {
      console.error('Kullanıcı adı yüklenemedi:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle, 
      signOut,
      username,
      loadUsername
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 