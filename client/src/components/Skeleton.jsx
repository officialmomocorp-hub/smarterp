import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'h-4 rounded'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
             <Skeleton className="h-6 w-48 mb-6" />
             <Skeleton className="h-full w-full" />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
             <Skeleton className="h-6 w-48 mb-6" />
             <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                     <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
                     <div className="space-y-1 w-full">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
};

export const StatsSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32">
           <div className="flex justify-between items-start mb-4">
              <Skeleton variant="circle" className="w-12 h-12" />
              <Skeleton className="h-6 w-16" />
           </div>
           <Skeleton className="h-8 w-24 mb-2" />
           <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-4"><Skeleton className="h-4 w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
