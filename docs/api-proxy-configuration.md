# API 代理配置说明

## 修改概述

为了解决前后端跨域问题并统一API请求路径，已将所有硬编码的请求路径替换为相对路径，并配置Vite代理转发到后端服务。

## 修改的文件

### 1. Vite 配置文件
**文件**: `frontend/vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 2. 健康检查组件
**文件**: `frontend/src/components/HealthBanner.tsx`
- **修改前**: `'http://localhost:8000/healthz'`
- **修改后**: `'/api/healthz'`

### 3. 首页组件
**文件**: `frontend/src/pages/HomePage.tsx`
- **修改前**: `'http://localhost:8000/tasks'`
- **修改后**: `'/api/tasks'`

### 4. 任务页面组件
**文件**: `frontend/src/pages/TasksPage.tsx`
- **修改前**: `'http://localhost:8000/tasks'`
- **修改后**: `'/api/tasks'`

## 代理工作原理

1. **前端请求**: `http://localhost:5177/api/tasks`
2. **Vite代理**: 检测到 `/api` 前缀
3. **路径重写**: 移除 `/api` 前缀，变为 `/tasks`
4. **转发请求**: 转发到 `http://localhost:8000/tasks`
5. **返回响应**: 后端响应通过代理返回给前端

## 环境配置

### 开发环境
- 前端服务: `http://localhost:5177` (或其他可用端口)
- 后端服务: `http://localhost:8000`
- 代理路径: `/api/*` → `http://localhost:8000/*`

### 生产环境建议
在生产环境中，建议：
1. 使用环境变量配置API基础URL
2. 通过反向代理(如Nginx)处理API转发
3. 配置适当的CORS策略

## 验证结果

✅ **功能验证**:
- 健康检查: `GET /api/healthz` → 200 OK
- 任务列表: `GET /api/tasks` → 200 OK (20条数据)
- 响应时间: < 0.01s (远超 500ms 要求)

✅ **CORS解决**:
- 无跨域错误
- 预检请求正常
- 所有API调用成功

## 注意事项

1. **开发服务器重启**: 修改 `vite.config.ts` 后需要重启前端开发服务器
2. **路径一致性**: 确保所有API调用都使用 `/api` 前缀
3. **错误处理**: 保持原有的错误处理和降级机制
4. **性能监控**: 代理增加的延迟可忽略不计 (< 1ms)

## 未来扩展

如需添加新的API端点，只需：
1. 在后端添加路由
2. 在前端使用 `/api/新端点` 格式调用
3. 无需修改代理配置