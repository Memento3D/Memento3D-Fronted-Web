import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Result, Button, Card, Tag, Spin } from 'antd';
import {
  ShoppingOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';
import { useEventSubscription } from '../../../shared/realtime';
import { apiClient } from '../../../services/apiClient';
import type { PaymentStatusData, RealTimeEvent } from '../../../shared/realtime';

export const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Query params from gateway redirect
  const orderId = searchParams.get('orderId') || searchParams.get('extraData');
  const paymentId = searchParams.get('paymentId');
  const resultCode = searchParams.get('resultCode') || searchParams.get('status') || searchParams.get('errorCode');
  const rawMessage = searchParams.get('message') || searchParams.get('localMessage');
  const transId = searchParams.get('transId') || searchParams.get('apptransid');
  const amount = searchParams.get('amount');

  // Determine initial status
  const initialIsSuccess = resultCode === '0' || resultCode === 'SUCCESS' || resultCode === '1';
  const initialIsFailed = resultCode !== null && !initialIsSuccess && resultCode !== 'PENDING';

  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'>(() => {
    if (initialIsSuccess) return 'SUCCESS';
    if (initialIsFailed) return 'FAILED';
    return 'PENDING';
  });

  const [statusMessage, setStatusMessage] = useState<string>(rawMessage || '');
  const [verifiedAmount, setVerifiedAmount] = useState<number | string | null>(amount);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const pollCountRef = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll backend for reconciliation fallback
  const checkStatusWithBackend = useCallback(async () => {
    try {
      setIsPolling(true);
      let res;
      if (paymentId) {
        res = await apiClient.get(`/payments/${paymentId}/status`);
      } else if (orderId) {
        res = await apiClient.get(`/orders/${orderId}`);
      }

      if (res?.data) {
        const status = res.data.status || res.data.paymentStatus;
        if (status === 'SUCCESS' || status === 'PAID') {
          setPaymentStatus('SUCCESS');
          if (res.data.amount) setVerifiedAmount(res.data.amount);
          return true;
        } else if (status === 'FAILED' || status === 'CANCELLED') {
          setPaymentStatus('FAILED');
          if (res.data.failureMessage) setStatusMessage(res.data.failureMessage);
          return true;
        }
      }
    } catch (err) {
      console.warn('[PaymentResult] Status check error:', err);
    } finally {
      setIsPolling(false);
    }
    return false;
  }, [paymentId, orderId]);

  // Subscribe to real-time PAYMENT_STATUS_CHANGED event
  useEventSubscription<PaymentStatusData>('PAYMENT_STATUS_CHANGED', (event: RealTimeEvent<PaymentStatusData>) => {
    const data = event.data;
    if (!data) return;

    // Check if event corresponds to current payment or order
    const isMatching =
      (paymentId && data.paymentId === paymentId) ||
      (orderId && data.orderId === orderId) ||
      event.resourceId === paymentId ||
      event.resourceId === orderId;

    if (isMatching) {
      console.log('[PaymentResult] Received matching live payment event:', data);
      if (data.status === 'SUCCESS') {
        setPaymentStatus('SUCCESS');
        if (data.amount) setVerifiedAmount(data.amount);
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        setPaymentStatus('FAILED');
        if (data.failureReason) setStatusMessage(data.failureReason);
      }
    }
  });

  // Watchdog timeout and fallback polling
  useEffect(() => {
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'FAILED') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Attempt verification right away
    checkStatusWithBackend();

    // Start fallback polling every 5 seconds, up to 6 times (30 seconds)
    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      const resolved = await checkStatusWithBackend();
      if (resolved || pollCountRef.current >= 6) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (!resolved && pollCountRef.current >= 6) {
          setPaymentStatus('TIMEOUT');
        }
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [paymentStatus, checkStatusWithBackend]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '140px 24px 60px' }}>
        <Card
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card-feature)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-floating)',
          }}
          styles={{ body: { padding: '48px 32px' } }}
        >
          {paymentStatus === 'PENDING' && (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 44, color: 'var(--primary)' }} spin />}
              />
              <h2 style={{ color: 'var(--text-primary)', marginTop: 20, fontWeight: 700, fontSize: '1.4rem' }}>
                Đang kiểm tra kết quả giao dịch...
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 440, margin: '0 auto 20px' }}>
                Hệ thống đang đồng bộ trạng thái thanh toán từ nhà cung cấp. Vui lòng chờ trong giây lát.
              </p>
              <Button
                icon={<ReloadOutlined spin={isPolling} />}
                onClick={() => checkStatusWithBackend()}
                style={{
                  background: 'var(--surface-container)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  height: 40,
                }}
              >
                Kiểm tra lại trạng thái
              </Button>
            </div>
          )}

          {paymentStatus === 'SUCCESS' && (
            <Result
              icon={<CheckCircleFilled style={{ color: 'var(--tertiary)', fontSize: 56 }} />}
              title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.4rem' }}>
                  Thanh toán đơn hàng thành công!
                </span>
              }
              subTitle={
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Giao dịch của bạn đã được xác nhận thành công. Memento3D đang chuẩn bị đơn hàng của bạn.
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
                      background: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      fontWeight: 600,
                      height: 40,
                      boxShadow: 'none',
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
                    background: 'var(--surface-container)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: 40,
                  }}
                >
                  Tiếp tục mua sắm
                </Button>,
              ]}
            />
          )}

          {paymentStatus === 'FAILED' && (
            <Result
              icon={<CloseCircleFilled style={{ color: 'var(--error)', fontSize: 56 }} />}
              title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.4rem' }}>
                  Thanh toán không thành công
                </span>
              }
              subTitle={
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {statusMessage || 'Giao dịch đã bị từ chối hoặc người dùng đã hủy thanh toán trên cổng.'}
                </span>
              }
              extra={[
                orderId && (
                  <Button
                    type="primary"
                    key="retry"
                    size="large"
                    danger
                    onClick={() => navigate(`/checkout?orderId=${orderId}`)}
                    style={{
                      borderRadius: 'var(--radius-sm, 6px)',
                      fontWeight: 600,
                      height: 40,
                    }}
                  >
                    Thử thanh toán lại
                  </Button>
                ),
                orderId && (
                  <Button
                    key="order"
                    size="large"
                    onClick={() => navigate(`/orders/${orderId}`)}
                    style={{
                      background: 'var(--surface-container)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      height: 40,
                    }}
                  >
                    Xem đơn hàng
                  </Button>
                ),
              ]}
            />
          )}

          {paymentStatus === 'TIMEOUT' && (
            <Result
              status="warning"
              title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.4rem' }}>
                  Đang chờ cổng thanh toán xác nhận
                </span>
              }
              subTitle={
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Giao dịch chưa nhận được phản hồi tức thì từ nhà cung cấp thanh toán. Bạn có thể kiểm tra lại trong chi tiết đơn hàng sau ít phút.
                </span>
              }
              extra={[
                orderId && (
                  <Button
                    type="primary"
                    key="order"
                    size="large"
                    onClick={() => navigate(`/orders/${orderId}`)}
                    style={{
                      background: 'var(--primary)',
                      borderColor: 'var(--primary)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      height: 40,
                      boxShadow: 'none',
                    }}
                  >
                    Kiểm tra đơn hàng
                  </Button>
                ),
                <Button
                  key="retry"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setPaymentStatus('PENDING');
                    pollCountRef.current = 0;
                    checkStatusWithBackend();
                  }}
                  style={{
                    background: 'var(--surface-container)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    height: 40,
                  }}
                >
                  Thử lại
                </Button>,
              ]}
            />
          )}

          {(orderId || transId || verifiedAmount) && (
            <div
              style={{
                background: 'var(--surface-container)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: 16,
                marginTop: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
                {orderId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mã đơn hàng:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{orderId.slice(0, 8).toUpperCase()}</span>
                  </div>
                )}

                {transId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mã giao dịch cổng:</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{transId}</span>
                  </div>
                )}

                {verifiedAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Số tiền:</span>
                    <span style={{ color: 'var(--tertiary)', fontWeight: 700 }}>
                      {Number(verifiedAmount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                  <Tag
                    style={{
                      borderRadius: 'var(--radius-sm, 4px)',
                      padding: '2px 8px',
                      fontWeight: 600,
                      border: 'none',
                      background:
                        paymentStatus === 'SUCCESS'
                          ? 'var(--mint-bg)'
                          : paymentStatus === 'FAILED'
                          ? 'var(--error-bg)'
                          : 'var(--lavender-bg)',
                      color:
                        paymentStatus === 'SUCCESS'
                          ? 'var(--mint-text)'
                          : paymentStatus === 'FAILED'
                          ? 'var(--error-text)'
                          : 'var(--primary)',
                    }}
                  >
                    {paymentStatus === 'SUCCESS'
                      ? 'Đã thanh toán'
                      : paymentStatus === 'FAILED'
                      ? 'Chưa hoàn tất'
                      : paymentStatus === 'TIMEOUT'
                      ? 'Chờ xác nhận'
                      : 'Đang xử lý'}
                  </Tag>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};
