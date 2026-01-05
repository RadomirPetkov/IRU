// src/components/TopicManagement.jsx - Компонент за управление на теми в курс
import React, { useState } from 'react';
import {
  FolderPlus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Video,
  Music,
  FileText,
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import {
  addTopicToCourse,
  updateTopic,
  deleteTopic,
  moveContentToTopic,
  CONTENT_TYPES
} from '../firebase/courses';

// Икони за теми
const TOPIC_ICONS = ['📖', '📚', '🎯', '💡', '🔬', '📝', '🎓', '⭐', '🏆', '📊', '🔧', '💻', '🎨', '🎵', '📐', '🌟'];

// Цветове за теми
const TOPIC_COLORS = [
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { name: 'teal', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
];

const getColorClasses = (colorName) => {
  const color = TOPIC_COLORS.find(c => c.name === colorName) || TOPIC_COLORS[0];
  return color;
};

const TopicManagement = ({ 
  courseId, 
  topics = [], 
  content = [], 
  adminEmail,
  onUpdate 
}) => {
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state за нова/редактирана тема
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    icon: '📖',
    color: 'blue'
  });

  const toggleTopic = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const expandAllTopics = () => {
    setExpandedTopics(new Set(topics.map(t => t.id)));
  };

  const collapseAllTopics = () => {
    setExpandedTopics(new Set());
  };

  const getTopicContent = (topicId) => {
    return content
      .filter(c => c.topicId === topicId && c.isActive !== false)
      .sort((a, b) => a.order - b.order);
  };

  const getUncategorizedContent = () => {
    return content
      .filter(c => !c.topicId && c.isActive !== false)
      .sort((a, b) => a.order - b.order);
  };

  const handleAddTopic = async () => {
    if (!topicForm.title.trim()) {
      setError('Заглавието е задължително');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await addTopicToCourse(courseId, {
        title: topicForm.title,
        description: topicForm.description,
        icon: topicForm.icon,
        color: topicForm.color,
        order: topics.length + 1
      }, adminEmail);

      if (result.success) {
        setSuccess('Темата е добавена успешно');
        setShowAddTopic(false);
        setTopicForm({ title: '', description: '', icon: '📖', color: 'blue' });
        if (onUpdate) onUpdate();
        
        // Автоматично разгъваме новата тема
        setExpandedTopics(prev => new Set([...prev, result.data.id]));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Грешка при добавяне на тема');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUpdateTopic = async () => {
    if (!topicForm.title.trim()) {
      setError('Заглавието е задължително');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateTopic(courseId, editingTopic.id, {
        title: topicForm.title,
        description: topicForm.description,
        icon: topicForm.icon,
        color: topicForm.color
      }, adminEmail);

      if (result.success) {
        setSuccess('Темата е обновена успешно');
        setEditingTopic(null);
        setTopicForm({ title: '', description: '', icon: '📖', color: 'blue' });
        if (onUpdate) onUpdate();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Грешка при обновяване на тема');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteTopic = async (topicId, topicTitle) => {
    if (!window.confirm(`Сигурни ли сте, че искате да изтриете темата "${topicTitle}"? Съдържанието ще бъде преместено в "Без тема".`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await deleteTopic(courseId, topicId, adminEmail);

      if (result.success) {
        setSuccess('Темата е изтрита успешно');
        if (onUpdate) onUpdate();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Грешка при изтриване на тема');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleMoveContent = async (contentId, newTopicId) => {
    setLoading(true);
    try {
      const result = await moveContentToTopic(courseId, contentId, newTopicId, adminEmail);
      if (result.success) {
        if (onUpdate) onUpdate();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Грешка при преместване');
    } finally {
      setLoading(false);
    }
  };

  const startEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
      icon: topic.icon || '📖',
      color: topic.color || 'blue'
    });
    setShowAddTopic(false);
  };

  const cancelEdit = () => {
    setEditingTopic(null);
    setShowAddTopic(false);
    setTopicForm({ title: '', description: '', icon: '📖', color: 'blue' });
    setError('');
  };

  const getContentIcon = (type) => {
    switch (type) {
      case CONTENT_TYPES.VIDEO: return <Video size={14} className="text-blue-500" />;
      case CONTENT_TYPES.AUDIO: return <Music size={14} className="text-green-500" />;
      case CONTENT_TYPES.FILE: return <FileText size={14} className="text-orange-500" />;
      default: return <FileText size={14} />;
    }
  };

  const uncategorizedContent = getUncategorizedContent();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BookOpen size={20} className="mr-2" />
          Теми в курса ({topics.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Expand/Collapse All Buttons */}
          {topics.length > 0 && (
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={expandAllTopics}
                className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Разгъни всички"
              >
                <ChevronDown size={14} className="mr-1" />
                Разгъни
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={collapseAllTopics}
                className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Затвори всички"
              >
                <ChevronRight size={14} className="mr-1" />
                Затвори
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              setShowAddTopic(true);
              setEditingTopic(null);
              setTopicForm({ title: '', description: '', icon: '📖', color: 'blue' });
            }}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <FolderPlus size={16} className="mr-2" />
            Добави тема
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle size={16} className="mr-2" />
          {success}
        </div>
      )}

      {/* Add/Edit Topic Form */}
      {(showAddTopic || editingTopic) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-800">
            {editingTopic ? 'Редактиране на тема' : 'Нова тема'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заглавие *
              </label>
              <input
                type="text"
                value={topicForm.title}
                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Напр. Въведение в курса"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <input
                type="text"
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Кратко описание на темата"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Икона
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setTopicForm({ ...topicForm, icon })}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all ${
                      topicForm.icon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвят
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setTopicForm({ ...topicForm, color: color.name })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${color.bg} ${
                      topicForm.color === color.name
                        ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={editingTopic ? handleUpdateTopic : handleAddTopic}
              disabled={loading || !topicForm.title.trim()}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} className="mr-2" />
              {editingTopic ? 'Запази промените' : 'Добави тема'}
            </button>
            
            <button
              onClick={cancelEdit}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X size={16} className="mr-2" />
              Отказ
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-3">
        {topics.sort((a, b) => a.order - b.order).map((topic) => {
          const topicContent = getTopicContent(topic.id);
          const isExpanded = expandedTopics.has(topic.id);
          const colorClasses = getColorClasses(topic.color);

          return (
            <div
              key={topic.id}
              className={`border rounded-lg overflow-hidden ${colorClasses.border}`}
            >
              {/* Topic Header */}
              <div
                className={`flex items-center justify-between p-4 cursor-pointer ${colorClasses.bg}`}
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-gray-600 cursor-grab">
                    <GripVertical size={18} />
                  </button>
                  
                  <span className="text-2xl">{topic.icon || '📖'}</span>
                  
                  <div>
                    <h4 className={`font-semibold ${colorClasses.text}`}>
                      {topic.title}
                    </h4>
                    {topic.description && (
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    )}
                    <span className="text-xs text-gray-500">
                      {topicContent.length} материала
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditTopic(topic);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    title="Редактирай"
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.id, topic.title);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Изтрий"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Topic Content */}
              {isExpanded && (
                <div className="bg-white p-4 border-t">
                  {topicContent.length > 0 ? (
                    <div className="space-y-2">
                      {topicContent.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getContentIcon(item.type)}
                            <span className="text-sm font-medium text-gray-700">
                              {item.title}
                            </span>
                            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-200 rounded">
                              {item.type === CONTENT_TYPES.VIDEO ? 'Видео' :
                               item.type === CONTENT_TYPES.AUDIO ? 'Аудио' : 'Файл'}
                            </span>
                          </div>
                          
                          <select
                            value={item.topicId || ''}
                            onChange={(e) => handleMoveContent(item.id, e.target.value || null)}
                            className="text-xs px-2 py-1 border border-gray-200 rounded bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Без тема</option>
                            {topics.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.icon} {t.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Няма съдържание в тази тема
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Uncategorized Content */}
        {uncategorizedContent.length > 0 && (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
              onClick={() => toggleTopic('uncategorized')}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="font-semibold text-gray-700">Без тема</h4>
                  <span className="text-xs text-gray-500">
                    {uncategorizedContent.length} материала
                  </span>
                </div>
              </div>
              
              {expandedTopics.has('uncategorized') ? (
                <ChevronDown size={20} className="text-gray-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-500" />
              )}
            </div>

            {expandedTopics.has('uncategorized') && (
              <div className="bg-white p-4 border-t">
                <div className="space-y-2">
                  {uncategorizedContent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getContentIcon(item.type)}
                        <span className="text-sm font-medium text-gray-700">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-200 rounded">
                          {item.type === CONTENT_TYPES.VIDEO ? 'Видео' :
                           item.type === CONTENT_TYPES.AUDIO ? 'Аудио' : 'Файл'}
                        </span>
                      </div>
                      
                      <select
                        value=""
                        onChange={(e) => handleMoveContent(item.id, e.target.value || null)}
                        className="text-xs px-2 py-1 border border-gray-200 rounded bg-white"
                      >
                        <option value="">Премести в...</option>
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.icon} {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {topics.length === 0 && uncategorizedContent.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
            <p>Няма теми в този курс</p>
            <p className="text-sm">Добавете теми за да организирате съдържанието</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicManagement;