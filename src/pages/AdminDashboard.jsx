// src/pages/AdminDashboard.jsx - Debug версия
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
  AlertCircle
} from 'lucide-react';
import {
  getAdminUsersList,
  getUserDetailedStats,
  addCourseAccessToUser,
  removeCourseAccessFromUser,
  ROLES,
  ROLE_DEFINITIONS
} from '../services/userService';
import { courses } from '../data/coursesData';
import AdminUserCreation from '../components/AdminUserCreation';

const AdminDashboard = () => {
  const { isAuthenticated, hasPermission, user, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('🐛 Admin Dashboard Debug Info:');
    console.log('User:', user?.email);
    console.log('UserProfile:', userProfile);
    console.log('Has permission:', hasPermission);
    console.log('Is authenticated:', isAuthenticated);
    
    setDebugInfo({
      userEmail: user?.email,
      role: userProfile?.role,
      roleInfo: userProfile?.roleInfo?.name,
      permissions: userProfile?.roleInfo?.permissions,
      hasViewAnalytics: hasPermission ? hasPermission('view_analytics') : false
    });
  }, [user, userProfile, hasPermission, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadUsers();
    }
  }, [isAuthenticated, user?.email]);

  // Проверка за админ права с debug
  const checkAdminAccess = () => {
    console.log('🔐 Checking admin access...');
    console.log('Is authenticated:', isAuthenticated);
    console.log('Has permission function:', typeof hasPermission);
    console.log('User profile:', userProfile);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated');
      return false;
    }
    
    if (!hasPermission) {
      console.log('❌ No hasPermission function');
      return false;
    }
    
    const hasAnalytics = hasPermission('view_analytics');
    console.log('Has view_analytics permission:', hasAnalytics);
    
    return hasAnalytics;
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading users with admin email:', user?.email);
      
      // Debug: Опитваме се да заредим директно от Firestore
      const { getAllUsers } = await import('../firebase/firestore');
      const directResult = await getAllUsers();
      
      console.log('📊 Direct Firestore result:', directResult);
      
      if (directResult.success) {
        console.log('✅ Found users directly:', directResult.data.length);
        setUsers(directResult.data);
      } else {
        console.log('⚠️ No direct users found, trying service...');
        
        // Опитваме се през сервиса
        const result = await getAdminUsersList(user?.email);
        console.log('📊 Service result:', result);
        
        if (result.success) {
          setUsers(result.data);
          console.log('✅ Users loaded via service:', result.data.length);
        } else {
          setError(result.error);
          console.error('❌ Error loading users:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Exception loading users:', error);
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
        console.error('⚠ Грешка при зареждане на статистики:', result.error);
        setUserStats(null);
      }
    } catch (error) {
      console.error('⚠ Грешка при зареждане на статистики:', error);
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
        await loadUsers(); // Презареждаме списъка
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
        console.log('✅ Достъпът е добавен успешно');
      } else {
        console.error('⚠ Грешка при добавяне на достъп:', result.error);
      }
    } catch (error) {
      console.error('⚠ Грешка при добавяне на достъп:', error);
    }
  };

  const handleRemoveCourse = async (userEmail, courseId) => {
    try {
      const result = await removeCourseAccessFromUser(user?.email, userEmail, courseId);
      if (result.success) {
        await loadUsers(); // Презареждаме списъка
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find(u => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
        console.log('✅ Достъпът е премахнат успешно');
      } else {
        console.error('⚠ Грешка при премахване на достъп:', result.error);
      }
    } catch (error) {
      console.error('⚠ Грешка при премахване на достъп:', error);
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

  // Проверяваме достъпа
  if (!isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  if (!checkAdminAccess()) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 max-w-[1500px] py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Няма достъп</h2>
            <p className="text-gray-600 mb-6">
              Нямате права за достъп до административния панел
            </p>
            
            {/* Debug информация */}
            <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
              <h3 className="font-semibold mb-2">Debug информация:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            
            <Link 
              to="/courses" 
              className="inline-block mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Обратно към курсовете
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане на администраторския панел...</p>
          
          {/* Debug информация при зареждане */}
          <div className="mt-4 bg-gray-100 rounded-lg p-4 text-left text-sm max-w-md">
            <h3 className="font-semibold mb-2">Debug информация:</h3>
            <div className="text-xs">
              <div>Email: {user?.email}</div>
              <div>Role: {userProfile?.role}</div>
              <div>Loading: {loading ? 'да' : 'не'}</div>
            </div>
          </div>
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
              <p className="text-xl text-indigo-100">Управление на потребители и статистики</p>
              
              {/* Debug информация в header */}
              <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3 text-sm">
                <div>Потребители в базата: {users.length}</div>
                <div>Вашата роля: {userProfile?.roleInfo?.name}</div>
                <div>Email: {user?.email}</div>
                {error && <div className="text-red-300">Грешка: {error}</div>}
              </div>
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
                    
                    {/* Debug бутони */}
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <h4 className="font-semibold mb-2">Debug опции:</h4>
                      <button
                        onClick={loadUsers}
                        className="mr-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Презареди потребители
                      </button>
                      <button
                        onClick={() => {
                          console.log('🐛 Current state:', { users, loading, error });
                          console.log('🐛 User profile:', userProfile);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Покажи в конзолата
                      </button>
                    </div>
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
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <AdminUserCreation 
          adminEmail={user?.email}
          onUserCreated={(result) => {
            console.log('✅ Нов потребител създаден:', result);
            loadUsers(); // Презарежда списъка с потребители
          }}
          onClose={() => setShowCreateUser(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;