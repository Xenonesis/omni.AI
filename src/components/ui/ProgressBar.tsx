import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className = '',
  barClassName = '',
  size = 'md',
  color = 'primary'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };
  
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    accent: 'bg-accent-500'
  };
  
  return (
    <div className={`w-full bg-neutral-200 rounded-full ${sizeClasses[size]} ${className}`}>
      <div
        className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ${barClassName}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${value} out of ${max}`}
      />
    </div>
  );
};

export default ProgressBar;
