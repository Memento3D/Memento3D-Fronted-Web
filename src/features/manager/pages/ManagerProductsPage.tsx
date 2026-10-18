import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import { categoryApi } from '../../products/api/categoryApi';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../products/types/product.types';

const { TextArea } = Input;
const { Text } = Typography;

export const ManagerProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['manager-categories-all'],
    queryFn: () => categoryApi.list(false),
  });

  // Products
  const { data: productsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['manager-products', page, keyword, selectedCategory],
    queryFn: () =>
      productApi.list({
        page: page - 1,
        size: pageSize,
        keyword: keyword || undefined,
        categorySlug: selectedCategory || undefined,
        sort: 'newest',
      }),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductRequest) => productApi.create(payload),
    onSuccess: () => {
      message.success('Đã thêm sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['manager-products'] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.message || 'Lỗi khi tạo sản phẩm'),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductRequest }) =>
      productApi.update(id, payload),
    onSuccess: () => {
      message.success('Đã cập nhật sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['manager-products'] });
      setModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
    },
    onError: (err: any) => message.error(err.message || 'Lỗi khi cập nhật sản phẩm'),
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      productApi.updateStatus(id, active),
    onSuccess: () => {
      message.success('Đã cập nhật trạng thái hoạt động');
      queryClient.invalidateQueries({ queryKey: ['manager-products'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể đổi trạng thái'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      message.success('Đã xóa sản phẩm');
      queryClient.invalidateQueries({ queryKey: ['manager-products'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể xóa sản phẩm'),
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      price: 150000,
      availability: 'AVAILABLE',
      active: true,
      featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    form.setFieldsValue({
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      categoryId: p.category?.id,
      thumbnailUrl: p.thumbnailUrl,
      availability: p.availability,
      active: p.active,
      featured: p.featured,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        payload: {
          name: values.name,
          slug: values.slug || undefined,
          shortDescription: values.shortDescription,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId,
          thumbnailUrl: values.thumbnailUrl,
          availability: values.availability,
          active: values.active,
          featured: values.featured,
        },
      });
    } else {
      createMutation.mutate({
        name: values.name,
        slug: values.slug || undefined,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId,
        thumbnailUrl: values.thumbnailUrl,
        availability: values.availability,
        featured: values.featured,
      });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontWeight: 800 }}>Quản lý Sản phẩm Kỷ vật 3D</h2>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Quản trị danh mục vật phẩm, đơn giá và cấu hình hiển thị cho khách hàng.
          </div>
        </div>

        <Space>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              borderColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Thêm sản phẩm mới
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <Card style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color)', marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={() => setPage(1)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo danh mục"
              value={selectedCategory || undefined}
              onChange={(val) => {
                setSelectedCategory(val || '');
                setPage(1);
              }}
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: 'Tất cả danh mục', value: '' },
                ...categories.map((c) => ({ label: c.name, value: c.slug })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ background: 'var(--card-bg, #0f172a)', borderColor: 'var(--border-color)' }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={productsData?.content || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            total: productsData?.totalElements || 0,
            pageSize,
            onChange: (p) => setPage(p),
          }}
          columns={[
            {
              title: 'Sản phẩm',
              key: 'product',
              render: (_, p: Product) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      📦
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/{p.slug}</div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Danh mục',
              key: 'category',
              render: (_, p: Product) => (
                <Tag color="cyan">{p.category?.name || 'Chưa phân loại'}</Tag>
              ),
            },
            {
              title: 'Đơn giá',
              dataIndex: 'price',
              key: 'price',
              align: 'right',
              render: (price) => (
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {formatCurrency(price, 'VND')}
                </span>
              ),
            },
            {
              title: 'Khả dụng',
              dataIndex: 'availability',
              key: 'availability',
              render: (av) => (
                <Tag color={av === 'AVAILABLE' ? 'green' : av === 'OUT_OF_STOCK' ? 'orange' : 'default'}>
                  {av}
                </Tag>
              ),
            },
            {
              title: 'Nổi bật',
              dataIndex: 'featured',
              key: 'featured',
              render: (f) => (f ? <Tag color="gold"><FireOutlined /> Nổi bật</Tag> : <Text type="secondary">-</Text>),
            },
            {
              title: 'Trạng thái',
              key: 'active',
              render: (_, p: Product) => (
                <Switch
                  checked={p.active}
                  checkedChildren="Hiện"
                  unCheckedChildren="Ẩn"
                  onChange={(checked) => toggleStatusMutation.mutate({ id: p.id, active: checked })}
                />
              ),
            },
            {
              title: 'Thao tác',
              key: 'actions',
              align: 'right',
              render: (_, p: Product) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(p)}>
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa sản phẩm này?"
                    description="Hành động này không thể hoàn tác."
                    onConfirm={() => deleteMutation.mutate(p.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
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
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input placeholder="Tượng chân dung Desk Sculpture..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="slug" label="Slug URL (tùy chọn)">
                <Input placeholder="tuong-chan-dung..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn danh mục"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Giá bán (VND)" rules={[{ required: true }]}>
                <InputNumber min={0} step={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="thumbnailUrl" label="URL ảnh đại diện">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="shortDescription" label="Mô tả ngắn">
            <Input placeholder="Tóm tắt đặc điểm nổi bật..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={3} placeholder="Thông số kích thước, chất liệu, độ phân giải..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={12} sm={8}>
              <Form.Item name="availability" label="Tình trạng">
                <Select
                  options={[
                    { label: 'AVAILABLE', value: 'AVAILABLE' },
                    { label: 'OUT_OF_STOCK', value: 'OUT_OF_STOCK' },
                    { label: 'DISCONTINUED', value: 'DISCONTINUED' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={6} sm={8}>
              <Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            {editingProduct && (
              <Col xs={6} sm={8}>
                <Form.Item name="active" label="Kích hoạt" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
