import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, ApiOutlined, ShoppingOutlined,
  KeyOutlined, UserOutlined, TeamOutlined, SettingOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/packages', icon: <ShoppingOutlined />, label: '套餐管理' },
  { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/admin/orders', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: '/admin/api-keys', icon: <KeyOutlined />, label: 'Key管理' },
  { key: '/admin/channels', icon: <TeamOutlined />, label: '渠道管理' },
  { key: '/admin/usage', icon: <BarChartOutlined />, label: '用量监控' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: '系统配置' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          寰卓科技
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
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>管理后台</span>
          <Dropdown menu={{ items: [{ key: 'logout', label: '退出登录' }] }}>
            <div style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
