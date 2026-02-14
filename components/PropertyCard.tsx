
import React from 'react';
import { PropertyEntity, EntityType } from '../types';
import { WhatsAppIcon } from './Icons';

interface Props {
  entity: PropertyEntity;
}

const PropertyCard: React.FC<Props> = ({ entity }) => {
  const isUnit = entity.type === EntityType.UNIT;

  const handleWhatsApp = () => {
    const phone = entity.contact.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${entity.contact}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
            isUnit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {isUnit ? 'For Sale/Rent' : 'Buyer/Tenant'}
          </span>
          <h4 className="text-lg font-bold leading-tight line-clamp-1">{entity.community}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{entity.propertyType} • {entity.size}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(entity.price)}
          </p>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4 italic text-sm text-slate-600 dark:text-slate-300 border-l-4 border-slate-200 dark:border-slate-700">
        "{entity.rawText.length > 120 ? entity.rawText.substring(0, 120) + '...' : entity.rawText}"
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <WhatsAppIcon />
          WhatsApp
        </button>
        <button 
          onClick={handleCall}
          className="px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
