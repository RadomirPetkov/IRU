// src/components/VideoGallery.jsx - Enhanced version за отделната страница
import React, { useState, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import { Play, X, Grid, List, Filter, Search, Clock, Tag } from 'lucide-react';

const VideoGallery = ({ videos = [], title = "Видео галерия" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  // Получаваме уникалните категории
  const categories = useMemo(() => {
    const cats = [...new Set(videos.map(video => video.category))];
    return ['all', ...cats];
  }, [videos]);

  // Филтриране и сортиране на видеата
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Филтриране по търсене
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Филтриране по категория
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    // Сортиране
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'duration':
          // Конвертираме времето в секунди за сравнение
          const getDurationInSeconds = (duration) => {
            const [minutes, seconds] = duration.split(':').map(Number);
            return minutes * 60 + seconds;
          };
          return getDurationInSeconds(a.duration || "0:00") - getDurationInSeconds(b.duration || "0:00");
        default:
          return 0;
      }
    });

    return filtered;
  }, [videos, searchTerm, selectedCategory, sortBy]);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  const getVideoThumbnail = (videoUrl) => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      }
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return null;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Базово ниво': 'bg-green-100 text-green-800',
      'Офис приложения': 'bg-blue-100 text-blue-800',
      'Кибер сигурност': 'bg-red-100 text-red-800',
      'Електронно управление': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-[1500px]">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Търсене в видеата..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Всички категории</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Сортиране по име</option>
                <option value="category">Сортиране по категория</option>
                <option value="duration">Сортиране по време</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-l-lg border transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-r-lg border-t border-r border-b transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Показани {filteredAndSortedVideos.length} от {videos.length} видеа
              {selectedCategory !== 'all' && (
                <span className="ml-2">
                  в категория: <span className="font-semibold">{selectedCategory}</span>
                </span>
              )}
              {searchTerm && (
                <span className="ml-2">
                  за: <span className="font-semibold">"{searchTerm}"</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Videos Grid/List */}
        {filteredAndSortedVideos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Няма намерени видеа
            </h3>
            <p className="text-gray-600">
              Опитайте с различни ключови думи или изберете друга категория
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredAndSortedVideos.map((video, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => openVideoModal(video)}
              >
                {/* Thumbnail */}
                <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full'}`}>
                  {getVideoThumbnail(video.url) ? (
                    <img
                      src={getVideoThumbnail(video.url)}
                      alt={video.title}
                      className={`w-full object-cover ${viewMode === 'list' ? 'h-36' : 'h-48'}`}
                    />
                  ) : (
                    <div className={`w-full bg-gradient-to-r from-purple-600 to-blue-700 flex items-center justify-center ${viewMode === 'list' ? 'h-36' : 'h-48'}`}>
                      <Play size={48} className="text-white" />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 group">
                    <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <Play size={24} className="text-gray-800" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Clock size={12} className="mr-1" />
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 line-clamp-2 flex-1">
                      {video.title}
                    </h3>
                  </div>
                  
                  {video.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {video.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {video.category && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                        <Tag size={12} className="mr-1" />
                        {video.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {showModal && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedVideo.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedVideo.category)}`}>
                      <Tag size={12} className="mr-1" />
                      {selectedVideo.category}
                    </span>
                    {selectedVideo.duration && (
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {selectedVideo.duration}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-800 transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Video Player */}
              <div className="p-6">
                <VideoPlayer
                  videoUrl={selectedVideo.url}
                  title={selectedVideo.title}
                  autoplay={true}
                />
                
                {/* Video Description */}
                {selectedVideo.description && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">Описание:</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedVideo.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay за затваряне на modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeModal}
          ></div>
        )}
      </div>
    </div>
  );
};

export default VideoGallery;