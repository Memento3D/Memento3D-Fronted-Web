import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  id,
  required,
  className = '',
  style = {},
  disabled,
  ...rest
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

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
          htmlFor={inputId}
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

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: leftIcon ? '38px' : '14px',
            paddingRight: rightIcon ? '38px' : '14px',
            borderRadius: 'var(--radius-input, 8px)',
            background: 'var(--bg-input, var(--color-surface))',
            color: 'var(--color-text-primary)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
            e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(186, 26, 26, 0.15)' : 'rgba(124, 92, 252, 0.16)'}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...rest}
        />

        {rightIcon && (
          <span
            style={{
              position: 'absolute',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              zIndex: 1,
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <span
          id={`${inputId}-error`}
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

Input.displayName = 'Input';
