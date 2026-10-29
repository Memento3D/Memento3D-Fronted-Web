import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Spin, Typography } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  FileTextOutlined,
  HomeOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { paymentApi } from '../../orders/api/paymentApi';
import type { VnpayReturnResponse } from '../../orders/types/order.types';
import { formatCurrency } from '../../orders/utils/orderFormatters';

const { Title, Text } = Typography;

export const VnpayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verificationResult, setVerificationResult] = useState<VnpayReturnResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyTransaction = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Call backend verification API (public endpoint with signature verification)
        const response = await paymentApi.verifyVnpayReturn(params);
        if (isMounted) {
          setVerificationResult(response);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Không thể xác thực giao dịch VNPAY. Vui lòng kiểm tra lại đơn hàng.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const isSuccess = verificationResult?.status === 'SUCCESS';
  const isCancelled = verificationResult?.status === 'CANCELLED';
  const orderId = verificationResult?.orderId;
  const amount = verificationResult?.amount;
  const transactionRef = verificationResult?.transactionRef;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '140px 24px 60px' }}>
        <Card
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card-feature)',
            boxShadow: 'var(--shadow-floating)',
            overflow: 'hidden',
          }}
          styles={{ body: { padding: '48px 32px' } }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 52, color: 'var(--primary)' }} spin />} />
              <Title level={3} style={{ color: 'var(--text-primary)', marginTop: 24, fontWeight: 700 }}>
                Đang xác nhận thanh toán...
              </Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'block', maxWidth: 480, margin: '8px auto 0' }}>
                Hệ thống đang kết nối với cổng VNPAY để kiểm tra chữ ký số bảo mật và xác thực trạng thái đơn hàng.
              </Text>
            </div>
          ) : isSuccess ? (
            <Result
              icon={<CheckCircleFilled style={{ color: 'var(--tertiary)', fontSize: 64 }} />}
              title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.7rem' }}>
                  Thanh toán thành công
                </span>
              }
              subTitle={
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {verificationResult.message || 'Giao dịch qua cổng VNPAY đã được ghi nhận thành công.'}
                </span>
              }
              extra={[
                <div
                  key="details"
                  style={{
                    background: 'var(--surface-container)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-default)',
                    padding: '20px 24px',
                    margin: '24px auto 32px',
                    maxWidth: 520,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: 'var(--text-secondary)' }}>Mã tham chiếu:</Text>
                    <Text strong style={{ color: 'var(--text-primary)' }}>{transactionRef || 'N/A'}</Text>
                  </div>
                  {orderId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Mã đơn hàng:</Text>
                      <Text strong style={{ color: 'var(--text-primary)' }}>
                        {orderId.length > 12 ? orderId.slice(0, 8).toUpperCase() : orderId}
                      </Text>
                    </div>
                  )}
                  {amount !== undefined && amount !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Số tiền:</Text>
                      <Text strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>
                        {formatCurrency(amount, 'VND')}
                      </Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: 'var(--text-secondary)' }}>Phương thức:</Text>
                    <Text strong style={{ color: '#005cb9' }}>VNPAY</Text>
                  </div>
                  {verificationResult.bankCode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Ngân hàng / Cổng:</Text>
                      <Text strong style={{ color: 'var(--text-primary)' }}>{verificationResult.bankCode}</Text>
                    </div>
                  )}
                  {verificationResult.gatewayTransactionNo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Mã giao dịch VNPAY:</Text>
                      <Text strong style={{ color: 'var(--text-primary)' }}>{verificationResult.gatewayTransactionNo}</Text>
                    </div>
                  )}
                </div>,
                <div key="actions" style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {orderId && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<FileTextOutlined />}
                      onClick={() => navigate(`/orders/${orderId}`)}
                      style={{
                        background: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                        padding: '0 28px',
                        boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                      }}
                    >
                      Xem đơn hàng
                    </Button>
                  )}
                  <Button
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/')}
                    style={{
                      background: 'var(--surface-container)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0 28px',
                    }}
                  >
                    Về trang chủ
                  </Button>
                </div>,
              ]}
            />
          ) : (
            <Result
              icon={<CloseCircleFilled style={{ color: '#ef4444', fontSize: 64 }} />}
              title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.7rem' }}>
                  {isCancelled ? 'Thanh toán đã hủy' : 'Thanh toán chưa thành công'}
                </span>
              }
              subTitle={
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {verificationResult?.message ||
                    errorMessage ||
                    'Giao dịch qua cổng VNPAY không thể hoàn tất hoặc đã bị từ chối/hủy.'}
                </span>
              }
              extra={[
                <div
                  key="details-fail"
                  style={{
                    background: 'var(--surface-container)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-default)',
                    padding: '16px 20px',
                    margin: '20px auto 28px',
                    maxWidth: 480,
                    textAlign: 'left',
                  }}
                >
                  {transactionRef && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Mã tham chiếu:</Text>
                      <Text strong style={{ color: 'var(--text-primary)' }}>{transactionRef}</Text>
                    </div>
                  )}
                  {amount !== undefined && amount !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: 'var(--text-secondary)' }}>Số tiền:</Text>
                      <Text strong style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(amount, 'VND')}
                      </Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'var(--text-secondary)' }}>Trạng thái:</Text>
                    <Text strong style={{ color: '#ef4444' }}>
                      {isCancelled ? 'Đã hủy' : 'Không thành công'}
                    </Text>
                  </div>
                </div>,
                <div key="fail-actions" style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {orderId && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<RedoOutlined />}
                      onClick={() => navigate(`/orders/${orderId}?pay=true`)}
                      style={{
                        background: 'var(--primary)',
                        borderColor: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                        padding: '0 28px',
                        boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
                      }}
                    >
                      Thanh toán lại
                    </Button>
                  )}
                  {orderId && (
                    <Button
                      size="large"
                      icon={<FileTextOutlined />}
                      onClick={() => navigate(`/orders/${orderId}`)}
                      style={{
                        background: 'var(--surface-container)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0 28px',
                      }}
                    >
                      Xem đơn hàng
                    </Button>
                  )}
                  <Button
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/')}
                    style={{
                      background: 'var(--surface-container)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0 24px',
                    }}
                  >
                    Về trang chủ
                  </Button>
                </div>,
              ]}
            />
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};
