
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCY1dGUCM35guqsE1632j0NYLXI0THTmQ8",
  authDomain: "ncctrichy-d60fa.firebaseapp.com",
  projectId: "ncctrichy-d60fa",
  storageBucket: "ncctrichy-d60fa.firebasestorage.app",
  messagingSenderId: "245703083753",
  appId: "1:245703083753:web:97f041cb56cbabba989278"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
