// src/services/userService.js - Поправен с всички функции
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
  
  // ============= ОСНОВНИ ФУНКЦИИ ЗА ПОТРЕБИТЕЛИ =============
  
  /**
   * Инициализация на потребител при първо влизане
   */
  export const initializeUser = async (userEmail, initialData = {}) => {
    try {
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
        console.log('✅ Нов потребителски профил създаден:', userEmail);
      }
      
      // Започваме нова сесия
      await startUserSession(userEmail);
      
      // Обновяваме последен вход
      await updateLastLogin(userEmail);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Грешка при инициализация на потребител:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на пълна информация за потребител
   */
  export const getFullUserProfile = async (userEmail) => {
    try {
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
      console.error('❌ Грешка при получаване на профил:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Проверка дали потребителят има достъп до курс
   */
  export const hasAccessToCourse = (userProfile, courseId) => {
    if (!userProfile || !userProfile.permissions) {
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
    return roleInfo && roleInfo.permissions.includes(permission);
  };
  
  // ============= УПРАВЛЕНИЕ НА КУРСОВЕ =============
  
  /**
   * Записване в курс
   */
  export const enrollUserInCourse = async (userEmail, courseId, totalVideos) => {
    try {
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
      
      if (result.success) {
        console.log(`✅ Потребител ${userEmail} записан в курс ${courseId}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Грешка при записване в курс:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на прогрес по конкретен курс
   */
  export const getCourseProgress = async (userEmail, courseId) => {
    try {
      return await getFirestoreCourseProgress(userEmail, courseId);
    } catch (error) {
      console.error('❌ Грешка при получаване на прогрес по курс:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на прогрес по всички курсове
   */
  export const getAllCourseProgress = async (userEmail) => {
    try {
      const stats = await getActivityStats(userEmail);
      if (!stats.success) {
        return stats;
      }
  
      const courseProgress = stats.data.courseProgress.reduce((acc, progress) => {
        const courseId = progress.courseId;
        acc[courseId] = progress;
        return acc;
      }, {});
  
      return { success: true, data: courseProgress };
    } catch (error) {
      console.error('❌ Грешка при получаване на прогрес:', error);
      return { success: false, error: error.message };
    }
  };
  
  // ============= УПРАВЛЕНИЕ НА ВИДЕА =============
  
  /**
   * Стартиране на видео
   */
  export const startVideo = async (userEmail, courseId, videoId) => {
    try {
      const result = await recordVideoWatch(userEmail, courseId, videoId);
      
      if (result.success) {
        console.log(`📹 Потребител ${userEmail} започна видео ${videoId} от курс ${courseId}`);
        
        // Добавяме видеото в текущата сесия
        const sessionId = localStorage.getItem('currentSessionId');
        if (sessionId) {
          // Тук можем да добавим логика за обновяване на сесията
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Грешка при стартиране на видео:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Завършване на видео
   */
  export const completeVideo = async (userEmail, courseId, videoId) => {
    try {
      const result = await markVideoAsCompleted(userEmail, courseId, videoId);
      
      if (result.success) {
        console.log(`✅ Потребител ${userEmail} завърши видео ${videoId} от курс ${courseId}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Грешка при завършване на видео:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на завършени видеа за курс
   */
  export const getUserCompletedVideos = async (userEmail, courseId) => {
    try {
      return await getCompletedVideos(userEmail, courseId);
    } catch (error) {
      console.error('❌ Грешка при получаване на завършени видеа:', error);
      return { success: false, error: error.message };
    }
  };
  
  // ============= СЕСИИ =============
  
  /**
   * Приключване на потребителска сесия
   */
  export const logoutUser = async (userEmail) => {
    try {
      await endUserSession(userEmail);
      console.log(`👋 Потребител ${userEmail} се излогна`);
      return { success: true };
    } catch (error) {
      console.error('❌ Грешка при излизане:', error);
      return { success: false, error: error.message };
    }
  };
  
  // ============= АДМИНИСТРАТИВНИ ФУНКЦИИ =============
  
  /**
   * Добавяне на достъп до курс (само за админи)
   */
  export const addCourseAccessToUser = async (adminEmail, targetUserEmail, courseId) => {
    try {
      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'manage_users')) {
        return { success: false, error: 'Няма права за тази операция' };
      }
  
      const result = await grantCourseAccess(targetUserEmail, courseId);
      
      if (result.success) {
        console.log(`✅ Admin ${adminEmail} даде достъп до курс ${courseId} на ${targetUserEmail}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Грешка при добавяне на достъп:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Премахване на достъп до курс (само за админи)
   */
  export const removeCourseAccessFromUser = async (adminEmail, targetUserEmail, courseId) => {
    try {
      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'manage_users')) {
        return { success: false, error: 'Няма права за тази операция' };
      }
  
      const result = await revokeCourseAccess(targetUserEmail, courseId);
      
      if (result.success) {
        console.log(`❌ Admin ${adminEmail} премахна достъп до курс ${courseId} от ${targetUserEmail}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Грешка при премахване на достъп:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на всички потребители (само за админи)
   */
  export const getAdminUsersList = async (adminEmail) => {
    try {
      // Проверяваме дали admin има права
      const adminProfile = await getUserProfile(adminEmail);
      if (!adminProfile.success || !hasPermission(adminProfile.data, 'view_analytics')) {
        return { success: false, error: 'Няма права за тази операция' };
      }
  
      return await getAllUsers();
    } catch (error) {
      console.error('❌ Грешка при получаване на потребители:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Получаване на детайлни статистики за потребител
   */
  export const getUserDetailedStats = async (userEmail, requestingUserEmail) => {
    try {
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
      console.error('❌ Грешка при получаване на статистики:', error);
      return { success: false, error: error.message };
    }
  };
  
  // ============= ПОМОЩНИ ФУНКЦИИ =============
  
  /**
   * Извличане на display name от email
   */
  const getDisplayNameFromEmail = (email) => {
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  };
  
  /**
   * Намиране на най-гледания курс
   */
  const getMostWatchedCourse = (videoProgress) => {
    if (!videoProgress.length) return null;
    
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
      ...sessions.map(s => ({ type: 'session', date: s.loginAt })),
      ...videoProgress.map(v => ({ type: 'video', date: v.watchedAt }))
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
  
  // ============= СЪЗДАВАНЕ НА ДЕМО ПОТРЕБИТЕЛИ =============
  
  /**
   * Създаване на демо потребители за тестване
   */
  export const createDemoUsers = async () => {
    const demoUsers = [
      {
        email: 'admin@iru.bg',
        displayName: 'Администратор',
        role: ROLES.ADMIN,
        courses: ['basic', 'intermediate', 'advanced', 'expert']
      },
      {
        email: 'teacher@iru.bg',
        displayName: 'Преподавател',
        role: ROLES.TEACHER,
        courses: ['basic', 'intermediate', 'advanced']
      },
      {
        email: 'student@iru.bg',
        displayName: 'Студент',
        role: ROLES.STUDENT,
        courses: ['basic']
      },
      {
        email: 'student2@iru.bg',
        displayName: 'Напреднал студент',
        role: ROLES.STUDENT,
        courses: ['basic', 'intermediate']
      }
    ];
  
    console.log('🚀 Създаване на демо потребители...');
    
    for (const user of demoUsers) {
      try {
        const result = await createUserProfile(user.email, user);
        if (result.success) {
          console.log(`✅ Създаден демо потребител: ${user.email}`);
        } else {
          console.log(`⚠️ Потребител ${user.email} вече съществува или има грешка`);
        }
      } catch (error) {
        console.error(`❌ Грешка при създаване на ${user.email}:`, error);
      }
    }
    
    console.log('✅ Демо потребителите са готови!');
  };
  
  // Експортиране на всички функции
  export default {
    // Основни функции
    initializeUser,
    getFullUserProfile,
    hasAccessToCourse,
    hasPermission,
    logoutUser,
    
    // Курсове
    enrollUserInCourse,
    getCourseProgress,
    getAllCourseProgress,
    
    // Видеа
    startVideo,
    completeVideo,
    getUserCompletedVideos,
    
    // Административни
    addCourseAccessToUser,
    removeCourseAccessFromUser,
    getAdminUsersList,
    getUserDetailedStats,
    
    // Демо
    createDemoUsers,
    
    // Помощни
    getRoleInfo,
    isValidRole,
    
    // Константи
    ROLES,
    ROLE_DEFINITIONS
  };