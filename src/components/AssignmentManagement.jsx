// src/components/AssignmentManagement.jsx
import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Link as LinkIcon,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { 
  addContentToCourse, 
  updateContentInCourse,
  removeContentFromCourse,
  validateAssignmentData,
  CONTENT_TYPES,
  ASSIGNMENT_TYPES 
} from '../firebase/courses';

const AssignmentManagement = ({ 
  courseId, 
  assignments = [], 
  onUpdate, 
  adminEmail 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAssignment = async (assignmentData) => {
    setLoading(true);
    try {
      const contentData = {
        type: CONTENT_TYPES.ASSIGNMENT,
        ...assignmentData
      };

      const validation = validateAssignmentData(contentData);
      if (!validation.valid) {
        setError(validation.error);
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
      setError('Грешка при създаване на задача');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (assignmentId, assignmentData) => {
    setLoading(true);
    try {
      const validation = validateAssignmentData(assignmentData);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const result = await updateContentInCourse(courseId, assignmentId, assignmentData, adminEmail);
      
      if (result.success) {
        setEditingAssignment(null);
        setError('');
        onUpdate?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при актуализиране на задача');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази задача?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeContentFromCourse(courseId, assignmentId, adminEmail);
      
      if (result.success) {
        onUpdate?.();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Грешка при изтриване на задача');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Практически задачи</h3>
          <p className="text-gray-600">Управление на задачи и упражнения</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
        >
          <Plus size={16} className="mr-2" />
          Нова задача
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

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText className="text-gray-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Няма задачи</h4>
            <p className="text-gray-600 mb-4">Създайте първата задача за този курс</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Създай първата задача
            </button>
          </div>
        ) : (
          assignments.map((assignment, index) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              index={index}
              isEditing={editingAssignment?.id === assignment.id}
              onEdit={setEditingAssignment}
              onDelete={handleDeleteAssignment}
              onUpdate={handleUpdateAssignment}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <AssignmentForm
          onSubmit={handleCreateAssignment}
          onCancel={() => setShowCreateForm(false)}
          loading={loading}
          assignmentCount={assignments.length}
        />
      )}
    </div>
  );
};

// Компонент за карта на задача
const AssignmentCard = ({ 
  assignment, 
  index, 
  isEditing, 
  onEdit, 
  onDelete, 
  onUpdate,
  loading 
}) => {
  const [editData, setEditData] = useState({
    title: assignment.title,
    description: assignment.description,
    instructions: assignment.instructions,
    difficulty: assignment.difficulty,
    estimatedTime: assignment.estimatedTime,
    assignmentType: assignment.assignmentType,
    documentUrl: assignment.documentUrl,
    textContent: assignment.textContent,
    linkUrl: assignment.linkUrl,
    downloadable: assignment.downloadable,
    openInNewTab: assignment.openInNewTab
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case ASSIGNMENT_TYPES.DOCUMENT: return <FileText size={20} />;
      case ASSIGNMENT_TYPES.TEXT: return <HelpCircle size={20} />;
      case ASSIGNMENT_TYPES.LINK: return <LinkIcon size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case ASSIGNMENT_TYPES.DOCUMENT: return 'Документ';
      case ASSIGNMENT_TYPES.TEXT: return 'Текстова задача';
      case ASSIGNMENT_TYPES.LINK: return 'Външна връзка';
      default: return 'Неизвестен';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-4">Редактиране на задача</h4>
        
        <AssignmentForm
          initialData={editData}
          onSubmit={(data) => onUpdate(assignment.id, data)}
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
              {getTypeIcon(assignment.assignmentType)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{getTypeLabel(assignment.assignmentType)}</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {assignment.estimatedTime}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                  {getDifficultyLabel(assignment.difficulty)}
                </span>
              </div>
            </div>
          </div>

          {assignment.description && (
            <p className="text-gray-700 mb-3">{assignment.description}</p>
          )}

          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">
                <strong>Инструкции:</strong> {assignment.instructions}
              </p>
            </div>
          )}

          {/* Специфично съдържание според типа */}
          {assignment.assignmentType === ASSIGNMENT_TYPES.DOCUMENT && assignment.documentUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Документ за изтегляне</span>
                <div className="flex items-center space-x-2">
                  {assignment.downloadable && (
                    <span className="text-xs text-green-600 flex items-center">
                      <Download size={12} className="mr-1" />
                      За изтегляне
                    </span>
                  )}
                  <a
                    href={assignment.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Eye size={12} className="mr-1" />
                    Преглед
                  </a>
                </div>
              </div>
            </div>
          )}

          {assignment.assignmentType === ASSIGNMENT_TYPES.LINK && assignment.linkUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <a
                href={assignment.linkUrl}
                target={assignment.openInNewTab ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <LinkIcon size={12} className="mr-1" />
                Отвори връзката
                {assignment.openInNewTab && " (нов таб)"}
              </a>
            </div>
          )}

          {assignment.assignmentType === ASSIGNMENT_TYPES.TEXT && assignment.textContent && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {assignment.textContent}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(assignment)}
            disabled={loading}
            className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors disabled:opacity-50"
            title="Редактирай задача"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(assignment.id)}
            disabled={loading}
            className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors disabled:opacity-50"
            title="Изтрий задача"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Формуляр за създаване/редактиране на задача
const AssignmentForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false, 
  assignmentCount = 0,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    instructions: initialData.instructions || '',
    assignmentType: initialData.assignmentType || ASSIGNMENT_TYPES.DOCUMENT,
    difficulty: initialData.difficulty || 'medium',
    estimatedTime: initialData.estimatedTime || '30 мин',
    order: initialData.order || assignmentCount + 1,
    // За документи
    documentUrl: initialData.documentUrl || '',
    downloadable: initialData.downloadable !== false,
    fileType: initialData.fileType || 'pdf',
    // За текстови задачи
    textContent: initialData.textContent || '',
    // За външни връзки
    linkUrl: initialData.linkUrl || '',
    openInNewTab: initialData.openInNewTab !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      assignmentType: type,
      // Изчистваме специфичните полета при смяна на типа
      documentUrl: '',
      textContent: '',
      linkUrl: ''
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4">
        {isEditing ? 'Редактиране на задача' : 'Нова практическа задача'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Основна информация */}
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
              placeholder="Например: Упражнение с Excel формули"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип задача *
            </label>
            <select
              value={formData.assignmentType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value={ASSIGNMENT_TYPES.DOCUMENT}>Документ (Word, PDF, Excel)</option>
              <option value={ASSIGNMENT_TYPES.TEXT}>Текстова задача</option>
              <option value={ASSIGNMENT_TYPES.LINK}>Външна връзка</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Трудност
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="easy">Лесно</option>
              <option value="medium">Средно</option>
              <option value="hard">Трудно</option>
            </select>
          </div>
          
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Очаквано време
            </label>
            <input
              type="text"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="30 мин"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="2"
            placeholder="Кратко описание на задачата"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Инструкции
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Подробни инструкции за изпълнение на задачата"
          />
        </div>

        {/* Специфични полета според типа */}
        {formData.assignmentType === ASSIGNMENT_TYPES.DOCUMENT && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-3">Настройки за документ</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL на документа *
                </label>
                <input
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({...formData, documentUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/file/d/..."
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Поддържат се Google Drive, OneDrive, Dropbox или директни връзки към файлове
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.downloadable}
                    onChange={(e) => setFormData({...formData, downloadable: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Разреши изтегляне</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {formData.assignmentType === ASSIGNMENT_TYPES.TEXT && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-3">Текстова задача</h5>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Съдържание на задачата *
              </label>
              <textarea
                value={formData.textContent}
                onChange={(e) => setFormData({...formData, textContent: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="6"
                placeholder="Въведете текста на задачата тук..."
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Можете да използвате обикновен текст с нови редове
              </p>
            </div>
          </div>
        )}

        {formData.assignmentType === ASSIGNMENT_TYPES.LINK && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-medium text-purple-800 mb-3">Външна връзка</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL на връзката *
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.openInNewTab}
                    onChange={(e) => setFormData({...formData, openInNewTab: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Отвори в нов таб</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Бутони */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Запазване...' : 'Създаване...'}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEditing ? 'Запази промени' : 'Създай задача'}
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

export default AssignmentManagement;