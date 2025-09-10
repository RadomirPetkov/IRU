// src/contexts/AuthContext.jsx - Поправен с правилни permissions
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../firebaseAuth';
import { 
  initializeUser, 
  getFullUserProfile, 
  logoutUser as logoutUserService,
  hasAccessToCourse as checkCourseAccess,
  hasPermission as checkPermission,
  ROLE_DEFINITIONS
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
      console.log('🔄 Auth state change:', firebaseUser?.email || 'logged out');
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
    if (!userProfile) {
      console.log('❌ hasAccessToCourse: няма userProfile');
      return false;
    }
    
    const result = checkCourseAccess(userProfile, courseId);
    console.log(`🔍 Access to course ${courseId}:`, result);
    return result;
  };

  // Проверка за права - ПОПРАВЕНО
  const hasPermission = (permission) => {
    if (!userProfile) {
      console.log('❌ hasPermission: няма userProfile');
      return false;
    }
    
    // Използваме функцията от userService
    const result = checkPermission(userProfile, permission);
    console.log(`🔍 Permission '${permission}' for role '${userProfile.role}':`, result);
    return result;
  };

  // Получаване на роля
  const getUserRole = () => {
    return userProfile?.role || 'guest';
  };

  // Получаване на display name
  const getDisplayName = () => {
    return userProfile?.displayName || user?.email?.split('@')[0] || 'Потребител';
  };

  // Проверка дали е админ
  const isAdmin = () => {
    const role = getUserRole();
    const result = role === 'admin';
    console.log(`🔍 isAdmin check: role=${role}, result=${result}`);
    return result;
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
    hasAccessToCourse,
    hasPermission,
    getUserRole,
    getDisplayName,
    isAdmin, // Добавена функция
    
    // Данни за потребителя
    email: user?.email,
    displayName: getDisplayName(),
    role: getUserRole(),
    roleInfo: userProfile?.roleInfo || ROLE_DEFINITIONS['guest'],
    permissions: userProfile?.permissions,
    joinDate: userProfile?.joinDate,
    lastLogin: userProfile?.lastLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};