// src/components/StudentFileViewer.jsx - Компонент за преглед на файлове от студенти
import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle,
  Eye,
  EyeOff,
  FolderOpen
} from 'lucide-react';

const StudentFileViewer = ({ 
  file, 
  isCompleted = false, 
  onMarkComplete,
  showFullContent = false 
}) => {
  const [expanded, setExpanded] = useState(showFullContent);

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'Лекция': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Програма': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Задача': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Упражнение': return 'bg-green-100 text-green-800 border-green-200';
      case 'Материал': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Презентация': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleOpenFile = () => {
    if (file.driveUrl) {
      window.open(file.driveUrl, '_blank', 'noopener,noreferrer');
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
              {isCompleted ? <CheckCircle size={24} /> : <FileText size={24} />}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {file.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-3 py-1 rounded-full border font-medium ${getFileTypeColor(file.fileType)}`}>
                  <FolderOpen size={12} className="inline mr-1" />
                  {file.fileType || 'Файл'}
                </span>
                
                {file.fileName && file.fileName !== file.title && (
                  <span className="text-gray-500">({file.fileName})</span>
                )}

                {isCompleted && (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Прегледано
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
            {expanded ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Description - always visible */}
        {file.description && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed">
              {file.description}
            </p>
          </div>
        )}
      </div>

      {/* Content - expandable */}
      {expanded && (
        <div className="p-6 space-y-6">
          
          {/* Google Drive Link */}
          {file.driveUrl && (
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FileText size={18} className="mr-2" />
                Файл от Google Drive
              </h4>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 mb-1 truncate">
                      {file.fileName || file.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Кликнете за да отворите файла в Google Drive
                    </p>
                  </div>
                  
                  <a
                    href={file.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={(e) => {
                      // Track the click if needed
                    }}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Отвори файла
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {!isCompleted && onMarkComplete && (
              <button
                onClick={onMarkComplete}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle size={16} className="mr-2" />
                Маркирай като прегледано
              </button>
            )}
            
            {isCompleted && (
              <div className="flex items-center text-green-600 font-medium">
                <CheckCircle size={16} className="mr-2" />
                Този файл е маркиран като прегледан
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed state - quick action */}
      {!expanded && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={handleOpenFile}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink size={16} className="mr-2" />
              Отвори в Google Drive
            </button>
            
            {!isCompleted && onMarkComplete && (
              <button
                onClick={onMarkComplete}
                className="flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                <CheckCircle size={16} className="mr-2" />
                Маркирай
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Компактна версия за списъци
export const StudentFileCard = ({ 
  file, 
  isCompleted = false, 
  onClick,
  onMarkComplete 
}) => {
  const getFileTypeColor = (type) => {
    switch (type) {
      case 'Лекция': return 'bg-blue-100 text-blue-800';
      case 'Програма': return 'bg-purple-100 text-purple-800';
      case 'Задача': return 'bg-orange-100 text-orange-800';
      case 'Упражнение': return 'bg-green-100 text-green-800';
      case 'Материал': return 'bg-yellow-100 text-yellow-800';
      case 'Презентация': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isCompleted 
          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`p-2 rounded-full ${
            isCompleted ? 'bg-green-500' : 'bg-blue-500'
          } text-white flex-shrink-0`}>
            {isCompleted ? <CheckCircle size={18} /> : <FileText size={18} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 truncate">
              {file.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                {file.fileType || 'Файл'}
              </span>
              {isCompleted && (
                <span className="text-green-600 text-xs flex items-center">
                  <CheckCircle size={10} className="mr-1" />
                  Прегледано
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <a
            href={file.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Отвори в Google Drive"
          >
            <ExternalLink size={18} />
          </a>
          
          {!isCompleted && onMarkComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete();
              }}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Маркирай като прегледано"
            >
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFileViewer;