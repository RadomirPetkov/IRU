// src/contexts/AuthContext.jsx - Поправена версия за правилен logout/login цикъл
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChange, logoutUser as firebaseSignOut } from "../firebaseAuth";
import {
  initializeUser,
  getFullUserProfile,
  logoutUser as logoutUserService,
  hasAccessToCourse as checkCourseAccess,
} from "../services/userService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Инициализация на потребител при влизане
  const initUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    setInitializing(true);
    try {
      // Инициализираме потребителя във Firestore
      await initializeUser(firebaseUser.email);

      // Получаваме пълния профил
      const profileResult = await getFullUserProfile(firebaseUser.email);

      if (profileResult.success) {
        setUserProfile(profileResult.data);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      setUserProfile(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  // Функция за форсирано презареждане на профила
  const forceRefresh = useCallback(async () => {
    if (!user?.email) {
      return;
    }

    setInitializing(true);

    try {
      const profileResult = await getFullUserProfile(user.email);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setInitializing(false);
    }
  }, [user?.email]);

  // Функция за излизане
  const logout = useCallback(async () => {
    // Приключваме сесията в Firestore
    if (user?.email) {
      try {
        await logoutUserService(user.email);
      } catch (error) {
        // Silent fail
      }
    }
    
    // Изчистваме локалния state
    setUserProfile(null);
    setUser(null);
    setAuthReady(false);
    
    // Firebase Auth signOut
    try {
      await firebaseSignOut();
    } catch (error) {
      // Silent fail
    }
  }, [user?.email]);

  // Проследяване на Firebase Auth състоянието
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await initUser(firebaseUser);
        setAuthReady(true);
      } else {
        setUser(null);
        setUserProfile(null);
        setAuthReady(true);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [initUser]);

  // Функция за обновяване на профила
  const refreshProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      const profileResult = await getFullUserProfile(user.email);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
      }
    } catch (error) {
      // Silent fail
    }
  }, [user?.email]);

  // Проверка за достъп до курс
  const hasAccessToCourse = useCallback((courseId) => {
    if (!userProfile || !userProfile.permissions || !userProfile.permissions.courses) {
      return false;
    }
    return userProfile.permissions.courses.includes(courseId);
  }, [userProfile]);

  // Проверка за права
  const hasPermission = useCallback((permission) => {
    if (!userProfile || !userProfile.roleInfo) {
      return false;
    }
    return userProfile.roleInfo.permissions.includes(permission);
  }, [userProfile]);

  // Получаване на роля
  const getUserRole = useCallback(() => {
    return userProfile?.role || "guest";
  }, [userProfile]);

  // Получаване на display name
  const getDisplayName = useCallback(() => {
    return userProfile?.displayName || user?.email?.split("@")[0] || "Потребител";
  }, [userProfile, user?.email]);

  const value = {
    // Състояние
    user,
    userProfile,
    loading: loading || initializing,
    isAuthenticated: !!user && authReady,

    // Функции
    logout,
    refreshProfile,
    forceRefresh,
    hasAccessToCourse,
    hasPermission,
    getUserRole,
    getDisplayName,

    // Данни за потребителя
    email: user?.email,
    displayName: getDisplayName(),
    role: getUserRole(),
    roleInfo: userProfile?.roleInfo,
    permissions: userProfile?.permissions,
    joinDate: userProfile?.joinDate,
    lastLogin: userProfile?.lastLogin,
  };

  // Показваме loading докато auth не е готов
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};