import React, { useState } from 'react';
import { Tag, Badge, Button, Table, Space, message } from 'antd';
import { 
  MapPin, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  PhoneCall, 
  Navigation, 
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';

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
    recipientName: 'Nguyễn Văn An',
    phone: '0901-234-567',
    shippingAddress: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    itemDescription: 'Kỷ vật 3D Cyberpunk Mecha (Resin cao cấp)',
    weightGrams: 350,
    paymentType: 'PREPAID',
    status: 'IN_TRANSIT',
    eta: '14:30 Hôm nay',
  },
  {
    id: '2',
    trackingCode: 'EXP-88915-VN',
    orderRef: 'ORD-2026-8798',
    recipientName: 'Trần Thị Bích',
    phone: '0912-345-678',
    shippingAddress: '128 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh',
    itemDescription: 'Vỏ đồng hồ cơ khí Chronograph (3 chiếc)',
    weightGrams: 620,
    paymentType: 'COD_VND',
    codAmount: 450000,
    status: 'PICKED_UP',
    eta: '16:00 Hôm nay',
  },
  {
    id: '3',
    trackingCode: 'EXP-88902-VN',
    orderRef: 'ORD-2026-8755',
    recipientName: 'Lê Hoàng Minh',
    phone: '0988-765-432',
    shippingAddress: 'Biệt thự 14, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    itemDescription: 'Mô hình kiến trúc đồng thu nhỏ',
    weightGrams: 1200,
    paymentType: 'PREPAID',
    status: 'ASSIGNED',
    eta: 'Chờ lấy tại kho',
  },
  {
    id: '4',
    trackingCode: 'EXP-88840-VN',
    orderRef: 'ORD-2026-8711',
    recipientName: 'Đặng Quốc Bảo',
    phone: '0933-445-566',
    shippingAddress: '72 Võ Văn Kiệt, Phường 1, Quận 5, TP. Hồ Chí Minh',
    itemDescription: 'Tượng chân dung cá nhân hóa',
    weightGrams: 280,
    paymentType: 'PREPAID',
    status: 'DELIVERED',
    eta: 'Đã giao lúc 11:15',
  },
];

export const DriverDeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryRun[]>(MOCK_DELIVERIES);

  const handleUpdateStatus = (id: string, nextStatus: DeliveryRun['status']) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    const statusText =
      nextStatus === 'PICKED_UP'
        ? 'Đã lấy hàng từ kho'
        : nextStatus === 'IN_TRANSIT'
        ? 'Đang trên đường giao'
        : nextStatus === 'DELIVERED'
        ? 'Đã giao hàng thành công'
        : nextStatus;
    message.success(`Cập nhật trạng thái giao vận: ${statusText}`);
  };

  const columns = [
    {
      title: 'Mã vận đơn & Đơn hàng',
      key: 'tracking',
      render: (_: unknown, record: DeliveryRun) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>
            {record.trackingCode}
          </div>
          <div style={{ color: '#0ea5e9', fontSize: '0.775rem' }}>
            Mã đơn: {record.orderRef}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.725rem' }}>
            {record.itemDescription} ({record.weightGrams}g)
          </div>
        </div>
      ),
    },
    {
      title: 'Người nhận & Địa chỉ giao',
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
      title: 'Thanh toán & Thu hộ',
      key: 'billing',
      render: (_: unknown, record: DeliveryRun) => (
        <div>
          {record.paymentType === 'PREPAID' ? (
            <Tag color="green">ĐÃ THANH TOÁN ONLINE</Tag>
          ) : (
            <Tag color="gold">
              THU HỘ COD: {record.codAmount?.toLocaleString('vi-VN')} VND
            </Tag>
          )}
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>
            Dự kiến: {record.eta}
          </div>
        </div>
      ),
    },
    {
      title: 'Tiến độ giao hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status: DeliveryRun['status']) => {
        switch (status) {
          case 'ASSIGNED':
            return <Badge status="default" text={<span style={{ color: '#94a3b8' }}>Tại cửa xuất kho</span>} />;
          case 'PICKED_UP':
            return <Badge status="warning" text={<span style={{ color: '#f59e0b' }}>Đã lấy từ trạm kho</span>} />;
          case 'IN_TRANSIT':
            return <Badge status="processing" text={<span style={{ color: '#38bdf8' }}>Đang trên đường giao</span>} />;
          case 'DELIVERED':
            return <Badge status="success" text={<span style={{ color: '#10b981' }}>Đã giao & Ký nhận</span>} />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: DeliveryRun) => (
        <Space size="small">
          {record.status === 'ASSIGNED' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'PICKED_UP')}
            >
              Xác nhận đã lấy hàng
            </Button>
          )}
          {record.status === 'PICKED_UP' && (
            <Button
              size="small"
              style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
              onClick={() => handleUpdateStatus(record.id, 'IN_TRANSIT')}
            >
              Bắt đầu giao
            </Button>
          )}
          {record.status === 'IN_TRANSIT' && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => handleUpdateStatus(record.id, 'DELIVERED')}
            >
              Xác nhận đã giao
            </Button>
          )}
          {record.status === 'DELIVERED' && (
            <Tag color="cyan" icon={<CheckCircle2 size={12} style={{ marginRight: 4 }} />}>
              Hoàn thành
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0 32px 0' }}>
      <PageHeader
        title="Cổng Giao vận & Điều phối Tài xế"
        description={`Tài xế đang đăng nhập: ${user?.fullName || 'Đội xe vận chuyển'} (${user?.email})`}
        tags={<Tag color="green">ROLE_DRIVER</Tag>}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Tổng lộ trình hôm nay</span>
            <Navigation size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.length} Kiện hàng
          </div>
          <div style={{ color: '#10b981', fontSize: '0.75rem', marginTop: 4 }}>
            Khu vực: Quận 1, 3, 5, TP. Thủ Đức
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Chờ lấy hàng tại kho</span>
            <PackageCheck size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'ASSIGNED').length}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>
            Kho WH-HCM-01 Cửa xuất 2
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đang trên đường giao</span>
            <Clock size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP').length}
          </div>
          <div style={{ color: '#38bdf8', fontSize: '0.75rem', marginTop: 4 }}>
            Đã xếp lên xe vận chuyển
          </div>
        </div>

        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          border: '1px solid rgba(255, 255, 255, 0.06)', 
          borderRadius: 12, 
          padding: 20 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span>Đã giao thành công</span>
            <CheckCircle2 size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>
            {deliveries.filter((d) => d.status === 'DELIVERED').length}
          </div>
          <div style={{ color: '#a855f7', fontSize: '0.75rem', marginTop: 4 }}>
            Tỉ lệ hài lòng 100%
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
              Danh sách chuyến giao & Điểm dừng chỉ định
            </h3>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
              Lấy kỷ vật 3D từ trung tâm xử lý, đi theo lộ trình tối ưu và xác nhận biên bản giao hàng.
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
