
import { User } from '../types';

// Mocked storage for simulation
const STORAGE_KEY = 'estate_sync_users';

export const authService = {
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem('estate_sync_session');
    return session ? JSON.parse(session) : null;
  },

  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersRaw = localStorage.getItem(STORAGE_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    
    localStorage.setItem('estate_sync_session', JSON.stringify(user));
    return user;
  },

  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersRaw = localStorage.getItem(STORAGE_KEY);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    if (users.some(u => u.email === email)) throw new Error('Email already exists');
    
    const newUser: User = { id: `user-${Date.now()}`, email, name };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem('estate_sync_session', JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem('estate_sync_session');
  }
};
