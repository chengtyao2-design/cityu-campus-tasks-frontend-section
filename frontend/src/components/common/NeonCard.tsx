import React from 'react';
import { Card, CardProps } from 'antd';
import { cn } from '../../utils/cn';

interface NeonCardProps extends Omit<CardProps, 'className' | 'variant'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glow' | 'minimal';
  glowColor?: 'primary' | 'secondary' | 'accent' | 'neon-cyan' | 'neon-purple' | 'neon-pink';
  animated?: boolean;
  hoverable?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({
  children,
  className,
  variant = 'default',
  glowColor = 'primary',
  animated = true,
  hoverable = true,
  ...props
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'border border-border/20 transition-all duration-200 ease-out';
    
    switch (variant) {
      case 'glass':
        return `${baseClasses} glass-effect shadow-glass backdrop-blur-glass`;
      case 'glow':
        return `${baseClasses} bg-bg-secondary/80 shadow-glow-${glowColor}`;
      case 'minimal':
        return `${baseClasses} bg-bg-secondary/50 shadow-card`;
      default:
        return `${baseClasses} neon-card`;
    }
  };

  const getHoverClasses = () => {
    if (!hoverable) return '';
    
    switch (variant) {
      case 'glass':
        return 'hover:shadow-neon hover:-translate-y-1';
      case 'glow':
        return `hover:shadow-glow-${glowColor} hover:scale-[1.02]`;
      case 'minimal':
        return 'hover:shadow-card-hover hover:-translate-y-0.5';
      default:
        return 'hover:shadow-neon hover:-translate-y-1';
    }
  };

  const getAnimationClasses = () => {
    if (!animated) return '';
    return 'transform-gpu will-change-transform';
  };

  const cardClasses = cn(
    getVariantClasses(),
    hoverable && getHoverClasses(),
    animated && getAnimationClasses(),
    className
  );

  return (
    <Card
      className={cardClasses}
      bordered={false}
      styles={{
        body: {
          padding: '1.5rem',
          background: 'rgb(var(--color-surface))',
        },
        header: {
          background: 'rgb(var(--color-surface))',
          borderBottom: '1px solid rgb(var(--color-border) / 0.1)',
        },
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default NeonCard;