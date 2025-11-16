import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  gradient,
}: MetricCardProps) {
  const gradientClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-200/50',
    green: 'from-green-500/10 to-green-600/10 border-green-200/50',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-200/50',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-200/50',
  };

  const iconGradientClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      className={cn(
        'relative bg-white rounded-2xl border p-6 overflow-hidden shadow-lg',
        gradient ? `bg-gradient-to-br ${gradientClasses[gradient]}` : 'border-slate-200',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle gradient overlay */}
      {gradient && (
        <div className={cn(
          'absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10',
          iconGradientClasses[gradient]
        )} />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-5xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-3">
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-md',
                  trend.isPositive
                    ? 'text-green-700 bg-green-50'
                    : 'text-red-700 bg-red-50'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'ml-4 p-3 rounded-full shadow-md',
            gradient ? iconGradientClasses[gradient] : 'bg-slate-100',
            gradient ? 'text-white' : 'text-slate-600'
          )}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

