import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Button, Avatar, Tag, Modal, List, Empty, Spin, message } from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  LinkOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { TaskLocation, getCategoryColor, seedTasks } from '../../data/seedTasks';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'error';
  citations?: Citation[];
  suggestions?: TaskSuggestion[];
}

interface Citation {
  id: string;
  text: string;
  source: string;
  confidence: number;
}

interface TaskSuggestion {
  task: TaskLocation;
  reason: string;
  relevance: number;
}

interface ChatPanelProps {
  taskId: string;
  task: TaskLocation;
  onOpenOnMap: (task: TaskLocation) => void;
}

const { TextArea } = Input;

const ChatPanel: React.FC<ChatPanelProps> = ({ taskId, task, onOpenOnMap }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<TaskSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `你好！我是任务助手，可以帮你了解"${task.title}"的相关信息。你可以问我关于任务的详情、位置、要求或者相关建议。`,
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages([welcomeMessage]);
  }, [task.title]);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 模拟AI响应生成
  const generateMockResponse = useCallback((userInput: string): Omit<Message, 'id' | 'timestamp' | 'status'> => {
    const input = userInput.toLowerCase();
    let content = '';
    let citations: Citation[] = [];
    let suggestions: TaskSuggestion[] = [];

    if (input.includes('位置') || input.includes('地点') || input.includes('在哪')) {
      content = `${task.title}位于${task.location.name}。这是CityU校园内的一个重要位置，你可以通过校园地图轻松找到。`;
      citations = [{
        id: 'loc1',
        text: `任务位置: ${task.location.name}`,
        source: '任务数据库',
        confidence: 0.95
      }];
    } else if (input.includes('难度') || input.includes('困难')) {
      const difficultyText = task.difficulty === 'easy' ? '简单' : task.difficulty === 'medium' ? '中等' : '困难';
      content = `这个任务的难度等级是${difficultyText}。${
        task.difficulty === 'easy' ? '适合新手完成，不需要特殊技能。' :
        task.difficulty === 'medium' ? '需要一定的经验和技能，建议有相关基础再尝试。' :
        '这是一个高难度任务，需要丰富的经验和专业技能。'
      }`;
      citations = [{
        id: 'diff1',
        text: `难度等级: ${difficultyText}`,
        source: '任务评估系统',
        confidence: 0.98
      }];
    } else if (input.includes('时间') || input.includes('多久')) {
      content = task.estimatedTime 
        ? `根据历史数据，完成这个任务大约需要${task.estimatedTime}分钟。实际时间可能因个人能力而有所不同。`
        : '这个任务没有明确的时间估算，建议根据任务复杂度合理安排时间。';
      if (task.estimatedTime) {
        citations = [{
          id: 'time1',
          text: `预计用时: ${task.estimatedTime}分钟`,
          source: '历史完成数据',
          confidence: 0.85
        }];
      }
    } else if (input.includes('奖励') || input.includes('收获')) {
      content = task.rewards && task.rewards.length > 0
        ? `完成这个任务你将获得: ${task.rewards.join('、')}。这些奖励将帮助你在校园任务系统中获得更高的等级和声誉。`
        : '这个任务目前没有明确的奖励信息，但完成任务本身就是很好的学习和成长机会。';
      if (task.rewards && task.rewards.length > 0) {
        citations = task.rewards.map((reward, index) => ({
          id: `reward${index}`,
          text: reward,
          source: '奖励系统',
          confidence: 0.92
        }));
      }
    } else if (input.includes('建议') || input.includes('推荐') || input.includes('相关')) {
      content = '基于你当前的任务，我为你推荐了一些相关的任务。这些任务可能与你的兴趣或技能相匹配。';
      
      const relatedTasks = seedTasks
        .filter(t => t.task_id !== task.task_id)
        .filter(t => 
          t.category === task.category || 
          t.difficulty === task.difficulty ||
          t.course === task.course
        )
        .slice(0, 3)
        .map(t => ({
          task: t,
          reason: t.category === task.category 
            ? `同属${t.category}类别` 
            : t.difficulty === task.difficulty 
            ? `相同难度等级` 
            : `同一课程: ${t.course}`,
          relevance: Math.random() * 0.3 + 0.7
        }));

      suggestions = relatedTasks;
      setCurrentSuggestions(relatedTasks);
    } else {
      content = '抱歉，我没有找到与你问题相关的具体信息。你可以尝试询问任务的位置、难度、时间要求或奖励等具体方面。';
    }

    return {
      role: 'assistant',
      content,
      citations: citations.length > 0 ? citations : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }, [task]);

  // 发送消息到后端API
  const sendMessageToAPI = useCallback(async (content: string): Promise<string> => {
    try {
      // 首先尝试真实API
      const response = await fetch(`/api/tasks/${taskId}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: {
            taskId: task.task_id,
            taskTitle: task.title,
            taskCategory: task.category,
            taskDifficulty: task.difficulty,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message || data.content || '抱歉，我现在无法回答这个问题。';
    } catch (error) {
      console.warn('Real API unavailable, using mock response:', error);
      
      // 使用模拟API
      const { mockTaskAssistantAPI } = await import('../../utils/apiMock');
      const mockResponse = await mockTaskAssistantAPI(taskId, {
        message: content,
        context: {
          taskId: task.task_id,
          taskTitle: task.title,
          taskCategory: task.category,
          taskDifficulty: task.difficulty,
        }
      });
      
      return mockResponse.message;
    }
  }, [taskId, task]);

  // 处理发送消息
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const pendingAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage, pendingAssistantMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 尝试调用真实API，如果失败则使用模拟响应
      let responseContent: string;
      let citations: Citation[] | undefined;
      let suggestions: TaskSuggestion[] | undefined;

      try {
        responseContent = await sendMessageToAPI(userMessage.content);
      } catch (apiError) {
        // API失败时使用模拟响应
        const mockResponse = generateMockResponse(userMessage.content);
        responseContent = mockResponse.content;
        citations = mockResponse.citations;
        suggestions = mockResponse.suggestions;
      }

      // 更新助手消息
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? {
              ...msg,
              content: responseContent,
              status: 'sent' as const,
              citations,
              suggestions,
            }
          : msg
      ));

    } catch (error) {
      console.error('Message sending failed:', error);
      
      // 更新为错误状态
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? {
              ...msg,
              content: '抱歉，发送消息时出现错误。请稍后重试。',
              status: 'error' as const,
            }
          : msg
      ));
      
      message.error('发送消息失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, sendMessageToAPI, generateMockResponse]);

  // 重试发送消息
  const retryMessage = useCallback(async (messageId: string) => {
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry || messageToRetry.role !== 'assistant') return;

    // 找到对应的用户消息
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
    
    if (!userMessage || userMessage.role !== 'user') return;

    // 更新消息状态为pending
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'pending' as const, content: '' }
        : msg
    ));

    setIsLoading(true);

    try {
      const responseContent = await sendMessageToAPI(userMessage.content);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              content: responseContent,
              status: 'sent' as const,
            }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              content: '重试失败，请稍后再试。',
              status: 'error' as const,
            }
          : msg
      ));
      message.error('重试失败');
    } finally {
      setIsLoading(false);
    }
  }, [messages, sendMessageToAPI]);

  // 处理键盘事件
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 打开任务建议模态框
  const openSuggestionsModal = useCallback((suggestions: TaskSuggestion[]) => {
    setCurrentSuggestions(suggestions);
    setSuggestionsModalOpen(true);
  }, []);

  // 处理任务建议点击
  const handleTaskSuggestionClick = useCallback((suggestedTask: TaskLocation) => {
    setSuggestionsModalOpen(false);
    onOpenOnMap(suggestedTask);
  }, [onOpenOnMap]);

  return (
    <div className="h-full flex flex-col">
      {/* 消息区域 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-4 space-y-4"
        style={{ 
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
        }}
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              'flex gap-3 max-w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <Avatar 
                icon={<RobotOutlined />}
                className="bg-primary text-white flex-shrink-0 mt-1"
                size="small"
              />
            )}
            
            <div className={cn(
              'flex flex-col gap-2 max-w-[85%]',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}>
              {/* 消息气泡 */}
              <div 
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-200',
                  message.role === 'user' 
                    ? 'bg-primary text-white rounded-br-md' 
                    : message.status === 'pending'
                    ? 'bg-bg-elevated text-text-secondary border border-border/20'
                    : message.status === 'error'
                    ? 'bg-error/10 text-error border border-error/20'
                    : 'bg-bg-elevated text-text-primary border border-border/20 rounded-bl-md'
                )}
              >
                {message.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Spin 
                      indicator={<LoadingOutlined className="text-primary" spin />} 
                      size="small" 
                    />
                    <span className="text-text-secondary">正在思考...</span>
                  </div>
                ) : message.status === 'error' ? (
                  <div className="flex items-center justify-between gap-2">
                    <span>{message.content}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => retryMessage(message.id)}
                      className="!text-error hover:!text-error/80 !p-1"
                      title="重试"
                    />
                  </div>
                ) : (
                  message.content
                )}
              </div>

              {/* 引用来源 */}
              {message.citations && message.citations.length > 0 && (
                <div className="space-y-2 max-w-full">
                  <div className="text-xs text-text-muted flex items-center gap-1">
                    <LinkOutlined />
                    引用来源:
                  </div>
                  {message.citations.map((citation) => (
                    <div 
                      key={citation.id} 
                      className="text-xs bg-primary/5 border border-primary/10 p-3 rounded-lg"
                    >
                      <div className="font-medium text-text-primary">{citation.text}</div>
                      <div className="text-text-muted mt-1">
                        来源: {citation.source} | 可信度: {(citation.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 任务建议 */}
              {message.suggestions && message.suggestions.length > 0 && (
                <Button 
                  type="link" 
                  size="small" 
                  icon={<BulbOutlined />}
                  onClick={() => openSuggestionsModal(message.suggestions!)}
                  className="!p-0 !h-auto !text-primary hover:!text-primary/80"
                >
                  查看相关任务推荐 ({message.suggestions.length})
                </Button>
              )}

              {/* 时间戳 */}
              <div className="text-xs text-text-muted">
                {message.timestamp.toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>

            {message.role === 'user' && (
              <Avatar 
                icon={<UserOutlined />}
                className="bg-secondary text-white flex-shrink-0 mt-1"
                size="small"
              />
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-border/20 pt-4 bg-bg-secondary">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="询问任务相关问题..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="!resize-none !border-border/30 !bg-bg-elevated hover:!border-primary/50 focus:!border-primary !rounded-xl"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="!h-10 !w-10 !rounded-xl !flex !items-center !justify-center"
            loading={isLoading}
            aria-label="发送消息"
          />
        </div>
        <div className="text-xs text-text-muted mt-2">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>

      {/* 任务建议模态框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BulbOutlined className="text-warning" />
            相关任务推荐
          </div>
        }
        open={suggestionsModalOpen}
        onCancel={() => setSuggestionsModalOpen(false)}
        footer={null}
        width={600}
        className="!top-8"
      >
        {currentSuggestions.length > 0 ? (
          <List
            dataSource={currentSuggestions}
            renderItem={(suggestion) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<EnvironmentOutlined />}
                    onClick={() => handleTaskSuggestionClick(suggestion.task)}
                    className="!text-primary hover:!text-primary/80"
                  >
                    在地图上查看
                  </Button>
                ]}
                className="!border-border/10 hover:!bg-bg-elevated/50 !rounded-lg !mb-2 !p-4"
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(suggestion.task.category) }}
                      />
                      <span className="text-text-primary font-medium">{suggestion.task.title}</span>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <p className="text-text-secondary">{suggestion.task.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag 
                          color={getCategoryColor(suggestion.task.category)}
                          className="!rounded-md"
                        >
                          {suggestion.task.category}
                        </Tag>
                        <Tag className="!rounded-md">
                          {suggestion.task.difficulty === 'easy' && '⭐ 简单'}
                          {suggestion.task.difficulty === 'medium' && '⭐⭐ 中等'}
                          {suggestion.task.difficulty === 'hard' && '⭐⭐⭐ 困难'}
                        </Tag>
                        <span className="text-sm text-text-muted">
                          推荐理由: {suggestion.reason}
                        </span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无相关任务推荐" />
        )}
      </Modal>
    </div>
  );
};

export default ChatPanel;