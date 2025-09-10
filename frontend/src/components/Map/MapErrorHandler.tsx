import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface MapErrorHandlerProps {
  onRetry?: () => void;
}

const MapErrorHandler: React.FC<MapErrorHandlerProps> = ({ onRetry }) => {
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // 监听地图瓦片加载错误
  useEffect(() => {
    const handleTileError = () => {
      setErrorCount(prev => prev + 1);
      // 当错误次数超过阈值时显示错误提示
      if (errorCount > 5) {
        setHasError(true);
      }
    };

    // 添加全局事件监听
    document.addEventListener('leaflet-tile-error', handleTileError);

    return () => {
      document.removeEventListener('leaflet-tile-error', handleTileError);
    };
  }, [errorCount]);

  // 重置错误状态并触发重试
  const handleRetry = () => {
    setHasError(false);
    setErrorCount(0);
    if (onRetry) {
      onRetry();
    }
  };

  if (!hasError) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-50 p-4">
      <Alert
        message="地图加载异常"
        description="地图瓦片加载失败，可能是网络问题或地图服务不可用。"
        type="error"
        showIcon
        action={
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={handleRetry}
          >
            重试
          </Button>
        }
      />
    </div>
  );
};

export default MapErrorHandler;