import React, { useState } from 'react';
import { Input, Progress, Typography, Space } from 'antd';
import { LockOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

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

  let strengthColor = '#ef4444';
  let strengthLabel = 'Yếu';
  if (passedCount >= 4) {
    strengthColor = '#10b981';
    strengthLabel = 'Mạnh';
  } else if (passedCount >= 2) {
    strengthColor = '#f59e0b';
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
        prefix={<LockOutlined style={{ color: '#64748b' }} />}
        style={{
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          color: '#f8fafc',
        }}
        autoComplete="new-password"
      />

      {showStrengthMeter && (focused || value.length > 0) && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Độ mạnh mật khẩu:</Text>
            <Text strong style={{ fontSize: '0.75rem', color: strengthColor }}>
              {strengthLabel}
            </Text>
          </div>

          <Progress
            percent={strengthPercent}
            showInfo={false}
            strokeColor={strengthColor}
            trailColor="rgba(255, 255, 255, 0.1)"
            size="small"
            style={{ marginBottom: 10 }}
          />

          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {rules.map((rule) => (
              <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {rule.valid ? (
                  <CheckCircleFilled style={{ color: '#10b981', fontSize: '12px' }} />
                ) : (
                  <CloseCircleFilled style={{ color: '#64748b', fontSize: '12px' }} />
                )}
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: rule.valid ? '#e2e8f0' : '#64748b',
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
