// src/contexts/AuthContext.jsx - Обновен с по-добро зареждане
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../firebaseAuth';
import { 
  initializeUser, 
  getFullUserProfile, 
  logoutUser as logoutUserService,
  hasAccessToCourse as checkCourseAccess
} from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Инициализация на потребител при влизане
  const initUser = async (firebaseUser) => {
    if (!firebaseUser) return;
    
    setInitializing(true);
    try {
      console.log('🔄 Инициализация на потребител:', firebaseUser.email);
      
      // Инициализираме потребителя във Firestore
      await initializeUser(firebaseUser.email);
      
      // Получаваме пълния профил
      const profileResult = await getFullUserProfile(firebaseUser.email);
      
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        console.log('✅ Потребителски профил зареден:', profileResult.data);
        console.log('📋 Роля:', profileResult.data.role);
        console.log('📚 Курсове:', profileResult.data.permissions?.courses);
      } else {
        console.error('❌ Грешка при зареждане на профил:', profileResult.error);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Грешка при инициализация на потребител:', error);
      setUserProfile(null);
    } finally {
      setInitializing(false);
    }
  };

  // Функция за форсирано презареждане на профила
  const forceRefresh = async () => {
    if (!user?.email) {
      console.log('⚠️ Няма user email за презареждане');
      return;
    }
    
    console.log('🔄 Форсирано презареждане на профил за:', user.email);
    setInitializing(true);
    
    try {
      const profileResult = await getFullUserProfile(user.email);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        console.log('✅ Профил презареден успешно:', profileResult.data);
        console.log('📋 Нова роля:', profileResult.data.role);
        console.log('📚 Нови курсове:', profileResult.data.permissions?.courses);
      } else {
        console.error('❌ Грешка при презареждане на профил:', profileResult.error);
      }
    } catch (error) {
      console.error('❌ Грешка при презареждане:', error);
    } finally {
      setInitializing(false);
    }
  };

  // Функция за излизане
  const logout = async () => {
    if (user?.email) {
      await logoutUserService(user.email);
    }
    setUser(null);
    setUserProfile(null);
  };

  // Проследяване на Firebase Auth състоянието
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('🔥 Firebase Auth state change:', firebaseUser?.email || 'No user');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await initUser(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Функция за обновяване на профила
  const refreshProfile = async () => {
    if (!user?.email) return;
    
    try {
      const profileResult = await getFullUserProfile(user.email);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        console.log('🔄 Профил обновен:', profileResult.data);
      }
    } catch (error) {
      console.error('❌ Грешка при обновяване на профил:', error);
    }
  };

  // Проверка за достъп до курс
  const hasAccessToCourse = (courseId) => {
    if (!userProfile || !userProfile.permissions || !userProfile.permissions.courses) {
      console.log('⚠️ Няма достъп - липсва userProfile или courses:', {
        hasUserProfile: !!userProfile,
        hasPermissions: !!userProfile?.permissions,
        hasCourses: !!userProfile?.permissions?.courses,
        courseId
      });
      return false;
    }
    
    const hasAccess = userProfile.permissions.courses.includes(courseId);
    console.log(`🔍 Проверка достъп до курс ${courseId}:`, hasAccess, 'Courses:', userProfile.permissions.courses);
    return hasAccess;
  };

  // Проверка за права
  const hasPermission = (permission) => {
    if (!userProfile || !userProfile.roleInfo) {
      console.log('⚠️ Няма права - липсва userProfile или roleInfo:', permission);
      return false;
    }
    const hasAccess = userProfile.roleInfo.permissions.includes(permission);
    console.log(`🔍 Проверка право ${permission}:`, hasAccess);
    return hasAccess;
  };

  // Получаване на роля
  const getUserRole = () => {
    const role = userProfile?.role || 'guest';
    console.log('👤 Роля на потребителя:', role);
    return role;
  };

  // Получаване на display name
  const getDisplayName = () => {
    const name = userProfile?.displayName || user?.email?.split('@')[0] || 'Потребител';
    console.log('📝 Display name:', name);
    return name;
  };

  // Debug функция за състоянието
  const getDebugInfo = () => {
    return {
      user: user?.email,
      userProfile: {
        email: userProfile?.email,
        displayName: userProfile?.displayName,
        role: userProfile?.role,
        courses: userProfile?.permissions?.courses,
        roleInfo: userProfile?.roleInfo?.name
      },
      loading,
      initializing,
      isAuthenticated: !!user
    };
  };

  const value = {
    // Състояние
    user,
    userProfile,
    loading: loading || initializing,
    isAuthenticated: !!user,
    
    // Функции
    logout,
    refreshProfile,
    forceRefresh,
    hasAccessToCourse,
    hasPermission,
    getUserRole,
    getDisplayName,
    getDebugInfo,
    
    // Данни за потребителя
    email: user?.email,
    displayName: getDisplayName(),
    role: getUserRole(),
    roleInfo: userProfile?.roleInfo,
    permissions: userProfile?.permissions,
    joinDate: userProfile?.joinDate,
    lastLogin: userProfile?.lastLogin
  };

  // Debug log при промяна на състоянието
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🐛 AuthContext Debug Info:', getDebugInfo());
    }
  }, [user, userProfile, loading, initializing]);

  // Добавяме debug функции към window в development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.authDebug = {
        getDebugInfo,
        forceRefresh,
        refreshProfile,
        hasAccessToCourse: (courseId) => {
          console.log('🔍 Debug check access to:', courseId);
          return hasAccessToCourse(courseId);
        }
      };
      console.log('🛠️ Auth debug functions available: window.authDebug');
    }
  }, [userProfile]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};