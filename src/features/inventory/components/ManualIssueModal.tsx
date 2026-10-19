import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Alert,
} from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { CreateStockIssuePayload } from '../types/inventory.types';
import type { Material } from '../../material/types/material.types';
import type { Warehouse } from '../../warehouse/types/warehouse.types';

interface ManualIssueModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateStockIssuePayload) => Promise<void>;
  warehouses: Warehouse[];
  materials: Material[];
  initialWarehouseId?: string;
  initialMaterialId?: string;
  loading: boolean;
}

const ISSUE_REASONS = [
  'CÂN_CHỈNH_MÁY_IN (Kiểm tra & cân bàn in)',
  'HỎNG_SỢI_NHỰA (Ẩm mốc / sợi giòn hao hụt)',
  'MẪU_THỬ_NỘI_BỘ (Chạy thử nghiệm R&D)',
  'ĐIỀU_CHỈNH_KIỂM_KÊ (Lệch số liệu kiểm toán)',
  'MẪU_CHO_KHÁCH_HÀNG (Trưng bày & trải nghiệm)',
  'TIÊU_HỦY_KHÁC',
];

export const ManualIssueModal: React.FC<ManualIssueModalProps> = ({
  open,
  onCancel,
  onSubmit,
  warehouses,
  materials,
  initialWarehouseId,
  initialMaterialId,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        warehouseId: initialWarehouseId || warehouses[0]?.id,
        materialId: initialMaterialId || materials[0]?.id,
        quantityGram: 500,
        reason: ISSUE_REASONS[0],
      });
    }
  }, [open, initialWarehouseId, initialMaterialId, warehouses, materials, form]);

  const handleFinish = async (values: any) => {
    const idempotencyKey = `ISS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await onSubmit({
      warehouseId: values.warehouseId,
      materialId: values.materialId,
      quantityGram: Number(values.quantityGram),
      reason: values.reason,
      idempotencyKey,
      note: values.note,
    });
  };

  return (
    <Modal
      title={
        <Space>
          <ExportOutlined style={{ color: '#ef4444' }} />
          <span>Xuất kho thủ công</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác nhận xuất kho"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Cảnh báo khấu trừ tồn kho"
        description="Thao tác xuất kho thủ công sẽ trừ trực tiếp vào số lượng tồn kho thực tế. Hành động này được lưu trữ vĩnh viễn trong sổ cái kiểm toán giao dịch ACID."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="warehouseId"
              label="Kho nguồn"
              rules={[{ required: true, message: 'Vui lòng chọn cơ sở kho' }]}
            >
              <Select placeholder="Chọn kho nguồn">
                {warehouses.map((wh) => (
                  <Select.Option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="materialId"
              label="Vật liệu xuất"
              rules={[{ required: true, message: 'Vui lòng chọn vật liệu' }]}
            >
              <Select placeholder="Chọn mã SKU vật liệu" showSearch optionFilterProp="children">
                {materials.map((mat) => (
                  <Select.Option key={mat.id} value={mat.id}>
                    [{mat.sku}] {mat.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="quantityGram"
          label="Số lượng xuất (Gram)"
          rules={[
            { required: true, message: 'Số lượng không được để trống' },
            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} addonAfter="gram" step={50} />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do xuất kho"
          rules={[{ required: true, message: 'Vui lòng chọn lý do xuất kho' }]}
        >
          <Select placeholder="Chọn lý do xuất kho">
            {ISSUE_REASONS.map((reason) => (
              <Select.Option key={reason} value={reason}>
                {reason}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="note" label="Ghi chú kiểm toán bổ sung">
          <Input.TextArea rows={2} placeholder="Kỹ thuật viên phụ trách, mã máy in hoặc số phiếu công việc..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
