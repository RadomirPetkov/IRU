// src/services/userService.js - Production готова версия (БЕЗ ДЕМО ДАННИ)
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
    getCompletedVideos,
    startUserSession,
    endUserSession,
    getActivityStats,
    getAllUsers
  } from '../firebase/firestore';
  
  // Добавяме Firebase Auth функции
  import { createUser } from '../firebaseAuth';
  
  // Роли и техните права
  export const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    GUEST: 'guest'
  };
  
  export const ROLE_DEFINITIONS = {
    [ROLES.ADMIN]: {
      name: 'Администратор',
      color: 'bg-red-100 text-red-800',
      permissions: ['view_all_courses', 'manage_users', 'manage_content', 'view_analytics'],
      defaultCourses: ['basic', 'intermediate', 'advanced', 'expert']
    },
    [ROLES.TEACHER]: {
      name: 'Преподавател',
      color: 'bg-green-100 text-green-800',
      permissions: ['view_courses', 'manage_content', 'view_student_progress'],
      defaultCourses: ['basic', 'intermediate', 'advanced']
    },
    [ROLES.STUDENT]: {
      name: 'Студент',
      color: 'bg-blue-100 text-blue-800',
      permissions: ['view_assigned_courses', 'track_progress'],
      defaultCourses: ['basic']
    },
    [ROLES.GUEST]: {
      name: 'Гост',
      color: 'bg-gray-100 text-gray-800',
      permissions: ['view_public_content'],
      defaultCourses: []
    }
  };

  // ============= ОСНОВНИ ФУНКЦИИ =============
  
  /**
   * Инициализация на потребител при първо влизане
   */
  export const initializeUser = async (userEmail, initialData = {}) => {
    try {
      if (!userEmail || !userEmail.includes('@')) {
        return { success: false, error: 'Невалиден email' };
      }

      // Проверяваме дали потребителят съществува
      const existingProfile = await getUserProfile(userEmail);
      
      if (!existingProfile.success) {
        // Създаваме нов профил ако не съществува
        const defaultData = {
          displayName: initialData.displayName || getDisplayNameFromEmail(userEmail),
          role: initialData.role || ROLES.STUDENT,
          courses: initialData.courses || ROLE_DEFINITIONS[ROLES.STUDENT].defaultCourses,
          ...initialData
        };
        
        await createUserProfile(userEmail, defaultData);
      }
      
      // Започваме нова сесия
      await startUserSession(userEmail);
      
      // Обновяваме последен вход
      await updateLastLogin(userEmail);
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing user:', error);
      return { success: false, error: 'Грешка при инициализация на потребител' };
    }
  };
  
  /**
   * Получаване на пълна информация за потребител
   */
  export const getFullUserProfile = async (userEmail) => {
    try {
      if (!userEmail || !userEmail.includes('@')) {
        return { success: false, error: 'Невалиден email' };
      }

      const profile = await getUserProfile(userEmail);
      if (!profile.success) {
        return profile;
      }

      const roleInfo = ROLE_DEFINITIONS[profile.data.role] || ROLE_DEFINITIONS[ROLES.GUEST];
      
      return {
        success: true,
        data: {
          ...profile.data,
          roleInfo
        }
      };
    } catch (error) {
      console.error('Error getting full user profile:', error);
      return { success: false, error: 'Грешка при получаване на профил' };
    }
  };
  
  /**
   * Проверка дали потребителят има достъп до курс
   */
  export const hasAccessToCourse = (userProfile, courseId) => {
    if (!userProfile || !userProfile.permissions || !Array.isArray(userProfile.permissions.courses)) {
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
    return roleInfo && Array.isArray(roleInfo.permissions) && roleInfo.permissions.includes(permission);
  };
  
  // ============= АДМИНИСТРАТИВНИ ФУНКЦИИ =============
  
  /**
   * Създаване на нов потребител от администратор
   */
  export const adminCreateUser = async (adminEmail, newUserData) => {
    try {
      if (!adminEmail || !newUserData) {
        return { success: false, error: 'Невалидни данни' };
      }

      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'manage_users')) {
        return { success: false, error: 'Няма права за създаване на потребители' };
      }

      const { email, password, displayName, role, courses } = newUserData;
      
      // Валидации
      if (!email || !password) {
        return { success: false, error: 'Email и парола са задължителни' };
      }
      
      if (!email.includes('@') || password.length < 6) {
        return { success: false, error: 'Невалиден email или парола прекалено къса' };
      }
      
      if (!isValidRole(role)) {
        return { success: false, error: 'Невалидна роля' };
      }
      
      // Създаваме потребителя в Authentication
      const authResult = await createUser(email, password);
      if (!authResult.success) {
        return authResult;
      }

      // Създаваме профила във Firestore
      const profileResult = await createUserProfile(email, {
        displayName: displayName || getDisplayNameFromEmail(email),
        role: role || ROLES.STUDENT,
        courses: courses || ROLE_DEFINITIONS[role || ROLES.STUDENT].defaultCourses
      });

      if (!profileResult.success) {
        return profileResult;
      }
      
      return { success: true, message: 'Потребителят е създаден успешно' };
    } catch (error) {
      console.error('Error creating user by admin:', error);
      return { success: false, error: 'Грешка при създаване на потребител' };
    }
  };
  
  /**
   * Добавяне на достъп до курс (само за админи)
   */
  export const addCourseAccessToUser = async (adminEmail, targetUserEmail, courseId) => {
    try {
      if (!adminEmail || !targetUserEmail || !courseId) {
        return { success: false, error: 'Невалидни данни' };
      }

      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'manage_users')) {
        return { success: false, error: 'Няма права за тази операция' };
      }

      const result = await grantCourseAccess(targetUserEmail, courseId);
      return result;
    } catch (error) {
      console.error('Error adding course access:', error);
      return { success: false, error: 'Грешка при добавяне на достъп' };
    }
  };
  
  /**
   * Премахване на достъп до курс (само за админи)
   */
  export const removeCourseAccessFromUser = async (adminEmail, targetUserEmail, courseId) => {
    try {
      if (!adminEmail || !targetUserEmail || !courseId) {
        return { success: false, error: 'Невалидни данни' };
      }

      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'manage_users')) {
        return { success: false, error: 'Няма права за тази операция' };
      }

      const result = await revokeCourseAccess(targetUserEmail, courseId);
      return result;
    } catch (error) {
      console.error('Error removing course access:', error);
      return { success: false, error: 'Грешка при премахване на достъп' };
    }
  };
  
  /**
   * Получаване на всички потребители (само за админи)
   */
  export const getAdminUsersList = async (adminEmail) => {
    try {
      if (!adminEmail) {
        return { success: false, error: 'Невалиден admin email' };
      }

      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'view_analytics')) {
        return { success: false, error: 'Няма права за тази операция' };
      }

      return await getAllUsers();
    } catch (error) {
      console.error('Error getting admin users list:', error);
      return { success: false, error: 'Грешка при получаване на потребители' };
    }
  };
  
  /**
   * Получаване на детайлни статистики за потребител
   */
  export const getUserDetailedStats = async (userEmail, requestingUserEmail) => {
    try {
      if (!userEmail || !requestingUserEmail) {
        return { success: false, error: 'Невалидни данни' };
      }

      // Проверяваме права - или същия потребител или админ
      if (userEmail !== requestingUserEmail) {
        const adminProfile = await getUserProfile(requestingUserEmail);
        if (!adminProfile.success || !hasPermission(adminProfile.data, 'view_analytics')) {
          return { success: false, error: 'Няма права за тази операция' };
        }
      }

      const stats = await getActivityStats(userEmail);
      
      if (stats.success) {
        // Допълнителна обработка на статистиките
        const processedStats = {
          ...stats.data,
          summary: {
            totalTimeSpent: stats.data.sessions.reduce((acc, session) => acc + (session.duration || 0), 0),
            averageSessionTime: stats.data.sessions.length > 0 
              ? stats.data.sessions.reduce((acc, session) => acc + (session.duration || 0), 0) / stats.data.sessions.length 
              : 0,
            completionRate: stats.data.videoProgress.length > 0 
              ? (stats.data.videoProgress.filter(v => v.isCompleted).length / stats.data.videoProgress.length) * 100 
              : 0,
            coursesCompleted: stats.data.courseProgress.filter(c => c.completedAt).length,
            mostWatchedCourse: getMostWatchedCourse(stats.data.videoProgress),
            lastActivity: getLastActivity(stats.data.sessions, stats.data.videoProgress)
          }
        };
        
        return { success: true, data: processedStats };
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting detailed user stats:', error);
      return { success: false, error: 'Грешка при получаване на статистики' };
    }
  };

  // ============= КУРСОВЕ И ВИДЕА =============
  
  /**
   * Записване в курс
   */
  export const enrollUserInCourse = async (userEmail, courseId, totalVideos) => {
    try {
      if (!userEmail || !courseId || !totalVideos) {
        return { success: false, error: 'Невалидни данни' };
      }

      // Проверяваме дали потребителят има достъп
      const profile = await getUserProfile(userEmail);
      if (!profile.success) {
        return { success: false, error: 'Потребителят не съществува' };
      }

      if (!hasAccessToCourse(profile.data, courseId)) {
        return { success: false, error: 'Няма достъп до този курс' };
      }

      // Записваме в курса
      const result = await enrollInCourse(userEmail, courseId, totalVideos);
      return result;
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      return { success: false, error: 'Грешка при записване в курс' };
    }
  };
  
  /**
   * Получаване на прогрес по конкретен курс
   */
  export const getCourseProgress = async (userEmail, courseId) => {
    try {
      if (!userEmail || !courseId) {
        return { success: false, error: 'Невалидни данни' };
      }
      return await getFirestoreCourseProgress(userEmail, courseId);
    } catch (error) {
      console.error('Error getting course progress:', error);
      return { success: false, error: 'Грешка при получаване на прогрес по курс' };
    }
  };
  
  /**
   * Стартиране на видео
   */
  export const startVideo = async (userEmail, courseId, videoId) => {
    try {
      if (!userEmail || !courseId || !videoId) {
        return { success: false, error: 'Невалидни данни' };
      }

      const result = await recordVideoWatch(userEmail, courseId, videoId);
      return result;
    } catch (error) {
      console.error('Error starting video:', error);
      return { success: false, error: 'Грешка при стартиране на видео' };
    }
  };
  
  /**
   * Завършване на видео
   */
  export const completeVideo = async (userEmail, courseId, videoId) => {
    try {
      if (!userEmail || !courseId || !videoId) {
        return { success: false, error: 'Невалидни данни' };
      }

      const result = await markVideoAsCompleted(userEmail, courseId, videoId);
      return result;
    } catch (error) {
      console.error('Error completing video:', error);
      return { success: false, error: 'Грешка при завършване на видео' };
    }
  };
  
  /**
   * Получаване на завършени видеа за курс
   */
  export const getUserCompletedVideos = async (userEmail, courseId) => {
    try {
      if (!userEmail || !courseId) {
        return { success: false, error: 'Невалидни данни' };
      }
      return await getCompletedVideos(userEmail, courseId);
    } catch (error) {
      console.error('Error getting completed videos:', error);
      return { success: false, error: 'Грешка при получаване на завършени видеа' };
    }
  };
  
  // ============= СЕСИИ =============
  
  /**
   * Приключване на потребителска сесия
   */
  export const logoutUser = async (userEmail) => {
    try {
      if (!userEmail) {
        return { success: false, error: 'Невалиден email' };
      }
      await endUserSession(userEmail);
      return { success: true };
    } catch (error) {
      console.error('Error logging out user:', error);
      return { success: false, error: 'Грешка при излизане' };
    }
  };
  
  // ============= ПОМОЩНИ ФУНКЦИИ =============
  
  /**
   * Извличане на display name от email
   */
  const getDisplayNameFromEmail = (email) => {
    if (!email || !email.includes('@')) return 'Потребител';
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
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
      ...(sessions || []).map(s => ({ type: 'session', date: s.loginAt })),
      ...(videoProgress || []).map(v => ({ type: 'video', date: v.watchedAt }))
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
    getUserCompletedVideos,
    
    // Помощни
    getRoleInfo,
    isValidRole,
    
    // Константи
    ROLES,
    ROLE_DEFINITIONS
  };