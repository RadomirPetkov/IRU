// src/components/StudentAssignmentViewer.jsx
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  BookOpen,
  Target,
  HelpCircle
} from 'lucide-react';
import { ASSIGNMENT_TYPES } from '../firebase/courses';

const StudentAssignmentViewer = ({ 
  assignment, 
  isCompleted = false, 
  onMarkComplete,
  showFullContent = false 
}) => {
  const [expanded, setExpanded] = useState(showFullContent);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Лесно';
      case 'medium': return 'Средно';
      case 'hard': return 'Трудно';
      default: return 'Неопределено';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case ASSIGNMENT_TYPES.DOCUMENT: return <FileText size={20} />;
      case ASSIGNMENT_TYPES.TEXT: return <HelpCircle size={20} />;
      case ASSIGNMENT_TYPES.LINK: return <ExternalLink size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case ASSIGNMENT_TYPES.DOCUMENT: return 'Документ';
      case ASSIGNMENT_TYPES.TEXT: return 'Текстова задача';
      case ASSIGNMENT_TYPES.LINK: return 'Външна връзка';
      default: return 'Неизвестен тип';
    }
  };

  return (
    <div className={`bg-white border rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-xl'
    }`}>
      {/* Header */}
      <div className={`p-6 ${isCompleted ? 'bg-green-100' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            } text-white flex-shrink-0`}>
              {isCompleted ? <CheckCircle size={24} /> : getTypeIcon(assignment.assignmentType)}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {assignment.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full border font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                  <Target size={12} className="inline mr-1" />
                  {getDifficultyLabel(assignment.difficulty)}
                </span>
                
                <span className="flex items-center text-gray-600">
                  <Clock size={12} className="mr-1" />
                  {assignment.estimatedTime || '30 мин'}
                </span>
                
                <span className="flex items-center text-gray-600">
                  <BookOpen size={12} className="mr-1" />
                  {getTypeLabel(assignment.assignmentType)}
                </span>

                {isCompleted && (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Завършено
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg transition-colors ${
              expanded 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={expanded ? 'Свий' : 'Разгъни'}
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed">
              {assignment.description}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          
          {/* Instructions */}
          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <AlertCircle size={16} className="mr-2" />
                Инструкции за изпълнение
              </h4>
              <div className="text-blue-700 leading-relaxed whitespace-pre-wrap">
                {assignment.instructions}
              </div>
            </div>
          )}

          {/* Assignment Content */}
          <div className="space-y-4">
            {assignment.assignmentType === ASSIGNMENT_TYPES.DOCUMENT && assignment.documentUrl && (
              <DocumentAssignment assignment={assignment} />
            )}

            {assignment.assignmentType === ASSIGNMENT_TYPES.TEXT && assignment.textContent && (
              <TextAssignment assignment={assignment} />
            )}

            {assignment.assignmentType === ASSIGNMENT_TYPES.LINK && assignment.linkUrl && (
              <LinkAssignment assignment={assignment} />
            )}
          </div>

          {/* Completion Button */}
          {!isCompleted && onMarkComplete && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Завършихте ли тази задача?</p>
                  <p className="text-xs mt-1">Маркирайте като завършена когато приключите упражнението</p>
                </div>
                
                <button
                  onClick={() => onMarkComplete(assignment.id)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Маркирай като завършено
                </button>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div className="border-t border-green-200 pt-6">
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                <p className="font-semibold text-green-800 mb-1">Задачата е завършена! 🎉</p>
                <p className="text-green-700 text-sm">Отлична работа! Можете да продължите с следващото съдържание.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Компонент за документ задача
const DocumentAssignment = ({ assignment }) => {
  const handleDownload = () => {
    if (assignment.documentUrl) {
      window.open(assignment.documentUrl, '_blank');
    }
  };

  const getFileTypeInfo = (url) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    switch (fileExtension) {
      case 'pdf':
        return { type: 'PDF документ', color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'doc':
      case 'docx':
        return { type: 'Word документ', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'xls':
      case 'xlsx':
        return { type: 'Excel таблица', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'ppt':
      case 'pptx':
        return { type: 'PowerPoint презентация', color: 'text-orange-600', bgColor: 'bg-orange-100' };
      default:
        return { type: 'Документ', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const fileInfo = getFileTypeInfo(assignment.documentUrl);

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <FileText size={18} className="mr-2" />
        Файл за изтегляне
      </h4>
      
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${fileInfo.bgColor}`}>
            <FileText className={fileInfo.color} size={24} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{fileInfo.type}</p>
            <p className="text-sm text-gray-600">Кликнете за отваряне/изтегляне</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm font-medium"
          >
            <Download size={16} className="mr-2" />
            Отвори файла
          </button>
        </div>
      </div>

      {assignment.downloadable && (
        <div className="mt-3 text-xs text-gray-600 flex items-center">
          <Download size={12} className="mr-1" />
          Файлът може да бъде изтеглен за работа офлайн
        </div>
      )}
    </div>
  );
};

// Компонент за текстова задача
const TextAssignment = ({ assignment }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <HelpCircle size={18} className="mr-2" />
        Задача за решаване
      </h4>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
            {assignment.textContent}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <Clock size={12} className="mr-1" />
          Препоръчано време за решаване: {assignment.estimatedTime || '30 мин'}
        </p>
      </div>
    </div>
  );
};

// Компонент за външна връзка
const LinkAssignment = ({ assignment }) => {
  const handleLinkClick = () => {
    if (assignment.linkUrl) {
      if (assignment.openInNewTab) {
        window.open(assignment.linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = assignment.linkUrl;
      }
    }
  };

  const getDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <ExternalLink size={18} className="mr-2" />
        Външен ресурс
      </h4>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-800 mb-1">Външна връзка за упражнение</p>
            <p className="text-sm text-gray-600 mb-3">
              Домейн: {getDomainFromUrl(assignment.linkUrl)}
            </p>
            <p className="text-xs text-gray-500">
              {assignment.openInNewTab 
                ? 'Връзката ще се отвори в нов таб' 
                : 'Връзката ще се отвори в същия таб'
              }
            </p>
          </div>
          
          <button
            onClick={handleLinkClick}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
          >
            <ExternalLink size={16} className="mr-2" />
            Отвори връзката
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentViewer;