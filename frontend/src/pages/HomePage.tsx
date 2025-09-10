import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import HealthBanner from '../components/HealthBanner';

interface Task {
  task_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status?: string;
}

const HomePage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.data || []);
        } else {
          // 如果后端不可用，使用模拟数据
          setTasks(getMockTasks());
        }
      } catch (error) {
        // 静默处理错误，使用模拟数据
        setTasks(getMockTasks());
      } finally {
        setLoading(false);
      }
    };

    // 延迟获取，避免页面加载时立即报错
    const timer = setTimeout(fetchTasks, 500);
    return () => clearTimeout(timer);
  }, []);

  // 模拟任务数据
  const getMockTasks = (): Task[] => [
    {
      task_id: 'demo-001',
      title: '参观图书馆',
      description: '熟悉图书馆的各个区域和借阅流程',
      category: 'campus',
      difficulty: 'easy',
      status: 'available'
    },
    {
      task_id: 'demo-002', 
      title: '加入学生社团',
      description: '选择一个感兴趣的社团并参加活动',
      category: 'social',
      difficulty: 'medium',
      status: 'available'
    },
    {
      task_id: 'demo-003',
      title: '完成第一次作业',
      description: '按时提交高质量的课程作业',
      category: 'academic',
      difficulty: 'medium',
      status: 'in_progress'
    },
    {
      task_id: 'demo-004',
      title: '参加学术讲座',
      description: '参加至少3场学术讲座并撰写心得',
      category: 'academic', 
      difficulty: 'hard',
      status: 'available'
    },
    {
      task_id: 'demo-005',
      title: '校园导览',
      description: '探索校园的每个角落，了解各个建筑的功能',
      category: 'campus',
      difficulty: 'easy',
      status: 'completed'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic': return <CheckCircleOutlined />;
      case 'social': return <UserOutlined />;
      case 'campus': return <FireOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="space-y-6">
      <HealthBanner />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold title-gradient mb-4">
          欢迎来到 CityU Campus Tasks
        </h1>
        <p className="text-lg text-adaptive-secondary max-w-2xl mx-auto">
          开放世界地图 × NPC 智能体校园任务系统，让你的校园生活更加精彩有趣
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="neon-stat-card">
            <Statistic
              title="总任务数"
              value={tasks.length}
              prefix={<AppstoreOutlined className="text-theme-primary" />}
              valueStyle={{ color: 'rgb(var(--color-primary))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="neon-stat-card">
            <Statistic
              title="已完成"
              value={tasks.filter(t => t.status === 'completed').length}
              prefix={<CheckCircleOutlined className="text-theme-success" />}
              valueStyle={{ color: 'rgb(var(--color-success))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="neon-stat-card">
            <Statistic
              title="进行中"
              value={tasks.filter(t => t.status === 'in_progress').length}
              prefix={<ClockCircleOutlined className="text-theme-accent" />}
              valueStyle={{ color: 'rgb(var(--color-warning))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="neon-stat-card">
            <Statistic
              title="热门任务"
              value={tasks.filter(t => t.difficulty === 'hard').length}
              prefix={<FireOutlined className="text-theme-accent" />}
              valueStyle={{ color: 'rgb(var(--color-error))' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="最新任务" 
            className="h-full"
            extra={<a href="/tasks">查看全部</a>}
          >
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4 text-adaptive-muted">加载任务中...</p>
              </div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={tasks.slice(0, 5)}
                renderItem={(task) => (
                  <List.Item
                    className="neon-list-item"
                    actions={[
                      <Tag color={getDifficultyColor(task.difficulty)} key="difficulty">
                        {task.difficulty}
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<span className="text-theme-primary">{getCategoryIcon(task.category)}</span>}
                      title={<span className="font-medium text-adaptive-primary">{task.title}</span>}
                      description={
                        <div className="text-sm text-adaptive-secondary">
                          <p className="mb-1">{task.description}</p>
                          <Tag>{task.category}</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无任务数据' }}
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="快速操作" className="mb-4">
            <div className="space-y-3">
              <button className="neon-action-card neon-action-card-primary">
                <div className="font-medium text-theme-primary">浏览任务地图</div>
                <div className="text-sm text-adaptive-secondary">查看校园任务分布</div>
              </button>
              <button className="neon-action-card neon-action-card-success">
                <div className="font-medium text-theme-success">我的进度</div>
                <div className="text-sm text-adaptive-secondary">查看完成情况</div>
              </button>
              <button className="neon-action-card neon-action-card-accent">
                <div className="font-medium text-theme-accent">NPC 对话</div>
                <div className="text-sm text-adaptive-secondary">与智能体互动</div>
              </button>
            </div>
          </Card>

          <Card title="系统状态">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-adaptive-secondary">前端服务</span>
                <div className="flex items-center gap-2">
                  <div className="status-indicator-online"></div>
                  <span className="text-sm text-theme-success">运行中</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-adaptive-secondary">TypeScript</span>
                <div className="flex items-center gap-2">
                  <div className="status-indicator-online"></div>
                  <span className="text-sm text-theme-success">已启用</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-adaptive-secondary">移动端适配</span>
                <div className="flex items-center gap-2">
                  <div className="status-indicator-online"></div>
                  <span className="text-sm text-theme-success">已优化</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;