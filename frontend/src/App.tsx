import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';

// C端页面
import HomePageEN from './pages/HomePageEN';
import PackageListPageEN from './pages/PackageListPageEN';
import LoginPageEN from './pages/LoginPageEN';
import ModelSelectorEN from './pages/ModelSelectorEN';
import HomePage from './pages/HomePage';
import PackageListPage from './pages/PackageListPage';
import PackageDetailPage from './pages/PackageDetailPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/Dashboard';
import UserKeys from './pages/user/ApiKeys';
import UserOrders from './pages/user/Orders';
import UserUsage from './pages/user/Usage';
import LoginPage from './pages/LoginPage';

// 管理后台
import AdminLayout from './pages/admin/AdminLayout';
import AdminLayoutEN from './pages/admin/AdminLayoutEN';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPackages from './pages/admin/Packages';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminApiKeys from './pages/admin/ApiKeys';
import AdminChannels from './pages/admin/Channels';
import SystemConfig from './pages/admin/SystemConfig';
import ChannelDashboard from './pages/ChannelDashboard';
import ChatPlayground from './pages/ChatPlayground';
import ModelSelector from './pages/ModelSelector';

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Routes>
        {/* C端路由 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackageListPage />} />
        <Route path="/packages/:uuid" element={<PackageDetailPage />} />
        <Route path="/pay/:orderUuid" element={<PaymentPage />} />
        <Route path="/pay/result" element={<PaymentResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/chat" element={<ChatPlayground />} />
        <Route path="/models" element={<ModelSelector />} />
        <Route path="/channel" element={<ChannelDashboard />} />
        {/* 用户中心 */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="keys" element={<UserKeys />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="usage" element={<UserUsage />} />
        </Route>
        
        {/* 管理后台 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="api-keys" element={<AdminApiKeys />} />
          <Route path="channels" element={<AdminChannels />} />
          <Route path="settings" element={<SystemConfig />} />
        </Route>
        {/* English Version */}
        <Route path='/en' element={<HomePageEN />} />
        <Route path='/en/packages' element={<PackageListPageEN />} />
        <Route path='/en/models' element={<ModelSelectorEN />} />
        <Route path='/en/login' element={<LoginPageEN />} />
        
        {/* English User Center (reuses Chinese components) */}
        <Route path='/en/user' element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path='keys' element={<UserKeys />} />
          <Route path='orders' element={<UserOrders />} />
          <Route path='usage' element={<UserUsage />} />
        </Route>
        
        {/* English Admin (simplified) */}
        <Route path='/en/admin' element={<AdminLayoutEN />}>
          <Route index element={<AdminDashboard />} />
          <Route path='packages' element={<AdminPackages />} />
          <Route path='users' element={<AdminUsers />} />
          <Route path='orders' element={<AdminOrders />} />
          <Route path='api-keys' element={<AdminApiKeys />} />
          <Route path='channels' element={<AdminChannels />} />
          <Route path='settings' element={<SystemConfig />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
