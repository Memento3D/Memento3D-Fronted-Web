import React, { useRef, useState } from 'react';
import { Avatar, Button, Tag, Typography, App, Popconfirm, Space } from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  GoogleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../auth/types/auth.types';

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onUserUpdated }) => {
  const { message } = App.useApp();
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Chỉ hỗ trợ file ảnh định dạng JPEG, PNG hoặc WebP!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Dung lượng ảnh đại diện không được vượt quá 5MB!');
      return;
    }

    setUploading(true);
    try {
      const updatedUser = await profileApi.uploadAvatar(file);
      onUserUpdated(updatedUser);
      updateUser(updatedUser);
      message.success('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại sau.';
      message.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setDeleting(true);
    try {
      const updatedUser = await profileApi.deleteAvatar();
      onUserUpdated(updatedUser);
      updateUser(updatedUser);
      message.success('Đã xóa ảnh đại diện!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xóa ảnh thất bại.';
      message.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const pillStyle = { borderRadius: 'var(--radius-full)', padding: '2px 12px', fontWeight: 600, border: 'none' };
    switch (role) {
      case 'ROLE_ADMIN':
        return <Tag style={{ ...pillStyle, background: 'var(--peach-bg)', color: 'var(--peach-text)' }}>Quản trị viên (Admin)</Tag>;
      case 'ROLE_MANAGER':
        return <Tag style={{ ...pillStyle, background: 'var(--lavender-bg)', color: 'var(--primary)' }}>Quản lý (Manager)</Tag>;
      case 'ROLE_WAREHOUSE':
        return <Tag style={{ ...pillStyle, background: 'var(--surface-container)', color: 'var(--primary)' }}>Thủ kho (Warehouse)</Tag>;
      case 'ROLE_OPERATOR':
        return <Tag style={{ ...pillStyle, background: 'var(--surface-container)', color: 'var(--primary)' }}>Vận hành xưởng in</Tag>;
      case 'ROLE_PROVIDER':
        return <Tag style={{ ...pillStyle, background: 'var(--mint-bg)', color: 'var(--mint-text)' }}>Nhà cung cấp</Tag>;
      case 'ROLE_DRIVER':
        return <Tag style={{ ...pillStyle, background: 'var(--surface-container)', color: 'var(--text-secondary)' }}>Tài xế giao hàng</Tag>;
      default:
        return <Tag style={{ ...pillStyle, background: 'var(--surface-container)', color: 'var(--primary)' }}>Khách hàng Memento3D</Tag>;
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card, 10px)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Avatar with upload action */}
        <div style={{ position: 'relative' }}>
          <Avatar
            size={96}
            src={user.avatarUrl}
            icon={!user.avatarUrl && <UserOutlined style={{ color: 'var(--primary)' }} />}
            style={{
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--surface-container)',
            }}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />

          <Button
            shape="circle"
            icon={<CameraOutlined />}
            size="small"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
            title="Tải lên ảnh mới (Max 5MB)"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#fff',
              boxShadow: 'none',
            }}
          />
        </div>

        {/* User Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
              {user.fullName || 'Người dùng Memento3D'}
            </Title>
            {user.emailVerified && (
              <span title="Tài khoản đã xác minh email">
                <CheckCircleFilled style={{ color: 'var(--tertiary)', fontSize: '18px' }} />
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</Text>
            {user.provider === 'GOOGLE' && (
              <Tag icon={<GoogleOutlined />} style={{ borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                Đăng nhập Google
              </Tag>
            )}
            {getRoleBadge(user.role)}
          </div>

          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <CalendarOutlined /> Thành viên từ: {formattedDate}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action buttons */}
      <Space>
        {user.avatarUrl && (
          <Popconfirm
            title="Xóa ảnh đại diện"
            description="Bạn có chắc muốn quay lại ảnh đại diện mặc định?"
            onConfirm={handleDeleteAvatar}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
              style={{
                borderRadius: 'var(--radius-full)',
              }}
            >
              Gỡ ảnh đại diện
            </Button>
          </Popconfirm>
        )}
      </Space>
    </div>
  );
};
