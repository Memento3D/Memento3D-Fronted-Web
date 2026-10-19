import React, { useState } from 'react';
import { Card, Button, Typography, Alert, App, Avatar } from 'antd';
import { GoogleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { TermsAgreement } from '../components/TermsAgreement';

const { Title, Paragraph } = Typography;

export const CompleteRegistrationPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!agreeTerms) {
      setTermsError('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư để tiếp tục');
      return;
    }
    setTermsError(null);
    setLoading(true);
    setErrorMessage(null);

    try {
      await authApi.completeConsents({
        agreeTerms: true,
        termsVersion: '1.0',
        marketingConsent,
      });

      message.success('Hoàn tất kích hoạt tài khoản Memento3D thành công!');
      navigate('/products', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể lưu thông tin thỏa thuận. Vui lòng thử lại.';
      setErrorMessage(msg);
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
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          }}
          bodyStyle={{ padding: '36px 30px' }}
        >
          {/* User Google Identity Badge */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {user?.avatarUrl ? (
              <Avatar
                size={64}
                src={user.avatarUrl}
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  marginBottom: 12,
                  border: '2px solid #0284c7',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  marginBottom: 12,
                }}
              >
                <GoogleOutlined style={{ fontSize: '28px', color: '#ea4335' }} />
              </div>
            )}

            <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Chào mừng đến với Memento3D
            </Title>

            <Paragraph style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: 6, marginBottom: 0 }}>
              Xin chào, <strong style={{ color: '#e2e8f0' }}>{user?.fullName || 'Khách hàng'}</strong> ({user?.email})
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            message="Bước cuối cùng để hoàn tất đăng ký"
            description="Tài khoản Google của bạn đã được xác minh danh tính. Để tuân thủ quy định pháp luật và bảo vệ quyền lợi của bạn, vui lòng đọc và xác nhận đồng ý với Điều khoản sử dụng của Memento3D."
            style={{
              marginBottom: 20,
              background: 'rgba(2, 132, 199, 0.1)',
              borderColor: 'rgba(2, 132, 199, 0.25)',
              color: '#cbd5e1',
            }}
          />

          {errorMessage && (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              style={{ marginBottom: 20 }}
              closable
              onClose={() => setErrorMessage(null)}
            />
          )}

          {/* Terms Agreement Component */}
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

          <Button
            id="complete-registration-submit"
            type="primary"
            size="large"
            block
            loading={loading}
            icon={<ArrowRightOutlined />}
            onClick={handleSubmit}
            style={{
              height: '46px',
              borderRadius: '8px',
              fontWeight: 700,
              marginTop: 16,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            }}
          >
            Đồng ý & Bắt đầu trải nghiệm
          </Button>
        </Card>
      </div>
    </div>
  );
};
