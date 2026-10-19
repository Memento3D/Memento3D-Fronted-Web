import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  App,
  Progress,
  Tag,
  Descriptions,
} from 'antd';
import {
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  GoogleOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
} from '@ant-design/icons';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../auth/types/auth.types';

const { Title, Text } = Typography;

interface SecurityTabProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ user, onUserUpdated }) => {
  const { message } = App.useApp();
  const { updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const isGoogleOnly = user.provider === 'GOOGLE' && user.hasPassword === false;

  // NIST strength calculator
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

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await profileApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      message.success(res.message || 'Mật khẩu đã được cập nhật thành công!');
      form.resetFields();
      setPasswordValue('');

      // Mark user as having password
      const updatedUser = { ...user, hasPassword: true };
      onUserUpdated(updatedUser);
      updateUser(updatedUser);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Account Security Overview Card */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            Tình trạng bảo mật tài khoản
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Thông tin về phương thức đăng nhập và bảo vệ tài khoản của bạn.
          </Text>
        </div>

        <Descriptions
          column={{ xs: 1, sm: 2, md: 3 }}
          style={{ marginTop: '16px' }}
          labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
          contentStyle={{ color: '#f8fafc' }}
        >
          <Descriptions.Item label="Phương thức đăng nhập">
            {user.provider === 'GOOGLE' ? (
              <Tag icon={<GoogleOutlined />} color="default" style={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
                Google OAuth 2.0
              </Tag>
            ) : (
              <Tag icon={<LockOutlined />} color="blue">
                Mật khẩu cục bộ (Local)
              </Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái xác thực Email">
            {user.emailVerified ? (
              <Tag color="success" icon={<CheckCircleFilled />}>
                Đã bảo vệ bằng xác minh email
              </Tag>
            ) : (
              <Tag color="warning">Chưa xác minh email</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái tài khoản">
            <Tag color="green" icon={<ThunderboltFilled />}>
              {user.status || 'ACTIVE'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Change Password Card */}
      <Card
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            {isGoogleOnly ? 'Thiết lập mật khẩu dự phòng' : 'Đổi mật khẩu'}
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isGoogleOnly
              ? 'Tài khoản của bạn được liên kết qua Google OAuth. Bạn có thể thiết lập thêm mật khẩu trực tiếp để đăng nhập linh hoạt.'
              : 'Thay đổi mật khẩu định kỳ để bảo vệ tài khoản khỏi các rủi ro an ninh mạng.'}
          </Text>
        </div>

        {isGoogleOnly && (
          <Alert
            type="info"
            showIcon
            icon={<GoogleOutlined style={{ color: '#38bdf8' }} />}
            message="Tài khoản đăng nhập Google"
            description="Bạn đang đăng nhập bằng Google. Khi thiết lập mật khẩu tại đây, bạn sẽ có thể đăng nhập bằng cả hai cách: Google hoặc Email & Mật khẩu."
            style={{
              marginBottom: 24,
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
            }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ maxWidth: '540px' }}>
          {!isGoogleOnly && (
            <Form.Item
              label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Mật khẩu hiện tại</span>}
              name="currentPassword"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
            >
              <Input.Password
                prefix={<KeyOutlined style={{ color: '#64748b' }} />}
                placeholder="Nhập mật khẩu đang dùng"
                size="large"
                autoComplete="current-password"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          )}

          <Form.Item
            label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Mật khẩu mới</span>}
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 12, message: 'Mật khẩu phải có tối thiểu 12 ký tự theo tiêu chuẩn NIST' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#64748b' }} />}
              placeholder="Tối thiểu 12 ký tự"
              size="large"
              autoComplete="new-password"
              style={{ borderRadius: '8px' }}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </Form.Item>

          {passwordValue && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
                <span style={{ color: '#94a3b8' }}>Độ mạnh mật khẩu:</span>
                <span style={{ color: strength.status === 'success' ? '#10b981' : strength.status === 'active' ? '#38bdf8' : '#f59e0b', fontWeight: 600 }}>
                  {strength.label}
                </span>
              </div>
              <Progress percent={strength.percent} status={strength.status} showInfo={false} size="small" />
            </div>
          )}

          <Form.Item
            label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Xác nhận mật khẩu mới</span>}
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
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
              prefix={<LockOutlined style={{ color: '#64748b' }} />}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
              autoComplete="new-password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Alert
            type="warning"
            showIcon
            icon={<SafetyCertificateOutlined style={{ color: '#f59e0b' }} />}
            message="Chính sách bảo mật phiên làm việc"
            description="Sau khi đổi mật khẩu thành công, toàn bộ các phiên đăng nhập khác của bạn trên các thiết bị hoặc trình duyệt khác sẽ bị hủy ngay lập tức để bảo đảm an toàn."
            style={{
              marginBottom: 24,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            style={{
              borderRadius: '8px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
              minWidth: '160px',
            }}
          >
            {isGoogleOnly ? 'Thiết lập mật khẩu' : 'Cập nhật mật khẩu'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};
