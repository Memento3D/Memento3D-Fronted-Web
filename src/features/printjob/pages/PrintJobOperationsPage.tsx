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
        return <Tag color="default">HÀNG ĐỢI</Tag>;
      case 'RESERVED':
        return <Tag color="warning">ĐÃ GIỮ CHỖ</Tag>;
      case 'ISSUED':
        return <Tag color="processing">ĐÃ CẤP MÁY</Tag>;
      case 'PRINTING':
        return <Tag color="blue">ĐANG IN</Tag>;
      case 'COMPLETED':
        return <Tag color="success">HOÀN THÀNH</Tag>;
      case 'FAILED':
        return <Tag color="error">THẤT BẠI</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<PrintJob> = [
    {
      title: 'Mã lệnh in',
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
      title: 'Hồ sơ vật liệu in',
      key: 'material',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Tag color="cyan">{record.materialSku}</Tag>
            <span>{record.materialColor}</span>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.materialName}</Text>
        </Space>
      ),
    },
    {
      title: 'Khối lượng G-Code',
      dataIndex: 'estimatedGram',
      key: 'estimatedGram',
      sorter: (a, b) => a.estimatedGram - b.estimatedGram,
      render: (gram: number) => <Text strong>{gram} g</Text>,
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
      render: (val: string) => val || 'Bàn in điều phối tự động',
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
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
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
          <Title level={3} style={{ margin: 0, color: '#f8fafc' }}>
            Vận hành Lệnh in 3D & Vòng đời Vật liệu (F06, F07)
          </Title>
          <Text type="secondary">
            Quản lý đặt trước vật liệu, xuất kho cấp máy in và quyết toán tiêu hao thực tế.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsCreateOpen(true)}
          >
            Tạo lệnh in 3D
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Lệnh in đang vận hành"
              value={jobs.length}
              prefix={<PrinterOutlined style={{ color: '#0ea5e9' }} />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Lệnh in</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã giữ chỗ & Sẵn sàng"
              value={jobs.filter((j) => j.status === 'RESERVED' || j.status === 'ISSUED').length}
              valueStyle={{ color: '#fbbf24' }}
              prefix={<LockOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Trong kho đệm</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang in trên bàn máy"
              value={jobs.filter((j) => j.status === 'PRINTING').length}
              valueStyle={{ color: '#10b981' }}
              prefix={<PlayCircleOutlined />}
              suffix={<Text type="secondary" style={{ fontSize: 13 }}>Đang in</Text>}
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
