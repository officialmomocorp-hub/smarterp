import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variantClasses = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'h-4 rounded-lg'
  };

  return (
    <div 
      className={`skeleton-shimmer ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats Grid */}
      <StatsSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card">
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="lg:col-span-2 card">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(30,41,59,0.3)' }}>
                <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="card">
          <div className="flex gap-4">
            <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-4 text-left"><Skeleton className="h-3 w-20" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    {j === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
