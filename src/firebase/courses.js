// src/firebase/courses.js - Обновена версия с файлове вместо задачи
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firestore";

// Типове съдържание
export const CONTENT_TYPES = {
  VIDEO: 'video',
  FILE: 'file'
};

// Типове файлове (свободно добавяне)
export const FILE_TYPES = {
  LECTURE: 'Лекция',
  PROGRAM: 'Програма',
  TASK: 'Задача',
  EXERCISE: 'Упражнение',
  MATERIAL: 'Материал',
  PRESENTATION: 'Презентация',
  OTHER: 'Друго'
};

// ============= ОСНОВНИ CRUD ОПЕРАЦИИ =============

/**
 * Създаване на нов курс
 */
export const createCourse = async (courseData, adminEmail) => {
  try {
    if (!courseData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseId = courseData.id || generateCourseId(courseData.title);
    const courseRef = doc(db, 'courses', courseId);
    
    const newCourse = {
      id: courseId,
      title: courseData.title,
      description: courseData.description,
      level: courseData.level || 1,
      color: courseData.color || 'from-blue-500 to-blue-600',
      icon: courseData.icon || '📚',
      prerequisite: courseData.prerequisite || null,
      estimatedHours: courseData.estimatedHours || 1,
      content: courseData.content || [],
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: adminEmail,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    };

    await setDoc(courseRef, newCourse);
    return { success: true, data: newCourse };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: 'Грешка при създаване на курс' };
  }
};

/**
 * Получаване на всички курсове
 */
export const getAllCourses = async () => {
  try {
    console.log('📚 Зареждане на всички курсове...');
    
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    const courses = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      courses.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now())
      });
    });

    const activeCourses = courses
      .filter(course => course.isActive !== false)
      .sort((a, b) => {
        if (a.level !== b.level) {
          return (a.level || 1) - (b.level || 1);
        }
        return (a.createdAt || new Date()) - (b.createdAt || new Date());
      });

    console.log(`✅ Заредени ${activeCourses.length} активни курса`);
    return { success: true, data: activeCourses };
    
  } catch (error) {
    console.error('❌ Грешка при получаване на курсове:', error);
    
    let errorMessage = 'Грешка при зареждане на курсове';
    if (error.code === 'permission-denied') {
      errorMessage = 'Нямате права за преглед на курсове';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore не е достъпен';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Получаване на единичен курс
 */
export const getCourse = async (courseId) => {
  try {
    if (!courseId) {
      return { success: false, error: 'Невалиден ID на курс' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      const data = courseSnap.data();
      return { 
        success: true, 
        data: { 
          id: courseSnap.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now())
        } 
      };
    } else {
      return { success: false, error: 'Курсът не съществува' };
    }
  } catch (error) {
    console.error('Error getting course:', error);
    return { success: false, error: 'Грешка при получаване на курс' };
  }
};

/**
 * Актуализиране на курс
 */
export const updateCourse = async (courseId, updateData, adminEmail) => {
  try {
    if (!courseId || !updateData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const updatedCourse = {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    };

    await updateDoc(courseRef, updatedCourse);
    return { success: true };
  } catch (error) {
    console.error('Error updating course:', error);
    return { success: false, error: 'Грешка при актуализиране на курс' };
  }
};

/**
 * Изтриване на курс
 */
export const deleteCourse = async (courseId, adminEmail) => {
  try {
    if (!courseId || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: 'Грешка при изтриване на курс' };
  }
};

// ============= СЪДЪРЖАНИЕ (ВИДЕА И ФАЙЛОВЕ) =============

/**
 * Добавяне на съдържание към курс
 */
export const addContentToCourse = async (courseId, contentData, adminEmail) => {
  try {
    if (!courseId || !contentData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentContent = courseSnap.data().content || [];
    const contentId = generateContentId();
    
    const newContent = {
      id: contentId,
      type: contentData.type,
      title: contentData.title,
      order: contentData.order || currentContent.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail,
      ...getContentSpecificFields(contentData)
    };

    const updatedContent = [...currentContent, newContent].sort((a, b) => a.order - b.order);
    
    await updateDoc(courseRef, {
      content: updatedContent,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: newContent };
  } catch (error) {
    console.error('Error adding content to course:', error);
    return { success: false, error: 'Грешка при добавяне на съдържание' };
  }
};

/**
 * Актуализиране на съдържание в курс
 */
export const updateContentInCourse = async (courseId, contentId, contentData, adminEmail) => {
  try {
    if (!courseId || !contentId || !contentData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentContent = courseSnap.data().content || [];
    const contentIndex = currentContent.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      return { success: false, error: 'Съдържанието не съществува' };
    }

    const updatedContent = [...currentContent];
    updatedContent[contentIndex] = {
      ...updatedContent[contentIndex],
      ...contentData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };

    if (contentData.order !== undefined) {
      updatedContent.sort((a, b) => a.order - b.order);
    }

    await updateDoc(courseRef, {
      content: updatedContent,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: updatedContent[contentIndex] };
  } catch (error) {
    console.error('Error updating content in course:', error);
    return { success: false, error: 'Грешка при актуализиране на съдържание' };
  }
};

/**
 * Премахване на съдържание от курс
 */
export const removeContentFromCourse = async (courseId, contentId, adminEmail) => {
  try {
    if (!courseId || !contentId || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentContent = courseSnap.data().content || [];
    const updatedContent = currentContent.filter(c => c.id !== contentId);

    updatedContent.forEach((content, index) => {
      content.order = index + 1;
    });

    await updateDoc(courseRef, {
      content: updatedContent,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing content from course:', error);
    return { success: false, error: 'Грешка при премахване на съдържание' };
  }
};

/**
 * Получаване на специфични полета според типа съдържание
 */
const getContentSpecificFields = (contentData) => {
  const { type } = contentData;

  if (type === CONTENT_TYPES.VIDEO) {
    return {
      url: contentData.url,
      description: contentData.description || '',
      duration: contentData.duration || '0:00',
      category: contentData.category || 'Видео лекция'
    };
  }

  if (type === CONTENT_TYPES.FILE) {
    return {
      fileName: contentData.fileName || contentData.title,
      fileType: contentData.fileType || 'Друго',
      driveUrl: contentData.driveUrl,
      description: contentData.description || ''
    };
  }

  return {};
};

/**
 * Валидиране на данни за файл
 */
export const validateFileData = (fileData) => {
  const { title, driveUrl } = fileData;

  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Името на файла е задължително' };
  }

  if (!driveUrl || driveUrl.trim().length === 0) {
    return { valid: false, error: 'URL към Google Drive е задължителен' };
  }

  // Проверка за валиден URL
  try {
    new URL(driveUrl);
  } catch {
    return { valid: false, error: 'Невалиден URL' };
  }

  return { valid: true };
};

/**
 * Получаване на статистики за съдържанието на курс
 */
export const getCourseContentStats = (courseContent) => {
  if (!Array.isArray(courseContent)) return { videos: 0, files: 0, total: 0 };

  const stats = courseContent.reduce((acc, content) => {
    if (content.type === CONTENT_TYPES.VIDEO) {
      acc.videos++;
    } else if (content.type === CONTENT_TYPES.FILE) {
      acc.files++;
    }
    acc.total++;
    return acc;
  }, { videos: 0, files: 0, total: 0 });

  return stats;
};

// ============= ПОМОЩНИ ФУНКЦИИ =============

/**
 * Валидиране на URL на видео
 */
export const validateVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(url);
  }
  
  if (url.includes('vimeo.com')) {
    return /vimeo\.com\/(\d+)/.test(url);
  }
  
  if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return true;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Получаване на YouTube thumbnail
 */
export const getYouTubeThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes('youtube')) return null;
  
  let videoId = '';
  if (videoUrl.includes('youtube.com/watch?v=')) {
    videoId = videoUrl.split('v=')[1].split('&')[0];
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
  }
  
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

/**
 * Проверка за зависимости на курс
 */
export const checkCourseDependencies = async (courseId) => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('prerequisite', '==', courseId));
    const snapshot = await getDocs(q);
    
    const dependentCourses = [];
    snapshot.forEach(doc => {
      dependentCourses.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      hasDependencies: dependentCourses.length > 0,
      dependentCourses
    };
  } catch (error) {
    console.error('Error checking course dependencies:', error);
    return { success: false, error: 'Грешка при проверка на зависимости' };
  }
};

/**
 * Генериране на ID за курс
 */
const generateCourseId = (title) => {
  if (!title) return `course-${Date.now()}`;
  
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  const timestamp = Date.now().toString().slice(-6);
  return `${cleanTitle}-${timestamp}`;
};

/**
 * Генериране на ID за съдържание
 */
const generateContentId = () => {
  return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};