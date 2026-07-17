// src/pages/AdminDashboard.jsx - Fixed imports
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
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
  X,
  FileText,
  Music,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import {
  getAdminUsersList,
  getUserDetailedStats,
  addCourseAccessToUser,
  removeCourseAccessFromUser,
  adminUpdateUserInfo,
  adminAddActivity,
  ROLES,
  ROLE_DEFINITIONS,
} from "../services/userService";
import { courses, getCoursesStats, reloadCourses } from "../data/coursesData";
import AdminUserCreation from "../components/AdminUserCreation";
import EnhancedCourseManagement from "../components/CourseManagement";
import { getReportData } from "../firebase/reports";
import { generateActivityReport } from "../utils/reportGenerator";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", joinDate: "", joinTime: "00:00", lastLoginDate: "", lastLoginTime: "00:00" });
  const [editSaving, setEditSaving] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ date: "", time: "00:00", durationMinutes: "", description: "", coursesAccessed: [] });
  const [activitySaving, setActivitySaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadDashboardData();
    }
  }, [isAuthenticated, user?.email]);

  // Проверка за админ права
  if (!isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  if (!hasPermission || !hasPermission("view_analytics")) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 max-w-[1500px] py-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Няма достъп
            </h2>
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
    setIsEditingUser(false);
    setShowActivityForm(false);
    const ts = userData.joinDate;
    let joinDateStr = "";
    let joinTimeStr = "00:00";
    if (ts) {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      joinDateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      joinTimeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    const ll = userData.lastLogin;
    let lastLoginDateStr = "";
    let lastLoginTimeStr = "00:00";
    if (ll) {
      const d = ll.toDate ? ll.toDate() : new Date(ll);
      lastLoginDateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      lastLoginTimeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    setEditForm({ displayName: userData.displayName || "", joinDate: joinDateStr, joinTime: joinTimeStr, lastLoginDate: lastLoginDateStr, lastLoginTime: lastLoginTimeStr });
    setActivityForm({ date: "", durationMinutes: "", description: "", coursesAccessed: [] });
  };

  const handleSaveUserInfo = async () => {
    setEditSaving(true);
    const parseDMY = (str) => { const [d, m, y] = str.split("/"); return `${y}-${m}-${d}`; };
    const joinDate = /^\d{2}\/\d{2}\/\d{4}$/.test(editForm.joinDate) ? new Date(`${parseDMY(editForm.joinDate)}T${editForm.joinTime || "00:00"}`) : undefined;
    const lastLogin = /^\d{2}\/\d{2}\/\d{4}$/.test(editForm.lastLoginDate) ? new Date(`${parseDMY(editForm.lastLoginDate)}T${editForm.lastLoginTime || "00:00"}`) : undefined;
    const result = await adminUpdateUserInfo(user?.email, selectedUser.email, {
      displayName: editForm.displayName,
      joinDate,
      lastLogin,
    });
    if (result.success) {
      const updated = { ...selectedUser, displayName: editForm.displayName, joinDate: joinDate || selectedUser.joinDate, lastLogin: lastLogin || selectedUser.lastLogin };
      setSelectedUser(updated);
      setUsers((prev) => prev.map((u) => u.email === updated.email ? { ...u, displayName: updated.displayName, joinDate: updated.joinDate } : u));
      setIsEditingUser(false);
    }
    setEditSaving(false);
  };

  const handleAddActivity = async () => {
    if (!activityForm.date) return;
    setActivitySaving(true);
    const result = await adminAddActivity(user?.email, selectedUser.email, {
      date: new Date(`${activityForm.date}T${activityForm.time || "00:00"}`),
      durationMinutes: Number(activityForm.durationMinutes) || 0,
      description: activityForm.description,
      coursesAccessed: activityForm.coursesAccessed,
    });
    if (result.success) {
      setShowActivityForm(false);
      setActivityForm({ date: "", time: "00:00", durationMinutes: "", description: "", coursesAccessed: [] });
      loadUserStats(selectedUser.email);
    }
    setActivitySaving(false);
  };

  const handleAddCourse = async (userEmail, courseId) => {
    try {
      const result = await addCourseAccessToUser(
        user?.email,
        userEmail,
        courseId
      );
      if (result.success) {
        await loadDashboardData();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find((u) => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Грешка при добавяне на достъп:", error);
    }
  };

  const handleRemoveCourse = async (userEmail, courseId) => {
    try {
      const result = await removeCourseAccessFromUser(
        user?.email,
        userEmail,
        courseId
      );
      if (result.success) {
        await loadDashboardData();
        if (selectedUser && selectedUser.email === userEmail) {
          const updatedUser = users.find((u) => u.email === userEmail);
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Грешка при премахване на достъп:", error);
    }
  };

  const handleRefreshCourses = async () => {
    try {
      console.log("🔄 Презареждане на курсове...");
      const refreshedCourses = await reloadCourses();
      setCoursesData(Array.isArray(refreshedCourses) ? refreshedCourses : []);

      const statsResult = await getCoursesStats();
      setCoursesStats(statsResult);

      console.log("✅ Курсовете са презаредени");
    } catch (error) {
      console.error("❌ Грешка при презареждане на курсове:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Неизвестно";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOverallStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
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
          <p className="text-gray-600">
            Зареждане на администраторския панел...
          </p>
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
              <span className="text-gray-800 font-medium">
                Административен панел
              </span>
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
              <p className="text-xl text-indigo-100">
                Управление на потребители, курсове и статистики
              </p>
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
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart3 className="inline mr-2" size={18} />
              Общ преглед
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Потребители ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "courses"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="inline mr-2" size={18} />
              Курсове ({coursesData.length})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reports"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="inline mr-2" size={18} />
              Справки
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-[1500px]">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-3 mr-4">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {overallStats.totalUsers}
                      </h3>
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
                      <h3 className="text-2xl font-bold text-gray-800">
                        {overallStats.activeUsers}
                      </h3>
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
                      <h3 className="text-2xl font-bold text-gray-800">
                        {coursesStats?.totalCourses || 0}
                      </h3>
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
                      <h3 className="text-2xl font-bold text-gray-800">
                        {coursesStats?.totalVideos || 0}
                      </h3>
                      <p className="text-gray-600">Общо видеа</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Последни потребители
                  </h3>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.email}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.roleInfo?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.roleInfo?.name || "Потребител"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      Статистики курсове
                    </h3>
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
                      <span className="text-gray-600">
                        Общо часове съдържание:
                      </span>
                      <span className="font-semibold">
                        {coursesStats?.totalHours || 0}ч
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Средно видеа на курс:
                      </span>
                      <span className="font-semibold">
                        {coursesStats?.averageVideosPerCourse || 0}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {coursesStats?.coursesByLevel &&
                        Object.entries(coursesStats.coursesByLevel).map(
                          ([level, count]) => (
                            <div
                              key={level}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-600">
                                {level.replace("level", "Ниво ")}:
                              </span>
                              <span className="font-semibold">
                                {count} курса
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-3">
                      <Users className="mr-2" size={24} />
                      Потребители ({users.length})
                    </h2>
                    <input
                      type="text"
                      placeholder="Търси по име или имейл..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    <div className="max-h-[640px] overflow-y-auto">
                      {users
                        .filter((u) => {
                          const q = userSearch.toLowerCase();
                          return (
                            u.displayName?.toLowerCase().includes(q) ||
                            u.email?.toLowerCase().includes(q)
                          );
                        })
                        .map((userData) => {
                        const roleInfo =
                          ROLE_DEFINITIONS[userData.role] ||
                          ROLE_DEFINITIONS[ROLES.GUEST];
                        return (
                          <div
                            key={userData.email}
                            onClick={() => handleUserSelect(userData)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedUser?.email === userData.email
                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800">
                                  {userData.displayName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {userData.email}
                                </p>
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} mt-1`}
                                >
                                  {roleInfo.name}
                                </span>
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>
                                  {userData.permissions?.courses?.length || 0}{" "}
                                  курса
                                </div>
                                <div
                                  className={`w-2 h-2 rounded-full mt-1 ml-auto ${
                                    userData.isActive
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
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
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          {isEditingUser ? (
                            <div className="space-y-3 mr-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Имена</label>
                                <input
                                  type="text"
                                  value={editForm.displayName}
                                  onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Дата на регистрация</label>
                                <input
                                  type="text"
                                  value={editForm.joinDate}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9/]/g, "").slice(0, 10);
                                    setEditForm((f) => ({ ...f, joinDate: val }));
                                  }}
                                  placeholder="дд/мм/гггг"
                                  maxLength={10}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Час на регистрация (ЧЧ:ММ)</label>
                                <input
                                  type="text"
                                  value={editForm.joinTime}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5);
                                    setEditForm((f) => ({ ...f, joinTime: val }));
                                  }}
                                  placeholder="14:30"
                                  maxLength={5}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Последен вход — дата</label>
                                <input
                                  type="text"
                                  value={editForm.lastLoginDate}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9/]/g, "").slice(0, 10);
                                    setEditForm((f) => ({ ...f, lastLoginDate: val }));
                                  }}
                                  placeholder="дд/мм/гггг"
                                  maxLength={10}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Последен вход — час (ЧЧ:ММ)</label>
                                <input
                                  type="text"
                                  value={editForm.lastLoginTime}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5);
                                    setEditForm((f) => ({ ...f, lastLoginTime: val }));
                                  }}
                                  placeholder="14:30"
                                  maxLength={5}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <p className="text-xs text-gray-500">{selectedUser.email}</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedUser.roleInfo?.color}`}>
                                {selectedUser.roleInfo?.name}
                              </span>
                            </div>
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold text-gray-800">
                                {selectedUser.displayName}
                              </h2>
                              <p className="text-gray-600">{selectedUser.email}</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedUser.roleInfo?.color} mt-2`}>
                                {selectedUser.roleInfo?.name}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isEditingUser ? (
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveUserInfo}
                                disabled={editSaving}
                                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                              >
                                {editSaving ? "Запазване..." : "Запази"}
                              </button>
                              <button
                                onClick={() => setIsEditingUser(false)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Отказ
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingUser(true)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Редактирай
                            </button>
                          )}
                          {!isEditingUser && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Регистрация:</div>
                              <div className="font-medium">{formatDate(selectedUser.joinDate)}</div>
                              <div className="text-sm text-gray-500 mt-2">Последен вход:</div>
                              <div className="font-medium">{formatDate(selectedUser.lastLogin)}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course Access Management */}
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-4">
                          Управление на достъп до курсове
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {coursesData.map((course) => {
                            const hasAccess =
                              selectedUser.permissions?.courses?.includes(
                                course.id
                              );
                            return (
                              <div
                                key={course.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-10 h-10 bg-gradient-to-r ${course.color} rounded-full flex items-center justify-center text-white mr-3`}
                                  >
                                    {course.icon}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {course.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Ниво {course.level} •{" "}
                                      {course.content?.filter(
                                        (c) => c.type === "video"
                                      ).length ||
                                        course.videos?.length ||
                                        0}{" "}
                                      видеа
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {hasAccess ? (
                                    <button
                                      onClick={() =>
                                        handleRemoveCourse(
                                          selectedUser.email,
                                          course.id
                                        )
                                      }
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Премахни достъп"
                                    >
                                      <Minus size={16} />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleAddCourse(
                                          selectedUser.email,
                                          course.id
                                        )
                                      }
                                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Добави достъп"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  )}
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      hasAccess ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                  ></div>
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
                        <p className="text-gray-600">
                          Зареждане на статистики...
                        </p>
                      </div>
                    ) : (
                      <UserActivityStats
                        userStats={userStats}
                        formatDate={formatDate}
                        showActivityForm={showActivityForm}
                        setShowActivityForm={setShowActivityForm}
                        activityForm={activityForm}
                        setActivityForm={setActivityForm}
                        activitySaving={activitySaving}
                        onAddActivity={handleAddActivity}
                        coursesData={coursesData}
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <Users className="text-gray-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Изберете потребител
                    </h3>
                    <p className="text-gray-600">
                      Кликнете върху потребител от списъка за преглед на детайли
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Управление на курсове
                  </h2>
                  <p className="text-gray-600">
                    Създавайте, редактирайте и управлявайте курсове и видеа
                  </p>
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
                    Последно обновяване:{" "}
                    {coursesStats?.lastUpdated
                      ? new Date(coursesStats.lastUpdated).toLocaleTimeString(
                          "bg-BG"
                        )
                      : "Неизвестно"}
                  </div>
                </div>
              </div>

              {/* Course Management Component */}
              <EnhancedCourseManagement adminEmail={user?.email} />
            </div>
          )}

          {activeTab === "reports" && (
            <ReportsTab users={users} />
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
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

const ActivityForm = ({ activityForm, setActivityForm, activitySaving, onAddActivity, onClose, coursesData }) => (
  <div className="space-y-3 border-t pt-4 mb-6">
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Дата *</label>
        <input
          type="date"
          value={activityForm.date}
          onChange={(e) => setActivityForm((f) => ({ ...f, date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Час (ЧЧ:ММ)</label>
        <input
          type="text"
          value={activityForm.time}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5);
            setActivityForm((f) => ({ ...f, time: val }));
          }}
          placeholder="14:30"
          maxLength={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-1">Продължителност (минути)</label>
      <input
        type="number"
        min="0"
        value={activityForm.durationMinutes}
        onChange={(e) => setActivityForm((f) => ({ ...f, durationMinutes: e.target.value }))}
        placeholder="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-1">Бележка</label>
      <input
        type="text"
        value={activityForm.description}
        onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Описание на активността..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-gray-500 mb-2">Курсове (по избор)</label>
      <div className="flex flex-wrap gap-2">
        {coursesData.map((course) => {
          const selected = activityForm.coursesAccessed.includes(course.id);
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setActivityForm((f) => ({
                ...f,
                coursesAccessed: selected
                  ? f.coursesAccessed.filter((id) => id !== course.id)
                  : [...f.coursesAccessed, course.id],
              }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {course.title}
            </button>
          );
        })}
      </div>
    </div>
    <div className="flex gap-2 pt-1">
      <button
        onClick={onAddActivity}
        disabled={activitySaving || !activityForm.date || !/^\d{2}:\d{2}$/.test(activityForm.time)}
        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {activitySaving ? "Запазване..." : "Добави"}
      </button>
      <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
        Отказ
      </button>
    </div>
  </div>
);

// Компонент за статистики на активността на потребител
const UserActivityStats = ({ userStats, formatDate, showActivityForm, setShowActivityForm, activityForm, setActivityForm, activitySaving, onAddActivity, coursesData }) => {
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

  // Изчисляваме общите маркирани материали
  const getTotalCompletedMaterials = () => {
    let videos = 0;
    let files = 0;
    let audio = 0;

    userStats.sessions?.forEach(session => {
      if (session.completedContent) {
        session.completedContent.forEach(item => {
          if (item.type === 'video') videos++;
          else if (item.type === 'audio') audio++;
          else if (item.type === 'file') files++;
        });
      }
    });

    return { videos, files, audio, total: videos + files + audio };
  };

  // Получаваме материалите за конкретна сесия
  const getSessionMaterials = (session) => {
    if (!session.completedContent || session.completedContent.length === 0) {
      return { videos: 0, files: 0, audio: 0, items: [] };
    }

    let videos = 0;
    let files = 0;
    let audio = 0;

    session.completedContent.forEach(item => {
      if (item.type === 'video') videos++;
      else if (item.type === 'audio') audio++;
      else if (item.type === 'file') files++;
    });

    return { 
      videos, 
      files, 
      audio, 
      total: videos + files + audio,
      items: session.completedContent 
    };
  };

  const totalMaterials = getTotalCompletedMaterials();
  const sessions = userStats.sessions || [];
  const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 5);

  if (!userStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="mr-2" size={24} />
            Статистики за активност
          </h3>
          <button
            onClick={() => setShowActivityForm((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            title="Добави активност"
          >
            <Plus size={16} />
          </button>
        </div>
        {showActivityForm && <ActivityForm activityForm={activityForm} setActivityForm={setActivityForm} activitySaving={activitySaving} onAddActivity={onAddActivity} onClose={() => setShowActivityForm(false)} coursesData={coursesData} />}
        {!showActivityForm && (
          <div className="text-center py-8">
            <Eye className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Няма статистики за този потребител</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Статистики за активност
        </h3>
        <button
          onClick={() => setShowActivityForm((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          title="Добави активност"
        >
          <Plus size={16} />
        </button>
      </div>
      {showActivityForm && <ActivityForm activityForm={activityForm} setActivityForm={setActivityForm} activitySaving={activitySaving} onAddActivity={onAddActivity} onClose={() => setShowActivityForm(false)} coursesData={coursesData} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {totalMaterials.videos}
          </div>
          <div className="text-sm text-blue-800 flex items-center justify-center">
            <Video size={14} className="mr-1" />
            Видеа
          </div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {totalMaterials.files}
          </div>
          <div className="text-sm text-orange-800 flex items-center justify-center">
            <FileText size={14} className="mr-1" />
            Файлове
          </div>
        </div>
        <div className="text-center p-4 bg-teal-50 rounded-lg">
          <div className="text-2xl font-bold text-teal-600">
            {totalMaterials.audio}
          </div>
          <div className="text-sm text-teal-800 flex items-center justify-center">
            <Music size={14} className="mr-1" />
            Аудио
          </div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {userStats.totalSessions || 0}
          </div>
          <div className="text-sm text-purple-800 flex items-center justify-center">
            <Activity size={14} className="mr-1" />
            Сесии
          </div>
        </div>
      </div>

      {/* Total Completed Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <span className="font-medium text-green-800">
              Общо прегледани материали: {totalMaterials.total}
            </span>
          </div>
          <div className="text-sm text-green-700">
            {totalMaterials.videos > 0 && `${totalMaterials.videos} видеа`}
            {totalMaterials.videos > 0 && (totalMaterials.files > 0 || totalMaterials.audio > 0) && ', '}
            {totalMaterials.files > 0 && `${totalMaterials.files} файла`}
            {totalMaterials.files > 0 && totalMaterials.audio > 0 && ', '}
            {totalMaterials.audio > 0 && `${totalMaterials.audio} аудио`}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">
            История на сесиите ({sessions.length})
          </h4>
          {sessions.length > 5 && (
            <button
              onClick={() => setShowAllSessions(!showAllSessions)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              {showAllSessions ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Покажи по-малко
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  Покажи всички ({sessions.length})
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {displayedSessions.map((session, index) => {
            const materials = getSessionMaterials(session);
            const isExpanded = expandedSession === (session.id || index);

            return (
              <div
                key={session.id || index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Session Header */}
                <div
                  onClick={() => setExpandedSession(isExpanded ? null : (session.id || index))}
                  className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 mr-2" size={16} />
                    <span className="text-sm font-medium">
                      {formatDate(session.loginAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Materials Summary */}
                    {materials.total > 0 ? (
                      <div className="flex items-center space-x-2 text-sm">
                        {materials.videos > 0 && (
                          <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            <Video size={12} className="mr-1" />
                            {materials.videos}
                          </span>
                        )}
                        {materials.files > 0 && (
                          <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                            <FileText size={12} className="mr-1" />
                            {materials.files}
                          </span>
                        )}
                        {materials.audio > 0 && (
                          <span className="flex items-center text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                            <Music size={12} className="mr-1" />
                            {materials.audio}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Няма прегледани</span>
                    )}
                    
                    {materials.total > 0 && (
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && materials.items.length > 0 && (
                  <div className="p-3 bg-white border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Прегледани материали:</p>
                    <div className="space-y-1">
                      {materials.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center text-sm text-gray-700 py-1"
                        >
                          {item.type === 'video' && <Video size={14} className="mr-2 text-blue-500" />}
                          {item.type === 'file' && <FileText size={14} className="mr-2 text-orange-500" />}
                          {item.type === 'audio' && <Music size={14} className="mr-2 text-teal-500" />}
                          <span className="flex-1">{item.title || 'Неизвестен материал'}</span>
                          {item.completedAt && (
                            <span className="text-xs text-gray-400">
                              {formatDate(item.completedAt)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto mb-2 text-gray-300" size={32} />
              <p>Няма записани сесии</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PROGRAMS = [
  'Базово ниво, ниво 1 и 2',
  'Средно ниво, ниво 3 и 4',
];

const ReportsTab = ({ users }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const toggleUser = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleGenerate = async () => {
    setReportError(null);

    if (!startDate || !endDate) {
      setReportError('Изберете начална и крайна дата.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setReportError('Началната дата не може да е след крайната.');
      return;
    }
    if (selectedEmails.length === 0) {
      setReportError('Изберете поне един потребител.');
      return;
    }

    setLoading(true);
    try {
      const sessionData = await getReportData(selectedEmails, start, end);

      const usersData = sessionData.map(({ email, loginsByDay }) => {
        const info = users.find(u => u.email === email);
        return {
          displayName: info?.displayName || email,
          email,
          loginsByDay,
        };
      });

      await generateActivityReport({ usersData, startDate: start, endDate: end, program });
    } catch (err) {
      setReportError('Грешка при генериране: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Справка за активност</h2>
        <p className="text-gray-600 mt-1">
          Генерира .docx файл с история на влизанията за избрани потребители в зададен период.
        </p>
      </div>

      {/* Period */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          <Calendar className="inline mr-2 text-indigo-500" size={18} />
          Период
        </h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm text-gray-500 mb-1">От</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">До</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {startDate && endDate && new Date(startDate) <= new Date(endDate) && (
            <span className="text-sm text-gray-500 pb-2">
              {Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1} дни
            </span>
          )}
        </div>
      </div>

      {/* Program */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          <BookOpen className="inline mr-2 text-indigo-500" size={18} />
          Програма
        </h3>
        <select
          value={program}
          onChange={e => setProgram(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {PROGRAMS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Users */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">
            <Users className="inline mr-2 text-indigo-500" size={18} />
            Потребители ({selectedEmails.length} избрани)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedEmails(users.map(u => u.email))}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Избери всички
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setSelectedEmails([])}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Изчисти
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {users.map(u => (
            <label
              key={u.email}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                selectedEmails.includes(u.email)
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedEmails.includes(u.email)}
                onChange={() => toggleUser(u.email)}
                className="accent-indigo-600"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{u.displayName}</div>
                <div className="text-xs text-gray-400 truncate">{u.email}</div>
              </div>
            </label>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-gray-400 col-span-3">Няма заредени потребители.</p>
          )}
        </div>
      </div>

      {/* Error */}
      {reportError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span className="text-sm">{reportError}</span>
        </div>
      )}

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
      >
        <FileText size={18} />
        {loading ? 'Генериране…' : 'Изтегли справка (.docx)'}
      </button>
    </div>
  );
};

export default AdminDashboard;