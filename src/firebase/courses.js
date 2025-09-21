// src/firebase/courses.js - Firestore функции за управление на курсове
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  query, 
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "./firestore";

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
    console.log('📚 getAllCourses: Започва зареждане на курсове...');
    
    // Проверяваме дали db е инициализиран
    if (!db) {
      console.error('❌ getAllCourses: db е undefined');
      return { success: false, error: 'Database не е инициализиран' };
    }
    
    console.log('✅ getAllCourses: Database connection OK');
    
    // Създаваме reference към courses колекцията
    const coursesRef = collection(db, 'courses');
    console.log('✅ getAllCourses: Created courses collection reference');
    
    // Изпълняваме заявката
    console.log('🔍 getAllCourses: Executing query...');
    const snapshot = await getDocs(coursesRef);
    
    console.log(`✅ getAllCourses: Query successful, found ${snapshot.size} documents`);
    
    const courses = [];
    let processedCount = 0;
    
    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        const courseData = {
          id: doc.id,
          ...data,
          // Осигуряваме че всички задължителни полета съществуват
          title: data.title || 'Неименуван курс',
          description: data.description || 'Няма описание',
          level: data.level || 1,
          color: data.color || 'from-gray-500 to-gray-600',
          icon: data.icon || '📚',
          videos: Array.isArray(data.videos) ? data.videos : [],
          isActive: data.isActive !== false, // По подразбиране true освен ако не е explicit false
          estimatedHours: data.estimatedHours || 1,
          prerequisite: data.prerequisite || null
        };
        
        courses.push(courseData);
        processedCount++;
        
        console.log(`📄 getAllCourses: Processed course ${processedCount}: ${courseData.title} (${courseData.videos.length} videos)`);
      } catch (docError) {
        console.error(`❌ getAllCourses: Error processing document ${doc.id}:`, docError);
      }
    });

    // Сортиране на курсовете
    courses.sort((a, b) => {
      // Първо по ниво
      if (a.level !== b.level) return a.level - b.level;
      // После по дата на създаване (ако съществува)
      if (a.createdAt && b.createdAt) {
        const aTime = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return aTime - bTime;
      }
      // Накрая по заглавие
      return a.title.localeCompare(b.title);
    });

    console.log(`✅ getAllCourses: Successfully processed ${courses.length} courses`);
    console.log('📋 getAllCourses: Course list:', courses.map(c => ({ id: c.id, title: c.title, level: c.level })));
    
    return { success: true, data: courses };
    
  } catch (error) {
    console.error('❌ getAllCourses: Error occurred:', error);
    
    // Детайлна информация за различни типове грешки
    if (error.code) {
      console.error(`🔴 Firebase Error Code: ${error.code}`);
      console.error(`🔴 Firebase Error Message: ${error.message}`);
      
      switch (error.code) {
        case 'permission-denied':
          console.error('🚫 Permission denied - проверете Firestore rules');
          console.error('💡 Suggestion: Проверете дали потребителят е автентифициран и има правилни права');
          return { success: false, error: 'Няма права за достъп до курсове. Проверете автентификацията.' };
          
        case 'unavailable':
          console.error('🌐 Firestore unavailable - проверете интернет връзката');
          return { success: false, error: 'Базата данни е недостъпна. Проверете интернет връзката.' };
          
        case 'not-found':
          console.error('📂 Collection not found');
          return { success: false, error: 'Колекцията с курсове не е намерена.' };
          
        default:
          console.error('❓ Unknown Firebase error');
          return { success: false, error: `Firebase грешка: ${error.message}` };
      }
    } else {
      console.error('❓ Non-Firebase error:', error);
      return { success: false, error: 'Неочаквана грешка при зареждане на курсове' };
    }
  }
};

// Добавяме функция за тестване на конкретен курс
export const testCourseAccess = async (courseId) => {
  try {
    console.log(`🧪 Testing access to course: ${courseId}`);
    
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      console.log(`✅ Course ${courseId} exists:`, courseSnap.data());
      return { success: true, data: { id: courseSnap.id, ...courseSnap.data() } };
    } else {
      console.log(`❌ Course ${courseId} does not exist`);
      return { success: false, error: 'Курсът не съществува' };
    }
  } catch (error) {
    console.error(`❌ Error accessing course ${courseId}:`, error);
    return { success: false, error: error.message };
  }
};

// Функция за създаване на тестов курс
export const createTestCourse = async (adminEmail) => {
  try {
    console.log('🧪 Creating test course...');
    
    const testCourseData = {
      title: 'Тестов курс',
      description: 'Това е тестов курс за диагностика',
      level: 1,
      color: 'from-blue-500 to-blue-600',
      icon: '🧪',
      videos: [
        {
          id: 'test-video-1',
          title: 'Тестово видео 1',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'Тестово видео за диагностика',
          duration: '5:00',
          order: 1,
          category: 'Тест'
        }
      ],
      isActive: true,
      estimatedHours: 1,
      prerequisite: null
    };
    
    const result = await createCourse(testCourseData, adminEmail);
    
    if (result.success) {
      console.log('✅ Test course created successfully');
    } else {
      console.error('❌ Failed to create test course:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error creating test course:', error);
    return { success: false, error: error.message };
  }
};

// Добавяме функциите към window за лесно тестване
if (typeof window !== 'undefined') {
  window.testCourseAccess = testCourseAccess;
  window.createTestCourse = createTestCourse;
  window.testGetAllCourses = getAllCourses;
  
  console.log('🧪 Course diagnostic functions available:');
  console.log('  window.testGetAllCourses() - Тест на getAllCourses');
  console.log('  window.testCourseAccess("courseId") - Тест на достъп до курс');
  console.log('  window.createTestCourse("admin@iru.bg") - Създаване на тестов курс');
}

/**
 * Получаване на конкретен курс
 */
export const getCourse = async (courseId) => {
  try {
    if (!courseId) {
      return { success: false, error: 'Невалиден ID на курс' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      return { success: true, data: { id: courseSnap.id, ...courseSnap.data() } };
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
    const updates = {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    };

    await updateDoc(courseRef, updates);
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

// ============= ВИДЕО УПРАВЛЕНИЕ =============

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
      category: videoData.category || courseSnap.data().title,
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
    if (!courseId || !Array.isArray(newVideoOrder) || !adminEmail) {
      return { success: false, error: 'Невалидни данни' };
    }

    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      return { success: false, error: 'Курсът не съществува' };
    }

    const currentVideos = courseSnap.data().videos || [];
    
    // Актуализираме order според новия ред
    const updatedVideos = currentVideos.map(video => {
      const newOrder = newVideoOrder.findIndex(id => id === video.id) + 1;
      return { ...video, order: newOrder };
    }).sort((a, b) => a.order - b.order);

    await updateDoc(courseRef, {
      videos: updatedVideos,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail
    });

    return { success: true };
  } catch (error) {
    console.error('Error reordering videos:', error);
    return { success: false, error: 'Грешка при пренареждане на видеата' };
  }
};

// ============= ПОМОЩНИ ФУНКЦИИ =============

/**
 * Генериране на ID за курс
 */
const generateCourseId = (title) => {
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
 * Валидиране на видео URL
 */
export const validateVideoUrl = (url) => {
  if (!url) return false;
  
  const validPatterns = [
    /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/,
    /^https:\/\/youtu\.be\/[\w-]+/,
    /^https:\/\/vimeo\.com\/\d+/,
    /^https?:\/\/.*\.(mp4|webm|ogg)$/i
  ];
  
  return validPatterns.some(pattern => pattern.test(url));
};

/**
 * Извличане на YouTube thumbnail
 */
export const getYouTubeThumbnail = (url) => {
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }
  
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

/**
 * Изчисляване на общо време на курса
 */
export const calculateCourseTime = (videos) => {
  if (!Array.isArray(videos)) return 0;
  
  let totalMinutes = 0;
  videos.forEach(video => {
    if (video.duration) {
      const [minutes, seconds] = video.duration.split(':').map(Number);
      totalMinutes += minutes + (seconds / 60);
    }
  });
  
  return Math.round(totalMinutes / 60 * 10) / 10; // Закръгляване до 1 десетична
};

/**
 * Проверка за зависимости при изтриване на курс
 */
export const checkCourseDependencies = async (courseId) => {
  try {
    const coursesResult = await getAllCourses();
    if (!coursesResult.success) {
      return { success: false, error: 'Грешка при проверка на зависимости' };
    }

    const dependentCourses = coursesResult.data.filter(
      course => course.prerequisite === courseId
    );

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

export default {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
  updateVideoInCourse,
  removeVideoFromCourse,
  reorderVideosInCourse,
  validateVideoUrl,
  getYouTubeThumbnail,
  calculateCourseTime,
  checkCourseDependencies
};