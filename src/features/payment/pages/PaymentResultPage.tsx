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
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 60px' }}>
        <Card
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          }}
          bodyStyle={{ padding: '40px 24px' }}
        >
          {paymentStatus === 'PENDING' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 54, color: '#38bdf8' }} spin />}
              />
              <h2 style={{ color: '#fff', marginTop: 24, fontWeight: 700 }}>
                Đang xác thực giao dịch thời gian thực...
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 460, margin: '0 auto 24px' }}>
                Hệ thống đang đồng bộ kết quả từ cổng thanh toán qua luồng sự kiện Kafka. Vui lòng chờ trong giây lát.
              </p>
              <Button
                icon={<ReloadOutlined spin={isPolling} />}
                onClick={() => checkStatusWithBackend()}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: 8,
                }}
              >
                Kiểm tra lại trạng thái
              </Button>
            </div>
          )}

          {paymentStatus === 'SUCCESS' && (
            <Result
              icon={<CheckCircleFilled style={{ color: '#22c55e', fontSize: 64 }} />}
              title={
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem' }}>
                  Thanh toán đơn hàng thành công!
                </span>
              }
              subTitle={
                <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
                  Giao dịch của bạn đã được xác nhận thành công qua Kafka event stream. Xưởng in Memento3D đang chuẩn bị lệnh in.
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
            />
          )}

          {paymentStatus === 'FAILED' && (
            <Result
              icon={<CloseCircleFilled style={{ color: '#ef4444', fontSize: 64 }} />}
              title={
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem' }}>
                  Thanh toán không thành công
                </span>
              }
              subTitle={
                <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
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
                      borderRadius: 8,
                      fontWeight: 700,
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
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      borderRadius: 8,
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
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem' }}>
                  Đang chờ cổng thanh toán xác nhận
                </span>
              }
              subTitle={
                <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
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
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                      borderColor: 'transparent',
                      borderRadius: 8,
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: 8,
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
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: 20,
                marginTop: 24,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
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

                {verifiedAmount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Số tiền:</span>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>
                      {Number(verifiedAmount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Trạng thái:</span>
                  <Tag
                    color={
                      paymentStatus === 'SUCCESS'
                        ? 'success'
                        : paymentStatus === 'FAILED'
                        ? 'error'
                        : paymentStatus === 'TIMEOUT'
                        ? 'warning'
                        : 'processing'
                    }
                  >
                    {paymentStatus === 'SUCCESS'
                      ? 'ĐÃ THANH TOÁN (PAID)'
                      : paymentStatus === 'FAILED'
                      ? 'CHƯA HOÀN TẤT (FAILED)'
                      : paymentStatus === 'TIMEOUT'
                      ? 'CHỜ XÁC NHẬN (PENDING)'
                      : 'ĐANG XỬ LÝ (PROCESSING)'}
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
