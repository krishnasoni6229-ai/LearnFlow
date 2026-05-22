import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function Button({
  label,
  isLoading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-100 dark:bg-slate-800';
      case 'outline':
        return 'bg-transparent border-2 border-indigo-600 dark:border-indigo-400';
      case 'danger':
        return 'bg-red-500 dark:bg-red-600';
      case 'primary':
      default:
        return 'bg-indigo-600 dark:bg-indigo-500';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return 'text-slate-900 dark:text-white';
      case 'outline':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'danger':
      case 'primary':
      default:
        return 'text-white';
    }
  };

  const isDisabled = disabled || isLoading;
  const opacityClass = isDisabled ? 'opacity-70' : 'opacity-100';

  // Responsive button scaling based on window width
  const { isSmallWidth } = useResponsive();
  const paddingClass = isSmallWidth ? 'py-3 rounded-xl' : 'py-4 rounded-2xl';
  const textClass = isSmallWidth ? 'text-base' : 'text-lg';

  return (
    <TouchableOpacity
      className={`w-full items-center flex-row justify-center ${paddingClass} ${getVariantClasses()} ${opacityClass} shadow-md shadow-indigo-600/20 ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4F46E5' : 'white'} className="mr-3" />
      ) : null}
      <Text className={`font-inter-bold tracking-wide ${textClass} ${getTextColor()}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
