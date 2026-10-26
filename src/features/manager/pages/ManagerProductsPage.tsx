import React, { useCallback, useMemo, useState } from 'react';
import {
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
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FireOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../../products/api/productApi';
import { categoryApi } from '../../products/api/categoryApi';
import { formatCurrency } from '../../orders/utils/orderFormatters';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../products/types/product.types';
import { SearchBox } from '../../../components/ui/SearchBox';
import { useServerTable, useServerTableState } from '../../../components/ui/data-table/useServerTable';
import { toServerColumns } from '../../../components/ui/data-table/toServerColumns';
import type { LegacyColumn } from '../../../components/ui/data-table/toServerColumns';
import { ServerDataTable, ColumnVisibilityMenu } from '../../../components/ui/data-table/ServerDataTable';
import { queryKeys } from '../../../lib/query/queryKeys';

const { TextArea } = Input;
const { Text } = Typography;

export const ManagerProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const { sorting, pagination, setSorting, setPagination, resetPage, params } = useServerTableState({
    pageSize: 10,
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setKeyword((prev) => {
        if (prev !== value) resetPage();
        return value;
      });
    },
    [resetPage],
  );

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryApi.list(false),
  });

  // Products filters
  const productFilters = {
    ...params,
    keyword: keyword.trim() || undefined,
    categorySlug: selectedCategory || undefined,
  };

  const mapTableSortToProductSort = (sortParam?: string): 'newest' | 'priceAsc' | 'priceDesc' | 'popular' => {
    if (!sortParam) return 'newest';
    if (sortParam.startsWith('price,asc')) return 'priceAsc';
    if (sortParam.startsWith('price,desc')) return 'priceDesc';
    return 'newest';
  };

  // Products Query
  const {
    data: productsData,
    isLoading,
    refetch,
    isFetching,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.list(productFilters),
    queryFn: ({ signal }) =>
      productApi.list(
        {
          page: params.page,
          size: params.size,
          keyword: productFilters.keyword,
          categorySlug: productFilters.categorySlug,
          sort: mapTableSortToProductSort(params.sort),
        },
        signal,
      ),
    placeholderData: keepPreviousData,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductRequest) => productApi.create(payload),
    onSuccess: () => {
      message.success('Đã thêm sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
    onError: (err: any) => message.error(err.message || 'Không thể đổi trạng thái'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      message.success('Đã xóa sản phẩm');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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

  const legacyColumns: LegacyColumn<Product>[] = [
    {
      title: 'Sản phẩm',
      key: 'product',
      sorter: true,
      render: (_: any, p: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {p.thumbnailUrl ? (
            <img
              src={p.thumbnailUrl}
              alt=""
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm, 8px)', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm, 8px)', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InboxOutlined style={{ fontSize: 20, color: 'var(--text-muted)' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary, #28243D)' }}>{p.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6A6282)' }}>/{p.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_: any, p: Product) => (
        <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary-system, #5F3ADD)', border: 'none', fontWeight: 600 }}>
          {p.category?.name || 'Chưa phân loại'}
        </Tag>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      sorter: true,
      render: (price: number) => (
        <span style={{ fontWeight: 700, color: 'var(--primary, #7C5CFC)' }}>
          {formatCurrency(price, 'VND')}
        </span>
      ),
    },
    {
      title: 'Khả dụng',
      dataIndex: 'availability',
      key: 'availability',
      render: (av: string) => {
        const label = av === 'AVAILABLE' ? 'Sẵn sàng' : av === 'OUT_OF_STOCK' ? 'Hết hàng' : av === 'DISCONTINUED' ? 'Ngừng kinh doanh' : av;
        const isAvail = av === 'AVAILABLE';
        const isOutOfStock = av === 'OUT_OF_STOCK';
        return (
          <Tag
            style={{
              borderRadius: 'var(--radius-pill, 9999px)',
              background: isAvail ? 'var(--tertiary-mint, #C9E8D5)' : isOutOfStock ? 'var(--secondary-peach, #FFBFAE)' : 'var(--surface-container, #F1EBFF)',
              color: isAvail ? 'var(--tertiary, #466253)' : isOutOfStock ? '#7C3F2E' : 'var(--text-secondary, #6A6282)',
              border: 'none',
              fontWeight: 600,
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Nổi bật',
      dataIndex: 'featured',
      key: 'featured',
      render: (f: boolean) => (
        f ? (
          <Tag style={{ borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--secondary-peach, #FFBFAE)', color: '#7C3F2E', border: 'none', fontWeight: 600 }}>
            <FireOutlined /> Nổi bật
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      key: 'active',
      render: (_: any, p: Product) => (
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
      render: (_: any, p: Product) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} onClick={() => handleOpenEdit(p)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(p.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 'var(--radius-pill, 9999px)' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tanstackColumns = useMemo(() => toServerColumns<Product>(legacyColumns), []);

  const { table } = useServerTable<Product>({
    data: productsData?.content || [],
    columns: tanstackColumns,
    rowCount: productsData?.totalElements ?? 0,
    pagination,
    sorting,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getRowId: (p) => p.id,
  });

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ color: 'var(--text-primary, #28243D)', margin: 0, fontWeight: 800, fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>Quản lý Sản phẩm Kỷ vật 3D</h2>
          <div style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
            Quản trị danh mục vật phẩm, đơn giá và cấu hình hiển thị cho khách hàng.
          </div>
        </div>

        <Space wrap>
          <ColumnVisibilityMenu table={table} />
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
            Thêm sản phẩm mới
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <Card style={{ background: '#fff', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <SearchBox
              placeholder="Tìm theo tên sản phẩm..."
              defaultValue={keyword}
              onChange={handleSearchChange}
              debounceMs={350}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo danh mục"
              value={selectedCategory || undefined}
              onChange={(val) => {
                setSelectedCategory(val || '');
                resetPage();
              }}
              allowClear
              style={{ width: '100%', borderRadius: 'var(--radius-input, 20px)' }}
              options={[
                { label: 'Tất cả danh mục', value: '' },
                ...categories.map((c) => ({ label: c.name, value: c.slug })),
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ background: '#fff', borderRadius: 'var(--radius-card, 24px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-card)' }}>
        <ServerDataTable<Product>
          table={table}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={refetch}
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
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input placeholder="Tượng chân dung Desk Sculpture..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="slug" label="Slug URL (tùy chọn)">
                <Input placeholder="tuong-chan-dung..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select
                  placeholder="Chọn danh mục"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Giá bán (VND)" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                <InputNumber min={0} step={10000} style={{ width: '100%', borderRadius: 'var(--radius-input, 20px)' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="thumbnailUrl" label="URL ảnh đại diện">
            <Input placeholder="https://..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="shortDescription" label="Mô tả ngắn">
            <Input placeholder="Tóm tắt đặc điểm nổi bật..." style={{ borderRadius: 'var(--radius-input, 20px)' }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={3} placeholder="Thông số kích thước, chất liệu, độ phân giải..." style={{ borderRadius: 'var(--radius-default, 16px)' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={12} sm={8}>
              <Form.Item name="availability" label="Tình trạng">
                <Select
                  options={[
                    { label: 'Sẵn sàng (AVAILABLE)', value: 'AVAILABLE' },
                    { label: 'Hết hàng (OUT_OF_STOCK)', value: 'OUT_OF_STOCK' },
                    { label: 'Ngừng kinh doanh (DISCONTINUED)', value: 'DISCONTINUED' },
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

export default ManagerProductsPage;
