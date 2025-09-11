// src/components/ProtectedVideoGallery.jsx - Почистена версия
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VideoGallery from './VideoGallery';
import Login from './Login';
import { Lock, Play, Users, ShieldCheck } from 'lucide-react';

const ProtectedVideoGallery = ({ videos = [], title = "Обучителни видеа" }) => {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  if (isAuthenticated) {
    return <VideoGallery videos={videos} title={title} />;
  }

  return (
    <div id="videos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-[1500px]">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 relative inline-block">
            {title}
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-700"></div>
          </h2>
        </div>

        {/* Protected Content Message */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Icon Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-700 px-6 py-8 text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Защитено съдържание
              </h3>
              <p className="text-blue-100">
                Необходима е автентификация за достъп до видео материалите
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Play className="text-blue-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Качествени видеа</h4>
                    <p className="text-sm text-gray-600">
                      Професионално създадени обучителни материали
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Users className="text-green-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Експертни лектори</h4>
                    <p className="text-sm text-gray-600">
                      Видеа от най-добрите преподаватели в областта
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="text-purple-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Сигурен достъп</h4>
                    <p className="text-sm text-gray-600">
                      Защитено съдържание за регистрирани потребители
                    </p>
                  </div>
                </div>

                {/* Video Count */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {videos.length}+
                  </div>
                  <p className="text-gray-600">
                    Обучителни видеа ви очакват след влизане в системата
                  </p>
                </div>

                {/* Login Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Влизане в системата
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Нямате акаунт? Свържете се с нас за регистрация
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLogin && (
          <Login 
            onClose={() => setShowLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ProtectedVideoGallery;