import React from 'react';
import { 
  GraduationCap, 
  Lightbulb, 
  Award, 
  Briefcase,
  Clock,
  BookOpen,
  Zap,
  Atom,
  LaptopMinimal
} from 'lucide-react';

const InstructorsOverview = () => {
  return (
    <div id='team' className="bg-gray-50 py-16 m-auto">
      <div className="max-w-[1500px] px-4 m-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">НАШИТЕ ПРЕПОДАВАТЕЛИ</h2>
          <div className="w-96 h-1 bg-gradient-to-r from-purple-600 to-blue-700 mx-auto mb-8"></div>
          <p className="text-gray-600 max-w-6xl mx-auto">
            Експертен екип от професионалисти с богат опит в сферата на цифровите технологии, 
            които ще ви помогнат да развиете вашите цифрови компетентности
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-10 justify-center">
          <div className="bg-white rounded-3xl drop-shadow-[0_0px_10px_rgba(0,0,0,0.25)] p-6 text-center transition-transform hover:transform hover:scale-105 w-full sm:w-1/3 lg:w-1/5 mb-6 px-3">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Висока квалификация</h3>
            <p className="text-gray-600">
              Притежават професорски степени в престижни учебни заведения.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl drop-shadow-[0_0px_10px_rgba(0,0,0,0.25)] p-6 text-center transition-transform hover:transform hover:scale-105 w-full sm:w-1/3 lg:w-1/5 mb-6 px-3">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Atom className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Адаптивни методи на преподаване</h3>
            <p className="text-gray-600">
            Гъвкави подходи, съобразени с нивото и темпото на курсистите.
            </p>
          </div>

          <div className="bg-white rounded-3xl drop-shadow-[0_0px_10px_rgba(0,0,0,0.25)] p-6 text-center transition-transform hover:transform hover:scale-105 w-full sm:w-1/3 lg:w-1/5 mb-6 px-3">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Експертни лектори</h3>
            <p className="text-gray-600">
            Преподаватели с участие в конференции, семинари и форуми за нови технологии.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl drop-shadow-[0_0px_10px_rgba(0,0,0,0.25)] p-6 text-center transition-transform hover:transform hover:scale-105 w-full sm:w-1/3 lg:w-1/5 mb-6 px-3">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <LaptopMinimal className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Иновативен подход</h3>
            <p className="text-gray-600">
              Съвременни методи на преподаване, съчетаващи теоретични знания с практически упражнения и решаване на реални казуси.
            </p>
          </div>
        </div>

        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border-l-4 border-blue-500 mt-12 drop-shadow-[0_0px_10px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full p-3 mr-4 mb-4 md:mb-0">
          <Clock className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Постоянно развитие и актуализация</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
            <BookOpen className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Актуални знания</h4>
            <p className="text-gray-700">
              Нашите преподаватели непрекъснато актуализират своите знания и учебни материали според последните тенденции в света на дигиталните технологии.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
            <Zap className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Практически опит</h4>
            <p className="text-gray-700">
              Благодарение на дългогодишния им опит, ще получите не само теоретични знания, но и практически умения, директно приложими във вашата работа.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
            <Award className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Професионално развитие</h4>
            <p className="text-gray-700">
              Те участват редовно в професионални обучения, конференции и семинари, за да ви предоставят най-актуалната и полезна информация.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
        <p className="text-gray-700 italic">
          "Нашата цел е не просто да предадем знания, а да изградим дигитални умения, които ще ви служат успешно в динамично променящата се технологична среда."
        </p>
      </div>
    </div>
      </div>
    </div>
  );
};

export default InstructorsOverview;