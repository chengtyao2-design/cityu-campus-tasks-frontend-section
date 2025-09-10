import { theme } from 'antd';

// 基础主题配置，使用 CSS 变量
const baseTheme = {
  token: {
    // 主色系
    colorPrimary: 'var(--color-primary)',
    colorPrimaryHover: 'var(--color-primary-hover)',
    colorPrimaryActive: 'var(--color-primary-active)',
    colorPrimaryBg: 'var(--color-primary-bg)',
    colorPrimaryBgHover: 'var(--color-primary-bg-hover)',
    colorPrimaryBorder: 'var(--color-primary-border)',
    colorPrimaryBorderHover: 'var(--color-primary-border-hover)',

    // 背景色
    colorBgBase: 'var(--color-bg-primary)',
    colorBgContainer: 'var(--color-bg-primary)',
    colorBgElevated: 'var(--color-bg-secondary)',
    colorBgLayout: 'var(--color-bg-tertiary)',
    colorBgSpotlight: 'var(--color-bg-quaternary)',

    // 边框色
    colorBorder: 'var(--color-border-primary)',
    colorBorderSecondary: 'var(--color-border-secondary)',

    // 文字色
    colorText: 'var(--color-text-primary)',
    colorTextSecondary: 'var(--color-text-secondary)',
    colorTextTertiary: 'var(--color-text-tertiary)',
    colorTextQuaternary: 'var(--color-text-quaternary)',

    // 状态色
    colorSuccess: 'var(--color-success)',
    colorWarning: 'var(--color-warning)',
    colorError: 'var(--color-error)',
    colorInfo: 'var(--color-info)',

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,
    
    // 圆角
    borderRadius: 6,
    
    // 间距
    controlHeight: 32,
    
    // 阴影
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
};

// 亮色主题配置
export const lightTheme = {
  ...baseTheme,
  algorithm: theme.defaultAlgorithm,
};

// 暗色主题配置
export const darkTheme = {
  ...baseTheme,
  algorithm: theme.darkAlgorithm,
};

// 默认导出亮色主题（向后兼容）
export const customTheme = lightTheme;