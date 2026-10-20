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
        return <ShoppingOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />;
      case 'PAYMENT':
        return <CreditCardOutlined style={{ color: 'var(--tertiary, #466253)' }} />;
      case 'MODEL_REVIEW':
        return <CheckCircleOutlined style={{ color: 'var(--secondary, #FFBFAE)' }} />;
      case 'PRINT_JOB':
        return <PrinterOutlined style={{ color: 'var(--primary-system, #5F3ADD)' }} />;
      default:
        return <InfoCircleOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />;
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
        return 'var(--tertiary, #466253)';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'var(--secondary, #FFBFAE)';
      case 'ERROR':
        return 'var(--error, #BA1A1A)';
      default:
        return 'var(--text-muted, #8E86A8)';
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
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 8,
        }}
      >
        <Space>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.975rem' }}>
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
                boxShadow: connectionStatus === 'CONNECTED' ? '0 0 8px var(--mint, #C9E8D5)' : undefined,
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
            style={{ padding: 0, fontSize: '0.8rem', color: 'var(--primary, #7C5CFC)', fontWeight: 600 }}
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
            <div style={{ padding: '24px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>
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
              padding: '10px 12px',
              borderRadius: 'var(--radius-default, 16px)',
              cursor: 'pointer',
              background: item.isRead ? 'transparent' : 'var(--surface-container, #F1EBFF)',
              marginBottom: 4,
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--surface-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  border: '1px solid var(--border-color)',
                }}
              >
                {getNotificationIcon(item.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text
                    style={{
                      color: item.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
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
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        flexShrink: 0,
                        marginLeft: 6,
                        boxShadow: '0 0 6px var(--primary-glow)',
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.775rem',
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  {item.message}
                </div>

                <div
                  style={{
                    color: 'var(--text-muted)',
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
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-color, #E2D9F7)',
        borderRadius: 'var(--radius-card, 24px)',
        boxShadow: 'var(--shadow-floating)',
        padding: '16px 18px',
      }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 4]} overflowCount={99}>
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined style={{ fontSize: 18, color: 'var(--text-primary)' }} />}
          style={{
            background: open ? 'var(--surface-high, #EBE4FF)' : 'var(--surface-container, #F1EBFF)',
            border: '1px solid var(--border-color, #E2D9F7)',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
          }}
        />
      </Badge>
    </Popover>
  );
};
