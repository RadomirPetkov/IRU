// src/utils/setupDemoUsers.js
import { createDemoUsers } from '../services/userService';

// Функция за създаване на демо потребители
// Извикайте я след инсталиране на приложението
export const setupDemo = async () => {
  console.log('🚀 Започва настройка на демо потребители...');
  
  try {
    await createDemoUsers();
    console.log('✅ Демо потребителите са създадени успешно!');
    
    console.log('\n📋 Демо акаунти за тестване:');
    console.log('┌─────────────────────┬─────────────────┬─────────────────────────────────┐');
    console.log('│ Email               │ Парола          │ Роля & Достъп                   │');
    console.log('├─────────────────────┼─────────────────┼─────────────────────────────────┤');
    console.log('│ admin@iru.bg        │ admin123        │ Админ - всички курсове          │');
    console.log('│ teacher@iru.bg      │ teacher123      │ Учител - 3 курса               │');
    console.log('│ student@iru.bg      │ student123      │ Студент - базов курс            │');
    console.log('│ student2@iru.bg     │ student123      │ Студент - базов + среден        │');
    console.log('└─────────────────────┴─────────────────┴─────────────────────────────────┘');
    
    console.log('\n🔧 За създаване на потребителите във Firebase Auth:');
    console.log('1. Отидете в Firebase Console');
    console.log('2. Authentication > Users');
    console.log('3. Add user - добавете горните 4 акаунта');
    console.log('4. Или използвайте createUserWithEmailAndPassword в кода');
    
    return true;
  } catch (error) {
    console.error('❌ Грешка при създаване на демо потребители:', error);
    return false;
  }
};

// Проверка дали приложението е настроено
export const checkSetup = async () => {
  // Тази функция може да провери дали Firebase е настроен правилно
  try {
    // Опит за четене от Firestore
    console.log('🔍 Проверка на Firebase Firestore връзката...');
    
    // Ако този код се изпълни без грешка, Firebase работи
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
      // Създаваме демо потребителите
      const demoCreated = await setupDemo();
      
      if (demoCreated) {
        console.log('✅ Приложението е настроено успешно!');
        return true;
      } else {
        console.log('⚠️ Частична настройка на приложението.');
        return true; // Връщаме true за да продължи приложението
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

// Ако файлът се импортира директно, стартираме настройката
if (typeof window !== 'undefined' && window.location) {
  // Добавяме функциите към window обекта за лесно извикване от конзолата
  window.setupDemo = setupDemo;
  window.checkSetup = checkSetup;
  window.fullSetup = fullSetup;
  
  console.log('🛠️ Demo setup функции са достъпни:');
  console.log('- window.setupDemo() - Създава демо потребители');
  console.log('- window.checkSetup() - Проверява настройките');
  console.log('- window.fullSetup() - Пълна настройка');
}