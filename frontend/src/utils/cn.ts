import clsx, { type ClassValue } from 'clsx';

/**
 * 合并 className 的工具函数
 * 基于 clsx 库，支持条件性 className 和去重
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}