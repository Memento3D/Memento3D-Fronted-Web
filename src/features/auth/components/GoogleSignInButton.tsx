import React, { useState } from 'react';
import { Button, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';
import { resolveSafeRedirect } from '../utils/postLoginDestination';
import { tokenStorage } from '../utils/tokenStorage';

interface GoogleSignInButtonProps {
  label?: string;
  intendedRedirect?: string;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  label = 'Tiếp tục với Google',
  intendedRedirect,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
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
      message.error(err.message || 'Không thể khởi tạo phiên xác thực Google');
    }
  };

  return (
    <Button
      id="google-signin-button"
      block
      size="large"
      icon={<GoogleOutlined style={{ color: '#ea4335', fontSize: '18px' }} />}
      onClick={handleGoogleSignIn}
      loading={loading}
      disabled={disabled}
      style={{
        height: '46px',
        borderRadius: '8px',
        fontWeight: 600,
        background: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.16)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </Button>
  );
};
