import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon } from './Icons';

interface Props {
  message: string;
  onClick?: () => void;
}

const AnnouncementBar: React.FC<Props> = ({ message, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-600 text-white py-2 px-4 flex items-center justify-between relative z-[100]"
        >
          <div 
            className={`flex-1 text-center font-bold text-sm tracking-wide flex items-center justify-center gap-2 ${onClick ? 'cursor-pointer hover:underline underline-offset-4' : ''}`}
            onClick={onClick}
          >
            {message}
            {onClick && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
