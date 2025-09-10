import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import './LeafletMap.css';
import { TaskLocation, getCategoryColor } from '../../data/seedTasks';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  tasks: TaskLocation[];
  onTaskSelect?: (task: TaskLocation) => void;
  selectedTaskId?: string;
  height?: string;
  enableClustering?: boolean;
}

const CITYU_CENTER: [number, number] = [22.3364, 114.2734];

// Custom marker icon with enhanced interactivity - 固定尺寸，无位移
const createCustomIcon = (task: TaskLocation, isSelected?: boolean): L.DivIcon => {
  const color = getCategoryColor(task.category);
  const difficultyStars =
    task.difficulty === 'easy' ? '⭐' : task.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';
  const statusIcon =
    task.status === 'available' ? '🎯' : task.status === 'in_progress' ? '⏳' : '✅';

  // 固定尺寸，确保iconSize和iconAnchor在所有状态下一致
  const size = 32;
  const glowEffect = isSelected 
    ? 'box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25);' 
    : 'box-shadow: 0 2px 8px rgba(0,0,0,0.15);';

  return L.divIcon({
    html: `
      <div class="map-marker-pin ${isSelected ? 'selected' : ''}" style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid rgb(var(--color-bg-secondary));
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; color: white; font-weight: bold;
        ${glowEffect}
        position: relative;
        cursor: pointer;
        transition: box-shadow 0.2s ease-out, opacity 0.2s ease-out;
        z-index: ${isSelected ? '1000' : '100'};
      ">
        ${difficultyStars.charAt(0)}
        <div style="
          position: absolute; top: -8px; right: -8px;
          font-size: 10px; background: rgb(var(--color-bg-secondary)); color: rgb(var(--color-text-primary));
          border-radius: 50%; width: 16px; height: 16px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          border: 1px solid rgb(var(--color-border));
          transition: box-shadow 0.2s ease-out;
        ">
          ${statusIcon}
        </div>
      </div>
    `,
    className: 'custom-marker-interactive',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Safe bounds handler
const MapBoundsHandler: React.FC<{ tasks: TaskLocation[] }> = ({ tasks }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!tasks || tasks.length === 0) return;

    try {
      const bounds = L.latLngBounds(
        tasks.map((t) => [t.location.lat, t.location.lng] as [number, number])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Map fitBounds skipped:', e);
    }
  }, [map, tasks]);

  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  tasks,
  onTaskSelect,
  selectedTaskId,
  height = '500px',
  enableClustering = false,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapKey, setMapKey] = useState<number>(0); // 用于强制重新渲染地图
  
  // 重试加载地图的函数
  const handleRetryMap = () => {
    // 强制重新渲染地图组件
    setMapKey(prev => prev + 1);
    
    // 清除可能的缓存
    if (window.localStorage) {
      const cacheKeys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.includes('leaflet-tile')) {
          cacheKeys.push(key);
        }
      }
      cacheKeys.forEach(key => window.localStorage.removeItem(key));
    }
    
    console.log('正在重新加载地图...');
  };

  const markers = useMemo(
    () =>
      tasks.map((task) => ({
        task,
        position: [task.location.lat, task.location.lng] as [number, number],
        icon: createCustomIcon(task, task.task_id === selectedTaskId),
        isSelected: task.task_id === selectedTaskId,
      })),
    [tasks, selectedTaskId]
  );

  const handleMarkerClick = (task: TaskLocation, event: L.LeafletMouseEvent) => {
    // 阻止事件冒泡，避免触发地图点击
    event.originalEvent?.stopPropagation();
    
    // 添加点击反馈效果 - 仅使用不改变几何的效果
    const target = event.target as L.Marker;
    const element = target.getElement();
    if (element) {
      // 使用opacity闪烁效果代替transform
      element.style.opacity = '0.7';
      setTimeout(() => {
        element.style.opacity = '1';
      }, 150);
    }
    
    onTaskSelect?.(task);
  };

  return (
    <div
      style={{ 
        height, 
        width: '100%', 
        zIndex: 1,
        backgroundColor: 'rgba(var(--color-bg-secondary), 0.1)',
        position: 'relative'
      }}
      className="relative rounded-lg overflow-hidden border border-border/20 map-container"
    >
      <MapContainer
        key={`map-instance-${mapKey}`}
        center={CITYU_CENTER}
        zoom={16}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        ref={mapRef as any}
        zoomControl
        scrollWheelZoom
        attributionControl={true}
        doubleClickZoom={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        preferCanvas={true}
        className="leaflet-container-enhanced"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          subdomains={['a', 'b', 'c']}
          detectRetina={true}
          className="map-tiles"
          eventHandlers={{
            tileerror: (e) => {
              console.error('地图瓦片加载失败，尝试使用备用源', e);
              
              // 触发自定义事件，通知错误处理组件
              const errorEvent = new CustomEvent('leaflet-tile-error', { 
                detail: { error: e, timestamp: Date.now() } 
              });
              document.dispatchEvent(errorEvent);
              
              // 瓦片加载失败时自动尝试备用源
              const tileElement = e.tile as HTMLElement;
              if (tileElement && tileElement.src) {
                // 尝试多个备用源
                if (tileElement.src.includes('tile.openstreetmap.org')) {
                  tileElement.src = tileElement.src.replace(
                    'tile.openstreetmap.org', 
                    'a.tile.openstreetmap.fr/hot'
                  );
                } else if (tileElement.src.includes('openstreetmap.fr')) {
                  // 如果第一个备用源也失败，尝试第二个
                  tileElement.src = tileElement.src.replace(
                    'a.tile.openstreetmap.fr/hot', 
                    'tile.openstreetmap.de'
                  );
                }
              }
            }
          }}
        />
        
        {/* 备用瓦片图层，使用另一个免费无需认证的源 */}
        <TileLayer
          url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
          className="backup-tiles"
        />

        <MapBoundsHandler tasks={tasks} />

        {enableClustering ? (
          <MarkerClusterGroup>
            {markers.map(({ task, position, icon, isSelected }) => (
              <Marker
                key={task.task_id}
                position={position}
                icon={icon}
                eventHandlers={{ 
                  click: (event) => handleMarkerClick(task, event),
                  mouseover: (event) => {
                    // 鼠标悬停效果 - 仅使用不改变几何的效果
                    const target = event.target as L.Marker;
                    const element = target.getElement();
                    if (element && !isSelected) {
                      element.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                      element.style.opacity = '0.9';
                    }
                  },
                  mouseout: (event) => {
                    // 鼠标离开效果 - 恢复默认样式
                    const target = event.target as L.Marker;
                    const element = target.getElement();
                    if (element && !isSelected) {
                      element.style.boxShadow = '';
                      element.style.opacity = '1';
                    }
                  }
                }}
              />
            ))}
          </MarkerClusterGroup>
        ) : (
          markers.map(({ task, position, icon, isSelected }) => (
            <Marker
              key={task.task_id}
              position={position}
              icon={icon}
              eventHandlers={{ 
                click: (event) => handleMarkerClick(task, event),
                mouseover: (event) => {
                  // 鼠标悬停效果 - 仅使用不改变几何的效果
                  const target = event.target as L.Marker;
                  const element = target.getElement();
                  if (element && !isSelected) {
                    element.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                    element.style.opacity = '0.9';
                  }
                },
                mouseout: (event) => {
                  // 鼠标离开效果 - 恢复默认样式
                  const target = event.target as L.Marker;
                  const element = target.getElement();
                  if (element && !isSelected) {
                    element.style.boxShadow = '';
                    element.style.opacity = '1';
                  }
                }
              }}
            />
          ))
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;