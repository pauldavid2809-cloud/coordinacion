import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC2KrGxrrclqE1yJjy70d0HuF0R7ilPPcI",
  authDomain: "coordinaciin.firebaseapp.com",
  projectId: "coordinaciin",
  storageBucket: "coordinaciin.firebasestorage.app",
  messagingSenderId: "869152245512",
  appId: "1:869152245512:web:41ba6c33810e5faaa48ebd",
  measurementId: "G-TGE61KBFVR"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { 
  app, 
  firestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
};
