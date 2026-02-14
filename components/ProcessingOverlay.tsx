
import React from 'react';
import { ProcessingStep } from '../types';

interface Props {
  step: ProcessingStep;
  currentChunk: number;
  totalChunks: number;
}

const ProcessingOverlay: React.FC<Props> = ({ step, currentChunk, totalChunks }) => {
  if (step === 'idle' || step === 'completed') return null;

  const steps = [
    { key: 'reading', label: 'Reading chat file...', status: step === 'reading' ? 'active' : step !== 'error' ? 'done' : 'waiting' },
    { 
      key: 'extracting', 
      label: totalChunks > 1 
        ? `AI: Extracting (Chunk ${currentChunk} of ${totalChunks})...` 
        : 'AI: Extracting Units & Requirements...', 
      status: step === 'extracting' ? 'active' : (['matching', 'completed'].includes(step) ? 'done' : 'waiting') 
    },
    { key: 'matching', label: 'AI: Scoring Matches...', status: step === 'matching' ? 'active' : (step === 'completed' ? 'done' : 'waiting') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold">Processing Your Chat</h3>
          <p className="text-sm text-slate-500 mt-1">Our AI is synchronizing your data...</p>
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                s.status === 'done' ? 'bg-green-500 text-white' : 
                s.status === 'active' ? 'bg-indigo-600 text-white' : 
                'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {s.status === 'done' ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${s.status === 'active' ? 'font-medium' : 'text-slate-500'}`}>
                {s.label}
              </span>
              {s.status === 'active' && (
                <div className="flex gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {totalChunks > 1 && step === 'extracting' && (
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(currentChunk / totalChunks) * 100}%` }}
            ></div>
          </div>
        )}

        {step === 'error' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm border border-red-200 dark:border-red-900/40">
            Something went wrong. Please check your API key or chat format.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOverlay;
