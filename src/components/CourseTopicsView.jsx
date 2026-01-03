// src/components/CourseTopicsView.jsx - Студентски изглед на теми в курс
import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  Music,
  FileText,
  CheckCircle,
  Lock,
  BookOpen
} from 'lucide-react';
import { CONTENT_TYPES } from '../firebase/courses';

const CourseTopicsView = ({
  topics = [],
  content = [],
  completedContent = new Set(),
  selectedContentIndex,
  onContentSelect,
  isEnrolled = false
}) => {
  // По подразбиране разгъваме първата тема
  const [expandedTopics, setExpandedTopics] = useState(
    new Set(topics.length > 0 ? [topics[0].id] : ['uncategorized'])
  );

  const toggleTopic = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
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

  const getContentIcon = (type, isCompleted) => {
    if (isCompleted) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    
    switch (type) {
      case CONTENT_TYPES.VIDEO:
        return <Play size={16} className="text-blue-500" />;
      case CONTENT_TYPES.AUDIO:
        return <Music size={16} className="text-teal-500" />;
      case CONTENT_TYPES.FILE:
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTopicProgress = (topicId) => {
    const topicContent = topicId === 'uncategorized' 
      ? getUncategorizedContent() 
      : getTopicContent(topicId);
    
    if (topicContent.length === 0) return { completed: 0, total: 0, percent: 0 };
    
    const completed = topicContent.filter(c => completedContent.has(c.id)).length;
    return {
      completed,
      total: topicContent.length,
      percent: Math.round((completed / topicContent.length) * 100)
    };
  };

  const getColorClasses = (colorName) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', progress: 'bg-blue-500' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', progress: 'bg-green-500' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', progress: 'bg-purple-500' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', progress: 'bg-orange-500' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', progress: 'bg-pink-500' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', progress: 'bg-teal-500' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', progress: 'bg-red-500' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', progress: 'bg-yellow-500' },
    };
    return colors[colorName] || colors.blue;
  };

  const findContentGlobalIndex = (contentId) => {
    return content.findIndex(c => c.id === contentId);
  };

  const uncategorizedContent = getUncategorizedContent();
  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

  // Ако няма теми, показваме всичко в плосък списък
  if (topics.length === 0) {
    return (
      <div className="space-y-2">
        {content
          .filter(c => c.isActive !== false)
          .sort((a, b) => a.order - b.order)
          .map((item, index) => {
            const isCompleted = completedContent.has(item.id);
            const isSelected = selectedContentIndex === index;

            return (
              <div
                key={item.id}
                onClick={() => isEnrolled && onContentSelect(index)}
                className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-100 border-2 border-blue-400'
                    : isCompleted
                      ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                } ${!isEnrolled ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  isCompleted ? 'bg-green-500' :
                  isSelected ? 'bg-blue-500' : 'bg-gray-200'
                } ${isCompleted || isSelected ? 'text-white' : 'text-gray-600'}`}>
                  {getContentIcon(item.type, isCompleted)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm truncate ${
                    isSelected ? 'text-blue-700' : 'text-gray-800'
                  }`}>
                    {item.title}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {item.type === CONTENT_TYPES.VIDEO ? 'Видео' :
                     item.type === CONTENT_TYPES.AUDIO ? 'Аудио' :
                     item.fileType || 'Файл'}
                  </span>
                </div>

                {!isEnrolled && (
                  <Lock size={14} className="text-gray-400 ml-2" />
                )}
              </div>
            );
          })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTopics.map((topic) => {
        const topicContent = getTopicContent(topic.id);
        const isExpanded = expandedTopics.has(topic.id);
        const progress = getTopicProgress(topic.id);
        const colorClasses = getColorClasses(topic.color);

        return (
          <div
            key={topic.id}
            className={`border rounded-xl overflow-hidden ${colorClasses.border}`}
          >
            {/* Topic Header */}
            <div
              className={`flex items-center justify-between p-4 cursor-pointer ${colorClasses.bg} hover:opacity-90 transition-opacity`}
              onClick={() => toggleTopic(topic.id)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{topic.icon || '📖'}</span>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${colorClasses.text} truncate`}>
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="text-xs text-gray-600 truncate">{topic.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Progress */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClasses.progress} transition-all duration-300`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {progress.completed}/{progress.total}
                  </span>
                </div>

                {isExpanded ? (
                  <ChevronDown size={20} className="text-gray-500" />
                ) : (
                  <ChevronRight size={20} className="text-gray-500" />
                )}
              </div>
            </div>

            {/* Topic Content */}
            {isExpanded && (
              <div className="bg-white p-3 space-y-2">
                {topicContent.length > 0 ? (
                  topicContent.map((item) => {
                    const globalIndex = findContentGlobalIndex(item.id);
                    const isCompleted = completedContent.has(item.id);
                    const isSelected = selectedContentIndex === globalIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => isEnrolled && onContentSelect(globalIndex)}
                        className={`flex items-center p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-blue-100 border-2 border-blue-400'
                            : isCompleted
                              ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        } ${isEnrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isSelected ? 'bg-blue-500 text-white' : 
                          item.type === CONTENT_TYPES.VIDEO ? 'bg-blue-100 text-blue-600' :
                          item.type === CONTENT_TYPES.AUDIO ? 'bg-teal-100 text-teal-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle size={16} />
                          ) : item.type === CONTENT_TYPES.VIDEO ? (
                            <Play size={16} />
                          ) : item.type === CONTENT_TYPES.AUDIO ? (
                            <Music size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm truncate ${
                            isSelected ? 'text-blue-700' : 'text-gray-800'
                          }`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {item.type === CONTENT_TYPES.VIDEO ? 'Видео' :
                               item.type === CONTENT_TYPES.AUDIO ? 'Аудио' : 
                               item.fileType || 'Файл'}
                            </span>
                          </div>
                        </div>

                        {isCompleted && (
                          <span className="text-xs text-green-600 font-medium ml-2 hidden sm:block">
                            ✓
                          </span>
                        )}

                        {!isEnrolled && (
                          <Lock size={14} className="text-gray-400 ml-2" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Няма материали в тази тема
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized Content */}
      {uncategorizedContent.length > 0 && (
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-150 transition-colors"
            onClick={() => toggleTopic('uncategorized')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📁</span>
              <div>
                <h3 className="font-semibold text-gray-700">Допълнителни материали</h3>
                <span className="text-xs text-gray-500">
                  {getTopicProgress('uncategorized').completed}/{uncategorizedContent.length} завършени
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
            <div className="bg-white p-3 space-y-2">
              {uncategorizedContent.map((item) => {
                const globalIndex = findContentGlobalIndex(item.id);
                const isCompleted = completedContent.has(item.id);
                const isSelected = selectedContentIndex === globalIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => isEnrolled && onContentSelect(globalIndex)}
                    className={`flex items-center p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : isCompleted
                          ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    } ${isEnrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getContentIcon(item.type, isCompleted)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${
                        isSelected ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {item.type === CONTENT_TYPES.VIDEO ? 'Видео' :
                         item.type === CONTENT_TYPES.AUDIO ? 'Аудио' :
                         item.fileType || 'Файл'}
                      </span>
                    </div>

                    {!isEnrolled && (
                      <Lock size={14} className="text-gray-400 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {topics.length === 0 && uncategorizedContent.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
          <p>Този курс все още няма съдържание</p>
        </div>
      )}
    </div>
  );
};

export default CourseTopicsView;