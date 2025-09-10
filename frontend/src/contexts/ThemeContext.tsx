import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createCustomTheme } from '../theme/index';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  antdTheme: any;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // 初始化主题
  useEffect(() => {
    const initTheme = () => {
      // 优先从 localStorage 读取
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // 如果没有保存的主题，检查系统偏好
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      // 检查 HTML 元素上的 data-theme 属性
      const htmlTheme = document.documentElement.getAttribute('data-theme') as Theme | null;
      
      const finalTheme = savedTheme || htmlTheme || systemTheme;
      
      setThemeState(finalTheme);
      document.documentElement.setAttribute('data-theme', finalTheme);
      
      // 确保 localStorage 中有值
      if (!savedTheme) {
        localStorage.setItem('theme', finalTheme);
      }
    };

    initTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      // 更新状态
      setThemeState(newTheme);
      
      // 更新 localStorage
      localStorage.setItem('theme', newTheme);
      
      // 更新 HTML 属性
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // 添加过渡效果类
      document.documentElement.classList.add('theme-transitioning');
      
      // 移除过渡效果类
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 200);
      
    } catch (e) {
      console.warn('Failed to set theme:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // 生成 Ant Design 主题配置
  const antdTheme = useMemo(() => {
    return createCustomTheme(theme === 'dark');
  }, [theme]);

  const isDark = theme === 'dark';

  const value = useMemo(() => ({ 
    theme, 
    setTheme, 
    toggleTheme, 
    antdTheme,
    isDark 
  }), [theme, setTheme, toggleTheme, antdTheme, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 主题切换动画样式
const themeTransitionStyles = `
  .theme-transitioning,
  .theme-transitioning *,
  .theme-transitioning *:before,
  .theme-transitioning *:after {
    transition: all 200ms ease-out !important;
    transition-delay: 0 !important;
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = themeTransitionStyles;
  document.head.appendChild(styleElement);
}