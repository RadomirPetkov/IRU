// src/pages/CourseDetailPage.jsx - Поправен с правилни React Hooks
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  CheckCircle, 
  Lock,
  BookOpen,
  Award,
  BarChart,
  Calendar,
  TrendingUp,
  User,
  Target,
  PlayCircle
} from 'lucide-react';
import { getCourseById } from '../data/coursesData';
import { 
  enrollUserInCourse,
  getCourseProgress,
  startVideo,
  completeVideo,
  getUserCompletedVideos
} from '../services/userService';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated, user, hasAccessToCourse, userProfile } = useAuth();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  // Намираме курса
  const course = getCourseById(courseId);

  // Зареждане на данни при монтиране на компонента
  useEffect(() => {
    if (user?.email && course) {
      loadCourseData();
    }
  }, [courseId, user?.email, course]);

  // Проследяване на стартиране на видео
  useEffect(() => {
    if (selectedVideoIndex !== null && course && user?.email && !loading) {
      const selectedVideo = course.videos[selectedVideoIndex];
      if (selectedVideo) {
        handleVideoStart(selectedVideo);
      }
    }
  }, [selectedVideoIndex, user?.email, loading, course]);
  
  // Проверяваме достъпа - СЛЕД hooks
  if (!isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  if (!hasAccessToCourse(courseId)) {
    return <Navigate to="/courses" replace />;
  }

  const selectedVideo = course.videos[selectedVideoIndex];

  const loadCourseData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      console.log(`📚 Зареждане на данни за курс ${courseId}...`);
      
      // Получаваме прогреса по курса
      const progressResult = await getCourseProgress(user.email, courseId);
      
      if (progressResult.success) {
        console.log('✅ Прогрес по курса зареден:', progressResult.data);
        setCourseProgress(progressResult.data);
      } else {
        console.log('📝 Няма прогрес по курса. Записване на потребител...');
        // Ако няма прогрес, записваме потребителя в курса
        setEnrolling(true);
        const enrollResult = await enrollUserInCourse(user.email, courseId, course.videos.length);
        
        if (enrollResult.success) {
          console.log('✅ Потребителят е записан в курса успешно');
          // Презареждаме прогреса
          const newProgressResult = await getCourseProgress(user.email, courseId);
          if (newProgressResult.success) {
            setCourseProgress(newProgressResult.data);
            console.log('✅ Нов прогрес зареден:', newProgressResult.data);
          }
        } else {
          console.error('❌ Грешка при записване в курс:', enrollResult.error);
        }
        setEnrolling(false);
      }
      
      // Получаваме завършените видеа
      const completedResult = await getUserCompletedVideos(user.email, courseId);
      if (completedResult.success) {
        console.log('✅ Завършени видеа:', completedResult.completedVideos);
        setCompletedVideos(new Set(completedResult.completedVideos));
      } else {
        console.log('ℹ️ Няма завършени видеа за този курс');
        setCompletedVideos(new Set());
      }
      
    } catch (error) {
      console.error('❌ Грешка при зареждане на данни за курса:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoStart = async (video) => {
    if (!user?.email || !video || videoLoading) return;
    
    setVideoLoading(true);
    try {
      console.log(`▶️ Стартиране на видео: ${video.title}`);
      const result = await startVideo(user.email, courseId, video.id);
      
      if (result.success) {
        console.log('✅ Видеото е регистрирано като стартирано');
      } else {
        console.error('❌ Грешка при регистриране на видео:', result.error);
      }
    } catch (error) {
      console.error('❌ Грешка при стартиране на видео:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleVideoSelection = (index) => {
    console.log(`🎬 Избиране на видео ${index + 1}: ${course.videos[index].title}`);
    setSelectedVideoIndex(index);
  };

  const markVideoAsCompleted = async (videoIndex) => {
    if (!user?.email || !course.videos[videoIndex]) return;
    
    const video = course.videos[videoIndex];
    
    try {
      console.log(`✅ Маркиране на видео като завършено: ${video.title}`);
      const result = await completeVideo(user.email, courseId, video.id);
      
      if (result.success) {
        // Обновяваме локалното състояние
        setCompletedVideos(prev => {
          const newSet = new Set([...prev, video.id]);
          console.log('📊 Обновени завършени видеа:', Array.from(newSet));
          return newSet;
        });
        
        // Презареждаме прогреса
        const progressResult = await getCourseProgress(user.email, courseId);
        if (progressResult.success) {
          setCourseProgress(progressResult.data);
          console.log('📈 Обновен прогрес:', progressResult.data);
        }
        
        console.log(`🎉 Видео "${video.title}" успешно маркирано като завършено!`);
        
        // Ако това е последното видео и курсът е завършен
        if (progressResult.data?.progressPercentage === 100) {
          console.log('🏆 ПОЗДРАВЛЕНИЯ! Курсът е завършен на 100%!');
        }
        
      } else {
        console.error('❌ Грешка при маркиране на видео като завършено:', result.error);
      }
    } catch (error) {
      console.error('❌ Грешка при маркиране на видео:', error);
    }
  };

  const isVideoCompleted = (videoIndex) => {
    const video = course.videos[videoIndex];
    return completedVideos.has(video.id);
  };

  const getProgress = () => {
    if (courseProgress) {
      return courseProgress.progressPercentage || 0;
    }
    return (completedVideos.size / course.videos.length) * 100;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Неизвестно';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canWatchNextVideo = () => {
    // Може да гледа следващото видео само ако текущото е завършено
    return isVideoCompleted(selectedVideoIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Зареждане на курса</h3>
          <p className="text-gray-600">Моля изчакайте, докато заредим вашия прогрес...</p>
          {enrolling && (
            <p className="text-blue-600 mt-2">Записване в курса...</p>
          )}
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const isLastVideo = selectedVideoIndex === course.videos.length - 1;
  const isCourseCompleted = completedVideos.size === course.videos.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Начало
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              to="/courses" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Курсове
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">{course.title}</span>
          </div>
        </div>
      </div>

      {/* Course Header */}
      <div className={`bg-gradient-to-r ${course.color} text-white py-12`}>
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/courses"
              className="flex items-center text-white hover:text-blue-100 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Обратно към курсовете
            </Link>
            
            <div className="flex items-center space-x-4">
              {enrolling && (
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm animate-pulse">
                  <PlayCircle size={16} className="inline mr-2" />
                  Записване в курса...
                </div>
              )}
              {userProfile && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${userProfile.roleInfo?.color} bg-white`}>
                  <User size={14} className="inline mr-1" />
                  {userProfile.roleInfo?.name}
                </div>
              )}
              <div className="text-4xl">{course.icon}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-white text-opacity-90 mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-white text-opacity-90">
                <div className="flex items-center">
                  <Play size={20} className="mr-2" />
                  {course.videos.length} видеа
                </div>
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  {course.estimatedHours} часа
                </div>
                <div className="flex items-center">
                  <Award size={20} className="mr-2" />
                  Ниво {course.level}
                </div>
                {courseProgress?.enrolledAt && (
                  <div className="flex items-center">
                    <Calendar size={20} className="mr-2" />
                    Записан: {formatDate(courseProgress.enrolledAt)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart className="mr-2" size={20} />
                  Прогрес на курса
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Завършени</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div 
                      className="bg-white h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-white text-opacity-80 mb-4">
                  {completedVideos.size} от {course.videos.length} видеа завършени
                </p>
                
                {/* Статистики */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm border-t border-white border-opacity-20 pt-4">
                  <div>
                    <div className="font-semibold flex items-center justify-center">
                      <Target size={16} className="mr-1" />
                      {course.videos.length}
                    </div>
                    <div className="text-white text-opacity-70">Лекции</div>
                  </div>
                  <div>
                    <div className="font-semibold flex items-center justify-center">
                      <Clock size={16} className="mr-1" />
                      {course.estimatedHours}ч
                    </div>
                    <div className="text-white text-opacity-70">Време</div>
                  </div>
                </div>
                
                {/* Последен достъп */}
                {courseProgress?.lastAccessedAt && (
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center text-sm text-white text-opacity-80">
                      <TrendingUp size={16} className="mr-2" />
                      <div>
                        <div>Последен достъп:</div>
                        <div className="text-xs">{formatDate(courseProgress.lastAccessedAt)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Завършване на курса */}
                {isCourseCompleted && courseProgress?.completedAt && (
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center text-sm text-white">
                      <Award size={16} className="mr-2" />
                      <div>
                        <div className="font-semibold">Курс завършен!</div>
                        <div className="text-xs text-white text-opacity-80">
                          {formatDate(courseProgress.completedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Video Player */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                {videoLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Зареждане на видео...</p>
                    </div>
                  </div>
                )}
                
                <VideoPlayer
                  videoUrl={selectedVideo.url}
                  title={selectedVideo.title}
                  autoplay={false}
                />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedVideo.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <PlayCircle size={16} className="mr-1" />
                          Лекция {selectedVideoIndex + 1}
                        </span>
                        <span className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          {selectedVideo.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isVideoCompleted(selectedVideoIndex) ? (
                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-full">
                          <CheckCircle size={16} className="mr-1" />
                          <span className="text-sm font-medium">Завършено</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => markVideoAsCompleted(selectedVideoIndex)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Маркирай като завършено
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {selectedVideo.description}
                  </p>
                  
                  {/* Video Info Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 mb-1">Лекция</div>
                        <div className="text-gray-700">{selectedVideoIndex + 1} от {course.videos.length}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600 mb-1">Курс</div>
                        <div className="text-gray-700">Ниво {course.level}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600 mb-1">Прогрес</div>
                        <div className="text-gray-700">{Math.round(progress)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600 mb-1">Статус</div>
                        <div className={`text-sm ${isVideoCompleted(selectedVideoIndex) ? 'text-green-600' : 'text-gray-500'}`}>
                          {isVideoCompleted(selectedVideoIndex) ? '✅ Завършено' : '⏳ В процес'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Playlist */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <BookOpen className="mr-2" size={20} />
                    Съдържание на курса
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {completedVideos.size} от {course.videos.length} завършени
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {course.videos.map((video, index) => (
                    <div
                      key={video.id}
                      onClick={() => handleVideoSelection(index)}
                      className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                        selectedVideoIndex === index 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all duration-200 ${
                          isVideoCompleted(index) 
                            ? 'bg-green-500 text-white shadow-md' 
                            : selectedVideoIndex === index
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isVideoCompleted(index) ? (
                            <CheckCircle size={16} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm leading-tight ${
                            selectedVideoIndex === index ? 'text-blue-600' : 'text-gray-800'
                          }`}>
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {video.duration}
                            </span>
                            {isVideoCompleted(index) && (
                              <span className="text-xs text-green-600 font-medium">
                                Готово ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Course Completion Status */}
                {isCourseCompleted && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
                    <div className="flex items-center text-green-700">
                      <Award className="mr-2 text-green-600" size={20} />
                      <div>
                        <p className="font-semibold text-sm">Поздравления! 🎉</p>
                        <p className="text-xs">Завършихте курса успешно</p>
                        {courseProgress?.completedAt && (
                          <p className="text-xs mt-1 opacity-75">
                            {formatDate(courseProgress.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation Controls */}
              <div className="mt-6 space-y-3">
                {/* Previous Video */}
                {selectedVideoIndex > 0 && (
                  <button
                    onClick={() => setSelectedVideoIndex(selectedVideoIndex - 1)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Предишно видео
                  </button>
                )}
                
                {/* Next Video */}
                {!isLastVideo && (
                  <button
                    onClick={() => setSelectedVideoIndex(selectedVideoIndex + 1)}
                    disabled={!canWatchNextVideo()}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      canWatchNextVideo()
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-70'
                    }`}
                    title={!canWatchNextVideo() ? 'Завършете текущото видео за да продължите' : 'Следващо видео'}
                  >
                    {canWatchNextVideo() ? (
                      <>
                        Следващо видео
                        <Play size={16} className="ml-2" />
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="mr-2" />
                        Заключено
                      </>
                    )}
                  </button>
                )}
                
                {/* Course Completion Message */}
                {isLastVideo && isVideoCompleted(selectedVideoIndex) && isCourseCompleted && (
                  <div className="text-center p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                    <Award className="mx-auto mb-3 text-green-600" size={48} />
                    <h3 className="font-bold text-green-800 text-lg mb-2">
                      Курсът е завършен! 🏆
                    </h3>
                    <p className="text-green-700 text-sm mb-3">
                      Поздравления! Успешно завършихте всички {course.videos.length} лекции.
                    </p>
                    <p className="text-green-600 text-xs">
                      Можете да продължите с следващото ниво или да прегледате материалите отново.
                    </p>
                    {courseProgress?.completedAt && (
                      <div className="mt-3 pt-3 border-t border-green-300 text-xs text-green-600">
                        Завършен на: {formatDate(courseProgress.completedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;