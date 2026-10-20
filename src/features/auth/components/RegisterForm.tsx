import React, { useState } from 'react';
import { Form, Input, Button, Alert, Divider, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { PasswordInput } from './PasswordInput';
import { TermsAgreement } from './TermsAgreement';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { RegisterPayload } from '../types/auth.types';

export const RegisterForm: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [passwordValue, setPasswordValue] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const onFinish = async (values: any) => {
    // Validate terms
    if (!agreeTerms) {
      setTermsError('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư');
      return;
    }
    setTermsError(null);

    // Validate password rules (at least 8 chars, uppercase, lowercase, digit)
    const isStrongEnough =
      values.password.length >= 8 &&
      /[a-z]/.test(values.password) &&
      /[A-Z]/.test(values.password) &&
      /\d/.test(values.password);

    if (!isStrongEnough) {
      setErrorMessage('Mật khẩu chưa đáp ứng tiêu chuẩn an toàn (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const payload: RegisterPayload = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        agreeTerms: true,
        termsVersion: '1.0',
        marketingConsent,
      };

      const res = await authApi.register(payload);
      message.success('Đăng ký tài khoản thành công!');

      // Navigate to Email Verification Page
      navigate(`/verify-email?email=${encodeURIComponent(payload.email)}`, {
        replace: true,
        state: { email: payload.email, verificationToken: res.verificationToken },
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(errorMsg);
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
          message="Lỗi đăng ký"
          description={errorMessage}
          style={{ marginBottom: 20 }}
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Form
        form={form}
        name="customer-register-form"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        autoComplete="off"
      >
        {/* Full Name */}
        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Họ và tên</span>}
          name="fullName"
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên của bạn' },
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
            { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' },
          ]}
        >
          <Input
            id="register-fullname"
            prefix={<UserOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
            placeholder="Ví dụ: Nguyễn Văn A"
            size="large"
            style={{ borderRadius: 'var(--radius-input, 12px)' }}
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Địa chỉ Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Địa chỉ email không đúng định dạng' },
          ]}
        >
          <Input
            id="register-email"
            prefix={<MailOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
            placeholder="name@example.com"
            size="large"
            autoComplete="email"
            style={{ borderRadius: 'var(--radius-input, 12px)' }}
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Mật khẩu</span>}
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
          ]}
        >
          <PasswordInput
            id="register-password"
            value={passwordValue}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              form.setFieldsValue({ password: e.target.value });
            }}
            placeholder="Tối thiểu 8 ký tự (chữ hoa, thường, số, ký tự đặc biệt)"
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Xác nhận mật khẩu</span>}
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            id="register-confirm-password"
            prefix={<LockOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
            placeholder="Nhập lại mật khẩu vừa đặt"
            size="large"
            style={{ borderRadius: 'var(--radius-input, 12px)' }}
            autoComplete="new-password"
          />
        </Form.Item>

        {/* Terms Agreement Checkboxes */}
        <TermsAgreement
          agreeTerms={agreeTerms}
          onAgreeTermsChange={(checked) => {
            setAgreeTerms(checked);
            if (checked) setTermsError(null);
          }}
          marketingConsent={marketingConsent}
          onMarketingConsentChange={setMarketingConsent}
          disabled={loading}
          termsError={termsError}
        />

        {/* Submit Button */}
        <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
          <Button
            id="register-submit-button"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            style={{
              height: '46px',
              borderRadius: '8px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            }}
          >
            Tạo tài khoản Memento3D
          </Button>
        </Form.Item>
      </Form>

      {/* Divider */}
      <Divider plain style={{ margin: '20px 0', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          Hoặc tiếp tục với
        </span>
      </Divider>

      {/* Google Sign In */}
      <GoogleSignInButton label="Tiếp tục với Google" disabled={loading} />

      {/* Back to Login */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Đã có tài khoản?{' '}
        </span>
        <Link
          to="/login"
          style={{
            color: '#38bdf8',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};
