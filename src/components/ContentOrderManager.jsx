// src/components/ContentOrderManager.jsx - Компонент за подреждане на теми и съдържание с drag & drop
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Save,
  Video,
  FileText,
  Music,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Layers,
  BookOpen,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { updateCourse, reorderTopics, CONTENT_TYPES } from '../firebase/courses';

const ContentOrderManager = ({ course, onClose, onUpdate, adminEmail }) => {
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'topics'
  const [contentItems, setContentItems] = useState([]);
  const [topicItems, setTopicItems] = useState([]);
  const [originalContent, setOriginalContent] = useState([]);
  const [originalTopics, setOriginalTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragNode = useRef(null);

  // Инициализация
  useEffect(() => {
    // Подготви съдържание
    const content = course.content || [];
    const sortedContent = [...content].sort((a, b) => (a.order || 0) - (b.order || 0));
    setContentItems(sortedContent);
    setOriginalContent(sortedContent);

    // Подготви теми
    const topics = course.topics || [];
    const sortedTopics = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));
    setTopicItems(sortedTopics);
    setOriginalTopics(sortedTopics);
  }, [course]);

  // Намери темата за даден елемент от съдържанието
  const getTopicForContent = (contentItem) => {
    if (!contentItem.topicId) return null;
    return topicItems.find(t => t.id === contentItem.topicId);
  };

  // ==================== DRAG AND DROP ====================
  
  const handleDragStart = (e, index, type) => {
    setDraggedItem({ index, type });
    setIsDragging(true);
    dragNode.current = e.target;
    
    // Добави визуален ефект след кратко забавяне
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.classList.add('opacity-50');
      }
    }, 0);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (e, index, type) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === type && draggedItem.index !== index) {
      setDraggedOverItem({ index, type });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex, type) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.type !== type) return;
    
    const sourceIndex = draggedItem.index;
    
    if (sourceIndex === targetIndex) {
      resetDragState();
      return;
    }

    if (type === 'content') {
      const newItems = [...contentItems];
      const [draggedElement] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, draggedElement);
      setContentItems(newItems);
    } else {
      const newItems = [...topicItems];
      const [draggedElement] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, draggedElement);
      setTopicItems(newItems);
    }
    
    setHasChanges(true);
    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    if (dragNode.current) {
      dragNode.current.classList.remove('opacity-50');
    }
    setDraggedItem(null);
    setDraggedOverItem(null);
    setIsDragging(false);
    dragNode.current = null;
  };

  // ==================== СТРЕЛКИ ЗА ПРЕМЕСТВАНЕ ====================

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

  // Преместване на съдържание в началото
  const moveContentToTop = (index) => {
    if (index === 0) return;
    const newItems = [...contentItems];
    const [item] = newItems.splice(index, 1);
    newItems.unshift(item);
    setContentItems(newItems);
    setHasChanges(true);
  };

  // Преместване на съдържание в края
  const moveContentToBottom = (index) => {
    if (index === contentItems.length - 1) return;
    const newItems = [...contentItems];
    const [item] = newItems.splice(index, 1);
    newItems.push(item);
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

  // Преместване на тема в началото
  const moveTopicToTop = (index) => {
    if (index === 0) return;
    const newItems = [...topicItems];
    const [item] = newItems.splice(index, 1);
    newItems.unshift(item);
    setTopicItems(newItems);
    setHasChanges(true);
  };

  // Преместване на тема в края
  const moveTopicToBottom = (index) => {
    if (index === topicItems.length - 1) return;
    const newItems = [...topicItems];
    const [item] = newItems.splice(index, 1);
    newItems.push(item);
    setTopicItems(newItems);
    setHasChanges(true);
  };

  // Възстановяване на оригиналната подредба
  const resetOrder = () => {
    setContentItems([...originalContent]);
    setTopicItems([...originalTopics]);
    setHasChanges(false);
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
      setOriginalContent([...contentItems]);
      setOriginalTopics([...topicItems]);
      
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

  // Проверка дали елементът е в зоната за пускане
  const isDropTarget = (index, type) => {
    return draggedOverItem && 
           draggedOverItem.index === index && 
           draggedOverItem.type === type &&
           draggedItem &&
           draggedItem.index !== index;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Подреждане - {course.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <ArrowUpDown size={14} className="mr-1" />
              Плъзгайте елементите или използвайте бутоните
            </p>
          </div>
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
            <div className="space-y-1">
              {contentItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Няма съдържание за подреждане</p>
                </div>
              ) : (
                contentItems.map((item, index) => {
                  const topic = getTopicForContent(item);
                  const isBeingDragged = draggedItem?.type === 'content' && draggedItem?.index === index;
                  const isDropZone = isDropTarget(index, 'content');
                  
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index, 'content')}
                      onDragEnter={(e) => handleDragEnter(e, index, 'content')}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index, 'content')}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center rounded-lg p-3 transition-all duration-150 cursor-move select-none
                        ${isBeingDragged ? 'opacity-50 bg-blue-100 border-2 border-blue-400' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                        ${isDropZone ? 'border-2 border-blue-500 border-dashed bg-blue-50 transform scale-[1.02]' : ''}
                      `}
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 mr-3 cursor-grab active:cursor-grabbing hover:text-gray-600">
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
                      <div className="flex items-center space-x-0.5 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveContentToTop(index); }}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="В началото"
                        >
                          <ChevronsUp size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveContentUp(index); }}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Нагоре"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveContentDown(index); }}
                          disabled={index === contentItems.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === contentItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Надолу"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveContentToBottom(index); }}
                          disabled={index === contentItems.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === contentItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title="В края"
                        >
                          <ChevronsDown size={16} />
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
            <div className="space-y-1">
              {topicItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Няма теми за подреждане</p>
                </div>
              ) : (
                topicItems.map((topic, index) => {
                  // Брой съдържание в темата
                  const contentCount = contentItems.filter(c => c.topicId === topic.id).length;
                  const isBeingDragged = draggedItem?.type === 'topics' && draggedItem?.index === index;
                  const isDropZone = isDropTarget(index, 'topics');
                  
                  return (
                    <div
                      key={topic.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index, 'topics')}
                      onDragEnter={(e) => handleDragEnter(e, index, 'topics')}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index, 'topics')}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center rounded-lg p-3 transition-all duration-150 cursor-move select-none
                        ${isBeingDragged ? 'opacity-50 bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                        ${isDropZone ? 'border-2 border-purple-500 border-dashed bg-purple-50 transform scale-[1.02]' : ''}
                      `}
                    >
                      {/* Drag Handle */}
                      <div className="text-gray-400 mr-3 cursor-grab active:cursor-grabbing hover:text-gray-600">
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
                      <div className="flex items-center space-x-0.5 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveTopicToTop(index); }}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="В началото"
                        >
                          <ChevronsUp size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveTopicUp(index); }}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Нагоре"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveTopicDown(index); }}
                          disabled={index === topicItems.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === topicItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Надолу"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveTopicToBottom(index); }}
                          disabled={index === topicItems.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === topicItems.length - 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="В края"
                        >
                          <ChevronsDown size={16} />
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
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <button
                onClick={resetOrder}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
              >
                <RotateCcw size={14} className="mr-1" />
                Върни оригинала
              </button>
            )}
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-orange-600 font-medium">● Има незапазени промени</span>
              ) : (
                <span className="hidden sm:inline">Плъзгайте или използвайте бутоните</span>
              )}
            </div>
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