
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface Props {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const user = await authService.login(email, password);
        onAuthSuccess(user);
      } else {
        const user = await authService.signup(email, password, name);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 text-center bg-indigo-600">
          <div className="inline-block w-12 h-12 bg-white rounded-xl mb-4 flex items-center justify-center text-indigo-600 font-black text-2xl">S</div>
          <h1 className="text-2xl font-bold text-white">EstateSync AI</h1>
          <p className="text-indigo-100 text-sm mt-1">Real Estate Intelligence for WhatsApp</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <h2 className="text-xl font-bold mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs rounded-lg border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
              placeholder="agent@estatesync.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
