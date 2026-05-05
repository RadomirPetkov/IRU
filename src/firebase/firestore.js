// src/firebase/firestore.js - Production готова версия с функция за премахване на завършването и нормализация на имейли
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";

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
if (!process.env.REACT_APP_FIREBASE_PROJECT_ID) {
  throw new Error("REACT_APP_FIREBASE_PROJECT_ID is required");
}

// Инициализиране на Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Експортиране на app за използване в други модули
export { app };

// 🆕 Helper функция за нормализация на имейли
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return email;
  return email.trim().toLowerCase();
};

// ============= ПОТРЕБИТЕЛСКИ ПРОФИЛИ =============

// Създаване на нов потребителски профил
export const createUserProfile = async (userEmail, userData = {}) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, error: "Невалиден email" };
    }

    const userRef = doc(db, "users", normalizedEmail);

    const defaultData = {
      email: normalizedEmail,
      displayName: userData.displayName || "Нов потребител",
      role: userData.role || "student",
      joinDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
    };

    // 🆕 ВАЖНО: Създайте parent document първо
    await setDoc(userRef, {
      email: normalizedEmail,
      createdAt: serverTimestamp(),
      isActive: true,
    });

    // След това създайте подколекциите
    await setDoc(doc(userRef, "profile", "info"), defaultData);

    await setDoc(doc(userRef, "permissions", "access"), {
      courses: userData.courses || ["basic"],
      customPermissions: userData.customPermissions || [],
    });

    return { success: true, message: "Профилът е създаден успешно" };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: "Грешка при създаване на профил" };
  }
};

// Получаване на потребителски профил
export const getUserProfile = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, error: "Невалиден email" };
    }

    const profileRef = doc(db, "users", normalizedEmail, "profile", "info");
    const permissionsRef = doc(
      db,
      "users",
      normalizedEmail,
      "permissions",
      "access"
    );

    const [profileSnap, permissionsSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(permissionsRef),
    ]);

    if (!profileSnap.exists()) {
      return { success: false, error: "Потребителят не съществува" };
    }

    const profile = profileSnap.data();
    const permissions = permissionsSnap.exists()
      ? permissionsSnap.data()
      : { courses: [], customPermissions: [] };

    return {
      success: true,
      data: {
        ...profile,
        permissions,
      },
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: "Грешка при получаване на профил" };
  }
};

// Обновяване на последен вход
export const updateLastLogin = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return;
    }

    const profileRef = doc(db, "users", normalizedEmail, "profile", "info");
    await updateDoc(profileRef, {
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating last login:", error);
  }
};

// ============= УПРАВЛЕНИЕ НА ПРАВА =============

// Обновяване на курсови права
export const updateUserCourseAccess = async (userEmail, courses) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !Array.isArray(courses)) {
      return { success: false, error: "Невалидни данни" };
    }

    const permissionsRef = doc(
      db,
      "users",
      normalizedEmail,
      "permissions",
      "access"
    );
    await updateDoc(permissionsRef, {
      courses: courses,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user access:", error);
    return { success: false, error: "Грешка при обновяване на права" };
  }
};

// Добавяне на достъп до курс
export const grantCourseAccess = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    const permissionsRef = doc(
      db,
      "users",
      normalizedEmail,
      "permissions",
      "access"
    );
    await updateDoc(permissionsRef, {
      courses: arrayUnion(courseId),
    });
    return { success: true };
  } catch (error) {
    console.error("Error granting course access:", error);
    return { success: false, error: "Грешка при добавяне на достъп" };
  }
};

// Премахване на достъп до курс
export const revokeCourseAccess = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    const permissionsRef = doc(
      db,
      "users",
      normalizedEmail,
      "permissions",
      "access"
    );
    await updateDoc(permissionsRef, {
      courses: arrayRemove(courseId),
    });
    return { success: true };
  } catch (error) {
    console.error("Error revoking course access:", error);
    return { success: false, error: "Грешка при премахване на достъп" };
  }
};

// ============= ПРОСЛЕДЯВАНЕ НА ПРОГРЕС =============

// Записване на започване на курс
export const enrollInCourse = async (userEmail, courseId, totalVideos) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !totalVideos) {
      return { success: false, error: "Невалидни данни" };
    }

    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );

    await setDoc(courseProgressRef, {
      courseId,
      enrolledAt: serverTimestamp(),
      completedAt: null,
      completedVideos: [],
      totalVideos,
      progressPercentage: 0,
      lastAccessedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: "Грешка при записване в курс" };
  }
};

// Получаване на прогрес по курс
export const getCourseProgress = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );
    const progressSnap = await getDoc(courseProgressRef);

    if (progressSnap.exists()) {
      return { success: true, data: progressSnap.data() };
    } else {
      return { success: false, error: "Не е намерен прогрес за този курс" };
    }
  } catch (error) {
    console.error("Error getting course progress:", error);
    return { success: false, error: "Грешка при получаване на прогрес" };
  }
};

// ============= ПРОСЛЕДЯВАНЕ НА ВИДЕА =============

// Записване на гледане на видео
export const recordVideoWatch = async (userEmail, courseId, videoId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    const videoProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `video_${videoId}`
    );
    const videoProgressSnap = await getDoc(videoProgressRef);

    if (videoProgressSnap.exists()) {
      // Обновяване на съществуващ запис
      await updateDoc(videoProgressRef, {
        watchedAt: serverTimestamp(),
        watchCount: increment(1),
      });
    } else {
      // Създаване на нов запис с ВСИЧКИ полета
      await setDoc(videoProgressRef, {
        courseId,
        videoId,
        watchedAt: serverTimestamp(),
        completedAt: null,
        watchCount: 1,
        totalWatchTime: 0,
        isCompleted: false,
      });
    }

    // Обновяване на последен достъп до курса
    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );
    await updateDoc(courseProgressRef, {
      lastAccessedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording video watch:", error);
    return { success: false, error: "Грешка при записване на гледане" };
  }
};

// Маркиране на видео/съдържание като завършено
export const markVideoAsCompleted = async (userEmail, courseId, videoId, contentData = {}) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    // Извличаме допълнителните данни
    const { contentType = 'video', title = '' } = contentData;

    // Първо проверяваме дали документът съществува
    const videoProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `video_${videoId}`
    );
    const videoProgressSnap = await getDoc(videoProgressRef);

    if (!videoProgressSnap.exists()) {
      // АКО НЕ СЪЩЕСТВУВА, СЪЗДАВАМЕ ГО
      await setDoc(videoProgressRef, {
        courseId,
        videoId,
        contentType,
        title,
        watchedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        isCompleted: true,
        watchCount: 1,
        totalWatchTime: 0,
      });
    } else {
      // АКО СЪЩЕСТВУВА, ОБНОВЯВАМЕ ГО
      const updateData = {
        completedAt: serverTimestamp(),
        isCompleted: true,
      };
      
      // Добавяме contentType и title ако ги нямаме
      const existingData = videoProgressSnap.data();
      if (!existingData.contentType) {
        updateData.contentType = contentType;
      }
      if (!existingData.title && title) {
        updateData.title = title;
      }
      
      await updateDoc(videoProgressRef, updateData);
    }

    // Обновяване на курсовия прогрес
    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );
    const courseProgressSnap = await getDoc(courseProgressRef);

    if (courseProgressSnap.exists()) {
      const courseData = courseProgressSnap.data();
      const currentCompletedVideos = courseData.completedVideos || [];

      // Проверяваме дали видеото вече не е добавено
      if (!currentCompletedVideos.includes(videoId)) {
        const newCompletedVideos = [...currentCompletedVideos, videoId];
        const progressPercentage =
          (newCompletedVideos.length / courseData.totalVideos) * 100;

        const updateData = {
          completedVideos: newCompletedVideos,
          progressPercentage,
          lastAccessedAt: serverTimestamp(),
        };

        // Ако курсът е завършен
        if (progressPercentage === 100) {
          updateData.completedAt = serverTimestamp();
        }

        await updateDoc(courseProgressRef, updateData);
      } else {
      }
    } else {
      // АКО КУРСОВИЯТ ПРОГРЕС НЕ СЪЩЕСТВУВА, СЪЗДАВАМЕ ГО
      await setDoc(courseProgressRef, {
        courseId,
        enrolledAt: serverTimestamp(),
        completedAt: null,
        completedVideos: [videoId],
        totalVideos: 1,
        progressPercentage: 100,
        lastAccessedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking video as completed:", error);
    return { success: false, error: "Грешка при маркиране като завършено" };
  }
};

// Премахване на завършването на видео
export const markVideoAsUncompleted = async (userEmail, courseId, videoId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    // Обновяване на видео прогреса
    const videoProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `video_${videoId}`
    );
    await updateDoc(videoProgressRef, {
      completedAt: null,
      isCompleted: false,
      uncompletedAt: serverTimestamp(),
    });

    // Обновяване на курсовия прогрес
    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );
    const courseProgressSnap = await getDoc(courseProgressRef);

    if (courseProgressSnap.exists()) {
      const courseData = courseProgressSnap.data();
      const currentCompletedVideos = courseData.completedVideos || [];

      // Премахваме видеото от завършените
      const newCompletedVideos = currentCompletedVideos.filter(
        (id) => id !== videoId
      );
      const progressPercentage =
        courseData.totalVideos > 0
          ? (newCompletedVideos.length / courseData.totalVideos) * 100
          : 0;

      const updateData = {
        completedVideos: newCompletedVideos,
        progressPercentage,
        lastAccessedAt: serverTimestamp(),
        completedAt: null,
      };

      await updateDoc(courseProgressRef, updateData);
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking video as uncompleted:", error);
    return {
      success: false,
      error: "Грешка при премахване на завършването на видео",
    };
  }
};

// Получаване на всички завършени видеа за курс
export const getCompletedVideos = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    const courseProgressRef = doc(
      db,
      "users",
      normalizedEmail,
      "progress",
      `course_${courseId}`
    );
    const progressSnap = await getDoc(courseProgressRef);

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      return { success: true, completedVideos: data.completedVideos || [] };
    } else {
      return { success: true, completedVideos: [] };
    }
  } catch (error) {
    console.error("Error getting completed videos:", error);
    return {
      success: false,
      error: "Грешка при получаване на завършени видеа",
    };
  }
};

// ============= СЕСИИ И АКТИВНОСТ =============

// Започване на нова сесия
export const startUserSession = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail) {
      return { success: false, error: "Невалиден email" };
    }

    const sessionId = Date.now().toString();
    const sessionRef = doc(db, "users", normalizedEmail, "activity", sessionId);

    await setDoc(sessionRef, {
      loginAt: serverTimestamp(),
      logoutAt: null,
      duration: 0,
      videosWatched: [],
      coursesAccessed: [],
    });

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("currentSessionId", sessionId);
    }

    return { success: true, sessionId };
  } catch (error) {
    console.error("Error starting user session:", error);
    return { success: false, error: "Грешка при започване на сесия" };
  }
};

// Завършване на сесия
export const endUserSession = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail) {
      return { success: false, error: "Невалиден email" };
    }

    const sessionId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("currentSessionId")
        : null;
    if (!sessionId) return { success: false, error: "Няма активна сесия" };

    const sessionRef = doc(db, "users", normalizedEmail, "activity", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const loginTime = sessionData.loginAt.toDate();
      const duration = Math.round((Date.now() - loginTime.getTime()) / 60000);

      await updateDoc(sessionRef, {
        logoutAt: serverTimestamp(),
        duration,
      });

      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("currentSessionId");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error ending user session:", error);
    return { success: false, error: "Грешка при завършване на сесия" };
  }
};

// ============= АДМИНИСТРАТИВНИ ФУНКЦИИ =============

// Получаване на всички потребители (за админи)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users = [];
    for (const userDoc of snapshot.docs) {
      const userEmail = userDoc.id;

      // Вземи данните от parent document
      const parentData = userDoc.data();

      // Вземи профила
      const profile = await getUserProfile(userEmail);

      if (profile.success) {
        users.push({
          id: userEmail,
          email: userEmail,
          ...parentData,
          ...profile.data,
        });
      }
    }

    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { success: false, error: "Грешка при получаване на потребители" };
  }
};

// Получаване на статистики за активност
export const getActivityStats = async (userEmail, days = 30) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail) {
      return { success: false, error: "Невалиден email" };
    }

    // Получаване на сесии
    const sessionsRef = collection(db, "users", normalizedEmail, "activity");
    const sessionsQuery = query(
      sessionsRef,
      orderBy("loginAt", "desc"),
      limit(100)
    );

    const sessionsSnap = await getDocs(sessionsQuery);
    const sessions = sessionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Получаване на прогрес по курсове
    const progressRef = collection(db, "users", normalizedEmail, "progress");
    const progressSnap = await getDocs(progressRef);

    const courseProgress = [];
    const videoProgress = [];

    progressSnap.docs.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (doc.id.startsWith("course_")) {
        courseProgress.push(data);
      } else if (doc.id.startsWith("video_")) {
        videoProgress.push(data);
      }
    });

    return {
      success: true,
      data: {
        sessions,
        courseProgress,
        videoProgress,
        totalSessions: sessions.length,
        totalVideosWatched: videoProgress.length,
        totalCoursesStarted: courseProgress.length,
      },
    };
  } catch (error) {
    console.error("Error getting activity stats:", error);
    return { success: false, error: "Грешка при получаване на статистики" };
  }
};

// Обновяване на профилна информация от администратор
export const updateUserProfileInfo = async (userEmail, { displayName, joinDate, lastLogin }) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);
    const profileRef = doc(db, "users", normalizedEmail, "profile", "info");

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (joinDate !== undefined) {
      updates.joinDate = joinDate instanceof Date
        ? Timestamp.fromDate(joinDate)
        : joinDate;
    }
    if (lastLogin !== undefined) {
      updates.lastLogin = lastLogin instanceof Date
        ? Timestamp.fromDate(lastLogin)
        : lastLogin;
    }

    await updateDoc(profileRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile info:", error);
    return { success: false, error: "Грешка при обновяване на профила" };
  }
};

// Добавяне на ръчна активност от администратор
export const addManualActivity = async (userEmail, { date, durationMinutes, description, coursesAccessed }) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);
    const sessionId = `manual_${Date.now()}`;
    const sessionRef = doc(db, "users", normalizedEmail, "activity", sessionId);

    const loginAt = date instanceof Date ? Timestamp.fromDate(date) : Timestamp.fromDate(new Date(date));
    const durationSeconds = (durationMinutes || 0) * 60;
    const logoutDate = new Date(loginAt.toDate().getTime() + durationSeconds * 1000);

    await setDoc(sessionRef, {
      loginAt,
      logoutAt: Timestamp.fromDate(logoutDate),
      duration: durationSeconds,
      videosWatched: [],
      coursesAccessed: coursesAccessed || [],
      completedContent: [],
      description: description || "",
      isManual: true,
    });

    return { success: true, sessionId };
  } catch (error) {
    console.error("Error adding manual activity:", error);
    return { success: false, error: "Грешка при добавяне на активност" };
  }
};

export default db;