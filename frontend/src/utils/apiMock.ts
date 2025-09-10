/**
 * API模拟工具
 * 用于模拟后端接口响应，支持流式和普通响应
 */

export interface ChatMessage {
  message: string;
  context?: {
    taskId: string;
    taskTitle: string;
    taskCategory: string;
    taskDifficulty: string;
  };
}

export interface ChatResponse {
  message: string;
  citations?: Array<{
    id: string;
    text: string;
    source: string;
    confidence: number;
  }>;
  suggestions?: Array<{
    taskId: string;
    title: string;
    reason: string;
    relevance: number;
  }>;
}

/**
 * 模拟任务助手API调用
 */
export const mockTaskAssistantAPI = async (
  taskId: string, 
  payload: ChatMessage
): Promise<ChatResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const { message, context } = payload;
  const input = message.toLowerCase();

  // 基于输入内容生成响应
  if (input.includes('位置') || input.includes('地点') || input.includes('在哪')) {
    return {
      message: `${context?.taskTitle || '该任务'}的具体位置信息已为您查询。根据校园地图数据，您可以通过导航系统轻松找到目标位置。`,
      citations: [{
        id: 'location_1',
        text: '校园地图定位数据',
        source: 'CityU地理信息系统',
        confidence: 0.95
      }]
    };
  }

  if (input.includes('难度') || input.includes('困难')) {
    const difficultyMap = {
      easy: '简单',
      medium: '中等', 
      hard: '困难'
    };
    const difficultyText = difficultyMap[context?.taskDifficulty as keyof typeof difficultyMap] || '未知';
    
    return {
      message: `根据任务评估系统，这个任务的难度等级为${difficultyText}。建议您根据自己的能力和经验来决定是否接取。`,
      citations: [{
        id: 'difficulty_1',
        text: `任务难度: ${difficultyText}`,
        source: '任务评估系统',
        confidence: 0.98
      }]
    };
  }

  if (input.includes('时间') || input.includes('多久') || input.includes('用时')) {
    return {
      message: '根据历史完成数据分析，大多数学生完成类似任务的平均用时在30-60分钟之间。具体时间会因个人能力和任务复杂度而有所不同。',
      citations: [{
        id: 'time_1',
        text: '平均完成时间: 30-60分钟',
        source: '历史数据分析',
        confidence: 0.85
      }]
    };
  }

  if (input.includes('奖励') || input.includes('收获') || input.includes('好处')) {
    return {
      message: '完成任务不仅能获得学分和奖励，更重要的是能提升实践能力和校园参与度。这些经历将成为您大学生活的宝贵财富。',
      citations: [{
        id: 'reward_1',
        text: '任务完成奖励机制',
        source: '学生发展中心',
        confidence: 0.92
      }]
    };
  }

  if (input.includes('建议') || input.includes('推荐') || input.includes('相关') || input.includes('类似')) {
    return {
      message: '基于您当前查看的任务，我为您推荐了一些相关的任务。这些任务在类别、难度或技能要求方面与当前任务相似，可能符合您的兴趣。',
      suggestions: [
        {
          taskId: 'related_1',
          title: '相关任务推荐',
          reason: `与${context?.taskCategory || '当前任务'}类别相关`,
          relevance: 0.85
        }
      ]
    };
  }

  if (input.includes('帮助') || input.includes('怎么') || input.includes('如何')) {
    return {
      message: '我可以帮您了解任务的各个方面，包括：\n• 任务位置和导航\n• 难度评估和要求\n• 预计完成时间\n• 奖励和收获\n• 相关任务推荐\n\n请告诉我您想了解哪个方面？',
    };
  }

  // 默认响应
  return {
    message: '感谢您的提问！我是您的任务助手，专门帮助您了解校园任务的相关信息。您可以询问任务的位置、难度、时间要求、奖励等任何相关问题。',
  };
};

/**
 * 模拟流式响应（用于未来扩展）
 */
export const mockStreamResponse = async function* (
  taskId: string,
  payload: ChatMessage
): AsyncGenerator<string, void, unknown> {
  const response = await mockTaskAssistantAPI(taskId, payload);
  const words = response.message.split('');
  
  for (const char of words) {
    yield char;
    await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
  }
};

/**
 * 检查API是否可用
 */
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', { 
      method: 'GET',
      timeout: 5000 
    } as any);
    return response.ok;
  } catch {
    return false;
  }
};