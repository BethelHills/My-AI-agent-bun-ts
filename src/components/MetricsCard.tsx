/**
 * MetricsCard Component for Code Quality Dashboard
 * Following AI Rules: Type Safety, Performance, Code Quality
 */

import React from 'react';
import { MetricsCardProps } from '../types/dashboard.types.js';

// Externalized CSS classes for better maintainability
const BASE_CARD_CLASSES = 'p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg';
const CARD_COLOR_CLASSES = {
  green: 'bg-green-50 border-green-200 text-green-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  red: 'bg-red-50 border-red-200 text-red-800'
} as const;

/**
 * Reusable metrics card component with trend indicators
 * @param props - Component properties
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  trend,
  color,
  loading = false,
  onClick
}) => {
  // Performance optimization: Memoize trend icon
  const getTrendIcon = React.useMemo(() => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
    }
  }, [trend]);

  // Performance optimization: Memoize color classes
  const getColorClasses = React.useMemo(() => {
    return `${BASE_CARD_CLASSES} border ${CARD_COLOR_CLASSES[color]}`;
  }, [color]);

  // Loading state component
  if (loading) {
    return (
      <div className={`${getColorClasses} animate-pulse`}>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-8 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div 
      className={`${getColorClasses} cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
      aria-label={`${title}: ${value} (${trend} trend)`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-lg" aria-hidden="true">
          {getTrendIcon}
        </span>
      </div>
      
      <div className="text-2xl font-bold mb-1">
        {typeof value === 'number' ? value.toFixed(1) : value}
      </div>
      
      <div className="text-xs text-gray-500">
        {trend === 'up' && 'Improving'}
        {trend === 'down' && 'Declining'}
        {trend === 'stable' && 'Stable'}
      </div>
    </div>
  );
};

/**
 * Default export for easier imports
 */
export default MetricsCard;
