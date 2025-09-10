# 动态URL部署配置说明

## 概述

本项目已支持动态URL配置，可在不同环境（本地开发、Cloud Studio、生产环境）中自动适配URL，无需手动修改配置文件。

## 配置原理

### 环境变量检测
系统会自动检测以下环境变量：
- `X_IDE_SPACE_KEY`: 空间标识符
- `X_IDE_SPACE_REGION`: 区域标识符  
- `X_IDE_SPACE_HOST`: 主机域名

当这三个变量都存在时，系统会自动生成动态URL。

### URL生成规则
```
后端服务: https://${X_IDE_SPACE_KEY}--8000.${X_IDE_SPACE_REGION}.${X_IDE_SPACE_HOST}
前端服务: https://${X_IDE_SPACE_KEY}--5173.${X_IDE_SPACE_REGION}.${X_IDE_SPACE_HOST}
```

## 已修改的文件

### 1. Docker Compose配置 (`docker-compose.yml`)
```yaml
services:
  backend:
    environment:
      # 动态URL环境变量支持
      - X_IDE_SPACE_KEY=${X_IDE_SPACE_KEY:-}
      - X_IDE_SPACE_REGION=${X_IDE_SPACE_REGION:-}
      - X_IDE_SPACE_HOST=${X_IDE_SPACE_HOST:-}
  
  frontend:
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}
      # 动态URL环境变量支持
      - X_IDE_SPACE_KEY=${X_IDE_SPACE_KEY:-}
      - X_IDE_SPACE_REGION=${X_IDE_SPACE_REGION:-}
      - X_IDE_SPACE_HOST=${X_IDE_SPACE_HOST:-}
```

### 2. 后端CORS配置 (`backend/main.py`)
```python
# 动态URL支持 - Cloud Studio等环境
X_IDE_SPACE_KEY = os.getenv('X_IDE_SPACE_KEY', '')
X_IDE_SPACE_REGION = os.getenv('X_IDE_SPACE_REGION', '')
X_IDE_SPACE_HOST = os.getenv('X_IDE_SPACE_HOST', '')

if all([X_IDE_SPACE_KEY, X_IDE_SPACE_REGION, X_IDE_SPACE_HOST]):
    # 添加动态前端URL
    dynamic_origins = [
        f"https://{X_IDE_SPACE_KEY}--3000.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
        f"https://{X_IDE_SPACE_KEY}--5173.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
        f"https://{X_IDE_SPACE_KEY}--5174.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
        f"https://{X_IDE_SPACE_KEY}--5175.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
        f"https://{X_IDE_SPACE_KEY}--5176.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
        f"https://{X_IDE_SPACE_KEY}--5177.{X_IDE_SPACE_REGION}.{X_IDE_SPACE_HOST}",
    ]
    origins.extend(dynamic_origins)
```

### 3. 前端代理配置 (`frontend/vite.config.ts`)
```typescript
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
```

## 部署方式

### 1. 本地开发环境
无需任何配置，系统会自动使用 `localhost` 地址：
```bash
# 启动后端
cd backend && python app.py

# 启动前端
cd frontend && npm run dev
```

### 2. Cloud Studio环境
系统会自动检测环境变量并生成动态URL：
```bash
# 环境变量会自动设置，无需手动配置
docker-compose up
```

### 3. 自定义环境
可通过环境变量手动指定：
```bash
# 设置环境变量
export X_IDE_SPACE_KEY=your-space-key
export X_IDE_SPACE_REGION=your-region
export X_IDE_SPACE_HOST=your-host

# 或者直接指定API URL
export VITE_API_BASE_URL=https://your-api-url

# 启动服务
docker-compose up
```

## 验证配置

### 1. 检查后端CORS配置
启动后端服务后，查看日志中的CORS配置：
```
添加动态CORS源: ['https://abc123--3000.us-west.cloudstudio.net', ...]
```

### 2. 检查前端代理配置
前端服务启动时会显示代理目标：
```
proxy /api -> https://abc123--8000.us-west.cloudstudio.net
```

### 3. 测试API连接
访问前端页面，查看数据源指示器：
- ✅ "🔗 已连接后端服务，显示实时CSV数据" - 配置成功
- ⚠️ "📱 离线模式，显示本地演示数据" - 需要检查配置

## 优势

✅ **零配置**: 本地开发无需任何配置
✅ **自动适配**: Cloud Studio等环境自动检测
✅ **向后兼容**: 不影响现有部署方式
✅ **灵活配置**: 支持手动覆盖URL
✅ **多端口支持**: 自动支持常用开发端口
✅ **HTTPS支持**: 自动处理SSL证书问题

## 故障排除

### 问题1: CORS错误
**解决方案**: 检查环境变量是否正确设置，确保前端URL在后端CORS列表中

### 问题2: API连接失败
**解决方案**: 
1. 检查 `VITE_API_BASE_URL` 环境变量
2. 确认后端服务正常运行
3. 验证网络连接和防火墙设置

### 问题3: 动态URL未生效
**解决方案**: 
1. 确认三个环境变量都已设置
2. 重启服务以加载新的环境变量
3. 检查日志中的URL生成信息