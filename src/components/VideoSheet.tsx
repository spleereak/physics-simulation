import React from "react";
import {VideoCard} from "./VideoCard.tsx";
import {mockVideos} from "../constants/constants.ts";

export interface Video {
  id: string;
  title: string;
  link: string;
  duration: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const VideoSheet: React.FC<Props> = ({ isOpen, onClose, title = 'Список видео' }) => {
  const videos = mockVideos;
  const sheetRef = React.useRef(null);

  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);

      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-blur-200 bg-opacity-60 z-50 flex justify-end transition-opacity backdrop-blur-sm 
        ${isVisible ? 'bg-opacity-30' : 'bg-opacity-0 pointer-events-mome'}
      `}
    >
      <div
        ref={sheetRef}
        className={`bg-gray-50 w-full max-w-md h-full shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col 
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className='p-5 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm'>
          <h2 className='font-semibold text-xl text-gray-800'>{title}</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700'
            aria-label='Закрыть'
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}