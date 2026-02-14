
import React from 'react';
import { Match, PropertyEntity } from '../types';
import PropertyCard from './PropertyCard';

interface Props {
  match: Match;
  unit: PropertyEntity;
  requirement: PropertyEntity;
}

const MatchCard: React.FC<Props> = ({ match, unit, requirement }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div className="bg-indigo-600 px-6 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-widest opacity-80">Sync Score</span>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-1.5 h-6 rounded-full ${i < match.score ? 'bg-white' : 'bg-white/20'}`}></div>
            ))}
          </div>
        </div>
        <span className="text-2xl font-black">{match.score}/10</span>
      </div>

      <div className="grid md:grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Available Unit
          </div>
          <PropertyCard entity={unit} />
        </div>
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-bold uppercase text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Client Requirement
          </div>
          <PropertyCard entity={requirement} />
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <h5 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
          </svg>
          AI Match Reasoning
        </h5>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
          "{match.reasoning}"
        </p>
      </div>
    </div>
  );
};

export default MatchCard;
