import React, { useState } from 'react';
import { Badge, Popover, Button, List, Typography, Space, Tooltip, notification as antdNotification } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationService, type AppNotification } from '../../services/notificationService';
import { useRealTime, useEventSubscription } from '../../shared/realtime';
import type { NotificationData, RealTimeEvent } from '../../shared/realtime';

const { Text } = Typography;

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { connectionStatus } = useRealTime();

  // Queries
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000,
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(0, 15),
    enabled: open,
  });

  const notifications = notificationsData?.content || [];

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  // Subscribe to live notification creation
  useEventSubscription<NotificationData>('NOTIFICATION_CREATED', (event: RealTimeEvent<NotificationData>) => {
    const data = event.data;
    if (data) {
      antdNotification.info({
        message: data.title || 'Thông báo mới',
        description: data.message,
        placement: 'topRight',
        duration: 6,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    }
  });

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingOutlined style={{ color: '#38bdf8' }} />;
      case 'PAYMENT':
        return <CreditCardOutlined style={{ color: '#22c55e' }} />;
      case 'MODEL_REVIEW':
        return <CheckCircleOutlined style={{ color: '#f59e0b' }} />;
      case 'PRINT_JOB':
        return <PrinterOutlined style={{ color: '#a855f7' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#0ea5e9' }} />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    setOpen(false);

    if (item.referenceType === 'ORDER' && item.referenceId) {
      navigate(`/orders/${item.referenceId}`);
    } else if (item.referenceType === 'SCAN' && item.referenceId) {
      navigate(`/scans/${item.referenceId}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return '#22c55e';
      case 'CONNECTING':
      case 'RECONNECTING':
        return '#f59e0b';
      case 'ERROR':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const content = (
    <div style={{ width: 360, maxWidth: '90vw' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 8,
        }}
      >
        <Space>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
            Thông báo
          </span>
          <Tooltip title={`SSE Real-time: ${connectionStatus}`}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                boxShadow: connectionStatus === 'CONNECTED' ? '0 0 8px #22c55e' : undefined,
              }}
            />
          </Tooltip>
        </Space>

        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAllAsReadMutation.mutate()}
            loading={markAllAsReadMutation.isPending}
            style={{ padding: 0, fontSize: '0.8rem', color: '#38bdf8' }}
          >
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      <List
        loading={isLoading}
        dataSource={notifications}
        locale={{
          emptyText: (
            <div style={{ padding: '24px 0', color: '#94a3b8', textAlign: 'center' }}>
              Không có thông báo mới
            </div>
          ),
        }}
        style={{ maxHeight: 380, overflowY: 'auto' }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => handleNotificationClick(item)}
            style={{
              padding: '10px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              background: item.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.06)',
              marginBottom: 4,
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {getNotificationIcon(item.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text
                    style={{
                      color: item.isRead ? '#cbd5e1' : '#fff',
                      fontWeight: item.isRead ? 500 : 700,
                      fontSize: '0.85rem',
                    }}
                    ellipsis
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        flexShrink: 0,
                        marginLeft: 6,
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.775rem',
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  {item.message}
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.7rem',
                    marginTop: 4,
                  }}
                >
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayInnerStyle={{
        background: '#0b1120',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 14,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        padding: '14px 16px',
      }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 4]} overflowCount={99}>
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined style={{ fontSize: 18, color: '#f8fafc' }} />}
          style={{
            background: open ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Badge>
    </Popover>
  );
};
