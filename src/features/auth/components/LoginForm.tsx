import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider, App } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from './GoogleLoginButton';
import { tokenStorage } from '../utils/tokenStorage';
import { resolvePostLoginDestination, resolveSafeRedirect } from '../utils/postLoginDestination';
import type { ActorPortalConfig, LoginPayload, User } from '../types/auth.types';

interface LoginFormProps {
  portalConfig: ActorPortalConfig;
}

export const LoginForm: React.FC<LoginFormProps> = ({ portalConfig }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveSafeRedirect(searchParams.get('redirect'));
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handlePostLoginRouting = (user: User) => {
    tokenStorage.clearIntendedUrl();
    const destination = resolvePostLoginDestination(user.role, redirect);

    message.success(`Chào mừng trở lại, ${user.fullName || user.email}!`);
    navigate(destination, { replace: true });
  };

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    setErrorMessage(null);
    setUnverifiedEmail(null);

    try {
      const user = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      await handlePostLoginRouting(user);
    } catch (err: any) {
      const backendMessage = typeof err.response?.data?.message === 'string'
        ? err.response.data.message
        : '';
      let msg = 'Xác thực thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      if (backendMessage === 'Invalid credentials' || err.response?.status === 401 || err.status === 401) {
        msg = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
      }
      setErrorMessage(msg);
      message.error(msg);
      if (backendMessage.toLowerCase().includes('xác minh') || backendMessage.toLowerCase().includes('unverified')) {
        setUnverifiedEmail(values.email.trim().toLowerCase());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Lỗi xác thực"
          description={
            <div>
              <div>{errorMessage}</div>
              {unverifiedEmail && (
                <div style={{ marginTop: 8 }}>
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    style={{ color: 'var(--primary, #7C5CFC)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Bấm vào đây để tới trang nhận lại email xác minh &rarr;
                  </Link>
                </div>
              )}
            </div>
          }
          style={{ marginBottom: 20, borderRadius: 'var(--radius-default, 16px)' }}
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Form
        form={form}
        name={`login-form-${portalConfig.actor}`}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        autoComplete="on"
      >
        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Email {portalConfig.actor === 'customer' ? 'đăng nhập' : 'công việc'}</span>}
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
            placeholder={portalConfig.actor === 'customer' ? 'email@example.com' : 'user@memento3d.vn'}
            size="large"
            autoComplete="email"
            style={{ borderRadius: 'var(--radius-input, 20px)' }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Mật khẩu</span>}
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          style={{ marginBottom: 10 }}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
            placeholder="Nhập mật khẩu"
            size="large"
            autoComplete="current-password"
            style={{ borderRadius: 'var(--radius-input, 20px)' }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--primary, #7C5CFC)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item style={{ marginTop: 0, marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            style={{
              height: '46px',
              borderRadius: 'var(--radius-full, 9999px)',
              fontWeight: 700,
              background: 'var(--primary, #7C5CFC)',
              border: 'none',
              boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
            }}
          >
            Đăng nhập {portalConfig.badge}
          </Button>
        </Form.Item>
      </Form>

      {portalConfig.showGoogleLogin && (
        <>
          <Divider plain style={{ margin: '18px 0', borderColor: 'var(--border-default, #E2D9F7)' }}>
            <span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hoặc đăng nhập với
            </span>
          </Divider>

          <GoogleLoginButton
            intendedRedirect={redirect || undefined}
            disabled={loading}
          />
        </>
      )}

      {portalConfig.actor === 'customer' && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.875rem' }}>
            Chưa có tài khoản?{' '}
          </span>
          <Link
            to="/register"
            style={{
              color: 'var(--primary, #7C5CFC)',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Đăng ký ngay
          </Link>
        </div>
      )}
    </div>
  );
};
