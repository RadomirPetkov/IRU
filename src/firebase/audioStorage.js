// src/firebase/audioStorage.js - Firebase Storage услуга за аудио файлове
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from './firestore';

// Папка за аудио файлове
const AUDIO_FOLDER = 'audio';

/**
 * Качване на аудио файл с прогрес
 * @param {File} file - Аудио файлът за качване
 * @param {string} courseId - ID на курса (за организация)
 * @param {function} onProgress - Callback за прогрес (0-100)
 * @returns {Promise<{url: string, path: string, name: string}>}
 */
export const uploadAudioFile = (file, courseId, onProgress) => {
  return new Promise((resolve, reject) => {
    // Валидация на файла
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      reject(new Error('Невалиден формат. Позволени са: MP3, WAV, OGG, M4A, AAC, FLAC'));
      return;
    }

    // Максимален размер 100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('Файлът е твърде голям. Максимален размер: 100MB'));
      return;
    }

    // Генерираме уникално име
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${AUDIO_FOLDER}/${courseId}/${timestamp}_${safeName}`;
    
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
        console.log(`📤 Качване: ${Math.round(progress)}%`);
      },
      (error) => {
        console.error('❌ Грешка при качване:', error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('Нямате права за качване на файлове'));
            break;
          case 'storage/canceled':
            reject(new Error('Качването беше отменено'));
            break;
          case 'storage/quota-exceeded':
            reject(new Error('Квотата за съхранение е надвишена'));
            break;
          default:
            reject(new Error('Грешка при качване на файла'));
        }
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Файлът е качен успешно:', downloadURL);
          resolve({
            url: downloadURL,
            path: filePath,
            name: file.name,
            size: file.size,
            type: file.type
          });
        } catch (error) {
          reject(new Error('Грешка при получаване на URL'));
        }
      }
    );
  });
};

/**
 * Изтриване на аудио файл
 * @param {string} filePath - Пътят на файла в Storage
 */
export const deleteAudioFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('✅ Файлът е изтрит:', filePath);
    return { success: true };
  } catch (error) {
    console.error('❌ Грешка при изтриване:', error);
    if (error.code === 'storage/object-not-found') {
      return { success: true }; // Файлът вече не съществува
    }
    throw new Error('Грешка при изтриване на файла');
  }
};

/**
 * Получаване на URL за аудио файл
 * @param {string} filePath - Пътят на файла в Storage
 */
export const getAudioFileURL = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('❌ Грешка при получаване на URL:', error);
    throw new Error('Файлът не е намерен');
  }
};

/**
 * Списък с всички аудио файлове за курс
 * @param {string} courseId - ID на курса
 */
export const listCourseAudioFiles = async (courseId) => {
  try {
    const folderRef = ref(storage, `${AUDIO_FOLDER}/${courseId}`);
    const result = await listAll(folderRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      })
    );
    
    return files;
  } catch (error) {
    console.error('❌ Грешка при получаване на списък:', error);
    return [];
  }
};

/**
 * Форматиране на размер на файл
 * @param {number} bytes - Размер в байтове
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default storage;