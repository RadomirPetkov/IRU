// src/firebase/courses.js - Обновена версия с теми (секции)
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
  FILE: 'file',
  AUDIO: 'audio'
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

// ============= ПОМОЩНИ ФУНКЦИИ ЗА ТЕМИ =============

/**
 * Генериране на ID за тема
 */
const generateTopicId = () => {
  return `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Получаване на всички теми от курс
 */
export const getCourseTopics = (course) => {
  if (!course) return [];
  return course.topics || [];
};

/**
 * Получаване на съдържание за конкретна тема
 */
export const getTopicContent = (course, topicId) => {
  if (!course || !course.content) return [];
  
  if (!topicId || topicId === 'all') {
    return course.content.filter(c => c.isActive !== false).sort((a, b) => a.order - b.order);
  }
  
  return course.content
    .filter(c => c.topicId === topicId && c.isActive !== false)
    .sort((a, b) => a.order - b.order);
};

/**
 * Получаване на съдържание без тема
 */
export const getUncategorizedContent = (course) => {
  if (!course || !course.content) return [];
  return course.content
    .filter(c => !c.topicId && c.isActive !== false)
    .sort((a, b) => a.order - b.order);
};

/**
 * Добавяне на тема към курс
 */
export const addTopicToCourse = async (courseId, topicData, adminEmail) => {
  try {
    if (!courseId || !topicData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentTopics = courseSnap.data().topics || [];
    const topicId = generateTopicId();
    
    const newTopic = {
      id: topicId,
      title: topicData.title,
      description: topicData.description || '',
      order: topicData.order || currentTopics.length + 1,
      icon: topicData.icon || '📖',
      color: topicData.color || 'blue',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail
    };

    const updatedTopics = [...currentTopics, newTopic].sort((a, b) => a.order - b.order);
    
    await updateDoc(courseRef, {
      topics: updatedTopics,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: newTopic };
  } catch (error) {
    console.error('Error adding topic to course:', error);
    return { success: false, error: 'Грешка при добавяне на тема' };
  }
};

/**
 * Обновяване на тема
 */
export const updateTopic = async (courseId, topicId, topicData, adminEmail) => {
  try {
    if (!courseId || !topicId || !topicData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentTopics = courseSnap.data().topics || [];
    const topicIndex = currentTopics.findIndex(t => t.id === topicId);
    
    if (topicIndex === -1) {
      return { success: false, error: 'Темата не съществува' };
    }

    const updatedTopics = [...currentTopics];
    updatedTopics[topicIndex] = {
      ...updatedTopics[topicIndex],
      ...topicData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };

    if (topicData.order !== undefined) {
      updatedTopics.sort((a, b) => a.order - b.order);
    }

    await updateDoc(courseRef, {
      topics: updatedTopics,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating topic:', error);
    return { success: false, error: 'Грешка при обновяване на тема' };
  }
};

/**
 * Изтриване на тема (и преместване на съдържанието в некатегоризирани)
 */
export const deleteTopic = async (courseId, topicId, adminEmail) => {
  try {
    if (!courseId || !topicId || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const courseData = courseSnap.data();
    const currentTopics = courseData.topics || [];
    const currentContent = courseData.content || [];
    
    // Премахваме темата
    const updatedTopics = currentTopics.filter(t => t.id !== topicId);
    
    // Премахваме topicId от съдържанието на тази тема
    const updatedContent = currentContent.map(c => {
      if (c.topicId === topicId) {
        const { topicId: _, ...rest } = c;
        return rest;
      }
      return c;
    });

    await updateDoc(courseRef, {
      topics: updatedTopics,
      content: updatedContent,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting topic:', error);
    return { success: false, error: 'Грешка при изтриване на тема' };
  }
};

/**
 * Преместване на съдържание в друга тема
 */
export const moveContentToTopic = async (courseId, contentId, newTopicId, adminEmail) => {
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
    const contentIndex = currentContent.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      return { success: false, error: 'Съдържанието не съществува' };
    }

    const updatedContent = [...currentContent];
    if (newTopicId) {
      updatedContent[contentIndex] = {
        ...updatedContent[contentIndex],
        topicId: newTopicId,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail
      };
    } else {
      // Премахваме от тема (преместваме в некатегоризирани)
      const { topicId: _, ...rest } = updatedContent[contentIndex];
      updatedContent[contentIndex] = {
        ...rest,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail
      };
    }

    await updateDoc(courseRef, {
      content: updatedContent,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error moving content to topic:', error);
    return { success: false, error: 'Грешка при преместване на съдържание' };
  }
};

/**
 * Пренареждане на теми
 */
export const reorderTopics = async (courseId, topicIds, adminEmail) => {
  try {
    if (!courseId || !topicIds || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentTopics = courseSnap.data().topics || [];
    
    const updatedTopics = topicIds.map((id, index) => {
      const topic = currentTopics.find(t => t.id === id);
      return topic ? { ...topic, order: index + 1 } : null;
    }).filter(Boolean);

    await updateDoc(courseRef, {
      topics: updatedTopics,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error reordering topics:', error);
    return { success: false, error: 'Грешка при пренареждане на теми' };
  }
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
      topics: courseData.topics || [],
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
    
    // Изчисляваме order спрямо темата ако има такава
    let order = contentData.order;
    if (!order) {
      if (contentData.topicId) {
        const topicContent = currentContent.filter(c => c.topicId === contentData.topicId);
        order = topicContent.length + 1;
      } else {
        order = currentContent.length + 1;
      }
    }
    
    const newContent = {
      id: contentId,
      type: contentData.type,
      title: contentData.title,
      order: order,
      topicId: contentData.topicId || null,
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

  if (type === CONTENT_TYPES.AUDIO) {
    return {
      audioUrl: contentData.audioUrl,
      audioPath: contentData.audioPath || '',
      description: contentData.description || '',
      duration: contentData.duration || '0:00'
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
  if (!Array.isArray(courseContent)) return { videos: 0, files: 0, audios: 0, total: 0 };

  const stats = courseContent.reduce((acc, content) => {
    if (content.type === CONTENT_TYPES.VIDEO) {
      acc.videos++;
    } else if (content.type === CONTENT_TYPES.FILE) {
      acc.files++;
    } else if (content.type === CONTENT_TYPES.AUDIO) {
      acc.audios++;
    }
    acc.total++;
    return acc;
  }, { videos: 0, files: 0, audios: 0, total: 0 });

  return stats;
};

/**
 * Валидиране на аудио данни
 */
export const validateAudioData = (audioData) => {
  const { title, audioUrl } = audioData;

  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Заглавието е задължително' };
  }

  if (!audioUrl || audioUrl.trim().length === 0) {
    return { valid: false, error: 'URL на аудио файла е задължителен' };
  }

  // Проверка за валиден URL
  try {
    new URL(audioUrl);
  } catch {
    return { valid: false, error: 'Невалиден URL' };
  }

  return { valid: true };
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