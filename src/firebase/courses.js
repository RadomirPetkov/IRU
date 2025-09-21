// src/firebase/courses.js - Обновена версия със задачи

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
 * Генериране на ID за съдържание
 */
const generateContentId = () => {
  return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

// Експортираме новите функции
export {
  addContentToCourse,
  updateContentInCourse,
  removeContentFromCourse,
  validateAssignmentData,
  getCourseContentStats,
  migrateLegacyCourse
};