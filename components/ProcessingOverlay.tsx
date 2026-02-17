
import React from 'react';
import { ProcessingStep } from '../types';

interface Props {
  step: ProcessingStep;
  currentChunk: number;
  totalChunks: number;
  onDismiss: () => void;
}

const ProcessingOverlay: React.FC<Props> = ({ step, currentChunk, totalChunks, onDismiss }) => {
  // Never show a centered overlay. This component is now exclusively a bottom-right status toast.
  if (step === 'idle' || step === 'completed') return null;

  const isError = step === 'error';
  
  return (
    <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[100] w-[calc(100vw-2rem)] sm:w-80 bg-slate-900 text-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 border border-slate-700/50 animate-in slide-in-from-bottom-10">
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isError ? 'bg-red-500' : 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]'
        }`}>
          {isError ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black truncate tracking-tight">
            {isError ? 'Sync Interrupted' : 'AI Sync Active'}
          </h4>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
            {step === 'extracting' ? 'Extracting Batches' : 'Processing...'}
          </p>
        </div>
      </div>

      {!isError && step === 'extracting' && totalChunks > 0 && (
        <div className="space-y-2.5 mb-6">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            <span>Overall Progress</span>
            <span className="text-indigo-400">{Math.round((currentChunk / totalChunks) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              style={{ width: `${(currentChunk / totalChunks) * 100}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-400 text-center font-bold italic">
            Working on {currentChunk} of {totalChunks} chunks
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button 
          onClick={onDismiss}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase rounded-xl transition-all border border-slate-700 active:scale-95"
        >
          No Thanks
        </button>
        <button 
          onClick={onDismiss}
          className={`flex-1 py-3 text-white text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 shadow-lg ${
            isError ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
          }`}
        >
          {isError ? 'Dismiss' : 'Exit Sync'}
        </button>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
