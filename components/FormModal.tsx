
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloseIcon } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const FormModal: React.FC<Props> = ({ isOpen, onClose, url }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 dark:shadow-none">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Request Callback</h3>
                  <p className="text-xs text-slate-500 font-medium">We'll get back to you in 30 seconds.</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
              <iframe 
                src={url}
                className="w-full h-full border-none"
                title="Callback Form"
                allow="camera; microphone; geolocation"
              />
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-center flex-shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Form Processing by CubeCity</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FormModal;
