import React, { useState } from 'react';
import { Button, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';
import { resolveSafeRedirect } from '../utils/postLoginDestination';
import { tokenStorage } from '../utils/tokenStorage';

interface GoogleLoginButtonProps {
  intendedRedirect?: string;
  disabled?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  intendedRedirect,
  disabled,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      tokenStorage.clearIntendedUrl();
      const safeRedirect = resolveSafeRedirect(intendedRedirect);
      if (safeRedirect) {
        tokenStorage.saveIntendedUrl(safeRedirect);
      }
      const url = await authApi.getGoogleLoginUrl();
      window.location.href = url;
    } catch (err: any) {
      setLoading(false);
      message.error(err.message || 'Không thể khởi tạo phiên đăng nhập Google');
    }
  };

  return (
    <Button
      block
      size="large"
      icon={<GoogleOutlined style={{ color: '#ea4335' }} />}
      onClick={handleGoogleLogin}
      loading={loading}
      disabled={disabled}
      style={{
        height: '44px',
        borderRadius: '8px',
        fontWeight: 600,
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: '#f8fafc',
      }}
    >
      Đăng nhập bằng Google
    </Button>
  );
};
