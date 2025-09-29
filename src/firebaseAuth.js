// src/firebaseAuth.js - Production готова версия
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// Сигурна Firebase конфигурация
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Валидация на конфигурацията
if (
  !process.env.REACT_APP_FIREBASE_API_KEY ||
  !process.env.REACT_APP_FIREBASE_PROJECT_ID
) {
  throw new Error(
    "Missing required Firebase environment variables. Please check your .env file."
  );
}

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Функции за управление на автентификацията
export const loginUser = async (email, password) => {
  try {
    // Основна валидация
    if (!email || !password) {
      return { success: false, error: "Email и парола са задължителни" };
    }

    // Нормализираме имейла
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@") || password.length < 6) {
      return { success: false, error: "Невалиден email или парола" };
    }

    // Използваме нормализирания имейл
    const userCredential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    // Обработка на грешки без изложение на чувствителна информация
    let errorMessage = "Грешка при влизане";

    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "Невалиден email или парола";
        break;
      case "auth/too-many-requests":
        errorMessage = "Прекалено много опити. Опитайте отново по-късно";
        break;
      case "auth/network-request-failed":
        errorMessage = "Проблем с мрежата. Проверете интернет връзката";
        break;
      default:
        errorMessage = "Възникна грешка. Опитайте отново";
    }

    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Грешка при излизане от системата" };
  }
};

export const createUser = async (email, password) => {
  try {
    // Валидация на параметрите
    if (typeof email !== "string" || typeof password !== "string") {
      return { success: false, error: "Невалидни данни" };
    }

    // Нормализираме имейла
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@") || password.length < 6) {
      return {
        success: false,
        error: "Email трябва да е валиден и паролата поне 6 символа",
      };
    }

    // Използваме нормализирания имейл
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = "Грешка при създаване на акаунт";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email адресът вече се използва";
        break;
      case "auth/invalid-email":
        errorMessage = "Невалиден email адрес";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Създаването на акаунти е деактивирано";
        break;
      case "auth/weak-password":
        errorMessage = "Паролата е прекалено слаба";
        break;
      default:
        errorMessage = "Възникна грешка при създаване на акаунт";
    }

    return { success: false, error: errorMessage };
  }
};

// Проследяване на състоянието на автентификацията
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
