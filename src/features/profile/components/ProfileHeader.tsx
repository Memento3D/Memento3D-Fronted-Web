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
    switch (role) {
      case 'ROLE_ADMIN':
        return <Tag color="volcano">Quản trị viên (Admin)</Tag>;
      case 'ROLE_MANAGER':
        return <Tag color="purple">Quản lý (Manager)</Tag>;
      case 'ROLE_WAREHOUSE':
        return <Tag color="geekblue">Thủ kho (Warehouse)</Tag>;
      case 'ROLE_OPERATOR':
        return <Tag color="gold">Vận hành xưởng in</Tag>;
      case 'ROLE_PROVIDER':
        return <Tag color="cyan">Nhà cung cấp</Tag>;
      case 'ROLE_DRIVER':
        return <Tag color="orange">Tài xế giao hàng</Tag>;
      default:
        return <Tag color="blue">Khách hàng Memento3D</Tag>;
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
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '28px 32px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* Avatar with upload action */}
        <div style={{ position: 'relative' }}>
          <Avatar
            size={96}
            src={user.avatarUrl}
            icon={!user.avatarUrl && <UserOutlined />}
            style={{
              border: '3px solid #38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
              backgroundColor: '#0284c7',
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
              backgroundColor: '#0ea5e9',
              borderColor: '#38bdf8',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* User Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
              {user.fullName || 'Người dùng Memento3D'}
            </Title>
            {user.emailVerified && (
              <span title="Tài khoản đã xác minh email">
                <CheckCircleFilled style={{ color: '#10b981', fontSize: '18px' }} />
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <Text style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{user.email}</Text>
            {user.provider === 'GOOGLE' && (
              <Tag icon={<GoogleOutlined />} color="default" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                Đăng nhập Google
              </Tag>
            )}
            {getRoleBadge(user.role)}
          </div>

          {formattedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem' }}>
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
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
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
