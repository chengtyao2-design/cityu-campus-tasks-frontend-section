import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 动态API基础URL配置
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  
  // Cloud Studio动态URL支持
  const X_IDE_SPACE_KEY = process.env.X_IDE_SPACE_KEY;
  const X_IDE_SPACE_REGION = process.env.X_IDE_SPACE_REGION;
  const X_IDE_SPACE_HOST = process.env.X_IDE_SPACE_HOST;
  
  if (X_IDE_SPACE_KEY && X_IDE_SPACE_REGION && X_IDE_SPACE_HOST) {
    return `https://${X_IDE_SPACE_KEY}--8000.${X_IDE_SPACE_REGION}.${X_IDE_SPACE_HOST}`;
  }
  
  // 默认本地开发环境
  return 'http://localhost:8000';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: getApiBaseUrl(),
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // 允许自签名证书
      }
    }
  }
})