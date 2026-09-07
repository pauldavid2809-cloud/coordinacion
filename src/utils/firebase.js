import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, update, get, onValue } from 'firebase/database';

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
const db = getDatabase(app);

export { app, db, ref, set, update, get, onValue };

