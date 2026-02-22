import React from 'react';
import { PropertyEntity, EntityType, Platform } from '../types';
import { WhatsAppIcon, TelegramIcon } from './Icons';

interface Props {
  entities: PropertyEntity[];
  onClick?: (entity: PropertyEntity) => void;
}

const PropertyTable: React.FC<Props> = ({ entities, onClick }) => {
  const handleJumpToChat = (e: React.MouseEvent, entity: PropertyEntity) => {
    e.stopPropagation();
    const isTelegram = entity.platform === Platform.TELEGRAM;
    if (isTelegram) {
      const username = entity.username || entity.contact.replace('@', '');
      const url = username.includes('t.me') ? username : `https://t.me/${username}`;
      window.open(url, '_blank');
    } else {
      const phone = entity.contact.replace(/\D/g, '');
      const text = encodeURIComponent(`Hi, I'm interested in your property: ${entity.community} (${entity.propertyType}). Is it still available?`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Community</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Property</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Group</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entities.map((entity) => {
              const isUnit = entity.type === EntityType.UNIT;
              const isTelegram = entity.platform === Platform.TELEGRAM;
              
              return (
                <tr 
                  key={entity.id} 
                  onClick={() => onClick?.(entity)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      isUnit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                    }`}>
                      {isUnit ? 'Unit' : 'Lead'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {entity.community}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {entity.propertyType} • {entity.size}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {entity.price === 0 ? 'TBA' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(entity.price)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase truncate max-w-[120px] block">
                      {entity.groupName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isTelegram ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                    }`}>
                      {isTelegram ? <TelegramIcon className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => handleJumpToChat(e, entity)}
                      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 ${
                        isTelegram 
                          ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100 dark:shadow-none' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 dark:shadow-none'
                      }`}
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {entities.length === 0 && (
        <div className="p-20 text-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No entries found</p>
        </div>
      )}
    </div>
  );
};

export default PropertyTable;
