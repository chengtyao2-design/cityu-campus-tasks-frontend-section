import React, { useState } from 'react';
import { Button, Space, Card, message } from 'antd';
import { EnvironmentOutlined, MessageOutlined, BulbOutlined } from '@ant-design/icons';
import LeafletMap from '../components/Map/LeafletMap';
import TaskDrawer from '../components/Task/TaskDrawer';
import { seedTasks, TaskLocation } from '../data/seedTasks';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import NeonCard from '../components/common/NeonCard';

const TestPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDark } = useTheme();

  const handleTaskSelect = (task: TaskLocation) => {
    setSelectedTask(task);
    setDrawerOpen(true);
    message.success(`选择了任务: ${task.title}`);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedTask(null);
  };

  const handleOpenOnMap = (task: TaskLocation) => {
    message.info(`在地图上查看: ${task.title}`);
  };

  const testTasks = seedTasks.slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 页面标题和主题切换 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              功能测试页面
            </h1>
            <p className="text-text-secondary">
              测试地图交互、抽屉功能、聊天系统和主题切换
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              当前主题: {isDark ? '深色' : '浅色'}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* 功能测试卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NeonCard className="p-6">
            <div className="text-center space-y-4">
              <EnvironmentOutlined className="text-4xl text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">地图交互测试</h3>
              <p className="text-text-secondary text-sm">
                点击地图上的标记测试抽屉打开功能
              </p>
              <div className="text-xs text-text-muted">
                ✓ 地图标记点击<br/>
                ✓ 聚合功能<br/>
                ✓ 层级管理
              </div>
            </div>
          </NeonCard>

          <NeonCard className="p-6">
            <div className="text-center space-y-4">
              <MessageOutlined className="text-4xl text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">聊天功能测试</h3>
              <p className="text-text-secondary text-sm">
                在抽屉中测试任务助手聊天功能
              </p>
              <div className="text-xs text-text-muted">
                ✓ 社交聊天样式<br/>
                ✓ 固定输入区域<br/>
                ✓ API交互
              </div>
            </div>
          </NeonCard>

          <NeonCard className="p-6">
            <div className="text-center space-y-4">
              <BulbOutlined className="text-4xl text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">可访问性测试</h3>
              <p className="text-text-secondary text-sm">
                测试WCAG AA对比度和键盘导航
              </p>
              <div className="text-xs text-text-muted">
                ✓ 对比度标准<br/>
                ✓ 键盘导航<br/>
                ✓ 屏幕阅读器
              </div>
            </div>
          </NeonCard>
        </div>

        {/* 快速测试按钮 */}
        <NeonCard className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">快速测试</h3>
          <Space wrap>
            {testTasks.map((task) => (
              <Button
                key={task.task_id}
                type="default"
                onClick={() => handleTaskSelect(task)}
                className="!rounded-lg"
              >
                测试: {task.title}
              </Button>
            ))}
          </Space>
        </NeonCard>

        {/* 地图区域 */}
        <NeonCard className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            交互式地图测试
          </h3>
          <div className="rounded-lg overflow-hidden">
            <LeafletMap
              tasks={testTasks}
              onTaskSelect={handleTaskSelect}
              selectedTaskId={selectedTask?.task_id}
              height="500px"
              enableClustering={true}
            />
          </div>
        </NeonCard>

        {/* 测试说明 */}
        <NeonCard className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">测试说明</h3>
          <div className="space-y-4 text-text-secondary">
            <div>
              <h4 className="font-medium text-text-primary mb-2">1. 地图标记点击测试</h4>
              <p className="text-sm">点击地图上的任务标记，应该稳定打开右侧信息抽屉，不会被地图层遮挡。</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">2. 滚动锁定测试</h4>
              <p className="text-sm">抽屉打开时，页面背景应该禁止滚动，滚轮只影响抽屉内部内容。</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">3. 聊天功能测试</h4>
              <p className="text-sm">在抽屉的"任务助手"标签中测试聊天功能，包括发送消息、重试失败消息等。</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">4. 主题切换测试</h4>
              <p className="text-sm">使用右上角的主题切换按钮测试深浅主题切换，确保对比度符合WCAG AA标准。</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary mb-2">5. 键盘导航测试</h4>
              <p className="text-sm">使用Tab键导航，确保所有交互元素都有清晰的焦点样式。</p>
            </div>
          </div>
        </NeonCard>

        {/* 任务抽屉 - 使用Portal挂载到body */}
        <TaskDrawer
          task={selectedTask}
          open={drawerOpen}
          onClose={handleDrawerClose}
          onOpenOnMap={handleOpenOnMap}
          mask={true}
          maskClosable={true}
          keyboard={true}
        />
      </div>
    </div>
  );
};

export default TestPage;