// src/components/DemoAccounts.jsx
import React, { useState } from 'react';
import { loginUser } from '../firebaseAuth';
import { User, Shield, GraduationCap, BookOpen } from 'lucide-react';

const DemoAccounts = ({ onLoginSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const demoAccounts = [
    {
      email: 'admin@iru.bg',
      password: 'admin123',
      role: 'Администратор',
      description: 'Пълен достъп до всички курсове и администрация',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      features: ['Всички курсове', 'Управление потребители', 'Статистики', 'Админ панел']
    },
    {
      email: 'teacher@iru.bg',
      password: 'teacher123',
      role: 'Преподавател',
      description: 'Достъп до курсове и преглед на прогреса на студентите',
      icon: GraduationCap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      features: ['3 курса достъпни', 'Преглед на прогрес', 'Управление съдържание']
    },
    {
      email: 'student@iru.bg',
      password: 'student123',
      role: 'Студент',
      description: 'Достъп до базовия курс за начинаещи',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      features: ['1 курс достъпен', 'Проследяване прогрес', 'Сертификати']
    },
    {
      email: 'student2@iru.bg',
      password: 'student123',
      role: 'Напреднал студент',
      description: 'Достъп до базов и среден курс',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      features: ['2 курса достъпни', 'Напреднали умения', 'Детайлен прогрес']
    }
  ];

  const handleLogin = async (account) => {
    setLoading(true);
    setSelectedAccount(account.email);
    
    try {
      const result = await loginUser(account.email, account.password);
      
      if (result.success) {
        console.log('✅ Успешно влизане с демо акаунт:', account.email);
        onLoginSuccess && onLoginSuccess(result.user);
      } else {
        console.error('❌ Грешка при влизане:', result.error);
        alert(`Грешка при влизане: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Грешка при влизане:', error);
      alert('Грешка при влизане. Моля опитайте отново.');
    } finally {
      setLoading(false);
      setSelectedAccount(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🚀 Демо акаунти за тестване
        </h3>
        <p className="text-sm text-gray-600">
          Използвайте един от готовите акаунти за бързо влизане в системата
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoAccounts.map((account) => {
          const IconComponent = account.icon;
          const isLoading = loading && selectedAccount === account.email;
          
          return (
            <div
              key={account.email}
              className={`${account.bgColor} border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              onClick={() => !loading && handleLogin(account)}
            >
              <div className="flex items-start space-x-4">
                <div className={`bg-gradient-to-r ${account.color} rounded-full p-3 flex-shrink-0`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-bold ${account.textColor}`}>
                      {account.role}
                    </h4>
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {account.description}
                  </p>
                  
                  <div className="space-y-1 mb-3">
                    <div className="text-xs font-mono bg-white bg-opacity-50 rounded px-2 py-1">
                      {account.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      Парола: {account.password}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {account.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block bg-white bg-opacity-60 text-xs px-2 py-1 rounded-full text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className={`bg-gradient-to-r ${account.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLoading ? 'opacity-75' : 'hover:shadow-lg'
                }`}>
                  {isLoading ? 'Влизане...' : 'Влизане с този акаунт'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="text-yellow-400">⚠️</div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">
              Важна информация
            </h4>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Тези акаунти са само за демо цели</li>
                <li>Данните могат да бъдат изтрити периодично</li>
                <li>За реално използване, създайте собствен акаунт</li>
                <li>Не споделяйте чувствителна информация в демо акаунтите</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-sm underline"
          disabled={loading}
        >
          Използвай собствен акаунт
        </button>
      </div>
    </div>
  );
};

export default DemoAccounts;