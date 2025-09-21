// src/components/CourseManagement.jsx - Пълен компонент за управление на курсове
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Play, 
  GripVertical,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
  updateVideoInCourse,
  removeVideoFromCourse,
  reorderVideosInCourse,
  validateVideoUrl,
  getYouTubeThumbnail,
  calculateCourseTime,
  checkCourseDependencies
} from '../firebase/courses';

const CourseManagement = ({ adminEmail }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
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
      // Проверяваме за зависимости
      const dependencyCheck = await checkCourseDependencies(courseId);
      if (dependencyCheck.success && dependencyCheck.hasDependencies) {
        setError(`Курсът не може да бъде изтрит, защото се използва като предварително условие за: ${dependencyCheck.dependentCourses.map(c => c.title).join(', ')}`);
        return;
      }

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

  const handleAddVideo = async (courseId, videoData) => {
    try {
      const result = await addVideoToCourse(courseId, videoData, adminEmail);
      if (result.success) {
        setSuccess('Видеото е добавено успешно');
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при добавяне на видео');
    }
  };

  const handleUpdateVideo = async (courseId, videoId, videoData) => {
    try {
      const result = await updateVideoInCourse(courseId, videoId, videoData, adminEmail);
      if (result.success) {
        setSuccess('Видеото е актуализирано успешно');
        setEditingVideo(null);
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при актуализиране на видео');
    }
  };

  const handleDeleteVideo = async (courseId, videoId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете това видео?')) {
      return;
    }

    try {
      const result = await removeVideoFromCourse(courseId, videoId, adminEmail);
      if (result.success) {
        setSuccess('Видеото е изтрито успешно');
        loadCourses();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при изтриване на видео');
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
          <p className="text-gray-600 mt-2">Създавайте и редактирайте курсове и видеа</p>
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
            <CourseCard
              key={course.id}
              course={course}
              onEdit={setEditingCourse}
              onDelete={handleDeleteCourse}
              onAddVideo={handleAddVideo}
              onEditVideo={setEditingVideo}
              onDeleteVideo={handleDeleteVideo}
              editingVideo={editingVideo}
              onUpdateVideo={handleUpdateVideo}
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

// Компонент за карта на курс
const CourseCard = ({ 
  course, 
  onEdit, 
  onDelete, 
  onAddVideo, 
  onEditVideo, 
  onDeleteVideo,
  editingVideo,
  onUpdateVideo 
}) => {
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const totalTime = calculateCourseTime(course.videos || []);

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
                <span className="flex items-center">
                  <Play size={16} className="mr-1" />
                  {course.videos?.length || 0} видеа
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {totalTime}ч
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Видеа ({course.videos?.length || 0})
            </h4>
            <button
              onClick={() => setShowAddVideo(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" />
              Добави видео
            </button>
          </div>

          {/* Videos List */}
          <div className="space-y-3">
            {course.videos?.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Play className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-600">Няма добавени видеа</p>
              </div>
            ) : (
              course.videos?.map((video, index) => (
                <VideoItem
                  key={video.id}
                  video={video}
                  courseId={course.id}
                  index={index}
                  onEdit={onEditVideo}
                  onDelete={onDeleteVideo}
                  isEditing={editingVideo?.id === video.id}
                  onUpdate={onUpdateVideo}
                />
              ))
            )}
          </div>

          {/* Add Video Form */}
          {showAddVideo && (
            <AddVideoForm
              courseId={course.id}
              onSubmit={(videoData) => {
                onAddVideo(course.id, videoData);
                setShowAddVideo(false);
              }}
              onCancel={() => setShowAddVideo(false)}
              videoCount={course.videos?.length || 0}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Компонент за видео елемент
const VideoItem = ({ video, courseId, index, onEdit, onDelete, isEditing, onUpdate }) => {
  const [editData, setEditData] = useState({
    title: video.title,
    url: video.url,
    description: video.description,
    duration: video.duration
  });

  const handleSave = () => {
    onUpdate(courseId, video.id, editData);
  };

  const isValidUrl = validateVideoUrl(editData.url);

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заглавие
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Заглавие на видеото"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Продължителност
            </label>
            <input
              type="text"
              value={editData.duration}
              onChange={(e) => setEditData({...editData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15:30"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL на видеото
          </label>
          <div className="relative">
            <input
              type="url"
              value={editData.url}
              onChange={(e) => setEditData({...editData, url: e.target.value})}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                isValidUrl ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500'
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isValidUrl ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <AlertCircle className="text-red-500" size={20} />
              )}
            </div>
          </div>
          {!isValidUrl && editData.url && (
            <p className="text-red-600 text-xs mt-1">
              Невалиден URL. Поддържат се YouTube, Vimeo и директни видео файлове.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Описание на видеото..."
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={!editData.title || !isValidUrl}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save size={16} className="mr-1" />
            Запази
          </button>
          <button
            onClick={() => onEdit(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <X size={16} className="mr-1" />
            Отказ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
          {index + 1}
        </div>
        
        <div className="flex-1">
          <h5 className="font-medium text-gray-800">{video.title}</h5>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span className="flex items-center">
              <Clock size={14} className="mr-1" />
              {video.duration}
            </span>
            <span className="flex items-center">
              <LinkIcon size={14} className="mr-1" />
              {video.url.includes('youtube') ? 'YouTube' : 
               video.url.includes('vimeo') ? 'Vimeo' : 'Директно'}
            </span>
          </div>
          {video.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(video)}
          className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
          title="Редактирай видео"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={() => onDelete(courseId, video.id)}
          className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
          title="Изтрий видео"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Формуляр за добавяне на видео
const AddVideoForm = ({ courseId, onSubmit, onCancel, videoCount }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    duration: '',
    order: videoCount + 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && validateVideoUrl(formData.url)) {
      onSubmit(formData);
      setFormData({
        title: '',
        url: '',
        description: '',
        duration: '',
        order: videoCount + 2
      });
    }
  };

  const isValidUrl = validateVideoUrl(formData.url);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <h5 className="font-semibold text-gray-800 mb-4">Добави ново видео</h5>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заглавие *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Заглавие на видеото"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="15:30"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL на видеото *
          </label>
          <div className="relative">
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                isValidUrl || !formData.url ? 'border-gray-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500'
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {formData.url && (isValidUrl ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <AlertCircle className="text-red-500" size={20} />
              ))}
            </div>
          </div>
          {!isValidUrl && formData.url && (
            <p className="text-red-600 text-xs mt-1">
              Невалиден URL. Поддържат се YouTube, Vimeo и директни видео файлове.
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Примери: YouTube, Vimeo URLs или директни връзки към .mp4, .webm файлове
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Кратко описание на видеото..."
          />
        </div>
        
        <div className="flex items-center space-x-3 pt-4 border-t border-green-200">
          <button
            type="submit"
            disabled={!formData.title || !isValidUrl}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Добави видео
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

export default CourseManagement;