import { ReadState } from '../../../components/ui/ReadState';
import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  App,
  Tooltip,
  Modal,
  Form,
  Select,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PrinterOutlined,
  PlusOutlined,
  LockOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePrintJobs, usePrintJobMutations } from '../hooks/usePrintJobs';
import { useWarehouses } from '../../warehouse/hooks/useWarehouses';
import { useMaterials } from '../../material/hooks/useMaterials';
import type { PrintJob, PrintJobStatus } from '../types/printJob.types';
import { ReserveModal } from '../components/ReserveModal';
import { IssueModal } from '../components/IssueModal';
import { ReconcileModal } from '../components/ReconcileModal';
import { useEventSubscription } from '../../../shared/realtime';

const { Title, Text } = Typography;

export const PrintJobOperationsPage: React.FC = () => {
  const { message } = App.useApp();
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'RESERVE' | 'ISSUE' | 'RECONCILE' | null>(null);

  const [createForm] = Form.useForm();

  const { data: jobsData, isLoading, isError, refetch, isFetching } = usePrintJobs({ limit: 50 });
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const { data: materialsData } = useMaterials({ limit: 100 });

  // Real-time automatic updates on print job, printer, and QC changes
  useEventSubscription('PRINT_JOB_UPDATED', () => refetch());
  useEventSubscription('PRINTER_STATUS_CHANGED', () => refetch());
  useEventSubscription('QC_STATUS_CHANGED', () => refetch());

  const {
    createMutation,
    startMutation,
    reserveMutation,
    issueMutation,
    reconcileMutation,
  } = usePrintJobMutations();

  const jobs = jobsData?.content || [];
  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];

  const handleCreateJob = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        materialId: values.materialId,
        estimatedGram: Number(values.estimatedGram),
        estimatedDurationSeconds: 7200,
      });
      message.success('Đã lên lịch lệnh in vào hàng đợi!');
      setIsCreateOpen(false);
      createForm.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tạo lệnh in');
    }
  };

  const handleReserve = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await reserveMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Đã giữ chỗ vật liệu từ kho cho lệnh in #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Giữ chỗ thất bại');
    }
  };

  const handleIssue = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await issueMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Đã xuất cấp vật liệu lên máy in cho lệnh in #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Xuất cấp thất bại');
    }
  };

  const handleStartPrint = async (jobId: string, jobNumber: string) => {
    try {
      await startMutation.mutateAsync(jobId);
      message.success(`Lệnh in #${jobNumber} đang bắt đầu in!`);
    } catch (err: any) {
      message.error(err.message || 'Không thể bắt đầu in');
    }
  };

  const handleReconcile = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await reconcileMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Đã quyết toán tiêu hao và đóng sổ cho lệnh in #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Quyết toán thất bại');
    }
  };

  const renderStatusTag = (status: PrintJobStatus) => {
    switch (status) {
      case 'CREATED':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--surface-container, #F1EBFF)', color: 'var(--text-secondary, #6A6282)', border: '1px solid var(--border-default, #E2D9F7)', fontWeight: 600 }}>Hàng đợi</Tag>;
      case 'RESERVED':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--peach-accent, #FFBFAE)', color: 'var(--text-primary, #28243D)', border: 'none', fontWeight: 600 }}>Đã giữ chỗ</Tag>;
      case 'ISSUED':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--surface-high, #EBE4FF)', color: 'var(--primary, #7C5CFC)', border: 'none', fontWeight: 600 }}>Đã cấp máy</Tag>;
      case 'PRINTING':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--primary, #7C5CFC)', color: '#ffffff', border: 'none', fontWeight: 600 }}>Đang in</Tag>;
      case 'COMPLETED':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--mint-accent, #C9E8D5)', color: 'var(--tertiary, #466253)', border: 'none', fontWeight: 600 }}>Hoàn thành</Tag>;
      case 'FAILED':
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px', background: 'var(--error-container, #FFDAD6)', color: 'var(--on-error-container, #93000A)', border: 'none', fontWeight: 600 }}>Thất bại</Tag>;
      default:
        return <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', padding: '2px 8px' }}>{status}</Tag>;
    }
  };

  const columns: ColumnsType<PrintJob> = [
    {
      title: 'Mã lệnh in',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
      render: (num: string) => (
        <Space>
          <PrinterOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
          <Text strong copyable style={{ color: 'var(--primary, #7C5CFC)' }}>{num}</Text>
        </Space>
      ),
    },
    {
      title: 'Hồ sơ vật liệu in',
      key: 'material',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Tag style={{ borderRadius: 'var(--radius-sm, 4px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary, #7C5CFC)', border: '1px solid var(--border-default, #E2D9F7)' }}>{record.materialSku}</Tag>
            <span style={{ color: 'var(--text-primary, #28243D)' }}>{record.materialColor}</span>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, color: 'var(--text-secondary, #6A6282)' }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Khối lượng G-Code',
      dataIndex: 'estimatedGram',
      key: 'estimatedGram',
      sorter: (a, b) => a.estimatedGram - b.estimatedGram,
      render: (gram: number) => <Text strong style={{ color: 'var(--text-primary, #28243D)' }}>{gram} g</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: PrintJobStatus) => renderStatusTag(status),
    },
    {
      title: 'Trạm máy in 3D',
      dataIndex: 'printerName',
      key: 'printerName',
      render: (val: string) => <span style={{ color: 'var(--text-primary, #28243D)' }}>{val || 'Bàn in điều phối tự động'}</span>,
    },
    {
      title: 'Vận hành & Bàn giao',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'CREATED' && (
            <Tooltip title="Phân bổ và giữ chỗ tồn kho">
              <Button
                type="primary"
                size="small"
                icon={<LockOutlined />}
                style={{ borderRadius: 'var(--radius-sm, 6px)', background: 'var(--primary, #7C5CFC)' }}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('RESERVE');
                }}
              >
                Giữ chỗ kho
              </Button>
            </Tooltip>
          )}

          {record.status === 'RESERVED' && (
            <Tooltip title="Lấy hàng và cấp vật liệu lên máy in">
              <Button
                type="primary"
                size="small"
                icon={<ExportOutlined />}
                style={{ borderRadius: 'var(--radius-sm, 6px)', background: 'var(--primary, #7C5CFC)' }}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('ISSUE');
                }}
              >
                Xuất cấp máy
              </Button>
            </Tooltip>
          )}

          {record.status === 'ISSUED' && (
            <Tooltip title="Kích hoạt bắt đầu in">
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: 'var(--mint-accent, #C9E8D5)', borderColor: 'transparent', color: 'var(--tertiary, #466253)', fontWeight: 600, borderRadius: 'var(--radius-sm, 6px)' }}
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartPrint(record.id, record.jobNumber)}
              >
                Bắt đầu in
              </Button>
            </Tooltip>
          )}

          {(record.status === 'PRINTING' || record.status === 'COMPLETED') && (
            <Tooltip title="Quyết toán khối lượng mô hình, support và cuộn nhựa thu hồi">
              <Button
                size="small"
                icon={<RedoOutlined />}
                style={{ borderRadius: 'var(--radius-sm, 6px)' }}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('RECONCILE');
                }}
              >
                Quyết toán
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary, #28243D)', fontSize: '1.35rem', fontWeight: 700 }}>
            Vận hành Lệnh in 3D & Quản lý Vật tư
          </Title>
          <Text type="secondary" style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.875rem' }}>
            Quản lý đặt trước vật liệu, xuất kho cấp máy in và quyết toán tiêu hao thực tế.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} style={{ borderRadius: 'var(--radius-sm, 6px)' }}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => setIsCreateOpen(true)}
            style={{ borderRadius: 'var(--radius-sm, 6px)', background: 'var(--primary, #7C5CFC)' }}
          >
            Tạo lệnh in 3D
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card, 10px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-sm)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', fontWeight: 600 }}>Lệnh in đang vận hành</span>}
              value={jobs.length}
              valueStyle={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '1.6rem' }}
              prefix={<PrinterOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>Lệnh in</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card, 10px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-sm)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', fontWeight: 600 }}>Đã giữ chỗ & Sẵn sàng</span>}
              value={jobs.filter((j) => j.status === 'RESERVED' || j.status === 'ISSUED').length}
              valueStyle={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '1.6rem' }}
              prefix={<LockOutlined style={{ color: 'var(--peach-accent, #FFBFAE)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>Trong kho đệm</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 'var(--radius-card, 10px)', border: '1px solid var(--border-default, #E2D9F7)', boxShadow: 'var(--shadow-sm)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.8rem', fontWeight: 600 }}>Đang in trên bàn máy</span>}
              value={jobs.filter((j) => j.status === 'PRINTING').length}
              valueStyle={{ color: 'var(--primary, #7C5CFC)', fontWeight: 700, fontSize: '1.6rem' }}
              prefix={<PlayCircleOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13, color: 'var(--text-secondary, #6A6282)' }}>Đang in</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <ReadState isLoading={isLoading} isError={isError} isFetching={isFetching} onRetry={() => { void refetch(); }}>
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 12 }}
        />
        </ReadState>
      </Card>

      {/* Create Job Modal */}
      <Modal
        title="Lên lịch Lệnh in 3D mới"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Tạo lệnh in"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateJob}>
          <Form.Item
            name="materialId"
            label="Hồ sơ vật liệu in yêu cầu"
            rules={[{ required: true, message: 'Vui lòng chọn vật liệu in' }]}
          >
            <Select placeholder="Chọn SKU vật liệu">
              {materials.map((mat) => (
                <Select.Option key={mat.id} value={mat.id}>
                  [{mat.sku}] {mat.name} ({mat.color})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="estimatedGram"
            label="Khối lượng vật liệu dự kiến theo G-Code (Gram)"
            rules={[{ required: true, message: 'Vui lòng nhập khối lượng' }]}
            initialValue={400}
          >
            <InputNumber style={{ width: '100%' }} addonAfter="g" min={1} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reserve Modal */}
      <ReserveModal
        open={activeModal === 'RESERVE'}
        onCancel={() => setActiveModal(null)}
        onSubmit={handleReserve}
        job={selectedJob}
        warehouses={warehouses}
        loading={reserveMutation.isPending}
      />

      {/* Issue Modal */}
      <IssueModal
        open={activeModal === 'ISSUE'}
        onCancel={() => setActiveModal(null)}
        onSubmit={handleIssue}
        job={selectedJob}
        warehouses={warehouses}
        loading={issueMutation.isPending}
      />

      {/* Reconcile Modal */}
      <ReconcileModal
        open={activeModal === 'RECONCILE'}
        onCancel={() => setActiveModal(null)}
        onSubmit={handleReconcile}
        job={selectedJob}
        loading={reconcileMutation.isPending}
      />
    </div>
  );
};

export default PrintJobOperationsPage;
