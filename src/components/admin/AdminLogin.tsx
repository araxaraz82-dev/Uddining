import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Mail, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const ADMIN_EMAIL = 'samirazmain8@gmail.com';

export default function AdminLogin() {
  const navigate = useNavigate();
  const switchCtnRef = useRef<HTMLDivElement>(null);
  const switchC1Ref = useRef<HTMLDivElement>(null);
  const switchC2Ref = useRef<HTMLDivElement>(null);
  const aContainerRef = useRef<HTMLDivElement>(null);
  const bContainerRef = useRef<HTMLDivElement>(null);

  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const changeToSignUp = useCallback(() => {
    if (switchCtnRef.current) switchCtnRef.current.style.transform = 'translateX(100%)';
    if (switchC1Ref.current) switchC1Ref.current.style.opacity = '0';
    if (switchC2Ref.current) switchC2Ref.current.style.opacity = '1';
    if (aContainerRef.current) aContainerRef.current.style.opacity = '0';
    if (bContainerRef.current) bContainerRef.current.style.opacity = '1';
    setIsSignUp(true);
    setError('');
  }, []);

  const changeToSignIn = useCallback(() => {
    if (switchCtnRef.current) switchCtnRef.current.style.transform = 'translateX(0%)';
    if (switchC1Ref.current) switchC1Ref.current.style.opacity = '1';
    if (switchC2Ref.current) switchC2Ref.current.style.opacity = '0';
    if (aContainerRef.current) aContainerRef.current.style.opacity = '1';
    if (bContainerRef.current) bContainerRef.current.style.opacity = '0';
    setIsSignUp(false);
    setError('');
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: signInForm.email,
      password: signInForm.password,
    });

    if (signInError) {
      setError(signInError.message || 'Invalid credentials');
      setLoading(false);
      return;
    }

    if (data.user) {
      if (signInForm.email === ADMIN_EMAIL) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signUpForm.password !== signUpForm.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: signUpForm.email,
      password: signUpForm.password,
    });

    if (signUpError) {
      setError(signUpError.message || 'Sign up failed');
      setLoading(false);
      return;
    }

    if (data.user) {
      if (signUpForm.email === ADMIN_EMAIL) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-accent transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div
          className="relative glass overflow-hidden"
          style={{ minHeight: '560px' }}
        >
          {/* Sliding switch overlay */}
          <div
            ref={switchCtnRef}
            className="absolute top-0 left-0 h-full w-1/2 z-10 transition-transform duration-700 ease-in-out overflow-hidden"
            style={{ transform: 'translateX(0%)' }}
          >
            <div className="relative h-full w-full bg-gradient-to-br from-accent-dark via-accent to-accent-light flex items-center justify-center">
              {/* Sign in overlay content */}
              <div
                ref={switchC1Ref}
                className="text-center px-8 transition-opacity duration-500"
                style={{ opacity: '1' }}
              >
                <h2 className="font-display font-bold text-2xl md:text-3xl text-ink-900 mb-3">
                  Welcome Back!
                </h2>
                <p className="text-ink-800 text-sm mb-6 max-w-xs">
                  Sign in to access your account and track your orders
                </p>
                <button
                  onClick={changeToSignUp}
                  className="px-8 py-3 rounded-xl border-2 border-ink-900 text-ink-900 font-semibold hover:bg-ink-900 hover:text-accent transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>

              {/* Sign up overlay content */}
              <div
                ref={switchC2Ref}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 transition-opacity duration-500"
                style={{ opacity: '0' }}
              >
                <h2 className="font-display font-bold text-2xl md:text-3xl text-ink-900 mb-3">
                  Hello Friend!
                </h2>
                <p className="text-ink-800 text-sm mb-6 max-w-xs">
                  Create your customer account to start shopping
                </p>
                <button
                  onClick={changeToSignIn}
                  className="px-8 py-3 rounded-xl border-2 border-ink-900 text-ink-900 font-semibold hover:bg-ink-900 hover:text-accent transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          {/* Sign In form (left side) */}
          <div
            ref={aContainerRef}
            className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center transition-opacity duration-700"
            style={{ opacity: '1' }}
          >
            <div className="w-full max-w-xs px-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3 pulse-glow">
                  <LogIn size={24} className="text-accent" />
                </div>
                <h2 className="font-display font-bold text-xl text-gradient">Sign In</h2>
              </div>
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    className="input-glass pl-9 text-sm"
                    placeholder="Email"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    className="input-glass pl-9 text-sm"
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading && !isSignUp}
                  className="btn-accent w-full text-sm flex items-center justify-center gap-2"
                >
                  <LogIn size={16} /> Sign In
                </button>
              </form>
              <p className="text-xs text-gray-500 text-center mt-4 md:hidden">
                Don't have an account?{' '}
                <button onClick={changeToSignUp} className="text-accent hover:underline">
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* Sign Up form (right side) */}
          <div
            ref={bContainerRef}
            className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center transition-opacity duration-700"
            style={{ opacity: '0' }}
          >
            <div className="w-full max-w-xs px-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3 pulse-glow">
                  <UserPlus size={24} className="text-accent" />
                </div>
                <h2 className="font-display font-bold text-xl text-gradient">Create Account</h2>
              </div>
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    className="input-glass pl-9 text-sm"
                    placeholder="Email"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className="input-glass pl-9 text-sm"
                    placeholder="Password"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={signUpForm.confirm}
                    onChange={(e) => setSignUpForm({ ...signUpForm, confirm: e.target.value })}
                    className="input-glass pl-9 text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading && isSignUp}
                  className="btn-accent w-full text-sm flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Sign Up
                </button>
              </form>
              <p className="text-xs text-gray-500 text-center mt-4 md:hidden">
                Already have an account?{' '}
                <button onClick={changeToSignIn} className="text-accent hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 glass px-4 py-2 border border-red-500/30 rounded-xl text-red-400 text-sm whitespace-nowrap"
            >
              {error}
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Admin: {ADMIN_EMAIL} · All other emails become customer accounts
        </p>
      </div>
    </div>
  );
}
