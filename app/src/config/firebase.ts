import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARdlOEYpt89dUTkYNCWtM5A6ODsLKsjLA",
  authDomain: "veloceapp.firebaseapp.com",
  projectId: "veloceapp",
  storageBucket: "veloceapp.appspot.com",
  messagingSenderId: "89712558937",
  appId: "1:89712558937:web:bb218e3dc3a1913581c248",
  measurementId: "G-2DVFWSLC1P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);