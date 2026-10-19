import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Table, Tag, Typography, Button, Spin, Alert, Space } from 'antd';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { wmsEnterpriseApi, type ManagerDashboardData } from '../../inventory/api/wmsEnterpriseApi';
import { useWarehouseContext } from '../../warehouse/context/WarehouseContext';

const { Title, Text } = Typography;

export const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeWarehouse } = useWarehouseContext();

  const { data: dashboard, isLoading, error, refetch } = useQuery<ManagerDashboardData>({
    queryKey: ['manager-dashboard', activeWarehouse?.id],
    queryFn: () => wmsEnterpriseApi.getManagerDashboard(activeWarehouse?.id),
    refetchInterval: 15000,
  });

  const recentMovementColumns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => <Text style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>,
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (val: string) => <Text strong style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{val || 'Primary WH'}</Text>,
    },
    {
      title: 'Material',
      key: 'material',
      render: (_: any, r: any) => (
        <div>
          <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>{r.materialSku}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{r.materialName}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_: any, r: any) => {
        const typeStr = String(r.movementType || r.transactionType || 'MOVEMENT').toUpperCase();
        let color = 'default';
        if (typeStr.includes('IN') || typeStr.includes('RECEIPT')) color = 'cyan';
        else if (typeStr.includes('OUT') || typeStr.includes('ISSUE')) color = 'magenta';
        else if (typeStr.includes('RESERVE')) color = 'gold';
        else if (typeStr.includes('ADJUST')) color = 'purple';
        return <Tag color={color} style={{ fontSize: '0.75rem', fontWeight: 600 }}>{typeStr}</Tag>;
      },
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_: any, r: any) => {
        const typeStr = String(r.movementType || r.transactionType || '').toUpperCase();
        const delta = r.quantity !== undefined ? r.quantity : (r.deltaOnHandGram !== undefined ? r.deltaOnHandGram : 0);
        const isPositive = delta > 0 || typeStr.includes('IN') || typeStr.includes('RECEIPT') || typeStr.includes('INCREASE') || typeStr.includes('RELEASE');
        const displayVal = Math.abs(delta);
        return (
          <Text strong style={{ color: isPositive ? '#10b981' : '#f43f5e', fontSize: '0.9rem' }}>
            {isPositive ? `+${displayVal}` : `-${displayVal}`}
          </Text>
        );
      },
    },
    {
      title: 'Stock Ledger (Before -> After)',
      key: 'balanceFlow',
      render: (_: any, r: any) => {
        const before = r.quantityBefore ?? r.beforeOnHandGram ?? 0;
        const after = r.quantityAfter ?? r.afterOnHandGram ?? 0;
        return (
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {before} → <Text strong style={{ color: '#e2e8f0' }}>{after}</Text>
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading Manager Control Center..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load Manager Dashboard"
        description={(error as Error).message}
        action={<Button onClick={() => refetch()}>Retry</Button>}
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>
            Manager Control Center
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {activeWarehouse 
              ? `Operational metrics for ${activeWarehouse.name} (${activeWarehouse.code})`
              : 'Global Multi-Warehouse Operational Overview'}
          </Text>
        </div>
        <Space>
          <Button 
            icon={<RefreshCw size={14} />} 
            onClick={() => refetch()}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, fontWeight: 600 }}
            onClick={() => navigate('/manager/approvals')}
          >
            Approvals Center ({((dashboard?.pendingGoodsReceipts || 0) + (dashboard?.pendingStockIssues || 0) + (dashboard?.pendingAdjustments || 0) + (dashboard?.pendingTransfers || 0))})
          </Button>
        </Space>
      </div>

      {/* KPI Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Inventory Items</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                  {dashboard?.totalInventoryItems ?? 0}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>
                  Across {dashboard?.totalWarehouses ?? 0} warehouses
                </div>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 12, borderRadius: 10 }}>
                <Boxes color="#38bdf8" size={26} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Low Stock Warnings</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
                  {dashboard?.lowStockCount ?? 0}
                </div>
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4 }}>
                  {dashboard?.outOfStockCount ?? 0} out of stock
                </div>
              </div>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: 12, borderRadius: 10 }}>
                <AlertTriangle color="#fbbf24" size={26} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Pending Approvals</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', marginTop: 4 }}>
                  {((dashboard?.pendingGoodsReceipts || 0) + (dashboard?.pendingStockIssues || 0) + (dashboard?.pendingAdjustments || 0) + (dashboard?.pendingTransfers || 0))}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 4 }}>
                  Receipts, Issues, Adjustments
                </div>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 12, borderRadius: 10 }}>
                <Clock color="#a855f7" size={26} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}
            styles={{ body: { padding: '20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Active Materials</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  {dashboard?.totalMaterials ?? 0}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>
                  Filaments & Resins Catalog
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 10 }}>
                <CheckCircle2 color="#10b981" size={26} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Operational Quick Actions & Approval Queues */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/manager/receipts')}
            style={{ background: '#0f172a', borderColor: '#334155', borderRadius: 10, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArrowDownLeft color="#38bdf8" size={22} />
              <div>
                <Text strong style={{ color: '#f8fafc' }}>Goods Receipts</Text>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {dashboard?.pendingGoodsReceipts ?? 0} awaiting approval
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/manager/issues')}
            style={{ background: '#0f172a', borderColor: '#334155', borderRadius: 10, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArrowUpRight color="#f43f5e" size={22} />
              <div>
                <Text strong style={{ color: '#f8fafc' }}>Stock Issues</Text>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {dashboard?.pendingStockIssues ?? 0} awaiting approval
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/manager/transfers')}
            style={{ background: '#0f172a', borderColor: '#334155', borderRadius: 10, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArrowLeftRight color="#a855f7" size={22} />
              <div>
                <Text strong style={{ color: '#f8fafc' }}>Transfers</Text>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {dashboard?.pendingTransfers ?? 0} pending transit
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card 
            hoverable 
            onClick={() => navigate('/manager/adjustments')}
            style={{ background: '#0f172a', borderColor: '#334155', borderRadius: 10, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sliders color="#fbbf24" size={22} />
              <div>
                <Text strong style={{ color: '#f8fafc' }}>Stock Adjustments</Text>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {dashboard?.pendingAdjustments ?? 0} pending review
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Live Immutable Ledger Stream */}
      <Card 
        bordered={false} 
        style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem' }}>
              Real-time Stock Movement Ledger
            </span>
            <Button type="link" onClick={() => navigate('/manager/inventory/transactions')}>
              View Full Ledger →
            </Button>
          </div>
        }
      >
        <Table 
          columns={recentMovementColumns} 
          dataSource={dashboard?.recentStockMovements || []} 
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No recent movements recorded' }}
        />
      </Card>
    </div>
  );
};

export default ManagerDashboardPage;
