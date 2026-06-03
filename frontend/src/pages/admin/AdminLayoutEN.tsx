import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, ApiOutlined, ShoppingOutlined,
  KeyOutlined, UserOutlined, TeamOutlined, SettingOutlined,
  BarChartOutlined, GlobalOutlined, SafetyOutlined
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/en/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/en/admin/packages', icon: <ShoppingOutlined />, label: 'Packages' },
  { key: '/en/admin/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/en/admin/orders', icon: <ShoppingOutlined />, label: 'Orders' },
  { key: '/en/admin/api-keys', icon: <KeyOutlined />, label: 'API Keys' },
  { key: '/en/admin/channels', icon: <TeamOutlined />, label: 'Channels' },
  { key: '/en/admin/usage', icon: <BarChartOutlined />, label: 'Usage' },
  { key: '/en/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
];

const AdminLayoutEN: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible theme="dark">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontSize: 16, 
          fontWeight: 'bold',
          padding: '0 12px',
          textAlign: 'center'
        }}>
          <GlobalOutlined style={{ marginRight: 8 }} />
          HSALL GLOBAL
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            Admin Console
            <Tag color="blue" style={{ marginLeft: 8 }}>
              <SafetyOutlined /> EN Version
            </Tag>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={5} size="small">
              <span style={{ color: '#8c8c8c' }}>Notifications</span>
            </Badge>
            <Dropdown menu={{ items: [{ key: 'logout', label: 'Logout' }, { key: 'profile', label: 'Profile' }] }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayoutEN;