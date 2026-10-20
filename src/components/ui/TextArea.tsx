import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  fullWidth = true,
  id,
  required,
  rows = 4,
  className = '',
  style = {},
  disabled,
  ...rest
}, ref) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: fullWidth ? '100%' : 'auto',
      }}
      className={`form-field-group ${className}`}
    >
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-default, 16px)',
          background: 'var(--bg-input, var(--color-surface))',
          color: 'var(--color-text-primary)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          fontSize: '0.9rem',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(186, 26, 26, 0.15)' : 'var(--primary-glow)'}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...rest}
      />

      {error ? (
        <span
          id={`${textareaId}-error`}
          style={{
            fontSize: '0.775rem',
            color: 'var(--color-danger)',
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            fontSize: '0.775rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

TextArea.displayName = 'TextArea';
