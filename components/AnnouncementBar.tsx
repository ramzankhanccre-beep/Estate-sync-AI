import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon } from './Icons';

interface Props {
  message: string;
}

const AnnouncementBar: React.FC<Props> = ({ message }) => {
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
          <div className="flex-1 text-center font-bold text-sm tracking-wide">
            {message}
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
