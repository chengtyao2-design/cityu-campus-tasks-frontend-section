/**
 * 滚动锁定工具函数
 * 用于在模态框、抽屉等组件打开时锁定页面滚动
 * 支持滚动条补偿，避免内容闪动
 */

let scrollY = 0;
let isLocked = false;
let scrollbarWidth = 0;

/**
 * 获取滚动条宽度
 */
const getScrollbarWidth = (): number => {
  if (scrollbarWidth > 0) return scrollbarWidth;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);
  
  return scrollbarWidth;
};

/**
 * 锁定页面滚动
 */
export const lockScroll = (): void => {
  if (isLocked) return;

  const html = document.documentElement;
  const body = document.body;
  
  // 保存当前滚动位置
  scrollY = window.scrollY;
  
  // 获取滚动条宽度进行补偿
  const scrollbarWidthValue = getScrollbarWidth();
  
  // 锁定滚动，不改变文档偏移
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  
  // 滚动条补偿，避免内容闪动
  if (scrollbarWidthValue > 0) {
    body.style.paddingRight = `${scrollbarWidthValue}px`;
  }
  
  // 添加锁定类
  html.classList.add('scroll-locked');
  
  isLocked = true;
};

/**
 * 解锁页面滚动
 */
export const unlockScroll = (): void => {
  if (!isLocked) return;

  const html = document.documentElement;
  const body = document.body;
  
  // 恢复滚动
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.overflow = '';
  body.style.paddingRight = '';
  
  // 移除锁定类
  html.classList.remove('scroll-locked');
  
  // 恢复滚动位置
  window.scrollTo(0, scrollY);
  
  isLocked = false;
};

/**
 * 获取当前锁定状态
 */
export const isScrollLocked = (): boolean => {
  return isLocked;
};

/**
 * React Hook for scroll lock
 */
export const useScrollLock = () => {
  return {
    lockScroll,
    unlockScroll,
    isScrollLocked,
  };
};