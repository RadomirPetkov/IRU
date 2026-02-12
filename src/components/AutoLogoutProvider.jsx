// src/components/AutoLogoutProvider.jsx - Автоматичен логаут при неактивност (с localStorage)
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Clock, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'lastActivityTimestamp';

const AutoLogoutProvider = ({ children, timeoutMinutes = 120 }) => {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [checkedInitialTimeout, setCheckedInitialTimeout] = useState(false);
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  
  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_BEFORE_MS = 5 * 60 * 1000;
  const THROTTLE_MS = 30 * 1000;
  const lastThrottleRef = useRef(0);

  // Запазване на последна активност в localStorage
  const saveLastActivity = () => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch (e) {
      // localStorage може да не е достъпен
    }
    return now;
  };

  // Получаване на последна активност от localStorage
  const getLastActivity = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) : Date.now();
    } catch (e) {
      return Date.now();
    }
  };

  // Изчистване при logout
  const clearLastActivity = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Silent fail
    }
  };

  // Изчистване на таймери
  const clearAllTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timeoutRef.current = null;
    warningTimeoutRef.current = null;
    countdownRef.current = null;
  };

  // Стартиране на таймери
  const startTimers = () => {
    clearAllTimers();
    saveLastActivity();
    
    if (!isAuthenticated) return;
    
    // Warning таймер
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.ceil(WARNING_BEFORE_MS / 1000));
      
      // Countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARNING_BEFORE_MS);
    
    // Logout таймер
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      clearLastActivity();
      setShowWarning(false);
      logout();
    }, TIMEOUT_MS);
  };

  // Остани логнат
  const handleStayLoggedIn = () => {
    setShowWarning(false);
    startTimers();
  };

  // Изход
  const handleLogoutNow = () => {
    clearAllTimers();
    clearLastActivity();
    setShowWarning(false);
    logout();
  };

  // Проверка при първоначално зареждане - дали сесията е изтекла
  useEffect(() => {
    if (!isAuthenticated || checkedInitialTimeout) return;
    
    const lastActivity = getLastActivity();
    const elapsed = Date.now() - lastActivity;
    
    if (elapsed >= TIMEOUT_MS) {
      // Сесията е изтекла докато браузърът е бил затворен
      clearLastActivity();
      logout();
    } else if (elapsed >= TIMEOUT_MS - WARNING_BEFORE_MS) {
      // Близо до изтичане - покажи warning
      setShowWarning(true);
      const remaining = Math.ceil((TIMEOUT_MS - elapsed) / 1000);
      setRemainingSeconds(remaining);
      
      // Countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            clearLastActivity();
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Logout таймер за оставащото време
      timeoutRef.current = setTimeout(() => {
        clearAllTimers();
        clearLastActivity();
        setShowWarning(false);
        logout();
      }, TIMEOUT_MS - elapsed);
    } else {
      // Нормално стартиране с оставащото време
      const remainingTime = TIMEOUT_MS - elapsed;
      const warningTime = remainingTime - WARNING_BEFORE_MS;
      
      if (warningTime > 0) {
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(true);
          setRemainingSeconds(Math.ceil(WARNING_BEFORE_MS / 1000));
          
          countdownRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
              if (prev <= 1) {
                clearInterval(countdownRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }, warningTime);
      }
      
      timeoutRef.current = setTimeout(() => {
        clearAllTimers();
        clearLastActivity();
        setShowWarning(false);
        logout();
      }, remainingTime);
    }
    
    setCheckedInitialTimeout(true);
    
    return () => clearAllTimers();
  }, [isAuthenticated, checkedInitialTimeout]);

  // Reset при промяна на auth състоянието
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      clearLastActivity();
      setShowWarning(false);
      setCheckedInitialTimeout(false);
    }
  }, [isAuthenticated]);

  // Activity listener
  useEffect(() => {
    if (!isAuthenticated || !checkedInitialTimeout) return;

    const handleActivity = () => {
      // Не рестартирай ако има warning
      if (showWarning) return;
      
      // Throttle
      const now = Date.now();
      if (now - lastThrottleRef.current < THROTTLE_MS) return;
      lastThrottleRef.current = now;
      
      // Рестартирай таймерите
      startTimers();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, showWarning, checkedInitialTimeout]);

  // Visibility change - при връщане на таба
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      
      const lastActivity = getLastActivity();
      const elapsed = Date.now() - lastActivity;
      
      if (elapsed >= TIMEOUT_MS) {
        clearAllTimers();
        clearLastActivity();
        setShowWarning(false);
        logout();
      } else if (elapsed >= TIMEOUT_MS - WARNING_BEFORE_MS && !showWarning) {
        // Покажи warning с оставащото време
        clearAllTimers();
        const remaining = Math.ceil((TIMEOUT_MS - elapsed) / 1000);
        setShowWarning(true);
        setRemainingSeconds(remaining);
        
        countdownRef.current = setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              clearLastActivity();
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        timeoutRef.current = setTimeout(() => {
          clearAllTimers();
          clearLastActivity();
          setShowWarning(false);
          logout();
        }, TIMEOUT_MS - elapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isAuthenticated, showWarning]);

  // Периодична проверка на localStorage (за синхронизация между табове)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkInterval = setInterval(() => {
      const lastActivity = getLastActivity();
      const elapsed = Date.now() - lastActivity;
      
      if (elapsed >= TIMEOUT_MS) {
        clearAllTimers();
        clearLastActivity();
        setShowWarning(false);
        logout();
      }
    }, 60000); // Проверка всяка минута
    
    return () => clearInterval(checkInterval);
  }, [isAuthenticated]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle size={24} className="mr-3" />
                  <h3 className="text-lg font-bold">Сесията изтича</h3>
                </div>
                <button onClick={handleStayLoggedIn} className="text-white hover:text-orange-200">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={40} className="text-orange-500" />
              </div>
              
              <p className="text-gray-700 mb-2">Поради неактивност, ще бъдете изход от системата след:</p>
              
              <div className="text-4xl font-bold text-red-500 my-4">{formatTime(remainingSeconds)}</div>
              
              <div className="flex space-x-3 mt-6">
                <button onClick={handleLogoutNow} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Изход
                </button>
                <button onClick={handleStayLoggedIn} className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
                  Остани в системата
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoLogoutProvider;