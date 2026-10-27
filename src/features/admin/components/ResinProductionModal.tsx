import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Tag,
  Descriptions,
  Alert,
  Space,
  Divider,
  message,
  Typography,
  Card,
  Row,
  Col,
} from 'antd';
import {
  Cpu,
  Layers,
  Send,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Box,
  HardDrive,
  Network,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resinProductionService } from '../../../services/resinProductionService';
import type {
  ResinProductionJobResponse,
  PrepareResinProductionPayload,
  RecordSlicingPayload,
  ConfirmHandoffPayload,
  PostProcessingChecklistPayload,
  RecordQcResultPayload,
} from '../../../types/printJob';

const { Title, Text, Paragraph } = Typography;

interface ResinProductionModalProps {
  visible: boolean;
  onClose: () => void;
  job: ResinProductionJobResponse | null;
  onRefresh?: () => void;
}

export const ResinProductionModal: React.FC<ResinProductionModalProps> = ({
  visible,
  onClose,
  job,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('prep');

  // Mutation: Chuẩn bị mô hình
  const prepareMutation = useMutation({
    mutationFn: (payload: PrepareResinProductionPayload) => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.prepareProductionJob(job.orderItemId, payload);
    },
    onSuccess: () => {
      message.success('Đã lưu thông số mô hình hình học & sẵn sàng cắt lớp!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
      setActiveTab('slicing');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi chuẩn bị mô hình');
    },
  });

  // Mutation: Ghi nhận hồ sơ cắt lớp CHITUBOX
  const slicingMutation = useMutation({
    mutationFn: (payload: RecordSlicingPayload) => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.recordSlicing(job.printJobId, payload);
    },
    onSuccess: () => {
      message.success('Đã lưu hồ sơ cắt lớp CHITUBOX profile ELEGOO Saturn 4 Ultra 16K!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
      setActiveTab('handoff');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi ghi nhận hồ sơ CHITUBOX');
    },
  });

  // Mutation: Bàn giao file sang máy in
  const handoffMutation = useMutation({
    mutationFn: (payload: ConfirmHandoffPayload) => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.confirmHandoff(job.printJobId, payload);
    },
    onSuccess: () => {
      message.success('Đã ghi nhận bàn giao file sang máy in!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi bàn giao file');
    },
  });

  // Mutation: Xác nhận máy bắt đầu in thật
  const startPrintingMutation = useMutation({
    mutationFn: () => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.confirmStartPrinting(job.printJobId);
    },
    onSuccess: () => {
      message.success('Đã xác nhận máy ELEGOO Saturn 4 Ultra 16K bắt đầu in trên thực tế!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
      setActiveTab('postproc');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi xác nhận in');
    },
  });

  // Mutation: Hậu xử lý
  const postProcMutation = useMutation({
    mutationFn: (payload: PostProcessingChecklistPayload) => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.updatePostProcessing(job.printJobId, payload);
    },
    onSuccess: () => {
      message.success('Đã cập nhật quy trình hậu xử lý!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
      setActiveTab('qc');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật hậu xử lý');
    },
  });

  // Mutation: Kiểm tra chất lượng (QC)
  const qcMutation = useMutation({
    mutationFn: (payload: RecordQcResultPayload) => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.recordQcResult(job.printJobId, payload);
    },
    onSuccess: () => {
      message.success('Đã ghi nhận kết quả kiểm tra chất lượng (QC)!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi ghi nhận QC');
    },
  });

  // Mutation: In lại (Reprint) khi in lỗi
  const reprintMutation = useMutation({
    mutationFn: () => {
      if (!job) throw new Error('Không có job');
      return resinProductionService.createReprint(job.printJobId);
    },
    onSuccess: () => {
      message.success('Đã tạo lần in lại mới (Giữ nguyên lịch sử, không tính thêm phí khách hàng)!');
      queryClient.invalidateQueries({ queryKey: ['resinJobs'] });
      onRefresh?.();
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi tạo in lại');
    },
  });

  if (!job) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu className="text-purple-500" size={24} />
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
              Quy trình Sản xuất Resin: ELEGOO Saturn 4 Ultra 16K
            </span>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Máy in Resin MSLA 16K (Khổ in: 218.88 x 122.88 x 220 mm | Mono LCD 15360 x 8640)
            </div>
          </div>
        </div>
      }
    >
      <Alert
        message="Nguyên tắc phân biệt 3 loại file & Quy trình sản xuất"
        description="GLB (Xem 3D & tham chiếu màu) → STL (Hình học chuẩn bị) → File cắt lớp CHITUBOX (.goo / .ctb theo profile máy). Tuyệt đối không gửi GLB trực tiếp vào máy in và không đổi đuôi file giả mạo."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions size="small" bordered column={3} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Mã lệnh in">
          <Text strong>{job.printJobId.substring(0, 8)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Đơn hàng">
          <Text>{job.orderNumber || job.orderId?.substring(0, 8)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color="purple">{job.jobStatus}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Máy in mục tiêu">
          <Tag color="blue">{job.targetMachineModel || 'ELEGOO Saturn 4 Ultra 16K'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Khổ in tối đa">
          <Text code>218.88 x 122.88 x 220 mm</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Lần in">
          <Text strong>Lần {job.reprintOfJobId ? 'in lại' : '1'}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'prep',
            label: (
              <span>
                <Box size={14} style={{ display: 'inline', marginRight: 6 }} />
                1. Chuẩn bị mô hình (STL)
              </span>
            ),
            children: (
              <Form
                layout="vertical"
                initialValues={{
                  dimXMm: job.targetDimX || 80,
                  dimYMm: job.targetDimY || 60,
                  dimZMm: job.targetDimZ || 100,
                  isWatertight: job.isWatertight ?? true,
                  isHollowed: job.isHollowed ?? true,
                  hasDrainHoles: job.hasDrainHoles ?? true,
                }}
                onFinish={(values) =>
                  prepareMutation.mutate({
                    targetDimX: values.dimXMm,
                    targetDimY: values.dimYMm,
                    targetDimZ: values.dimZMm,
                    isWatertight: values.isWatertight,
                    isHollowed: values.isHollowed,
                    hasDrainHoles: values.hasDrainHoles,
                  })
                }
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Chiều rộng X (mm)"
                      name="dimXMm"
                      rules={[{ required: true, message: 'Nhập kích thước X' }]}
                    >
                      <InputNumber min={1} max={218.88} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Chiều dài Y (mm)"
                      name="dimYMm"
                      rules={[{ required: true, message: 'Nhập kích thước Y' }]}
                    >
                      <InputNumber min={1} max={122.88} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Chiều cao Z (mm)"
                      name="dimZMm"
                      rules={[{ required: true, message: 'Nhập kích thước Z' }]}
                    >
                      <InputNumber min={1} max={220.0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Card size="small" title="Kiểm tra kỹ thuật mô hình in Resin" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Mesh kín (Watertight / Manifold)" name="isWatertight" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Làm rỗng tiết kiệm resin (Hollow)" name="isHollowed" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Có lỗ thoát resin & xả áp (Drain Holes)" name="hasDrainHoles" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {job.sourceGlbAssetUrl && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>GLB Gốc (Tham chiếu màu & hình dáng):</Text>{' '}
                    <a href={job.sourceGlbAssetUrl} target="_blank" rel="noreferrer">
                      Tải GLB xem trước
                    </a>
                  </div>
                )}

                <Button type="primary" htmlType="submit" loading={prepareMutation.isPending} icon={<Box size={16} />}>
                  Lưu & Xuất STL Chuẩn bị sản xuất
                </Button>
              </Form>
            ),
          },
          {
            key: 'slicing',
            label: (
              <span>
                <Layers size={14} style={{ display: 'inline', marginRight: 6 }} />
                2. Cắt lớp CHITUBOX
              </span>
            ),
            children: (
              <Form
                layout="vertical"
                initialValues={{
                  chituboxVersion: job.chituboxVersion || 'CHITUBOX Basic v2.2.0',
                  machineProfile: job.machineProfile || 'ELEGOO Saturn 4 Ultra 16K',
                  resinType: job.resinType || 'Elegoo Standard 16K Photopolymer Resin',
                  resinColor: job.resinColor || 'Space Grey',
                  isCustomPainted: job.isCustomPainted ?? false,
                  sliceFileFormat: job.sliceFileFormat || 'goo',
                  estimatedResinMl: job.estimatedResinMl || 45.0,
                  estimatedPrintTimeSeconds: job.estimatedPrintTimeSeconds || 7200,
                  sliceFileArtifactUrl: job.sliceFileArtifactUrl || '',
                }}
                onFinish={(values) =>
                  slicingMutation.mutate({
                    chituboxVersion: values.chituboxVersion,
                    machineProfile: values.machineProfile,
                    resinType: values.resinType,
                    resinColor: values.resinColor,
                    isCustomPainted: values.isCustomPainted,
                    sliceFileFormat: values.sliceFileFormat,
                    sliceFileArtifactUrl: values.sliceFileArtifactUrl,
                    estimatedResinMl: values.estimatedResinMl,
                    estimatedPrintTimeSeconds: values.estimatedPrintTimeSeconds,
                  })
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Phiên bản CHITUBOX"
                      name="chituboxVersion"
                      rules={[{ required: true, message: 'Nhập phiên bản CHITUBOX' }]}
                    >
                      <Input placeholder="ví dụ: CHITUBOX Basic v2.2.0" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Profile Máy in (Bắt buộc 16K)"
                      name="machineProfile"
                      rules={[{ required: true, message: 'Nhập profile máy' }]}
                    >
                      <Input disabled value="ELEGOO Saturn 4 Ultra 16K" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Loại Resin" name="resinType" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="Elegoo Standard 16K Photopolymer Resin">Elegoo Standard 16K</Select.Option>
                        <Select.Option value="Elegoo ABS-Like Resin V2">Elegoo ABS-Like V2</Select.Option>
                        <Select.Option value="Elegoo Water Washable Resin">Elegoo Water Washable</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Màu Resin Lỏng" name="resinColor" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="Space Grey">Space Grey (Xám không gian)</Select.Option>
                        <Select.Option value="Clear">Trong suốt (Clear)</Select.Option>
                        <Select.Option value="Beige">Beige / Da</Select.Option>
                        <Select.Option value="White">Trắng</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Sơn màu mỹ thuật (Dịch vụ riêng)" name="isCustomPainted" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Định dạng file cắt lớp" name="sliceFileFormat" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="goo">.goo (CHITUBOX V4 Profile Saturn 4 Ultra)</Select.Option>
                        <Select.Option value="ctb">.ctb (Chitu Encrypted)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Dung tích Resin ước tính (ml)" name="estimatedResinMl" rules={[{ required: true }]}>
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Thời gian in ước tính (giây)" name="estimatedPrintTimeSeconds" rules={[{ required: true }]}>
                      <InputNumber min={60} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="URL / Đường dẫn file cắt lớp (.goo / .ctb)"
                  name="sliceFileArtifactUrl"
                  rules={[{ required: true, message: 'Nhập URL file cắt lớp' }]}
                >
                  <Input placeholder="https://storage.memento3d.com/slices/job-001.goo" />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={slicingMutation.isPending} icon={<Layers size={16} />}>
                  Lưu Hồ sơ Cắt lớp CHITUBOX
                </Button>
              </Form>
            ),
          },
          {
            key: 'handoff',
            label: (
              <span>
                <Send size={14} style={{ display: 'inline', marginRight: 6 }} />
                3. Bàn giao & Bắt đầu in
              </span>
            ),
            children: (
              <div>
                <Alert
                  type="warning"
                  showIcon
                  message="Lưu ý quan trọng về trạng thái"
                  description="Bàn giao file qua USB hoặc ChituManager LAN KHÔNG đồng nghĩa máy đang in. Trạng thái chỉ chuyển sang 'Đang in' khi kỹ thuật viên xác nhận máy đã bắt đầu in thực tế."
                  style={{ marginBottom: 16 }}
                />

                <Card size="small" title="Phương thức bàn giao file" style={{ marginBottom: 16 }}>
                  <Form
                    layout="vertical"
                    initialValues={{ handoffMethod: job.handoffMethod || 'CHITU_MANAGER_LAN_MANUAL' }}
                    onFinish={(values) =>
                      handoffMutation.mutate({
                        handoffMethod: values.handoffMethod,
                        notes: values.notes,
                      })
                    }
                  >
                    <Form.Item label="Phương thức bàn giao" name="handoffMethod" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value="CHITU_MANAGER_LAN_MANUAL">
                          <Network size={14} style={{ display: 'inline', marginRight: 6 }} />
                          CHITU_MANAGER_LAN_MANUAL (Gửi qua mạng LAN farm bằng ChituManager)
                        </Select.Option>
                        <Select.Option value="USB_MANUAL">
                          <HardDrive size={14} style={{ display: 'inline', marginRight: 6 }} />
                          USB_MANUAL (Chép file vào USB và cắm trực tiếp vào máy)
                        </Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú bàn giao" name="notes">
                      <Input.TextArea placeholder="ví dụ: Đã gửi file qua ChituManager IP 192.168.1.105" rows={2} />
                    </Form.Item>

                    <Button type="default" htmlType="submit" loading={handoffMutation.isPending} icon={<Send size={16} />}>
                      Xác nhận đã bàn giao file sang máy
                    </Button>
                  </Form>
                </Card>

                <Card size="small" title="Xác nhận máy in trên thực tế (Physical Operator Confirmation)">
                  <Paragraph>
                    Sau khi người vận hành kiểm tra khay resin, bàn in leveling và bấm nút Start Print trên màn hình máy ELEGOO Saturn 4 Ultra 16K:
                  </Paragraph>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<Play size={18} />}
                    loading={startPrintingMutation.isPending}
                    onClick={() => startPrintingMutation.mutate()}
                    disabled={job.jobStatus === 'PRINTING'}
                  >
                    {job.jobStatus === 'PRINTING' ? 'Máy đang in...' : 'Xác nhận Máy đã Bắt đầu in'}
                  </Button>
                </Card>
              </div>
            ),
          },
          {
            key: 'postproc',
            label: (
              <span>
                <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                4. Hậu xử lý (Post-Processing)
              </span>
            ),
            children: (
              <Form
                layout="vertical"
                initialValues={{
                  washed: job.isWashed ?? true,
                  supportsRemoved: job.isSupportsRemoved ?? true,
                  uvCured: job.isUvCured ?? true,
                  customPainted: job.isCustomPainted ?? false,
                }}
                onFinish={(values) =>
                  postProcMutation.mutate({
                    washed: values.washed,
                    supportsRemoved: values.supportsRemoved,
                    uvCured: values.uvCured,
                    customPainted: values.customPainted,
                  })
                }
              >
                <Card size="small" title="Checklist Hậu xử lý Resin SOP" style={{ marginBottom: 16 }}>
                  <Form.Item
                    label="1. Rửa sạch resin thừa (IPA cồn 99% hoặc máy rửa Anycubic/Elegoo Wash)"
                    name="washed"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="2. Tháo bóc Support cẩn thận (tránh mẻ chi tiết vi mô 16K)"
                    name="supportsRemoved"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="3. Đóng rắn quang hóa buồng UV (Cure 405nm trong 10-15 phút)"
                    name="uvCured"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="4. Sơn màu mỹ thuật / Phủ bóng bảo vệ (Nếu đơn hàng yêu cầu)"
                    name="customPainted"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Card>

                <Button type="primary" htmlType="submit" loading={postProcMutation.isPending} icon={<CheckCircle2 size={16} />}>
                  Hoàn tất Hậu xử lý & Chuyển sang Kiểm tra QC
                </Button>
              </Form>
            ),
          },
          {
            key: 'qc',
            label: (
              <span>
                <CheckCircle2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                5. QC & In lại (Reprint)
              </span>
            ),
            children: (
              <div>
                <Card size="small" title="Kiểm tra chất lượng thành phẩm (Quality Control)" style={{ marginBottom: 16 }}>
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      style={{ background: '#10b981', borderColor: '#10b981', width: '100%' }}
                      size="large"
                      icon={<CheckCircle2 size={18} />}
                      loading={qcMutation.isPending}
                      onClick={() =>
                        qcMutation.mutate({
                          passed: true,
                          notes: 'Đạt chuẩn sắc nét 16K, bề mặt mịn màng không lỗi bong tách',
                        })
                      }
                    >
                      Đạt chuẩn QC → Sẵn sàng đóng gói & giao hàng (READY_FOR_DELIVERY)
                    </Button>

                    <Divider>Hoặc ghi nhận in hỏng</Divider>

                    <Form
                      layout="vertical"
                      onFinish={(values) =>
                        qcMutation.mutate({
                          passed: false,
                          failureReason: values.failureReason,
                          failurePhotoUrl: values.failurePhotoUrl,
                          notes: values.notes,
                        })
                      }
                    >
                      <Form.Item
                        label="Lý do in hỏng / khuyết tật"
                        name="failureReason"
                        rules={[{ required: true, message: 'Nhập lý do in hỏng' }]}
                      >
                        <Select placeholder="Chọn nguyên nhân">
                          <Select.Option value="Suction force delamination (Lực hút kéo rách lớp do thiếu lỗ thoát)">
                            Bong tách lớp do lực hút (Delamination)
                          </Select.Option>
                          <Select.Option value="Support failure / detached from plate">
                            Gãy chân support / Rơi khỏi bàn in
                          </Select.Option>
                          <Select.Option value="Under-exposure / detail softening">
                            Thiếu thời gian chiếu sáng (Under-exposure)
                          </Select.Option>
                          <Select.Option value="Over-exposure / loss of fine features">
                            Thừa sáng làm dày chi tiết vi mô (Over-exposure)
                          </Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item label="Link ảnh chụp lỗi sản phẩm" name="failurePhotoUrl">
                        <Input placeholder="https://cloudinary.com/qc_failed_shot.jpg" />
                      </Form.Item>

                      <Form.Item label="Ghi chú chi tiết" name="notes">
                        <Input.TextArea rows={2} />
                      </Form.Item>

                      <Button danger htmlType="submit" loading={qcMutation.isPending} icon={<AlertTriangle size={16} />}>
                        Xác nhận In hỏng (FAILED)
                      </Button>
                    </Form>
                  </Space>
                </Card>

                {job.jobStatus === 'FAILED' && (
                  <Card size="small" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: '#ef4444' }}>
                    <Title level={5} style={{ color: '#ef4444', margin: 0 }}>
                      Tạo lần in lại (Reprint Attempt)
                    </Title>
                    <Paragraph style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                      Quy tắc nghiệp vụ: Lần in lại sẽ liên kết với job lỗi trước đó, giữ nguyên toàn bộ lịch sử và tuyệt đối KHÔNG tính thêm bất kỳ chi phí nào cho khách hàng.
                    </Paragraph>
                    <Button
                      type="primary"
                      danger
                      icon={<RotateCcw size={16} />}
                      loading={reprintMutation.isPending}
                      onClick={() => reprintMutation.mutate()}
                    >
                      Bắt đầu In lại ngay
                    </Button>
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ResinProductionModal;
