import React from 'react';
import { Steps, Alert } from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  SendOutlined,
  SmileOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { OrderStatus } from '../types/order.types';
import { getStatusStepIndex } from '../utils/orderStateMachine';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const isCancelled = status === 'CANCELLED';
  const isRefunded = status === 'REFUNDED';
  const currentStep = getStatusStepIndex(status);

  if (isCancelled || isRefunded) {
    return (
      <div style={{ margin: '16px 0' }}>
        <Alert
          message={isCancelled ? 'Đơn hàng đã bị hủy' : 'Đơn hàng đã được hoàn tiền'}
          description={
            isCancelled
              ? 'Đơn hàng này đã bị hủy bỏ và không thể tiếp tục thực hiện.'
              : 'Giao dịch thanh toán đã được hoàn tiền cho khách hàng.'
          }
          type="error"
          showIcon
          icon={<CloseCircleOutlined style={{ fontSize: 20 }} />}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
          }}
        />
      </div>
    );
  }

  const items = [
    {
      title: 'Chờ thanh toán',
      description: 'Khởi tạo đơn hàng',
      icon: <CreditCardOutlined />,
    },
    {
      title: 'Đã xác nhận',
      description: 'Xác nhận thanh toán',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Đang in 3D',
      description: 'Vận hành xưởng in',
      icon: <PrinterOutlined />,
    },
    {
      title: 'Đang vận chuyển',
      description: 'Bàn giao giao hàng',
      icon: <SendOutlined />,
    },
    {
      title: 'Đã giao hàng',
      description: 'Giao kiện thành công',
      icon: <SmileOutlined />,
    },
  ];

  return (
    <div
      style={{
        padding: '24px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-card)',
        margin: '16px 0',
      }}
    >
      <Steps
        current={currentStep}
        items={items}
        responsive
        size="small"
      />
    </div>
  );
};
