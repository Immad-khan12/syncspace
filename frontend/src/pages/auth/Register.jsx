// Register.jsx — Account creation page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Password strength indicator — shows visual feedback as user types
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 space-y-1"
    >
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
            pass ? 'bg-[#10B981]' : 'bg-[#1E293B] border border-[#334155]'
          }`}>
            {pass && <Check size={8} className="text-white" />}
          </div>
          <span className={`text-xs transition-colors ${pass ? 'text-[#10B981]' : 'text-[#475569]'}`}>
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password || form.password.length < 8)     errs.password = 'Password must be 8+ characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Welcome to SyncSpace! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-[#6366F1]/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap size={22} className="text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-[#F8FAFC] tracking-tight">Create account</h1>
                <p className="text-xs text-[#475569] mt-0.5">Start collaborating for free</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="name"
              type="text"
              placeholder="Alex Kim"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User size={15} />}
              autoFocus
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={15} />}
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock size={15} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-[#475569] hover:text-[#94A3B8] transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight size={15} />}
            >
              Create account
            </Button>

            <p className="text-[10px] text-[#334155] text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <button type="button" className="text-[#475569] hover:text-[#94A3B8] underline">Terms</button>
              {' '}and{' '}
              <button type="button" className="text-[#475569] hover:text-[#94A3B8] underline">Privacy Policy</button>
            </p>
          </form>

          <p className="text-center text-xs text-[#475569] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6366F1] hover:text-[#4F46E5] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}