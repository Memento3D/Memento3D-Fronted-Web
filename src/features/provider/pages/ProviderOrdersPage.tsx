import React, { useState } from 'react';
import { Tag, Badge, Button, Table, Space, message } from 'antd';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileCheck, 
  Flame
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';

interface ProviderOrder {
  id: string;
  orderCode: string;
  customerRef: string;
  productName: string;
  material: string;
  layerHeight: string;
  quantity: number;
  assignedAt: string;
  deadline: string;
  status: 'PENDING_ACCEPT' | 'IN_PRODUCTION' | 'QC_PASSED' | 'READY_FOR_PICKUP';
  priority: 'NORMAL' | 'HIGH' | 'RUSH';
}

const MOCK_PROVIDER_ORDERS: ProviderOrder[] = [
  {
    id: '1',
    orderCode: 'ORD-2026-8812',
    customerRef: 'KH-0912',
    productName: 'Kỷ vật 3D Cyberpunk Mecha',
    material: 'Resin kỹ thuật độ nét cao (Xanh Navy)',
    layerHeight: '0.05 mm (Siêu mịn)',
    quantity: 1,
    assignedAt: '2026-10-18 10:15',
    deadline: '2026-10-20 18:00',
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
  },
  {
    id: '2',
    orderCode: 'ORD-2026-8815',
    customerRef: 'KH-0442',
    productName: 'Mặt đứng kiến trúc di sản',
    material: 'PLA vân đá tự nhiên (Trắng ngà)',
    layerHeight: '0.12 mm',
    quantity: 2,
    assignedAt: '2026-10-18 12:30',
    deadline: '2026-10-21 12:00',
    status: 'PENDING_ACCEPT',
    priority: 'NORMAL',
  },
  {
    id: '3',
    orderCode: 'ORD-2026-8809',
    customerRef: 'KH-0129',
    productName: 'Tượng chân dung bán thân giả đồng',
    material: 'Vật liệu Composite pha bột đồng',
    layerHeight: '0.08 mm',
    quantity: 1,
    assignedAt: '2026-10-17 15:40',
    deadline: '2026-10-19 15:00',
    status: 'QC_PASSED',
    priority: 'RUSH',
  },
  {
    id: '4',
    orderCode: 'ORD-2026-8798',
    customerRef: 'KH-0881',
    productName: 'Vỏ đồng hồ cơ khí Chronograph',
    material: 'PETG sợi Carbon (Đen nhám)',
    layerHeight: '0.15 mm',
    quantity: 3,
    assignedAt: '2026-10-16 09:00',
    deadline: '2026-10-18 17:00',
    status: 'READY_FOR_PICKUP',
    priority: 'NORMAL',
  },
];

export const ProviderOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProviderOrder[]>(MOCK_PROVIDER_ORDERS);

  const handleUpdateStatus = (id: string, nextStatus: ProviderOrder['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: nextStatus } : ord))
    );
    const statusText =
      nextStatus === 'IN_PRODUCTION'
        ? 'Đã tiếp nhận sản xuất'
        : nextStatus === 'QC_PASSED'
        ? 'Đã kiểm tra QC đạt chuẩn'
        : nextStatus === 'READY_FOR_PICKUP'
        ? 'Sẵn sàng bàn giao tài xế'
        : nextStatus;
    message.success(`Trạng thái gia công cập nhật: ${statusText}`);
  };

  const columns = [
    {
      title: 'Mã đơn & Sản phẩm',
      key: 'orderCode',
      render: (_: unknown, record: ProviderOrder) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
            {record.orderCode}
          </div>
          <div style={{ color: '#0ea5e9', fontSize: '0.8rem', marginTop: 2 }}>
            {record.productName}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
            SL: {record.quantity} &bull; Khách: {record.customerRef}
          </div>
        </div>
      ),
    },
    {
      title: 'Thông số kỹ thuật & Vật liệu',
      key: 'specs',
      render: (_: unknown, record: ProviderOrder) => (
        <div>
          <div style={{ color: '#e2e8f0', fontSize: '0.825rem' }}>{record.material}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Độ mịn lớp in: {record.layerHeight}</div>
        </div>
      ),
    },
    {
      title: 'Mức độ ưu tiên & Hạn giao',
      key: 'deadline',
      render: (_: unknown, record: ProviderOrder) => (
        <div>
          {record.priority === 'RUSH' && (
            <Tag color="error" icon={<Flame size={12} style={{ marginRight: 4 }} />}>
              HỎA TỐC
            </Tag>
          )}
          {record.priority === 'HIGH' && <Tag color="warning">Ưu tiên cao</Tag>}
          {record.priority === 'NORMAL' && <Tag color="default">Tiêu chuẩn</Tag>}
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>
            Hạn giao: {record.deadline}
          </div>
        </div>
      ),
    },
    {
      title: 'Tiến độ gia công',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProviderOrder['status']) => {
        switch (status) {
          case 'PENDING_ACCEPT':
            return <Badge status="warning" text={<span style={{ color: '#f59e0b' }}>Chờ tiếp nhận đơn</span>} />;
          case 'IN_PRODUCTION':
            return <Badge status="processing" text={<span style={{ color: '#38bdf8' }}>Đang in 3D & Xử lý hậu kỳ</span>} />;
          case 'QC_PASSED':
            return <Badge status="success" text={<span style={{ color: '#10b981' }}>Đã đạt chuẩn QC</span>} />;
          case 'READY_FOR_PICKUP':
            return <Badge status="default" text={<span style={{ color: '#a855f7' }}>Chờ tài xế đến lấy</span>} />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: ProviderOrder) => (
        <Space size="small">
          {record.status === 'PENDING_ACCEPT' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'IN_PRODUCTION')}
            >
              Tiếp nhận đơn
            </Button>
          )}
          {record.status === 'IN_PRODUCTION' && (
            <Button
              size="small"
              style={{ borderColor: '#10b981', color: '#10b981' }}
              onClick={() => handleUpdateStatus(record.id, 'QC_PASSED')}
            >
              Xác nhận đạt QC
            </Button>
          )}
          {record.status === 'QC_PASSED' && (
            <Button
              size="small"
              type="dashed"
              onClick={() => handleUpdateStatus(record.id, 'READY_FOR_PICKUP')}
            >
              Sẵn sàng bàn giao
            </Button>
          )}
          {record.status === 'READY_FOR_PICKUP' && (
            <Tag color="cyan" icon={<Truck size={12} style={{ marginRight: 4 }} />}>
              Đã lập phiếu giao hàng
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0 32px 0' }}>
      <PageHeader
        title="Cổng Đối tác Sản xuất & Gia công"
        description={`Đang kết nối: ${user?.fullName || 'Đối tác gia công'} (${user?.email})`}
        tags={
          <Tag style={{ borderRadius: '9999px', background: 'var(--surface-container)', color: 'var(--primary)', border: '1px solid var(--color-border)', fontWeight: 600 }}>
            ROLE_PROVIDER
          </Tag>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ 
          background: 'var(--surface-card, #FFFFFF)', 
          border: '1px solid var(--border-default, #E2D9F7)', 
          borderRadius: 'var(--radius-card-standard, 24px)', 
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
            <span>Đơn hàng gia công hiện tại</span>
            <Layers size={18} color="var(--primary, #7C5CFC)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #28243D)', marginTop: 8 }}>
            {orders.length} Đơn hàng
          </div>
          <div style={{ color: 'var(--primary, #7C5CFC)', fontSize: '0.75rem', marginTop: 4, fontWeight: 600 }}>
            1 đơn chờ đối tác tiếp nhận
          </div>
        </div>

        <div style={{ 
          background: 'var(--surface-card, #FFFFFF)', 
          border: '1px solid var(--border-default, #E2D9F7)', 
          borderRadius: 'var(--radius-card-standard, 24px)', 
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
            <span>Đang trong buồng in 3D</span>
            <Clock size={18} color="var(--peach-accent, #FFBFAE)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #28243D)', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'IN_PRODUCTION').length}
          </div>
          <div style={{ color: 'var(--peach-accent, #FFBFAE)', fontSize: '0.75rem', marginTop: 4, fontWeight: 600 }}>
            Đang sấy UV & xử lý hậu kỳ
          </div>
        </div>

        <div style={{ 
          background: 'var(--surface-card, #FFFFFF)', 
          border: '1px solid var(--border-default, #E2D9F7)', 
          borderRadius: 'var(--radius-card-standard, 24px)', 
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
            <span>Đã qua kiểm định QC</span>
            <CheckCircle2 size={18} color="var(--tertiary, #466253)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #28243D)', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'QC_PASSED' || o.status === 'READY_FOR_PICKUP').length}
          </div>
          <div style={{ color: 'var(--tertiary, #466253)', fontSize: '0.75rem', marginTop: 4, fontWeight: 600 }}>
            Sẵn sàng bàn giao tài xế
          </div>
        </div>

        <div style={{ 
          background: 'var(--surface-card, #FFFFFF)', 
          border: '1px solid var(--border-default, #E2D9F7)', 
          borderRadius: 'var(--radius-card-standard, 24px)', 
          padding: 20,
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem' }}>
            <span>Đúng tiến độ cam kết (SLA)</span>
            <FileCheck size={18} color="var(--primary, #7C5CFC)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #28243D)', marginTop: 8 }}>
            99.4%
          </div>
          <div style={{ color: 'var(--primary, #7C5CFC)', fontSize: '0.75rem', marginTop: 4, fontWeight: 600 }}>
            Đối tác độ tin cậy cấp cao
          </div>
        </div>
      </div>

      {/* Main Order Batch Table */}
      <div style={{ 
        background: 'var(--surface-card, #FFFFFF)', 
        border: '1px solid var(--border-default, #E2D9F7)', 
        borderRadius: 'var(--radius-card-standard, 24px)', 
        padding: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #28243D)' }}>
              Danh sách lệnh in gia công nhận thầu
            </h3>
            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem' }}>
              Quản lý lệnh in phân bổ cho đối tác ngoài, tiêu hao vật liệu và bàn giao vận chuyển.
            </p>
          </div>
        </div>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};
export default ProviderOrdersPage;
