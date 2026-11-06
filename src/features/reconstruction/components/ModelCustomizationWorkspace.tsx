import { useEffect, useRef, useState } from 'react';
import { apiErrorCode, apiErrorStatus } from '../../../services/apiErrors';
import { Alert, Button, Spin, Tag } from 'antd';
import { modelCustomizationService, type CustomizationScene, type CustomizationDraft, type CustomizationSelection } from '../../../services/modelCustomizationService';
import { CustomizationViewer } from './CustomizationViewer';
import { useUnsavedDesignGuard } from './useUnsavedDesignGuard';
import './customization.css';
import { CustomPrintOrderModal } from './CustomPrintOrderModal';

const equal = (a: CustomizationSelection, b: CustomizationSelection) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(key => a[key] === b[key]);
const label = (slot: string) => ({ headwear: 'Kiểu đầu', glasses: 'Mắt kính' })[slot] ?? slot;

export function ModelCustomizationWorkspace({ outputId, onDirtyChange }: { outputId: string; onDirtyChange?: (dirty: boolean) => void }) {
  const [scene, setScene] = useState<CustomizationScene | null>(null);
  const [draft, setDraft] = useState<CustomizationDraft | null>(null);
  const [selection, setSelection] = useState<CustomizationSelection>({});
  const [applied, setApplied] = useState<CustomizationSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [retry, setRetry] = useState(0);
  const [reload, setReload] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const alive = useRef(true);
  const latestScene = useRef(scene);latestScene.current = scene;
  const refreshing = useRef<Promise<CustomizationScene> | null>(null);
  const dirty = !!draft && !equal(selection, draft.selection);
  const localDraftKey = `memento3d:unsaved-design:${outputId}`;
  useUnsavedDesignGuard(dirty);
  useEffect(() => { onDirtyChange?.(dirty);return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);

  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    setLoading(true);setError(null);setNotice(null);setScene(null);setDraft(null);
    modelCustomizationService.getScene(outputId, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      let initial = { ...data.customization.selection };
      let recovered = false, stale = false;
      try {
        const raw = sessionStorage.getItem(localDraftKey);
        if (raw) {
          const local = JSON.parse(raw);
          const compatible = local.fitResultId === data.fitResultId && local.selection &&
            Object.keys(local.selection).length === data.groups.length && data.groups.every(group =>
              Object.hasOwn(local.selection, group.id) && (local.selection[group.id] === null
                ? group.noneAllowed && !group.required : group.assetVersionIds.includes(local.selection[group.id])));
          if (compatible && data.customization.editable && !equal(local.selection, initial)) {
            initial = local.selection;recovered = true;stale = local.revision !== data.customization.revision;
          }
        }
      } catch { /* A browser draft is optional; server data remains authoritative. */ }
      setScene(data);setDraft(data.customization);setSelection(initial);setApplied(null);
      setBusy(true);setRenderError(null);setConflict(stale);
      if (recovered && stale) setError('Bản lưu đã thay đổi từ thiết bị khác. Các thay đổi chưa lưu trong tab này được giữ để bạn đối chiếu.');
      else if (recovered) setNotice('Đã khôi phục lựa chọn chưa lưu trong tab này. Bấm Lưu thiết kế để lưu vào tài khoản.');
    }).catch(reason => {
      if (!controller.signal.aborted) setError(apiErrorStatus(reason) === 409
        && apiErrorCode(reason) === 'CUSTOMIZATION_NOT_AVAILABLE'
        ? 'Mô hình này chưa có dữ liệu tùy chỉnh. Hãy tạo model mới bằng phiên bản AI custom.'
        : 'Không tải được thiết kế. Vui lòng thử lại.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { alive.current = false;controller.abort(); };
  }, [outputId, reload]);

  useEffect(() => {
    if (!scene || !draft) return;
    try {
      if (dirty && !conflict) sessionStorage.setItem(localDraftKey, JSON.stringify({ fitResultId: scene.fitResultId, revision: draft.revision, selection }));
      else if (!dirty) sessionStorage.removeItem(localDraftKey);
    } catch { /* Storage may be disabled or full; normal explicit save still works. */ }
  }, [scene, draft, selection, dirty, conflict, localDraftKey]);

  const refresh = (): Promise<CustomizationScene> => {
    if (refreshing.current) return refreshing.current;
    refreshing.current = modelCustomizationService.getScene(outputId).then(fresh => {
      const old = latestScene.current;
      if (!old || old.fitResultId !== fresh.fitResultId || old.baseModel.sha256 !== fresh.baseModel.sha256
        || old.assets.length !== fresh.assets.length || old.assets.some(asset => !fresh.assets.some(next =>
          next.assetVersionId === asset.assetVersionId && next.sha256 === asset.sha256))) {
        throw new Error('Phiên bản mô hình đã thay đổi. Hãy tải lại thiết kế.');
      }
      if (alive.current) setScene(fresh);
      return fresh;
    }).finally(() => { refreshing.current = null; });
    return refreshing.current;
  };
  const choose = (slot: string, id: string | null) => {
    setSelection(previous => ({ ...previous, [slot]: id }));setBusy(true);setRenderError(null);
  };
  const save = async () => {
    if (!scene || !draft || busy || saving || renderError || conflict || !draft.editable) return;
    const submitted = { ...selection };
    setSaving(true);setError(null);setNotice(null);
    try {
      const saved = await modelCustomizationService.save(outputId, { fitResultId: scene.fitResultId, revision: draft.revision, selection: submitted });
      if (alive.current) setDraft(saved);
    } catch (reason) {
      if (!alive.current) return;
      if (apiErrorStatus(reason) === 409) {
        setConflict(true);setError('Bản lưu đã thay đổi hoặc không còn cho phép chỉnh sửa. Lựa chọn đang chỉnh vẫn được giữ.');
      } else setError('Chưa lưu được thiết kế. Lựa chọn của bạn vẫn được giữ, hãy thử lại.');
    } finally { if (alive.current) setSaving(false); }
  };
  const loadSaved = async () => {
    if (dirty && !window.confirm('Thay các lựa chọn đang chỉnh bằng bản đã lưu?')) return;
    setSaving(true);
    try {
      const saved = await modelCustomizationService.getDraft(outputId);
      if (!alive.current) return;
      if (saved.fitResultId !== scene?.fitResultId) { setReload(value => value + 1);return; }
      setDraft(saved);setSelection({ ...saved.selection });setBusy(true);setError(null);setNotice(null);setConflict(false);setRenderError(null);
    } catch { if (alive.current) setError('Không tải được bản đã lưu. Vui lòng thử lại.'); }
    finally { if (alive.current) setSaving(false); }
  };

  if (loading) return <div className="customization-placeholder" role="status"><Spin /> Đang mở thiết kế của bạn…</div>;
  if (!scene || !draft) return <Alert type="error" showIcon title="Chưa mở được thiết kế" description={error}
    action={<Button onClick={() => setReload(value => value + 1)}>Thử lại</Button>} />;

  return <section className="customization-workspace" aria-label="Tùy chỉnh kỷ vật 3D">
    <header className="customization-heading"><div><Tag color="purple">THIẾT KẾ CỦA BẠN</Tag><h2>Thêm dấu ấn riêng</h2>
      <p>Chọn mũ hoặc tóc, thêm kính và xoay mô hình để xem trước.</p></div>
      <Tag color={dirty ? 'orange' : draft.exists ? 'green' : 'default'}>{dirty ? 'Chưa lưu thay đổi' : draft.exists ? 'Đã lưu thiết kế' : 'Bản mặc định'}</Tag>
    </header>
    {error && <Alert type={conflict ? 'warning' : 'error'} showIcon title={error}
      action={conflict ? <Button onClick={() => void loadSaved()} loading={saving}>Tải bản đã lưu</Button> : undefined} />}
    {notice && <Alert type="info" showIcon title={notice} closable onClose={() => setNotice(null)} />}
    <div className="customization-layout">
      <div className="customization-stage">
        <CustomizationViewer key={`${outputId}:${scene.fitResultId}:${reload}`} scene={scene} selection={selection} retry={retry}
          refresh={refresh} onReady={value => { setApplied(value);setBusy(false);setRenderError(null); }}
          onError={message => { setBusy(false);setRenderError(message);if (applied && !equal(selection, applied)) { setError(message);setSelection({ ...applied }); } }} />
        {renderError && <Alert type="error" showIcon title={renderError}
          action={<Button onClick={() => { setBusy(true);setRenderError(null);setRetry(value => value + 1); }}>Tải lại 3D</Button>} />}
      </div>
      <aside className="customization-panel" aria-label="Danh sách phụ kiện">
        {!draft.editable && <Alert type="info" title="Thiết kế đang ở chế độ chỉ xem" />}
        {scene.groups.map(group => <fieldset key={group.id} disabled={!draft.editable || saving}>
          <legend>{label(group.id)}</legend>
          <p>{group.id === 'headwear' ? 'Chọn một kiểu phù hợp với bạn' : group.id === 'glasses' ? 'Có thể thêm hoặc tháo kính' : 'Chọn mẫu để xem trước'}</p>
          <div className="customization-options" role="radiogroup" aria-label={label(group.id)} onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
            const index = options.findIndex(option => option === document.activeElement);
            if (!options.length) return;
            event.preventDefault();
            const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
            const next = options[(index + step + options.length) % options.length];next.focus();next.click();
          }}>
            {group.noneAllowed && !group.required && <button type="button" role="radio" aria-checked={selection[group.id] === null}
              className={`customization-option ${selection[group.id] === null ? 'is-selected' : ''}`} onClick={() => choose(group.id, null)}>
              <span className="customization-none" aria-hidden="true">∅</span><span>Không {group.id === 'glasses' ? 'kính' : 'sử dụng'}</span>
            </button>}
            {group.assetVersionIds.map(id => {
              const asset = scene.assets.find(item => item.assetVersionId === id);if (!asset) return null;
              return <button type="button" role="radio" aria-checked={selection[group.id] === id} key={id}
                className={`customization-option ${selection[group.id] === id ? 'is-selected' : ''}`} onClick={() => choose(group.id, id)}>
              <img src={asset.thumbnailUrl} alt="" loading="lazy" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /><span>{asset.name}</span>
                {selection[group.id] === id && <span className="customization-selected">{busy ? 'Đang tải…' : 'Đang chọn'}</span>}
              </button>;
            })}
          </div>
        </fieldset>)}
      </aside>
    </div>
    <footer className="customization-savebar"><div aria-live="polite"><strong>{saving ? 'Đang lưu…' : dirty ? 'Bạn có thay đổi chưa lưu' : draft.exists ? 'Thiết kế đã được lưu' : 'Lưu để xem lại lựa chọn này'}</strong>
      <p>Thiết kế đã lưu sẽ xuất hiện khi bạn mở lại mô hình.</p></div>
      <div className="customization-actions"><Button disabled={saving || busy || (!dirty && !conflict)} onClick={() => void loadSaved()}>Khôi phục bản đã lưu</Button>
        <Button type="primary" size="large" loading={saving} disabled={!draft.editable || busy || !!renderError || conflict || (!dirty && draft.exists)} onClick={() => void save()}>Lưu thiết kế</Button></div>
    </footer>
    <div className="customization-production-note"><Button size="large" type="primary" disabled={!draft.exists || dirty || saving || busy || !!renderError || conflict || !draft.editable} onClick={() => setOrdering(true)}>Đặt sản xuất bản đã lưu</Button>
      <p>{dirty || !draft.exists ? 'Lưu thiết kế trước khi gửi xưởng.' : 'Xưởng sẽ kiểm tra mẫu và báo giá. Bạn chỉ thanh toán sau khi đồng ý báo giá.'}</p></div>
    {ordering && <CustomPrintOrderModal scene={scene} draft={draft} onClose={() => setOrdering(false)} />}
  </section>;
}
