import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Popconfirm,
  App,
  Spin,
  Empty,
  Space,
} from 'antd';
import {
  PlusOutlined,
  HomeOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { profileApi } from '../api/profileApi';
import type { UserAddress, CreateAddressPayload, UpdateAddressPayload } from '../types/profile.types';

const { Title, Text } = Typography;

export const AddressManagerTab: React.FC = () => {
  const { message } = App.useApp();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách địa chỉ.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    form.setFieldsValue({
      label: 'HOME',
      isDefault: addresses.length === 0, // First address defaults to true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    form.resetFields();
    form.setFieldsValue({
      recipientName: addr.recipientName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district || '',
      ward: addr.ward,
      streetAddress: addr.streetAddress,
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingAddress) {
        const payload: UpdateAddressPayload = {
          recipientName: values.recipientName.trim(),
          phone: values.phone.trim(),
          province: values.province.trim(),
          district: values.district?.trim() || undefined,
          ward: values.ward.trim(),
          streetAddress: values.streetAddress.trim(),
          label: values.label,
          isDefault: values.isDefault,
        };
        await profileApi.updateAddress(editingAddress.id, payload);
        message.success('Cập nhật địa chỉ thành công!');
      } else {
        const payload: CreateAddressPayload = {
          recipientName: values.recipientName.trim(),
          phone: values.phone.trim(),
          province: values.province.trim(),
          district: values.district?.trim() || undefined,
          ward: values.ward.trim(),
          streetAddress: values.streetAddress.trim(),
          label: values.label,
          isDefault: values.isDefault,
        };
        await profileApi.createAddress(payload);
        message.success('Thêm địa chỉ mới thành công!');
      }

      setModalOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      if (err.errorFields) return; // Validation error in form
      const msg = err.response?.data?.message || 'Lỗi khi lưu thông tin địa chỉ.';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    if (addr.isDefault) return;
    setActionLoadingId(addr.id);
    try {
      await profileApi.setDefaultAddress(addr.id);
      message.success(`Đã đặt "${addr.recipientName} - ${addr.streetAddress}" làm địa chỉ mặc định!`);
      await fetchAddresses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể đặt địa chỉ mặc định.';
      message.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (addrId: string) => {
    setActionLoadingId(addrId);
    try {
      await profileApi.deleteAddress(addrId);
      message.success('Đã xóa địa chỉ!');
      await fetchAddresses();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa địa chỉ.';
      message.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getLabelTag = (label: string) => {
    switch (label) {
      case 'HOME':
        return (
          <Tag icon={<HomeOutlined />} color="cyan">
            Nhà riêng
          </Tag>
        );
      case 'OFFICE':
        return (
          <Tag icon={<ShopOutlined />} color="purple">
            Văn phòng / Công ty
          </Tag>
        );
      default:
        return (
          <Tag icon={<EnvironmentOutlined />} color="default">
            Khác
          </Tag>
        );
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
            Sổ địa chỉ nhận hàng
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Quản lý địa chỉ giao nhận vật phẩm in 3D cá nhân hóa của bạn.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          style={{
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            background: 'var(--primary)',
            borderColor: 'var(--primary)',
            boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)',
          }}
        >
          Thêm địa chỉ mới
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : addresses.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: 'var(--text-secondary)' }}>Bạn chưa lưu địa chỉ nhận hàng nào.</span>}
          style={{ padding: '40px 0' }}
        >
          <Button type="primary" onClick={handleOpenAdd} style={{ borderRadius: 'var(--radius-full)', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
            Thêm địa chỉ đầu tiên
          </Button>
        </Empty>
      ) : (
        <Row gutter={[20, 20]}>
          {addresses.map((addr) => (
            <Col xs={24} md={12} key={addr.id}>
              <div
                style={{
                  background: addr.isDefault ? 'var(--surface-high)' : 'var(--bg-card)',
                  border: addr.isDefault ? '1.5px solid var(--primary)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  boxShadow: addr.isDefault ? 'var(--shadow-card)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        {addr.recipientName}
                      </Text>
                      {getLabelTag(addr.label)}
                    </div>
                    {addr.isDefault && (
                      <Tag icon={<StarFilled />} style={{ margin: 0, fontWeight: 600, borderRadius: 'var(--radius-full)', background: 'var(--mint-bg)', color: 'var(--mint-text)', border: 'none' }}>
                        Mặc định
                      </Tag>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <PhoneOutlined style={{ color: 'var(--tertiary)' }} /> {addr.phone}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <EnvironmentOutlined style={{ color: 'var(--primary)', marginTop: 4, flexShrink: 0 }} />
                    <span>
                      {addr.streetAddress}, {addr.ward}
                      {addr.district ? `, ${addr.district}` : ''}, {addr.province}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <div>
                    {!addr.isDefault ? (
                      <Button
                        type="link"
                        size="small"
                        icon={<StarOutlined />}
                        loading={actionLoadingId === addr.id}
                        onClick={() => handleSetDefault(addr)}
                        style={{ padding: 0, color: 'var(--primary)' }}
                      >
                        Đặt làm mặc định
                      </Button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--tertiary)', fontWeight: 600 }}>Địa chỉ giao hàng chính</span>
                    )}
                  </div>

                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEdit(addr)}
                      style={{ color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)' }}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xóa địa chỉ"
                      description="Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này?"
                      onConfirm={() => handleDelete(addr.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={actionLoadingId === addr.id}
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Add / Edit Address */}
      <Modal
        title={
          <span style={{ color: '#fff', fontWeight: 700 }}>
            {editingAddress ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalSubmit}
        confirmLoading={submitting}
        okText={editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
        cancelText="Hủy bỏ"
        destroyOnClose
        styles={{
          body: {
            background: '#0f172a',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px',
          },
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Tên người nhận</span>}
                name="recipientName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên người nhận' },
                  { min: 2, message: 'Tên phải có tối thiểu 2 ký tự' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#64748b' }} />}
                  placeholder="Nguyễn Văn A"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Số điện thoại</span>}
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại người nhận' },
                  {
                    pattern: /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9\d)\d{7}$/,
                    message: 'Số điện thoại di động Việt Nam không hợp lệ (VD: 0912345678)',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#64748b' }} />}
                  placeholder="0912 345 678"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Tỉnh / Thành phố</span>}
                name="province"
                rules={[{ required: true, message: 'Vui lòng nhập Tỉnh / Thành phố' }]}
              >
                <Input placeholder="TP. Hồ Chí Minh / Hà Nội..." style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Quận / Huyện</span>}
                name="district"
              >
                <Input placeholder="Quận 1 / Quận Cầu Giấy..." style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Phường / Xã</span>}
                name="ward"
                rules={[{ required: true, message: 'Vui lòng nhập Phường / Xã' }]}
              >
                <Input placeholder="Phường Bến Nghé..." style={{ borderRadius: '8px' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Loại địa chỉ</span>}
                name="label"
                rules={[{ required: true }]}
              >
                <Select
                  style={{ borderRadius: '8px' }}
                  options={[
                    { value: 'HOME', label: 'Nhà riêng' },
                    { value: 'OFFICE', label: 'Văn phòng / Cơ quan' },
                    { value: 'OTHER', label: 'Khác' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà)</span>}
            name="streetAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Số 123 Đường Nguyễn Huệ, Chung cư Grand Riverside, Căn 12.04"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox style={{ color: '#cbd5e1' }}>Đặt làm địa chỉ nhận hàng mặc định</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
