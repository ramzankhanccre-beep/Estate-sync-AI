
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { AppState, EntityType, PropertyEntity, Match, User, ChatFile, ExtractionTask } from './types';
import { extractEntitiesFromChunk, matchEntities } from './services/geminiService';
import PropertyCard from './components/PropertyCard';
import MatchCard from './components/MatchCard';
import AuthScreen from './components/AuthScreen';
import TaskBoard from './components/TaskBoard';
import SourceModal from './components/SourceModal';
import ProcessingOverlay from './components/ProcessingOverlay';
import { authService } from './services/authService';

const CHUNK_SIZE = 2500;
const CONCURRENCY_LIMIT = 8; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: authService.getCurrentUser(),
    files: [],
    tasks: [],
    units: [],
    requirements: [],
    matches: [],
    processingStep: 'idle',
    theme: 'light',
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'matches' | 'units' | 'requirements'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<PropertyEntity | null>(null);
  const [currentChunkInfo, setCurrentChunkInfo] = useState({ current: 0, total: 0 });
  const isBatchRunning = useRef(false);
  const tasksRef = useRef<ExtractionTask[]>([]);

  // Keep ref updated for thread-safe access in background loops
  useEffect(() => {
    tasksRef.current = state.tasks;
  }, [state.tasks]);

  // Persistent State Loading
  useEffect(() => {
    if (state.user) {
      const saved = localStorage.getItem(`estate_sync_v2_${state.user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({ 
          ...prev, 
          units: parsed.units || [], 
          requirements: parsed.requirements || [],
          matches: parsed.matches || [],
          files: parsed.files || [],
          tasks: (parsed.tasks || []).map((t: any) => ({ 
            ...t, 
            status: t.status === 'processing' ? 'pending' : t.status,
            progress: t.status === 'success' ? 100 : 0
          }))
        }));
      }
    }
  }, [state.user?.id]);

  // Persistent State Saving
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(`estate_sync_v2_${state.user.id}`, JSON.stringify({
        units: state.units,
        requirements: state.requirements,
        matches: state.matches,
        files: state.files,
        tasks: state.tasks
      }));
    }
  }, [state.units, state.requirements, state.matches, state.files, state.tasks, state.user?.id]);

  useEffect(() => {
    state.theme === 'dark' ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [state.theme]);

  const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  const handleAuthSuccess = (user: User) => setState(prev => ({ ...prev, user }));
  const handleLogout = () => {
    authService.logout();
    setState(prev => ({ ...prev, user: null, units: [], requirements: [], matches: [], files: [], tasks: [] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setState(prev => ({ ...prev, processingStep: 'uploading' }));
    
    const newFiles: ChatFile[] = [];
    const newTasks: ExtractionTask[] = [];

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const text = await file.text();
        let groupName = file.name.replace('.txt', '').replace('WhatsApp Chat with ', '');
        const fileId = `file-${Date.now()}-${i}`;
        const fileChunks: string[] = [];
        for (let j = 0; j < text.length; j += CHUNK_SIZE) {
          fileChunks.push(text.substring(j, j + CHUNK_SIZE));
        }

        newFiles.push({
          id: fileId,
          name: file.name,
          groupName: groupName,
          rawContent: text,
          tasksCount: fileChunks.length
        });

        fileChunks.forEach((chunk, index) => {
          newTasks.push({
            id: `task-${fileId}-${index}`,
            fileId: fileId,
            chunkIndex: index,
            status: 'pending',
            progress: 0,
            content: chunk,
            groupName: groupName
          });
        });
      }

      setState(prev => ({ 
        ...prev, 
        files: [...prev.files, ...newFiles],
        tasks: [...prev.tasks, ...newTasks],
        processingStep: 'idle'
      }));
      setActiveTab('tasks');
    } catch (err) {
      setState(prev => ({ ...prev, processingStep: 'error' }));
    }
  };

  const performMatching = async () => {
    if (state.units.length === 0 || state.requirements.length === 0) return;
    
    setState(prev => ({ ...prev, processingStep: 'matching' }));
    try {
      const matches = await matchEntities(state.units, state.requirements);
      setState(prev => {
        const existing = new Set(prev.matches.map(m => `${m.unitId}-${m.requirementId}`));
        const filteredNew = matches.filter(m => !existing.has(`${m.unitId}-${m.requirementId}`));
        return { ...prev, matches: [...prev.matches, ...filteredNew], processingStep: 'idle' };
      });
    } catch (err) {
      console.error("Matching failed", err);
      setState(prev => ({ ...prev, processingStep: 'idle' }));
    }
  };

  const processTask = async (taskId: string) => {
    // Stage 1: Initializing (30%)
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'processing', progress: 30 } : t)
    }));

    try {
      const taskObj = tasksRef.current.find(t => t.id === taskId);
      if (!taskObj) return;

      const extracted = await extractEntitiesFromChunk(taskObj.content, taskObj.groupName);
      
      // Stage 2: AI Parsing Complete (80%)
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, progress: 80 } : t)
      }));

      // Stage 3: Atomic Data Write (100%)
      setState(prev => {
        const newUnits = extracted.filter(e => e.type === EntityType.UNIT);
        const newReqs = extracted.filter(e => e.type === EntityType.REQUIREMENT);
        return {
          ...prev,
          units: [...prev.units, ...newUnits],
          requirements: [...prev.requirements, ...newReqs],
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'success', progress: 100 } : t)
        };
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'error', error: err.message, progress: 0 } : t)
      }));
    }
  };

  const runAllTasks = async () => {
    if (isBatchRunning.current) return;
    isBatchRunning.current = true;

    const pendingTasks = state.tasks.filter(t => t.status === 'pending' || t.status === 'error');
    if (pendingTasks.length === 0) {
      isBatchRunning.current = false;
      return;
    }

    setState(prev => ({ ...prev, processingStep: 'extracting' }));
    const total = pendingTasks.length;
    setCurrentChunkInfo({ current: 0, total });

    for (let i = 0; i < total; i += CONCURRENCY_LIMIT) {
      // Check if user cancelled
      const batch = pendingTasks.slice(i, i + CONCURRENCY_LIMIT);
      
      await Promise.all(batch.map(async (task) => {
        await processTask(task.id);
        setCurrentChunkInfo(prev => ({ ...prev, current: Math.min(prev.current + 1, total) }));
      }));

      // Intermittent Matching to populate dashboard live
      if ((i + CONCURRENCY_LIMIT) % 15 === 0) {
        await performMatching();
      }
    }
    
    await performMatching();
    isBatchRunning.current = false;
    setState(prev => ({ ...prev, processingStep: 'idle' }));
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return state.units.filter(u => 
      u.community.toLowerCase().includes(q) || 
      u.propertyType.toLowerCase().includes(q) ||
      u.groupName.toLowerCase().includes(q)
    );
  }, [state.units, searchQuery]);

  const filteredRequirements = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return state.requirements.filter(r => 
      r.community.toLowerCase().includes(q) || 
      r.propertyType.toLowerCase().includes(q) ||
      r.groupName.toLowerCase().includes(q)
    );
  }, [state.requirements, searchQuery]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tasks', label: 'Pipeline', icon: <ChatIcon /> },
    { id: 'matches', label: 'Success Pool', icon: <MatchesIcon /> },
    { id: 'units', label: 'Units', icon: <UnitsIcon /> },
    { id: 'requirements', label: 'Leads', icon: <RequirementsIcon /> },
  ];

  if (!state.user) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden font-sans">
      {/* Non-blocking Status Bar */}
      <ProcessingOverlay 
        step={state.processingStep} 
        currentChunk={currentChunkInfo.current} 
        totalChunks={currentChunkInfo.total}
        onDismiss={() => setState(prev => ({ ...prev, processingStep: 'idle' }))}
      />
      
      <SourceModal entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none">S</div>
            <div>
              <h1 className="text-xl font-black tracking-tight">EstateSync</h1>
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">Live Engine</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none font-black' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold">
            {state.theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            <span className="text-sm">Dark Mode</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search community, phone or group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black cursor-pointer transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95">
              <UploadIcon className="w-5 h-5" />
              Ingest Chats
              <input type="file" accept=".txt" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-32 bg-slate-50 dark:bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Inventory', count: state.units.length, color: 'emerald', icon: <UnitsIcon /> },
                  { label: 'Leads', count: state.requirements.length, color: 'blue', icon: <RequirementsIcon /> },
                  { label: 'Sync Success', count: state.matches.length, color: 'amber', icon: <MatchesIcon /> },
                  { label: 'Pipeline', count: state.tasks.filter(t => t.status === 'pending').length, color: 'indigo', icon: <ChatIcon /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group">
                    <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                      {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-black mt-1 text-slate-900 dark:text-white">{stat.count}</p>
                  </div>
                ))}
              </div>

              {state.tasks.some(t => t.status === 'pending') && (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100 dark:shadow-none">
                  <div className="max-w-xl">
                    <h2 className="text-3xl font-black mb-3">Sync Queue Pending</h2>
                    <p className="text-indigo-100 font-medium leading-relaxed opacity-90">We have detected {state.tasks.filter(t => t.status === 'pending').length} data chunks waiting for extraction. Launch the pipeline to begin the automated matching process.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black shadow-2xl hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Open Sync Pipeline
                  </button>
                </div>
              )}

              {state.matches.length > 0 && (
                <div>
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
                    Recent High-Confidence Matches
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

          {activeTab === 'tasks' && (
            <TaskBoard 
              tasks={state.tasks} 
              files={state.files} 
              onRunTask={processTask} 
              onRunAll={runAllTasks} 
              isProcessing={state.processingStep === 'extracting'} 
            />
          )}

          {activeTab === 'matches' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Success Pool</h2>
                  <p className="text-slate-500 font-medium mt-1">Cross-referencing property attributes with client budgets.</p>
                </div>
                <button 
                  onClick={performMatching}
                  disabled={state.processingStep !== 'idle' || state.units.length === 0}
                  className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Force Match Scan
                </button>
              </div>
              
              {state.matches.length === 0 ? (
                <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <MatchesIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Matches</h3>
                  <p className="text-slate-500 font-medium mt-2">Finish processing your pipeline chunks to discover links.</p>
                </div>
              ) : (
                state.matches.sort((a, b) => b.score - a.score).map((match, i) => {
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
              <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-slate-100">Market Inventory</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUnits.map(unit => (
                  <PropertyCard key={unit.id} entity={unit} onClick={setSelectedEntity} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black mb-8 text-slate-900 dark:text-slate-100">Client Leads</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRequirements.map(req => (
                  <PropertyCard key={req.id} entity={req} onClick={setSelectedEntity} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Control Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-[50]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
            <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
