import React, { useState } from 'react';
import { Globe, User, Wrench, Trash2, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserType } from '@/src/types';
import { signUp, signIn } from '@/src/lib/database';

interface AuthProps {
  onAuthSuccess: () => void;
  onJoinPro?: () => void;
}

export function AuthScreen({ onAuthSuccess, onJoinPro }: AuthProps) {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<UserType>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      console.log('Login result:', result);
      onAuthSuccess();
    } catch (e: any) {
      console.error('Login error:', e);
      if (e.message?.includes('Email not confirmed')) {
        setError('Email not confirmed. Please check Supabase settings or confirm your email.');
      } else {
        setError(e.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), type);
      onAuthSuccess();
    } catch (e: any) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center p-6 min-h-dvh bg-[#2d5a5a]">
      <div className="text-center mb-10">
        <img
          src="https://i.imgur.com/OBYrlgU.png"
          alt="Closer Logo"
          className="h-24 object-contain mx-auto mb-2 drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          referrerPolicy="no-referrer"
        />
        <div className="text-[13px] text-white/60">Local services you can trust</div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-[32px] shadow-2xl shadow-black/20">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {screen === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {screen === 'signup' && (
          <input
            className="w-full px-4 py-3.5 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none bg-slate-50 premium-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="w-full px-4 py-3.5 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none bg-slate-50 premium-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full px-4 py-3.5 rounded-xl border-1.5 border-slate-200 text-[15px] outline-none bg-slate-50 premium-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (screen === 'login' ? handleLogin() : handleSignup())}
        />

        {screen === 'signup' && (
          <div className="flex rounded-xl border-1.5 border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => setType('customer')}
              className={cn(
                "flex-1 py-3 text-[13px] font-bold transition-all",
                type === 'customer' ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Customer
            </button>
            <button
              onClick={() => setType('professional')}
              className={cn(
                "flex-1 py-3 text-[13px] font-bold transition-all",
                type === 'professional' ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Professional
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-[13px] px-1 font-medium animate-pulse">
            {error}
          </div>
        )}

        <button
          onClick={() => screen === 'login' ? handleLogin() : handleSignup()}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-brand text-white font-bold text-[15px] shadow-lg shadow-brand/20 disabled:opacity-60 flex items-center justify-center gap-2 premium-btn"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {screen === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        <div className="text-center mt-4 text-[13px] text-slate-500">
          {screen === 'login' ? (
            <>New? <button onClick={() => { setScreen('signup'); setError(''); }} className="text-brand font-bold hover:underline">Sign Up</button></>
          ) : (
            <>Have an account? <button onClick={() => { setScreen('login'); setError(''); }} className="text-brand font-bold hover:underline">Log In</button></>
          )}
        </div>

        {onJoinPro && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="text-[12px] text-slate-500 font-medium mb-3">Are you a professional?</div>
            <button
              onClick={onJoinPro}
              className="w-full py-3.5 rounded-xl bg-white border-2 border-brand text-brand font-black text-[14px] flex items-center justify-center gap-2 premium-btn"
            >
              <Briefcase className="w-4 h-4" /> Join Closer as a Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
