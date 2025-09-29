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

  // Функция за определяне на типа видео от URL
  const getVideoType = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    } else if (url.includes("vimeo.com")) {
      return "vimeo";
    } else {
      return "direct";
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

  const videoType = getVideoType(videoUrl);

  // За YouTube видеа създаваме custom player wrapper
  if (videoType === "youtube") {
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

  if (videoType === "vimeo") {
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
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const [showCompletionNotification, setShowCompletionNotification] =
    useState(false);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    setHasTriggeredCompletion(isCompleted);
  }, [isCompleted]);

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

  useEffect(() => {
    // Чакаме YouTube API да се зареди
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target);
              console.log("✅ YouTube Player ready");
            },
            onStateChange: (event) => {
              // 1 = playing
              if (event.data === 1) {
                startProgressTracking(event.target);
              } else {
                stopProgressTracking();
              }
            },
          },
        });
      } else {
        // Ако API не е готов, опитваме отново след 100ms
        setTimeout(initPlayer, 100);
      }
    };

    initPlayer();

    return () => {
      stopProgressTracking();
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const startProgressTracking = (ytPlayer) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
        const currentTime = ytPlayer.getCurrentTime();
        const duration = ytPlayer.getDuration();

        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          setWatchProgress(progress);

          // Извикваме callback за прогрес
          if (onVideoProgress) {
            onVideoProgress(currentTime, duration, progress);
          }

          // Проверяваме за автоматично маркиране при 90%
          if (progress >= 90 && !hasTriggeredCompletion && !isCompleted) {
            console.log(
              `📹 YouTube видео достигна ${Math.round(
                progress
              )}% - автоматично маркиране`
            );
            setHasTriggeredCompletion(true);
            setShowCompletionNotification(true);

            if (onVideoCompleted) {
              onVideoCompleted();
            }

            setTimeout(() => {
              setShowCompletionNotification(false);
            }, 3000);
          }

          console.log(`📊 YouTube Progress: ${Math.round(progress)}%`);
        }
      }
    }, 1000); // Проверяваме всяка секунда
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleMarkUncompleted = () => {
    if (onMarkUncompleted) {
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
            ref={playerRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {/* Progress Bar */}
        {watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
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

export default VideoPlayer;
