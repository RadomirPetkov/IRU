// src/data/coursesData.js - Обновена версия с Firestore интеграция
import { 
  getAllCourses as getFirestoreCourses,
  getCourse as getFirestoreCourse 
} from '../firebase/courses';

// Кеш за курсовете
let coursesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минути

// Фолбек статични курсове (ако Firestore не е достъпен)
const fallbackCourses = [
  {
    id: 'basic',
    title: 'Цифрова компетентност - Базово ниво',
    description: 'Основни умения за работа с компютър и интернет',
    level: 1,
    color: 'from-green-500 to-green-600',
    icon: '📱',
    prerequisite: null,
    estimatedHours: 8,
    isActive: true,
    videos: [
      {
        id: 'basic-1',
        title: 'Въведение в компютрите',
        url: 'https://www.youtube.com/watch?v=example1',
        description: 'Основни понятия за хардуер и софтуер. Какво е компютър и как работи.',
        duration: '15:30',
        order: 1,
        category: 'Базово ниво'
      },
      {
        id: 'basic-2',
        title: 'Работа с операционна система',
        url: 'https://www.youtube.com/watch?v=example2',
        description: 'Навигация във Windows, файлове и папки, основни настройки.',
        duration: '22:45',
        order: 2,
        category: 'Базово ниво'
      },
      {
        id: 'basic-3',
        title: 'Основи на интернет браузърите',
        url: 'https://www.youtube.com/watch?v=example3',
        description: 'Как да сърфираме безопасно в интернет, търсачки и социални мрежи.',
        duration: '18:20',
        order: 3,
        category: 'Базово ниво'
      },
      {
        id: 'basic-4',
        title: 'Електронна поща и комуникация',
        url: 'https://www.youtube.com/watch?v=example4',
        description: 'Създаване и управление на имейл акаунт, етикет в електронната комуникация.',
        duration: '20:15',
        order: 4,
        category: 'Базово ниво'
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Цифрова компетентност - Средно ниво',
    description: 'Напреднали умения за офис приложения и електронна комуникация',
    level: 2,
    color: 'from-blue-500 to-blue-600',
    icon: '💼',
    prerequisite: 'basic',
    estimatedHours: 12,
    isActive: true,
    videos: [
      {
        id: 'intermediate-1',
        title: 'Microsoft Word - Напреднали функции',
        url: 'https://www.youtube.com/watch?v=example5',
        description: 'Стилове, шаблони, съвместна работа и рецензиране на документи.',
        duration: '25:10',
        order: 1,
        category: 'Средно ниво'
      },
      {
        id: 'intermediate-2',
        title: 'Excel за бизнес',
        url: 'https://www.youtube.com/watch?v=example6',
        description: 'Формули, функции, графики и анализ на данни в Excel.',
        duration: '30:15',
        order: 2,
        category: 'Средно ниво'
      },
      {
        id: 'intermediate-3',
        title: 'PowerPoint презентации',
        url: 'https://www.youtube.com/watch?v=example7',
        description: 'Професионални презентации с анимации и интерактивни елементи.',
        duration: '20:40',
        order: 3,
        category: 'Средно ниво'
      },
      {
        id: 'intermediate-4',
        title: 'Облачни технологии',
        url: 'https://www.youtube.com/watch?v=example8',
        description: 'Google Drive, OneDrive, споделяне и синхронизация на файлове.',
        duration: '18:30',
        order: 4,
        category: 'Средно ниво'
      }
    ]
  }
];

/**
 * Получаване на всички курсове (с кеш)
 */
export const courses = async () => {
  // Проверяваме кеша
  if (coursesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return coursesCache;
  }

  try {
    console.log('🔄 Зареждане на курсове от Firestore...');
    const result = await getFirestoreCourses();
    
    if (result.success && result.data.length > 0) {
      // Филтрираме само активните курсове
      const activeCourses = result.data.filter(course => course.isActive !== false);
      
      // Сортираме видеата във всеки курс по order
      const sortedCourses = activeCourses.map(course => ({
        ...course,
        videos: (course.videos || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      }));
      
      // Актуализираме кеша
      coursesCache = sortedCourses;
      cacheTimestamp = Date.now();
      
      console.log(`✅ Заредени ${sortedCourses.length} курса от Firestore`);
      return sortedCourses;
    } else {
      console.log('⚠️ Няма курсове в Firestore, използваме fallback данни');
      return fallbackCourses;
    }
  } catch (error) {
    console.error('❌ Грешка при зареждане от Firestore:', error);
    console.log('🔄 Използваме fallback данни');
    return fallbackCourses;
  }
};

/**
 * Получаване на курс по ID
 */
export const getCourseById = async (courseId) => {
  try {
    // Първо опитваме от Firestore
    const result = await getFirestoreCourse(courseId);
    
    if (result.success) {
      // Сортираме видеата по order
      const course = {
        ...result.data,
        videos: (result.data.videos || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      };
      return course;
    }
    
    // Fallback към статичните данни
    const fallbackCourse = fallbackCourses.find(course => course.id === courseId);
    return fallbackCourse || null;
  } catch (error) {
    console.error('Грешка при получаване на курс:', error);
    
    // Fallback към статичните данни
    const fallbackCourse = fallbackCourses.find(course => course.id === courseId);
    return fallbackCourse || null;
  }
};

/**
 * Синхронен достъп до кешираните курсове
 */
export const getCachedCourses = () => {
  if (coursesCache) {
    return coursesCache;
  }
  
  // Ако няма кеш, връщаме fallback данните
  return fallbackCourses;
};

/**
 * Изчистване на кеша (за принудително презареждане)
 */
export const clearCoursesCache = () => {
  coursesCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Кешът на курсовете е изчистен');
};

/**
 * Получаване на всички курсове синхронно (за съвместимост)
 */
export const getAllCourses = () => {
  // За backward compatibility
  return getCachedCourses();
};

/**
 * Получаване на курсове по ниво
 */
export const getCoursesByLevel = async (level) => {
  const allCourses = await courses();
  return allCourses.filter(course => course.level === level);
};

/**
 * Получаване на предварителните изисквания
 */
export const getPrerequisites = async (courseId) => {
  const course = await getCourseById(courseId);
  if (!course || !course.prerequisite) return [];
  
  const prerequisiteCourse = await getCourseById(course.prerequisite);
  return prerequisiteCourse ? [prerequisiteCourse] : [];
};

/**
 * Проверка дали курсът има предварителни изисквания
 */
export const hasPrerequisites = async (courseId) => {
  const course = await getCourseById(courseId);
  return course && course.prerequisite;
};

/**
 * Получаване на статистики за курсовете
 */
export const getCoursesStats = async () => {
  try {
    const allCourses = await courses();
    const totalVideos = allCourses.reduce((sum, course) => sum + (course.videos?.length || 0), 0);
    const totalHours = allCourses.reduce((sum, course) => sum + (course.estimatedHours || 0), 0);
    const averageVideosPerCourse = allCourses.length > 0 ? totalVideos / allCourses.length : 0;
    
    return {
      totalCourses: allCourses.length,
      totalVideos,
      totalHours,
      averageVideosPerCourse: Math.round(averageVideosPerCourse * 10) / 10,
      coursesByLevel: allCourses.reduce((acc, course) => {
        acc[`level${course.level}`] = (acc[`level${course.level}`] || 0) + 1;
        return acc;
      }, {}),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Грешка при получаване на статистики:', error);
    return {
      totalCourses: 0,
      totalVideos: 0,
      totalHours: 0,
      averageVideosPerCourse: 0,
      coursesByLevel: {},
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Проверка дали има нови курсове в Firestore
 */
export const checkForUpdates = async () => {
  try {
    const result = await getFirestoreCourses();
    if (result.success) {
      const firestoreCount = result.data.filter(c => c.isActive !== false).length;
      const cacheCount = coursesCache ? coursesCache.length : 0;
      
      return {
        hasUpdates: firestoreCount !== cacheCount,
        firestoreCount,
        cacheCount
      };
    }
    return { hasUpdates: false, firestoreCount: 0, cacheCount: 0 };
  } catch (error) {
    return { hasUpdates: false, error: error.message };
  }
};

/**
 * Форсирано презареждане на курсовете
 */
export const reloadCourses = async () => {
  clearCoursesCache();
  return await courses();
};

// Експортираме основните функции за обратна съвместимост
export default {
  courses,
  getCourseById,
  getAllCourses,
  getCoursesByLevel,
  getPrerequisites,
  hasPrerequisites,
  getCoursesStats,
  clearCoursesCache,
  checkForUpdates,
  reloadCourses
};