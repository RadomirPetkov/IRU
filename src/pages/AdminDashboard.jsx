// src/pages/AdminDashboard.jsx - Fixed imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  Eye,
  Settings,
  Plus,
  Minus,
  ArrowLeft,
  BarChart3,
  Activity,
  AlertCircle,
  Video,
  X
} from 'lucide-react';
import {
  getAdminUsersList,
  getUserDetailedStats,
  addCourseAccessToUser,
  removeCourseAccessFromUser,
  ROLES,
  ROLE_DEFINITIONS
} from '../services/userService';
import { courses, getCoursesStats, reloadCourses } from '../data/coursesData';
import AdminUserCreation from '../components/AdminUserCreation';
import EnhancedCourseManagement from '../components/CourseManagement';

const AdminDashboard = () => {
  const { isAuthenticated, hasPermission, user, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [coursesStats, setCoursesStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadDashboardData();
    }
  }, [isAuthenticated, user?.email]);

  // Проверка за админ права
  if (!isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  if (!hasPermission || !hasPermission('view_analytics')) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 max-w-[1500px] py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Няма достъп</h2>
            <p className="text-gray-600 mb-6">
              Нямате права за достъп до административния панел
            </p>
            <Link 
              to="/courses" 
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Обратно към курсовете
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Зареждаме потребители
      const usersResult = await getAdminUsersList(user?.email);
      if (usersResult.success) {
        setUsers(usersResult.data);
      } else {
        setError(usersResult.error);
      }

      // Зареждаме курсове
      const coursesResult = await courses();
      setCoursesData(Array.isArray(coursesResult) ? coursesResult : []);

      // Зареждаме статистики за курсове
      const statsResult = await getCoursesStats();
      setCoursesStats(statsResult);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async (userEmail) => {
    setStatsLoading(true);
    try {
      const result = await getUserDetailedStats(userEmail, user?.email);
      if (result.success) {
        setUserStats(result.data);
      } else {
        setUserStats(null);
      }
    } catch (error) {
      setUserStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
    loadUserStats(userData.email);
  };

  const handleAddCourse = async (userEmail, courseId) => {
    try {
      const result = await addCourseAccessToUser(user?.email, userEmail, courseId);
      if (result.success) {
        await loadDashboardData();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Грешка при добавяне на достъп:', error);
    }
  };

  const handleRemoveCourse = async (userEmail, courseId) => {
    try {
      const result = await removeCourseAccessFromUser(user?.email, userEmail, courseId);
      if (result.success) {
        await loadDashboardData();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Грешка при премахване на достъп:', error);
    }
  };

  const handleRefreshCourses = async () => {
    try {
      console.log('🔄 Презареждане на курсове...');
      const refreshedCourses = await reloadCourses();
      setCoursesData(Array.isArray(refreshedCourses) ? refreshedCourses : []);
      
      const statsResult = await getCoursesStats();
      setCoursesStats(statsResult);
      
      console.log('✅ Курсовете са презаредени');
    } catch (error) {
      console.error('❌ Грешка при презареждане на курсове:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Неизвестно';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOverallStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return { totalUsers, activeUsers, roleStats };
  };

  const overallStats = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане на администраторския панел...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/courses" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Обратно към курсовете
            </Link>
            <div className="flex items-center space-x-2">
              <Settings size={20} className="text-gray-600" />
              <span className="text-gray-800 font-medium">Административен панел</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Административен панел</h1>
              <p className="text-xl text-indigo-100">Управление на потребители, курсове и статистики</p>
            </div>
            
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center shadow-lg transform hover:scale-105"
            >
              <Plus size={20} className="mr-2" />
              Създай потребител
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="inline mr-2" size={18} />
              Общ преглед
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Потребители ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'courses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="inline mr-2" size={18} />
              Курсове ({coursesData.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-[1500px]">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{overallStats.totalUsers}</h3>
                      <p className="text-gray-600">Общо потребители</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-3 mr-4">
                      <Activity className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{overallStats.activeUsers}</h3>
                      <p className="text-gray-600">Активни потребители</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <BookOpen className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{coursesStats?.totalCourses || 0}</h3>
                      <p className="text-gray-600">Налични курсове</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full p-3 mr-4">
                      <Video className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{coursesStats?.totalVideos || 0}</h3>
                      <p className="text-gray-600">Общо видеа</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Последни потребители</h3>
                  <div className="space-y-4">
                    {users.slice(0, 5).map(user => (
                      <div key={user.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{user.displayName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.roleInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          {user.roleInfo?.name || 'Потребител'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Статистики курсове</h3>
                    <button
                      onClick={handleRefreshCourses}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Activity size={16} className="mr-1" />
                      Презареди
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Общо часове съдържание:</span>
                      <span className="font-semibold">{coursesStats?.totalHours || 0}ч</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Средно видеа на курс:</span>
                      <span className="font-semibold">{coursesStats?.averageVideosPerCourse || 0}</span>
                    </div>
                    <div className="space-y-2">
                      {coursesStats?.coursesByLevel && Object.entries(coursesStats.coursesByLevel).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <span className="text-gray-600">{level.replace('level', 'Ниво ')}:</span>
                          <span className="font-semibold">{count} курса</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Users List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Users className="mr-2" size={24} />
                      Потребители ({users.length})
                    </h2>
                  </div>
                  
                  {users.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="text-gray-400 mx-auto mb-4" size={48} />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Няма потребители
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Все още няма създадени потребители в системата.
                      </p>
                      <button
                        onClick={() => setShowCreateUser(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Създай първия потребител
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {users.map((userData) => {
                        const roleInfo = ROLE_DEFINITIONS[userData.role] || ROLE_DEFINITIONS[ROLES.GUEST];
                        return (
                          <div
                            key={userData.email}
                            onClick={() => handleUserSelect(userData)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedUser?.email === userData.email ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800">{userData.displayName}</h3>
                                <p className="text-sm text-gray-600">{userData.email}</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} mt-1`}>
                                  {roleInfo.name}
                                </span>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>{userData.permissions?.courses?.length || 0} курса</div>
                                <div className={`w-2 h-2 rounded-full mt-1 ml-auto ${userData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="lg:col-span-2">
                {selectedUser ? (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{selectedUser.displayName}</h2>
                          <p className="text-gray-600">{selectedUser.email}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedUser.roleInfo?.color} mt-2`}>
                            {selectedUser.roleInfo?.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Регистрация:</div>
                          <div className="font-medium">{formatDate(selectedUser.joinDate)}</div>
                          <div className="text-sm text-gray-500 mt-2">Последен вход:</div>
                          <div className="font-medium">{formatDate(selectedUser.lastLogin)}</div>
                        </div>
                      </div>

                      {/* Course Access Management */}
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Управление на достъп до курсове</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {coursesData.map(course => {
                            const hasAccess = selectedUser.permissions?.courses?.includes(course.id);
                            return (
                              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 bg-gradient-to-r ${course.color} rounded-full flex items-center justify-center text-white mr-3`}>
                                    {course.icon}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{course.title}</div>
                                    <div className="text-xs text-gray-500">Ниво {course.level} • {course.videos?.length || 0} видеа</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {hasAccess ? (
                                    <button
                                      onClick={() => handleRemoveCourse(selectedUser.email, course.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Премахни достъп"
                                    >
                                      <Minus size={16} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAddCourse(selectedUser.email, course.id)}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Добави достъп"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  )}
                                  <div className={`w-3 h-3 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* User Statistics */}
                    {statsLoading ? (
                      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Зареждане на статистики...</p>
                      </div>
                    ) : userStats ? (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <TrendingUp className="mr-2" size={24} />
                          Статистики за активност
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{userStats.summary?.totalTimeSpent || 0}</div>
                            <div className="text-sm text-blue-800">Общо минути</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{Math.round(userStats.summary?.completionRate || 0)}%</div>
                            <div className="text-sm text-green-800">Завършени видеа</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{userStats.totalSessions}</div>
                            <div className="text-sm text-purple-800">Сесии</div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4">Последна активност</h4>
                          <div className="space-y-2">
                            {userStats.sessions?.slice(0, 5).map((session, index) => (
                              <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <Calendar className="text-gray-400 mr-2" size={16} />
                                  <span className="text-sm">{formatDate(session.loginAt)}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="mr-1" size={14} />
                                  {session.duration || 0} мин
                                </div>
                              </div>
                            )) || []}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <Eye className="text-gray-400 mx-auto mb-4" size={48} />
                        <p className="text-gray-600">Няма статистики за този потребител</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <Users className="text-gray-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Изберете потребител</h3>
                    <p className="text-gray-600">Кликнете върху потребител от списъка за преглед на детайли</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Управление на курсове</h2>
                  <p className="text-gray-600">Създавайте, редактирайте и управлявайте курсове и видеа</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefreshCourses}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Activity size={16} className="mr-1" />
                    Презареди данните
                  </button>
                  <div className="text-sm text-gray-500">
                    Последно обновяване: {coursesStats?.lastUpdated ? new Date(coursesStats.lastUpdated).toLocaleTimeString('bg-BG') : 'Неизвестно'}
                  </div>
                </div>
              </div>

              {/* Course Management Component */}
              <EnhancedCourseManagement adminEmail={user?.email} />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <AdminUserCreation 
          adminEmail={user?.email}
          onUserCreated={(result) => {
            loadDashboardData();
          }}
          onClose={() => setShowCreateUser(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;



