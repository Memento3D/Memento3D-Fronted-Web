import React from 'react';
import { Checkbox, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Text } = Typography;

interface TermsAgreementProps {
  agreeTerms: boolean;
  onAgreeTermsChange: (checked: boolean) => void;
  marketingConsent?: boolean;
  onMarketingConsentChange?: (checked: boolean) => void;
  disabled?: boolean;
  termsError?: string | null;
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  agreeTerms,
  onAgreeTermsChange,
  marketingConsent = false,
  onMarketingConsentChange,
  disabled = false,
  termsError,
}) => {
  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      {/* Required Terms Agreement Checkbox */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <Checkbox
          id="agree-terms-checkbox"
          checked={agreeTerms}
          onChange={(e) => onAgreeTermsChange(e.target.checked)}
          disabled={disabled}
          style={{ marginTop: 2 }}
        />
        <div style={{ flex: 1 }}>
          <Text style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #6A6282)', lineHeight: '1.5' }}>
            Tôi đã đọc và đồng ý với{' '}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary, #7C5CFC)', textDecoration: 'underline', fontWeight: 600 }}
            >
              Điều khoản sử dụng
            </Link>{' '}
            và đã xem{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary, #7C5CFC)', textDecoration: 'underline', fontWeight: 600 }}
            >
              Chính sách quyền riêng tư
            </Link>{' '}
            của Memento3D.{' '}
            <span style={{ color: 'var(--error, #BA1A1A)' }}>*</span>
          </Text>
        </div>
      </div>

      {termsError && (
        <div style={{ marginBottom: 10, paddingLeft: 24 }}>
          <Text type="danger" style={{ fontSize: '0.8rem', color: 'var(--error, #BA1A1A)', fontWeight: 500 }}>
            {termsError}
          </Text>
        </div>
      )}

      {/* Optional Marketing Consent Checkbox */}
      {onMarketingConsentChange && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Checkbox
            id="marketing-consent-checkbox"
            checked={marketingConsent}
            onChange={(e) => onMarketingConsentChange(e.target.checked)}
            disabled={disabled}
            style={{ marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <Text style={{ fontSize: '0.825rem', color: 'var(--text-tertiary, #8E86A8)', lineHeight: '1.4' }}>
              Tôi đồng ý nhận email giới thiệu sản phẩm và ưu đãi từ Memento3D. Tôi có thể rút lại đồng ý bất kỳ lúc nào. (Tùy chọn)
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};
