// src/contexts/AuthContext.jsx - Обновен с по-добро зареждане
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChange } from "../firebaseAuth";
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

  // Инициализация на потребител при влизане
  const initUser = async (firebaseUser) => {
    if (!firebaseUser) return;

    setInitializing(true);
    try {
      // Инициализираме потребителя във Firestore
      await initializeUser(firebaseUser.email);

      // Получаваме пълния профил
      const profileResult = await getFullUserProfile(firebaseUser.email);

      if (profileResult.success) {
        setUserProfile(profileResult.data);
      } else {
        console.error(
          "❌ Грешка при зареждане на профил:",
          profileResult.error
        );
        setUserProfile(null);
      }
    } catch (error) {
      console.error("❌ Грешка при инициализация на потребител:", error);
      setUserProfile(null);
    } finally {
      setInitializing(false);
    }
  };

  // Функция за форсирано презареждане на профила
  const forceRefresh = async () => {
    if (!user?.email) {
      return;
    }

    setInitializing(true);

    try {
      const profileResult = await getFullUserProfile(user.email);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
      } else {
        console.error(
          "❌ Грешка при презареждане на профил:",
          profileResult.error
        );
      }
    } catch (error) {
      console.error("❌ Грешка при презареждане:", error);
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
      }
    } catch (error) {
      console.error("❌ Грешка при обновяване на профил:", error);
    }
  };

  // Проверка за достъп до курс
  const hasAccessToCourse = (courseId) => {
    if (
      !userProfile ||
      !userProfile.permissions ||
      !userProfile.permissions.courses
    ) {
      return false;
    }

    const hasAccess = userProfile.permissions.courses.includes(courseId);
    return hasAccess;
  };

  // Проверка за права
  const hasPermission = (permission) => {
    if (!userProfile || !userProfile.roleInfo) {
      return false;
    }
    const hasAccess = userProfile.roleInfo.permissions.includes(permission);
    return hasAccess;
  };

  // Получаване на роля
  const getUserRole = () => {
    const role = userProfile?.role || "guest";
    return role;
  };

  // Получаване на display name
  const getDisplayName = () => {
    const name =
      userProfile?.displayName || user?.email?.split("@")[0] || "Потребител";
    return name;
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

    // Данни за потребителя
    email: user?.email,
    displayName: getDisplayName(),
    role: getUserRole(),
    roleInfo: userProfile?.roleInfo,
    permissions: userProfile?.permissions,
    joinDate: userProfile?.joinDate,
    lastLogin: userProfile?.lastLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
