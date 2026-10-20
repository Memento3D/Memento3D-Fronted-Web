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
        background: 'radial-gradient(circle at 10% 20%, rgba(124, 92, 252, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 191, 174, 0.12) 0%, transparent 40%), var(--bg-app, #F8F5FF)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px', zIndex: 1 }}>
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
          {/* Icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '24px',
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-default, #E2D9F7)',
              boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.15)',
              marginBottom: 20,
            }}
          >
            <MailOutlined style={{ fontSize: '32px', color: 'var(--primary, #7C5CFC)' }} />
          </div>

          <Title level={3} style={{ color: 'var(--text-primary, #28243D)', margin: 0, fontWeight: 700 }}>
            Xác thực địa chỉ Email
          </Title>

          <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.925rem', marginTop: 12, marginBottom: 20 }}>
            Hệ thống Memento3D đã gửi liên kết xác thực tới:
          </Paragraph>

          <div
            style={{
              background: 'var(--surface-container, #F1EBFF)',
              border: '1px solid var(--border-default, #E2D9F7)',
              borderRadius: 'var(--radius-default, 16px)',
              padding: '10px 16px',
              marginBottom: 24,
            }}
          >
            <Text strong style={{ color: 'var(--primary, #7C5CFC)', fontSize: '1rem', wordBreak: 'break-all' }}>
              {emailParam || 'Email của bạn'}
            </Text>
          </div>

          {resendSuccess && (
            <Alert
              type="success"
              showIcon
              message={resendSuccess}
              style={{ marginBottom: 20, textAlign: 'left', borderRadius: 'var(--radius-default, 16px)' }}
              closable
              onClose={() => setResendSuccess(null)}
            />
          )}

          {resendError && (
            <Alert
              type="error"
              showIcon
              message={resendError}
              style={{ marginBottom: 20, textAlign: 'left', borderRadius: 'var(--radius-default, 16px)' }}
              closable
              onClose={() => setResendError(null)}
            />
          )}

          {/* Dev Quick Link Helper (if token was returned by backend for local development) */}
          {activeDevToken && (
            <Alert
              type="info"
              showIcon
              icon={<CheckCircleOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />}
              message="Chế độ phát triển (Development Token)"
              description={
                <div>
                  <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
                    Để thuận tiện kiểm thử, bạn có thể nhấn liên kết xác nhận trực tiếp:
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Link
                      to={`/verify-email/confirm?token=${encodeURIComponent(activeDevToken)}`}
                      style={{
                        color: 'var(--primary, #7C5CFC)',
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
              style={{ marginBottom: 20, textAlign: 'left', background: 'var(--surface-container, #F1EBFF)', borderColor: 'var(--border-default, #E2D9F7)', borderRadius: 'var(--radius-default, 16px)' }}
            />
          )}

          <div
            style={{
              textAlign: 'left',
              background: 'var(--surface-low, #F7F1FF)',
              borderRadius: 'var(--radius-default, 16px)',
              padding: '16px 20px',
              marginBottom: 28,
              border: '1px solid var(--border-default, #E2D9F7)',
            }}
          >
            <Text strong style={{ color: 'var(--text-primary, #28243D)', display: 'block', marginBottom: 8, fontSize: '0.875rem' }}>
              Hướng dẫn tiếp theo:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary, #6A6282)', fontSize: '0.825rem', lineHeight: 1.6 }}>
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
                height: '46px',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 600,
                background: canResend ? 'var(--primary, #7C5CFC)' : 'var(--surface-high, #EBE4FF)',
                borderColor: 'var(--border-default, #E2D9F7)',
                color: canResend ? '#ffffff' : 'var(--text-secondary, #6A6282)',
                boxShadow: canResend ? '0 8px 24px -4px rgba(124, 92, 252, 0.3)' : 'none',
              }}
            >
              {canResend ? 'Gửi lại email xác minh' : `Gửi lại sau (${resendCooldown}s)`}
            </Button>

            <Link to="/login" style={{ width: '100%' }}>
              <Button
                block
                type="text"
                icon={<ArrowLeftOutlined />}
                style={{ color: 'var(--primary, #7C5CFC)', fontWeight: 600 }}
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
