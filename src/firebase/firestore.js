// src/firebase/firestore.js - Напълно поправен файл
import { initializeApp } from "firebase/app";
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
  orderBy,
  limit
} from "firebase/firestore";

// Firebase конфигурация
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
export const db = getFirestore(app);

// ============= ПОТРЕБИТЕЛСКИ ПРОФИЛИ =============

// Създаване на нов потребителски профил
export const createUserProfile = async (userEmail, userData = {}) => {
  try {
    const userRef = doc(db, 'users', userEmail);
    
    const defaultData = {
      email: userEmail,
      displayName: userData.displayName || 'Нов потребител',
      role: userData.role || 'student',
      joinDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true
    };

    await setDoc(doc(userRef, 'profile', 'info'), defaultData);
    
    // Създаване на начални права
    await setDoc(doc(userRef, 'permissions', 'access'), {
      courses: userData.courses || ['basic'],
      customPermissions: userData.customPermissions || []
    });

    console.log('✅ Потребителски профил създаден:', userEmail);
    return { success: true, message: 'Профилът е създаден успешно' };
  } catch (error) {
    console.error('❌ Грешка при създаване на профил:', error);
    return { success: false, error: error.message };
  }
};

// Получаване на потребителски профил
export const getUserProfile = async (userEmail) => {
  try {
    const profileRef = doc(db, 'users', userEmail, 'profile', 'info');
    const permissionsRef = doc(db, 'users', userEmail, 'permissions', 'access');
    
    const [profileSnap, permissionsSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(permissionsRef)
    ]);

    if (!profileSnap.exists()) {
      return { success: false, error: 'Потребителят не съществува' };
    }

    const profile = profileSnap.data();
    const permissions = permissionsSnap.exists() ? permissionsSnap.data() : { courses: [], customPermissions: [] };

    return {
      success: true,
      data: {
        ...profile,
        permissions
      }
    };
  } catch (error) {
    console.error('❌ Грешка при получаване на профил:', error);
    return { success: false, error: error.message };
  }
};

// Обновяване на последен вход
export const updateLastLogin = async (userEmail) => {
  try {
    const profileRef = doc(db, 'users', userEmail, 'profile', 'info');
    await updateDoc(profileRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Грешка при обновяване на последен вход:', error);
  }
};

// ============= УПРАВЛЕНИЕ НА ПРАВА =============

// Обновяване на курсови права
export const updateUserCourseAccess = async (userEmail, courses) => {
  try {
    const permissionsRef = doc(db, 'users', userEmail, 'permissions', 'access');
    await updateDoc(permissionsRef, {
      courses: courses
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при обновяване на права:', error);
    return { success: false, error: error.message };
  }
};

// Добавяне на достъп до курс
export const grantCourseAccess = async (userEmail, courseId) => {
  try {
    const permissionsRef = doc(db, 'users', userEmail, 'permissions', 'access');
    await updateDoc(permissionsRef, {
      courses: arrayUnion(courseId)
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при добавяне на достъп:', error);
    return { success: false, error: error.message };
  }
};

// Премахване на достъп до курс
export const revokeCourseAccess = async (userEmail, courseId) => {
  try {
    const permissionsRef = doc(db, 'users', userEmail, 'permissions', 'access');
    await updateDoc(permissionsRef, {
      courses: arrayRemove(courseId)
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при премахване на достъп:', error);
    return { success: false, error: error.message };
  }
};

// ============= ПРОСЛЕДЯВАНЕ НА ПРОГРЕС =============

// Записване на започване на курс
export const enrollInCourse = async (userEmail, courseId, totalVideos) => {
  try {
    const courseProgressRef = doc(db, 'users', userEmail, 'progress', `course_${courseId}`);
    
    await setDoc(courseProgressRef, {
      courseId,
      enrolledAt: serverTimestamp(),
      completedAt: null,
      completedVideos: [],
      totalVideos,
      progressPercentage: 0,
      lastAccessedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при записване на курс:', error);
    return { success: false, error: error.message };
  }
};

// Получаване на прогрес по курс
export const getCourseProgress = async (userEmail, courseId) => {
  try {
    const courseProgressRef = doc(db, 'users', userEmail, 'progress', `course_${courseId}`);
    const progressSnap = await getDoc(courseProgressRef);
    
    if (progressSnap.exists()) {
      return { success: true, data: progressSnap.data() };
    } else {
      return { success: false, error: 'Не е намерен прогрес за този курс' };
    }
  } catch (error) {
    console.error('❌ Грешка при получаване на прогрес:', error);
    return { success: false, error: error.message };
  }
};

// ============= ПРОСЛЕДЯВАНЕ НА ВИДЕА =============

// Записване на гледане на видео
export const recordVideoWatch = async (userEmail, courseId, videoId) => {
  try {
    const videoProgressRef = doc(db, 'users', userEmail, 'progress', `video_${videoId}`);
    const videoProgressSnap = await getDoc(videoProgressRef);

    if (videoProgressSnap.exists()) {
      // Обновяване на съществуващ запис
      await updateDoc(videoProgressRef, {
        watchedAt: serverTimestamp(),
        watchCount: increment(1)
      });
    } else {
      // Създаване на нов запис
      await setDoc(videoProgressRef, {
        courseId,
        videoId,
        watchedAt: serverTimestamp(),
        completedAt: null,
        watchCount: 1,
        totalWatchTime: 0,
        isCompleted: false
      });
    }

    // Обновяване на последен достъп до курса
    const courseProgressRef = doc(db, 'users', userEmail, 'progress', `course_${courseId}`);
    await updateDoc(courseProgressRef, {
      lastAccessedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при записване на гледане:', error);
    return { success: false, error: error.message };
  }
};

// Маркиране на видео като завършено
export const markVideoAsCompleted = async (userEmail, courseId, videoId) => {
  try {
    // Обновяване на видео прогреса
    const videoProgressRef = doc(db, 'users', userEmail, 'progress', `video_${videoId}`);
    await updateDoc(videoProgressRef, {
      completedAt: serverTimestamp(),
      isCompleted: true
    });

    // Обновяване на курсовия прогрес
    const courseProgressRef = doc(db, 'users', userEmail, 'progress', `course_${courseId}`);
    const courseProgressSnap = await getDoc(courseProgressRef);

    if (courseProgressSnap.exists()) {
      const courseData = courseProgressSnap.data();
      const newCompletedVideos = [...(courseData.completedVideos || []), videoId];
      const progressPercentage = (newCompletedVideos.length / courseData.totalVideos) * 100;
      
      const updateData = {
        completedVideos: arrayUnion(videoId),
        progressPercentage,
        lastAccessedAt: serverTimestamp()
      };

      // Ако курсът е завършен
      if (progressPercentage === 100) {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(courseProgressRef, updateData);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при маркиране като завършено:', error);
    return { success: false, error: error.message };
  }
};

// Получаване на всички завършени видеа за курс
export const getCompletedVideos = async (userEmail, courseId) => {
  try {
    const courseProgressRef = doc(db, 'users', userEmail, 'progress', `course_${courseId}`);
    const progressSnap = await getDoc(courseProgressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      return { success: true, completedVideos: data.completedVideos || [] };
    } else {
      return { success: true, completedVideos: [] };
    }
  } catch (error) {
    console.error('❌ Грешка при получаване на завършени видеа:', error);
    return { success: false, error: error.message };
  }
};

// ============= СЕСИИ И АКТИВНОСТ =============

// Започване на нова сесия
export const startUserSession = async (userEmail) => {
  try {
    const sessionId = Date.now().toString();
    const sessionRef = doc(db, 'users', userEmail, 'activity', sessionId);
    
    await setDoc(sessionRef, {
      loginAt: serverTimestamp(),
      logoutAt: null,
      duration: 0,
      videosWatched: [],
      coursesAccessed: []
    });

    // Запазваме session ID в localStorage за по-късно използване
    localStorage.setItem('currentSessionId', sessionId);
    
    return { success: true, sessionId };
  } catch (error) {
    console.error('❌ Грешка при започване на сесия:', error);
    return { success: false, error: error.message };
  }
};

// Завършване на сесия
export const endUserSession = async (userEmail) => {
  try {
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) return { success: false, error: 'Няма активна сесия' };

    const sessionRef = doc(db, 'users', userEmail, 'activity', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const loginTime = sessionData.loginAt.toDate();
      const duration = Math.round((Date.now() - loginTime.getTime()) / 60000); // в минути

      await updateDoc(sessionRef, {
        logoutAt: serverTimestamp(),
        duration
      });

      localStorage.removeItem('currentSessionId');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при завършване на сесия:', error);
    return { success: false, error: error.message };
  }
};

// ============= АДМИНИСТРАТИВНИ ФУНКЦИИ =============

// Получаване на всички потребители (за админи)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    for (const userDoc of snapshot.docs) {
      const userEmail = userDoc.id;
      const profile = await getUserProfile(userEmail);
      if (profile.success) {
        users.push({
          email: userEmail,
          ...profile.data
        });
      }
    }

    return { success: true, data: users };
  } catch (error) {
    console.error('❌ Грешка при получаване на потребители:', error);
    return { success: false, error: error.message };
  }
};

// Получаване на статистики за активност
export const getActivityStats = async (userEmail, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Получаване на сесии
    const sessionsRef = collection(db, 'users', userEmail, 'activity');
    const sessionsQuery = query(
      sessionsRef,
      orderBy('loginAt', 'desc'),
      limit(100)
    );
    
    const sessionsSnap = await getDocs(sessionsQuery);
    const sessions = sessionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Получаване на прогрес по курсове
    const progressRef = collection(db, 'users', userEmail, 'progress');
    const progressSnap = await getDocs(progressRef);
    
    const courseProgress = [];
    const videoProgress = [];
    
    progressSnap.docs.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      if (doc.id.startsWith('course_')) {
        courseProgress.push(data);
      } else if (doc.id.startsWith('video_')) {
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
        totalCoursesStarted: courseProgress.length
      }
    };
  } catch (error) {
    console.error('❌ Грешка при получаване на статистики:', error);
    return { success: false, error: error.message };
  }
};

export default db;