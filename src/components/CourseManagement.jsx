// src/components/EnhancedCourseManagement.jsx - Пълен компонент с поддръжка за задачи
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Play, 
  FileText,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
  RotateCcw
} from 'lucide-react';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addContentToCourse,
  removeContentFromCourse,
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

  const handleCreateCourse = async (courseData) => {
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
  };

  const handleUpdateCourse = async (courseId, updateData) => {
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
  };

  const handleDeleteCourse = async (courseId) => {
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
              onDelete={handleDeleteCourse}
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
          onSubmit={handleCreateCourse}
          existingCourses={courses}
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={handleUpdateCourse}
          existingCourses={courses.filter(c => c.id !== editingCourse.id)}
        />
      )}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState('content');
  const [showAddContent, setShowAddContent] = useState(false);

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

  const handleAddContent = async (contentData) => {
    try {
      const result = await addContentToCourse(course.id, contentData, adminEmail);
      if (result.success) {
        onUpdate();
        setShowAddContent(false);
      } else {
        alert('Грешка при добавяне на съдържание: ' + result.error);
      }
    } catch (error) {
      alert('Грешка при добавяне на съдържание');
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
                  onSubmit={handleAddContent}
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
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {video.duration}
                </span>
                <span className="flex items-center">
                  <Video size={14} className="mr-1" />
                  {video.url.includes('youtube') ? 'YouTube' : 
                   video.url.includes('vimeo') ? 'Vimeo' : 'Директно'}
                </span>
              </div>
              {video.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Формуляр за добавяне на съдържание
const AddContentForm = ({ courseId, onSubmit, onCancel, contentCount }) => {
  const [contentType, setContentType] = useState(CONTENT_TYPES.VIDEO);
  const [formData, setFormData] = useState({
    title: '',
    order: contentCount + 1,
    // За видеа
    url: '',
    description: '',
    duration: '',
    category: 'Видео лекция',
    // За задачи
    assignmentType: ASSIGNMENT_TYPES.DOCUMENT,
    instructions: '',
    difficulty: 'medium',
    estimatedTime: '30 мин',
    documentUrl: '',
    textContent: '',
    linkUrl: '',
    downloadable: true,
    openInNewTab: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contentData = {
      type: contentType,
      title: formData.title,
      order: formData.order,
      ...getContentSpecificFields()
    };

    onSubmit(contentData);
  };

  const getContentSpecificFields = () => {
    if (contentType === CONTENT_TYPES.VIDEO) {
      return {
        url: formData.url,
        description: formData.description,
        duration: formData.duration,
        category: formData.category
      };
    } else {
      const baseFields = {
        assignmentType: formData.assignmentType,
        description: formData.description,
        instructions: formData.instructions,
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime
      };

      if (formData.assignmentType === ASSIGNMENT_TYPES.DOCUMENT) {
        return { ...baseFields, documentUrl: formData.documentUrl, downloadable: formData.downloadable };
      } else if (formData.assignmentType === ASSIGNMENT_TYPES.TEXT) {
        return { ...baseFields, textContent: formData.textContent };
      } else if (formData.assignmentType === ASSIGNMENT_TYPES.LINK) {
        return { ...baseFields, linkUrl: formData.linkUrl, openInNewTab: formData.openInNewTab };
      }
    }
    return {};
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      <h4 className="font-semibold text-gray-800 mb-4">Добави ново съдържание</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип съдържание
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value={CONTENT_TYPES.VIDEO}
                checked={contentType === CONTENT_TYPES.VIDEO}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <Video size={16} className="mr-1" />
              Видео
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value={CONTENT_TYPES.ASSIGNMENT}
                checked={contentType === CONTENT_TYPES.ASSIGNMENT}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              <FileText size={16} className="mr-1" />
              Задача
            </label>
          </div>
        </div>

        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заглавие *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Позиция
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Video-specific fields */}
        {contentType === CONTENT_TYPES.VIDEO && (
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-gray-800">Настройки за видео</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL на видеото *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Продължителност
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15:30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Assignment-specific fields */}
        {contentType === CONTENT_TYPES.ASSIGNMENT && (
          <div className="space-y-4 border-t pt-4">
            <h5 className="font-medium text-gray-800">Настройки за задача</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип задача
                </label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({...formData, assignmentType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ASSIGNMENT_TYPES.DOCUMENT}>Документ (PDF, Word, Excel)</option>
                  <option value={ASSIGNMENT_TYPES.TEXT}>Текстова задача</option>
                  <option value={ASSIGNMENT_TYPES.LINK}>Външна връзка</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Трудност
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Лесно</option>
                  <option value="medium">Средно</option>
                  <option value="hard">Трудно</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Време
                </label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30 мин"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Инструкции
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Подробни инструкции за изпълнение на задачата"
              />
            </div>

            {/* Specific assignment type fields */}
            {formData.assignmentType === ASSIGNMENT_TYPES.DOCUMENT && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h6 className="font-medium text-blue-800 mb-3">Настройки за документ</h6>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL на документа *
                  </label>
                  <input
                    type="url"
                    value={formData.documentUrl}
                    onChange={(e) => setFormData({...formData, documentUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://drive.google.com/file/d/..."
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Поддържат се Google Drive, OneDrive, Dropbox или директни връзки
                  </p>
                </div>
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.downloadable}
                      onChange={(e) => setFormData({...formData, downloadable: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Разреши изтегляне</span>
                  </label>
                </div>
              </div>
            )}

            {formData.assignmentType === ASSIGNMENT_TYPES.TEXT && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h6 className="font-medium text-green-800 mb-3">Текстова задача</h6>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Съдържание на задачата *
                  </label>
                  <textarea
                    value={formData.textContent}
                    onChange={(e) => setFormData({...formData, textContent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="6"
                    placeholder="Въведете текста на задачата тук..."
                    required
                  />
                </div>
              </div>
            )}

            {formData.assignmentType === ASSIGNMENT_TYPES.LINK && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h6 className="font-medium text-purple-800 mb-3">Външна връзка</h6>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL на връзката *
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.openInNewTab}
                        onChange={(e) => setFormData({...formData, openInNewTab: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Отвори в нов таб</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={!formData.title}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Добави съдържание
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
};

// Модал за създаване на курс
const CreateCourseModal = ({ onClose, onSubmit, existingCourses }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 1,
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    prerequisite: '',
    estimatedHours: 1
  });

  const colorOptions = [
    { value: 'from-blue-500 to-blue-600', label: 'Синьо', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'from-green-500 to-green-600', label: 'Зелено', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'from-purple-500 to-purple-600', label: 'Лилаво', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { value: 'from-red-500 to-red-600', label: 'Червено', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
    { value: 'from-orange-500 to-orange-600', label: 'Оранжево', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'from-teal-500 to-teal-600', label: 'Тюркоазено', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' }
  ];

  const iconOptions = ['📚', '💻', '🚀', '🎯', '⚡', '🛡️', '🔬', '🎨', '📊', '🏆'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Създай нов курс</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заглавие на курса *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Име на курса"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ниво
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ниво 1 - Начинаещи</option>
                <option value={2}>Ниво 2 - Средно</option>
                <option value={3}>Ниво 3 - Напреднали</option>
                <option value={4}>Ниво 4 - Експерти</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Кратко описание на курса"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цветова схема
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(color => (
                  <label key={color.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={formData.color === color.value}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="sr-only"
                    />
                    <div className={`h-10 rounded-lg ${color.preview} border-2 ${
                      formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                    } transition-all hover:scale-105`}></div>
                    <span className="text-xs text-center block mt-1">{color.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Икона
              </label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map(icon => (
                  <label key={icon} className="cursor-pointer">
                    <input
                      type="radio"
                      name="icon"
                      value={icon}
                      checked={formData.icon === icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="sr-only"
                    />
                    <div className={`h-10 w-10 rounded-lg border-2 ${
                      formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } flex items-center justify-center text-xl transition-all hover:scale-110`}>
                      {icon}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предварително условие
              </label>
              <select
                value={formData.prerequisite}
                onChange={(e) => setFormData({...formData, prerequisite: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Няма</option>
                {existingCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Очаквано време (часове)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value)})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={!formData.title || !formData.description}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Създай курс
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Модал за редактиране на курс
const EditCourseModal = ({ course, onClose, onSubmit, existingCourses }) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    level: course.level,
    color: course.color,
    icon: course.icon,
    prerequisite: course.prerequisite || '',
    estimatedHours: course.estimatedHours
  });

  const colorOptions = [
    { value: 'from-blue-500 to-blue-600', label: 'Синьо', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'from-green-500 to-green-600', label: 'Зелено', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'from-purple-500 to-purple-600', label: 'Лилаво', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { value: 'from-red-500 to-red-600', label: 'Червено', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
    { value: 'from-orange-500 to-orange-600', label: 'Оранжево', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'from-teal-500 to-teal-600', label: 'Тюркоазено', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' }
  ];

  const iconOptions = ['📚', '💻', '🚀', '🎯', '⚡', '🛡️', '🔬', '🎨', '📊', '🏆'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onSubmit(course.id, formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Редактирай курс</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заглавие на курса *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Име на курса"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ниво
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Ниво 1 - Начинаещи</option>
                <option value={2}>Ниво 2 - Средно</option>
                <option value={3}>Ниво 3 - Напреднали</option>
                <option value={4}>Ниво 4 - Експерти</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Кратко описание на курса"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цветова схема
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(color => (
                  <label key={color.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={formData.color === color.value}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="sr-only"
                    />
                    <div className={`h-10 rounded-lg ${color.preview} border-2 ${
                      formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                    } transition-all hover:scale-105`}></div>
                    <span className="text-xs text-center block mt-1">{color.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Икона
              </label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map(icon => (
                  <label key={icon} className="cursor-pointer">
                    <input
                      type="radio"
                      name="icon"
                      value={icon}
                      checked={formData.icon === icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="sr-only"
                    />
                    <div className={`h-10 w-10 rounded-lg border-2 ${
                      formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } flex items-center justify-center text-xl transition-all hover:scale-110`}>
                      {icon}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предварително условие
              </label>
              <select
                value={formData.prerequisite}
                onChange={(e) => setFormData({...formData, prerequisite: e.target.value})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Няма</option>
                {existingCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Очаквано време (часове)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value)})}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={!formData.title || !formData.description}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Запази промени
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedCourseManagement;