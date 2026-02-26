import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// ============================================
// Composant Card avec CVA (Class Variance Authority)
// ============================================

const cardVariants = cva(
  // Base styles
  'bg-card-bg border border-card-border rounded-card shadow-sm',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        true: 'hover:shadow-md transition-shadow cursor-pointer',
        false: '',
      },
      isDraggable: {
        true: 'cursor-grab active:cursor-grabbing',
        false: '',
      },
      variant: {
        default: '',
        elevated: 'shadow-md',
        outlined: 'shadow-none',
        ghost: 'bg-transparent border-transparent shadow-none',
      },
    },
    defaultVariants: {
      padding: 'md',
      hover: false,
      isDraggable: false,
      variant: 'default',
    },
  }
);

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'draggable'>,
    VariantProps<typeof cardVariants> {
  borderColor?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  style,
  onClick,
  padding,
  hover,
  isDraggable,
  draggable,
  variant,
  borderColor,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(borderColor && { borderColor }),
    ...style,
  };

  // Support both isDraggable (CVA) and draggable (legacy) props
  const isDraggableValue = isDraggable ?? draggable;

  return (
    <div
      className={cn(
        cardVariants({ padding, hover, isDraggable: isDraggableValue, variant }),
        onClick && 'cursor-pointer',
        className
      )}
      style={mergedStyle}
      onClick={onClick}
      draggable={isDraggableValue}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      {children}
    </div>
  );
};

// Export variants for external use
export { cardVariants };
export default Card;
