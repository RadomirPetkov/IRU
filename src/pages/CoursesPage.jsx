// src/pages/CoursesPage.jsx - Версия с обработка на липсващи курсове
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Login from '../components/Login';
import { 
  Lock, 
  ArrowLeft, 
  Play,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Shield,
  RefreshCw,
  AlertCircle,
  Settings,
  Database,
  WifiOff
} from 'lucide-react';
import { courses, reloadCourses, checkForUpdates } from '../data/coursesData';

const CoursesPage = () => {
  const { isAuthenticated, user, userProfile, hasAccessToCourse, hasPermission } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'network', 'permission', 'empty', 'unknown'
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    loadCourses();
    
    // Проверяваме за обновления на всеки 5 минути
    const interval = setInterval(checkForCoursesUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    
    try {
      console.log('📚 Зареждане на курсове...');
      const coursesResult = await courses();
      
      if (Array.isArray(coursesResult)) {
        if (coursesResult.length === 0) {
          console.log('⚠️ Няма налични курсове');
          setErrorType('empty');
          setError('В момента няма активни курсове в системата');
        } else {
          console.log(`✅ Заредени ${coursesResult.length} курса`);
        }
        setCoursesData(coursesResult);
      } else {
        console.warn('⚠️ Получен невалиден формат на курсове');
        setCoursesData([]);
        setErrorType('unknown');
        setError('Получени са данни в невалиден формат');
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('❌ Грешка при зареждане на курсове:', error);
      
      // Определяме типа на грешката
      if (error.code === 'permission-denied') {
        setErrorType('permission');
        setError('Нямате права за достъп до курсовете');
      } else if (error.code === 'unavailable' || error.message.includes('network')) {
        setErrorType('network');
        setError('Проблем с мрежовата връзка. Моля, проверете интернет връзката си');
      } else {
        setErrorType('unknown');
        setError('Грешка при зареждане на курсове');
      }
      
      setCoursesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCourses = async () => {
    setRefreshing(true);
    setError(null);
    setErrorType(null);
    
    try {
      console.log('🔄 Ръчно презареждане на курсове...');
      const refreshedCourses = await reloadCourses();
      
      if (Array.isArray(refreshedCourses)) {
        if (refreshedCourses.length === 0) {
          setErrorType('empty');
          setError('В момента няма активни курсове в системата');
        } else {
          console.log(`✅ Презаредени ${refreshedCourses.length} курса`);
        }
        setCoursesData(refreshedCourses);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('❌ Грешка при презареждане:', error);
      
      if (error.code === 'permission-denied') {
        setErrorType('permission');
        setError('Нямате права за достъп до курсовете');
      } else if (error.code === 'unavailable' || error.message.includes('network')) {
        setErrorType('network');
        setError('Проблем с мрежовата връзка');
      } else {
        setErrorType('unknown');
        setError('Грешка при презареждане на курсове');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const checkForCoursesUpdates = async () => {
    try {
      const updateCheck = await checkForUpdates();
      if (updateCheck.hasUpdates) {
        console.log('🔔 Открити са нови курсове, презареждаме автоматично...');
        await loadCourses();
      }
    } catch (error) {
      console.warn('⚠️ Грешка при проверка за обновления:', error);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  // Проверяваме дали потребителят е админ
  const isAdmin = isAuthenticated && hasPermission && hasPermission('view_analytics');

  // Render за неавтентифициран потребител
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 max-w-[1500px] mt-24 py-4">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Обратно към началото
            </Link>
          </div>
        </div>

        <div className="py-16">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Обучителни курсове
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Професионални курсове за развитие на цифрови компетентности
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-purple-600 to-blue-700 px-6 py-12 text-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-white" size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Необходима автентификация
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Влезте в системата за достъп до курсовете
                  </p>
                </div>

                <div className="p-8 text-center">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                  >
                    Влизане в системата
                  </button>
                </div>
              </div>
            </div>

            {showLogin && (
              <Login 
                onClose={() => setShowLogin(false)}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render за зареждане
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Зареждане на курсове</h3>
          <p className="text-gray-600">Моля изчакайте, докато заредим наличните курсове...</p>
        </div>
      </div>
    );
  }

  // Филтриране на курсовете
  const accessibleCourses = coursesData.filter(course => hasAccessToCourse(course.id));
  const lockedCourses = coursesData.filter(course => !hasAccessToCourse(course.id));

  // Render за грешка или липса на курсове
  if (errorType || coursesData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 max-w-[1500px] py-4 mt-20">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Обратно към началото
              </Link>
              
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md"
                  >
                    <Settings size={14} className="mr-1" />
                    Админ панел
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                {/* Икона според типа грешка */}
                {errorType === 'empty' && (
                  <Database className="text-gray-400 mx-auto mb-6" size={80} />
                )}
                {errorType === 'network' && (
                  <WifiOff className="text-orange-400 mx-auto mb-6" size={80} />
                )}
                {errorType === 'permission' && (
                  <Shield className="text-red-400 mx-auto mb-6" size={80} />
                )}
                {(errorType === 'unknown' || !errorType) && (
                  <AlertCircle className="text-yellow-400 mx-auto mb-6" size={80} />
                )}

                {/* Заглавие според типа грешка */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {errorType === 'empty' && 'Няма активни курсове'}
                  {errorType === 'network' && 'Проблем с връзката'}
                  {errorType === 'permission' && 'Няма достъп'}
                  {(errorType === 'unknown' || !errorType) && 'Възникна проблем'}
                </h2>

                {/* Съобщение */}
                <p className="text-gray-600 text-lg mb-8">
                  {error || 'В момента няма активни курсове в системата'}
                </p>

                {/* Допълнителна информация */}
                <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
                  <h3 className="font-semibold text-blue-800 mb-2">Възможни причини:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {errorType === 'empty' && (
                      <>
                        <li>• Все още не са добавени курсове в системата</li>
                        <li>• Курсовете са временно деактивирани</li>
                        <li>• Планирано добавяне на ново съдържание</li>
                      </>
                    )}
                    {errorType === 'network' && (
                      <>
                        <li>• Няма интернет връзка</li>
                        <li>• Firestore е временно недостъпен</li>
                        <li>• Проблем със сървъра</li>
                      </>
                    )}
                    {errorType === 'permission' && (
                      <>
                        <li>• Нямате права за преглед на курсове</li>
                        <li>• Firestore правилата блокират достъпа</li>
                        <li>• Свържете се с администратор</li>
                      </>
                    )}
                    {(errorType === 'unknown' || !errorType) && (
                      <>
                        <li>• Временен проблем със системата</li>
                        <li>• Грешка при зареждане на данни</li>
                        <li>• Опитайте да презаредите страницата</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Информация за потребителя */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <span className="text-gray-600">Потребител:</span>
                      <p className="font-medium text-gray-800">{userProfile?.displayName || 'Неизвестен'}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-600">Роля:</span>
                      <p className="font-medium text-gray-800">{userProfile?.roleInfo?.name || 'Неизвестна'}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-800 text-xs">{user?.email || 'N/A'}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-600">Последна проверка:</span>
                      <p className="font-medium text-gray-800 text-xs">
                        {lastCheck ? lastCheck.toLocaleTimeString('bg-BG') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Бутони за действие */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleRefreshCourses}
                    disabled={refreshing}
                    className="flex items-center justify-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
                  >
                    <RefreshCw size={20} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Презарежда...' : 'Опитай отново'}
                  </button>

                  <Link
                    to="/"
                    className="flex items-center justify-center bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-md"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Към началната страница
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-md"
                    >
                      <Settings size={20} className="mr-2" />
                      Админ панел
                    </Link>
                  )}
                </div>

                {/* Помощна информация */}
                {errorType !== 'permission' && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Ако проблемът продължава, моля свържете се с администратор
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Нормален render с курсове
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4 mt-20">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Обратно към началото
            </Link>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  userProfile?.roleInfo?.color?.includes('red') ? 'bg-red-500' :
                  userProfile?.roleInfo?.color?.includes('green') ? 'bg-green-500' :
                  userProfile?.roleInfo?.color?.includes('blue') ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}></div>
                {userProfile?.displayName || 'Зареждане...'}
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-1" />
                {accessibleCourses.length} от {coursesData.length} курса
              </div>
              <button
                onClick={handleRefreshCourses}
                disabled={refreshing}
                className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
                title="Презареди курсове"
              >
                <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Презарежда...' : 'Обнови'}
              </button>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md"
                  title="Административен панел"
                >
                  <Settings size={14} className="mr-1" />
                  Админ панел
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Обучителни курсове
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Професионални курсове за развитие на вашите цифрови компетентности
            </p>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-center mb-3">
                {userProfile?.roleInfo && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${userProfile.roleInfo.color} bg-white`}>
                    {userProfile.roleInfo.name}
                  </div>
                )}
              </div>
              <p className="text-blue-100 mb-2">
                Добре дошли, <span className="font-semibold">{userProfile?.displayName || 'Потребител'}</span>
              </p>
              <p className="text-sm text-blue-200">
                Имате достъп до {accessibleCourses.length} от {coursesData.length} курса
              </p>
              {lastCheck && (
                <p className="text-xs text-blue-300 mt-2">
                  Последно обновяване: {lastCheck.toLocaleTimeString('bg-BG')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-[1500px]">
          
          {/* Accessible Courses */}
          {accessibleCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <CheckCircle className="text-green-500 mr-3" size={28} />
                Достъпни курсове
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {accessibleCourses.map(course => (
                  <div 
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className={`bg-gradient-to-r ${course.color} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">{course.icon}</div>
                        <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                          Ниво {course.level}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                      <p className="text-white text-opacity-90">{course.description}</p>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-600">
                          <Play size={16} className="mr-2" />
                          {course.videos?.length || 0} видео лекции
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {course.estimatedHours || 1} часа
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {(course.videos || []).slice(0, 3).map((video, index) => (
                          <div key={video.id || index} className="flex items-center text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs">
                              {index + 1}
                            </div>
                            <span className="flex-1">{video.title}</span>
                            <span className="text-xs">{video.duration || '0:00'}</span>
                          </div>
                        ))}
                        {(course.videos?.length || 0) > 3 && (
                          <div className="text-xs text-gray-500 ml-9">
                            +{(course.videos?.length || 0) - 3} още видеа
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/course/${course.id}`}
                        className={`w-full bg-gradient-to-r ${course.color} text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 block text-center`}
                      >
                        Започни курса
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Courses */}
          {lockedCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <XCircle className="text-red-500 mr-3" size={28} />
                Ограничени курсове
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lockedCourses.map(course => (
                  <div 
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden opacity-75"
                  >
                    <div className="bg-gray-400 p-6 text-white relative">
                      <div className="absolute top-4 right-4">
                        <Lock className="text-white" size={24} />
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl opacity-60">{course.icon}</div>
                        <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                          Ниво {course.level}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                      <p className="text-white text-opacity-90">{course.description}</p>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-400">
                          <Shield size={16} className="mr-2" />
                          Ограничен достъп
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Play size={16} className="mr-2" />
                          {course.videos?.length || 0} видеа
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <Lock className="text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-600 text-sm mb-3">
                          Нямате достъп до този курс
                        </p>
                        <p className="text-xs text-gray-500">
                          Свържете се с администратор за достъп
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Access Message */}
          {coursesData.length > 0 && accessibleCourses.length === 0 && (
            <div className="text-center py-12">
              <Shield className="text-gray-400 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Няма достъпни курсове
              </h3>
              <p className="text-gray-600 mb-4">
                Вашата роля: {userProfile?.roleInfo && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${userProfile.roleInfo.color}`}>
                    {userProfile.roleInfo.name}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Email: {user?.email}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Свържете се с администратор за предоставяне на достъп до курсове
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleRefreshCourses}
                  disabled={refreshing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center"
                >
                  <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Презарежда...' : 'Презареди данните'}
                </button>
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                  >
                    <Settings size={16} className="mr-2" />
                    Админ панел
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage