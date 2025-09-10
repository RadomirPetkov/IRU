// src/firebaseAuth.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from "firebase/auth";

// Вашата Firebase конфигурация (използвайте същата от firebaseConfig.js)
const firebaseConfig = {
  apiKey: "AIzaSyCcFpFo8B6B-tHv8l3kI6O8RvLiB0qCftg",
  authDomain: "iru2006-184d2.firebaseapp.com",
  projectId: "iru2006-184d2",
  storageBucket: "iru2006-184d2.firebasestorage.app",
  messagingSenderId: "632454950533",
  appId: "1:632454950533:web:5046e78a937d568e1a83ec",
  measurementId: "G-Q6CWE9Y5RB",
};

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Функции за управление на автентификацията
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createUser = async (email, password) => {
  try {
    // Валидация на параметрите
    if (typeof email !== 'string' || typeof password !== 'string') {
      return { success: false, error: 'Email и парола трябва да са string' };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Проследяване на състоянието на автентификацията
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;