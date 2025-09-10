import React from 'react';
import { Layout, Menu, Drawer, Button } from 'antd';
import { MenuOutlined, HomeOutlined, AppstoreOutlined, EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import { cn } from '../../utils/cn';

const { Header, Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/tasks',
      icon: <AppstoreOutlined />,
      label: <Link to="/tasks">任务中心</Link>,
    },
    {
      key: '/map',
      icon: <EnvironmentOutlined />,
      label: <Link to="/map">任务地图</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <Layout className="min-h-screen">
      <Header 
        className={cn(
          'glass-nav sticky top-0 px-4 flex items-center justify-between',
          'border-b border-border/20 transition-all duration-200 ease-out'
        )}
        style={{ 
          zIndex: 'var(--z-nav)',
          background: 'rgba(var(--color-bg-glass))',
          // 移除 backdrop-filter 避免创建新的层叠上下文
        }}
      >
        <div className="flex items-center">
          <div className="flex items-center gap-3 mr-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-bold text-gradient hidden sm:block">
              CityU Tasks
            </h1>
          </div>
          
          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className={cn(
              'hidden md:flex border-none bg-transparent flex-1',
              'menu-neon'
            )}
            style={{
              background: 'transparent',
              borderBottom: 'none',
            }}
          />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - visible on both desktop and mobile */}
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleMobileMenu}
            className="md:hidden"
          />
        </div>

        {/* Mobile Menu Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-gradient font-semibold">菜单</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={320}
          className="neon-drawer"
          styles={{
            header: {
              background: 'rgba(var(--color-bg-glass))',
              borderBottom: '1px solid rgba(var(--color-border) / 0.2)',
            },
            body: {
              background: 'rgba(var(--color-bg-glass))',
              padding: '1rem',
            },
            content: {
              background: 'rgba(var(--color-bg-glass))',
            },
          }}
        >
          <div className="space-y-4">
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={() => setMobileMenuVisible(false)}
              className={cn(
                'border-none bg-transparent',
                'menu-neon-vertical'
              )}
              style={{
                background: 'transparent',
                border: 'none',
              }}
            />
            
            {/* 移动端主题切换 */}
            <div className="pt-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">主题设置</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Drawer>
      </Header>

      <Content className="flex-1 relative">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </Content>

      <Footer 
        className={cn(
          'text-center border-t border-border/20 glass-effect',
          'transition-all duration-200 ease-out'
        )}
        style={{
          background: 'rgba(var(--color-bg-glass))',
        }}
      >
        <div className="text-sm text-text-secondary">
          <span className="text-gradient font-semibold">CityU Campus Tasks</span> © 2024 - 开放世界地图 × NPC 智能体校园任务系统
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;