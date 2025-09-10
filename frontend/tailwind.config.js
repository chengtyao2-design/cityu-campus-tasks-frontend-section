/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'neon-cyan': 'rgb(var(--color-neon-cyan) / <alpha-value>)',
        'neon-purple': 'rgb(var(--color-neon-purple) / <alpha-value>)',
        'neon-pink': 'rgb(var(--color-neon-pink) / <alpha-value>)',
        
        'bg-primary': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'bg-tertiary': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        'bg-glass': 'rgba(var(--color-bg-glass))',
        
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        
        border: 'rgb(var(--color-border) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'glass': 'var(--shadow-glass)',
        'neon': 'var(--shadow-neon)',
        'glow-primary': 'var(--glow-primary)',
        'glow-secondary': 'var(--glow-secondary)',
        'glow-accent': 'var(--glow-accent)',
        'glow-neon-cyan': 'var(--glow-neon-cyan)',
        'glow-neon-purple': 'var(--glow-neon-purple)',
        'glow-neon-pink': 'var(--glow-neon-pink)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-strong': '24px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: 'var(--glow-primary)' },
          '100%': { boxShadow: '0 0 40px rgb(var(--color-primary) / 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: 'var(--glow-primary)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgb(var(--color-primary) / 0.9)',
            transform: 'scale(1.02)',
          },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      zIndex: {
        'map': 'var(--z-map)',
        'map-overlay': 'var(--z-map-overlay)',
        'nav': 'var(--z-nav)',
        'drawer': 'var(--z-drawer)',
        'drawer-mask': 'var(--z-drawer-mask)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents, theme }) {
      // 添加霓虹效果工具类
      addUtilities({
        '.text-gradient': {
          background: `linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)), rgb(var(--color-accent)))`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass-effect': {
          background: 'rgba(var(--color-bg-glass))',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
        },
        '.glass-strong': {
          background: 'rgba(var(--color-bg-glass))',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
        },
      });

      // 添加霓虹组件
      addComponents({
        '.neon-card': {
          background: 'rgba(var(--color-bg-glass))',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(var(--color-border) / 0.2)',
          'border-radius': 'var(--radius-lg)',
          'box-shadow': 'var(--shadow-glass)',
          transition: 'all 200ms ease-out',
          '&:hover': {
            'box-shadow': 'var(--shadow-neon)',
            transform: 'translateY(-2px)',
          },
        },
        '.neon-button': {
          position: 'relative',
          background: 'rgb(var(--color-primary))',
          color: 'rgb(var(--color-bg-primary))',
          border: 'none',
          'border-radius': 'var(--radius-md)',
          padding: '0.75rem 1.5rem',
          'font-weight': '600',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 200ms ease-out',
          'box-shadow': '0 0 0 0 rgb(var(--color-primary) / 0)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            transition: 'left 600ms ease-out',
          },
          '&:hover': {
            'box-shadow': 'var(--glow-primary)',
            transform: 'translateY(-1px)',
            '&::before': {
              left: '100%',
            },
          },
          '&:focus-visible': {
            outline: '2px solid rgb(var(--color-primary))',
            'outline-offset': '2px',
            'box-shadow': 'var(--glow-primary)',
          },
          '&:active': {
            transform: 'translateY(0)',
            'box-shadow': '0 0 20px rgb(var(--color-primary) / 0.8)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            'box-shadow': 'none',
            transform: 'none',
          },
        },
      });
    },
  ],
}