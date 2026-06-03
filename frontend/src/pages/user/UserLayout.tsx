import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, KeyOutlined, ShoppingOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/user', icon: <DashboardOutlined />, label: '概览' },
  { key: '/user/keys', icon: <KeyOutlined />, label: 'API Keys' },
  { key: '/user/orders', icon: <ShoppingOutlined />, label: '订单记录' },
  { key: '/user/usage', icon: <FileTextOutlined />, label: '用量统计' },
];

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          用户中心
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default UserLayout;