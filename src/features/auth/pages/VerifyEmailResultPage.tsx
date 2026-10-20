import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Result, Spin, Typography, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoginOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const { Paragraph } = Typography;

export const VerifyEmailResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    if (!token) {
      setLoading(false);
      setSuccess(false);
      setErrorMessage('Mã token xác thực không hợp lệ hoặc thiếu.');
      return;
    }

    authApi
      .verifyEmail({ token })
      .then((res) => {
        setSuccess(true);
        setVerifiedEmail(res.email);
      })
      .catch((err: any) => {
        setSuccess(false);
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Xác minh email thất bại. Token có thể đã hết hạn hoặc đã được sử dụng.';
        setErrorMessage(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(124, 92, 252, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 191, 174, 0.12) 0%, transparent 40%), var(--bg-app, #F8F5FF)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }}>
        <Card
          style={{
            background: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-default, #E2D9F7)',
            borderRadius: 'var(--radius-card-feature, 28px)',
            boxShadow: 'var(--shadow-floating)',
            textAlign: 'center',
          }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          {loading ? (
            <div style={{ padding: '24px 0' }}>
              <Spin size="large" />
              <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', marginTop: 20 }}>
                Đang tiến hành xác minh liên kết bảo mật của bạn...
              </Paragraph>
            </div>
          ) : success ? (
            <Result
              icon={<CheckCircleOutlined style={{ color: 'var(--tertiary, #466253)', fontSize: '64px' }} />}
              title={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700 }}>Xác minh thành công!</span>}
              subTitle={
                <span style={{ color: 'var(--text-secondary, #6A6282)' }}>
                  Email {verifiedEmail && <strong style={{ color: 'var(--primary, #7C5CFC)' }}>{verifiedEmail}</strong>} đã được kích hoạt an toàn.
                  Bạn hiện có thể đăng nhập để sử dụng đầy đủ dịch vụ Memento3D.
                </span>
              }
              extra={[
                <Button
                  key="login-btn"
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  style={{
                    height: '46px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    fontWeight: 700,
                    background: 'var(--primary, #7C5CFC)',
                    border: 'none',
                    padding: '0 28px',
                    boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
                  }}
                >
                  Đăng nhập ngay
                </Button>,
              ]}
            />
          ) : (
            <Result
              icon={<CloseCircleOutlined style={{ color: 'var(--error, #BA1A1A)', fontSize: '64px' }} />}
              title={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700 }}>Xác minh không thành công</span>}
              subTitle={
                <span style={{ color: 'var(--error, #BA1A1A)' }}>
                  {errorMessage || 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.'}
                </span>
              }
              extra={[
                <Space direction="vertical" size={12} style={{ width: '100%' }} key="actions">
                  <Link to="/verify-email" style={{ width: '100%' }}>
                    <Button block size="large" type="primary" style={{ height: '46px', borderRadius: 'var(--radius-full, 9999px)', background: 'var(--primary, #7C5CFC)' }}>
                      Yêu cầu gửi lại email xác minh
                    </Button>
                  </Link>
                  <Link to="/login" style={{ width: '100%' }}>
                    <Button block size="large" type="text" style={{ color: 'var(--text-secondary, #6A6282)', fontWeight: 600 }}>
                      Quay lại trang Đăng nhập
                    </Button>
                  </Link>
                </Space>,
              ]}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
