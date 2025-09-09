// src/data/userPermissions.js

// Демо потребители с техните права за достъп
export const userPermissions = {
    'admin@iru.bg': {
      role: 'admin',
      courses: ['basic', 'intermediate', 'advanced', 'expert'],
      displayName: 'Администратор',
      description: 'Пълен достъп до всички курсове и администрация на системата'
    },
    'teacher@iru.bg': {
      role: 'teacher', 
      courses: ['basic', 'intermediate', 'advanced'],
      displayName: 'Преподавател',
      description: 'Достъп до базово, средно и напреднало ниво'
    },
    'student@iru.bg': {
      role: 'student',
      courses: ['basic'],
      displayName: 'Студент',
      description: 'Достъп само до базовото ниво'
    },
    'student2@iru.bg': {
      role: 'student',
      courses: ['basic', 'intermediate'],
      displayName: 'Напреднал студент',
      description: 'Достъп до базово и средно ниво'
    },
    'guest@iru.bg': {
      role: 'guest',
      courses: [],
      displayName: 'Гост',
      description: 'Няма достъп до курсове'
    }
  };
  
  // Дефиниции на роли и техните права
  export const roleDefinitions = {
    'admin': {
      name: 'Администратор',
      color: 'bg-red-100 text-red-800',
      permissions: ['view_all_courses', 'manage_users', 'manage_content', 'view_analytics'],
      defaultCourses: ['basic', 'intermediate', 'advanced', 'expert']
    },
    'teacher': {
      name: 'Преподавател',
      color: 'bg-green-100 text-green-800',
      permissions: ['view_courses', 'manage_content', 'view_student_progress'],
      defaultCourses: ['basic', 'intermediate', 'advanced']
    },
    'student': {
      name: 'Студент',
      color: 'bg-blue-100 text-blue-800',
      permissions: ['view_assigned_courses', 'track_progress'],
      defaultCourses: ['basic']
    },
    'guest': {
      name: 'Гост',
      color: 'bg-gray-100 text-gray-800',
      permissions: ['view_public_content'],
      defaultCourses: []
    }
  };
  
  // Функция за получаване на правата на потребител
  export const getUserPermissions = (userEmail) => {
    if (!userEmail) {
      return { 
        role: 'guest', 
        courses: [],
        displayName: 'Неидентифициран потребител',
        description: 'Няма достъп до курсове'
      };
    }
    
    return userPermissions[userEmail] || { 
      role: 'guest', 
      courses: [],
      displayName: 'Неизвестен потребител',
      description: 'Няма достъп до курсове'
    };
  };
  
  // Функция за проверка дали потребителят има достъп до курс
  export const hasAccessToCourse = (userEmail, courseId) => {
    const permissions = getUserPermissions(userEmail);
    return permissions.courses.includes(courseId);
  };
  
  // Функция за получаване на информация за роля
  export const getRoleInfo = (roleName) => {
    return roleDefinitions[roleName] || roleDefinitions['guest'];
  };
  
  // Функция за проверка на конкретно право
  export const hasPermission = (userEmail, permission) => {
    const userPerms = getUserPermissions(userEmail);
    const roleInfo = getRoleInfo(userPerms.role);
    return roleInfo.permissions.includes(permission);
  };
  
  // Функция за добавяне на нов потребител (за администрация)
  export const addUser = (email, role, customCourses = null) => {
    const roleInfo = getRoleInfo(role);
    const courses = customCourses || roleInfo.defaultCourses;
    
    userPermissions[email] = {
      role: role,
      courses: courses,
      displayName: `${roleInfo.name}`,
      description: `Създаден ${new Date().toLocaleDateString()}`
    };
    
    return userPermissions[email];
  };
  
  // Функция за обновяване на правата на потребител
  export const updateUserCourses = (email, newCourses) => {
    if (userPermissions[email]) {
      userPermissions[email].courses = newCourses;
      return true;
    }
    return false;
  };
  
  // Функция за премахване на потребител
  export const removeUser = (email) => {
    if (userPermissions[email]) {
      delete userPermissions[email];
      return true;
    }
    return false;
  };
  
  // Функция за получаване на всички потребители (за админ панел)
  export const getAllUsers = () => {
    return Object.entries(userPermissions).map(([email, data]) => ({
      email,
      ...data,
      roleInfo: getRoleInfo(data.role)
    }));
  };
  
  // Функция за получаване на статистики
  export const getUserStats = () => {
    const users = Object.values(userPermissions);
    const roleCount = {};
    
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    return {
      totalUsers: users.length,
      roleDistribution: roleCount,
      averageCoursesPerUser: users.reduce((acc, user) => acc + user.courses.length, 0) / users.length
    };
  };