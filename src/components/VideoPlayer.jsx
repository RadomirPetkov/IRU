import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings } from 'lucide-react';

const VideoPlayer = ({ videoUrl, title, autoplay = false, controls = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && autoplay) {
      video.play();
      setIsPlaying(true);
    }
  }, [autoplay, videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    if (video) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Функция за определяне на типа видео от URL
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else {
      return 'direct';
    }
  };

  // Функция за конвертиране на YouTube URL в embed URL
  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Функция за конвертиране на Vimeo URL в embed URL
  const getVimeoEmbedUrl = (url) => {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const videoType = getVideoType(videoUrl);

  if (videoType === 'youtube') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {title && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={getYouTubeEmbedUrl(videoUrl)}
            title={title || "YouTube Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }

  if (videoType === 'vimeo') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {title && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={getVimeoEmbedUrl(videoUrl)}
            title={title || "Vimeo Video"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }

  // За директни видео файлове
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      )}
      
      <div 
        className="relative w-full bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-auto"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        
        {controls && (
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress Bar */}
            <div 
              className="w-full bg-gray-600 h-2 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <button
                  onClick={restart}
                  className="hover:text-blue-400 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="hover:text-blue-400 transition-colors"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;