// src/components/ContentOrderManager.jsx - Компонент за подреждане на теми и съдържание
import React, { useState, useEffect } from 'react';
import {
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  Video,
  FileText,
  Music,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Layers,
  BookOpen
} from 'lucide-react';
import { updateCourse, reorderTopics, CONTENT_TYPES } from '../firebase/courses';

const ContentOrderManager = ({ course, onClose, onUpdate, adminEmail }) => {
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'topics'
  const [contentItems, setContentItems] = useState([]);
  const [topicItems, setTopicItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Инициализация
  useEffect(() => {
    // Подготви съдържание
    const content = course.content || [];
    const sortedContent = [...content].sort((a, b) => (a.order || 0) - (b.order || 0));
    setContentItems(sortedContent);

    // Подготви теми
    const topics = course.topics || [];
    const sortedTopics = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));
    setTopicItems(sortedTopics);
  }, [course]);

  // Намери темата за даден елемент от съдържанието
  const getTopicForContent = (contentItem) => {
    if (!contentItem.topicId) return null;
    return topicItems.find(t => t.id === contentItem.topicId);
  };

  // Преместване на съдържание нагоре
  const moveContentUp = (index) => {
    if (index === 0) return;
    const newItems = [...contentItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setContentItems(newItems);
    setHasChanges(true);
  };

  // Преместване на съдържание надолу
  const moveContentDown = (index) => {
    if (index === contentItems.length - 1) return;
    const newItems = [...contentItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setContentItems(newItems);
    setHasChanges(true);
  };

  // Преместване на тема нагоре
  const moveTopicUp = (index) => {
    if (index === 0) return;
    const newItems = [...topicItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setTopicItems(newItems);
    setHasChanges(true);
  };

  // Преместване на тема надолу
  const moveTopicDown = (index) => {
    if (index === topicItems.length - 1) return;
    const newItems = [...topicItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setTopicItems(newItems);
    setHasChanges(true);
  };

  // Запазване на промените
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Запази подредбата на съдържанието
      const updatedContent = contentItems.map((item, index) => ({
        ...item,
        order: index + 1
      }));

      const contentResult = await updateCourse(course.id, {
        content: updatedContent
      }, adminEmail);

      if (!contentResult.success) {
        setError(contentResult.error || 'Грешка при запазване на съдържание');
        setSaving(false);
        return;
      }

      // Запази подредбата на темите
      if (topicItems.length > 0) {
        const topicIds = topicItems.map(t => t.id);
        const topicsResult = await reorderTopics(course.id, topicIds, adminEmail);
        
        if (!topicsResult.success) {
          setError(topicsResult.error || 'Грешка при запазване на теми');
          setSaving(false);
          return;
        }
      }

      setSuccess('Подредбата е запазена успешно');
      setHasChanges(false);
      
      if (onUpdate) {
        onUpdate();
      }

      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Грешка при запазване');
    } finally {
      setSaving(false);
    }
  };

  // Икона за тип съдържание
  const getContentIcon = (item) => {
    if (item.type === CONTENT_TYPES.VIDEO) {
      return <Video size={16} className="text-blue-500" />;
    }
    if (item.fileType === 'Аудио' || item.audioUrl) {
      return <Music size={16} className="text-purple-500" />;
    }
    return <FileText size={16} className="text-green-500" />;
  };

  // Тип на съдържанието като текст
  const getContentTypeText = (item) => {
    if (item.type === CONTENT_TYPES.VIDEO) return 'Видео';
    if (item.fileType === 'Аудио' || item.audioUrl) return 'Аудио';
    return item.fileType || 'Файл';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Подреждане - {course.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Layers size={18} />
            <span>Съдържание ({contentItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'topics'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={18} />
            <span>Теми ({topicItems.length})</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-4 mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mx-4 mt-4 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle size={16} className="mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-2">
              {contentItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Няма съдържание за подреждане</p>
                </div>
              ) : (
                contentItems.map((item, index) => {
                  const topic = getTopicForContent(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 mr-3 cursor-move">
                        <GripVertical size={20} />
                      </div>

                      {/* Order Number */}
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium text-sm mr-3 flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Content Icon */}
                      <div className="mr-3 flex-shrink-0">
                        {getContentIcon(item)}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                          <span>{getContentTypeText(item)}</span>
                          {topic && (
                            <span className="flex items-center bg-gray-200 px-2 py-0.5 rounded">
                              <FolderOpen size={10} className="mr-1" />
                              {topic.icon} {topic.title}
                            </span>
                          )}
                          {!topic && item.topicId && (
                            <span className="text-orange-500 italic">Тема не е намерена</span>
                          )}
                          {!item.topicId && (
                            <span className="text-gray-400 italic">Без тема</span>
                          )}
                        </div>
                      </div>

                      {/* Move Buttons */}
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => moveContentUp(index)}
                          disabled={index === 0}
                          className={`p-1.5 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Премести нагоре"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => moveContentDown(index)}
                          disabled={index === contentItems.length - 1}
                          className={`p-1.5 rounded transition-colors ${
                            index === contentItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Премести надолу"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="space-y-2">
              {topicItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Няма теми за подреждане</p>
                </div>
              ) : (
                topicItems.map((topic, index) => {
                  // Брой съдържание в темата
                  const contentCount = contentItems.filter(c => c.topicId === topic.id).length;
                  
                  return (
                    <div
                      key={topic.id}
                      className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 mr-3 cursor-move">
                        <GripVertical size={20} />
                      </div>

                      {/* Order Number */}
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-medium text-sm mr-3 flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Topic Icon */}
                      <div className="text-2xl mr-3 flex-shrink-0">
                        {topic.icon || '📖'}
                      </div>

                      {/* Topic Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate">{topic.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                          <span>{contentCount} {contentCount === 1 ? 'материал' : 'материала'}</span>
                          {topic.description && (
                            <span className="truncate max-w-[200px]">{topic.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Move Buttons */}
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => moveTopicUp(index)}
                          disabled={index === 0}
                          className={`p-1.5 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Премести нагоре"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => moveTopicDown(index)}
                          disabled={index === topicItems.length - 1}
                          className={`p-1.5 rounded transition-colors ${
                            index === topicItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Премести надолу"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {hasChanges ? (
              <span className="text-orange-600 font-medium">● Има незапазени промени</span>
            ) : (
              <span>Използвайте стрелките за да преместите елементите</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Затвори
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                saving || !hasChanges
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Запази подредбата
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentOrderManager;