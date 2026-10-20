import React, { useState, useEffect } from 'react';
import { Tabs, Breadcrumb, Button, Spin, Alert } from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { profileApi } from '../api/profileApi';
import { ProfileHeader } from '../components/ProfileHeader';
import { PersonalInfoTab } from '../components/PersonalInfoTab';
import { AddressManagerTab } from '../components/AddressManagerTab';
import { SecurityTab } from '../components/SecurityTab';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import type { User } from '../../auth/types/auth.types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(authUser);
  const [loading, setLoading] = useState(false);

  // Determine active tab from pathname or query param
  const getInitialTab = (): string => {
    if (location.pathname.includes('/security')) return 'security';
    if (location.pathname.includes('/addresses')) return 'addresses';
    return searchParams.get('tab') || 'info';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, searchParams]);

  // Fetch freshest profile info
  useEffect(() => {
    const fetchLatestProfile = async () => {
      setLoading(true);
      try {
        const data = await profileApi.getProfile();
        setProfileUser(data);
        updateUser(data);
      } catch (err) {
        console.warn('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const handleUserUpdated = (updated: User) => {
    setProfileUser(updated);
    updateUser(updated);
  };

  const tabItems = [
    {
      key: 'info',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: profileUser && <PersonalInfoTab user={profileUser} onUserUpdated={handleUserUpdated} />,
    },
    {
      key: 'addresses',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined /> Sổ địa chỉ
        </span>
      ),
      children: <AddressManagerTab />,
    },
    {
      key: 'security',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <SafetyCertificateOutlined /> Bảo mật tài khoản
        </span>
      ),
      children: profileUser && <SecurityTab user={profileUser} onUserUpdated={handleUserUpdated} />,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 24px 60px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <span
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <HomeOutlined /> Trang chủ
                  </span>
                ),
              },
              {
                title: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Hồ sơ & Tài khoản</span>,
              },
            ]}
          />

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)' }}
          >
            Quay lại
          </Button>
        </div>

        {loading && !profileUser ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : profileUser ? (
          <>
            <ProfileHeader user={profileUser} onUserUpdated={handleUserUpdated} />

            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              size="large"
              style={{
                background: 'transparent',
              }}
            />
          </>
        ) : (
          <Alert
            type="error"
            message="Không thể tải thông tin hồ sơ"
            description="Vui lòng thử đăng nhập lại."
            style={{ marginTop: 24, borderRadius: 'var(--radius-default)' }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
