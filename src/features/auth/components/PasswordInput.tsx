import React, { useState } from 'react';
import { Input, Progress, Space } from 'antd';
import { LockOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

interface PasswordInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showStrengthMeter?: boolean;
  disabled?: boolean;
  id?: string;
}

interface PasswordRule {
  key: string;
  label: string;
  valid: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Nhập mật khẩu an toàn',
  showStrengthMeter = true,
  disabled = false,
  id = 'register-password-input',
}) => {
  const [focused, setFocused] = useState(false);

  const rules: PasswordRule[] = [
    { key: 'length', label: 'Tối thiểu 8 ký tự', valid: value.length >= 8 },
    { key: 'case', label: 'Chữ hoa & chữ thường (A-z)', valid: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { key: 'number', label: 'Chứa ít nhất 1 chữ số (0-9)', valid: /\d/.test(value) },
    { key: 'special', label: 'Ký tự đặc biệt (!@#$%^&*)', valid: /[@$!%*?&#^()_+=\-[\]{}|;:,.<>]/.test(value) },
  ];

  const passedCount = rules.filter((r) => r.valid).length;
  const strengthPercent = Math.min(100, Math.round((passedCount / rules.length) * 100));

  let strengthColor = 'var(--error, #BA1A1A)';
  let strengthLabel = 'Yếu';
  if (passedCount >= 4) {
    strengthColor = 'var(--success, #466253)';
    strengthLabel = 'Mạnh';
  } else if (passedCount >= 2) {
    strengthColor = 'var(--warning, #B35C00)';
    strengthLabel = 'Trung bình';
  }

  return (
    <div>
      <Input.Password
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        disabled={disabled}
        size="large"
        prefix={<LockOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
        style={{
          borderRadius: 'var(--radius-input, 12px)',
          background: 'var(--bg-input, #FFFFFF)',
          borderColor: 'var(--border-color, #E2D9F7)',
          color: 'var(--text-primary, #28243D)',
        }}
        autoComplete="new-password"
      />

      {showStrengthMeter && (focused || value.length > 0) && (
        <div
          style={{
            marginTop: 10,
            padding: '12px 14px',
            background: 'var(--surface-container, #F1EBFF)',
            borderRadius: 'var(--radius-input, 12px)',
            border: '1px solid var(--border-color, #E2D9F7)',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6A6282)', fontWeight: 600 }}>
              Độ mạnh mật khẩu:
            </span>
            <span style={{ fontSize: '0.8rem', color: strengthColor, fontWeight: 700 }}>
              {strengthLabel}
            </span>
          </div>

          <Progress
            percent={strengthPercent}
            showInfo={false}
            strokeColor={strengthColor}
            trailColor="var(--border-color, #E2D9F7)"
            size="small"
            style={{ marginBottom: 10 }}
          />

          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {rules.map((rule) => (
              <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {rule.valid ? (
                  <CheckCircleFilled style={{ color: 'var(--success, #466253)', fontSize: '13px' }} />
                ) : (
                  <CloseCircleFilled style={{ color: 'var(--text-tertiary, #8E86A8)', fontSize: '13px' }} />
                )}
                <span
                  style={{
                    fontSize: '0.785rem',
                    fontWeight: rule.valid ? 600 : 400,
                    color: rule.valid ? 'var(--text-primary, #28243D)' : 'var(--text-secondary, #6A6282)',
                    transition: 'color 0.2s',
                  }}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};
