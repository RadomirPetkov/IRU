// src/components/EUProjectBanner.jsx - Банер за визуализация на ЕС проект
import React, { useState } from 'react';
import { Info, X, ExternalLink } from 'lucide-react';

const EUProjectBanner = ({ variant = 'full' }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Кратка версия - само лого
  if (variant === 'logo-only') {
    return (
      <div className="flex justify-center py-4">
        <img 
          src="/img/eu-funded-bg.png" 
          alt="Съфинансирано от Европейския съюз" 
          className="h-12 md:h-16 w-auto"
        />
      </div>
    );
  }

  // Компактна версия - лого + кратък текст
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-4">
        <div className="container mx-auto max-w-[1500px] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <img 
              src="/img/eu-funded-bg.png" 
              alt="Съфинансирано от Европейския съюз" 
              className="h-10 md:h-12 w-auto bg-white p-1 rounded"
            />
            <p className="text-sm md:text-base">
              Проект <strong>BG05SFPR002-1.011-0001</strong> - Програма „Развитие на човешките ресурси" 2021-2027
            </p>
          </div>
          <button 
            onClick={() => setShowDetails(true)}
            className="text-blue-200 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            <Info size={16} />
            Подробности
          </button>
        </div>

        {/* Modal с детайли */}
        {showDetails && (
          <ProjectDetailsModal onClose={() => setShowDetails(false)} />
        )}
      </div>
    );
  }

  // Пълна версия - за footer или отделна секция
  return (
    <div className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-[1500px] py-8 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          {/* Лого */}
          <div className="flex-shrink-0">
            <img 
              src="/img/eu-funded-bg.png" 
              alt="Съфинансирано от Европейския съюз" 
              className="h-20 md:h-24 w-auto"
            />
          </div>

          {/* Текст */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-gray-600 text-sm text-center">
              Финансиран от Програма <strong>„Развитие на човешките ресурси" 2021-2027</strong>, съфинансирана от Европейския съюз чрез Европейския социален фонд+
            </p>
          </div>

          {/* Бутон за още информация */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowDetails(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Info size={16} />
              Повече информация
            </button>
          </div>
        </div>

        {/* Долна линия с номер на проекта */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Проект BG05SFPR002-1.011-0001 | Програма „Развитие на човешките ресурси" 2021-2027 | 
            Съфинансирано от Европейския съюз
          </p>
        </div>
      </div>

      {/* Modal с детайли */}
      {showDetails && (
        <ProjectDetailsModal onClose={() => setShowDetails(false)} />
      )}
    </div>
  );
};

// Модален прозорец с пълни детайли за проектите
const ProjectDetailsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('eu'); // 'eu' or 'national'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/img/eu-funded-bg.png" 
                alt="ЕС" 
                className="h-16 w-auto bg-white p-2 rounded"
              />
              <div>
                <h2 className="text-xl font-bold">Информация за проектите</h2>
                <p className="text-blue-200 text-sm mt-1">Финансиране на обученията</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs - Fixed at top */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('eu')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === 'eu'
                ? 'text-white bg-blue-600 border-b-2 border-blue-800'
                : 'text-white bg-blue-400 hover:bg-blue-500'
            }`}
          >
            🇪🇺 Европейски съюз
          </button>
          <button
            onClick={() => setActiveTab('national')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === 'national'
                ? 'text-white bg-green-600 border-b-2 border-green-800'
                : 'text-white bg-green-400 hover:bg-green-500'
            }`}
          >
            🇧🇬 Национален план
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ==================== ЕС ПРОЕКТ ==================== */}
          {activeTab === 'eu' && (
            <>
              {/* Основна информация */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Номер на проекта</h3>
                <p className="text-2xl font-bold text-blue-800">BG05SFPR002-1.011-0001</p>
              </div>

              {/* Наименование */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Наименование на проекта</h3>
                <p className="text-gray-700 text-lg">
                  „Квалификация, умения и кариерно развитие на заети лица"
                </p>
              </div>

              {/* Програма */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Финансираща програма</h3>
                <p className="text-gray-700">
                  Програма <strong>„Развитие на човешките ресурси" 2021-2027</strong>
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Съфинансирана от Европейския съюз чрез Европейския социален фонд+
                </p>
              </div>

              {/* Цели */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Цели на проекта</h3>
                <p className="text-gray-700 leading-relaxed">
                  Проектът цели да предостави подкрепа за професионално развитие и гъвкави възможности за обучение, 
                  като осигурява достъп до качествено образование и квалификация за заети лица.
                </p>
              </div>

              {/* Териториално покритие */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Териториален обхват</h3>
                <p className="text-gray-700">
                  На територията на цялата страна.
                </p>
              </div>

              {/* Период */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Програмен период</p>
                  <p className="text-xl font-bold text-gray-800">2021 - 2027</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Финансиране</p>
                  <p className="text-xl font-bold text-blue-800">ЕСФ+</p>
                </div>
              </div>

              {/* Линкове */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Полезни връзки</h3>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://esf.bg/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <ExternalLink size={16} />
                    esf.bg
                  </a>
                  <a 
                    href="https://eufunds.bg/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <ExternalLink size={16} />
                    eufunds.bg
                  </a>
                </div>
              </div>
            </>
          )}

          {/* ==================== НАЦИОНАЛЕН ПЛАН ==================== */}
          {activeTab === 'national' && (
            <>
              {/* Основна информация */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Номер на инвестицията</h3>
                <p className="text-2xl font-bold text-green-800">BG-RRP-1.019-0002</p>
              </div>

              {/* Наименование */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Наименование</h3>
                <p className="text-gray-700 text-lg">
                  „Компонент 2: Обучения за DI-GI умения и компетенции"
                </p>
              </div>

              {/* Рамка */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Рамка на изпълнение</h3>
                <p className="text-gray-700">
                  Изпълнява се в рамките на <strong>Национален план за възстановяване и устойчивост на Република България</strong>
                </p>
              </div>

              {/* Цели */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Цел на инвестицията</h3>
                <p className="text-gray-700 leading-relaxed">
                  Повишаване на дигиталните умения и компетенции на населението в съответствие с новите 
                  потребности на пазара на труда.
                </p>
              </div>

              {/* Териториално покритие */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Обхват</h3>
                <p className="text-gray-700">
                  На територията на цялата страна.
                </p>
              </div>

              {/* Период */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Краен срок</p>
                  <p className="text-xl font-bold text-gray-800">30.06.2026 г.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Финансиране</p>
                  <p className="text-xl font-bold text-green-800">НПВУ</p>
                </div>
              </div>

              {/* Ключови думи */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Фокус на обученията</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Дигитални умения
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    DI-GI компетенции
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Пазар на труда
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Професионално развитие
                  </span>
                </div>
              </div>

              {/* Линкове */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Полезни връзки</h3>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://nextgeneration.bg/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <ExternalLink size={16} />
                    nextgeneration.bg
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {activeTab === 'eu' 
                ? '© Европейски съюз | Европейски социален фонд+'
                : '© Национален план за възстановяване и устойчивост'
              }
            </p>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Затвори
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EUProjectBanner;