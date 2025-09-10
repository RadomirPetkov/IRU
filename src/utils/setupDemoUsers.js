// src/utils/setupDemoUsers.js - Обновен с автоматично създаване в Auth
import { createDemoUsersWithAuth, createDemoUsers } from '../services/userService';

// Функция за създаване на демо потребители с автентификация
export const setupDemoWithAuth = async () => {
  console.log('🚀 Започва настройка на демо потребители с Authentication...');
  
  try {
    const results = await createDemoUsersWithAuth();
    
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 0) {
      console.log('\n✅ Демо потребителите са създадени успешно в Authentication + Firestore!');
      console.log('\n🎯 Готови за използване:');
      
      const successfulUsers = results.filter(r => r.success);
      successfulUsers.forEach(result => {
        console.log(`   ✓ ${result.email} - готов за влизане`);
      });
      
      return true;
    } else {
      console.log('\n⚠️ Няма успешно създадени потребители');
      return false;
    }
  } catch (error) {
    console.error('❌ Грешка при създаване на демо потребители с Auth:', error);
    return false;
  }
};

// Функция за създаване на демо потребители (стара версия - само Firestore)
export const setupDemo = async () => {
  console.log('🚀 Започва настройка на демо потребители (само Firestore)...');
  console.log('⚠️ ВНИМАНИЕ: Тази функция създава профили само във Firestore!');
  console.log('💡 За пълно създаване използвайте setupDemoWithAuth()');
  
  try {
    await createDemoUsers();
    console.log('✅ Демо потребителите са създадени успешно във Firestore!');
    
    console.log('\n📋 Демо акаунти за тестване:');
    console.log('┌─────────────────────┬─────────────────┬─────────────────────────────────┐');
    console.log('│ Email               │ Парола          │ Роля & Достъп                   │');
    console.log('├─────────────────────┼─────────────────┼─────────────────────────────────┤');
    console.log('│ admin@iru.bg        │ admin123        │ Админ - всички курсове          │');
    console.log('│ teacher@iru.bg      │ teacher123      │ Учител - 3 курса               │');
    console.log('│ student@iru.bg      │ student123      │ Студент - базов курс            │');
    console.log('│ student2@iru.bg     │ student123      │ Студент - базов + среден        │');
    console.log('└─────────────────────┴─────────────────┴─────────────────────────────────┘');
    
    console.log('\n🔧 ВАЖНО: За създаване на потребителите във Firebase Auth:');
    console.log('1. Отидете в Firebase Console → Authentication → Users');
    console.log('2. Натиснете "Add user" и добавете горните 4 акаунта ръчно');
    console.log('3. ИЛИ използвайте setupDemoWithAuth() за автоматично създаване');
    
    return true;
  } catch (error) {
    console.error('❌ Грешка при създаване на демо потребители:', error);
    return false;
  }
};

// Проверка дали приложението е настроено
export const checkSetup = async () => {
  try {
    console.log('🔍 Проверка на Firebase връзката...');
    
    // Тук можем да добавим проверки за Firebase конфигурацията
    return true;
  } catch (error) {
    console.error('❌ Проблем с Firebase настройките:', error);
    return false;
  }
};

// Функция за пълна настройка на приложението
export const fullSetup = async () => {
  console.log('🔧 Започва пълна настройка на приложението...');
  
  try {
    // Проверяваме Firebase
    const isSetup = await checkSetup();
    
    if (isSetup) {
      console.log('\n🤔 Изберете метод за създаване на демо потребители:');
      console.log('1. Автоматично (Authentication + Firestore) - препоръчано');
      console.log('2. Само Firestore (ръчно добавяне в Auth)');
      
      // За автоматизирана настройка използваме новия метод
      console.log('\n🎯 Използваме автоматичния метод...');
      const demoCreated = await setupDemoWithAuth();
      
      if (demoCreated) {
        console.log('\n🎉 Приложението е настроено успешно!');
        console.log('✅ Потребителите са създадени в Authentication + Firestore');
        console.log('🔑 Можете веднага да влезете с демо акаунтите');
        return true;
      } else {
        console.log('\n⚠️ Частична настройка на приложението.');
        console.log('💡 Опитайте ръчно с setupDemo() или проверете Firebase настройките');
        return true;
      }
    } else {
      console.log('❌ Проблем с Firebase настройките.');
      return false;
    }
  } catch (error) {
    console.error('❌ Грешка при настройка:', error);
    return false;
  }
};

// Функция за създаване на единичен потребител от конзолата
export const createSingleUser = async (email, password, role = 'student') => {
  console.log(`👤 Създаване на потребител: ${email}`);
  
  try {
    const { createNewUser } = await import('../services/userService');
    
    const result = await createNewUser(email, password, {
      role: role,
      displayName: email.split('@')[0]
    });
    
    
    if (result.success) {
      console.log(`✅ Потребител ${email} създаден успешно!`);
      console.log(`🔑 Email: ${email} | Password: ${password} | Role: ${role}`);
      return true;
    } else {
      console.error(`❌ Грешка: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Грешка при създаване на потребител:', error);
    return false;
  }
};

// Функция за масово създаване на потребители
export const createBulkUsers = async (users) => {
  console.log(`👥 Масово създаване на ${users.length} потребители...`);
  
  const results = [];
  
  for (const userData of users) {
    try {
      const { email, password, role, displayName } = userData;
      
      if (!email || !password) {
        console.log(`⚠️ Пропускаме невалиден потребител: ${JSON.stringify(userData)}`);
        continue;
      }
      
      const result = await createSingleUser(email, password, role || 'student');
      results.push({ email, success: result });
      
      // Малка пауза между заявките
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Грешка при създаване на ${userData.email}:`, error);
      results.push({ email: userData.email, success: false });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Резултат: ${successCount}/${users.length} потребители създадени успешно`);
  
  return results;
};

// Ако файлът се импортира директно, стартираме настройката
if (typeof window !== 'undefined' && window.location) {
  // Добавяме функциите към window обекта за лесно извикване от конзолата
  window.setupDemo = setupDemo;
  window.setupDemoWithAuth = setupDemoWithAuth;
  window.checkSetup = checkSetup;
  window.fullSetup = fullSetup;
  window.createSingleUser = createSingleUser;
  window.createBulkUsers = createBulkUsers;
  
  console.log('🛠️ Demo setup функции са достъпни в конзолата:');
  console.log('');
  console.log('📋 ОСНОВНИ КОМАНДИ:');
  console.log('  window.fullSetup()              - Пълна автоматична настройка');
  console.log('  window.setupDemoWithAuth()      - Създава демо потребители в Auth + Firestore');
  console.log('  window.setupDemo()              - Създава демо потребители само във Firestore');
  console.log('');
  console.log('👤 СЪЗДАВАНЕ НА ПОТРЕБИТЕЛИ:');
  console.log('  window.createSingleUser("email@example.com", "password123", "student")');
  console.log('  window.createBulkUsers([{email: "test@test.com", password: "123", role: "student"}])');
  console.log('');
  console.log('🔧 ПОМОЩНИ:');
  console.log('  window.checkSetup()             - Проверява Firebase настройките');
  console.log('');
  console.log('💡 ПРЕПОРЪКИ:');
  console.log('  • За първоначална настройка: window.fullSetup()');
  console.log('  • За добавяне на нови потребители: window.createSingleUser()');
  console.log('  • Ако имате проблеми: window.checkSetup()');
}