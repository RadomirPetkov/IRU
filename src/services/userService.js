// src/services/userService.js - Production готова версия с функция за премахване на завършването и нормализация на имейли
import {
  getUserProfile,
  createUserProfile,
  updateLastLogin,
  grantCourseAccess,
  revokeCourseAccess,
  enrollInCourse,
  getCourseProgress as getFirestoreCourseProgress,
  recordVideoWatch,
  markVideoAsCompleted,
  markVideoAsUncompleted,
  getCompletedVideos,
  startUserSession,
  endUserSession,
  getActivityStats,
  getAllUsers,
} from "../firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "../firebaseConfig";
import { createUser } from "../firebaseAuth";

const functions = getFunctions(app, "europe-west3");

// Добавяме Firebase Auth функции

// 🆕 Helper функция за нормализация на имейли
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return email;
  return email.trim().toLowerCase();
};

// Роли и техните права
export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  GUEST: "guest",
};

export const ROLE_DEFINITIONS = {
  [ROLES.ADMIN]: {
    name: "Администратор",
    color: "bg-red-100 text-red-800",
    permissions: [
      "view_all_courses",
      "manage_users",
      "manage_content",
      "view_analytics",
    ],
    defaultCourses: ["basic", "intermediate", "advanced", "expert"],
  },
  [ROLES.TEACHER]: {
    name: "Преподавател",
    color: "bg-green-100 text-green-800",
    permissions: ["view_courses", "manage_content", "view_student_progress"],
    defaultCourses: ["basic", "intermediate", "advanced"],
  },
  [ROLES.STUDENT]: {
    name: "Студент",
    color: "bg-blue-100 text-blue-800",
    permissions: ["view_assigned_courses", "track_progress"],
    defaultCourses: ["basic"],
  },
  [ROLES.GUEST]: {
    name: "Гост",
    color: "bg-gray-100 text-gray-800",
    permissions: ["view_public_content"],
    defaultCourses: [],
  },
};

// ============= ОСНОВНИ ФУНКЦИИ =============

/**
 * Инициализация на потребител при първо влизане
 */
export const initializeUser = async (userEmail, initialData = {}) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, error: "Невалиден email" };
    }

    // Проверяваме дали потребителят съществува
    const existingProfile = await getUserProfile(normalizedEmail);

    if (!existingProfile.success) {
      // Създаваме нов профил ако не съществува
      const defaultData = {
        displayName:
          initialData.displayName || getDisplayNameFromEmail(normalizedEmail),
        role: initialData.role || ROLES.STUDENT,
        courses:
          initialData.courses || ROLE_DEFINITIONS[ROLES.STUDENT].defaultCourses,
        ...initialData,
      };

      await createUserProfile(normalizedEmail, defaultData);
    }

    // Започваме нова сесия
    await startUserSession(normalizedEmail);

    // Обновяваме последен вход
    await updateLastLogin(normalizedEmail);

    return { success: true };
  } catch (error) {
    console.error("Error initializing user:", error);
    return { success: false, error: "Грешка при инициализация на потребител" };
  }
};

/**
 * Получаване на пълна информация за потребител
 */
export const getFullUserProfile = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, error: "Невалиден email" };
    }

    const profile = await getUserProfile(normalizedEmail);
    if (!profile.success) {
      return profile;
    }

    const roleInfo =
      ROLE_DEFINITIONS[profile.data.role] || ROLE_DEFINITIONS[ROLES.GUEST];

    return {
      success: true,
      data: {
        ...profile.data,
        roleInfo,
      },
    };
  } catch (error) {
    console.error("Error getting full user profile:", error);
    return { success: false, error: "Грешка при получаване на профил" };
  }
};

/**
 * Проверка дали потребителят има достъп до курс
 */
export const hasAccessToCourse = (userProfile, courseId) => {
  if (
    !userProfile ||
    !userProfile.permissions ||
    !Array.isArray(userProfile.permissions.courses)
  ) {
    return false;
  }
  return userProfile.permissions.courses.includes(courseId);
};

/**
 * Проверка на права
 */
export const hasPermission = (userProfile, permission) => {
  if (!userProfile || !userProfile.role) {
    return false;
  }

  const roleInfo = ROLE_DEFINITIONS[userProfile.role];
  return (
    roleInfo &&
    Array.isArray(roleInfo.permissions) &&
    roleInfo.permissions.includes(permission)
  );
};

// ============= АДМИНИСТРАТИВНИ ФУНКЦИИ =============

/**
 * Създаване на нов потребител от администратор
 */
export const adminCreateUser = async (adminEmail, newUserData) => {
  try {
    const normalizedAdminEmail = normalizeEmail(adminEmail);

    if (!normalizedAdminEmail || !newUserData) {
      return { success: false, error: "Невалидни данни" };
    }

    const { email, password, displayName, role, courses } = newUserData;
    const normalizedUserEmail = normalizeEmail(email);

    // Валидации
    if (!normalizedUserEmail || !password) {
      return { success: false, error: "Email и парола са задължителни" };
    }

    if (!normalizedUserEmail.includes("@") || password.length < 6) {
      return {
        success: false,
        error: "Невалиден email або парола прекалено къса",
      };
    }

    if (!isValidRole(role)) {
      return { success: false, error: "Невалидна роля" };
    }

    // 🆕 Извикваме Cloud Function
    const createUserFunction = httpsCallable(functions, "createUser");
    const result = await createUserFunction({
      email: normalizedUserEmail,
      password: password,
      displayName: displayName || getDisplayNameFromEmail(normalizedUserEmail),
      role: role || ROLES.STUDENT,
      courses:
        courses || ROLE_DEFINITIONS[role || ROLES.STUDENT].defaultCourses,
    });

    if (result.data.success) {
      return {
        success: true,
        message: "Потребителят е създаден успешно",
      };
    } else {
      return { success: false, error: result.data.error || "Грешка" };
    }
  } catch (error) {
    console.error("Error creating user by admin:", error);
    return {
      success: false,
      error: error.message || "Грешка при създаване на потребител",
    };
  }
};
/**
 * Добавяне на достъп до курс (само за админи)
 */
export const addCourseAccessToUser = async (
  adminEmail,
  targetUserEmail,
  courseId
) => {
  try {
    const normalizedAdminEmail = normalizeEmail(adminEmail);
    const normalizedTargetEmail = normalizeEmail(targetUserEmail);

    if (!normalizedAdminEmail || !normalizedTargetEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    // Проверяваме дали admin има права
    const adminProfile = await getUserProfile(normalizedAdminEmail);
    if (
      !adminProfile.success ||
      !hasPermission(adminProfile.data, "manage_users")
    ) {
      return { success: false, error: "Няма права за тази операция" };
    }

    const result = await grantCourseAccess(normalizedTargetEmail, courseId);
    return result;
  } catch (error) {
    console.error("Error adding course access:", error);
    return { success: false, error: "Грешка при добавяне на достъп" };
  }
};

/**
 * Премахване на достъп до курс (само за админи)
 */
export const removeCourseAccessFromUser = async (
  adminEmail,
  targetUserEmail,
  courseId
) => {
  try {
    const normalizedAdminEmail = normalizeEmail(adminEmail);
    const normalizedTargetEmail = normalizeEmail(targetUserEmail);

    if (!normalizedAdminEmail || !normalizedTargetEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }

    // Проверяваме дали admin има права
    const adminProfile = await getUserProfile(normalizedAdminEmail);
    if (
      !adminProfile.success ||
      !hasPermission(adminProfile.data, "manage_users")
    ) {
      return { success: false, error: "Няма права за тази операция" };
    }

    const result = await revokeCourseAccess(normalizedTargetEmail, courseId);
    return result;
  } catch (error) {
    console.error("Error removing course access:", error);
    return { success: false, error: "Грешка при премахване на достъп" };
  }
};

/**
 * Получаване на всички потребители (само за админи)
 */
export const getAdminUsersList = async (adminEmail) => {
  try {
    const normalizedAdminEmail = normalizeEmail(adminEmail);

    if (!normalizedAdminEmail) {
      return { success: false, error: "Невалиден admin email" };
    }

    // Проверяваме дали admin има права
    const adminProfile = await getUserProfile(normalizedAdminEmail);
    if (
      !adminProfile.success ||
      !hasPermission(adminProfile.data, "view_analytics")
    ) {
      return { success: false, error: "Няма права за тази операция" };
    }

    return await getAllUsers();
  } catch (error) {
    console.error("Error getting admin users list:", error);
    return { success: false, error: "Грешка при получаване на потребители" };
  }
};

/**
 * Получаване на детайлни статистики за потребител
 */
export const getUserDetailedStats = async (userEmail, requestingUserEmail) => {
  try {
    const normalizedUserEmail = normalizeEmail(userEmail);
    const normalizedRequestingEmail = normalizeEmail(requestingUserEmail);

    if (!normalizedUserEmail || !normalizedRequestingEmail) {
      return { success: false, error: "Невалидни данни" };
    }

    // Проверяваме права - или същия потребител или админ
    if (normalizedUserEmail !== normalizedRequestingEmail) {
      const adminProfile = await getUserProfile(normalizedRequestingEmail);
      if (
        !adminProfile.success ||
        !hasPermission(adminProfile.data, "view_analytics")
      ) {
        return { success: false, error: "Няма права за тази операция" };
      }
    }

    const stats = await getActivityStats(normalizedUserEmail);

    if (stats.success) {
      // Допълнителна обработка на статистиките
      const processedStats = {
        ...stats.data,
        summary: {
          totalTimeSpent: stats.data.sessions.reduce(
            (acc, session) => acc + (session.duration || 0),
            0
          ),
          averageSessionTime:
            stats.data.sessions.length > 0
              ? stats.data.sessions.reduce(
                  (acc, session) => acc + (session.duration || 0),
                  0
                ) / stats.data.sessions.length
              : 0,
          completionRate:
            stats.data.videoProgress.length > 0
              ? (stats.data.videoProgress.filter((v) => v.isCompleted).length /
                  stats.data.videoProgress.length) *
                100
              : 0,
          coursesCompleted: stats.data.courseProgress.filter(
            (c) => c.completedAt
          ).length,
          mostWatchedCourse: getMostWatchedCourse(stats.data.videoProgress),
          lastActivity: getLastActivity(
            stats.data.sessions,
            stats.data.videoProgress
          ),
        },
      };

      return { success: true, data: processedStats };
    }

    return stats;
  } catch (error) {
    console.error("Error getting detailed user stats:", error);
    return { success: false, error: "Грешка при получаване на статистики" };
  }
};

// ============= КУРСОВЕ И ВИДЕА =============

/**
 * Записване в курс
 */
export const enrollUserInCourse = async (userEmail, courseId, totalVideos) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !totalVideos) {
      return { success: false, error: "Невалидни данни" };
    }

    // Проверяваме дали потребителят има достъп
    const profile = await getUserProfile(normalizedEmail);
    if (!profile.success) {
      return { success: false, error: "Потребителят не съществува" };
    }

    if (!hasAccessToCourse(profile.data, courseId)) {
      return { success: false, error: "Няма достъп до този курс" };
    }

    // Записваме в курса
    const result = await enrollInCourse(normalizedEmail, courseId, totalVideos);
    return result;
  } catch (error) {
    console.error("Error enrolling user in course:", error);
    return { success: false, error: "Грешка при записване в курс" };
  }
};

/**
 * Получаване на прогрес по конкретен курс
 */
export const getCourseProgress = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }
    return await getFirestoreCourseProgress(normalizedEmail, courseId);
  } catch (error) {
    console.error("Error getting course progress:", error);
    return {
      success: false,
      error: "Грешка при получаване на прогрес по курс",
    };
  }
};

/**
 * Стартиране на видео
 */
export const startVideo = async (userEmail, courseId, videoId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    const result = await recordVideoWatch(normalizedEmail, courseId, videoId);
    return result;
  } catch (error) {
    console.error("Error starting video:", error);
    return { success: false, error: "Грешка при стартиране на видео" };
  }
};

/**
 * Завършване на видео
 */
export const completeVideo = async (userEmail, courseId, videoId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    const result = await markVideoAsCompleted(
      normalizedEmail,
      courseId,
      videoId
    );
    return result;
  } catch (error) {
    console.error("Error completing video:", error);
    return { success: false, error: "Грешка при завършване на видео" };
  }
};

/**
 * Премахване на завършването на видео
 */
export const uncompleteVideo = async (userEmail, courseId, videoId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId || !videoId) {
      return { success: false, error: "Невалидни данни" };
    }

    console.log(
      `🔄 Премахване на завършването на видео: ${videoId} за потребител ${normalizedEmail}`
    );

    const result = await markVideoAsUncompleted(
      normalizedEmail,
      courseId,
      videoId
    );

    if (result.success) {
      console.log(`✅ Видео ${videoId} успешно премахнато от завършени`);
    } else {
      console.error(
        `❌ Грешка при премахване на завършването: ${result.error}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error uncompleting video:", error);
    return {
      success: false,
      error: "Грешка при премахване на завършването на видео",
    };
  }
};

/**
 * Получаване на завършени видеа за курс
 */
export const getUserCompletedVideos = async (userEmail, courseId) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail || !courseId) {
      return { success: false, error: "Невалидни данни" };
    }
    return await getCompletedVideos(normalizedEmail, courseId);
  } catch (error) {
    console.error("Error getting completed videos:", error);
    return {
      success: false,
      error: "Грешка при получаване на завършени видеа",
    };
  }
};

// ============= СЕСИИ =============

/**
 * Приключване на потребителска сесия
 */
export const logoutUser = async (userEmail) => {
  try {
    const normalizedEmail = normalizeEmail(userEmail);

    if (!normalizedEmail) {
      return { success: false, error: "Невалиден email" };
    }
    await endUserSession(normalizedEmail);
    return { success: true };
  } catch (error) {
    console.error("Error logging out user:", error);
    return { success: false, error: "Грешка при излизане" };
  }
};

// ============= ПОМОЩНИ ФУНКЦИИ =============

/**
 * Извличане на display name от email
 */
const getDisplayNameFromEmail = (email) => {
  if (!email || !email.includes("@")) return "Потребител";
  return (
    email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
  );
};

/**
 * Намиране на най-гледания курс
 */
const getMostWatchedCourse = (videoProgress) => {
  if (!videoProgress || !videoProgress.length) return null;

  const courseCounts = videoProgress.reduce((acc, video) => {
    acc[video.courseId] = (acc[video.courseId] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(courseCounts).reduce((a, b) =>
    courseCounts[a] > courseCounts[b] ? a : b
  );
};

/**
 * Получаване на последна активност
 */
const getLastActivity = (sessions, videoProgress) => {
  const allActivities = [
    ...(sessions || []).map((s) => ({ type: "session", date: s.loginAt })),
    ...(videoProgress || []).map((v) => ({ type: "video", date: v.watchedAt })),
  ];

  if (!allActivities.length) return null;

  return allActivities.reduce((latest, current) =>
    current.date > latest.date ? current : latest
  );
};

/**
 * Валидация на роля
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Получаване на информация за роля
 */
export const getRoleInfo = (role) => {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS[ROLES.GUEST];
};

// Експортиране на всички функции
export default {
  // Основни функции
  initializeUser,
  getFullUserProfile,
  hasAccessToCourse,
  hasPermission,
  logoutUser,

  // Административни
  adminCreateUser,
  addCourseAccessToUser,
  removeCourseAccessFromUser,
  getAdminUsersList,
  getUserDetailedStats,

  // Курсове
  enrollUserInCourse,
  getCourseProgress,

  // Видеа
  startVideo,
  completeVideo,
  uncompleteVideo,
  getUserCompletedVideos,

  // Помощни
  getRoleInfo,
  isValidRole,

  // Константи
  ROLES,
  ROLE_DEFINITIONS,
};
