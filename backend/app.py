#!/usr/bin/env python3
"""
CityU Campus Tasks Backend Service - 启动脚本
单命令启动: python app.py
"""

import os
import sys
import uvicorn
from pathlib import Path

# 添加当前目录到 Python 路径
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def main():
    """主启动函数"""
    # 设置环境变量
    os.environ.setdefault("PYTHONPATH", str(current_dir))
    
    # 启动配置
    config = {
        "app": "main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True,
        "reload_dirs": [str(current_dir)],
        "log_level": "info",
        "access_log": True,
    }
    
    print("🚀 启动 CityU Campus Tasks Backend Service")
    print(f"📍 服务地址: http://localhost:{config['port']}")
    print(f"📚 API 文档: http://localhost:{config['port']}/docs")
    print(f"🔄 自动重载: {'开启' if config['reload'] else '关闭'}")
    print("=" * 50)
    
    # 启动服务
    uvicorn.run(**config)

if __name__ == "__main__":
    main()