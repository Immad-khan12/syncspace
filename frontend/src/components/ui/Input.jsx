// Input.jsx — Styled text input with label, error state, and icon support
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(
  ({ label, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}

        {/* Input wrapper — handles icon positioning */}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full h-10 rounded-lg border bg-[#0F172A] text-[#F8FAFC] text-sm',
              'placeholder:text-[#475569] transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent',
              // Default border
              'border-[#1E293B]',
              // Error state overrides border color
              error && 'border-[#EF4444] focus:ring-[#EF4444]',
              // Padding adjusts based on icons
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-[#EF4444] flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p className="text-xs text-[#475569]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;