import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6',
        'bg-slate-900/70 backdrop-blur-xl border border-white/10',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ label, value, change, trend, className }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'neutral': return '→';
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
        'border border-white/5',
        className
      )}
    >
      <div className="text-gray-400 text-sm font-medium mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        {change !== undefined && (
          <div className={cn('text-sm font-medium', getTrendColor())}>
            {getTrendIcon()} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}
