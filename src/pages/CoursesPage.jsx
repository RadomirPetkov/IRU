// src/pages/CoursesPage.jsx - Поправен с Firestore данни
import React, { useState } from 'react';
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
  Users,
  BookOpen,
  Award,
  Shield
} from 'lucide-react';
import { courses } from '../data/coursesData';

const CoursesPage = () => {
  const { isAuthenticated, user, userProfile, hasAccessToCourse } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Breadcrumb Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 max-w-[1500px] py-4">
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
                    Необходима автентификация
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Влезте в системата за достъп до курсовете
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {courses.map(course => (
                      <div key={course.id} className="text-center p-4">
                        <div className={`bg-gradient-to-r ${course.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 text-2xl`}>
                          {course.icon}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">
                          Ниво {course.level}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {course.videos.length} видеа
                        </p>
                      </div>
                    ))}
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

  // Филтриране на курсовете въз основа на достъпа от Firestore
  const accessibleCourses = courses.filter(course => 
    hasAccessToCourse(course.id)
  );
  const lockedCourses = courses.filter(course => 
    !hasAccessToCourse(course.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4">
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
                {accessibleCourses.length} от {courses.length} курса
              </div>
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
                Имате достъп до {accessibleCourses.length} от {courses.length} курса
              </p>
              
              {/* Debug информация само в development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-2 bg-black bg-opacity-20 rounded text-xs text-left">
                  <div>Email: {user?.email}</div>
                  <div>Role: {userProfile?.role}</div>
                  <div>Courses: {userProfile?.permissions?.courses?.join(', ')}</div>
                  <div>Display: {userProfile?.displayName}</div>
                </div>
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
                    {/* Course Header */}
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

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-600">
                          <Play size={16} className="mr-2" />
                          {course.videos.length} видео лекции
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {course.estimatedHours} часа
                        </div>
                      </div>

                      {/* Course Videos Preview */}
                      <div className="space-y-2 mb-6">
                        {course.videos.slice(0, 3).map((video, index) => (
                          <div key={video.id} className="flex items-center text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs">
                              {index + 1}
                            </div>
                            <span className="flex-1">{video.title}</span>
                            <span className="text-xs">{video.duration}</span>
                          </div>
                        ))}
                        {course.videos.length > 3 && (
                          <div className="text-xs text-gray-500 ml-9">
                            +{course.videos.length - 3} още видеа
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
                      <p className="text-white text-opacity-90">{course.description}</p>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-400">
                          <Shield size={16} className="mr-2" />
                          Ограничен достъп
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

          {/* No Courses Message */}
          {accessibleCourses.length === 0 && (
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
              <p className="text-gray-500 text-sm">
                Свържете се с администратор за предоставяне на достъп до курсове
              </p>
              
              {/* Бутон за презареждане */}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Презареди страницата
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;