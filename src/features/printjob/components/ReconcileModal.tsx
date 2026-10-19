import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Input, Alert, Space, Typography, Descriptions, Tag, Row, Col } from 'antd';
import { CheckCircleOutlined, WarningOutlined, RedoOutlined } from '@ant-design/icons';
import type { PrintJob, ConsumptionReconciliationPayload } from '../types/printJob.types';

const { Text } = Typography;

interface ReconcileModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: ConsumptionReconciliationPayload) => Promise<void>;
  job: PrintJob | null;
  loading: boolean;
}

export const ReconcileModal: React.FC<ReconcileModalProps> = ({
  open,
  onCancel,
  onSubmit,
  job,
  loading,
}) => {
  const [form] = Form.useForm();
  const issued = job?.estimatedGram || 400;

  const [used, setUsed] = useState<number>(360);
  const [waste, setWaste] = useState<number>(30);
  const [returned, setReturned] = useState<number>(10);

  useEffect(() => {
    if (open && job) {
      form.resetFields();
      const defaultUsed = Math.round(issued * 0.88);
      const defaultWaste = Math.round(issued * 0.08);
      const defaultReturn = issued - defaultUsed - defaultWaste;

      setUsed(defaultUsed);
      setWaste(defaultWaste);
      setReturned(defaultReturn);

      form.setFieldsValue({
        usedGram: defaultUsed,
        wasteGram: defaultWaste,
        returnedGram: defaultReturn,
        note: 'In hoàn thành chuẩn, vật liệu đỡ đã xả và phần dư đã thu hồi kho.',
      });
    }
  }, [open, job, issued, form]);

  const currentTotal = used + waste + returned;
  const difference = issued - currentTotal;
  const isValid = difference === 0;

  const handleFinish = async (values: any) => {
    if (!isValid) return;
    await onSubmit({
      usedGram: Number(values.usedGram),
      wasteGram: Number(values.wasteGram),
      returnedGram: Number(values.returnedGram),
      note: values.note,
    });
  };

  return (
    <Modal
      title={
        <Space>
          <RedoOutlined style={{ color: '#10b981' }} />
          <span>Quyết toán tiêu hao vật liệu sau khi in (F07)</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okButtonProps={{ disabled: !isValid }}
      okText="Quyết toán & Đóng sổ"
      cancelText="Hủy"
      width={600}
      destroyOnClose
    >
      <Alert
        message="Nguyên tắc bảo toàn khối lượng"
        description="Tổng khối lượng: Đã dùng (Mô hình) + Hao phí (Support/Xả nhựa) + Trả lại kho (Dư thừa) phải bằng chính xác khối lượng đã xuất cấp."
        type={isValid ? 'info' : 'warning'}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Mã lệnh in">
          <Text strong>{job?.jobNumber}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Khối lượng đã xuất kho">
          <Text strong style={{ color: '#0ea5e9', fontSize: 15 }}>{issued} g</Text>
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="usedGram"
              label="Mô hình thực tế (g)"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                onChange={(v) => setUsed(Number(v) || 0)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="wasteGram"
              label="Hao phí & Support (g)"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                onChange={(v) => setWaste(Number(v) || 0)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="returnedGram"
              label="Thu hồi về kho (g)"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                onChange={(v) => setReturned(Number(v) || 0)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Real-time Math Verification Box */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: isValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {isValid ? (
                <CheckCircleOutlined style={{ color: '#10b981' }} />
              ) : (
                <WarningOutlined style={{ color: '#ef4444' }} />
              )}
              <Text strong style={{ color: isValid ? '#34d399' : '#f87171' }}>
                Cân đối quyết toán: {currentTotal} / {issued} g
              </Text>
            </Space>
            <Tag color={isValid ? 'success' : 'error'}>
              {isValid ? 'Khớp 100%' : `Chênh lệch: ${difference > 0 ? `Thiếu ${difference}g` : `Thừa ${Math.abs(difference)}g`}`}
            </Tag>
          </div>
        </div>

        <Form.Item name="note" label="Ghi chú quyết toán">
          <Input.TextArea rows={2} placeholder="Ghi chú kết quả in hoặc ghi nhận lỗi (nếu có)..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
