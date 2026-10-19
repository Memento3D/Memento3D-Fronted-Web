import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, App } from 'antd';
import { MailOutlined, ReloadOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const { Title, Text, Paragraph } = Typography;

export const EmailVerificationPage: React.FC = () => {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const emailParam = searchParams.get('email') || (location.state as any)?.email || '';
  const devVerificationToken = (location.state as any)?.verificationToken;

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [activeDevToken, setActiveDevToken] = useState<string | null>(devVerificationToken || null);

  // 60-second cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!emailParam) {
      setResendError('Không tìm thấy địa chỉ email để gửi lại xác nhận.');
      return;
    }

    setLoading(true);
    setResendError(null);
    setResendSuccess(null);

    try {
      const res = await authApi.resendVerification({ email: emailParam });
      setResendSuccess('Email xác minh mới đã được gửi! Vui lòng kiểm tra hòm thư của bạn.');
      message.success('Đã gửi lại email xác minh!');
      setResendCooldown(60);
      setCanResend(false);

      if (res.verificationToken) {
        setActiveDevToken(res.verificationToken);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi lại email xác minh. Vui lòng thử lại sau giây lát.';
      setResendError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px', zIndex: 1 }}>
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
          }}
          bodyStyle={{ padding: '40px 32px' }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
              marginBottom: 20,
            }}
          >
            <MailOutlined style={{ fontSize: '32px', color: '#ffffff' }} />
          </div>

          <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
            Xác thực địa chỉ Email
          </Title>

          <Paragraph style={{ color: '#94a3b8', fontSize: '0.925rem', marginTop: 12, marginBottom: 20 }}>
            Hệ thống Memento3D đã gửi liên kết xác thực tới:
          </Paragraph>

          <div
            style={{
              background: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              marginBottom: 24,
            }}
          >
            <Text strong style={{ color: '#38bdf8', fontSize: '1rem', wordBreak: 'break-all' }}>
              {emailParam || 'Email của bạn'}
            </Text>
          </div>

          {resendSuccess && (
            <Alert
              type="success"
              showIcon
              message={resendSuccess}
              style={{ marginBottom: 20, textAlign: 'left' }}
              closable
              onClose={() => setResendSuccess(null)}
            />
          )}

          {resendError && (
            <Alert
              type="error"
              showIcon
              message={resendError}
              style={{ marginBottom: 20, textAlign: 'left' }}
              closable
              onClose={() => setResendError(null)}
            />
          )}

          {/* Dev Quick Link Helper (if token was returned by backend for local development) */}
          {activeDevToken && (
            <Alert
              type="info"
              showIcon
              icon={<CheckCircleOutlined style={{ color: '#38bdf8' }} />}
              message="Chế độ phát triển (Development Token)"
              description={
                <div>
                  <Text style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                    Để thuận tiện kiểm thử, bạn có thể nhấn liên kết xác nhận trực tiếp:
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Link
                      to={`/verify-email/confirm?token=${encodeURIComponent(activeDevToken)}`}
                      style={{
                        color: '#38bdf8',
                        textDecoration: 'underline',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      Bấm vào đây để hoàn tất xác minh ngay &rarr;
                    </Link>
                  </div>
                </div>
              }
              style={{ marginBottom: 20, textAlign: 'left', background: 'rgba(15, 23, 42, 0.6)' }}
            />
          )}

          <div
            style={{
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: 28,
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Text strong style={{ color: '#e2e8f0', display: 'block', marginBottom: 8, fontSize: '0.875rem' }}>
              Hướng dẫn tiếp theo:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.6 }}>
              <li>Kiểm tra hòm thư đến (Inbox) hoặc hòm thư quảng cáo/rác (Spam).</li>
              <li>Nhấp vào nút xác nhận trong email để kích hoạt tài khoản.</li>
              <li>Liên kết có hiệu lực trong vòng <strong>24 giờ</strong>.</li>
            </ul>
          </div>

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Button
              id="resend-verification-button"
              block
              size="large"
              icon={<ReloadOutlined spin={loading} />}
              onClick={handleResend}
              loading={loading}
              disabled={!canResend}
              style={{
                height: '44px',
                borderRadius: '8px',
                fontWeight: 600,
                background: canResend ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: canResend ? '#f8fafc' : '#64748b',
              }}
            >
              {canResend ? 'Gửi lại email xác minh' : `Gửi lại sau (${resendCooldown}s)`}
            </Button>

            <Link to="/login" style={{ width: '100%' }}>
              <Button
                block
                type="text"
                icon={<ArrowLeftOutlined />}
                style={{ color: '#38bdf8', fontWeight: 600 }}
              >
                Quay lại trang Đăng nhập
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    </div>
  );
};
