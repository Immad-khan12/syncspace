// Skeleton.jsx — Loading placeholder with shimmer animation
// Used while data is being fetched — professional apps never show blank screens
import { cn } from '@/lib/utils';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[#1E293B] animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton layouts for common patterns
export function CardSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-3 border-t border-[#1E293B] flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}