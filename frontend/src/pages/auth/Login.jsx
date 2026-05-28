// Login.jsx — The glassmorphism login page
// Floating blur orbs, animated card entry, social login buttons for polish
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Login() {
  const navigate  = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]       = useState({});

  // Client-side validation before hitting the API
  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be 8+ characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field error as user types
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Floating blur orbs — pure CSS, very cheap to render ── */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-2xl pointer-events-none" />

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Card surface — glassmorphism effect */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap size={22} className="text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">SyncSpace</h1>
                <p className="text-xs text-[#475569] mt-0.5">Sign in to your workspace</p>
              </div>
            </motion.div>
          </div>

          {/* Social login buttons — visual polish, wired to real OAuth later */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => toast('Google OAuth coming soon!')}
              className="flex items-center justify-center gap-2 h-9 rounded-lg
                         bg-[#1E293B] hover:bg-[#334155] border border-[#334155]
                         text-[#94A3B8] text-xs font-medium transition-colors"
            >
              {/* Google G SVG icon */}
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => toast('GitHub OAuth coming soon!')}
              className="flex items-center justify-center gap-2 h-9 rounded-lg
                         bg-[#1E293B] hover:bg-[#334155] border border-[#334155]
                         text-[#94A3B8] text-xs font-medium transition-colors"
            >
              {/* GitHub icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#94A3B8">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1E293B]" />
            <span className="text-xs text-[#334155] font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#1E293B]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={15} />}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[#475569] hover:text-[#94A3B8] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              autoComplete="current-password"
            />

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                onClick={() => toast('Password reset coming soon!')}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight size={15} />}
            >
              Sign in
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-xs text-[#475569] mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#6366F1] hover:text-[#4F46E5] font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}