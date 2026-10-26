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
      <div style={{ width: '100%', maxWidth: '520px', zIndex: 1 }}>
        <Card
          style={{
            background: 'var(--surface-card, #FFFFFF)',
            border: '1px solid var(--border-default, #E2D9F7)',
            borderRadius: 'var(--radius-modal, 12px)',
            boxShadow: 'var(--shadow-md)',
          }}
          styles={{ body: { padding: '36px 30px' } }}
        >
          {/* User Google Identity Badge */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {user?.avatarUrl ? (
              <Avatar
                size={64}
                src={user.avatarUrl}
                style={{
                  boxShadow: '0 4px 16px rgba(124, 92, 252, 0.2)',
                  marginBottom: 12,
                  border: '2px solid var(--primary, #7C5CFC)',
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
                  background: 'var(--surface-container, #F1EBFF)',
                  marginBottom: 12,
                }}
              >
                <GoogleOutlined style={{ fontSize: '28px', color: '#ea4335' }} />
              </div>
            )}

            <Title level={3} style={{ color: 'var(--text-primary, #28243D)', margin: 0, fontWeight: 700 }}>
              Chào mừng đến với Memento3D
            </Title>

            <Paragraph style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.875rem', marginTop: 6, marginBottom: 0 }}>
              Xin chào, <strong style={{ color: 'var(--text-primary, #28243D)' }}>{user?.fullName || 'Khách hàng'}</strong> ({user?.email})
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            message="Bước cuối cùng để hoàn tất đăng ký"
            description="Tài khoản Google của bạn đã được xác minh danh tính. Để tuân thủ quy định pháp luật và bảo vệ quyền lợi của bạn, vui lòng đọc và xác nhận đồng ý với Điều khoản sử dụng của Memento3D."
            style={{
              marginBottom: 20,
              background: 'var(--surface-container, #F1EBFF)',
              borderColor: 'var(--border-default, #E2D9F7)',
              borderRadius: 'var(--radius-default, 16px)',
              color: 'var(--text-secondary, #6A6282)',
            }}
          />

          {errorMessage && (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              style={{ marginBottom: 20, borderRadius: 'var(--radius-default, 16px)' }}
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
              borderRadius: 'var(--radius-full, 9999px)',
              fontWeight: 700,
              marginTop: 16,
              background: 'var(--primary, #7C5CFC)',
              border: 'none',
              boxShadow: '0 8px 24px -4px rgba(124, 92, 252, 0.3)',
            }}
          >
            Đồng ý & Bắt đầu trải nghiệm
          </Button>
        </Card>
      </div>
    </div>
  );
};
