
import React, { useState, useEffect, useMemo } from 'react';
import { 
  DashboardIcon, 
  MatchesIcon, 
  UnitsIcon, 
  RequirementsIcon, 
  ChatIcon, 
  MoonIcon, 
  SunIcon, 
  SearchIcon,
  UploadIcon
} from './components/Icons';
import { AppState, EntityType, PropertyEntity, Match, User } from './types';
import { extractEntities, matchEntities } from './services/geminiService';
import ProcessingOverlay from './components/ProcessingOverlay';
import PropertyCard from './components/PropertyCard';
import MatchCard from './components/MatchCard';
import AuthScreen from './components/AuthScreen';
import { authService } from './services/authService';

const CHUNK_SIZE = 15000; // Optimal chunk size for context and speed

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: authService.getCurrentUser(),
    units: [],
    requirements: [],
    matches: [],
    rawChat: '',
    processingStep: 'idle',
    currentChunk: 0,
    totalChunks: 0,
    theme: 'light',
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'matches' | 'units' | 'requirements' | 'raw'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state to localStorage based on user
  useEffect(() => {
    if (state.user) {
      const saved = localStorage.getItem(`estate_sync_data_${state.user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({ 
          ...prev, 
          units: parsed.units || [], 
          requirements: parsed.requirements || [],
          matches: parsed.matches || [],
          rawChat: parsed.rawChat || ''
        }));
      }
    }
  }, [state.user?.id]);

  useEffect(() => {
    if (state.user && (state.units.length > 0 || state.requirements.length > 0)) {
      localStorage.setItem(`estate_sync_data_${state.user.id}`, JSON.stringify({
        units: state.units,
        requirements: state.requirements,
        matches: state.matches,
        rawChat: state.rawChat
      }));
    }
  }, [state.units, state.requirements, state.matches, state.rawChat, state.user?.id]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleAuthSuccess = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleLogout = () => {
    authService.logout();
    setState(prev => ({ ...prev, user: null, units: [], requirements: [], matches: [], rawChat: '' }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setState(prev => ({ ...prev, processingStep: 'reading' }));
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        
        // Split text into chunks
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += CHUNK_SIZE) {
          chunks.push(text.substring(i, i + CHUNK_SIZE));
        }

        setState(prev => ({ 
          ...prev, 
          rawChat: text, 
          processingStep: 'extracting', 
          currentChunk: 1, 
          totalChunks: chunks.length 
        }));
        
        try {
          let allUnits: PropertyEntity[] = [];
          let allRequirements: PropertyEntity[] = [];

          // Process each chunk sequentially
          for (let i = 0; i < chunks.length; i++) {
            setState(prev => ({ ...prev, currentChunk: i + 1 }));
            const extraction = await extractEntities(chunks[i]);
            allUnits = [...allUnits, ...extraction.units];
            allRequirements = [...allRequirements, ...extraction.requirements];
          }

          // Deduction logic: Remove potential duplicates if raw text is identical (basic deduplication)
          const uniqueUnits = allUnits.filter((v, i, a) => a.findIndex(t => t.rawText === v.rawText) === i);
          const uniqueReqs = allRequirements.filter((v, i, a) => a.findIndex(t => t.rawText === v.rawText) === i);

          setState(prev => ({ 
            ...prev, 
            units: uniqueUnits, 
            requirements: uniqueReqs,
            processingStep: 'matching'
          }));

          // Final Matching phase on full aggregated set
          const matches = await matchEntities(uniqueUnits, uniqueReqs);
          setState(prev => ({ ...prev, matches, processingStep: 'completed' }));
        } catch (err: any) {
          console.error(err);
          setState(prev => ({ ...prev, processingStep: 'error', error: err.message }));
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, processingStep: 'error', error: err.message }));
    }
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return state.units.filter(u => 
      u.community.toLowerCase().includes(q) || 
      u.propertyType.toLowerCase().includes(q)
    );
  }, [state.units, searchQuery]);

  const filteredRequirements = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return state.requirements.filter(r => 
      r.community.toLowerCase().includes(q) || 
      r.propertyType.toLowerCase().includes(q)
    );
  }, [state.requirements, searchQuery]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'matches', label: 'Success Pool', icon: <MatchesIcon /> },
    { id: 'units', label: 'Available Units', icon: <UnitsIcon /> },
    { id: 'requirements', label: 'Client Needs', icon: <RequirementsIcon /> },
    { id: 'raw', label: 'Raw Chat', icon: <ChatIcon /> },
  ];

  if (!state.user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex min-h-screen">
      <ProcessingOverlay 
        step={state.processingStep} 
        currentChunk={state.currentChunk} 
        totalChunks={state.totalChunks} 
      />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
            <h1 className="text-xl font-bold tracking-tight">EstateSync AI</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
            <p className="text-sm font-bold truncate">{state.user.name}</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {state.theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span className="font-medium">Theme Mode</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by community, type, or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              <UploadIcon className="w-4 h-4" />
              Upload WhatsApp Chat
              <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 pb-20">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: 'Available Units', count: state.units.length, color: 'emerald' },
                  { label: 'Client Requirements', count: state.requirements.length, color: 'blue' },
                  { label: 'High Potential Matches', count: state.matches.filter(m => m.score >= 7).length, color: 'indigo' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                    <p className={`text-4xl font-black mt-2 text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.count}</p>
                  </div>
                ))}
              </div>

              {state.units.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ChatIcon className="w-12 h-12 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold">No Data Processed</h2>
                  <p className="text-slate-500 mt-2 max-w-sm">Upload a .txt export from WhatsApp to start extracting units and matching them with clients.</p>
                </div>
              )}

              {state.matches.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Top Recommendations
                  </h3>
                  <div className="space-y-6">
                    {state.matches.slice(0, 3).map((match, i) => {
                      const unit = state.units.find(u => u.id === match.unitId);
                      const req = state.requirements.find(r => r.id === match.requirementId);
                      if (!unit || !req) return null;
                      return <MatchCard key={i} match={match} unit={unit} requirement={req} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Success Pool</h2>
              {state.matches.length === 0 ? (
                <p className="text-slate-500">No matches found yet. Try uploading a chat file.</p>
              ) : (
                state.matches
                  .sort((a, b) => b.score - a.score)
                  .map((match, i) => {
                    const unit = state.units.find(u => u.id === match.unitId);
                    const req = state.requirements.find(r => r.id === match.requirementId);
                    if (!unit || !req) return null;
                    return <MatchCard key={i} match={match} unit={unit} requirement={req} />;
                  })
              )}
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Available Inventory</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnits.map(unit => (
                  <PropertyCard key={unit.id} entity={unit} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Client Requirements</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequirements.map(req => (
                  <PropertyCard key={req.id} entity={req} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Original Chat Data</h2>
              <pre className="p-6 bg-slate-900 text-slate-300 rounded-2xl overflow-auto max-h-[70vh] text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {state.rawChat || "No chat uploaded yet."}
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
            <span className="text-[10px] font-bold uppercase">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
