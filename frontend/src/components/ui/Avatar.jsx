// Avatar.jsx — User avatar with initials fallback and online indicator
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({
  name,
  src,
  size = 'md',
  online = false,
  color = '#6366F1',
  className,
}) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizeMap[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white',
            sizeMap[size]
          )}
          style={{ background: color }}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Online indicator dot */}
      {online && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#111827]" />
      )}
    </div>
  );
}