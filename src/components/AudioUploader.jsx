// src/components/AudioUploader.jsx - Компонент за качване на аудио файлове
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Music, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  FileAudio,
  Trash2
} from 'lucide-react';
import { uploadAudioFile, formatFileSize } from '../firebase/audioStorage';

const AudioUploader = ({ 
  courseId, 
  onUploadComplete, 
  onCancel,
  existingUrl = null 
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(existingUrl ? { url: existingUrl } : null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Валидация
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
      const isValidType = allowedTypes.includes(selectedFile.type) || 
                          selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);
      
      if (!isValidType) {
        setError('Невалиден формат. Позволени са: MP3, WAV, OGG, M4A, AAC, FLAC');
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        setError('Файлът е твърде голям. Максимален размер: 100MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !courseId) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadAudioFile(file, courseId, (prog) => {
        setProgress(prog);
      });

      setUploadedFile(result);
      setFile(null);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = fileInputRef.current;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      input.files = dataTransfer.files;
      handleFileSelect({ target: input });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (onUploadComplete) {
      onUploadComplete(null);
    }
  };

  // Ако има вече качен файл
  if (uploadedFile) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-full text-white">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="font-medium text-green-800">Аудио файл качен</p>
              <p className="text-sm text-green-600 truncate max-w-xs">
                {uploadedFile.name || 'Аудио файл'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <audio 
              src={uploadedFile.url} 
              controls 
              className="h-8"
              style={{ maxWidth: '200px' }}
            />
            <button
              onClick={removeUploadedFile}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
              title="Премахни"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          file 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
          onChange={handleFileSelect}
          className="hidden"
          id="audio-upload"
        />

        {!file ? (
          <label htmlFor="audio-upload" className="cursor-pointer block">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3">
                <Music size={32} />
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Плъзнете аудио файл тук
              </p>
              <p className="text-gray-500 text-sm mb-3">
                или кликнете за избор
              </p>
              <p className="text-xs text-gray-400">
                MP3, WAV, OGG, M4A, AAC, FLAC • Макс. 100MB
              </p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <FileAudio size={24} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Качване...</span>
            <span className="text-blue-600 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {file && !uploading && (
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Отказ
            </button>
          )}
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Upload size={18} />
            <span>Качи аудио</span>
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader size={20} className="animate-spin" />
            <span>Качване на файла...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;