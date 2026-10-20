import React, { useState } from 'react';
import { Card, Form, Input, DatePicker, Button, Typography, Row, Col, Alert, App, Tag } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SaveOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../../auth/hooks/useAuth';
import type { User } from '../../auth/types/auth.types';

const { Title, Text } = Typography;

interface PersonalInfoTabProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ user, onUserUpdated }) => {
  const { message } = App.useApp();
  const { updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    fullName: user.fullName || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        phone: values.phone?.trim() || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      const updatedUser = await profileApi.updateProfile(payload);
      onUserUpdated(updatedUser);
      updateUser(updatedUser);
      message.success('Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
      }}
      styles={{ body: { padding: '32px' } }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
          Thông tin cơ bản
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Quản lý thông tin định danh và liên hệ chính của bạn trên Memento3D.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        requiredMark={false}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Họ và tên</span>}
              name="fullName"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên của bạn' },
                { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
                { max: 100, message: 'Họ tên không được vượt quá 100 ký tự' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                placeholder="Nguyễn Văn A"
                size="large"
                style={{ borderRadius: 'var(--radius-input, 12px)' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Số điện thoại (Việt Nam)</span>}
              name="phone"
              rules={[
                {
                  pattern: /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9\d)\d{7}$/,
                  message: 'Số điện thoại không đúng định dạng di động Việt Nam (Ví dụ: 0912345678)',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                placeholder="0912 345 678"
                size="large"
                style={{ borderRadius: 'var(--radius-input, 12px)' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Ngày sinh</span>}
              name="dateOfBirth"
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                size="large"
                style={{ width: '100%', borderRadius: 'var(--radius-input, 12px)' }}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label={<span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 600 }}>Địa chỉ Email</span>}>
              <Input
                prefix={<MailOutlined style={{ color: 'var(--text-secondary, #6A6282)' }} />}
                value={user.email}
                disabled
                size="large"
                style={{ borderRadius: 'var(--radius-input, 12px)' }}
                suffix={
                  user.emailVerified ? (
                    <Tag color="success" icon={<CheckCircleFilled />}>
                      Đã xác thực
                    </Tag>
                  ) : (
                    <Tag color="warning">Chưa xác thực</Tag>
                  )
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined style={{ color: 'var(--primary)' }} />}
          message="Chính sách bảo vệ danh tính"
          description="Địa chỉ email là định danh chính của bạn trên Memento3D và không thể tự thay đổi qua biểu mẫu này nhằm đảm bảo tính toàn vẹn và an toàn cho các giao dịch đơn hàng và in ấn 3D."
          style={{
            marginBottom: '24px',
            background: 'var(--surface-container)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-default)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            icon={<SaveOutlined />}
            style={{
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
              minWidth: '140px',
            }}
          >
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Card>
  );
};
