import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider, App } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from './GoogleLoginButton';
import { warehouseApi } from '../../warehouse/api/warehouseApi';
import { tokenStorage } from '../utils/tokenStorage';
import { isActorAuthorized, getDefaultRouteForRole } from '../utils/resolveActorRoute';
import type { ActorPortalConfig, LoginPayload, User } from '../types/auth.types';

interface LoginFormProps {
  portalConfig: ActorPortalConfig;
}

export const LoginForm: React.FC<LoginFormProps> = ({ portalConfig }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const redirectParam = searchParams.get('redirect') || undefined;

  const handlePostLoginRouting = async (user: User) => {
    // 1. Role verification against intended actor portal
    const authorized = isActorAuthorized(user.role, portalConfig.allowedRoles);

    if (!authorized) {
      // Seamless intelligent redirect: if actor logs into another portal, route to their dedicated Home
      const actorHome = getDefaultRouteForRole(user.role);
      message.info(`Đã xác thực thành công. Đang chuyển hướng bạn về Không gian làm việc riêng (${user.role})...`);
      navigate(actorHome, { replace: true });
      return;
    }

    // 2. Specialized Warehouse Flow (Phase 7)
    if (portalConfig.actor === 'warehouse' || user.role === 'ROLE_WAREHOUSE') {
      try {
        const myWarehouses = await warehouseApi.getMyWarehouses();

        if (myWarehouses && myWarehouses.length === 1) {
          localStorage.setItem('memento3d_active_warehouse_id', myWarehouses[0].id);
          message.success(`Đã kết nối cơ sở kho: ${myWarehouses[0].code}`);
          navigate('/warehouse/home', { replace: true });
          return;
        }

        if (myWarehouses && myWarehouses.length > 1) {
          navigate('/warehouse/select', { replace: true });
          return;
        }
      } catch (err: any) {
        console.warn('Could not determine warehouse scope:', err);
      }
    }

    // 3. Post-login redirection to actor's dedicated Home Page
    tokenStorage.clearIntendedUrl();
    const destination =
      redirectParam && redirectParam !== '/' && !redirectParam.includes('/login')
        ? redirectParam
        : getDefaultRouteForRole(user.role);

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
      let msg =
        err.response?.data?.message ||
        err.message ||
        'Xác thực thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

      if (msg === 'Invalid credentials' || err.response?.status === 401 || err.status === 401) {
        msg = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
      }
      setErrorMessage(msg);
      message.error(msg);
      if (msg.toLowerCase().includes('xác minh') || msg.toLowerCase().includes('unverified')) {
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
                    style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Bấm vào đây để tới trang nhận lại email xác minh &rarr;
                  </Link>
                </div>
              )}
            </div>
          }
          style={{ marginBottom: 20 }}
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
          label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Email {portalConfig.actor === 'customer' ? 'đăng nhập' : 'công việc'}</span>}
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#64748b' }} />}
            placeholder={portalConfig.actor === 'customer' ? 'email@example.com' : 'user@memento3d.vn'}
            size="large"
            autoComplete="email"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Mật khẩu</span>
              <Link
                to="/forgot-password"
                style={{
                  color: '#38bdf8',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Quên mật khẩu?
              </Link>
            </div>
          }
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#64748b' }} />}
            placeholder="Nhập mật khẩu"
            size="large"
            autoComplete="current-password"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            style={{
              height: '44px',
              borderRadius: '8px',
              fontWeight: 700,
              background: portalConfig.accentGradient,
              border: 'none',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
            }}
          >
            Đăng nhập {portalConfig.badge}
          </Button>
        </Form.Item>
      </Form>

      {portalConfig.showGoogleLogin && (
        <>
          <Divider plain style={{ margin: '18px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Hoặc đăng nhập với
            </span>
          </Divider>

          <GoogleLoginButton
            intendedRedirect={redirectParam || portalConfig.defaultRedirect}
            disabled={loading}
          />
        </>
      )}

      {portalConfig.actor === 'customer' && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Chưa có tài khoản?{' '}
          </span>
          <Link
            to="/register"
            style={{
              color: '#38bdf8',
              fontWeight: 600,
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
