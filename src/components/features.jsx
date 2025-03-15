import React from "react";
import { Laptop, BookOpenCheck, Squirrel, Users, ArchiveRestore, GraduationCap, Briefcase, Clock } from "lucide-react";

export const Features = (props) => {
  // Функция, която връща подходяща икона според заглавието или индекса
  const getIcon = (title, index) => {
    // Можете да добавите логика за избор на икона според заглавието
    const icons = [
      <Laptop size={24} strokeWidth={2} />,
      <BookOpenCheck size={24} strokeWidth={2} />,
      <Users size={24} strokeWidth={2} />,
      <ArchiveRestore size={24} strokeWidth={2} />
    ];
    
    // Връща икона според индекса или първата икона, ако индексът е невалиден
    return icons[index] || icons[0];
  };

  return (
    <div id="features" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-[1500px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 relative inline-block">
            Какво предлагаме
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-700 to-purple-600"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {props.data
            ? props.data.map((d, i) => (
                <div 
                  key={`${d.title}-${i}`} 
                  className="bg-white rounded-lg shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-28 h-28 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center text-white">
                      {getIcon(d.title, i)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{d.title}</h3>
                  <p className="text-gray-600">{d.text}</p>
                </div>
              ))
            : <div className="col-span-full text-center py-8">Loading...</div>}
        </div>
      </div>
    </div>
  );
};

export default Features;