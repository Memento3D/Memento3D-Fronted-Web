import React from 'react';
import { Drawer, Descriptions, Tag, Typography, Space, Button, Divider, Alert } from 'antd';
import { EditOutlined, FireOutlined, ExperimentOutlined, DollarOutlined } from '@ant-design/icons';
import type { Material } from '../types/material.types';

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
            {material.status}
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
          Edit Material
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {material.description && (
          <Alert
            message="Description & Notes"
            description={material.description}
            type="info"
            showIcon
          />
        )}

        <Title level={5}>
          <ExperimentOutlined /> Identification & Classification
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="SKU Code">
            <Text code copyable>{material.sku}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Material Type">
            <Tag color="cyan">{material.materialType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Color">
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
          <Descriptions.Item label="Density">
            {material.density ? `${material.density} g/cm³` : 'Standard (~1.24 g/cm³)'}
          </Descriptions.Item>
          <Descriptions.Item label="Diameter">
            {material.diameter ? `${material.diameter} mm` : '1.75 mm'}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '12px 0' }} />

        <Title level={5}>
          <FireOutlined /> Thermal & Print Profile
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Nozzle Printing Window">
            {material.printTempMin && material.printTempMax ? (
              <Tag color="volcano">{material.printTempMin}°C — {material.printTempMax}°C</Tag>
            ) : (
              '190°C — 220°C (Default)'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Heated Bed Window">
            {material.bedTempMin && material.bedTempMax ? (
              <Tag color="orange">{material.bedTempMin}°C — {material.bedTempMax}°C</Tag>
            ) : (
              '50°C — 60°C (Default)'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '12px 0' }} />

        <Title level={5}>
          <DollarOutlined /> Financial & Audit
        </Title>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Unit Cost per Gram">
            <Text strong style={{ color: '#10b981' }}>
              {Number(material.unitCost).toLocaleString()} VND / gram
            </Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              (~{(Number(material.unitCost) * 1000).toLocaleString()} VND / 1kg Spool)
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(material.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(material.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="System ID">
            <Text type="secondary" style={{ fontSize: 11 }} copyable>
              {material.id}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Drawer>
  );
};
