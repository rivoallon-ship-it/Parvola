import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// ============================================
// Composants Input avec CVA (Class Variance Authority)
// ============================================

// Shared input variants
const inputVariants = cva(
  // Base styles
  'w-full bg-card-bg border border-card-border focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
  {
    variants: {
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-base rounded-lg',
        lg: 'px-5 py-3 text-lg rounded-lg',
      },
      hasError: {
        true: 'border-danger focus:ring-danger',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  }
);

// Extract only size from VariantProps (hasError is internal)
type InputVariantProps = Pick<VariantProps<typeof inputVariants>, 'size'>;

// Label component
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

// Error message component
const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-danger">{children}</p>
);

// ============================================
// Input Component
// ============================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariantProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  size,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            inputVariants({ size, hasError: !!error }),
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

// ============================================
// TextArea Component
// ============================================

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    InputVariantProps {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  size,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <textarea
        className={cn(
          inputVariants({ size, hasError: !!error }),
          'min-h-24 resize-y',
          className
        )}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

// ============================================
// Select Component
// ============================================

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    InputVariantProps {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  size,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <select
        className={cn(
          inputVariants({ size, hasError: !!error }),
          'cursor-pointer',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

// Export variants for external use
export { inputVariants };
export default Input;
