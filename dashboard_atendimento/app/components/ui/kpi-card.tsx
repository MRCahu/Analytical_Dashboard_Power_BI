
'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    icon: 'text-blue-500 bg-blue-500/10',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/20',
    icon: 'text-green-500 bg-green-500/10',
    trend: 'text-green-600'
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    icon: 'text-orange-500 bg-orange-500/10',
    trend: 'text-orange-600'
  },
  red: {
    bg: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    icon: 'text-red-500 bg-red-500/10',
    trend: 'text-red-600'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    icon: 'text-purple-500 bg-purple-500/10',
    trend: 'text-purple-600'
  }
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className
}: KPICardProps) {
  const colorScheme = colorVariants[color];

  return (
    <Card className={cn(
      'p-6 bg-gradient-to-br border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]',
      colorScheme?.bg,
      colorScheme?.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {value?.toString?.() ?? '0'}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend?.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className={cn(
                'inline-flex items-center justify-center w-4 h-4 rounded text-xs',
                trend?.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend?.isPositive ? '↗' : '↘'}
              </span>
              <span>{Math?.abs?.(trend?.value ?? 0)?.toFixed?.(1) ?? '0.0'}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center shadow-sm',
          colorScheme?.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
