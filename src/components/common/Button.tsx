import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// ============================================
// Composant Button avec CVA (Class Variance Authority)
// ============================================

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-btn-primary text-white hover:opacity-90',
        secondary: 'bg-btn-secondary text-btn-primary border border-btn-primary hover:bg-gray-50',
        warning: 'bg-warning text-white hover:opacity-90',
        danger: 'bg-danger text-white hover:opacity-90',
        accent: 'bg-accent-light text-btn-primary hover:bg-accent/20',
        ghost: 'bg-transparent text-btn-primary hover:bg-gray-100',
        success: 'bg-success text-white hover:opacity-90',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      rounded: {
        full: 'rounded-full',
        lg: 'rounded-lg',
        md: 'rounded-md',
        none: 'rounded-none',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'full',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  rounded,
  fullWidth,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, rounded, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

// Export variants for external use
export { buttonVariants };
export default Button;
