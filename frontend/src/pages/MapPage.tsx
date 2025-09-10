import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Row, Col, Statistic, Button, Space, message, Alert } from 'antd';
import NeonCard from '../components/common/NeonCard';
import { 
  EnvironmentOutlined, 
  UnorderedListOutlined,
  FullscreenOutlined,
  CloseOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import LeafletMap from '../components/Map/LeafletMap';
import MapLegend from '../components/Map/MapLegend';
import TaskFilters, { FilterState } from '../components/Filters/TaskFilters';
import TaskListView from '../components/TaskList/TaskListView';
import { seedTasks, TaskLocation, CITYU_CENTER } from '../data/seedTasks';
import { filterTasks, getUniqueValues, getAvailableCourses, debounceFilter } from '../utils/filterUtils';
import TaskDrawer from '../components/Task/TaskDrawer';

// Data adapter: Transform API response to TaskLocation format
const transformApiDataToTaskLocation = (apiTasks: any[]): TaskLocation[] => {
  return apiTasks.map((task, index) => ({
    task_id: task.task_id || `api-${index}`,
    title: task.title || '未命名任务',
    description: task.description || '暂无描述',
    category: task.category as 'academic' | 'social' | 'campus' || 'campus',
    difficulty: task.difficulty as 'easy' | 'medium' | 'hard' || 'medium',
    status: task.status as 'available' | 'in_progress' | 'completed' || 'available',
    location: task.location || {
      lat: CITYU_CENTER.lat + (Math.random() - 0.5) * 0.01,
      lng: CITYU_CENTER.lng + (Math.random() - 0.5) * 0.01,
      name: task.location?.name || '校园位置'
    },
    rewards: task.rewards,
    estimatedTime: task.estimatedTime || task.estimated_time,
    course: task.course,
    dueDate: task.dueDate || task.due_date,
    createdAt: task.createdAt || task.created_at,
    created_at: task.created_at || task.createdAt,
    due_date: task.due_date || task.dueDate
  }));
};

const MapPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    difficulties: [],
    statuses: [],
    courses: [],
    timeRange: 'all',
    customDateRange: null,
    searchText: ''
  });
  
  const [selectedTask, setSelectedTask] = useState<TaskLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('split');
  const [isFiltering, setIsFiltering] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Data source management
  const [tasks, setTasks] = useState<TaskLocation[]>(seedTasks);
  const [dataSource, setDataSource] = useState<'api' | 'local' | 'loading'>('loading');
  const [dataError, setDataError] = useState<string | null>(null);

  // Data fetching with graceful fallback
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setDataSource('loading');
        setDataError(null);
        
        const response = await fetch('/api/tasks', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`API响应错误: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('API数据格式错误');
        }
        
        const transformedTasks = transformApiDataToTaskLocation(data.data);
        setTasks(transformedTasks);
        setDataSource('api');
        console.log('✅ 地图数据来源: 后端CSV API');
        
      } catch (error) {
        console.warn('⚠️ API获取失败，降级到本地数据:', error);
        setTasks(seedTasks);
        setDataSource('local');
        setDataError(error instanceof Error ? error.message : '未知错误');
      }
    };

    // Delay to avoid immediate error flash
    const timer = setTimeout(fetchTasks, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get unique values for filters (now based on dynamic tasks)
  const categories = useMemo(() => getUniqueValues(tasks, 'category'), [tasks]);
  const difficulties = useMemo(() => getUniqueValues(tasks, 'difficulty'), [tasks]);
  const statuses = useMemo(() => getUniqueValues(tasks, 'status'), [tasks]);
  const courses = useMemo(() => getAvailableCourses(tasks), [tasks]);

  // Debounced filter function for performance
  const debouncedFilter = useMemo(
    () => debounceFilter((newFilters: FilterState) => {
      setFilters(newFilters);
      setIsFiltering(false);
    }, 300),
    []
  );

  // Handle filter changes with debounce
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setIsFiltering(true);
    debouncedFilter(newFilters);
  }, [debouncedFilter]);

  // Filter tasks based on current filters (now using dynamic tasks)
  const filteredTasks = useMemo(() => {
    const startTime = performance.now();
    const result = filterTasks(tasks, filters);
    const endTime = performance.now();
    
    // Log performance for debugging
    if (endTime - startTime > 300) {
      console.warn(`Filter performance warning: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  }, [tasks, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const available = filteredTasks.filter(t => t.status === 'available').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    
    return { total, available, inProgress, completed };
  }, [filteredTasks]);

  const handleTaskSelect = useCallback((task: TaskLocation) => {
    setSelectedTask(task);
    setDrawerOpen(true);
    setDrawerVisible(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setDrawerVisible(false);
    setSelectedTask(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (selectedTask) {
      setDrawerVisible(!drawerVisible);
      setDrawerOpen(!drawerOpen);
    }
  }, [selectedTask, drawerVisible, drawerOpen]);

  const handleTaskAction = useCallback((task: TaskLocation, action: 'view' | 'start') => {
    if (action === 'view') {
      setSelectedTask(task);
      message.info(`查看任务: ${task.title}`);
    } else if (action === 'start') {
      message.success(`开始任务: ${task.title}`);
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const mapHeight = isFullscreen ? '80vh' : '500px';

  // Data source indicator component
  const DataSourceIndicator = () => {
    if (dataSource === 'loading') {
      return (
        <Alert
          message="正在加载任务数据..."
          type="info"
          showIcon
          className="mb-4"
        />
      );
    }
    
    return (
      <Alert
        message={
          <div className="flex items-center justify-between">
            <span>
              {dataSource === 'api' 
                ? '🔗 已连接后端服务，显示实时CSV数据' 
                : '📱 离线模式，显示本地演示数据'
              }
            </span>
            <span className="text-sm opacity-75">
              {dataSource === 'api' 
                ? `${tasks.length} 条任务来自后端` 
                : `${tasks.length} 条本地任务`
              }
            </span>
          </div>
        }
        type={dataSource === 'api' ? 'success' : 'warning'}
        showIcon
        className="mb-4"
      />
    );
  };

  return (
    <div className="space-y-6">
      <DataSourceIndicator />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-primary">
          <EnvironmentOutlined className="text-secondary" />
          校园任务地图
        </h1>
        <p className="text-text-secondary">探索 CityU 校园，发现精彩任务</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <NeonCard>
            <Statistic
              title={<span className="text-text-secondary">总任务</span>}
              value={stats.total}
              prefix={<EnvironmentOutlined className="text-primary" />}
              valueStyle={{ color: 'rgb(var(--color-primary))', fontWeight: 600 }}
              loading={isFiltering}
            />
          </NeonCard>
        </Col>
        <Col xs={12} sm={6}>
          <NeonCard>
            <Statistic
              title={<span className="text-text-secondary">可接取</span>}
              value={stats.available}
              valueStyle={{ color: 'rgb(var(--color-success))', fontWeight: 600 }}
              loading={isFiltering}
            />
          </NeonCard>
        </Col>
        <Col xs={12} sm={6}>
          <NeonCard>
            <Statistic
              title={<span className="text-text-secondary">进行中</span>}
              value={stats.inProgress}
              valueStyle={{ color: 'rgb(var(--color-warning))', fontWeight: 600 }}
              loading={isFiltering}
            />
          </NeonCard>
        </Col>
        <Col xs={12} sm={6}>
          <NeonCard>
            <Statistic
              title={<span className="text-text-secondary">已完成</span>}
              value={stats.completed}
              valueStyle={{ color: 'rgb(var(--color-info))', fontWeight: 600 }}
              loading={isFiltering}
            />
          </NeonCard>
        </Col>
      </Row>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCategories={categories}
        availableDifficulties={difficulties}
        availableStatuses={statuses}
        availableCourses={courses}
        loading={isFiltering}
      />

      {/* View Mode Controls */}
      <div className="mb-6 flex justify-between items-center">
        <Space>
          <Button
            className={`view-toggle-btn ${viewMode === 'map' ? 'view-toggle-selected' : ''}`}
            icon={<EnvironmentOutlined />}
            onClick={() => setViewMode('map')}
          >
            地图视图
          </Button>
          <Button
            className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-selected' : ''}`}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
          >
            列表视图
          </Button>
          <Button
            className={`view-toggle-btn ${viewMode === 'split' ? 'view-toggle-selected' : ''}`}
            onClick={() => setViewMode('split')}
          >
            分屏视图
          </Button>
        </Space>
        
        <Space>
          {selectedTask && (
            <Button
              type={drawerVisible ? 'primary' : 'default'}
              icon={drawerVisible ? <CloseOutlined /> : <InfoCircleOutlined />}
              onClick={toggleDrawer}
              className="drawer-toggle-btn"
            >
              {drawerVisible ? '关闭详情' : '任务详情'}
            </Button>
          )}
          <Button 
            icon={<FullscreenOutlined />} 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? '退出全屏' : '全屏显示'}
          </Button>
        </Space>
      </div>

      {/* Content Area */}
      <Row gutter={[16, 16]}>
        {(viewMode === 'map' || viewMode === 'split') && (
          <Col xs={24} lg={viewMode === 'split' ? 12 : 24} className="relative">
            <LeafletMap
              tasks={filteredTasks}
              onTaskSelect={handleTaskSelect}
              selectedTaskId={selectedTask?.task_id}
              height={mapHeight}
              enableClustering={filteredTasks.length > 8}
            />
            <MapLegend className="hidden md:block" />
          </Col>
        )}
        
        {(viewMode === 'list' || viewMode === 'split') && (
          <Col xs={24} lg={viewMode === 'split' ? 12 : 24}>
            <NeonCard className="p-2">
              <TaskListView
                tasks={filteredTasks}
                loading={isFiltering}
                onTaskSelect={handleTaskSelect}
                onTaskAction={handleTaskAction}
                selectedTaskId={selectedTask?.task_id}
              />
            </NeonCard>
          </Col>
        )}
      </Row>

      {/* Enhanced Task Drawer with Portal Support */}
      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        onClose={handleDrawerClose}
        onOpenOnMap={(task) => {
          setSelectedTask(task);
          setViewMode('map');
          // 不立即关闭抽屉，让用户可以继续查看任务信息
        }}
        mask={true}
        maskClosable={true}
        keyboard={true}
        destroyOnClose={false}
      />
    </div>
  );
};

export default MapPage;