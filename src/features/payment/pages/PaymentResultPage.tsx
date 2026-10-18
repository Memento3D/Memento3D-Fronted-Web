import React from 'react';
import { Result, Button, Card, Tag } from 'antd';
import {
  ShoppingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';

export const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Common payment gateway query params (MoMo, ZaloPay)
  const orderId = searchParams.get('orderId') || searchParams.get('extraData');
  const resultCode = searchParams.get('resultCode') || searchParams.get('status') || searchParams.get('errorCode');
  const messageText = searchParams.get('message') || searchParams.get('localMessage');
  const transId = searchParams.get('transId') || searchParams.get('apptransid');
  const amount = searchParams.get('amount');

  // resultCode 0 is standard success for MoMo & ZaloPay
  const isSuccess = resultCode === '0' || resultCode === 'SUCCESS' || resultCode === '1';

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 60px' }}>
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: '40px 24px' }}
        >
          <Result
            status={isSuccess ? 'success' : 'error'}
            title={
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem' }}>
                {isSuccess ? 'Thanh toán đơn hàng thành công!' : 'Thanh toán không thành công'}
              </span>
            }
            subTitle={
              <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
                {isSuccess
                  ? 'Giao dịch của bạn đã được ghi nhận. Xưởng in Memento3D sẽ bắt đầu chuẩn bị lệnh in.'
                  : messageText || 'Giao dịch đã bị từ chối hoặc bị hủy bởi người dùng.'}
              </span>
            }
            extra={[
              orderId && (
                <Button
                  type="primary"
                  key="order"
                  size="large"
                  icon={<FileTextOutlined />}
                  onClick={() => navigate(`/orders/${orderId}`)}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                    borderColor: 'transparent',
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  Xem chi tiết đơn hàng
                </Button>
              ),
              <Button
                key="home"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              >
                Tiếp tục mua sắm
              </Button>,
            ]}
          >
            {(orderId || transId || amount) && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 12,
                  padding: 20,
                  marginTop: 24,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
                  {orderId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Mã đơn hàng:</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>#{orderId.slice(0, 8).toUpperCase()}</span>
                    </div>
                  )}

                  {transId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Mã giao dịch cổng:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{transId}</span>
                    </div>
                  )}

                  {amount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Số tiền:</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>
                        {Number(amount).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Trạng thái:</span>
                    <Tag color={isSuccess ? 'success' : 'error'}>
                      {isSuccess ? 'ĐÃ THANH TOÁN (PAID)' : 'CHƯA HOÀN TẤT (FAILED)'}
                    </Tag>
                  </div>
                </div>
              </div>
            )}
          </Result>
        </Card>
      </main>

      <Footer />
    </div>
  );
};
