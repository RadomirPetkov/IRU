// src/components/CourseManagement.jsx - Обновена версия с файлове вместо задачи
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
  Move3D,
  FolderOpen,
  Music,
  Upload
} from 'lucide-react';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addContentToCourse,
  removeContentFromCourse,
  getCourseContentStats,
  CONTENT_TYPES,
  FILE_TYPES
} from '../firebase/courses';
import FileManagement from './FileManagement';
import ContentOrderManager from './ContentOrderManager';
import AudioUploader from './AudioUploader';
import TopicManagement from './TopicManagement';

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
          <p className="text-gray-600 mt-2">Създавайте и редактирайте курсове, видеа и файлове</p>
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

// Карта на курс с поддръжка за видеа и файлове
const EnhancedCourseCard = ({ 
  course, 
  onEdit, 
  onDelete, 
  onUpdate,
  adminEmail 
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('topics');
  const [showAddContent, setShowAddContent] = useState(false);
  const [showOrderManager, setShowOrderManager] = useState(false);

  const content = course.content || [];
  const videos = content.filter(item => item.type === CONTENT_TYPES.VIDEO);
  const files = content.filter(item => item.type === CONTENT_TYPES.FILE);
  const audios = content.filter(item => item.type === CONTENT_TYPES.AUDIO);

  const stats = getCourseContentStats(content);

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
                <span className="flex items-center">
                  <Video size={16} className="mr-1" />
                  {stats.videos} видеа
                </span>
                <span className="flex items-center">
                  <FileText size={16} className="mr-1" />
                  {stats.files} файла
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {stats.total} елемента
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
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('topics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'topics'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen size={16} className="inline mr-1" />
                Теми ({course.topics?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'content'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Всичко ({stats.total})
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
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'files'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Файлове ({stats.files})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {stats.total > 1 && (
                <button
                  onClick={() => setShowOrderManager(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center text-sm"
                  title="Подреди съдържанието"
                >
                  <Move3D size={16} className="mr-1" />
                  Подреди
                </button>
              )}
              
              <button
                onClick={() => setShowAddContent(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Добави
              </button>
            </div>
          </div>

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <TopicManagement
              courseId={course.id}
              topics={course.topics || []}
              content={content}
              adminEmail={adminEmail}
              onUpdate={onUpdate}
            />
          )}

          {/* Content Display */}
          {activeTab === 'content' && (
            <ContentList 
              content={content}
              courseId={course.id}
              topics={course.topics || []}
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

          {activeTab === 'files' && (
            <FileManagement
              courseId={course.id}
              files={files}
              onUpdate={onUpdate}
              adminEmail={adminEmail}
            />
          )}

          {/* Add Content Form */}
          {showAddContent && (
            <AddContentForm
              courseId={course.id}
              topics={course.topics || []}
              onSubmit={handleAddContent}
              onCancel={() => setShowAddContent(false)}
              contentCount={stats.total}
            />
          )}

          {/* Order Manager Modal */}
          {showOrderManager && (
            <ContentOrderManager
              course={course}
              onClose={() => setShowOrderManager(false)}
              onUpdate={onUpdate}
              adminEmail={adminEmail}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Компонент за показване на смесено съдържание
const ContentList = ({ content, courseId, topics = [], adminEmail, onUpdate }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  if (content.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Няма съдържание</h4>
        <p className="text-gray-600">Добавете видеа и файлове за този курс</p>
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

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      duration: item.duration || '',
      order: item.order || 1,
      topicId: item.topicId || '',
      // За видеа
      url: item.url || '',
      category: item.category || 'Видео лекция',
      // За файлове
      driveUrl: item.driveUrl || '',
      fileType: item.fileType || '',
      fileName: item.fileName || '',
      // За аудио
      audioUrl: item.audioUrl || ''
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const saveEdit = async (itemId, itemType) => {
    setSaving(true);
    try {
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        order: parseInt(editForm.order) || 1,
        topicId: editForm.topicId || null
      };

      // Добавяме специфични полета според типа
      if (itemType === CONTENT_TYPES.VIDEO) {
        updateData.url = editForm.url;
        updateData.duration = editForm.duration;
        updateData.category = editForm.category;
      } else if (itemType === CONTENT_TYPES.AUDIO) {
        updateData.audioUrl = editForm.audioUrl;
        updateData.duration = editForm.duration;
      } else if (itemType === CONTENT_TYPES.FILE) {
        updateData.driveUrl = editForm.driveUrl;
        updateData.fileType = editForm.fileType;
        updateData.fileName = editForm.fileName || editForm.title;
      }

      const { updateContentInCourse } = await import('../firebase/courses');
      const result = await updateContentInCourse(courseId, itemId, updateData, adminEmail);
      
      if (result.success) {
        setEditingItem(null);
        setEditForm({});
        onUpdate();
      } else {
        alert('Грешка при запазване: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Грешка при запазване на промените');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case CONTENT_TYPES.VIDEO:
        return <Play size={16} />;
      case CONTENT_TYPES.AUDIO:
        return <Music size={16} />;
      case CONTENT_TYPES.FILE:
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case CONTENT_TYPES.VIDEO:
        return 'bg-blue-500';
      case CONTENT_TYPES.AUDIO:
        return 'bg-teal-500';
      case CONTENT_TYPES.FILE:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case CONTENT_TYPES.VIDEO:
        return 'Видео';
      case CONTENT_TYPES.AUDIO:
        return 'Аудио';
      case CONTENT_TYPES.FILE:
        return 'Файл';
      default:
        return 'Съдържание';
    }
  };

  return (
    <div className="space-y-3">
      {content.map((item, index) => (
        <div
          key={item.id}
          className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
        >
          {editingItem === item.id ? (
            /* Edit Mode */
            <div className="p-4 space-y-4 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-blue-800 flex items-center">
                  <Edit3 size={16} className="mr-2" />
                  Редактиране на {getTypeName(item.type)}
                </h4>
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Заглавие */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Заглавие *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Тема */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тема
                  </label>
                  <select
                    value={editForm.topicId}
                    onChange={(e) => setEditForm({...editForm, topicId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Без тема</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.icon} {topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Позиция */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Позиция
                  </label>
                  <input
                    type="number"
                    value={editForm.order}
                    onChange={(e) => setEditForm({...editForm, order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                {/* Продължителност (за видео и аудио) */}
                {(item.type === CONTENT_TYPES.VIDEO || item.type === CONTENT_TYPES.AUDIO) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Продължителност
                    </label>
                    <input
                      type="text"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="напр. 10:30"
                    />
                  </div>
                )}

                {/* URL за видео */}
                {item.type === CONTENT_TYPES.VIDEO && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL на видеото
                    </label>
                    <input
                      type="url"
                      value={editForm.url}
                      onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}

                {/* Категория за видео */}
                {item.type === CONTENT_TYPES.VIDEO && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* URL за файл */}
                {item.type === CONTENT_TYPES.FILE && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Google Drive URL
                      </label>
                      <input
                        type="url"
                        value={editForm.driveUrl}
                        onChange={(e) => setEditForm({...editForm, driveUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тип файл
                      </label>
                      <select
                        value={editForm.fileType}
                        onChange={(e) => setEditForm({...editForm, fileType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Избери тип</option>
                        <option value="Лекция">Лекция</option>
                        <option value="Програма">Програма</option>
                        <option value="Задача">Задача</option>
                        <option value="Упражнение">Упражнение</option>
                        <option value="Материал">Материал</option>
                        <option value="Презентация">Презентация</option>
                        <option value="Друго">Друго</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Описание */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Кратко описание..."
                  />
                </div>
              </div>

              {/* Бутони за запазване/отказ */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => saveEdit(item.id, item.type)}
                  disabled={saving || !editForm.title}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Clock size={16} className="mr-2 animate-spin" />
                      Запазване...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Запази промените
                    </>
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отказ
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-800">{item.title}</h5>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      {getTypeName(item.type)}
                      {item.fileType && ` • ${item.fileType}`}
                    </span>
                    <span>Позиция {item.order}</span>
                    {item.topicId && topics.find(t => t.id === item.topicId) ? (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center">
                        <BookOpen size={10} className="mr-1" />
                        {topics.find(t => t.id === item.topicId)?.icon} {topics.find(t => t.id === item.topicId)?.title}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs flex items-center">
                        <FolderOpen size={10} className="mr-1" />
                        Без тема
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => startEdit(item)}
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"
                  title="Редактирай"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"
                  title="Изтрий"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
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

// Формуляр за добавяне на съдържание (Модален прозорец)
const AddContentForm = ({ courseId, topics = [], onSubmit, onCancel, contentCount }) => {
  const [contentType, setContentType] = useState(CONTENT_TYPES.VIDEO);
  const [formData, setFormData] = useState({
    title: '',
    order: contentCount + 1,
    topicId: '',
    // За видеа
    url: '',
    description: '',
    duration: '',
    category: 'Видео лекция',
    // За файлове
    fileName: '',
    fileType: '',
    driveUrl: '',
    // За аудио
    audioUrl: '',
    audioPath: ''
  });
  const [audioUploaded, setAudioUploaded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contentData = {
      type: contentType,
      title: formData.title,
      order: formData.order,
      topicId: formData.topicId || null,
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
    } else if (contentType === CONTENT_TYPES.AUDIO) {
      return {
        audioUrl: formData.audioUrl,
        audioPath: formData.audioPath,
        description: formData.description,
        duration: formData.duration
      };
    } else {
      return {
        fileName: formData.fileName || formData.title,
        fileType: formData.fileType,
        driveUrl: formData.driveUrl,
        description: formData.description
      };
    }
  };

  const handleAudioUploadComplete = (result) => {
    if (result && result.url) {
      setFormData({
        ...formData,
        audioUrl: result.url,
        audioPath: result.path,
        title: formData.title || result.name?.replace(/\.[^/.]+$/, '') || ''
      });
      setAudioUploaded(true);
    } else {
      setFormData({
        ...formData, 
        audioUrl: '',
        audioPath: ''
      });
      setAudioUploaded(false);
    }
  };

  const fileTypeSuggestions = Object.values(FILE_TYPES);

  const isFormValid = () => {
    if (!formData.title) return false;
    if (contentType === CONTENT_TYPES.VIDEO && !formData.url) return false;
    if (contentType === CONTENT_TYPES.FILE && !formData.driveUrl) return false;
    if (contentType === CONTENT_TYPES.AUDIO && !formData.audioUrl) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-white flex items-center">
            <Plus size={24} className="mr-2" />
            Добави ново съдържание
          </h4>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип съдържание
              </label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex items-center cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                  contentType === CONTENT_TYPES.VIDEO 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value={CONTENT_TYPES.VIDEO}
                    checked={contentType === CONTENT_TYPES.VIDEO}
                    onChange={(e) => setContentType(e.target.value)}
                    className="sr-only"
                  />
                  <Video size={18} className="mr-2 text-blue-500" />
                  Видео
                </label>
                <label className={`flex items-center cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                  contentType === CONTENT_TYPES.AUDIO 
                    ? 'border-teal-500 bg-teal-50 text-teal-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value={CONTENT_TYPES.AUDIO}
                    checked={contentType === CONTENT_TYPES.AUDIO}
                    onChange={(e) => setContentType(e.target.value)}
                    className="sr-only"
                  />
                  <Music size={18} className="mr-2 text-teal-500" />
                  Аудио
                </label>
                <label className={`flex items-center cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                  contentType === CONTENT_TYPES.FILE 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value={CONTENT_TYPES.FILE}
                    checked={contentType === CONTENT_TYPES.FILE}
                    onChange={(e) => setContentType(e.target.value)}
                    className="sr-only"
                  />
                  <FileText size={18} className="mr-2 text-orange-500" />
                  Файл
                </label>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заглавие *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Въведете заглавие"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тема
                </label>
                <select
                  value={formData.topicId}
                  onChange={(e) => setFormData({...formData, topicId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Без тема</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.icon} {topic.title}
                    </option>
                  ))}
                </select>
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
                  min="1"
                />
              </div>
            </div>

            {/* Video-specific fields */}
            {contentType === CONTENT_TYPES.VIDEO && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium text-gray-800 flex items-center">
                  <Video size={18} className="mr-2 text-blue-500" />
                  Настройки за видео
                </h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL на видеото *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Кратко описание на видеото..."
                  />
                </div>
              </div>
            )}

            {/* Audio-specific fields */}
            {contentType === CONTENT_TYPES.AUDIO && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium text-gray-800 flex items-center">
                  <Music size={18} className="mr-2 text-teal-500" />
                  Настройки за аудио
                </h5>
                
                <AudioUploader
                  courseId={courseId}
                  onUploadComplete={handleAudioUploadComplete}
                />
                
                {audioUploaded && (
                  <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle size={16} className="mr-2" />
                    Аудио файлът е качен успешно
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Кратко описание на аудиото..."
                  />
                </div>
              </div>
            )}

            {/* File-specific fields */}
            {contentType === CONTENT_TYPES.FILE && (
              <div className="space-y-4 border-t pt-4">
                <h5 className="font-medium text-gray-800 flex items-center">
                  <FileText size={18} className="mr-2 text-orange-500" />
                  Настройки за файл
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Име на файла
                    </label>
                    <input
                      type="text"
                      value={formData.fileName}
                      onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="По подразбиране = заглавие"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип на файла
                    </label>
                    <input
                      type="text"
                      value={formData.fileType}
                      onChange={(e) => setFormData({...formData, fileType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Лекция, Програма, Задача..."
                      list="fileTypeSuggestions"
                    />
                    <datalist id="fileTypeSuggestions">
                      {fileTypeSuggestions.map((type) => (
                        <option key={type} value={type} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Drive URL *
                  </label>
                  <input
                    type="url"
                    value={formData.driveUrl}
                    onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://drive.google.com/file/d/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Файлът трябва да е споделен като "Всеки с връзката може да вижда"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Кратко описание на файла..."
                  />
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={!isFormValid()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Добави
              </button>
            </div>
          </form>
        </div>
      </div>
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