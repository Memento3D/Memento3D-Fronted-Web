import { lazy, Suspense, useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, Space, Spin, Tag } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customPrintApi } from '../api/customPrintApi';
import type { OrderResponse } from '../types/order.types';

const Viewer = lazy(() => import('../../reconstruction/components/Keepsake3DViewer').then(module => ({ default: module.Keepsake3DViewer })));
export const isCustomPrintOrder = (order: OrderResponse) => order.items?.some(item => (item.customization ?? item.customizationSnapshot)?.kind === 'CUSTOM_PRINT_V1') ?? false;
const statusLabels = { QUEUED: 'Chờ chuẩn bị file', EXPORTING: 'Đang chuẩn bị file', READY: 'Chờ xưởng kiểm tra file', APPROVED: 'File đã được xưởng duyệt', REJECTED: 'File cần điều chỉnh', FAILED: 'Chưa chuẩn bị được file' };

export function CustomPrintDesignPanel({ order, manager = false }: { order: OrderResponse;manager?: boolean }) {
  const client = useQueryClient();
  const [preview, setPreview] = useState(false), [checked, setChecked] = useState(false), [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['custom-print-design', order.id], queryFn: () => customPrintApi.get(order.id), enabled: isCustomPrintOrder(order), retry: false,
    refetchInterval: state => ['QUEUED', 'EXPORTING', 'READY'].includes(state.state.data?.status ?? '') ? 5000 : false });
  const mutation = useMutation({ mutationFn: async (action: 'retry' | 'approve' | 'reject') => action === 'retry' ? customPrintApi.retry(order.id) : customPrintApi.review(order.id, action === 'approve', notes),
    onSuccess: data => {client.setQueryData(['custom-print-design', order.id], data);setError(null);void client.invalidateQueries({ queryKey: ['orders'] });},
    onError: () => setError('Chưa cập nhật được. Hãy làm mới để kiểm tra trạng thái trước khi thử lại.') });
  if (!isCustomPrintOrder(order)) return null;
  const design = query.data;
  return <Card id={`custom-print-design-${order.id}`} title="Thiết kế đã chốt trong đơn" style={{ marginBottom: 20 }} extra={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Làm mới file</Button>}>
    {query.isPending && <Spin />}
    {query.isError && <Alert type="error" showIcon title="Chưa tải được thiết kế của đơn" action={<Button onClick={() => void query.refetch()}>Thử lại</Button>} />}
    {design && <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap><Tag color={design.approvedForProduction ? 'green' : 'gold'}>{statusLabels[design.status]}</Tag><Tag>Bản lưu #{design.revision}</Tag><Tag>Chiều cao {design.requestedHeightCm} cm</Tag>{design.assets.map(asset => <Tag key={asset.assetVersionId}>{asset.name}</Tag>)}</Space>
      <p>Đây là bản cố định được gửi khi đặt sản xuất. Thay đổi trong phần Mô hình của tôi không làm đổi bản này.</p>
      {(order.totalAmount ?? order.totalPrice) === 0 && <Alert type="info" showIcon title="Đang chờ xưởng báo giá, chưa đến bước thanh toán" />}
      {design.status === 'FAILED' && <Alert type="error" showIcon title="Chưa xuất được file, bản thiết kế vẫn được giữ" action={<Button loading={mutation.isPending} onClick={() => mutation.mutate('retry')}>Thử chuẩn bị lại file</Button>} />}
      {design.reviewNotes && <Alert type={design.status === 'REJECTED' ? 'warning' : 'info'} title="Nhận xét của xưởng" description={design.reviewNotes} />}
      {design.downloadUrl && <Space wrap><Button onClick={() => setPreview(value => !value)}>{preview ? 'Ẩn mẫu 3D' : 'Xem mẫu đã chốt'}</Button><Button href={design.downloadUrl} target="_blank" rel="noopener noreferrer">Tải file GLB hoàn chỉnh</Button></Space>}
      {preview && design.downloadUrl && <Suspense fallback={<Spin />}><Viewer modelUrl={design.downloadUrl} modelName="Mẫu đã chốt trong đơn" isUnlocked /></Suspense>}
      {manager && ['READY', 'REJECTED'].includes(design.status) && <Space orientation="vertical" style={{ width: '100%' }}>
        <Checkbox checked={checked} onChange={event => setChecked(event.target.checked)}>Đã kiểm tra hình học, độ khít phụ kiện, kích thước và khả năng sản xuất của file này.</Checkbox>
        <Input.TextArea aria-label="Nhận xét kiểm tra file in" value={notes} onChange={event => setNotes(event.target.value)} maxLength={4000} placeholder="Ghi kết quả kiểm tra (ít nhất 10 ký tự)" />
        <Space><Button type="primary" disabled={!checked || notes.trim().length < 10} loading={mutation.isPending} onClick={() => mutation.mutate('approve')}>Duyệt file cho sản xuất</Button><Button danger disabled={!checked || notes.trim().length < 10} loading={mutation.isPending} onClick={() => mutation.mutate('reject')}>Yêu cầu điều chỉnh</Button></Space>
      </Space>}
      {error && <Alert type="error" showIcon title={error} />}
    </Space>}
  </Card>;
}
