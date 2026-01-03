// src/pages/CoursesPage.jsx - Поправена версия с админ панел
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Login from "../components/Login";
import {
  Lock,
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Award,
  Shield,
  RefreshCw,
  AlertCircle,
  Settings,
} from "lucide-react";
import { courses, reloadCourses, checkForUpdates } from "../data/coursesData";

const CoursesPage = () => {
  const {
    isAuthenticated,
    user,
    userProfile,
    hasAccessToCourse,
    hasPermission,
  } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
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

    try {
      const coursesResult = await courses();

      if (Array.isArray(coursesResult)) {
        setCoursesData(coursesResult);
      } else {
        setCoursesData([]);
      }

      setLastCheck(new Date());
    } catch (error) {
      console.error("❌ Грешка при зареждане на курсове:", error);
      setError("Грешка при зареждане на курсове. Използваме кеширани данни.");

      // Фолбек към кеширани данни ако има
      try {
        const fallbackCourses = await courses();
        if (Array.isArray(fallbackCourses)) {
          setCoursesData(fallbackCourses);
        }
      } catch (fallbackError) {
        console.error("❌ Грешка и при фолбек данните:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCourses = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const refreshedCourses = await reloadCourses();

      if (Array.isArray(refreshedCourses)) {
        setCoursesData(refreshedCourses);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error("❌ Грешка при презареждане:", error);
      setError("Грешка при презареждане на курсове");
    } finally {
      setRefreshing(false);
    }
  };

  const checkForCoursesUpdates = async () => {
    try {
      const updateCheck = await checkForUpdates();
      if (updateCheck.hasUpdates) {
        await loadCourses();
      }
    } catch (error) {
      // Тихо игнорираме грешките при проверка
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  // Проверяваме дали потребителят е админ
  const isAdmin =
    isAuthenticated && hasPermission && hasPermission("view_analytics");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Breadcrumb Navigation */}
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

        {/* Protected Content */}
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
                    Достъп до курсове
                  </h2>
                  <p className="text-blue-100 text-lg mb-2">
                    {loading
                      ? "Зареждане..."
                      : `В момента имаме ${coursesData.length} ${
                          coursesData.length === 1
                            ? "активен курс"
                            : "активни курса"
                        }`}
                  </p>
                  <p className="text-blue-100">
                    Влезте в системата, за да получите достъп до обученията
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {loading ? (
                      <div className="col-span-full text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Зареждане на курсове...</p>
                      </div>
                    ) : (
                      coursesData.slice(0, 4).map((course) => (
                        <div key={course.id} className="text-center p-4">
                          <div
                            className={`bg-gradient-to-r ${course.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 text-2xl`}
                          >
                            {course.icon}
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">
                            Ниво {course.level}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {course.content?.filter((c) => c.type === "video")
                              .length ||
                              course.videos?.length ||
                              0}{" "}
                            видеа
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setShowLogin(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                    >
                      Влизане в системата
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Modal */}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Зареждане на курсове
          </h3>
          <p className="text-gray-600">
            Моля изчакайте, докато заредим най-новите курсове...
          </p>
        </div>
      </div>
    );
  }

  // Филтриране на курсовете въз основа на достъпа от Firestore
  const accessibleCourses = coursesData.filter((course) =>
    hasAccessToCourse(course.id)
  );
  const lockedCourses = coursesData.filter(
    (course) => !hasAccessToCourse(course.id)
  );

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
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    userProfile?.roleInfo?.color?.includes("red")
                      ? "bg-red-500"
                      : userProfile?.roleInfo?.color?.includes("green")
                      ? "bg-green-500"
                      : userProfile?.roleInfo?.color?.includes("blue")
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                {userProfile?.displayName || "Зареждане..."}
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
                <RefreshCw
                  size={16}
                  className={`mr-1 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Презарежда..." : "Обнови"}
              </button>

              {/* АДМИН ПАНЕЛ БУТОН */}
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
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${userProfile.roleInfo.color} bg-white`}
                  >
                    {userProfile.roleInfo.name}
                  </div>
                )}
              </div>
              <p className="text-blue-100 mb-2">
                Добре дошли,{" "}
                <span className="font-semibold">
                  {userProfile?.displayName || "Потребител"}
                </span>
              </p>
              <p className="text-sm text-blue-200">
                Имате достъп до {accessibleCourses.length} от{" "}
                {coursesData.length} курса
              </p>
              {lastCheck && (
                <p className="text-xs text-blue-300 mt-2">
                  Последно обновяване: {lastCheck.toLocaleTimeString("bg-BG")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="py-4">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-yellow-500 hover:text-yellow-700"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
                {accessibleCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Course Header */}
                    <div
                      className={`bg-gradient-to-r ${course.color} p-6 text-white`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">{course.icon}</div>
                        <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                          Ниво {course.level}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                      <p className="text-white text-opacity-90">
                        {course.description}
                      </p>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center text-gray-600">
                          <Play size={16} className="mr-2" />
                          {course.content?.filter((c) => c.type === "video")
                            .length ||
                            course.videos?.length ||
                            0}{" "}
                          видео лекции
                        </div>
                      </div>

                      {/* Course Videos Preview */}
                      <div className="space-y-2 mb-6">
                        {(
                          course.content?.filter((c) => c.type === "video") ||
                          course.videos ||
                          []
                        )
                          .slice(0, 3)
                          .map((video, index) => (
                            <div
                              key={video.id || index}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs">
                                {index + 1}
                              </div>
                              <span className="flex-1">{video.title}</span>
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
                {lockedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden opacity-75"
                  >
                    {/* Course Header */}
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
                      <p className="text-white text-opacity-90">
                        {course.description}
                      </p>
                    </div>

                    {/* Course Content */}
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
                        <Lock
                          className="text-gray-400 mx-auto mb-2"
                          size={32}
                        />
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

          {/* No Courses Message */}
          {coursesData.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="text-gray-400 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Няма налични курсове
              </h3>
              <p className="text-gray-600 mb-4">
                В момента няма курсове в системата
              </p>
              <button
                onClick={handleRefreshCourses}
                disabled={refreshing}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center mx-auto"
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Презарежда..." : "Презареди курсовете"}
              </button>
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
                Вашата роля:{" "}
                {userProfile?.roleInfo && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${userProfile.roleInfo.color}`}
                  >
                    {userProfile.roleInfo.name}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-sm mb-4">Email: {user?.email}</p>
              <p className="text-gray-500 text-sm mb-6">
                Свържете се с администратор за предоставяне на достъп до курсове
              </p>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleRefreshCourses}
                  disabled={refreshing}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center"
                >
                  <RefreshCw
                    size={16}
                    className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Презарежда..." : "Презареди данните"}
                </button>

                {/* АДМИН ПАНЕЛ БУТОН */}
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

export default CoursesPage;