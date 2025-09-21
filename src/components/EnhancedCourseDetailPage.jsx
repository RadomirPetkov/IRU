// src/pages/EnhancedCourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import StudentAssignmentViewer from '../components/StudentAssignmentViewer';
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
  PlayCircle,
  RefreshCw,
  AlertCircle,
  FileText,
  Video,
  ArrowRight
} from 'lucide-react';
import { getCourseById, reloadCourses } from '../data/coursesData';
import { CONTENT_TYPES } from '../firebase/courses';
import { 
  enrollUserInCourse,
  getCourseProgress,
  startVideo,
  completeVideo,
  getUserCompletedVideos
} from '../services/userService';

const EnhancedCourseDetailPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated, user, hasAccessToCourse, userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [completedContent, setCompletedContent] = useState(new Set());
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Зареждане на данни при монтиране на компонента
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (user?.email && course && !loading) {
      loadUserProgress();
    }
  }, [courseId, user?.email, course, loading]);

  const loadCourseData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📚 Зареждане на курс ${courseId}...`);
      const courseData = await getCourseById(courseId);
      
      if (courseData) {
        setCourse(courseData);
        console.log(`✅ Курс зареден: ${courseData.title}`);
        
        // Проверяваме дали курсът има новата структура
        if (courseData.content && Array.isArray(courseData.content)) {
          console.log(`📋 Съдържание в курса: ${courseData.content.length} елемента`);
        } else if (courseData.videos && courseData.videos.length > 0) {
          console.log(`📹 Стари видеа в курса: ${courseData.videos.length} (нужна миграция)`);
        }
      } else {
        setError('Курсът не съществува');
        console.error(`❌ Курс с ID ${courseId} не е намерен`);
      }
    } catch (error) {
      console.error('❌ Грешка при зареждане на курс:', error);
      setError('Грешка при зареждане на курс');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.email || !course) return;
    
    try {
      console.log(`📊 Зареждане на прогреса за курс ${courseId}...`);
      
      // Получаваме прогреса по курса
      const progressResult = await getCourseProgress(user.email, courseId);
      
      if (progressResult.success) {
        console.log('✅ Прогрес по курса зареден:', progressResult.data);
        setCourseProgress(progressResult.data);
      } else {
        console.log('📝 Няма прогрес по курса. Записване на потребител...');
        // Ако няма прогрес, записваме потребителя в курса
        setEnrolling(true);
        const totalContent = getContentLength(course);
        const enrollResult = await enrollUserInCourse(user.email, courseId, totalContent);
        
        if (enrollResult.success) {
          console.log('✅ Потребителят е записан в курса успешно');
          const newProgressResult = await getCourseProgress(user.email, courseId);
          if (newProgressResult.success) {
            setCourseProgress(newProgressResult.data);
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
        setCompletedContent(new Set(completedResult.completedVideos));
      } else {
        setCompletedContent(new Set());
      }
      
    } catch (error) {
      console.error('❌ Грешка при зареждане на данни за курса:', error);
    }
  };

  const getContentLength = (course) => {
    if (course.content && Array.isArray(course.content)) {
      return course.content.length;
    }
    return course.videos?.length || 0;
  };

  const getCourseContent = (course) => {
    if (course.content && Array.isArray(course.content)) {
      return course.content.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // Fallback към старата структура
    return (course.videos || []).map((video, index) => ({
      id: video.id || `legacy-video-${index}`,
      type: CONTENT_TYPES.VIDEO,
      title: video.title,
      url: video.url,
      description: video.description,
      duration: video.duration,
      category: video.category,
      order: video.order || index + 1
    }));
  };

  const handleRefreshCourse = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log('🔄 Презареждане на курса...');
      await reloadCourses();
      await loadCourseData();
      
      if (user?.email) {
        await loadUserProgress();
      }
      
      console.log('✅ Курсът е презареден успешно');
    } catch (error) {
      console.error('❌ Грешка при презареждане на курса:', error);
      setError('Грешка при презареждане на курса');
    } finally {
      setRefreshing(false);
    }
  };

  const handleContentSelection = (index) => {
    const content = getCourseContent(course);
    const selectedContent = content[index];
    
    console.log(`🎬 Избиране на съдържание ${index + 1}: ${selectedContent.title}`);
    setSelectedContentIndex(index);

    // Ако е видео, регистрираме го като стартирано
    if (selectedContent.type === CONTENT_TYPES.VIDEO && user?.email) {
      handleVideoStart(selectedContent);
    }
  };

  const handleVideoStart = async (video) => {
    if (!user?.email || !video) return;
    
    try {
      console.log(`▶️ Стартиране на видео: ${video.title}`);
      const result = await startVideo(user.email, courseId, video.id);
      
      if (result.success) {
        console.log('✅ Видеото е регистрирано като стартирано');
      }
    } catch (error) {
      console.error('❌ Грешка при стартиране на видео:', error);
    }
  };

  const markVideoAsCompleted = async (contentIndex) => {
    const content = getCourseContent(course);
    const selectedContent = content[contentIndex];
    
    if (!user?.email || !selectedContent || selectedContent.type !== CONTENT_TYPES.VIDEO) return;
    
    try {
      console.log(`✅ Маркиране на видео като завършено: ${selectedContent.title}`);
      const result = await completeVideo(user.email, courseId, selectedContent.id);
      
      if (result.success) {
        setCompletedContent(prev => {
          const newSet = new Set([...prev, selectedContent.id]);
          console.log('📊 Обновени завършени елементи:', Array.from(newSet));
          return newSet;
        });
        
        // Презареждаме прогреса
        const progressResult = await getCourseProgress(user.email, courseId);
        if (progressResult.success) {
          setCourseProgress(progressResult.data);
        }
        
        console.log(`🎉 Видео "${selectedContent.title}" успешно маркирано като завършено!`);
      }
    } catch (error) {
      console.error('❌ Грешка при маркиране на видео:', error);
    }
  };

  const markAssignmentAsCompleted = async (assignmentId) => {
    try {
      console.log(`✅ Маркиране на задача като завършена: ${assignmentId}`);
      
      // За задачи използваме същата функция, но ще трябва да адаптираме backend-а
      const result = await completeVideo(user.email, courseId, assignmentId);
      
      if (result.success) {
        setCompletedContent(prev => {
          const newSet = new Set([...prev, assignmentId]);
          return newSet;
        });
        
        // Презареждаме прогреса
        const progressResult = await getCourseProgress(user.email, courseId);
        if (progressResult.success) {
          setCourseProgress(progressResult.data);
        }
        
        console.log(`🎉 Задача успешно маркирана като завършена!`);
      }
    } catch (error) {
      console.error('❌ Грешка при маркиране на задача:', error);
    }
  };

  const isContentCompleted = (content) => {
    return completedContent.has(content.id);
  };

  const getProgress = () => {
    if (courseProgress) {
      return courseProgress.progressPercentage || 0;
    }
    const content = getCourseContent(course);
    if (content.length === 0) return 0;
    return (completedContent.size / content.length) * 100;
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

  const canProceedToNext = () => {
    const content = getCourseContent(course);
    const currentContent = content[selectedContentIndex];
    return isContentCompleted(currentContent);
  };

  // Проверяваме достъпа
  if (!isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Зареждане на курса</h3>
          <p className="text-gray-600">Моля изчакайте, докато заредим курса и вашия прогрес...</p>
          {enrolling && (
            <p className="text-blue-600 mt-2">Записване в курса...</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Грешка при зареждане</h3>
          <p className="text-gray-600 mb-6">{error || 'Курсът не е намерен'}</p>
          <div className="space-y-3">
            <button
              onClick={handleRefreshCourse}
              disabled={refreshing}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center mx-auto"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Презарежда...' : 'Опитай отново'}
            </button>
            <Link
              to="/courses"
              className="block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Обратно към курсовете
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccessToCourse(courseId)) {
    return <Navigate to="/courses" replace />;
  }

  const content = getCourseContent(course);
  const selectedContent = content[selectedContentIndex];
  const progress = getProgress();
  const isLastContent = selectedContentIndex === content.length - 1;
  const isCourseCompleted = content.length > 0 && completedContent.size === content.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Начало
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">
                Курсове
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">{course.title}</span>
            </div>
            
            <button
              onClick={handleRefreshCourse}
              disabled={refreshing}
              className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm"
              title="Презареди курса"
            >
              <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Презарежда...' : 'Обнови'}
            </button>
          </div>
        </div>
      </div>

      {/* Course Header */}
      <div className={`bg-gradient-to-r ${course.color} text-white py-12`}>
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="flex items-center justify-between mb-6">
            <Link to="/courses" className="flex items-center text-white hover:text-blue-100 transition-colors">
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
                  <Video size={20} className="mr-2" />
                  {content.filter(c => c.type === CONTENT_TYPES.VIDEO).length} видеа
                </div>
                <div className="flex items-center">
                  <FileText size={20} className="mr-2" />
                  {content.filter(c => c.type === CONTENT_TYPES.ASSIGNMENT).length} задачи
                </div>
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  {course.estimatedHours || 1} часа
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
                  {completedContent.size} от {content.length} елемента завършени
                </p>
                
                {/* Статистики */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm border-t border-white border-opacity-20 pt-4">
                  <div>
                    <div className="font-semibold flex items-center justify-center">
                      <Target size={16} className="mr-1" />
                      {content.length}
                    </div>
                    <div className="text-white text-opacity-70">Общо елементи</div>
                  </div>
                  <div>
                    <div className="font-semibold flex items-center justify-center">
                      <Clock size={16} className="mr-1" />
                      {course.estimatedHours || 1}ч
                    </div>
                    <div className="text-white text-opacity-70">Време</div>
                  </div>
                </div>
                
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
          {content.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <PlayCircle className="text-gray-400 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Няма съдържание в този курс
              </h3>
              <p className="text-gray-600 mb-6">
                Курсът все още не съдържа учебни материали
              </p>
              <button
                onClick={handleRefreshCourse}
                disabled={refreshing}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center mx-auto"
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Презарежда...' : 'Провери за обновления'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Content Display */}
              <div className="lg:col-span-3">
                {selectedContent ? (
                  <div className="space-y-6">
                    {/* Video Content */}
                    {selectedContent.type === CONTENT_TYPES.VIDEO && (
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <VideoPlayer
                          videoUrl={selectedContent.url}
                          title={selectedContent.title}
                          autoplay={false}
                        />
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {selectedContent.title}
                              </h2>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Video size={16} className="mr-1" />
                                  Видео лекция {selectedContentIndex + 1}
                                </span>
                                <span className="flex items-center">
                                  <Clock size={16} className="mr-1" />
                                  {selectedContent.duration || '0:00'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {isContentCompleted(selectedContent) ? (
                                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-full">
                                  <CheckCircle size={16} className="mr-1" />
                                  <span className="text-sm font-medium">Завършено</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => markVideoAsCompleted(selectedContentIndex)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                  Маркирай като завършено
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {selectedContent.description && (
                            <p className="text-gray-700 leading-relaxed">
                              {selectedContent.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assignment Content */}
                    {selectedContent.type === CONTENT_TYPES.ASSIGNMENT && (
                      <StudentAssignmentViewer
                        assignment={selectedContent}
                        isCompleted={isContentCompleted(selectedContent)}
                        onMarkComplete={markAssignmentAsCompleted}
                        showFullContent={true}
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <PlayCircle className="text-gray-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Изберете съдържание
                    </h3>
                    <p className="text-gray-600">
                      Кликнете върху елемент от списъка за да започнете
                    </p>
                  </div>
                )}
              </div>

              {/* Content List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <BookOpen className="mr-2" size={20} />
                      Съдържание на курса
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {completedContent.size} от {content.length} завършени
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {content.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleContentSelection(index)}
                        className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                          selectedContentIndex === index 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all duration-200 ${
                            isContentCompleted(item) 
                              ? 'bg-green-500 text-white shadow-md' 
                              : selectedContentIndex === index
                                ? item.type === CONTENT_TYPES.VIDEO ? 'bg-blue-500 text-white shadow-md' : 'bg-green-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isContentCompleted(item) ? (
                              <CheckCircle size={16} />
                            ) : item.type === CONTENT_TYPES.VIDEO ? (
                              <Play size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm leading-tight ${
                              selectedContentIndex === index ? 'text-blue-600' : 'text-gray-800'
                            }`}>
                              {item.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">
                                {item.type === CONTENT_TYPES.VIDEO 
                                  ? `Видео • ${item.duration || '0:00'}`
                                  : `Задача • ${item.estimatedTime || '30 мин'}`
                                }
                              </span>
                              {isContentCompleted(item) && (
                                <span className="text-xs text-green-600 font-medium">
                                  Готово ✓
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
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
                  {/* Previous Content */}
                  {selectedContentIndex > 0 && (
                    <button
                      onClick={() => setSelectedContentIndex(selectedContentIndex - 1)}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Предишно съдържание
                    </button>
                  )}
                  
                  {/* Next Content */}
                  {!isLastContent && (
                    <button
                      onClick={() => setSelectedContentIndex(selectedContentIndex + 1)}
                      disabled={!canProceedToNext()}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        canProceedToNext()
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-70'
                      }`}
                      title={!canProceedToNext() ? 'Завършете текущото съдържание за да продължите' : 'Следващо съдържание'}
                    >
                      {canProceedToNext() ? (
                        <>
                          Следващо съдържание
                          <ArrowRight size={16} className="ml-2" />
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
                  {isLastContent && isContentCompleted(selectedContent) && isCourseCompleted && (
                    <div className="text-center p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                      <Award className="mx-auto mb-3 text-green-600" size={48} />
                      <h3 className="font-bold text-green-800 text-lg mb-2">
                        Курсът е завършен! 🏆
                      </h3>
                      <p className="text-green-700 text-sm mb-3">
                        Поздравления! Успешно завършихте всички {content.length} елемента от курса.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-600 mb-4">
                        <div>
                          <div className="font-semibold">
                            {content.filter(c => c.type === CONTENT_TYPES.VIDEO).length}
                          </div>
                          <div>Видеа</div>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {content.filter(c => c.type === CONTENT_TYPES.ASSIGNMENT).length}
                          </div>
                          <div>Задачи</div>
                        </div>
                      </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCourseDetailPage;