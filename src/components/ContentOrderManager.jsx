// src/components/ContentOrderManager.jsx - Компонент за подреждане на съдържание
import React, { useState, useEffect } from 'react';
import {
  GripVertical,
  Video,
  FileText,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Move3D
} from 'lucide-react';
import { CONTENT_TYPES } from '../firebase/courses';
import { updateCourse } from '../firebase/courses';

const ContentOrderManager = ({ 
  course, 
  onClose, 
  onUpdate, 
  adminEmail 
}) => {
  const [content, setContent] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  useEffect(() => {
    if (course?.content) {
      // Създаваме копие на съдържанието и го сортираме по order
      const sortedContent = [...course.content].sort((a, b) => (a.order || 0) - (b.order || 0));
      setContent(sortedContent);
    }
  }, [course]);

  const getContentIcon = (type) => {
    return type === CONTENT_TYPES.VIDEO ? 
      <Video size={16} className="text-blue-600" /> : 
      <FileText size={16} className="text-green-600" />;
  };

  const getContentTypeLabel = (type) => {
    return type === CONTENT_TYPES.VIDEO ? 'Видео' : 'Задача';
  };

  const moveItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newContent = [...content];
    const [movedItem] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, movedItem);

    // Обновяваме order номерата
    const updatedContent = newContent.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setContent(updatedContent);
    setHasChanges(true);
  };

  const moveUp = (index) => {
    if (index > 0) {
      moveItem(index, index - 1);
    }
  };

  const moveDown = (index) => {
    if (index < content.length - 1) {
      moveItem(index, index + 1);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem !== null && draggedItem !== index) {
      setDragOverItem(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    
    if (draggedItem !== null && draggedItem !== index) {
      moveItem(draggedItem, index);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const resetOrder = () => {
    if (course?.content) {
      const originalContent = [...course.content].sort((a, b) => (a.order || 0) - (b.order || 0));
      setContent(originalContent);
      setHasChanges(false);
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      // Подготвяме новото съдържание с обновените order номера
      const updatedContent = content.map((item, index) => ({
        ...item,
        order: index + 1
      }));

      // Актуализираме курса с новото подреждане
      const result = await updateCourse(course.id, { content: updatedContent }, adminEmail);
      
      if (result.success) {
        setHasChanges(false);
        onUpdate?.();
        // Показваме успех за кратко
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } else {
        throw new Error(result.error || 'Грешка при запазване');
      }
    } catch (error) {
      console.error('Error saving content order:', error);
      alert('Грешка при запазване на подреждането: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!course?.content || course.content.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <FileText className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Няма съдържание
            </h3>
            <p className="text-gray-600 mb-6">
              Този курс не съдържа видеа или задачи за подреждане
            </p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Затвори
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Подреждане на съдържание
            </h2>
            <p className="text-gray-600 mt-1">
              {course.title} • {content.length} елемента
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto max-h-[60vh] p-6">
          <div className="space-y-2">
            {content.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-move
                  hover:bg-gray-100 hover:shadow-md
                  ${draggedItem === index ? 'opacity-50 transform rotate-2' : ''}
                  ${dragOverItem === index ? 'border-blue-500 bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* Drag Handle */}
                  <div className="flex items-center text-gray-400 hover:text-gray-600">
                    <GripVertical size={20} />
                  </div>

                  {/* Order Number */}
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getContentIcon(item.type)}
                      <span className="text-sm font-medium text-gray-600">
                        {getContentTypeLabel(item.type)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      {item.title}
                    </h4>
                    {item.duration && (
                      <p className="text-sm text-gray-500">
                        Продължitelност: {item.duration}
                      </p>
                    )}
                    {item.estimatedTime && (
                      <p className="text-sm text-gray-500">
                        Очаквано време: {item.estimatedTime}
                      </p>
                    )}
                  </div>

                  {/* Manual Move Buttons */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Премести нагоре"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === content.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Премести надолу"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center text-sm text-blue-700">
            <AlertCircle size={16} className="mr-2" />
            <span>
              Използвайте drag & drop или стрелките за промяна на реда. 
              Промените ще се отразят при запазване.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle size={16} className="mr-1" />
                Има незапазени промени
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={resetOrder}
              disabled={!hasChanges || saving}
              className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={16} className="mr-1" />
              Нулирай
            </button>

            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            >
              Отказ
            </button>

            <button
              onClick={saveOrder}
              disabled={!hasChanges || saving}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Запази подреждането
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saving && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-700">Запазване на новото подреждане...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentOrderManager;