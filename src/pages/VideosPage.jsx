// src/pages/VideosPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import VideoGallery from '../components/VideoGallery';
import Login from '../components/Login';
import { 
  Lock, 
  Play, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Home,
  BookOpen,
  Clock,
  Award
} from 'lucide-react';

const VideosPage = ({ videos = [], title = "Обучителни видеа" }) => {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  // Групиране на видеата по категории
  const videosByCategory = videos.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {});

  const categories = Object.keys(videosByCategory);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Breadcrumb Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 max-w-[1500px] py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Обратно към началото
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  {videos.length} видеа
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {categories.length} категории
                </div>
                <div className="flex items-center">
                  <Award size={16} className="mr-1" />
                  Сертифициран курс
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {title}
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Професионални обучителни видеа за развитие на вашите цифрови компетентности
              </p>
              
              {/* User Welcome */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-100">
                  Добре дошли, <span className="font-semibold">{user?.email}</span>
                </p>
                <p className="text-sm text-blue-200">
                  Имате достъп до всички {videos.length} обучителни видеа
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="py-12">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {categories.map((category, index) => (
                <div 
                  key={category}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Play className="text-white" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                  <p className="text-gray-600 text-sm">
                    {videosByCategory[category].length} видеа
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Gallery */}
        <VideoGallery videos={videos} title="" />
      </div>
    );
  }

  // Показваме това ако потребителят не е логнат
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 max-w-[1500px] py-4">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Обратно към началото
          </Link>
        </div>
      </div>

      {/* Protected Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-[1500px]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Професионални обучителни материали за развитие на цифрови компетентности
            </p>
          </div>

          {/* Protected Message */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Icon Section */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-700 px-6 py-12 text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-white" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Защитено съдържание
                </h2>
                <p className="text-blue-100 text-lg">
                  Необходима е автентификация за достъп до видео материалите
                </p>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <div className="space-y-8">
                  {/* Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6">
                      <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Play className="text-blue-600" size={32} />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-3">HD Качество</h3>
                      <p className="text-gray-600">
                        Професионално заснети видеа в високо качество
                      </p>
                    </div>
                    
                    <div className="text-center p-6">
                      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Users className="text-green-600" size={32} />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-3">Експерти</h3>
                      <p className="text-gray-600">
                        Видеа от най-добрите преподаватели в областта
                      </p>
                    </div>
                    
                    <div className="text-center p-6">
                      <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-purple-600" size={32} />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-3">Сертификат</h3>
                      <p className="text-gray-600">
                        Получете сертификат след завършване
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {videos.length}+
                        </div>
                        <p className="text-gray-600 text-sm">Видео лекции</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {categories.length}
                        </div>
                        <p className="text-gray-600 text-sm">Категории</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          15+
                        </div>
                        <p className="text-gray-600 text-sm">Часа съдържание</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          100%
                        </div>
                        <p className="text-gray-600 text-sm">Безплатно</p>
                      </div>
                    </div>
                  </div>

                  {/* Login Section */}
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setShowLogin(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                    >
                      Влизане в системата
                    </button>
                    
                    <p className="text-gray-500 mt-4">
                      Нямате акаунт? <Link to="/#contact" className="text-blue-600 hover:underline">Свържете се с нас</Link>
                    </p>
                  </div>

                  {/* Demo Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-3 text-center">
                      🚀 Демо режим - Тествайте сега!
                    </h4>
                    <p className="text-sm text-blue-700 mb-4 text-center">
                      Използвайте един от демо акаунтите за да видите видео съдържанието:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                        <div className="font-semibold text-blue-800 mb-1">Администратор</div>
                        <div className="text-blue-600">admin@iru.bg</div>
                        <div className="text-blue-600">admin123</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                        <div className="font-semibold text-blue-800 mb-1">Преподавател</div>
                        <div className="text-blue-600">teacher@iru.bg</div>
                        <div className="text-blue-600">teacher123</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                        <div className="font-semibold text-blue-800 mb-1">Студент</div>
                        <div className="text-blue-600">student@iru.bg</div>
                        <div className="text-blue-600">student123</div>
                      </div>
                    </div>
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
    </div>
  );
};

export default VideosPage;