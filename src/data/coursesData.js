// src/data/coursesData.js
export const courses = [
    {
      id: 'basic',
      title: 'Цифрова компетентност - Базово ниво',
      description: 'Основни умения за работа с компютър и интернет',
      level: 1,
      color: 'from-green-500 to-green-600',
      icon: '📱',
      prerequisite: null, // Няма предварителни изисквания
      estimatedHours: 8,
      videos: [
        {
          id: 'basic-1',
          title: 'Въведение в компютрите',
          url: 'https://www.youtube.com/watch?v=example1',
          description: 'Основни понятия за хардуер и софтуер. Какво е компютър и как работи.',
          duration: '15:30',
          order: 1
        },
        {
          id: 'basic-2',
          title: 'Работа с операционна система',
          url: 'https://www.youtube.com/watch?v=example2',
          description: 'Навигация във Windows, файлове и папки, основни настройки.',
          duration: '22:45',
          order: 2
        },
        {
          id: 'basic-3',
          title: 'Основи на интернет браузърите',
          url: 'https://www.youtube.com/watch?v=example3',
          description: 'Как да сърфираме безопасно в интернет, търсачки и социални мрежи.',
          duration: '18:20',
          order: 3
        },
        {
          id: 'basic-4',
          title: 'Електронна поща и комуникация',
          url: 'https://www.youtube.com/watch?v=example4',
          description: 'Създаване и управление на имейл акаунт, етикет в електронната комуникация.',
          duration: '20:15',
          order: 4
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
      prerequisite: 'basic', // Изисква завършване на базовото ниво
      estimatedHours: 12,
      videos: [
        {
          id: 'intermediate-1',
          title: 'Microsoft Word - Напреднали функции',
          url: 'https://www.youtube.com/watch?v=example5',
          description: 'Стилове, шаблони, съвместна работа и рецензиране на документи.',
          duration: '25:10',
          order: 1
        },
        {
          id: 'intermediate-2',
          title: 'Excel за бизнес',
          url: 'https://www.youtube.com/watch?v=example6',
          description: 'Формули, функции, графики и анализ на данни в Excel.',
          duration: '30:15',
          order: 2
        },
        {
          id: 'intermediate-3',
          title: 'PowerPoint презентации',
          url: 'https://www.youtube.com/watch?v=example7',
          description: 'Професионални презентации с анимации и интерактивни елементи.',
          duration: '20:40',
          order: 3
        },
        {
          id: 'intermediate-4',
          title: 'Облачни технологии',
          url: 'https://www.youtube.com/watch?v=example8',
          description: 'Google Drive, OneDrive, споделяне и синхронизация на файлове.',
          duration: '18:30',
          order: 4
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Цифрова компетентност - Напреднало ниво',
      description: 'Специализирани умения за дигитален маркетинг и автоматизация',
      level: 3,
      color: 'from-purple-500 to-purple-600',
      icon: '🚀',
      prerequisite: 'intermediate', // Изисква завършване на средното ниво
      estimatedHours: 16,
      videos: [
        {
          id: 'advanced-1',
          title: 'Дигитален маркетинг основи',
          url: 'https://www.youtube.com/watch?v=example9',
          description: 'SEO, социални мрежи и онлайн реклама. Стратегии за дигитално присъствие.',
          duration: '35:20',
          order: 1
        },
        {
          id: 'advanced-2',
          title: 'Автоматизация на процесите',
          url: 'https://www.youtube.com/watch?v=example10',
          description: 'Използване на инструменти за автоматизация, Zapier, IFTTT.',
          duration: '28:30',
          order: 2
        },
        {
          id: 'advanced-3',
          title: 'Анализ на данни',
          url: 'https://www.youtube.com/watch?v=example11',
          description: 'Google Analytics, бизнес аналитика и вземане на решения на база данни.',
          duration: '32:15',
          order: 3
        },
        {
          id: 'advanced-4',
          title: 'Проектно управление',
          url: 'https://www.youtube.com/watch?v=example12',
          description: 'Дигитални инструменти за управление на проекти - Trello, Asana, Monday.',
          duration: '26:45',
          order: 4
        }
      ]
    },
    {
      id: 'expert',
      title: 'Цифрова компетентност - Високоспециализирано ниво',
      description: 'Експертни знания за програмиране и системна администрация',
      level: 4,
      color: 'from-red-500 to-red-600',
      icon: '🎯',
      prerequisite: 'advanced', // Изисква завършване на напредналото ниво
      estimatedHours: 20,
      videos: [
        {
          id: 'expert-1',
          title: 'Основи на програмирането',
          url: 'https://www.youtube.com/watch?v=example13',
          description: 'Въведение в Python и JavaScript, основни алгоритми и структури данни.',
          duration: '45:30',
          order: 1
        },
        {
          id: 'expert-2',
          title: 'Системна администрация',
          url: 'https://www.youtube.com/watch?v=example14',
          description: 'Управление на сървъри, мрежи и операционни системи.',
          duration: '40:20',
          order: 2
        },
        {
          id: 'expert-3',
          title: 'Кибер сигурност за експерти',
          url: 'https://www.youtube.com/watch?v=example15',
          description: 'Напреднали техники за защита, пентестинг и инцидентен отговор.',
          duration: '38:45',
          order: 3
        },
        {
          id: 'expert-4',
          title: 'Облачна архитектура',
          url: 'https://www.youtube.com/watch?v=example16',
          description: 'AWS, Azure, Docker, Kubernetes и модерни DevOps практики.',
          duration: '42:15',
          order: 4
        }
      ]
    }
  ];
  
  // Функция за получаване на курс по ID
  export const getCourseById = (courseId) => {
    return courses.find(course => course.id === courseId);
  };
  
  // Функция за получаване на всички курсове
  export const getAllCourses = () => {
    return courses;
  };
  
  // Функция за получаване на курсове по ниво
  export const getCoursesByLevel = (level) => {
    return courses.filter(course => course.level === level);
  };
  
  // Функция за получаване на предварителните изисквания
  export const getPrerequisites = (courseId) => {
    const course = getCourseById(courseId);
    if (!course || !course.prerequisite) return [];
    
    const prerequisiteCourse = getCourseById(course.prerequisite);
    return prerequisiteCourse ? [prerequisiteCourse] : [];
  };
  
  // Функция за проверка дали курсът има предварителни изисквания
  export const hasPrerequisites = (courseId) => {
    const course = getCourseById(courseId);
    return course && course.prerequisite;
  };
  
  // Функция за получаване на статистики за курсовете
  export const getCoursesStats = () => {
    const totalVideos = courses.reduce((sum, course) => sum + course.videos.length, 0);
    const totalHours = courses.reduce((sum, course) => sum + course.estimatedHours, 0);
    const averageVideosPerCourse = totalVideos / courses.length;
    
    return {
      totalCourses: courses.length,
      totalVideos,
      totalHours,
      averageVideosPerCourse: Math.round(averageVideosPerCourse * 10) / 10,
      coursesByLevel: courses.reduce((acc, course) => {
        acc[`level${course.level}`] = (acc[`level${course.level}`] || 0) + 1;
        return acc;
      }, {})
    };
  };