#!/usr/bin/env python3
"""
前端兼容性 API 模块
提供与现有前端代码完全兼容的 API 接口
"""

import csv
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# 创建路由器
router = APIRouter()

# CSV 文件路径
CSV_FILE_PATH = Path(__file__).parent.parent / "data" / "tasks.csv"

# 数据缓存
_tasks_cache: List[Dict[str, Any]] = []
_cache_timestamp: float = 0
_cache_ttl: float = 300  # 5分钟缓存

class TaskLocationResponse(BaseModel):
    """前端期望的任务响应格式"""
    success: bool
    data: List[Dict[str, Any]]
    total: int
    message: str = "数据获取成功"

def load_csv_tasks() -> List[Dict[str, Any]]:
    """
    高性能 CSV 任务加载器
    直接兼容前端 TaskLocation 接口
    """
    global _tasks_cache, _cache_timestamp
    
    # 检查缓存
    current_time = time.time()
    if _tasks_cache and (current_time - _cache_timestamp) < _cache_ttl:
        return _tasks_cache
    
    start_time = time.time()
    tasks = []
    
    try:
        if not CSV_FILE_PATH.exists():
            print(f"⚠️ CSV 文件不存在: {CSV_FILE_PATH}")
            return []
        
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # 转换为前端期望的格式
                task = {
                    "task_id": row.get("task_id", ""),
                    "title": row.get("title", ""),
                    "description": row.get("description", ""),
                    "category": map_category(row.get("category", "")),
                    "difficulty": map_difficulty(row.get("difficulty", "")),
                    "status": map_status(row.get("status", "active")),
                    "location": {
                        "lat": safe_float(row.get("latitude", "0")),
                        "lng": safe_float(row.get("longitude", "0")),
                        "name": row.get("location_name", "")
                    },
                    "rewards": parse_rewards(row.get("rewards", "")),
                    "estimatedTime": safe_int(row.get("estimated_duration", "60")),
                    "course": row.get("course_code", "") if row.get("course_code") else None,
                    "dueDate": format_iso_date(row.get("updated_at")),
                    "createdAt": format_iso_date(row.get("created_at")),
                    "created_at": format_iso_date(row.get("created_at")),
                    "due_date": format_iso_date(row.get("updated_at"))
                }
                tasks.append(task)
        
        # 更新缓存
        _tasks_cache = tasks
        _cache_timestamp = current_time
        
        load_time = time.time() - start_time
        print(f"✅ CSV 加载完成: {len(tasks)} 条任务, 耗时: {load_time:.3f}s")
        
    except Exception as e:
        print(f"❌ CSV 加载失败: {e}")
        return []
    
    return tasks

def map_category(category: str) -> str:
    """映射类别到前端期望值"""
    mapping = {
        "学术研究": "academic",
        "实验任务": "academic",
        "课程任务": "academic",
        "学术讲座": "academic",
        "志愿服务": "social",
        "社团活动": "social",
        "社交活动": "social",
        "文化活动": "social",
        "校园活动": "campus",
        "体育锻炼": "campus",
        "后勤支持": "campus",
        "迎新活动": "campus",
        "竞赛活动": "academic",
        "讲座活动": "academic"
    }
    return mapping.get(category, "campus")

def map_difficulty(difficulty: str) -> str:
    """映射难度到前端期望值"""
    mapping = {
        "初级": "easy",
        "简单": "easy",
        "中级": "medium",
        "中等": "medium",
        "高级": "hard",
        "困难": "hard"
    }
    return mapping.get(difficulty, "easy")

def map_status(status: str) -> str:
    """映射状态到前端期望值"""
    mapping = {
        "active": "available",
        "可用": "available",
        "available": "available",
        "进行中": "in_progress",
        "in_progress": "in_progress",
        "已完成": "completed",
        "completed": "completed"
    }
    return mapping.get(status, "available")

def parse_rewards(rewards_str: str) -> List[str]:
    """解析奖励字符串"""
    if not rewards_str or rewards_str.lower() in ["无", "nan", ""]:
        return ["探索徽章", "10积分"]
    
    rewards = []
    if "学分" in rewards_str:
        rewards.append("学分奖励")
    if "经验" in rewards_str or "经验值" in rewards_str:
        rewards.append("经验值")
    if "徽章" in rewards_str:
        rewards.append("成就徽章")
    if "时长" in rewards_str:
        rewards.append("志愿时长")
    if "积分" in rewards_str:
        rewards.append("积分奖励")
    
    return rewards if rewards else ["探索徽章", "10积分"]

def safe_float(value: str, default: float = 0.0) -> float:
    """安全转换为浮点数"""
    try:
        return float(value) if value else default
    except (ValueError, TypeError):
        return default

def safe_int(value: str, default: int = 60) -> int:
    """安全转换为整数"""
    try:
        return int(float(value)) if value else default
    except (ValueError, TypeError):
        return default

def format_iso_date(date_str: str) -> Optional[str]:
    """格式化日期为 ISO 格式"""
    if not date_str or date_str.lower() in ["nan", ""]:
        return None
    
    try:
        # 如果已经是 ISO 格式
        if "T" in date_str and "Z" in date_str:
            return date_str
        
        # 尝试解析并转换
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.isoformat() + "Z"
    except Exception:
        return None

# API 端点
@router.get("/tasks", response_model=TaskLocationResponse)
async def get_frontend_tasks(
    category: Optional[str] = Query(None, description="任务类别筛选"),
    difficulty: Optional[str] = Query(None, description="难度筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    course: Optional[str] = Query(None, description="课程筛选"),
    limit: Optional[int] = Query(None, description="限制数量"),
    offset: Optional[int] = Query(0, description="偏移量")
):
    """
    获取任务列表 - 前端兼容接口
    完全兼容现有前端 TaskLocation 接口
    """
    start_time = time.time()
    
    try:
        # 加载所有任务
        all_tasks = load_csv_tasks()
        
        if not all_tasks:
            return TaskLocationResponse(
                success=False,
                data=[],
                total=0,
                message="暂无任务数据"
            )
        
        # 应用筛选
        filtered_tasks = all_tasks
        
        if category:
            filtered_tasks = [t for t in filtered_tasks if t["category"] == category]
        
        if difficulty:
            filtered_tasks = [t for t in filtered_tasks if t["difficulty"] == difficulty]
        
        if status:
            filtered_tasks = [t for t in filtered_tasks if t["status"] == status]
        
        if course:
            filtered_tasks = [t for t in filtered_tasks if t.get("course") == course]
        
        # 应用分页
        total = len(filtered_tasks)
        
        if limit:
            end_index = offset + limit
            filtered_tasks = filtered_tasks[offset:end_index]
        elif offset > 0:
            filtered_tasks = filtered_tasks[offset:]
        
        response_time = time.time() - start_time
        print(f"📊 前端API响应: {len(filtered_tasks)}/{total} 条任务, 耗时: {response_time:.3f}s")
        
        return TaskLocationResponse(
            success=True,
            data=filtered_tasks,
            total=total,
            message=f"成功获取 {len(filtered_tasks)} 条任务"
        )
        
    except Exception as e:
        print(f"❌ 前端API错误: {e}")
        raise HTTPException(status_code=500, detail=f"获取任务失败: {str(e)}")

@router.get("/tasks/{task_id}")
async def get_frontend_task(task_id: str):
    """获取单个任务详情 - 前端兼容接口"""
    try:
        tasks = load_csv_tasks()
        
        for task in tasks:
            if task["task_id"] == task_id:
                return {
                    "success": True,
                    "data": task,
                    "message": "任务获取成功"
                }
        
        raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 获取任务详情失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取任务详情失败: {str(e)}")

@router.get("/health")
async def frontend_health():
    """健康检查 - 前端兼容接口"""
    tasks = load_csv_tasks()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "csv_file_exists": CSV_FILE_PATH.exists(),
        "total_tasks": len(tasks),
        "message": "后端服务运行正常"
    }

@router.get("/stats")
async def get_stats():
    """获取统计信息"""
    tasks = load_csv_tasks()
    
    # 统计各类别任务数量
    categories = {}
    difficulties = {}
    statuses = {}
    courses = set()
    
    for task in tasks:
        # 类别统计
        cat = task["category"]
        categories[cat] = categories.get(cat, 0) + 1
        
        # 难度统计
        diff = task["difficulty"]
        difficulties[diff] = difficulties.get(diff, 0) + 1
        
        # 状态统计
        status = task["status"]
        statuses[status] = statuses.get(status, 0) + 1
        
        # 课程收集
        if task.get("course"):
            courses.add(task["course"])
    
    return {
        "total_tasks": len(tasks),
        "categories": categories,
        "difficulties": difficulties,
        "statuses": statuses,
        "total_courses": len(courses),
        "courses": sorted(list(courses)),
        "cache_info": {
            "cached": len(_tasks_cache) > 0,
            "cache_age": time.time() - _cache_timestamp if _cache_timestamp > 0 else 0,
            "cache_ttl": _cache_ttl
        }
    }