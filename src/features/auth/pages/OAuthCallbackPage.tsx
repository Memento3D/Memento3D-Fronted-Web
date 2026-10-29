import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { tokenStorage } from '../utils/tokenStorage';
import { resolvePostLoginDestination } from '../utils/postLoginDestination';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || undefined;
    const onboarding = searchParams.get('onboarding') === 'true';

    if (error) {
      if (error === 'account_exists_link_required') {
        setErrorMessage(
          'Email này đã được đăng ký bằng Mật khẩu trên hệ thống. Vui lòng đăng nhập bằng Mật khẩu trước để liên kết tài khoản Google.'
        );
      } else if (error === 'email_not_verified') {
        setErrorMessage(
          'Tài khoản Google của bạn chưa được xác minh email bởi Google. Memento3D yêu cầu email đã xác thực.'
        );
      } else {
        setErrorMessage(decodeURIComponent(error));
      }
      return;
    }

    if (!token) {
      setErrorMessage('Không nhận được mã xác thực bảo mật từ máy chủ.');
      return;
    }

    // Authenticate with received tokens and route
    loginWithTokens(token, refreshToken)
      .then((user) => {
        if (onboarding) {
          navigate('/complete-registration', { replace: true });
          return;
        }
        const destination = resolvePostLoginDestination(user.role, tokenStorage.getIntendedUrl());
        navigate(destination, { replace: true });
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'Không thể thiết lập phiên đăng nhập với thông tin xác thực Google.');
      });
  }, [searchParams, loginWithTokens, navigate]);

  if (errorMessage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-app, #F8F5FF)',
          padding: 24,
        }}
      >
        <Result
          status="error"
          title={<span style={{ color: 'var(--text-primary)' }}>Xác thực Google không thành công</span>}
          subTitle={<span style={{ color: 'var(--error, #BA1A1A)' }}>{errorMessage}</span>}
          extra={[
            <Link to="/login" key="retry">
              <Button type="primary" size="large" style={{ borderRadius: '10px' }}>
                Quay lại trang Đăng nhập
              </Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-app, #F8F5FF)',
        gap: 16,
      }}
    >
      <Spin size="large" />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
        Đang xác thực thông tin bảo mật Google & khởi tạo phiên làm việc...
      </span>
    </div>
  );
};
