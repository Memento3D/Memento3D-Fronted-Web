import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Card,
  Select,
  Modal,
  Descriptions,
} from 'antd';
import {
  RefreshCw,
  Eye,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminAuditLog } from '../types/admin.types';
import dayjs from 'dayjs';

export const AdminAuditLogsPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [resourceFilter, setResourceFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const { data: auditPage, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs-page', page, pageSize, actionFilter, resourceFilter],
    queryFn: () =>
      adminApi.getAuditLogs({
        page,
        size: pageSize,
        action: actionFilter,
        resourceType: resourceFilter,
      }),
  });

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => (
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {dayjs(d).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      ),
    },
    {
      title: 'Người thực hiện (Actor)',
      key: 'actor',
      render: (_: any, r: AdminAuditLog) => (
        <div>
          <span style={{ fontWeight: 600, color: '#38bdf8' }}>
            {r.actorEmail || 'HỆ THỐNG'}
          </span>
          {r.actorRole && (
            <Tag color="volcano" style={{ marginLeft: 6, fontSize: '0.65rem' }}>
              {r.actorRole}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (val: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{val}</Tag>,
    },
    {
      title: 'Loại tài nguyên',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (val: string) => <Tag color="cyan">{val || 'RESOURCE'}</Tag>,
    },
    {
      title: 'Mã đối tượng',
      dataIndex: 'entityId',
      key: 'entityId',
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#cbd5e1' }}>
          {val ? `${val.substring(0, 12)}...` : '—'}
        </span>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (val: string) => (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{val || '127.0.0.1'}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: AdminAuditLog) => (
        <Button size="small" icon={<Eye size={13} />} onClick={() => setSelectedLog(r)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} id="admin-audit-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Nhật ký Kiểm toán Hệ thống Bất biến (System Audit Trail)
          </h2>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Lưu vết toàn bộ thao tác bảo mật, phân quyền, cấu hình và biến động dữ liệu quan trọng
          </div>
        </div>
        <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select
            placeholder="Lọc theo hành động"
            allowClear
            value={actionFilter}
            onChange={(v) => {
              setActionFilter(v);
              setPage(0);
            }}
            style={{ width: 220 }}
          >
            <Select.Option value="USER_CREATED">USER_CREATED (Tạo tài khoản)</Select.Option>
            <Select.Option value="USER_UPDATED">USER_UPDATED (Cập nhật thông tin)</Select.Option>
            <Select.Option value="USER_LOCKED">USER_LOCKED (Khóa tài khoản)</Select.Option>
            <Select.Option value="USER_UNLOCKED">USER_UNLOCKED (Mở khóa tài khoản)</Select.Option>
            <Select.Option value="ROLE_CHANGED">ROLE_CHANGED (Thay đổi vai trò)</Select.Option>
            <Select.Option value="PRODUCT_CREATED">PRODUCT_CREATED (Tạo sản phẩm)</Select.Option>
            <Select.Option value="RECONSTRUCTION_RETRIED">RECONSTRUCTION_RETRIED (Thử lại 3D)</Select.Option>
          </Select>

          <Select
            placeholder="Loại đối tượng"
            allowClear
            value={resourceFilter}
            onChange={(v) => {
              setResourceFilter(v);
              setPage(0);
            }}
            style={{ width: 180 }}
          >
            <Select.Option value="USER">USER</Select.Option>
            <Select.Option value="ORDER">ORDER</Select.Option>
            <Select.Option value="PRODUCT">PRODUCT</Select.Option>
            <Select.Option value="RECONSTRUCTION_JOB">RECONSTRUCTION_JOB</Select.Option>
          </Select>
        </div>
      </Card>

      <Card bordered={false} style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <Table
          columns={columns}
          dataSource={auditPage?.content || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize,
            total: auditPage?.totalElements || 0,
            onChange: (p, ps) => {
              setPage(p - 1);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* Audit Detail Modal with Before/After Diff */}
      <Modal
        title={`Bản ghi kiểm toán: #${selectedLog?.id}`}
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        width={650}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Thời gian">
                {dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                {selectedLog.actorEmail || 'HỆ THỐNG'} ({selectedLog.actorRole || 'SYSTEM'})
              </Descriptions.Item>
              <Descriptions.Item label="Hành động">
                <Tag color="blue">{selectedLog.action}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng">
                {selectedLog.entityType} ({selectedLog.entityId})
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ IP">{selectedLog.ipAddress || '127.0.0.1'}</Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {selectedLog.userAgent || 'API Gateway'}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {/* Before vs After Payload */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
                  Giá trị trước (Old Value):
                </div>
                <pre
                  style={{
                    background: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #334155',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {selectedLog.oldValue || 'null'}
                </pre>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                  Giá trị mới (New Value):
                </div>
                <pre
                  style={{
                    background: '#0f172a',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #334155',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {selectedLog.newValue || 'null'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;
