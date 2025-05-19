import React from "react";
import {Home, Pause, Play, Settings, SkipBack, SkipForward, Volume2, VolumeX, X} from "lucide-react";
import {Link, useParams} from "react-router-dom";
import {mockVideos} from "../constants/constants.ts";

export const VideoPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isControlsVisible, setIsControlsVisible] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [videoEnded, setVideoEnded] = React.useState(false);

  const controlsTimeout = React.useRef(null);

  const videoRef = React.useRef(null);
  const progressBarRef = React.useRef(null);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const params = useParams();
  const video = mockVideos.find((video) => video.id === params.videoId);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;

      if (videoEnded && pos < 0.99) {
        setVideoEnded(false);
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(videoRef.current.currentTime);

      if (videoEnded && !isVideoEnded(videoRef.current.currentTime, videoRef.current.duration)) {
        setVideoEnded(false);
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        skipBackward();
        break;
      case 'ArrowRight':
        skipForward();
        break;
      case 'ArrowUp':
        // Увеличиваем громкость
        if (videoRef.current) {
          const newVolume = Math.min(1, volume + 0.1);
          setVolume(newVolume);
          videoRef.current.volume = newVolume;
          setIsMuted(false);
          showKeyInfo(`Громкость: ${Math.round(newVolume * 100)}%`);
        }
        break;
      case 'ArrowDown':
        // Уменьшаем громкость
        if (videoRef.current) {
          const newVolume = Math.max(0, volume - 0.1);
          setVolume(newVolume);
          videoRef.current.volume = newVolume;
          setIsMuted(newVolume === 0);
          showKeyInfo(`Громкость: ${Math.round(newVolume * 100)}%`);
        }
        break;
      case ' ':
        // Пробел для паузы/воспроизведения
        togglePlay();
        showKeyInfo(isPlaying ? "Пауза" : "Воспроизведение");
        e.preventDefault();
        break;
      case 'Escape':
        // Escape для возврата на главную
        showKeyInfo("Возврат на главную");
        setTimeout(() => navigate(), 500);
        break;
      default:
        break;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [keyInfo, setKeyInfo] = React.useState(null);
  const keyInfoTimeoutRef = React.useRef(null);

  const showKeyInfo = (action: string) => {
    setKeyInfo(action);

    // Очищаем предыдущий таймаут
    if (keyInfoTimeoutRef.current) {
      clearTimeout(keyInfoTimeoutRef.current);
    }

    // Устанавливаем новый таймаут для скрытия информации
    keyInfoTimeoutRef.current = setTimeout(() => {
      setKeyInfo(null);
    }, 1500);
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      showKeyInfo("Перемотка на 10 сек. назад");

      if (videoEnded) {
        setVideoEnded(false);
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      );
      showKeyInfo("Перемотка на 10 сек. вперед");
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, 3000);
  }

  React.useEffect(() => {
    // Добавляем обработчик нажатия клавиш
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Удаляем обработчик нажатия клавиш
      window.removeEventListener('keydown', handleKeyDown);

      // Очищаем таймауты
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }

      if (keyInfoTimeoutRef.current) {
        clearTimeout(keyInfoTimeoutRef.current);
      }
    };
  }, [volume, isPlaying]);

  React.useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    }
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const isVideoEnded = (current: number, total: number): boolean => {
    const THRESHOLD = 0.1;
    return current >= total - THRESHOLD && total > 0;
  };

  React.useEffect(() => {
    if (isVideoEnded(currentTime, duration)) {
      setIsPlaying(false);
      setVideoEnded(true);
    } else if (videoEnded && currentTime < duration - 1) {
      setVideoEnded(false);
    }
  }, [currentTime, duration, videoEnded]);

  React.useEffect(() => {
    setVideoEnded(false);
    setProgress(0);
    setCurrentTime(0);
  }, [video?.link]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden transition-all duration-700 ${
        videoEnded ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-black'
      }`}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={video?.link}
        className={`w-full h-full object-contain transition-opacity duration-700 ${
          videoEnded ? 'opacity-40' : 'opacity-100'
        }`}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 transition-opacity duration-300 
        ${isControlsVisible ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="flex items-center justify-between">
          <Link to='/'>
            <button className="bg-black/50 hover:bg-black/70 hover:text-red-500 text-white cursor-pointer p-2 rounded-full transition-all">
              <Home size={24} />
            </button>
          </Link>

          <h1 className="text-white text-xl font-medium text-center max-w-2xl truncate mx-4">
            {video?.title}
          </h1>

          <div className="w-10 h-10"></div> {/* Пустой блок для баланса */}
        </div>
      </div>

      {isControlsVisible && !isPlaying && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          {videoEnded ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-white text-xl font-medium mb-10">Видео завершено</div>
              <div className="flex space-x-4">
                <Link to='/'>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white cursor-pointer py-2 px-6 rounded-full flex items-center space-x-2 transition-all"
                  >
                    <Home size={18} />
                    <span>На главную</span>
                  </button>
                </Link>
                <button
                  className="bg-white/10 hover:bg-white/30 backdrop-blur-sm text-white cursor-pointer py-2 px-6 rounded-full flex items-center space-x-2 transition-all"
                  onClick={togglePlay}
                >
                  <Play size={18} />
                  <span>Смотреть снова</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              className="bg-red-200/10 hover:bg-red-300/30 backdrop-blur-sm cursor-pointer rounded-full p-6 text-white transition-all"
              onClick={togglePlay}
            >
              <Play size={48} fill="white" />
            </button>
          )}
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-6 transition-opacity duration-300 
        ${isControlsVisible ? 'opacity-100' : 'opacity-0'}
     `}
      >
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className='w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer relative'
        >
          <div
            className='absolute top-0 left-0 h-full bg-red-600 rounded-full'
            style={{ width: `${progress}%` }}
          />
          <div
            className='absolute top-0 h-3 w-3 bg-red-600 rounded-full -mt-1 transform -translate-x-1/2'
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              className='text-white cursor-pointer hover:text-red-500 transition-colors'
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <div className='flex items-center space-x-2'>
              <button
                className='text-white cursor-pointer hover:text-red-500 transition-colors'
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <input
                type='range'
                min='0'
                max='1'
                step='0.05'
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className='w-20 accent-red-600 cursor-pointer'
              />
            </div>

            <div className='text-white text-sm'>
              <span>{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className='relative'>
            <button
              className='text-white hover:text-red-500 cursor-pointer transition-colors'
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </button>

            {showSettings && (
              <div className='absolute bottom-10 right-0 bg-black/90 backdrop-blur-sm rounded-md overflow-hidden w-48 shadow-lg'>
                <div className='flex justify-between items-center px-4 py-2 border-b border-gray-700'>
                  <span className='text-white text-sm font-medium'>Скорость</span>
                  <button
                    className='text-gray-400 hover:text-white'
                    onClick={() => setShowSettings(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className='py-1'>
                  {speedOptions.map(speed => (
                    <button
                      key={speed}
                      className={`w-full cursor-pointer text-left px-4 py-2 text-sm ${playbackSpeed === speed ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => changePlaybackSpeed(speed)}
                    >
                      {speed === 1 ? 'Нормальная' : `${speed}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}