
import React from 'react';
import { PropertyEntity, EntityType, Platform } from '../types';
import { WhatsAppIcon, TelegramIcon } from './Icons';

interface Props {
  entity: PropertyEntity;
  onClick?: (entity: PropertyEntity) => void;
}

const PropertyCard: React.FC<Props> = ({ entity, onClick }) => {
  const isUnit = entity.type === EntityType.UNIT;
  const isTelegram = entity.platform === Platform.TELEGRAM;

  const handleJumpToChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTelegram) {
      const username = entity.username || entity.contact.replace('@', '');
      // Telegram deep link with pre-filled message if possible
      // Note: Telegram doesn't support pre-filling in the same way as WhatsApp via URL for bots/users easily without specific bot API,
      // but we can open the chat.
      const url = username.includes('t.me') ? username : `https://t.me/${username}`;
      window.open(url, '_blank');
    } else {
      const phone = entity.contact.replace(/\D/g, '');
      const text = encodeURIComponent(`Hi, I'm interested in your property: ${entity.community} (${entity.propertyType}). Is it still available?`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  };

  return (
    <div 
      onClick={() => onClick?.(entity)}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:border-indigo-400 relative overflow-hidden flex flex-col h-full"
    >
      {/* Header Info */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
            isUnit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
          }`}>
            {isUnit ? 'Unit' : 'Requirement'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 truncate max-w-[100px]">
            {entity.groupName}
          </span>
        </div>
        
        {/* TIME BADGE */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
          <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {entity.timestamp || 'No Date'}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-lg font-black leading-tight group-hover:text-indigo-600 transition-colors mb-1">
          {entity.community}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-3">
          {entity.propertyType} • {entity.size}
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 italic text-xs text-slate-600 dark:text-slate-300 border-l-4 border-slate-200 dark:border-slate-700 line-clamp-3">
          "{entity.rawText}"
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
          {entity.price === 0 ? 'TBA' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(entity.price)}
        </p>
        <button 
          onClick={handleJumpToChat}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 ${
            isTelegram 
              ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100 dark:shadow-none' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 dark:shadow-none'
          }`}
        >
          {isTelegram ? <TelegramIcon className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4" />}
          {isTelegram ? 'Telegram' : 'WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
