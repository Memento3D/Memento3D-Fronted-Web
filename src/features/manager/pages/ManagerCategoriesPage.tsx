import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../products/api/categoryApi';
import type { ProductCategory, CreateCategoryRequest, UpdateCategoryRequest } from '../../products/types/product.types';

const { TextArea } = Input;

export const ManagerCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [form] = Form.useForm();

  const { data: categories = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['manager-categories-all'],
    queryFn: () => categoryApi.list(false),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => categoryApi.create(payload),
    onSuccess: () => {
      message.success('Đã tạo danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['manager-categories-all'] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.message || 'Lỗi khi tạo danh mục'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      categoryApi.update(id, payload),
    onSuccess: () => {
      message.success('Đã cập nhật danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['manager-categories-all'] });
      setModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.message || 'Lỗi khi cập nhật danh mục'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      categoryApi.updateStatus(id, active),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái');
      queryClient.invalidateQueries({ queryKey: ['manager-categories-all'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể đổi trạng thái'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      message.success('Đã xóa danh mục');
      queryClient.invalidateQueries({ queryKey: ['manager-categories-all'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể xóa danh mục'),
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ displayOrder: 0 });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ProductCategory) => {
    setEditingCategory(c);
    form.setFieldsValue({
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      displayOrder: c.displayOrder,
      active: c.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        payload: {
          name: values.name,
          slug: values.slug || undefined,
          description: values.description,
          imageUrl: values.imageUrl,
          displayOrder: values.displayOrder,
          active: values.active,
        },
      });
    } else {
      createMutation.mutate({
        name: values.name,
        slug: values.slug || undefined,
        description: values.description,
        imageUrl: values.imageUrl,
        displayOrder: values.displayOrder,
      });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--text-primary, #28243D)', margin: 0, fontWeight: 800, fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>Quản lý Danh mục Sản phẩm</h2>
          <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
            Phân loại kỷ vật 3D, sắp xếp thứ tự hiển thị ngoài trang chủ và storefront.
          </div>
        </div>

        <Space wrap>
          <Button icon={<ReloadOutlined spin={isFetching} />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{
              background: 'var(--primary, #7C5CFC)',
              borderRadius: 'var(--radius-pill, 9999px)',
              fontWeight: 600,
              boxShadow: 'var(--shadow-primary-sm)',
              border: 'none',
            }}
          >
            Thêm danh mục
          </Button>
        </Space>
      </div>

      <Card style={{ background: '#fff', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
        <Table
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          columns={[
            {
              title: 'Thứ tự',
              dataIndex: 'displayOrder',
              key: 'displayOrder',
              width: 80,
              align: 'center',
            },
            {
              title: 'Tên danh mục',
              key: 'name',
              render: (_, c: ProductCategory) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm, 8px)', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm, 8px)', background: 'var(--surface-container, #F1EBFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      📁
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary, #28243D)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6A6282)' }}>slug: {c.slug}</div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Mô tả',
              dataIndex: 'description',
              key: 'description',
              render: (desc) => (
                <span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>{desc || '-'}</span>
              ),
            },
            {
              title: 'Trạng thái',
              key: 'active',
              render: (_, c: ProductCategory) => (
                <Switch
                  checked={c.active}
                  checkedChildren="Hiện"
                  unCheckedChildren="Ẩn"
                  onChange={(checked) => toggleStatusMutation.mutate({ id: c.id, active: checked })}
                />
              ),
            },
            {
              title: 'Thao tác',
              key: 'actions',
              align: 'right',
              render: (_, c: ProductCategory) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} onClick={() => handleOpenEdit(c)}>
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa danh mục này?"
                    description="Nếu danh mục đang chứa sản phẩm, hệ thống sẽ từ chối xóa."
                    onConfirm={() => deleteMutation.mutate(c.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Create / Edit */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder="Mini Keepsake, Figurines, Figurine..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="slug" label="Slug URL (tùy chọn)">
            <Input placeholder="mini-keepsake..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh đại diện">
            <Input placeholder="https://..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="displayOrder" label="Thứ tự hiển thị">
            <InputNumber min={0} style={{ width: '100%', borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả danh mục">
            <TextArea rows={3} placeholder="Mô tả nhóm sản phẩm kỷ vật..." style={{ borderRadius: 'var(--radius-default, 16px)' }} />
          </Form.Item>

          {editingCategory && (
            <Form.Item name="active" label="Kích hoạt" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
