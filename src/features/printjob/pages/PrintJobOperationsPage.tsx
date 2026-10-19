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

  const { data: jobsData, isLoading, refetch, isFetching } = usePrintJobs({ limit: 50 });
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
      message.success('Print Job registered in queue!');
      setIsCreateOpen(false);
      createForm.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Failed to create job');
    }
  };

  const handleReserve = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await reserveMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Material reserved from warehouse for Job #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Reservation failed');
    }
  };

  const handleIssue = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await issueMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Material issued to printer for Job #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Issue failed');
    }
  };

  const handleStartPrint = async (jobId: string, jobNumber: string) => {
    try {
      await startMutation.mutateAsync(jobId);
      message.success(`Job #${jobNumber} is now printing!`);
    } catch (err: any) {
      message.error(err.message || 'Failed to start print');
    }
  };

  const handleReconcile = async (payload: any) => {
    if (!selectedJob) return;
    try {
      await reconcileMutation.mutateAsync({ id: selectedJob.id, payload });
      message.success(`Consumption reconciled and closed for Job #${selectedJob.jobNumber}`);
      setActiveModal(null);
    } catch (err: any) {
      message.error(err.message || 'Reconciliation failed');
    }
  };

  const renderStatusTag = (status: PrintJobStatus) => {
    switch (status) {
      case 'CREATED':
        return <Tag color="default">QUEUED</Tag>;
      case 'RESERVED':
        return <Tag color="warning">RESERVED</Tag>;
      case 'ISSUED':
        return <Tag color="processing">MATERIAL ISSUED</Tag>;
      case 'PRINTING':
        return <Tag color="blue">PRINTING</Tag>;
      case 'COMPLETED':
        return <Tag color="success">COMPLETED</Tag>;
      case 'FAILED':
        return <Tag color="error">FAILED</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<PrintJob> = [
    {
      title: 'Job Number',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
      render: (num: string) => (
        <Space>
          <PrinterOutlined style={{ color: '#0ea5e9' }} />
          <Text strong copyable style={{ color: '#38bdf8' }}>{num}</Text>
        </Space>
      ),
    },
    {
      title: 'Filament Profile',
      key: 'material',
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Space>
            <Tag color="cyan">{record.materialSku}</Tag>
            <span>{record.materialColor}</span>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'G-Code Weight',
      dataIndex: 'estimatedGram',
      key: 'estimatedGram',
      sorter: (a, b) => a.estimatedGram - b.estimatedGram,
      render: (gram: number) => <Text strong>{gram} g</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: PrintJobStatus) => renderStatusTag(status),
    },
    {
      title: 'Printer Station',
      dataIndex: 'printerName',
      key: 'printerName',
      render: (val: string) => val || 'Auto Dispatch Bed',
    },
    {
      title: 'Operations & Handover',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'CREATED' && (
            <Tooltip title="Allocate & reserve warehouse stock">
              <Button
                type="primary"
                size="small"
                icon={<LockOutlined />}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('RESERVE');
                }}
              >
                Reserve
              </Button>
            </Tooltip>
          )}

          {record.status === 'RESERVED' && (
            <Tooltip title="Pick & handover material to machine">
              <Button
                type="primary"
                size="small"
                icon={<ExportOutlined />}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('ISSUE');
                }}
              >
                Issue to Bed
              </Button>
            </Tooltip>
          )}

          {record.status === 'ISSUED' && (
            <Tooltip title="Trigger extrusion start">
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartPrint(record.id, record.jobNumber)}
              >
                Start Print
              </Button>
            </Tooltip>
          )}

          {(record.status === 'PRINTING' || record.status === 'COMPLETED') && (
            <Tooltip title="Reconcile model weight, purge waste, and remnants">
              <Button
                size="small"
                icon={<RedoOutlined />}
                onClick={() => {
                  setSelectedJob(record);
                  setActiveModal('RECONCILE');
                }}
              >
                Reconcile
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
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Print Job Material Lifecycle (F06, F07)
          </Title>
          <Text type="secondary">
            Manage material reservation, warehouse picking, printer issuance, and mass reconciliation.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsCreateOpen(true)}
          >
            New Print Job
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Production Jobs"
              value={jobs.length}
              prefix={<PrinterOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Orders</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Reserved & Ready"
              value={jobs.filter((j) => j.status === 'RESERVED' || j.status === 'ISSUED').length}
              valueStyle={{ color: '#fbbf24' }}
              prefix={<LockOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>In Staging</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Extruding on Bed"
              value={jobs.filter((j) => j.status === 'PRINTING').length}
              valueStyle={{ color: '#10b981' }}
              prefix={<PlayCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Printing</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 12 }}
        />
      </Card>

      {/* Create Job Modal */}
      <Modal
        title="Schedule New Print Job"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateJob}>
          <Form.Item
            name="materialId"
            label="Required Filament Profile"
            rules={[{ required: true, message: 'Please select material' }]}
          >
            <Select placeholder="Select material SKU">
              {materials.map((mat) => (
                <Select.Option key={mat.id} value={mat.id}>
                  [{mat.sku}] {mat.name} ({mat.color})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="estimatedGram"
            label="Estimated G-Code Filament Weight (Grams)"
            rules={[{ required: true, message: 'Weight is required' }]}
            initialValue={400}
          >
            <InputNumber style={{ width: '100%' }} addonAfter="grams" min={1} />
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
