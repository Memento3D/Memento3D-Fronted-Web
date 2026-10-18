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
    customerRef: 'CUST-0912',
    productName: 'Cyberpunk Mecha Keepsake',
    material: 'High-Detail Tough Resin (Navy Blue)',
    layerHeight: '0.05 mm (Ultra-fine)',
    quantity: 1,
    assignedAt: '2026-10-18 10:15',
    deadline: '2026-10-20 18:00',
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
  },
  {
    id: '2',
    orderCode: 'ORD-2026-8815',
    customerRef: 'CUST-0442',
    productName: 'Architectural Heritage Facade',
    material: 'Architectural Stone PLA (Warm White)',
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
    customerRef: 'CUST-0129',
    productName: 'Personalized Bronze Bust Figurine',
    material: 'Bronze Infused Composite',
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
    customerRef: 'CUST-0881',
    productName: 'Mechanical Chronograph Enclosure',
    material: 'Carbon Fiber PETG (Matte Black)',
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
    message.success(`Order status updated to ${nextStatus.replace(/_/g, ' ')}`);
  };

  const columns = [
    {
      title: 'Order Ref & Item',
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
            Qty: {record.quantity} &bull; Client: {record.customerRef}
          </div>
        </div>
      ),
    },
    {
      title: 'Specifications',
      key: 'specs',
      render: (_: unknown, record: ProviderOrder) => (
        <div>
          <div style={{ color: '#e2e8f0', fontSize: '0.825rem' }}>{record.material}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Precision: {record.layerHeight}</div>
        </div>
      ),
    },
    {
      title: 'Priority & SLA Deadline',
      key: 'deadline',
      render: (_: unknown, record: ProviderOrder) => (
        <div>
          {record.priority === 'RUSH' && (
            <Tag color="error" icon={<Flame size={12} style={{ marginRight: 4 }} />}>
              RUSH SLA
            </Tag>
          )}
          {record.priority === 'HIGH' && <Tag color="warning">High Priority</Tag>}
          {record.priority === 'NORMAL' && <Tag color="default">Standard SLA</Tag>}
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>
            Due: {record.deadline}
          </div>
        </div>
      ),
    },
    {
      title: 'Production State',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProviderOrder['status']) => {
        switch (status) {
          case 'PENDING_ACCEPT':
            return <Badge status="warning" text={<span style={{ color: '#f59e0b' }}>Pending Acceptance</span>} />;
          case 'IN_PRODUCTION':
            return <Badge status="processing" text={<span style={{ color: '#38bdf8' }}>3D Printing & Post-cure</span>} />;
          case 'QC_PASSED':
            return <Badge status="success" text={<span style={{ color: '#10b981' }}>QC Inspection Passed</span>} />;
          case 'READY_FOR_PICKUP':
            return <Badge status="default" text={<span style={{ color: '#a855f7' }}>Awaiting Courier Dispatch</span>} />;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: ProviderOrder) => (
        <Space size="small">
          {record.status === 'PENDING_ACCEPT' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'IN_PRODUCTION')}
            >
              Accept Order
            </Button>
          )}
          {record.status === 'IN_PRODUCTION' && (
            <Button
              size="small"
              style={{ borderColor: '#10b981', color: '#10b981' }}
              onClick={() => handleUpdateStatus(record.id, 'QC_PASSED')}
            >
              Mark QC Passed
            </Button>
          )}
          {record.status === 'QC_PASSED' && (
            <Button
              size="small"
              type="dashed"
              onClick={() => handleUpdateStatus(record.id, 'READY_FOR_PICKUP')}
            >
              Ready For Courier
            </Button>
          )}
          {record.status === 'READY_FOR_PICKUP' && (
            <Tag color="cyan" icon={<Truck size={12} style={{ marginRight: 4 }} />}>
              Manifest Generated
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
                Manufacturing Partner Hub
              </h1>
              <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 600 }}>
                ROLE_PROVIDER
              </Tag>
            </div>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Connected as: <strong style={{ color: '#e2e8f0' }}>{user?.fullName || 'Partner Provider'}</strong> ({user?.email})
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
            Sign Out
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
            <span>Active Batch Workload</span>
            <Layers size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.length} Orders
          </div>
          <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: 4 }}>
            1 waiting for partner confirmation
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>In Print Chambers</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'IN_PRODUCTION').length}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>
            Curing & post-processing running
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>QC Passed & Packaged</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {orders.filter((o) => o.status === 'QC_PASSED' || o.status === 'READY_FOR_PICKUP').length}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: 4 }}>
            Ready for delivery courier handoff
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>SLA On-Time Fulfillment</span>
            <FileCheck size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            99.4%
          </div>
          <div style={{ color: '#a855f7', fontSize: '0.75rem', marginTop: 4 }}>
            High reliability tier partner
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
              Contract 3D Print Work Orders
            </h3>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Manage assigned external production jobs, material consumption, and dispatch handoffs.
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
