import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Settings,
  CheckCircle,
  X,
} from "lucide-react";

const VideoPlayer = ({
  videoUrl,
  title,
  autoplay = false,
  controls = true,
  isCompleted = false,
  onVideoCompleted,
  onVideoProgress,
  onMarkUncompleted,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] =
    useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && autoplay) {
      video.play();
      setIsPlaying(true);
    }
  }, [autoplay, videoUrl]);

  useEffect(() => {
    // Ако видеото вече е завършено, не триггерваме автоматично завършване
    setHasTriggeredCompletion(isCompleted);
  }, [isCompleted]);

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
      const current = video.currentTime;
      const total = video.duration;

      setCurrentTime(current);

      if (total > 0) {
        const progress = (current / total) * 100;
        setWatchProgress(progress);

        // Извикваме callback за прогрес (за статистики)
        if (onVideoProgress) {
          onVideoProgress(current, total, progress);
        }

        // Проверяваме дали сме достигнали 90% и не сме вече триггерирали завършване
        if (progress >= 90 && !hasTriggeredCompletion && !isCompleted) {
          console.log(
            `📹 Видео достигна ${Math.round(
              progress
            )}% - автоматично маркиране като завършено`
          );
          setHasTriggeredCompletion(true);
          setShowCompletionNotification(true);

          if (onVideoCompleted) {
            onVideoCompleted();
          }

          // Скриваме нотификацията след 3 секунди
          setTimeout(() => {
            setShowCompletionNotification(false);
          }, 3000);
        }
      }
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
      setWatchProgress(0);
      // При рестарт не нулираме hasTriggeredCompletion ако видеото е вече завършено
      if (!isCompleted) {
        setHasTriggeredCompletion(false);
      }
    }
  };

  const handleMarkUncompleted = () => {
    if (onMarkUncompleted) {
      setHasTriggeredCompletion(false);
      onMarkUncompleted();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Проверка дали URL е Nextcloud
  const isNextcloudUrl = (url) => {
    // Проверяваме за типични Nextcloud patterns
    return url.includes('/s/') && (
      url.includes('nextcloud') || 
      url.includes('/nc.') || 
      url.includes('cloud') ||
      url.includes('openfile=') ||
      // Проверяваме за share token pattern
      /\/s\/[a-zA-Z0-9]{10,}/.test(url)
    );
  };

  // Функция за определяне на типа медия от URL
  const getMediaType = (url) => {
    if (!url || typeof url !== 'string') {
      console.warn('VideoPlayer: URL is undefined or not a string', url);
      return "direct";
    }
    
    const lowerUrl = url.toLowerCase();
    
    // YouTube
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      return "youtube";
    }
    
    // Vimeo
    if (lowerUrl.includes("vimeo.com")) {
      return "vimeo";
    }
    
    // Nextcloud споделен линк
    if (isNextcloudUrl(url)) {
      return "nextcloud";
    }
    
    // Проверка за аудио файлове
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'];
    if (audioExtensions.some(ext => lowerUrl.includes(ext))) {
      return "audio";
    }
    
    // Проверка за видео файлове
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return "video";
    }
    
    // По подразбиране - опитваме като видео
    return "direct";
  };

  // Функция за конвертиране на Nextcloud URL в директен линк
  const getNextcloudDirectUrl = (url) => {
    // Ако вече е директен линк за сваляне
    if (url.includes('/download')) {
      return url;
    }
    
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Извличаме share token от URL
      const shareMatch = url.match(/\/s\/([a-zA-Z0-9]+)/);
      if (!shareMatch) return url;
      
      const shareToken = shareMatch[1];
      const baseUrl = url.split('/s/')[0];
      
      // Ако има openfile параметър - това е конкретен файл в споделена папка
      const openFile = params.get('openfile');
      if (openFile) {
        // Формат: /s/{token}/download?path={path}&files={fileId}
        // или: /index.php/s/{token}/download?openfile={fileId}
        return `${baseUrl}/s/${shareToken}/download?openfile=${openFile}`;
      }
      
      // Ако има path параметър без openfile
      const path = params.get('path');
      if (path) {
        return `${baseUrl}/s/${shareToken}/download?path=${encodeURIComponent(path)}`;
      }
      
      // Обикновен споделен линк
      return `${baseUrl}/s/${shareToken}/download`;
    } catch (e) {
      console.error('Error parsing Nextcloud URL:', e);
      return url;
    }
  };

  // Функция за конвертиране на YouTube URL в embed URL
  const getYouTubeEmbedUrl = (url) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  };

  // Функция за конвертиране на Vimeo URL в embed URL
  const getVimeoEmbedUrl = (url) => {
    const videoId = url.split("vimeo.com/")[1].split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const mediaType = getMediaType(videoUrl);

  // За YouTube видеа създаваме custom player wrapper
  if (mediaType === "youtube") {
    return (
      <YouTubePlayer
        videoUrl={videoUrl}
        title={title}
        isCompleted={isCompleted}
        onVideoCompleted={onVideoCompleted}
        onVideoProgress={onVideoProgress}
        onMarkUncompleted={onMarkUncompleted}
      />
    );
  }

  if (mediaType === "vimeo") {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {title && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700 relative">
            <h3 className="text-xl font-bold text-white">{title}</h3>

            {/* Completion Status */}
            {isCompleted && (
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  Завършено
                </div>
                {onMarkUncompleted && (
                  <button
                    onClick={handleMarkUncompleted}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title="Премахни завършването"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
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

  // За Nextcloud споделени линкове
  if (mediaType === "nextcloud") {
    const directUrl = getNextcloudDirectUrl(videoUrl);
    return (
      <NextcloudPlayer
        videoUrl={directUrl}
        title={title}
        isCompleted={isCompleted}
        onVideoCompleted={onVideoCompleted}
        onVideoProgress={onVideoProgress}
        onMarkUncompleted={onMarkUncompleted}
      />
    );
  }

  // За аудио файлове
  if (mediaType === "audio") {
    return (
      <AudioPlayer
        audioUrl={videoUrl}
        title={title}
        isCompleted={isCompleted}
        onAudioCompleted={onVideoCompleted}
        onAudioProgress={onVideoProgress}
        onMarkUncompleted={onMarkUncompleted}
      />
    );
  }

  // За директни видео файлове
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700 relative">
          <h3 className="text-xl font-bold text-white">{title}</h3>

          {/* Completion Status */}
          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Завършено
              </div>
              {onMarkUncompleted && (
                <button
                  onClick={handleMarkUncompleted}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Премахни завършването"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
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
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div
              className="w-full bg-gray-600 h-2 rounded-full mb-4 cursor-pointer relative"
              onClick={handleSeek}
            >
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>

              {/* Completion threshold indicator */}
              <div
                className="absolute top-0 h-full w-0.5 bg-green-400"
                style={{ left: "90%" }}
                title="90% - автоматично завършване"
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

                <span className="text-sm">({Math.round(watchProgress)}%)</span>
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

      {/* Completion Notification */}
      {showCompletionNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center z-50">
          <CheckCircle className="mr-2" size={24} />
          <div>
            <div className="font-bold">Видео завършено! 🎉</div>
            <div className="text-sm">Автоматично маркирано при 90%</div>
          </div>
        </div>
      )}
    </div>
  );
};

const YouTubePlayer = ({
  videoUrl,
  title,
  isCompleted,
  onVideoCompleted,
  onVideoProgress,
  onMarkUncompleted,
}) => {
  const containerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] =
    useState(false);
  const progressIntervalRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  
  // Refs за callbacks за да избегнем re-render на плейъра
  const onVideoCompletedRef = useRef(onVideoCompleted);
  const onVideoProgressRef = useRef(onVideoProgress);
  
  useEffect(() => {
    onVideoCompletedRef.current = onVideoCompleted;
  }, [onVideoCompleted]);
  
  useEffect(() => {
    onVideoProgressRef.current = onVideoProgress;
  }, [onVideoProgress]);

  // Извличаме YouTube Video ID
  const getYouTubeVideoId = (url) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return videoId;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  // Синхронизираме ref с state за completion
  useEffect(() => {
    hasTriggeredRef.current = isCompleted;
    setHasTriggeredCompletion(isCompleted);
  }, [isCompleted]);

  // Reset при смяна на видео
  useEffect(() => {
    setWatchProgress(0);
    if (!isCompleted) {
      setHasTriggeredCompletion(false);
      hasTriggeredRef.current = false;
    }
  }, [videoId, isCompleted]);

  useEffect(() => {
    let isMounted = true;

    const stopProgressTracking = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const startProgressTracking = (ytPlayer) => {
      stopProgressTracking();

      progressIntervalRef.current = setInterval(() => {
        if (!isMounted) return;
        
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && typeof ytPlayer.getDuration === 'function') {
          try {
            const currentTime = ytPlayer.getCurrentTime();
            const duration = ytPlayer.getDuration();

            if (duration > 0) {
              const progress = (currentTime / duration) * 100;
              setWatchProgress(progress);

              if (onVideoProgressRef.current) {
                onVideoProgressRef.current(currentTime, duration, progress);
              }

              // Използваме ref за по-надеждна проверка
              if (progress >= 90 && !hasTriggeredRef.current) {
                console.log(
                  `📹 YouTube видео достигна ${Math.round(progress)}% - автоматично маркиране`
                );
                hasTriggeredRef.current = true;
                setHasTriggeredCompletion(true);
                setShowCompletionNotification(true);

                if (onVideoCompletedRef.current) {
                  onVideoCompletedRef.current();
                }

                setTimeout(() => {
                  if (isMounted) {
                    setShowCompletionNotification(false);
                  }
                }, 3000);
              }
            }
          } catch (e) {
            // Player might be destroyed
            stopProgressTracking();
          }
        }
      }, 1000);
    };

    // Cleanup предишен плейър
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (e) {
        console.log('Player already destroyed');
      }
      playerInstanceRef.current = null;
    }

    // Изчистваме контейнера и създаваме нов div за плейъра
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const playerDiv = document.createElement('div');
      playerDiv.id = `youtube-player-${videoId}`;
      playerDiv.style.position = 'absolute';
      playerDiv.style.top = '0';
      playerDiv.style.left = '0';
      playerDiv.style.width = '100%';
      playerDiv.style.height = '100%';
      containerRef.current.appendChild(playerDiv);
    }

    const initPlayer = () => {
      if (!isMounted || !containerRef.current) return;

      if (window.YT && window.YT.Player) {
        const playerElement = containerRef.current.querySelector('div');
        if (!playerElement) return;

        try {
          const ytPlayer = new window.YT.Player(playerElement, {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                if (isMounted) {
                  playerInstanceRef.current = event.target;
                  console.log("✅ YouTube Player ready for video:", videoId);
                }
              },
              onStateChange: (event) => {
                if (!isMounted) return;
                // 1 = playing
                if (event.data === 1) {
                  startProgressTracking(event.target);
                } else {
                  stopProgressTracking();
                }
              },
            },
          });
        } catch (e) {
          console.error('Error creating YouTube player:', e);
        }
      } else {
        setTimeout(initPlayer, 100);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      stopProgressTracking();
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          // Ignore
        }
        playerInstanceRef.current = null;
      }
    };
  }, [videoId]); // Само videoId като dependency - callbacks се използват чрез refs

  const handleMarkUncompleted = () => {
    if (onMarkUncompleted) {
      hasTriggeredRef.current = false;
      setHasTriggeredCompletion(false);
      onMarkUncompleted();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700 relative">
          <h3 className="text-xl font-bold text-white">{title}</h3>

          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Завършено
              </div>
              {onMarkUncompleted && (
                <button
                  onClick={handleMarkUncompleted}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Премахни завършването"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div
            ref={containerRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {/* Progress Bar */}
        {watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 hidden">
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${watchProgress}%` }}
              ></div>
            </div>
            <div className="text-white text-xs mt-1 text-center">
              Прогрес: {Math.round(watchProgress)}%
            </div>
          </div>
        )}
      </div>

      {/* Completion Notification */}
      {showCompletionNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center z-50">
          <CheckCircle className="mr-2" size={24} />
          <div>
            <div className="font-bold">Видео завършено! 🎉</div>
            <div className="text-sm">Автоматично маркирано при 90%</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент за Nextcloud/директни видео файлове
const NextcloudPlayer = ({
  videoUrl,
  title,
  isCompleted,
  onVideoCompleted,
  onVideoProgress,
  onMarkUncompleted,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const [error, setError] = useState(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    hasTriggeredRef.current = isCompleted;
    setHasTriggeredCompletion(isCompleted);
  }, [isCompleted]);

  // Reset при смяна на URL
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setWatchProgress(0);
    setError(null);
    if (!isCompleted) {
      setHasTriggeredCompletion(false);
      hasTriggeredRef.current = false;
    }
  }, [videoUrl, isCompleted]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0) {
      const current = video.currentTime;
      const total = video.duration;
      const progress = (current / total) * 100;

      setCurrentTime(current);
      setWatchProgress(progress);

      if (onVideoProgress) {
        onVideoProgress(current, total, progress);
      }

      if (progress >= 90 && !hasTriggeredRef.current) {
        console.log(`📹 Nextcloud видео достигна ${Math.round(progress)}% - автоматично маркиране`);
        hasTriggeredRef.current = true;
        setHasTriggeredCompletion(true);
        setShowCompletionNotification(true);

        if (onVideoCompleted) {
          onVideoCompleted();
        }

        setTimeout(() => {
          setShowCompletionNotification(false);
        }, 3000);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setError(null);
    }
  };

  const handleError = (e) => {
    console.error('Video error:', e);
    setError('Грешка при зареждане на видеото. Проверете дали линкът е валиден.');
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMarkUncompleted = () => {
    if (onMarkUncompleted) {
      hasTriggeredRef.current = false;
      setHasTriggeredCompletion(false);
      onMarkUncompleted();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-700 relative">
          <h3 className="text-xl font-bold text-white">{title}</h3>

          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Завършено
              </div>
              {onMarkUncompleted && (
                <button
                  onClick={handleMarkUncompleted}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Премахни завършването"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative bg-black">
        {error ? (
          <div className="flex items-center justify-center h-64 text-white text-center p-4">
            <div>
              <X size={48} className="mx-auto mb-4 text-red-400" />
              <p>{error}</p>
              <p className="text-sm text-gray-400 mt-2 break-all">URL: {videoUrl}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full"
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleError}
          />
        )}

        {/* Progress overlay */}
        {watchProgress > 0 && !error && (
          <div className="absolute bottom-16 left-4 right-4">
            <div className="bg-black/50 rounded-full px-3 py-1 inline-block">
              <span className="text-white text-xs">
                Прогрес: {Math.round(watchProgress)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Completion Notification */}
      {showCompletionNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center z-50">
          <CheckCircle className="mr-2" size={24} />
          <div>
            <div className="font-bold">Видео завършено! 🎉</div>
            <div className="text-sm">Автоматично маркирано при 90%</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент за аудио файлове
const AudioPlayer = ({
  audioUrl,
  title,
  isCompleted,
  onAudioCompleted,
  onAudioProgress,
  onMarkUncompleted,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);
  const [error, setError] = useState(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    hasTriggeredRef.current = isCompleted;
    setHasTriggeredCompletion(isCompleted);
  }, [isCompleted]);

  // Reset при смяна на URL
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setWatchProgress(0);
    setError(null);
    if (!isCompleted) {
      setHasTriggeredCompletion(false);
      hasTriggeredRef.current = false;
    }
  }, [audioUrl, isCompleted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration > 0) {
      const current = audio.currentTime;
      const total = audio.duration;
      const progress = (current / total) * 100;

      setCurrentTime(current);
      setWatchProgress(progress);

      if (onAudioProgress) {
        onAudioProgress(current, total, progress);
      }

      if (progress >= 90 && !hasTriggeredRef.current) {
        console.log(`🎵 Аудио достигна ${Math.round(progress)}% - автоматично маркиране`);
        hasTriggeredRef.current = true;
        setHasTriggeredCompletion(true);
        setShowCompletionNotification(true);

        if (onAudioCompleted) {
          onAudioCompleted();
        }

        setTimeout(() => {
          setShowCompletionNotification(false);
        }, 3000);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setError(null);
    }
  };

  const handleError = () => {
    setError('Грешка при зареждане на аудиото. Проверете дали линкът е валиден.');
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMarkUncompleted = () => {
    if (onMarkUncompleted) {
      hasTriggeredRef.current = false;
      setHasTriggeredCompletion(false);
      onMarkUncompleted();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-teal-700 relative">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <Volume2 size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-white/70 text-sm">Аудио запис</p>
            </div>
          </div>

          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Завършено
              </div>
              {onMarkUncompleted && (
                <button
                  onClick={handleMarkUncompleted}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Премахни завършването"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        {error ? (
          <div className="text-center text-red-500 py-8">
            <X size={48} className="mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Audio element (hidden, using custom controls) */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleError}
            />

            {/* Waveform visualization placeholder */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-end space-x-1 h-16">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{
                      height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                      opacity: watchProgress > (i / 30) * 100 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="w-full bg-gray-200 rounded-full h-2 cursor-pointer mb-4"
              onClick={handleSeek}
            >
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${watchProgress}%` }}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.currentTime = Math.max(0, audio.currentTime - 10);
                  }
                }}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                title="Назад 10 сек"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-lg"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <button
                onClick={() => {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                  }
                }}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                title="Напред 10 сек"
              >
                <RotateCcw size={20} className="transform scale-x-[-1]" />
              </button>
            </div>

            {/* Progress percentage */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Прогрес: {Math.round(watchProgress)}%
            </div>
          </>
        )}
      </div>

      {/* Completion Notification */}
      {showCompletionNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center z-50">
          <CheckCircle className="mr-2" size={24} />
          <div>
            <div className="font-bold">Аудио завършено! 🎉</div>
            <div className="text-sm">Автоматично маркирано при 90%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;