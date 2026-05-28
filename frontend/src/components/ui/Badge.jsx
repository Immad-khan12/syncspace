// Badge.jsx — Status pill / label component
import { cn } from '@/lib/utils';

const variants = {
  default:  'bg-[#1E293B] text-[#94A3B8] border border-[#334155]',
  primary:  'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30',
  success:  'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
  warning:  'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30',
  danger:   'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30',
  purple:   'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}