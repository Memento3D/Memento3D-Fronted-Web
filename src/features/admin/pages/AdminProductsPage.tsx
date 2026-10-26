import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tabs,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Card,
} from 'antd';
import {
  Package,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminProduct, AdminCategory } from '../types/admin.types';

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Products state
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(0);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [productForm] = Form.useForm();

  // Categories state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
  const [categoryForm] = Form.useForm();

  // Queries
  const { data: productsPage, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products', productPage, productSearch],
    queryFn: () => adminApi.getProducts({ page: productPage, size: 10, search: productSearch.trim() || undefined }),
  });

  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  });

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: (payload: Partial<AdminProduct>) => adminApi.createProduct(payload),
    onSuccess: () => {
      message.success('Tạo sản phẩm thành công');
      setProductModalOpen(false);
      productForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể tạo sản phẩm'),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminProduct> }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: () => {
      message.success('Cập nhật sản phẩm thành công');
      setProductModalOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể cập nhật sản phẩm'),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      message.success('Đã xóa sản phẩm');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể xóa sản phẩm'),
  });

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (payload: Partial<AdminCategory>) => adminApi.createCategory(payload),
    onSuccess: () => {
      message.success('Tạo phân loại danh mục thành công');
      setCategoryModalOpen(false);
      categoryForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể tạo danh mục'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminCategory> }) =>
      adminApi.updateCategory(id, payload),
    onSuccess: () => {
      message.success('Cập nhật phân loại thành công');
      setCategoryModalOpen(false);
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể cập nhật danh mục'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      message.success('Đã xóa phân loại danh mục');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => message.error(err.message || 'Không thể xóa danh mục đang có sản phẩm'),
  });

  // Product Columns
  const productColumns = [
    {
      title: 'Tên sản phẩm',
      key: 'name',
      render: (_: any, r: AdminProduct) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.description || 'Chưa có mô tả'}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat: string) => <Tag color="blue">{cat || 'Mặc định'}</Tag>,
    },
    {
      title: 'Đơn giá cơ sở',
      dataIndex: 'price',
      key: 'price',
      render: (val: number, r: AdminProduct) => (
        <span style={{ fontWeight: 700, color: '#10b981' }}>
          {(val || r.basePrice || 0).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: AdminProduct) => {
        const active = r.isActive !== false && r.status !== 'INACTIVE';
        return <Tag color={active ? 'success' : 'default'}>{active ? 'Đang bán' : 'Ẩn'}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: AdminProduct) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Edit2 size={13} />}
            onClick={() => {
              setSelectedProduct(r);
              productForm.setFieldsValue({
                name: r.name,
                description: r.description,
                price: r.price || r.basePrice,
                categoryId: r.categoryId,
                isActive: r.isActive !== false,
              });
              setProductModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa sản phẩm?"
            onConfirm={() => deleteProductMutation.mutate(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<Trash2 size={13} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Category Columns
  const categoryColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>,
    },
    {
      title: 'Đường dẫn (Slug)',
      dataIndex: 'slug',
      key: 'slug',
      render: (val: string) => <Tag color="purple">{val || '—'}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (val: string) => <span style={{ color: 'var(--text-secondary)' }}>{val || '—'}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: AdminCategory) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Edit2 size={13} />}
            onClick={() => {
              setSelectedCategory(r);
              categoryForm.setFieldsValue({
                name: r.name,
                slug: r.slug,
                description: r.description,
              });
              setCategoryModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa danh mục?"
            description="Hệ thống sẽ từ chối nếu có sản phẩm đang thuộc danh mục này."
            onConfirm={() => deleteCategoryMutation.mutate(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<Trash2 size={13} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-products-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Quản trị Sản phẩm & Danh mục Hệ thống
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Thiết lập bảng giá, phân loại danh mục sản phẩm và trạng thái niêm yết
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={() => {
              refetchProducts();
              refetchCategories();
            }}
          >
            Làm mới
          </Button>
          {activeTab === 'products' ? (
            <Button
              type="primary"
              icon={<Plus size={15} />}
              onClick={() => {
                setSelectedProduct(null);
                productForm.resetFields();
                setProductModalOpen(true);
              }}
              style={{ background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
            >
              Thêm sản phẩm
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={15} />}
              onClick={() => {
                setSelectedCategory(null);
                categoryForm.resetFields();
                setCategoryModalOpen(true);
              }}
              style={{ background: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 600 }}
            >
              Thêm danh mục
            </Button>
          )}
        </div>
      </div>

      <Card bordered={false} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'products',
              label: (
                <Space>
                  <Package size={16} />
                  <span>Sản phẩm</span>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      placeholder="Tìm kiếm sản phẩm theo tên..."
                      prefix={<Search size={14} style={{ color: 'var(--text-secondary)' }} />}
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductPage(0);
                      }}
                      style={{ maxWidth: 320 }}
                      allowClear
                    />
                  </div>
                  <Table
                    columns={productColumns}
                    dataSource={productsPage?.content || []}
                    rowKey="id"
                    loading={loadingProducts}
                    pagination={{
                      current: productPage + 1,
                      pageSize: 10,
                      total: productsPage?.totalElements || 0,
                      onChange: (p) => setProductPage(p - 1),
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'categories',
              label: (
                <Space>
                  <Layers size={16} />
                  <span>Danh mục phân loại</span>
                </Space>
              ),
              children: (
                <Table
                  columns={categoryColumns}
                  dataSource={categories || []}
                  rowKey="id"
                  loading={loadingCategories}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Product Modal */}
      <Modal
        title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={productForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedProduct) {
              updateProductMutation.mutate({ id: selectedProduct.id, payload: values });
            } else {
              createProductMutation.mutate(values);
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Đơn giá (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục">
            <Select placeholder="Chọn danh mục" allowClear>
              {categories?.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Button onClick={() => setProductModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createProductMutation.isPending || updateProductMutation.isPending}
            >
              Lưu sản phẩm
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedCategory) {
              updateCategoryMutation.mutate({ id: selectedCategory.id, payload: values });
            } else {
              createCategoryMutation.mutate(values);
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Đường dẫn (Slug)">
            <Input placeholder="vi-du-mo-hinh-3d" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <Button onClick={() => setCategoryModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              Lưu danh mục
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
