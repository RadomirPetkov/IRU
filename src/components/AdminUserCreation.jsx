// src/components/AdminUserCreation.jsx - Поправена версия
import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  UserPlus,
  Shield,
  BookOpen,
} from "lucide-react";
import {
  adminCreateUser,
  ROLES,
  ROLE_DEFINITIONS,
} from "../services/userService";
import { courses } from "../data/coursesData"; // Импортираме функцията

const AdminUserCreation = ({ adminEmail, onUserCreated, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    role: ROLES.STUDENT,
    courses: ROLE_DEFINITIONS[ROLES.STUDENT].defaultCourses,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Добавяме state за курсовете
  const [availableCourses, setAvailableCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Зареждаме курсовете при монтиране на компонента
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const coursesData = await courses(); // Извикваме функцията
      console.log('📚 Заредени курсове за AdminUserCreation:', coursesData);
      setAvailableCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('❌ Грешка при зареждане на курсове:', error);
      setAvailableCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Изчистваме грешката при промяна
    if (error) setError("");
    if (success) setSuccess("");

    // Автоматично задаване на курсове според ролята
    if (name === "role") {
      const roleInfo = ROLE_DEFINITIONS[value];
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        courses: roleInfo ? roleInfo.defaultCourses : [],
      }));
    }
  };

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return "Email и парола са задължителни";
    }

    if (formData.password.length < 6) {
      return "Паролата трябва да е поне 6 символа";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Паролите не съвпадат";
    }

    if (!formData.email.includes("@")) {
      return "Невалиден email адрес";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('🔄 Създаване на потребител с данни:', {
        email: formData.email,
        password: '***',
        displayName: formData.displayName || formData.email.split("@")[0],
        role: formData.role,
        courses: formData.courses,
      });

      const result = await adminCreateUser(adminEmail, {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.email.split("@")[0],
        role: formData.role,
        courses: formData.courses,
      });

      if (result.success) {
        setSuccess(`✅ Потребител ${formData.email} е създаден успешно!`);
        
        console.log('🎉 Потребител създаден успешно:', result);

        // Изчистваме формата
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          displayName: "",
          role: ROLES.STUDENT,
          courses: ROLE_DEFINITIONS[ROLES.STUDENT].defaultCourses,
        });

        // Уведомяваме родителския компонент
        if (onUserCreated) {
          onUserCreated(result);
        }

        // Автоматично затваряне след 3 секунди
        setTimeout(() => {
          if (onClose) onClose();
        }, 3000);
      } else {
        setError(result.error || "Грешка при създаване на потребител");
        console.error('❌ Грешка при създаване:', result);
      }
    } catch (error) {
      setError("Неочаквана грешка: " + error.message);
      console.error('❌ Неочаквана грешка:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS[ROLES.GUEST];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 mr-3">
              <UserPlus className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Създаване на нов потребител
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <Check className="mr-2" size={20} />
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име за показване
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Автоматично от email ако е празно"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Shield className="mr-2" size={20} />
              Парола
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Парола *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Минимум 6 символа"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Потвърди парола *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Повтори паролата"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роля *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(ROLES).map((role) => {
                const roleInfo = getRoleInfo(role);
                return (
                  <label
                    key={role}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.role === role
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={handleInputChange}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          formData.role === role ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      >
                        <Shield className="text-white" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {roleInfo.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {roleInfo.defaultCourses.length} курса по подразбиране
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Course Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <BookOpen className="mr-2" size={18} />
              Достъп до курсове
            </label>
            
            {coursesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Зареждане на курсове...</span>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BookOpen className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-600 text-sm">Няма налични курсове</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.courses.includes(course.id)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.courses.includes(course.id)}
                      onChange={() => handleCourseToggle(course.id)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div className="flex items-center w-full">
                      <div
                        className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          formData.courses.includes(course.id)
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.courses.includes(course.id) && (
                          <Check className="text-white" size={12} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ниво {course.level} • {course.videos?.length || 0} видеа
                        </div>
                      </div>
                      <div className="text-2xl">{course.icon}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Отказ
            </button>

            <button
              type="submit"
              disabled={loading || coursesLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Създаване...
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={18} />
                  Създай потребител
                </>
              )}
            </button>
          </div>

          {/* Debug Info (само в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
              <strong>Debug Info:</strong>
              <pre className="mt-1 text-gray-600">
                {JSON.stringify({
                  email: formData.email,
                  hasPassword: !!formData.password,
                  passwordLength: formData.password.length,
                  role: formData.role,
                  coursesCount: formData.courses.length,
                  availableCoursesCount: availableCourses.length,
                  coursesLoading
                }, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminUserCreation;