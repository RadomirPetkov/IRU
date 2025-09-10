// src/pages/AdminDashboard.jsx - Разширен с нови функционалности
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Calendar,
  Clock,
  Eye,
  Settings,
  Plus,
  Minus,
  ArrowLeft,
  BarChart3,
  Activity,
  UserPlus,
  X,
  Save,
  Mail,
  User,
  Key,
  Shield,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  getAdminUsersList,
  getUserDetailedStats,
  addCourseAccessToUser,
  removeCourseAccessFromUser,
  createNewUser,
  ROLES,
  ROLE_DEFINITIONS
} from '../services/userService';
import { courses } from '../data/coursesData';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [videoProgress, setVideoProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    displayName: '',
    role: ROLES.STUDENT,
    courses: []
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Проверка за админ права
  if (!isAuthenticated || !isAdmin()) {
    console.log('❌ Admin access denied. isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin());
    return <Navigate to="/courses" replace />;
  }

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAdminUsersList(user?.email);
      if (result.success) {
        setUsers(result.data);
        console.log('✅ Потребители заредени:', result.data.length);
      } else {
        console.error('⚠️ Грешка при зареждане на потребители:', result.error);
      }
    } catch (error) {
      console.error('⚠️ Грешка при зареждане на потребители:', error);
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
      console.error('⚠️ Грешка при зареждане на статистики:', result.error);
      setUserStats(null);
    }
  } catch (error) {
    console.error('⚠️ Грешка при зареждане на статистики:', error);
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
        await loadUsers();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
        console.log('✅ Достъпът е добавен успешно');
      } else {
        console.error('⚠️ Грешка при добавяне на достъп:', result.error);
      }
    } catch (error) {
      console.error('⚠️ Грешка при добавяне на достъп:', error);
    }
  };

  const handleRemoveCourse = async (userEmail, courseId) => {
    try {
      const result = await removeCourseAccessFromUser(user?.email, userEmail, courseId);
      if (result.success) {
        await loadUsers();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
        console.log('✅ Достъпът е премахнат успешно');
      } else {
        console.error('⚠️ Грешка при премахване на достъп:', result.error);
      }
    } catch (error) {
      console.error('⚠️ Грешка при премахване на достъп:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.displayName) {
      alert('Моля попълнете всички задължителни полета');
      return;
    }

    setCreateUserLoading(true);
    try {
      const result = await createNewUser(user?.email, newUserData);
      
      if (result.success) {
        console.log('✅ Нов потребител създаден:', newUserData.email);
        await loadUsers();
        setShowCreateUser(false);
        setNewUserData({
          email: '',
          displayName: '',
          role: ROLES.STUDENT,
          courses: []
        });
        alert(`Потребителят ${newUserData.email} е създаден успешно!\n\nВнимание: Трябва ръчно да се създаде в Firebase Authentication.`);
      } else {
        console.error('❌ Грешка при създаване на потребител:', result.error);
        alert('Грешка при създаване на потребител: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Грешка при създаване на потребител:', error);
      alert('Грешка при създаване на потребител: ' + error.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    const roleInfo = ROLE_DEFINITIONS[role];
    setNewUserData({
      ...newUserData,
      role,
      courses: roleInfo ? roleInfo.defaultCourses : []
    });
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

  const getVideoTitle = (videoId, courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 'Неизвестно видео';
    
    const video = course.videos.find(v => v.id === videoId);
    return video ? video.title : 'Неизвестно видео';
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Неизвестен курс';
  };

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

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen mt-64 bg-gray-50 pt-20">
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <UserPlus size={20} />
                <span>Създай потребител</span>
              </button>
              <div className="flex items-center space-x-2">
                <Settings size={20} className="text-gray-600" />
                <span className="text-gray-800 font-medium">Административен панел</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <h1 className="text-4xl font-bold mb-4">Административен панел</h1>
          <p className="text-xl text-indigo-100">Управление на потребители и статистики</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-[1500px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <h3 className="text-2xl font-bold text-gray-800">{courses.length}</h3>
                  <p className="text-gray-600">Налични курсове</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-3 mr-4">
                  <BarChart3 className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{overallStats.roleStats[ROLES.ADMIN] || 0}</h3>
                  <p className="text-gray-600">Администратори</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
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
                        {courses.map(course => {
                          const hasAccess = selectedUser.permissions?.courses?.includes(course.id);
                          return (
                            <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-r ${course.color} rounded-full flex items-center justify-center text-white mr-3`}>
                                  {course.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{course.title}</div>
                                  <div className="text-xs text-gray-500">Ниво {course.level}</div>
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
                    <div className="space-y-6">
                      {/* Basic Stats */}
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

                      {/* Video Progress Details */}
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <Play className="mr-2" size={24} />
                          Прогрес по видеата
                        </h3>
                        
                        {videoProgress.length > 0 ? (
                          <div className="space-y-3">
                            {videoProgress.map((video, index) => (
                              <div key={`${video.courseId}-${video.videoId}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800">
                                    {getVideoTitle(video.videoId, video.courseId)}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {getCourseTitle(video.courseId)}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Гледания: {video.watchCount}</span>
                                    <span>Първо гледане: {formatDate(video.watchedAt)}</span>
                                    {video.completedAt && (
                                      <span>Завършено: {formatDate(video.completedAt)}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {video.isCompleted ? (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle size={20} className="mr-1" />
                                      <span className="text-sm font-medium">Завършено</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-orange-600">
                                      <XCircle size={20} className="mr-1" />
                                      <span className="text-sm font-medium">В процес</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Play className="text-gray-400 mx-auto mb-4" size={48} />
                            <p className="text-gray-600">Няма прогрес по видеата</p>
                          </div>
                        )}
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
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-2 mr-3">
                  <UserPlus className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Създаване на потребител</h2>
              </div>
              <button
                onClick={() => setShowCreateUser(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Имейл адрес *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@domain.com"
                    required
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Име за показване *
                  </label>
                  <input
                    type="text"
                    value={newUserData.displayName}
                    onChange={(e) => setNewUserData({...newUserData, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Име на потребителя"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="inline w-4 h-4 mr-1" />
                    Роля
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {Object.entries(ROLES).map(([key, value]) => {
                      const roleInfo = ROLE_DEFINITIONS[value];
                      return (
                        <option key={value} value={value}>
                          {roleInfo.name}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {ROLE_DEFINITIONS[newUserData.role]?.permissions.join(', ')}
                  </p>
                </div>

                {/* Course Access */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="inline w-4 h-4 mr-1" />
                    Достъп до курсове
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {courses.map(course => (
                      <label key={course.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newUserData.courses.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUserData({
                                ...newUserData,
                                courses: [...newUserData.courses, course.id]
                              });
                            } else {
                              setNewUserData({
                                ...newUserData,
                                courses: newUserData.courses.filter(c => c !== course.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex items-center">
                          <div className={`w-6 h-6 bg-gradient-to-r ${course.color} rounded-full flex items-center justify-center text-white text-xs mr-2`}>
                            {course.icon}
                          </div>
                          <span className="text-sm">{course.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Key className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Важно!
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          След създаване на потребителя тук, трябва ръчно да се създаде акаунт в Firebase Authentication с същия имейл адрес.
                        </p>
                        <p className="mt-1">
                          Препоръчителна парола за демо: <code className="bg-yellow-100 px-1 rounded">user123</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={createUserLoading}
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={createUserLoading || !newUserData.email || !newUserData.displayName}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {createUserLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Създаване...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Създай потребител</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;