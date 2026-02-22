
import React from 'react';
import { ExtractionTask, ChatFile, Platform } from '../types';
import { WhatsAppIcon, TelegramIcon } from './Icons';

interface Props {
  tasks: ExtractionTask[];
  files: ChatFile[];
  onRunTask: (taskId: string) => void;
  onRunAll: () => void;
  isProcessing: boolean;
}

const TaskBoard: React.FC<Props> = ({ tasks, files, onRunTask, onRunAll, isProcessing }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500';
      case 'processing': return 'bg-indigo-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  const completedCount = tasks.filter(t => t.status === 'success').length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dashboard Progress Panel */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-black mb-2">Sync Pipeline</h2>
            <p className="text-slate-500 text-sm font-medium">
              Mapping <span className="text-indigo-600 font-bold">{tasks.length}</span> batches. The AI is extracting structured property data from your chats.
            </p>
          </div>
          
          <div className="flex-1 lg:max-w-xl space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Completion</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(progressPercent)}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine Status</p>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isProcessing ? 'bg-indigo-100 text-indigo-700 animate-pulse border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {isProcessing ? 'Synchronizing...' : 'Idle'}
                </span>
              </div>
            </div>
            
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 p-1">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button 
            onClick={onRunAll}
            disabled={isProcessing || tasks.length === 0}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 whitespace-nowrap"
          >
            {isProcessing ? 'Batch Running...' : 'Launch Global Batch'}
          </button>
        </div>
      </div>

      {/* Batch Ingestion List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map(file => (
          <div key={file.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  file.platform === Platform.TELEGRAM ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                }`}>
                  {file.platform === Platform.TELEGRAM ? <TelegramIcon className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4" />}
                </div>
                <h4 className="font-black truncate text-[10px] text-slate-800 dark:text-slate-100 uppercase tracking-tight">{file.groupName}</h4>
              </div>
              <span className="text-[8px] font-black px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 uppercase tracking-widest">{file.tasksCount} BATCHES</span>
            </div>
            
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
              {tasks.filter(t => t.fileId === file.id).map((task, i) => (
                <div key={task.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(task.status)} ${task.status === 'processing' ? 'animate-pulse' : ''}`}></div>
                      <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">Chunk {i + 1}</p>
                    </div>
                    
                    {task.status !== 'success' ? (
                      <button 
                        onClick={() => onRunTask(task.id)}
                        disabled={task.status === 'processing'}
                        className="p-1.5 bg-white dark:bg-slate-700 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 border border-slate-100 dark:border-slate-600 shadow-sm"
                        title="Resume Batch"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      </button>
                    ) : (
                      <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  
                  {/* INDIVIDUAL TASK PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400">
                      <span className={task.status === 'error' ? 'text-red-500' : ''}>{task.status}</span>
                      <span className="text-slate-500">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          task.status === 'error' ? 'bg-red-500' : 
                          task.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {task.error && <p className="text-[8px] text-red-500 mt-2 font-bold bg-red-50 dark:bg-red-900/10 p-1 rounded leading-tight">{task.error}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
