import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, error, clearError, loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      const success = await register(name.trim(), email.trim(), password);
      setIsSubmitting(false);
      if (success) {
        onSuccess();
      }
    } else {
      setIsSubmitting(true);
      const success = await login(email.trim(), password);
      setIsSubmitting(false);
      if (success) {
        onSuccess();
      }
    }
  };

  const handleDemoCustomer = async () => {
    setIsSubmitting(true);
    const success = await loginAsDemoUser();
    setIsSubmitting(false);
    if (success) onSuccess();
  };

  const handleDemoAdmin = async () => {
    setIsSubmitting(true);
    const success = await loginAsDemoAdmin();
    setIsSubmitting(false);
    if (success) onSuccess();
  };

  const displayError = localError || error;

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white text-center border-b border-slate-800">
          <div className="flex justify-center mb-2">
            <Logo size="md" variant="light" withSubtitle={false} />
          </div>
          <h2 className="text-lg font-black text-white mt-2">
            {mode === 'login' ? 'Welcome Back to NovaCart' : 'Create Your NovaCart Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            JWT-authenticated session with bcrypt password encryption
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {displayError && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                  />
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
              Quick Practice Logins (1-Click)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoCustomer}
                disabled={isSubmitting}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-emerald-950/40 hover:border-emerald-500/40 text-left transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-200 text-xs block">Demo Customer</span>
                <span className="text-[10px] text-slate-400 block truncate">demo@example.com</span>
              </button>

              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={isSubmitting}
                className="p-2.5 rounded-xl border border-amber-600/40 bg-amber-950/30 hover:bg-amber-950/50 hover:border-amber-500/60 text-left transition-colors cursor-pointer"
              >
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Demo Admin</span>
                </span>
                <span className="text-[10px] text-amber-200/60 block truncate">admin@novacart.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
