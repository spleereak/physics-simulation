import {Video} from "./VideoSheet.tsx";
import React from "react";
import {VideoCardSkeleton} from "./VideoCardSkeleton.tsx";
import {useNavigate} from "react-router-dom";

const thumbnailCache = new Map<string, string>();

export const VideoCard = React.memo(({ video } : { video: Video }) => {
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(!thumbnailCache.has(video.link));
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const processingRef = React.useRef<boolean>(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (thumbnailCache.has(video.link)) {
      setThumbnailUrl(thumbnailCache.get(video.link) || '');
      setIsLoading(false);
      return;
    }

    if (processingRef.current) return;

    processingRef.current = true;

    const videoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.playsInline = true;

    const generateThumbnail = () => {
      const handleLoadedData = () => {
        try {
          const videoDuration = videoElement.duration;
          videoElement.currentTime = Math.min(videoDuration * 0.2, 6);
        } catch (error) {
          console.error('Ошибка при установке времени видео:', error);
          finishWithError();
        }
      };

      const handleSeeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const scaleDown = 0.5;
          canvas.width = videoElement.videoWidth * scaleDown;
          canvas.height = videoElement.videoHeight * scaleDown;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

            thumbnailCache.set(video.link, thumbnailUrl);
            setThumbnailUrl(thumbnailUrl);
            cleanup();
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Ошибка при создании превью:', error);
          finishWithError();
        }
      };

      const cleanup = () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('error', handleError);
        videoElement.src = '';
        processingRef.current = false;
      };

      const handleError = () => {
        console.error('Ошибка при загрузке видео для превью:', video.link);
        finishWithError();
      };

      const finishWithError = () => {
        cleanup();
        setIsLoading(false);
      };

      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('seeked', handleSeeked);
      videoElement.addEventListener('error', handleError);

      videoElement.src = video.link;
      videoElement.load();

      const timeout = setTimeout(() => {
        if (processingRef.current) {
          console.warn('Превью не загрузилось за отведенное время:', video.link);
          finishWithError();
        }
      }, 7000);

      return () => {
        clearTimeout(timeout);
        if (processingRef.current) {
          cleanup();
        }
      };
    };

    return generateThumbnail();
  }, [video.link]);

  if (isLoading) {
    return <VideoCardSkeleton />;
  }

  return (
    <div
      className='flex mb-4 cursor-pointer group rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-lg bg-white'
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className='relative flex-shring-0'>
        <img
          src={thumbnailUrl}
          alt={video.title}
          className='w-40 h-28 object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
        />
        <div
          className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'/>
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <span
          className='absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md font-medium'>
          {video.duration}
        </span>
      </div>
      <div className='flex-1 p-4 flex items-center'>
        <h3
          className='font-medium text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors duration-200'>
          {video.title}
        </h3>
      </div>
      <video
        ref={videoRef}
        style={{display: 'none'}}
        muted
        playsInline
      />
    </div>
  )
})