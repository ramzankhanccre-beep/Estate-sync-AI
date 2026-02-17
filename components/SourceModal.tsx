
import React from 'react';
import { PropertyEntity } from '../types';

interface Props {
  entity: PropertyEntity | null;
  onClose: () => void;
}

const SourceModal: React.FC<Props> = ({ entity, onClose }) => {
  if (!entity) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h3 className="text-lg font-bold">Source Message Details</h3>
            <p className="text-xs opacity-80 uppercase tracking-widest font-medium">Extracted from: {entity.groupName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Community</label>
              <p className="text-lg font-bold">{entity.community}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Price</label>
              <p className="text-lg font-bold text-indigo-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED' }).format(entity.price)}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Contact</label>
              <p className="font-medium">{entity.contact}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
              <p className="font-medium">{entity.propertyType} ({entity.size})</p>
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              Original Message Fragment
            </label>
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {entity.rawText}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;
