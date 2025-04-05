import React from 'react';
import { CloseIcon } from "./CloseIcon.tsx";

interface Props {
  title: string;
  color: string;
  isVisible: boolean;
  onClose: () => void;
  children: any
}

export const Modal: React.FC<Props> = ({ title, color, isVisible, onClose, children }) => {
  if (!isVisible) return;

  return (
    <div className='rounded-xl shadow-xl border border-gray-100 bg-white backdrop-blur-sm bg-opacity-95 overflow-hidden transition-all duration-300 transform'>
      <div className={`flex justify-between items-center px-5 py-3 ${color}`}>
        <h3 className='text-lg font-semibold text-white'>{title}</h3>
        <button
          onClick={onClose}
          className='text-white hover:text-gray-200 transition-colors'
        >
          <CloseIcon />
        </button>
      </div>
      <div className='p-5'>
        {children}
      </div>
    </div>
  )
}