import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drawer, Tabs, Button, Space, Typography, Divider, Tag, Avatar, message } from 'antd';
import { 
  CloseOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  UserOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { TaskLocation } from '../../data/seedTasks';
import ChatPanel from './ChatPanel';
import { cn } from '../../utils/cn';
import { lockScroll, unlockScroll } from '../../utils/scrollLock';

const { Title, Text, Paragraph } = Typography;

interface TaskDrawerProps {
  task: TaskLocation | null;
  open: boolean;
  onClose: () => void;
  onOpenOnMap?: (task: TaskLocation) => void;
  mask?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  forceRender?: boolean;
}

const TaskDrawer: React.FC<TaskDrawerProps> = ({
  task,
  open,
  onClose,
  onOpenOnMap,
  mask = true,
  maskClosable = true,
  keyboard = true,
  destroyOnClose = false,
  forceRender = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('details');
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // 保存触发元素的引用，用于焦点归还
  useEffect(() => {
    if (open) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  // 滚动锁定管理
  useEffect(() => {
    if (open && mask) {
      lockScroll();
    }

    return () => {
      if (open && mask) {
        unlockScroll();
      }
    };
  }, [open, mask]);

  const handleClose = useCallback(() => {
    // 归还焦点
    if (triggerElementRef.current) {
      triggerElementRef.current.focus();
    }
    onClose();
  }, [onClose]);

  const handleTaskAction = useCallback((action: 'start' | 'complete' | 'view_on_map') => {
    if (!task) return;

    switch (action) {
      case 'start':
        message.success(`开始任务: ${task.title}`);
        break;
      case 'complete':
        message.success(`完成任务: ${task.title}`);
        break;
      case 'view_on_map':
        onOpenOnMap?.(task);
        message.info(`在地图上查看: ${task.title}`);
        break;
    }
  }, [task, onOpenOnMap]);

  const tabItems = [
    {
      key: 'details',
      label: (
        <span className="flex items-center gap-2">
          <InfoCircleOutlined />
          任务详情
        </span>
      ),
    },
    {
      key: 'chat',
      label: (
        <span className="flex items-center gap-2">
          <MessageOutlined />
          任务助手
        </span>
      ),
    },
  ];

  if (!task) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            size={40}
            icon={<EnvironmentOutlined />}
            className="flex-shrink-0"
            style={{
              background: `rgb(var(--color-${task.difficulty === 'easy' ? 'success' : task.difficulty === 'medium' ? 'warning' : 'error'}))`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-text-primary truncate">
              {task.title}
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Tag
                color={task.difficulty === 'easy' ? 'green' : task.difficulty === 'medium' ? 'orange' : 'red'}
                className="!m-0"
              >
                {task.difficulty === 'easy' ? '简单' : task.difficulty === 'medium' ? '中等' : '困难'}
              </Tag>
              <span>•</span>
              <span>{task.category}</span>
            </div>
          </div>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      width={420}
      className="task-drawer"
      mask={mask}
      maskClosable={maskClosable}
      keyboard={keyboard}
      destroyOnClose={destroyOnClose}
      forceRender={forceRender}
      styles={{
        body: { 
          padding: 0,
          overscrollBehavior: 'contain'
        },
        header: {
          borderBottom: '1px solid var(--color-border)',
          padding: '16px 24px',
        },
        mask: {
          zIndex: 'var(--z-drawer-mask)',
        },
        wrapper: {
          zIndex: 'var(--z-drawer)',
        }
      }}
    >
      {/* 标签导航 */}
      <div className="px-6 pt-4 bg-bg-secondary border-b border-border/10">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="drawer-tabs"
          size="small"
        />
      </div>

      {/* 抽屉内容 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto drawer-content-scroll">
            <div className="p-6 space-y-6">
              {/* 任务描述 */}
              <div>
                <Title level={5} className="mb-3 text-text-primary">
                  任务描述
                </Title>
                <Paragraph className="text-text-secondary mb-0">
                  {task.description || '这是一个精彩的校园任务，等待你来探索和完成。'}
                </Paragraph>
              </div>

              <Divider className="my-4" />

              {/* 任务信息 */}
              <div className="space-y-4">
                <Title level={5} className="mb-3 text-text-primary">
                  任务信息
                </Title>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvironmentOutlined className="text-primary flex-shrink-0" />
                    <div>
                      <Text className="text-text-secondary text-sm block">位置</Text>
                      <Text className="text-text-primary">
                        {task.location?.name || `${task.location?.lat.toFixed(4)}, ${task.location?.lng.toFixed(4)}`}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-secondary flex-shrink-0" />
                    <div>
                      <Text className="text-text-secondary text-sm block">预计用时</Text>
                      <Text className="text-text-primary">30-60分钟</Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserOutlined className="text-accent flex-shrink-0" />
                    <div>
                      <Text className="text-text-secondary text-sm block">参与人数</Text>
                      <Text className="text-text-primary">1-4人</Text>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* 快速操作 */}
              <div>
                <Title level={5} className="mb-3 text-text-primary">
                  快速操作
                </Title>
                <Space direction="vertical" className="w-full" size="small">
                  {task.status === 'available' && (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleTaskAction('start')}
                      className="w-full h-10"
                      size="large"
                    >
                      开始任务
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleTaskAction('complete')}
                      className="w-full h-10"
                      size="large"
                    >
                      完成任务
                    </Button>
                  )}

                  <Button
                    icon={<EnvironmentOutlined />}
                    onClick={() => handleTaskAction('view_on_map')}
                    className="w-full h-10"
                    size="large"
                  >
                    在地图上查看
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 px-6">
            <ChatPanel
              task={task}
              className="flex-1 min-h-0"
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TaskDrawer;