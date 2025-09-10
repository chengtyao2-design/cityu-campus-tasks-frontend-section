import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      type="text"
      shape="circle"
      size="large"
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      aria-label={`切换到${isDark ? '亮色' : '暗色'}主题`}
      className={cn(
        'relative overflow-hidden transition-all duration-200 ease-out',
        'border border-border/20 backdrop-blur-sm',
        'hover:scale-110 hover:shadow-glow-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'active:scale-95',
        isDark 
          ? 'bg-bg-secondary/80 text-neon-cyan hover:text-primary hover:bg-bg-tertiary/80' 
          : 'bg-bg-secondary/80 text-warning hover:text-primary hover:bg-bg-tertiary/80'
      )}
      style={{
        background: isDark 
          ? 'rgba(var(--color-bg-secondary) / 0.8)' 
          : 'rgba(var(--color-bg-secondary) / 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    />
  );
};

export default ThemeToggle;