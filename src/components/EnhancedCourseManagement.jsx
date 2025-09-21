// src/components/EnhancedCourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Play, 
  FileText,
  GripVertical,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addContentToCourse,
  updateContentInCourse,
  removeContentFromCourse,
  validateVideoUrl,
  validateAssignmentData,
  getCourseContentStats,
  migrateLegacyCourse,
  CONTENT_TYPES,
  ASSIGNMENT_TYPES
} from '../firebase/courses';
import AssignmentManagement from './AssignmentManagement';

const EnhancedCourseManagement = ({ adminEmail }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const result = await getAllCourses();
      if (result.success) {
        setCourses(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при зареждане на курсове');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Зареждане на курсове...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Управление на курсове</h2>
          <p className="text-gray-600 mt-2">Създавайте и редактирайте курсове, видеа и задачи</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Нов курс
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
          <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {success}
          </div>
          <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <BookOpen className="text-gray-400 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Няма курсове</h3>
          <p className="text-gray-600 mb-6">Създайте първия си курс за да започнете</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Създай първия курс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map(course => (
            <EnhancedCourseCard
              key={course.id}
              course={course}
              onEdit={setEditingCourse}
              onDelete={(courseId) => handleDeleteCourse(courseId)}
              onUpdate={loadCourses}
              adminEmail={adminEmail}
            />
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(courseData) => handleCreateCourse(courseData)}
          existingCourses={courses}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={(courseId, updateData) => handleUpdateCourse(courseId, updateData)}
          existingCourses={courses.filter(c => c.id !== editingCourse.id)}
        />
      )}
    </div>
  );

  async function handleCreateCourse(courseData) {
    try {
      const result = await createCourse(courseData, adminEmail);
      if (result.success) {
        setSuccess('Курсът е създаден успешно');
        setShowCreateModal(false);
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при създаване на курс');
    }
  }

  async function handleUpdateCourse(courseId, updateData) {
    try {
      const result = await updateCourse(courseId, updateData, adminEmail);
      if (result.success) {
        setSuccess('Курсът е актуализиран успешно');
        setEditingCourse(null);
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при актуализиране на курс');
    }
  }

  async function handleDeleteCourse(courseId) {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този курс?')) {
      return;
    }

    try {
      const result = await deleteCourse(courseId, adminEmail);
      if (result.success) {
        setSuccess('Курсът е изтрит успешно');
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при изтриване на курс');
    }
  }
};

// Обновена карта на курс с поддръжка за смесено съдържание
const EnhancedCourseCard = ({ 
  course, 
  onEdit, 
  onDelete, 
  onUpdate,
  adminEmail 
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, videos, assignments
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState(CONTENT_TYPES.VIDEO);

  // Проверяваме дали курсът има новата структура
  const hasNewStructure = course.content && Array.isArray(course.content);
  const needsMigration = !hasNewStructure && course.videos && course.videos.length > 0;

  // Получаваме съдържанието
  const content = hasNewStructure ? course.content : [];
  const videos = content.filter(item => item.type === CONTENT_TYPES.VIDEO);
  const assignments = content.filter(item => item.type === CONTENT_TYPES.ASSIGNMENT);
  const legacyVideos = !hasNewStructure ? (course.videos || []) : [];

  const stats = getCourseContentStats(content);

  const handleMigration = async () => {
    if (!window.confirm('Това ще мигрира курса към новата структура. Продължи?')) {
      return;
    }

    try {
      const { migrateLegacyCourse } = await import('../firebase/courses');
      const result = await migrateLegacyCourse(course.id, adminEmail);
      
      if (result.success) {
        alert('Курсът е мигриран успешно!');
        onUpdate();
      } else {
        alert('Грешка при миграция: ' + result.error);
      }
    } catch (error) {
      alert('Грешка при миграция на курс');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Course Header */}
      <div className={`bg-gradient-to-r ${course.color} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-4xl mr-4">{course.icon}</div>
            <div>
              <h3 className="text-2xl font-bold mb-1">{course.title}</h3>
              <p className="text-white text-opacity-90 mb-2">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  Ниво {course.level}
                </span>
                {hasNewStructure ? (
                  <>
                    <span className="flex items-center">
                      <Video size={16} className="mr-1" />
                      {stats.videos} видеа
                    </span>
                    <span className="flex items-center">
                      <FileText size={16} className="mr-1" />
                      {stats.assignments} задачи
                    </span>
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {stats.total} елемента
                    </span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <Play size={16} className="mr-1" />
                    {legacyVideos.length} видеа (стара структура)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {needsMigration && (
              <button
                onClick={handleMigration}
                className="bg-yellow-500 bg-opacity-80 p-2 rounded-lg hover:bg-opacity-100 transition-all text-sm"
                title="Мигрирай към новата структура"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
              title={collapsed ? 'Разгъни' : 'Свий'}
            >
              {collapsed ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button
              onClick={() => onEdit(course)}
              className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-all"
              title="Редактирай курс"
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="bg-red-500 bg-opacity-80 p-2 rounded-lg hover:bg-opacity-100 transition-all"
              title="Изтрий курс"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Course Content */}
      {!collapsed && (
        <div className="p-6">
          {needsMigration ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-600 mr-3" size={24} />
                <div>
                  <h4 className="font-semibold text-yellow-800">Миграция на курс</h4>
                  <p className="text-yellow-700 text-sm">
                    Този курс използва старата структура. Мигрирайте го за да добавяте задачи.
                  </p>
                  <button
                    onClick={handleMigration}
                    className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Мигрирай курса
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'content'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Всичко съдържание ({stats.total})
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'videos'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Видеа ({stats.videos})
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'assignments'
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Задачи ({stats.assignments})
                  </button>
                </div>

                <button
                  onClick={() => setShowAddContent(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Добави съдържание
                </button>
              </div>

              {/* Content Display */}
              {activeTab === 'content' && (
                <ContentList 
                  content={content}
                  courseId={course.id}
                  adminEmail={adminEmail}
                  onUpdate={onUpdate}
                />
              )}

              {activeTab === 'videos' && (
                <VideoList 
                  videos={videos}
                  courseId={course.id}
                  adminEmail={adminEmail}
                  onUpdate={onUpdate}
                />
              )}

              {activeTab === 'assignments' && (
                <AssignmentManagement
                  courseId={course.id}
                  assignments={assignments}
                  onUpdate={onUpdate}
                  adminEmail={adminEmail}
                />
              )}

              {/* Add Content Form */}
              {showAddContent && (
                <AddContentForm
                  courseId={course.id}
                  onSubmit={(contentData) => {
                    handleAddContent(course.id, contentData, adminEmail, onUpdate);
                    setShowAddContent(false);
                  }}
                  onCancel={() => setShowAddContent(false)}
                  contentCount={stats.total}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  async function handleAddContent(courseId, contentData, adminEmail, onUpdate) {
    try {
      const result = await addContentToCourse(courseId, contentData, adminEmail);
      if (result.success) {
        onUpdate();
      } else {
        alert('Грешка при добавяне на съдържание: ' + result.error);
      }
    } catch (error) {
      alert('Грешка при добавяне на съдържание');
    }
  }
};

// Компонент за показване на смесено съдържание
const ContentList = ({ content, courseId, adminEmail, onUpdate }) => {
  if (content.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Няма съдържание</h4>
        <p className="text-gray-600">Добавете видеа и задачи за този курс</p>
      </div>
    );
  }

  const handleDelete = async (contentId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете това съдържание?')) {
      return;
    }

    try {
      const result = await removeContentFromCourse(courseId, contentId, adminEmail);
      if (result.success) {
        onUpdate();
      } else {
        alert('Грешка при изтриване: ' + result.error);
      }
    } catch (error) {
      alert('Грешка при изтриване на съдържание');
    }
  };

  return (
    <div className="space-y-3">
      {content.map((item, index) => (
        <div
          key={item.id}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
              item.type === CONTENT_TYPES.VIDEO ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {item.type === CONTENT_TYPES.VIDEO ? (
                <Play size={16} />
              ) : (
                <FileText size={16} />
              )}
            </div>
            
            <div className="flex-1">
              <h5 className="font-medium text-gray-800">{item.title}</h5>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>
                  {item.type === CONTENT_TYPES.VIDEO ? 'Видео' : 'Задача'}
                </span>
                {item.duration && (
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {item.duration}
                  </span>
                )}
                {item.estimatedTime && (
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {item.estimatedTime}
                  </span>
                )}
                <span>Позиция {item.order}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
              title="Изтрий"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Компонент за показване само на видеа
const VideoList = ({ videos, courseId, adminEmail, onUpdate }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Play className="text-gray-400 mx-auto mb-4" size={48} />
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Няма видеа</h4>
        <p className="text-gray-600">Добавете първото видео за този курс</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm">
              {video.order || index + 1}
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-800">{video.title}</h5>
              <div className="flex items-