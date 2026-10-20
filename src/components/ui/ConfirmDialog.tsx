import React from 'react';
import { Modal } from 'antd';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

export interface ConfirmDialogOptions {
  title: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  isDanger?: boolean;
  type?: 'warning' | 'danger' | 'info';
  onConfirm: () => Promise<void> | void;
}

export const showConfirmDialog = ({
  title,
  content,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  isDanger = false,
  type = isDanger ? 'danger' : 'warning',
  onConfirm,
}: ConfirmDialogOptions) => {
  const iconMap = {
    danger: <AlertTriangle size={22} color="var(--color-danger)" />,
    warning: <AlertTriangle size={22} color="var(--color-warning)" />,
    info: <Info size={22} color="var(--color-info)" />,
  };

  return Modal.confirm({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {iconMap[type] || <HelpCircle size={22} color="var(--color-primary)" />}
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
      </div>
    ),
    content: (
      <div style={{ marginTop: 10, color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {content}
      </div>
    ),
    okText,
    cancelText,
    okButtonProps: {
      danger: isDanger || type === 'danger',
      style: {
        borderRadius: '9999px',
        fontWeight: 600,
      },
    },
    cancelButtonProps: {
      style: {
        borderRadius: '9999px',
      },
    },
    centered: true,
    maskClosable: true,
    onOk: onConfirm,
  });
};
