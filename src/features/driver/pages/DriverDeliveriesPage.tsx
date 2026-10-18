import React, { useState } from 'react';
import { Tag, Badge, Button, Table, Space, message } from 'antd';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  PhoneCall, 
  Navigation, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DeliveryRun {
  id: string;
  trackingCode: string;
  orderRef: string;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  itemDescription: string;
  weightGrams: number;
  paymentType: 'PREPAID' | 'COD_VND';
  codAmount?: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  eta: string;
}

const MOCK_DELIVERIES: DeliveryRun[] = [
  {
    id: '1',
    trackingCode: 'EXP-88912-VN',
    orderRef: 'ORD-2026-8812',
    recipientName: 'Nguyen Van An',
    phone: '0901-234-567',
    shippingAddress: '45 Le Duan, District 1, Ho Chi Minh City',
    itemDescription: 'Cyberpunk Mecha 3D Keepsake (Fragile Resin)',
    weightGrams: 350,
    paymentType: 'PREPAID',
    status: 'IN_TRANSIT',
    eta: '14:30 Today',
  },
  {
    id: '2',
    trackingCode: 'EXP-88915-VN',
    orderRef: 'ORD-2026-8798',
    recipientName: 'Tran Thi Bich',
    phone: '0912-345-678',
    shippingAddress: '128 Nguyen Thi Minh Khai, District 3, Ho Chi Minh City',
    itemDescription: 'Mechanical Chronograph Enclosure (3 units)',
    weightGrams: 620,
    paymentType: 'COD_VND',
    codAmount: 450000,
    status: 'PICKED_UP',
    eta: '16:00 Today',
  },
  {
    id: '3',
    trackingCode: 'EXP-88902-VN',
    orderRef: 'ORD-2026-8755',
    recipientName: 'Le Hoang Minh',
    phone: '0988-765-432',
    shippingAddress: 'Villa 14, Thao Dien, Thu Duc City',
    itemDescription: 'Bronze Architectural Facade Scale Model',
    weightGrams: 1200,
    paymentType: 'PREPAID',
    status: 'ASSIGNED',
    eta: 'Awaiting Hub Pickup',
  },
  {
    id: '4',
    trackingCode: 'EXP-88840-VN',
    orderRef: 'ORD-2026-8711',
    recipientName: 'Dang Quoc Bao',
    phone: '0933-445-566',
    shippingAddress: '72 Vo Van Kiet, District 5, Ho Chi Minh City',
    itemDescription: 'Customized Keepsake Figurine',
    weightGrams: 280,
    paymentType: 'PREPAID',
    status: 'DELIVERED',
    eta: 'Delivered at 11:15',
  },
];

export const DriverDeliveriesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryRun[]>(MOCK_DELIVERIES);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateStatus = (id: string, nextStatus: DeliveryRun['status']) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    message.success(`Delivery status updated: ${nextStatus.replace(/_/g, ' ')}`);
  };

  const columns = [
    {
      title: 'Tracking & Order',
      key: 'tracking',
      render: (_: unknown, record: DeliveryRun) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>
            {record.trackingCode}
          </div>
          <div style={{ color: '#0ea5e9', fontSize: '0.775rem' }}>
            Ref: {record.orderRef}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.725rem' }}>
            {record.itemDescription} ({record.weightGrams}g)
          </div>
        </div>
      ),
    },
    {
      title: 'Recipient & Destination',
      key: 'destination',
      render: (_: unknown, record: DeliveryRun) => (
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.85rem' }}>
            {record.recipientName}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <PhoneCall size={12} /> {record.phone}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={12} color="#f59e0b" /> {record.shippingAddress}
          </div>
        </div>
      ),
    },
    {
      title: 'Billing & Terms',
      key: 'billing',
      render: (_: unknown, record: DeliveryRun) => (
        <div>
          {record.paymentType === 'PREPAID' ? (
            <Tag color="green">PAID ONLINE</Tag>
          ) : (
            <Tag color="gold">
              COD: {record.codAmount?.toLocaleString('vi-VN')} VND
            </Tag>
          )}
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>
            ETA: {record.eta}
          </div>
        </div>
      ),
    },
    {
      title: 'Delivery Progress',
      dataIndex: 'status',
      key: 'status',
      render: (status: DeliveryRun['status']) => {
        switch (status) {
          case 'ASSIGNED':
            return <Badge status="default" text={<span style={{ color: '#94a3b8' }}>At Warehouse Dock</span>} />;
          case 'PICKED_UP':
            return <Badge status="warning" text={<span style={{ color: '#f59e0b' }}>Picked Up from Hub</span>} />;
          case 'IN_TRANSIT':
            return <Badge status="processing" text={<span style={{ color: '#38bdf8' }}>On Route / In Transit</span>} />;
          case 'DELIVERED':
            return <Badge status="success" text={<span style={{ color: '#10b981' }}>Delivered & Signed</span>} />;
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: DeliveryRun) => (
        <Space size="small">
          {record.status === 'ASSIGNED' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'PICKED_UP')}
            >
              Confirm Hub Pickup
            </Button>
          )}
          {record.status === 'PICKED_UP' && (
            <Button
              size="small"
              style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
              onClick={() => handleUpdateStatus(record.id, 'IN_TRANSIT')}
            >
              Start Transit
            </Button>
          )}
          {record.status === 'IN_TRANSIT' && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => handleUpdateStatus(record.id, 'DELIVERED')}
            >
              Proof of Delivery
            </Button>
          )}
          {record.status === 'DELIVERED' && (
            <Tag color="cyan" icon={<CheckCircle2 size={12} style={{ marginRight: 4 }} />}>
              Completed
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Truck size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                Logistics & Courier Delivery Portal
              </h1>
              <Tag color="green" style={{ borderRadius: 6, fontWeight: 600 }}>
                ROLE_DRIVER
              </Tag>
            </div>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Logged in driver: <strong style={{ color: '#e2e8f0' }}>{user?.fullName || 'Rapid Dispatch'}</strong> ({user?.email})
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
            <span>Today's Total Route</span>
            <Navigation size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.length} Packages
          </div>
          <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: 4 }}>
            Route Area: District 1, 3, 5, Thu Duc
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Awaiting Warehouse Pick</span>
            <PackageCheck size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'ASSIGNED').length}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>
            WH-HCM-01 Outbound Bay 2
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Currently In Transit</span>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP').length}
          </div>
          <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: 4 }}>
            On-vehicle manifests
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Completed Deliveries</span>
            <CheckCircle2 size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'DELIVERED').length}
          </div>
          <div style={{ color: '#a855f7', fontSize: '0.75rem', marginTop: 4 }}>
            100% recipient satisfaction
          </div>
        </div>
      </div>

      {/* Main Delivery Table */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.65)', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: 12, 
        padding: 24 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              Assigned Delivery Manifest & Stops
            </h3>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Pickup 3D keepsakes from fulfillment center, follow optimized stops, and capture proof of delivery.
            </p>
          </div>
        </div>

        <Table
          dataSource={deliveries}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};
export default DriverDeliveriesPage;
