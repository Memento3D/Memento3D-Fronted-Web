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
      <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }}>
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
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
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  fontSize: '32px',
                  marginBottom: '20px',
                }}
              >
                <CheckCircleOutlined />
              </div>

              <Title level={3} style={{ color: '#fff', marginBottom: '8px', fontWeight: 700 }}>
                Kiểm tra hòm thư của bạn
              </Title>

              <Paragraph style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Nếu email <strong style={{ color: '#38bdf8' }}>{submittedEmail}</strong> tồn tại trong hệ thống Memento3D, 
                chúng tôi đã gửi một liên kết an toàn có thời hạn <strong>15 phút</strong> để thiết lập lại mật khẩu mới.
              </Paragraph>

              <Alert
                type="info"
                showIcon
                icon={<SafetyCertificateOutlined style={{ color: '#38bdf8' }} />}
                message="Lưu ý an toàn"
                description="Liên kết đặt lại mật khẩu chỉ dùng được một lần duy nhất. Nếu không nhận được email, hãy kiểm tra mục Thư rác (Spam) hoặc bấm nút gửi lại bên dưới."
                style={{
                  marginBottom: 24,
                  textAlign: 'left',
                  background: 'rgba(14, 165, 233, 0.08)',
                  borderColor: 'rgba(14, 165, 233, 0.25)',
                }}
              />

              <Button
                type="default"
                block
                disabled={cooldown > 0 || loading}
                loading={loading}
                onClick={handleResend}
                style={{
                  height: '42px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại email'}
              </Button>

              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
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
                    background: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    color: '#38bdf8',
                    fontSize: '28px',
                    marginBottom: '16px',
                  }}
                >
                  <MailOutlined />
                </div>
                <Title level={3} style={{ color: '#fff', marginBottom: '6px', fontWeight: 700 }}>
                  Quên mật khẩu?
                </Title>
                <Text style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Nhập địa chỉ email đăng ký tài khoản Memento3D để nhận liên kết khôi phục mật khẩu bảo mật.
                </Text>
              </div>

              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Địa chỉ Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ email của bạn' },
                    { type: 'email', message: 'Định dạng email không hợp lệ' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#64748b' }} />}
                    placeholder="email@example.com"
                    size="large"
                    autoComplete="email"
                    style={{ borderRadius: '8px' }}
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
                      height: '44px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
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
                      color: '#94a3b8',
                      fontSize: '0.875rem',
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
