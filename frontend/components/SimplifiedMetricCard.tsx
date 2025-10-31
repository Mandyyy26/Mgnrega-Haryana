import { Language } from '@/types';
import Tooltip from './Tooltip';
import { LucideIcon } from 'lucide-react';

interface SimplifiedMetricCardProps {
  icon: string;
  title: string;
  bigNumber: number | string;
  description: string;
  tooltip: string;
  progressBar?: {
    value: number;
    label: string;
    color?: string;
  };
  status?: {
    badge: string;
    color: 'excellent' | 'good' | 'fair' | 'poor';
    detail?: string;
  };
  comparison?: {
    completed: number;
    ongoing: number;
    completedLabel: string;
    ongoingLabel: string;
  };
  language: Language;
}

export default function SimplifiedMetricCard({
  icon,
  title,
  bigNumber,
  description,
  tooltip,
  progressBar,
  status,
  comparison,
  language,
}: SimplifiedMetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-green-600">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">{title}</h3>
        <Tooltip content={tooltip} />
      </div>


      {/* Big Number */}
      <div className="mb-3">
        <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-1">
          {typeof bigNumber === 'number' ? bigNumber.toLocaleString() : bigNumber}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Progress Bar (Type 1) */}
      {progressBar && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progressBar.color || 'bg-gradient-to-r from-orange-500 to-green-500'
              }`}
              style={{ width: `${Math.min(progressBar.value, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{progressBar.label}</p>
        </div>
      )}

      {/* Status Badge (Type 2) */}
      {status && (
        <div className="mt-4">
          <div
            className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeColor(
              status.color
            )}`}
          >
            {status.badge}
          </div>
          {status.detail && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{status.detail}</p>
          )}
        </div>
      )}

      {/* Comparison View (Type 3) */}
      {comparison && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {comparison.completed}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {comparison.completedLabel}
            </span>
          </div>
          <div className="text-2xl text-gray-300 dark:text-gray-600">vs</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {comparison.ongoing}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {comparison.ongoingLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadgeColor(color: 'excellent' | 'good' | 'fair' | 'poor'): string {
  switch (color) {
    case 'excellent':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'good':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'fair':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    case 'poor':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  }
}
