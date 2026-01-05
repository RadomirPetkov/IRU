// src/components/StudentFileViewer.jsx - Компонент за преглед на файлове с вградена визуализация
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle,
  Eye,
  EyeOff,
  FolderOpen,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File
} from 'lucide-react';

const StudentFileViewer = ({ 
  file, 
  isCompleted = false, 
  onMarkComplete,
  onMarkUncomplete,
  showFullContent = true 
}) => {
  const [expanded, setExpanded] = useState(showFullContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Конвертиране на Google Drive URL към embed URL
  const getEmbedUrl = (driveUrl) => {
    if (!driveUrl) return null;
    
    try {
      // Формат: https://drive.google.com/file/d/FILE_ID/view
      // или: https://drive.google.com/open?id=FILE_ID
      let fileId = null;
      
      if (driveUrl.includes('/file/d/')) {
        fileId = driveUrl.split('/file/d/')[1].split('/')[0];
      } else if (driveUrl.includes('id=')) {
        fileId = driveUrl.split('id=')[1].split('&')[0];
      } else if (driveUrl.includes('/d/')) {
        fileId = driveUrl.split('/d/')[1].split('/')[0];
      }
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      
      return null;
    } catch (e) {
      console.error('Error parsing Drive URL:', e);
      return null;
    }
  };

  // Определяне типа на файла от URL или име
  const getFileExtension = () => {
    const fileName = file.fileName || file.title || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  };

  // Определяне на иконата според типа файл
  const getFileIcon = () => {
    const ext = getFileExtension();
    
    if (['pdf'].includes(ext)) {
      return <FileText size={24} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileText size={24} />;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet size={24} />;
    } else if (['ppt', 'pptx'].includes(ext)) {
      return <Presentation size={24} />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon size={24} />;
    }
    
    return <File size={24} />;
  };

  const embedUrl = getEmbedUrl(file.driveUrl);

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

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Файлът не може да бъде визуализиран. Моля, използвайте бутона за отваряне в нов таб.');
  };

  // Reset loading state when file changes
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [file.driveUrl]);

  return (
    <div className={`bg-white border rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
      isCompleted ? 'border-green-200' : 'border-gray-200 hover:shadow-xl'
    }`}>
      {/* Header */}
      <div className={`p-4 sm:p-6 ${isCompleted ? 'bg-green-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className={`p-2 sm:p-3 rounded-full ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            } text-white flex-shrink-0`}>
              {isCompleted ? <CheckCircle size={20} className="sm:w-6 sm:h-6" /> : getFileIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">
                {file.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                <span className={`px-2 sm:px-3 py-1 rounded-full border font-medium text-xs sm:text-sm ${getFileTypeColor(file.fileType)}`}>
                  <FolderOpen size={12} className="inline mr-1" />
                  {file.fileType || 'Файл'}
                </span>
                
                {isCompleted && (
                  <span className="text-green-600 font-medium flex items-center text-xs sm:text-sm">
                    <CheckCircle size={12} className="mr-1" />
                    Прегледано
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-lg transition-colors ${
                expanded 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={expanded ? 'Свий' : 'Разгъни'}
            >
              {expanded ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Description */}
        {file.description && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {file.description}
            </p>
          </div>
        )}
      </div>

      {/* Content - expandable */}
      {expanded && (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Embedded Preview */}
          {embedUrl ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
                  <Eye size={16} className="mr-2" />
                  Преглед на файла
                </h4>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={file.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    <span className="hidden sm:inline">Нов таб</span>
                  </a>
                </div>
              </div>
              
              {/* Iframe Container */}
              <div className="relative bg-gray-100" style={{ minHeight: '500px' }}>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                      <Loader size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-gray-600">Зареждане на файла...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center p-6">
                      <AlertCircle size={48} className="text-orange-500 mx-auto mb-3" />
                      <p className="text-gray-700 mb-4">{error}</p>
                      <a
                        href={file.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Отвори в Google Drive
                      </a>
                    </div>
                  </div>
                )}
                
                <iframe
                  src={embedUrl}
                  className="w-full border-0"
                  style={{ height: '600px' }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  allow="autoplay"
                  allowFullScreen
                  title={file.title}
                />
              </div>
            </div>
          ) : (
            /* Fallback when can't preview */
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getFileIcon()}
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Този файл не може да бъде визуализиран
                </h4>
                <p className="text-gray-600 mb-4">
                  Моля, отворете файла в Google Drive за да го прегледате.
                </p>
                <a
                  href={file.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Отвори в Google Drive
                </a>
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-green-600 font-medium">
                  <CheckCircle size={16} className="mr-2" />
                  Прегледано
                </div>
                {onMarkUncomplete && (
                  <button
                    onClick={onMarkUncomplete}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Отмени
                  </button>
                )}
              </div>
            )}
            
            <a
              href={file.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium ml-auto"
            >
              <ExternalLink size={16} className="mr-2" />
              Отвори в нов таб
            </a>
          </div>
        </div>
      )}

      {/* Collapsed state - quick action */}
      {!expanded && (
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <Eye size={16} className="mr-2" />
              Прегледай файла
            </button>
            
            <div className="flex items-center space-x-3">
              <a
                href={file.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-gray-700"
              >
                <ExternalLink size={16} className="mr-1" />
                <span className="hidden sm:inline">Нов таб</span>
              </a>
              
              {!isCompleted && onMarkComplete && (
                <button
                  onClick={onMarkComplete}
                  className="flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Маркирай
                </button>
              )}
              
              {isCompleted && (
                <div className="flex items-center space-x-2">
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle size={16} className="mr-1" />
                    Прегледано
                  </span>
                  {onMarkUncomplete && (
                    <button
                      onClick={onMarkUncomplete}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Отмени
                    </button>
                  )}
                </div>
              )}
            </div>
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