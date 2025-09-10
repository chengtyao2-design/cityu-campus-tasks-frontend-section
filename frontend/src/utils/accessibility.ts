/**
 * 可访问性工具函数
 * 确保WCAG AA对比度标准和其他可访问性要求
 */

/**
 * 计算颜色对比度
 * @param color1 第一个颜色 (hex格式)
 * @param color2 第二个颜色 (hex格式)
 * @returns 对比度比值
 */
export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * 将hex颜色转换为RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * 检查对比度是否符合WCAG AA标准
 * @param contrast 对比度比值
 * @param level 'AA' | 'AAA'
 * @param size 'normal' | 'large'
 * @returns 是否符合标准
 */
export const meetsWCAGStandard = (
  contrast: number, 
  level: 'AA' | 'AAA' = 'AA', 
  size: 'normal' | 'large' = 'normal'
): boolean => {
  if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7;
  }
  return size === 'large' ? contrast >= 3 : contrast >= 4.5;
};

/**
 * 获取符合对比度要求的颜色
 */
export const getAccessibleColors = (isDark: boolean) => {
  if (isDark) {
    return {
      // 深色主题 - 确保足够的对比度
      primary: '#A855F7', // 紫色，对深色背景有良好对比度
      secondary: '#22D3EE', // 青色
      accent: '#0EA5E9', // 蓝色
      success: '#22C55E', // 绿色
      warning: '#F59E0B', // 橙色
      error: '#F87171', // 红色
      text: {
        primary: '#F8FAFC', // 主文本 - 对比度 > 15:1
        secondary: '#CBD5E1', // 次要文本 - 对比度 > 7:1
        muted: '#94A3B8', // 辅助文本 - 对比度 > 4.5:1
      },
      bg: {
        primary: '#0B1020', // 主背景
        secondary: '#111827', // 次要背景
        elevated: '#1F2937', // 提升背景
      }
    };
  } else {
    return {
      // 浅色主题 - 确保足够的对比度
      primary: '#D97706', // 橙色，对浅色背景有良好对比度
      secondary: '#0891B2', // 青色
      accent: '#DC2626', // 红色
      success: '#059669', // 绿色
      warning: '#D97706', // 橙色
      error: '#DC2626', // 红色
      text: {
        primary: '#111827', // 主文本 - 对比度 > 15:1
        secondary: '#374151', // 次要文本 - 对比度 > 7:1
        muted: '#6B7280', // 辅助文本 - 对比度 > 4.5:1
      },
      bg: {
        primary: '#FDFCF7', // 主背景
        secondary: '#F9FAFB', // 次要背景
        elevated: '#FFFFFF', // 提升背景
      }
    };
  }
};

/**
 * 检查用户是否偏好减少动画
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 检查用户是否偏好高对比度
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * 获取焦点样式
 */
export const getFocusStyles = (isDark: boolean) => {
  const colors = getAccessibleColors(isDark);
  return {
    outline: `2px solid ${colors.primary}`,
    outlineOffset: '2px',
    boxShadow: `0 0 0 4px ${colors.primary}20`,
  };
};

/**
 * 为元素添加可访问性属性
 */
export const addA11yProps = (element: HTMLElement, options: {
  role?: string;
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
}) => {
  const { role, label, describedBy, expanded, selected } = options;
  
  if (role) element.setAttribute('role', role);
  if (label) element.setAttribute('aria-label', label);
  if (describedBy) element.setAttribute('aria-describedby', describedBy);
  if (expanded !== undefined) element.setAttribute('aria-expanded', expanded.toString());
  if (selected !== undefined) element.setAttribute('aria-selected', selected.toString());
};

/**
 * 键盘导航助手
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  options: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
) => {
  const { onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = options;
  
  switch (event.key) {
    case 'Enter':
      onEnter?.();
      break;
    case ' ':
      event.preventDefault();
      onSpace?.();
      break;
    case 'Escape':
      onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      onArrowDown?.();
      break;
    case 'ArrowLeft':
      onArrowLeft?.();
      break;
    case 'ArrowRight':
      onArrowRight?.();
      break;
  }
};

/**
 * 屏幕阅读器公告
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * 检查元素是否在视口中
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * 平滑滚动到元素
 */
export const scrollToElement = (element: HTMLElement, options?: ScrollIntoViewOptions) => {
  if (prefersReducedMotion()) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  } else {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    });
  }
};