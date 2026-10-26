import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Form, Input, Alert, App } from 'antd';
import { MailOutlined, ArrowLeftOutlined, SendOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const { Title, Text, Paragraph } = Typography;

export const ForgotPasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onFinish = async (values: { email: string }) => {
    const email = values.email.trim().toLowerCase();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmittedEmail(email);
      setCooldown(60);
      message.success('Yêu cầu đặt lại mật khẩu đã được tiếp nhận!');
    } catch (err: any) {
      // Security anti-enumeration: backend responds 200, but if network or 500 fails:
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail || cooldown > 0) return;
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: submittedEmail });
      setCooldown(60);
      message.success('Đã gửi lại email hướng dẫn đặt lại mật khẩu!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi lại email. Vui lòng thử lại sau.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }}>
        <Card
          style={{
            background: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-default, #E2D9F7)',
            borderRadius: 'var(--radius-modal, 12px)',
            boxShadow: 'var(--shadow-md)',
          }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          {submittedEmail ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'var(--mint-accent, #C9E8D5)',
                  color: 'var(--tertiary, #466253)',
                  fontSize: '32px',
                  marginBottom: '20px',
                }}
              >
                <CheckCircleOutlined />
              </div>

              <Title level={3} style={{ color: 'var(--text-primary, #28243D)', marginBottom: '8px', fontWeight: 700 }}>
                Kiểm tra hòm thư của bạn
              </Title>

              <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Nếu email <strong style={{ color: 'var(--primary, #7C5CFC)' }}>{submittedEmail}</strong> tồn tại trong hệ thống Memento3D, 
                chúng tôi đã gửi một liên kết an toàn có thời hạn <strong>15 phút</strong> để thiết lập lại mật khẩu mới.
              </Paragraph>

              <Alert
                type="info"
                showIcon
                icon={<SafetyCertificateOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />}
                message="Lưu ý an toàn"
                description="Liên kết đặt lại mật khẩu chỉ dùng được một lần duy nhất. Nếu không nhận được email, hãy kiểm tra mục Thư rác (Spam) hoặc bấm nút gửi lại bên dưới."
                style={{
                  marginBottom: 24,
                  textAlign: 'left',
                  background: 'var(--surface-container, #F1EBFF)',
                  borderColor: 'var(--border-default, #E2D9F7)',
                  borderRadius: 'var(--radius-default, 16px)',
                }}
              />

              <Button
                type="default"
                block
                disabled={cooldown > 0 || loading}
                loading={loading}
                onClick={handleResend}
                style={{
                  height: '46px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontWeight: 600,
                  marginBottom: '16px',
                  borderColor: 'var(--border-default, #E2D9F7)',
                }}
              >
                {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại email'}
              </Button>

              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary, #6A6282)', fontWeight: 600 }}>
                <ArrowLeftOutlined /> Quay lại Đăng nhập
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--surface-container, #F1EBFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    color: 'var(--primary, #7C5CFC)',
                    fontSize: '28px',
                    marginBottom: '16px',
                  }}
                >
                  <MailOutlined />
                </div>
                <Title level={3} style={{ color: 'var(--text-primary, #28243D)', marginBottom: '6px', fontWeight: 700 }}>
                  Quên mật khẩu?
                </Title>
                <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.9rem' }}>
                  Nhập địa chỉ email đăng ký tài khoản Memento3D để nhận liên kết khôi phục mật khẩu bảo mật.
                </Text>
              </div>

              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Địa chỉ Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ email của bạn' },
                    { type: 'email', message: 'Định dạng email không hợp lệ' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                    placeholder="email@example.com"
                    size="large"
                    autoComplete="email"
                    style={{ borderRadius: 'var(--radius-input, 20px)' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    icon={<SendOutlined />}
                    style={{
                      height: '46px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      fontWeight: 700,
                      background: 'var(--primary, #7C5CFC)',
                      border: 'none',
                      boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
                    }}
                  >
                    Gửi liên kết khôi phục
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary, #6A6282)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <ArrowLeftOutlined /> Quay lại Đăng nhập
                  </Link>
                </div>
              </Form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
