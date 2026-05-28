// Button.jsx — The primary interactive element
// Supports multiple variants, sizes, loading state, and icons
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20',
  secondary:
    'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155]',
  ghost:
    'bg-transparent hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]',
  danger:
    'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20',
  success:
    'bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/20',
};

const sizes = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
  icon: 'h-9 w-9',
};

// forwardRef lets parent components attach a ref to this button
const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        // Framer Motion micro-interactions
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles all buttons share
          'relative inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Apply variant and size
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Loading spinner — replaces content when isLoading=true */}
        {isLoading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="31.4 31.4"
              />
            </svg>
          </motion.span>
        )}

        {/* Button content (hidden behind spinner when loading) */}
        <span className={cn('flex items-center gap-inherit', isLoading && 'invisible')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;