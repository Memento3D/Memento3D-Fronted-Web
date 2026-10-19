import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider, App } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectParam = searchParams.get('redirect') || undefined;

  const handlePostLoginRouting = async (user: User) => {
    // 1. Role verification against intended actor portal
    const authorized = isActorAuthorized(user.role, portalConfig.allowedRoles);

    if (!authorized) {
      navigate(
        `/403?attempted=${encodeURIComponent(portalConfig.actor)}&role=${encodeURIComponent(user.role)}`,
        { replace: true }
      );
      return;
    }

    // 2. Specialized Warehouse Flow (Phase 7)
    if (portalConfig.actor === 'warehouse') {
      try {
        const myWarehouses = await warehouseApi.getMyWarehouses();

        if (myWarehouses.length === 0) {
          navigate('/warehouse/no-access', { replace: true });
          return;
        }

        if (myWarehouses.length === 1) {
          localStorage.setItem('memento3d_active_warehouse_id', myWarehouses[0].id);
          message.success(`Đã kết nối cơ sở kho: ${myWarehouses[0].code}`);
          navigate('/manager/inventory', { replace: true });
          return;
        }

        // 2+ Warehouses: Route to warehouse selection screen
        navigate('/warehouse/select', { replace: true });
        return;
      } catch (err: any) {
        console.warn('Could not determine warehouse scope:', err);
      }
    }

    // 3. General Redirection priority:
    // Query param ?redirect -> TokenStorage intended URL -> Actor default -> Role default
    const savedIntended = tokenStorage.getIntendedUrl();
    const destination =
      redirectParam ||
      savedIntended ||
      portalConfig.defaultRedirect ||
      getDefaultRouteForRole(user.role);

    message.success(`Chào mừng trở lại, ${user.fullName}!`);
    navigate(destination, { replace: true });
  };

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const user = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      await handlePostLoginRouting(user);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Xác thực thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
      );
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
          description={errorMessage}
          style={{ marginBottom: 20 }}
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Form
        name={`login-form-${portalConfig.actor}`}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        autoComplete="on"
      >
        <Form.Item
          label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Email công việc</span>}
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email công việc' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#64748b' }} />}
            placeholder="user@memento3d.com"
            size="large"
            autoComplete="email"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Mật khẩu</span>}
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
    </div>
  );
};
