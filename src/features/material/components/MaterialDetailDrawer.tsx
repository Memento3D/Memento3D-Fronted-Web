import React from 'react';
import { Drawer, Descriptions, Tag, Typography, Space, Button, Divider, Alert } from 'antd';
import { EditOutlined, FireOutlined, ExperimentOutlined, DollarOutlined } from '@ant-design/icons';
import type { Material } from '../types/material.types';
import { getStatusLabel } from '../../../locales/i18n';

const { Text, Title } = Typography;

interface MaterialDetailDrawerProps {
  material: Material | null;
  open: boolean;
  onClose: () => void;
  onEdit: (material: Material) => void;
}

export const MaterialDetailDrawer: React.FC<MaterialDetailDrawerProps> = ({
  material,
  open,
  onClose,
  onEdit,
}) => {
  if (!material) return null;

  return (
    <Drawer
      title={
        <Space>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: material.colorHex || '#3b82f6',
              display: 'inline-block',
              boxShadow: '0 0 8px rgba(0,0,0,0.4)',
            }}
          />
          <span>{material.name}</span>
          <Tag color={material.status === 'ACTIVE' ? 'success' : 'default'}>
            {getStatusLabel(material.status)}
          </Tag>
        </Space>
      }
      placement="right"
      width={560}
      onClose={onClose}
      open={open}
      extra={
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            onClose();
            onEdit(material);
          }}
        >
          Chỉnh sửa vật liệu
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {material.description && (
          <Alert
            message="Mô tả & Ghi chú"
            description={material.description}
            type="info"
            showIcon
          />
        )}

        <Title level={5}>
          <ExperimentOutlined /> Định danh & Phân loại
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Mã SKU">
            <Text code copyable>{material.sku}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại vật liệu">
            <Tag color="cyan">{material.materialType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Màu sắc">
            <Space>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: material.colorHex || '#ccc',
                  display: 'inline-block',
                }}
              />
              <span>{material.color}</span>
              {material.colorHex && <Text type="secondary">({material.colorHex})</Text>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Khối lượng riêng">
            {material.density ? `${material.density} g/cm³` : 'Tiêu chuẩn (~1.24 g/cm³)'}
          </Descriptions.Item>
          <Descriptions.Item label="Đường kính sợi">
            {material.diameter ? `${material.diameter} mm` : '1.75 mm'}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '12px 0' }} />

        <Title level={5}>
          <FireOutlined /> Thông số Nhiệt độ In
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Dải nhiệt độ đầu phun">
            {material.printTempMin && material.printTempMax ? (
              <Tag color="volcano">{material.printTempMin}°C — {material.printTempMax}°C</Tag>
            ) : (
              '190°C — 220°C (Tiêu chuẩn)'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Dải nhiệt độ bàn in">
            {material.bedTempMin && material.bedTempMax ? (
              <Tag color="orange">{material.bedTempMin}°C — {material.bedTempMax}°C</Tag>
            ) : (
              '50°C — 60°C (Tiêu chuẩn)'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '12px 0' }} />

        <Title level={5}>
          <DollarOutlined /> Định giá & Kiểm toán
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Đơn giá mỗi gram">
            <Text strong style={{ color: '#10b981' }}>
              {Number(material.unitCost).toLocaleString()} VND / gram
            </Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              (~{(Number(material.unitCost) * 1000).toLocaleString()} VND / Cuộn 1kg)
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(material.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(material.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Mã định danh hệ thống">
            <Text type="secondary" style={{ fontSize: 11 }} copyable>
              {material.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Drawer>
  );
};
