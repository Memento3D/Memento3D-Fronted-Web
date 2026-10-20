import React, { useState } from 'react';
import { Card, Button, Typography, Form, Input, Alert, App, Progress } from 'antd';
import { LockOutlined, CheckCircleOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const { Title, Text, Paragraph } = Typography;

export const ResetPasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token')?.trim() || '';

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { percent: 0, status: 'normal' as const, label: '' };
    let score = 0;
    if (pwd.length >= 12) score += 40;
    else if (pwd.length >= 8) score += 20;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    let status: 'exception' | 'active' | 'success' = 'exception';
    let label = 'Yếu';
    if (score >= 80) {
      status = 'success';
      label = 'Rất mạnh (Khuyến nghị)';
    } else if (score >= 50) {
      status = 'active';
      label = 'Trung bình';
    }

    return { percent: Math.min(100, score), status, label };
  };

  const strength = calculateStrength(passwordValue);

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      message.error('Mã khôi phục không tồn tại hoặc đã hết hạn.');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      setIsSuccess(true);
      message.success('Mật khẩu của bạn đã được thay đổi thành công!');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Liên kết khôi phục không hợp lệ hoặc đã hết hạn (chỉ có hiệu lực trong 15 phút). Vui lòng yêu cầu liên kết mới.';
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
        background: 'radial-gradient(circle at 10% 20%, rgba(124, 92, 252, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 191, 174, 0.12) 0%, transparent 40%), var(--bg-app, #F8F5FF)',
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
            borderRadius: 'var(--radius-card-feature, 28px)',
            boxShadow: 'var(--shadow-floating)',
          }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          {isSuccess ? (
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
                Thiết lập mật khẩu thành công!
              </Title>

              <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Mật khẩu mới đã được cập nhật an toàn. Mọi phiên đăng nhập cũ trên các thiết bị khác đã được vô hiệu hóa để bảo vệ tài khoản của bạn.
              </Paragraph>

              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/login')}
                style={{
                  height: '46px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontWeight: 700,
                  background: 'var(--primary, #7C5CFC)',
                  border: 'none',
                  boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
                }}
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center' }}>
              <Alert
                type="warning"
                showIcon
                message="Thiếu mã khôi phục"
                description="Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token xác thực. Vui lòng bấm vào liên kết trong email hoặc gửi lại yêu cầu mới."
                style={{ marginBottom: 24, textAlign: 'left', borderRadius: 'var(--radius-default, 16px)' }}
              />
              <Link to="/forgot-password">
                <Button type="primary" block style={{ height: '46px', borderRadius: 'var(--radius-full, 9999px)', fontWeight: 600, background: 'var(--primary, #7C5CFC)' }}>
                  Yêu cầu liên kết mới
                </Button>
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
                  <LockOutlined />
                </div>
                <Title level={3} style={{ color: 'var(--text-primary, #28243D)', marginBottom: '6px', fontWeight: 700 }}>
                  Đặt lại mật khẩu
                </Title>
                <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.9rem' }}>
                  Thiết lập mật khẩu mới an toàn cho tài khoản Memento3D của bạn.
                </Text>
              </div>

              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Mật khẩu mới</span>}
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 12, message: 'Mật khẩu phải có tối thiểu 12 ký tự theo tiêu chuẩn bảo mật' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                    placeholder="Tối thiểu 12 ký tự"
                    size="large"
                    autoComplete="new-password"
                    style={{ borderRadius: 'var(--radius-input, 20px)' }}
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />
                </Form.Item>

                {passwordValue && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary, #6A6282)' }}>Độ mạnh mật khẩu:</span>
                      <span style={{ color: strength.status === 'success' ? '#466253' : strength.status === 'active' ? '#7C5CFC' : '#BA1A1A', fontWeight: 600 }}>
                        {strength.label}
                      </span>
                    </div>
                    <Progress percent={strength.percent} status={strength.status} showInfo={false} size="small" strokeColor="#7C5CFC" />
                  </div>
                )}

                <Form.Item
                  label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Xác nhận mật khẩu mới</span>}
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                    placeholder="Nhập lại mật khẩu mới"
                    size="large"
                    autoComplete="new-password"
                    style={{ borderRadius: 'var(--radius-input, 20px)' }}
                  />
                </Form.Item>

                <div style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6A6282)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <SafetyCertificateOutlined style={{ color: 'var(--primary, #7C5CFC)' }} /> Tiêu chuẩn NIST: Tối thiểu 12 ký tự, khuyến khích kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
                  </Text>
                </div>

                <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    style={{
                      height: '46px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      fontWeight: 700,
                      background: 'var(--primary, #7C5CFC)',
                      border: 'none',
                      boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
                    }}
                  >
                    Lưu mật khẩu mới
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
