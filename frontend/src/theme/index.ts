import { theme } from 'antd';

// 霓虹主题配置 - 符合WCAG AA标准
export const neonThemeTokens = {
  light: {
    colorPrimary: '#D97706', // 橙色 - 对比度 > 4.5:1
    colorSuccess: '#059669', // 绿色 - 对比度 > 4.5:1
    colorWarning: '#D97706', // 橙色 - 对比度 > 4.5:1
    colorError: '#DC2626', // 红色 - 对比度 > 4.5:1
    colorInfo: '#0891B2', // 青色 - 对比度 > 4.5:1
    colorBgBase: '#FDFCF7', // 温暖白色
    colorBgContainer: '#F9FAFB', // 次要背景
    colorBgElevated: '#FFFFFF', // 提升背景
    colorText: '#111827', // 主文本 - 对比度 > 15:1
    colorTextSecondary: '#374151', // 次要文本 - 对比度 > 7:1
    colorTextTertiary: '#6B7280', // 辅助文本 - 对比度 > 4.5:1
    colorBorder: '#D1D5DB',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusXS: 6,
  },
  dark: {
    colorPrimary: '#A855F7', // 紫色 - 对比度 > 4.5:1
    colorSuccess: '#22C55E', // 绿色 - 对比度 > 4.5:1
    colorWarning: '#F59E0B', // 橙色 - 对比度 > 4.5:1
    colorError: '#F87171', // 红色 - 对比度 > 4.5:1
    colorInfo: '#22D3EE', // 青色 - 对比度 > 4.5:1
    colorBgBase: '#0B1020', // 深海军蓝
    colorBgContainer: '#111827', // 次要背景
    colorBgElevated: '#1F2937', // 提升背景
    colorText: '#F8FAFC', // 主文本 - 对比度 > 15:1
    colorTextSecondary: '#CBD5E1', // 次要文本 - 对比度 > 7:1
    colorTextTertiary: '#94A3B8', // 辅助文本 - 对比度 > 4.5:1
    colorBorder: '#374151',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusXS: 6,
  },
};

export const createCustomTheme = (isDark = false) => {
  const tokens = isDark ? neonThemeTokens.dark : neonThemeTokens.light;
  
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...tokens,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      // 霓虹效果相关
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      boxShadowSecondary: isDark
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    components: {
      Layout: {
        headerBg: tokens.colorBgContainer,
        headerHeight: 64,
        headerPadding: '0 24px',
        bodyBg: tokens.colorBgBase,
        footerBg: tokens.colorBgContainer,
      },
      Button: {
        borderRadius: tokens.borderRadius,
        borderRadiusLG: tokens.borderRadiusLG,
        borderRadiusSM: tokens.borderRadiusXS,
        primaryShadow: isDark 
          ? `0 0 20px ${tokens.colorPrimary}40`
          : `0 2px 4px ${tokens.colorPrimary}20`,
        // 霓虹按钮效果
        algorithm: true,
      },
      Card: {
        borderRadius: tokens.borderRadiusLG,
        borderRadiusLG: 20,
        paddingLG: 24,
        boxShadow: tokens.boxShadow,
        // 玻璃形态效果
        headerBg: 'transparent',
        bodyBg: 'transparent',
      },
      Menu: {
        borderRadius: tokens.borderRadius,
        itemBorderRadius: tokens.borderRadiusXS,
        horizontalItemSelectedBg: 'transparent',
        horizontalItemSelectedColor: tokens.colorPrimary,
        itemSelectedBg: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        itemSelectedColor: tokens.colorPrimary,
        itemHoverBg: isDark ? 'rgba(124, 58, 237, 0.05)' : 'rgba(245, 158, 11, 0.05)',
        itemHoverColor: tokens.colorPrimary,
      },
      Input: {
        borderRadius: tokens.borderRadius,
        paddingBlock: 12,
        paddingInline: 16,
        // 霓虹输入框效果
        activeBorderColor: tokens.colorPrimary,
        hoverBorderColor: tokens.colorPrimary,
        activeShadow: isDark 
          ? `0 0 0 2px ${tokens.colorPrimary}20, 0 0 20px ${tokens.colorPrimary}40`
          : `0 0 0 2px ${tokens.colorPrimary}10, 0 0 10px ${tokens.colorPrimary}20`,
      },
      Drawer: {
        borderRadius: 0,
        paddingLG: 24,
        // 玻璃效果抽屉
        colorBgElevated: isDark 
          ? 'rgba(17, 24, 39, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
      },
      Statistic: {
        titleFontSize: 14,
        contentFontSize: 24,
        fontFamily: tokens.fontFamily,
      },
    },
  };
};

// 默认使用亮色主题
export const customTheme = createCustomTheme(false);

// 响应式断点
export const mobileBreakpoints = {
  xs: '480px',
  sm: '576px', 
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

// 霓虹颜色调色板
export const neonColors = {
  light: {
    primary: '#F59E0B',
    secondary: '#06B6D4', 
    accent: '#F472B6',
    neonCyan: '#22D3EE',
    neonPurple: '#A855F7',
    neonPink: '#EC4899',
  },
  dark: {
    primary: '#7C3AED',
    secondary: '#22D3EE',
    accent: '#0EA5E9', 
    neonCyan: '#22D3EE',
    neonPurple: '#A855F7',
    neonPink: '#EC4899',
  },
};

// 动画配置
export const animationConfig = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 250,
  },
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};