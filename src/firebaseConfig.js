import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Вашата Firebase конфигурация
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
const analytics = getAnalytics(app);

export default app;
