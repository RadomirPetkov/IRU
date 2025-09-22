// src/firebase/courses.js - Поправена версия без дублирани exports
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

// Добавяме новите типове съдържание
export const CONTENT_TYPES = {
  VIDEO: 'video',
  ASSIGNMENT: 'assignment'
};

export const ASSIGNMENT_TYPES = {
  DOCUMENT: 'document',    // Word документ, PDF и др.
  TEXT: 'text',           // Текстова задача
  LINK: 'link',          // Връзка към външни ресурси
  QUIZ: 'quiz'           // Бъдеща функционалност за тестове
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
      videos: courseData.videos || [],
      content: courseData.content || [], // Ново поле за смесено съдържание
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
 * Получаване на всички курсове (без сложни заявки)
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

    // Филтрираме активните курсове и ги сортираме в JavaScript
    const activeCourses = courses
      .filter(course => course.isActive !== false)
      .sort((a, b) => {
        // Първо по ниво, после по дата на създаване
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

// ============= ВИДЕО ФУНКЦИИ =============

/**
 * Добавяне на видео към курс
 */
export const addVideoToCourse = async (courseId, videoData, adminEmail) => {
  try {
    if (!courseId || !videoData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentVideos = courseSnap.data().videos || [];
    const videoId = generateVideoId();
    
    const newVideo = {
      id: videoId,
      title: videoData.title,
      url: videoData.url,
      description: videoData.description || '',
      duration: videoData.duration || '0:00',
      order: videoData.order || currentVideos.length + 1,
      category: videoData.category || 'Видео лекция',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail
    };

    const updatedVideos = [...currentVideos, newVideo].sort((a, b) => a.order - b.order);
    
    await updateDoc(courseRef, {
      videos: updatedVideos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: newVideo };
  } catch (error) {
    console.error('Error adding video to course:', error);
    return { success: false, error: 'Грешка при добавяне на видео' };
  }
};

/**
 * Актуализиране на видео в курс
 */
export const updateVideoInCourse = async (courseId, videoId, videoData, adminEmail) => {
  try {
    if (!courseId || !videoId || !videoData || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentVideos = courseSnap.data().videos || [];
    const videoIndex = currentVideos.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) {
      return { success: false, error: 'Видеото не съществува' };
    }

    const updatedVideos = [...currentVideos];
    updatedVideos[videoIndex] = {
      ...updatedVideos[videoIndex],
      ...videoData,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };

    // Ако е променен order, пренареждаме
    if (videoData.order !== undefined) {
      updatedVideos.sort((a, b) => a.order - b.order);
    }

    await updateDoc(courseRef, {
      videos: updatedVideos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: updatedVideos[videoIndex] };
  } catch (error) {
    console.error('Error updating video in course:', error);
    return { success: false, error: 'Грешка при актуализиране на видео' };
  }
};

/**
 * Премахване на видео от курс
 */
export const removeVideoFromCourse = async (courseId, videoId, adminEmail) => {
  try {
    if (!courseId || !videoId || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentVideos = courseSnap.data().videos || [];
    const updatedVideos = currentVideos.filter(v => v.id !== videoId);

    // Пренареждаме order след изтриване
    updatedVideos.forEach((video, index) => {
      video.order = index + 1;
    });

    await updateDoc(courseRef, {
      videos: updatedVideos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing video from course:', error);
    return { success: false, error: 'Грешка при премахване на видео' };
  }
};

/**
 * Пренареждане на видеата в курс
 */
export const reorderVideosInCourse = async (courseId, newVideoOrder, adminEmail) => {
  try {
    if (!courseId || !newVideoOrder || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentVideos = courseSnap.data().videos || [];
    
    // Създаваме нов масив с обновен order
    const reorderedVideos = newVideoOrder.map((videoId, index) => {
      const video = currentVideos.find(v => v.id === videoId);
      return video ? { ...video, order: index + 1 } : null;
    }).filter(Boolean);

    await updateDoc(courseRef, {
      videos: reorderedVideos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true, data: reorderedVideos };
  } catch (error) {
    console.error('Error reordering videos:', error);
    return { success: false, error: 'Грешка при пренареждане на видеа' };
  }
};

// ============= ПОМОЩНИ ФУНКЦИИ =============

/**
 * Валидиране на URL на видео
 */
export const validateVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(url);
  }
  
  // Vimeo URLs
  if (url.includes('vimeo.com')) {
    return /vimeo\.com\/(\d+)/.test(url);
  }
  
  // Директни видео файлове
  if (url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
    return true;
  }
  
  // Общ URL валидатор
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
 * Изчисляване на общо време на курс
 */
export const calculateCourseTime = (videos) => {
  if (!videos || !Array.isArray(videos)) return 0;
  
  return videos.reduce((total, video) => {
    if (!video.duration) return total;
    
    const [minutes, seconds] = video.duration.split(':').map(Number);
    return total + (minutes || 0) + ((seconds || 0) / 60);
  }, 0);
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
 * Генериране на ID за видео
 */
const generateVideoId = () => {
  return `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Генериране на ID за съдържание
 */
const generateContentId = () => {
  return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Създаване на нов елемент от съдържание (видео или задача)
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
    
    // Създаваме обекта за новото съдържание
    const newContent = {
      id: contentId,
      type: contentData.type, // 'video' или 'assignment'
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

    // Ако е променен order, пренареждаме
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

    // Пренареждаме order след изтриване
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

  if (type === CONTENT_TYPES.ASSIGNMENT) {
    return {
      assignmentType: contentData.assignmentType,
      description: contentData.description || '',
      instructions: contentData.instructions || '',
      difficulty: contentData.difficulty || 'medium',
      estimatedTime: contentData.estimatedTime || '30 мин',
      // За документи
      ...(contentData.assignmentType === ASSIGNMENT_TYPES.DOCUMENT && {
        documentUrl: contentData.documentUrl,
        downloadable: contentData.downloadable !== false,
        fileType: contentData.fileType || 'pdf',
        fileSize: contentData.fileSize
      }),
      // За текстови задачи
      ...(contentData.assignmentType === ASSIGNMENT_TYPES.TEXT && {
        textContent: contentData.textContent,
        hints: contentData.hints || []
      }),
      // За външни връзки
      ...(contentData.assignmentType === ASSIGNMENT_TYPES.LINK && {
        linkUrl: contentData.linkUrl,
        openInNewTab: contentData.openInNewTab !== false
      })
    };
  }

  return {};
};

/**
 * Валидиране на данни за задача
 */
export const validateAssignmentData = (assignmentData) => {
  const { assignmentType, title } = assignmentData;

  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Заглавието е задължително' };
  }

  if (!Object.values(ASSIGNMENT_TYPES).includes(assignmentType)) {
    return { valid: false, error: 'Невалиден тип задача' };
  }

  switch (assignmentType) {
    case ASSIGNMENT_TYPES.DOCUMENT:
      if (!assignmentData.documentUrl) {
        return { valid: false, error: 'URL на документа е задължителен' };
      }
      break;
    
    case ASSIGNMENT_TYPES.TEXT:
      if (!assignmentData.textContent || assignmentData.textContent.trim().length === 0) {
        return { valid: false, error: 'Текстовото съдържание е задължително' };
      }
      break;
    
    case ASSIGNMENT_TYPES.LINK:
      if (!assignmentData.linkUrl) {
        return { valid: false, error: 'URL на връзката е задължителен' };
      }
      try {
        new URL(assignmentData.linkUrl);
      } catch {
        return { valid: false, error: 'Невалиден URL' };
      }
      break;
  }

  return { valid: true };
};

/**
 * Получаване на статистики за съдържанието на курс
 */
export const getCourseContentStats = (courseContent) => {
  if (!Array.isArray(courseContent)) return { videos: 0, assignments: 0, total: 0 };

  const stats = courseContent.reduce((acc, content) => {
    if (content.type === CONTENT_TYPES.VIDEO) {
      acc.videos++;
    } else if (content.type === CONTENT_TYPES.ASSIGNMENT) {
      acc.assignments++;
    }
    acc.total++;
    return acc;
  }, { videos: 0, assignments: 0, total: 0 });

  return stats;
};

/**
 * Мигриране на стари курсове към новата структура
 */
export const migrateLegacyCourse = async (courseId, adminEmail) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const courseData = courseSnap.data();
    
    // Ако вече има content поле, не правим миграция
    if (courseData.content) {
      return { success: true, message: 'Курсът вече е мигриран' };
    }

    // Мигрираме videos към content
    const content = (courseData.videos || []).map((video, index) => ({
      id: `migrated-video-${index + 1}`,
      type: CONTENT_TYPES.VIDEO,
      title: video.title,
      url: video.url,
      description: video.description || '',
      duration: video.duration || '0:00',
      category: video.category || 'Видео лекция',
      order: video.order || index + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail
    }));

    await updateDoc(courseRef, {
      content: content,
      // Запазваме старото videos поле за съвместимост
      videos: courseData.videos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
      migrated: true
    });

    return { success: true, message: `Мигрирани ${content.length} видеа` };
  } catch (error) {
    console.error('Error migrating legacy course:', error);
    return { success: false, error: 'Грешка при миграция на курс' };
  }
};