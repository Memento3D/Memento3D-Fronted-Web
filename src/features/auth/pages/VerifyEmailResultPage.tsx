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
        background: 'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #020617 100%)',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }}>
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
          bodyStyle={{ padding: '40px 32px' }}
        >
          {loading ? (
            <div style={{ padding: '24px 0' }}>
              <Spin size="large" />
              <Paragraph style={{ color: '#94a3b8', marginTop: 20 }}>
                Đang tiến hành xác minh liên kết bảo mật của bạn...
              </Paragraph>
            </div>
          ) : success ? (
            <Result
              icon={<CheckCircleOutlined style={{ color: '#10b981', fontSize: '64px' }} />}
              title={<span style={{ color: '#ffffff', fontWeight: 700 }}>Xác minh thành công!</span>}
              subTitle={
                <span style={{ color: '#94a3b8' }}>
                  Email {verifiedEmail && <strong>{verifiedEmail}</strong>} đã được kích hoạt an toàn.
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
                    borderRadius: '8px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    padding: '0 28px',
                  }}
                >
                  Đăng nhập ngay
                </Button>,
              ]}
            />
          ) : (
            <Result
              icon={<CloseCircleOutlined style={{ color: '#ef4444', fontSize: '64px' }} />}
              title={<span style={{ color: '#ffffff', fontWeight: 700 }}>Xác minh không thành công</span>}
              subTitle={
                <span style={{ color: '#f87171' }}>
                  {errorMessage || 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.'}
                </span>
              }
              extra={[
                <Space direction="vertical" size={12} style={{ width: '100%' }} key="actions">
                  <Link to="/verify-email" style={{ width: '100%' }}>
                    <Button block size="large" type="primary">
                      Yêu cầu gửi lại email xác minh
                    </Button>
                  </Link>
                  <Link to="/login" style={{ width: '100%' }}>
                    <Button block size="large" type="text" style={{ color: '#94a3b8' }}>
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
