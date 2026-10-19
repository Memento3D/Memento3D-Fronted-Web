import React, { useState } from 'react';
import { Tag, Badge, Button, Table, Space, message } from 'antd';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileCheck, 
  LogOut, 
  Flame
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProviderOrder[]>(MOCK_PROVIDER_ORDERS);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        paddingBottom: 20, 
        marginBottom: 28 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 10, 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                Cổng Đối tác Sản xuất & Gia công
              </h1>
              <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 600 }}>
                ROLE_PROVIDER (Đối tác sản xuất)
              </Tag>
            </div>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Đang kết nối: <strong style={{ color: '#e2e8f0' }}>{user?.fullName || 'Đối tác gia công'}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            danger
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            style={{ borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đơn hàng gia công hiện tại</span>
            <Layers size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.length} Đơn hàng
          </div>
          <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: 4 }}>
            1 đơn chờ đối tác tiếp nhận
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đang trong buồng in 3D</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'IN_PRODUCTION').length}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>
            Đang sấy UV & xử lý hậu kỳ
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đã qua kiểm định QC</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'QC_PASSED' || o.status === 'READY_FOR_PICKUP').length}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: 4 }}>
            Sẵn sàng bàn giao tài xế
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đúng tiến độ cam kết (SLA)</span>
            <FileCheck size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            99.4%
          </div>
          <div style={{ color: '#a855f7', fontSize: '0.75rem', marginTop: 4 }}>
            Đối tác độ tin cậy cấp cao
          </div>
        </div>
      </div>

      {/* Main Order Batch Table */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.65)', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: 12, 
        padding: 24 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              Danh sách lệnh in gia công nhận thầu
            </h3>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
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
