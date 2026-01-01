// src/components/FileManagement.jsx - Управление на файлове в курс
import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Link as LinkIcon,
  ExternalLink,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { 
  addContentToCourse, 
  updateContentInCourse,
  removeContentFromCourse,
  validateFileData,
  CONTENT_TYPES,
  FILE_TYPES 
} from '../firebase/courses';

const FileManagement = ({ 
  courseId, 
  files = [], 
  onUpdate, 
  adminEmail 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateFile = async (fileData) => {
    setLoading(true);
    try {
      const contentData = {
        type: CONTENT_TYPES.FILE,
        ...fileData
      };

      const validation = validateFileData(contentData);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      const result = await addContentToCourse(courseId, contentData, adminEmail);
      
      if (result.success) {
        setShowCreateForm(false);
        setError('');
        onUpdate?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при добавяне на файл');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFile = async (fileId, fileData) => {
    setLoading(true);
    try {
      const validation = validateFileData(fileData);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      const result = await updateContentInCourse(courseId, fileId, fileData, adminEmail);
      
      if (result.success) {
        setEditingFile(null);
        setError('');
        onUpdate?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при актуализиране на файл');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този файл?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeContentFromCourse(courseId, fileId, adminEmail);
      
      if (result.success) {
        onUpdate?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при изтриване на файл');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Файлове</h3>
          <p className="text-gray-600">Управление на файлове от Google Drive</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
        >
          <Plus size={16} className="mr-2" />
          Нов файл
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-4">
        {files.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FolderOpen className="text-gray-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Няма файлове</h4>
            <p className="text-gray-600 mb-4">Добавете първия файл за този курс</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Добави първия файл
            </button>
          </div>
        ) : (
          files.map((file, index) => (
            <FileCard
              key={file.id}
              file={file}
              index={index}
              isEditing={editingFile?.id === file.id}
              onEdit={setEditingFile}
              onDelete={handleDeleteFile}
              onUpdate={handleUpdateFile}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Create File Form */}
      {showCreateForm && (
        <FileForm
          onSubmit={handleCreateFile}
          onCancel={() => setShowCreateForm(false)}
          loading={loading}
          fileCount={files.length}
        />
      )}
    </div>
  );
};

// Компонент за карта на файл
const FileCard = ({ 
  file, 
  index, 
  isEditing, 
  onEdit, 
  onDelete, 
  onUpdate,
  loading 
}) => {
  const [editData, setEditData] = useState({
    title: file.title,
    fileName: file.fileName,
    fileType: file.fileType,
    driveUrl: file.driveUrl,
    description: file.description
  });

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

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-4">Редактиране на файл</h4>
        
        <FileForm
          initialData={editData}
          onSubmit={(data) => onUpdate(file.id, data)}
          onCancel={() => onEdit(null)}
          loading={loading}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-green-100 rounded-full p-2 text-green-600">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{file.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.fileType)}`}>
                  {file.fileType || 'Друго'}
                </span>
                {file.fileName && file.fileName !== file.title && (
                  <span className="text-gray-500">({file.fileName})</span>
                )}
              </div>
            </div>
          </div>

          {file.description && (
            <p className="text-gray-700 mb-3">{file.description}</p>
          )}

          {/* Google Drive Link */}
          {file.driveUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 flex items-center">
                  <LinkIcon size={14} className="mr-2" />
                  Google Drive връзка
                </span>
                <a
                  href={file.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Отвори
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(file)}
            disabled={loading}
            className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors disabled:opacity-50"
            title="Редактирай файл"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(file.id)}
            disabled={loading}
            className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors disabled:opacity-50"
            title="Изтрий файл"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Формуляр за създаване/редактиране на файл
const FileForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false, 
  fileCount = 0,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    fileName: initialData.fileName || '',
    fileType: initialData.fileType || '',
    driveUrl: initialData.driveUrl || '',
    description: initialData.description || '',
    order: initialData.order || fileCount + 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fileName: formData.fileName || formData.title
    });
  };

  // Предложения за типове файлове
  const fileTypeSuggestions = Object.values(FILE_TYPES);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4">
        {isEditing ? 'Редактиране на файл' : 'Нов файл от Google Drive'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Име на файла */}
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
              placeholder="Например: Лекция 1 - Въведение"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Име на файла
            </label>
            <input
              type="text"
              value={formData.fileName}
              onChange={(e) => setFormData({...formData, fileName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Например: lecture_01.pdf (по подразбиране = заглавие)"
            />
          </div>
        </div>

        {/* Тип на файла */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип на файла
          </label>
          <input
            type="text"
            value={formData.fileType}
            onChange={(e) => setFormData({...formData, fileType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Въведете тип (Лекция, Програма, Задача, Упражнение...)"
            list="fileTypeSuggestions"
          />
          <datalist id="fileTypeSuggestions">
            {fileTypeSuggestions.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            Можете да въведете свободен текст или да изберете от предложенията
          </p>
        </div>

        {/* Google Drive URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Drive URL *
          </label>
          <input
            type="url"
            value={formData.driveUrl}
            onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://drive.google.com/file/d/..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Копирайте линка за споделяне от Google Drive
          </p>
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание (незадължително)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="2"
            placeholder="Кратко описание на файла"
          />
        </div>

        {/* Бутони */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.driveUrl}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Запазване...' : 'Добавяне...'}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEditing ? 'Запази промени' : 'Добави файл'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Отказ
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileManagement;