import { useRef, useState } from 'react';
import { Alert, Button, Checkbox, Form, Input, InputNumber, Modal, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { CustomizationDraft, CustomizationScene } from '../../../services/modelCustomizationService';
import { apiErrorStatus } from '../../../services/apiErrors';
import { orderApi } from '../../orders/api/orderApi';
import type { CreateOrderRequest } from '../../orders/types/order.types';

export function CustomPrintOrderModal({ scene, draft, onClose }: { scene: CustomizationScene;draft: CustomizationDraft;onClose: () => void }) {
  const storageKey = `memento3d:pending-checkout:${scene.modelOutputId}:${scene.fitResultId}:${draft.revision}`;
  const cached = useRef<CreateOrderRequest | null>(null);
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    try {const value = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');if (value?.modelOutputId === scene.modelOutputId && value.fitResultId === scene.fitResultId && value.customizationRevision === draft.revision && typeof value.idempotencyKey === 'string') cached.current = value;} catch { /* Optional tab recovery. */ }
  }
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null), [confirmed, setConfirmed] = useState(false);
  const submitted = useRef<CreateOrderRequest | null>(cached.current), lock = useRef(false);
  const key = useRef(`custom:${crypto.randomUUID()}`);
  const send = async (payload: CreateOrderRequest) => {
    if (lock.current) return;
    lock.current = true;setBusy(true);setError(null);submitted.current = payload;
    try {sessionStorage.setItem(storageKey, JSON.stringify(payload));} catch { /* In-memory retry still uses the same key. */ }
    try {const order = await orderApi.create(payload);try {sessionStorage.removeItem(storageKey);} catch { /* Optional tab recovery. */ }navigate(`/customer/orders/${order.id}`);}
    catch (reason) {setError(apiErrorStatus(reason) === 409 ? 'Bản lưu hoặc yêu cầu đặt in đã thay đổi. Đóng hộp thoại và tải lại bản đã lưu trước khi gửi tiếp.' : 'Chưa xác nhận được yêu cầu. Bấm Gửi lại để kiểm tra cùng yêu cầu, tránh tạo đơn trùng.');}
    finally {lock.current = false;setBusy(false);}
  };
  return <Modal open title="Chốt thiết kế để đặt sản xuất" footer={null} onCancel={busy ? undefined : onClose} maskClosable={false} destroyOnHidden>
    <Alert showIcon type="info" title="Xưởng kiểm tra và báo giá trước khi thanh toán" description="Đơn giữ đúng bản thiết kế này. Việc sửa model cá nhân sau đó không làm đổi mẫu đã gửi xưởng." />
    <Space wrap style={{ margin: '16px 0' }}><Tag>Bản lưu #{draft.revision}</Tag>{Object.values(draft.selection).filter(Boolean).map(id => <Tag key={id!}>{scene.assets.find(asset => asset.assetVersionId === id)?.name}</Tag>)}</Space>
    {error && <Alert showIcon type="error" title={error} style={{ marginBottom: 16 }} />}
    <Form layout="vertical" disabled={busy || !!submitted.current} initialValues={{ requestedHeightCm: 12, ...cached.current }} onFinish={values => void send({ ...values, modelOutputId: scene.modelOutputId, fitResultId: scene.fitResultId, customizationRevision: draft.revision, idempotencyKey: key.current })}>
      <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, whitespace: true }, { max: 255 }]}><Input autoComplete="name" /></Form.Item>
      <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }, { pattern: /^[0-9+()\-\s]{8,20}$/, message: 'Kiểm tra lại số điện thoại' }]}><Input autoComplete="tel" /></Form.Item>
      <Form.Item name="shippingAddress" label="Địa chỉ nhận" rules={[{ required: true, whitespace: true }]}><Input.TextArea autoComplete="street-address" maxLength={2000} /></Form.Item>
      <Form.Item name="requestedHeightCm" label="Chiều cao toàn mẫu mong muốn (cm)" rules={[{ required: true }]}><InputNumber min={8} max={20} precision={0} /></Form.Item>
      <p>Vật liệu dự kiến: Resin SLA. Xưởng sẽ xác nhận khả năng in, chi phí và thời gian thực hiện.</p>
      <Form.Item name="note" label="Ghi chú"><Input.TextArea maxLength={2000} /></Form.Item>
      <Checkbox checked={confirmed} disabled={busy || !!submitted.current} onChange={event => setConfirmed(event.target.checked)}>Tôi xác nhận gửi đúng bản thiết kế đã lưu ở trên.</Checkbox>
      {!submitted.current && <Button type="primary" htmlType="submit" loading={busy} disabled={!confirmed} block style={{ marginTop: 20 }}>Gửi yêu cầu đặt sản xuất</Button>}
    </Form>
    {submitted.current && <Button type="primary" block loading={busy} disabled={busy} style={{ marginTop: 20 }} onClick={() => void send(submitted.current!)}>Gửi lại cùng yêu cầu</Button>}
  </Modal>;
}
