import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { warehouseService } from '../../services/warehouseService';
import { materialService } from '../../services/materialService';
import type { CreateStockIssuePayload } from '../../types/inventory';
import { ArrowUpRight, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StockIssuePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [warehouseId, setWarehouseId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantityGram, setQuantityGram] = useState('500');
  const [reason, setReason] = useState('DAMAGED');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => warehouseService.list({ limit: 100 }),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials-select'],
    queryFn: () => materialService.list({ limit: 100 }),
  });

  const { data: issuesData, isLoading: isLoadingIssues } = useQuery({
    queryKey: ['stock-issues'],
    queryFn: () => inventoryService.listIssues({ limit: 20 }),
  });

  const issueMutation = useMutation({
    mutationFn: (payload: CreateStockIssuePayload) => inventoryService.createIssue(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-issues'] });
      setSuccessMessage(`Stock issue #${res.issueNumber} completed successfully!`);
      setErrorMessage(null);
      setNote('');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to process stock issue');
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!warehouseId) {
      setErrorMessage('Please select a source warehouse');
      return;
    }
    if (!materialId) {
      setErrorMessage('Please select a material');
      return;
    }

    const qty = parseFloat(quantityGram);
    if (!qty || qty <= 0) {
      setErrorMessage('Issue quantity must be greater than zero');
      return;
    }

    const idempotencyKey = `ISS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    issueMutation.mutate({
      warehouseId,
      materialId,
      quantityGram: qty,
      reason,
      idempotencyKey,
      note: note.trim() || undefined,
    });
  };

  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];
  const issues = issuesData?.content || [];

  return (
    <div id="stock-issue-page">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Manual Stock Issue / Stock Out (F05)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Issue materials for scrap, calibration, quality testing or manual adjustments with pessimistic locking protection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={20} color="var(--warning)" />
            <span>Issue Material from Stock</span>
          </h2>

          {successMessage && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }} id="issue-success-alert">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }} id="issue-error-alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Source Warehouse *</label>
              <select
                id="select-issue-warehouse"
                className="form-control"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                disabled={issueMutation.isPending}
                required
              >
                <option value="">Select Warehouse Hub...</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Material Item *</label>
              <select
                id="select-issue-material"
                className="form-control"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                disabled={issueMutation.isPending}
                required
              >
                <option value="">Select Material SKU...</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.sku} — {m.name} ({m.color})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Quantity (grams) *</label>
                <input
                  id="input-issue-quantity"
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 500"
                  value={quantityGram}
                  onChange={(e) => setQuantityGram(e.target.value)}
                  disabled={issueMutation.isPending}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Issue Reason *</label>
                <select
                  id="select-issue-reason"
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={issueMutation.isPending}
                  required
                >
                  <option value="DAMAGED">Damaged / Moisture</option>
                  <option value="EXPIRED">Expired Shelf-Life</option>
                  <option value="CALIBRATION">Printer Calibration</option>
                  <option value="SCRAP">Purge / Scrap</option>
                  <option value="MANUAL_ADJUSTMENT">Stocktake Adjustment</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Audit Notes & Explanation</label>
              <textarea
                id="textarea-issue-note"
                className="form-control"
                rows={3}
                placeholder="Required context for this stock removal..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={issueMutation.isPending}
              />
            </div>

            <button
              id="btn-submit-issue"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              disabled={issueMutation.isPending}
            >
              <Save size={16} />
              <span>{issueMutation.isPending ? 'Processing Stock Out...' : 'Confirm Material Issue'}</span>
            </button>
          </form>
        </div>

        {/* History Table Panel */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: '#fff' }}>
            Recent Stock Issues
          </div>
          {isLoadingIssues ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading issues...
            </div>
          ) : issues.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No manual issues recorded yet.
            </div>
          ) : (
            <div className="data-table-wrapper" style={{ border: 'none' }}>
              <table className="data-table" id="recent-issues-table">
                <thead>
                  <tr>
                    <th>Issue #</th>
                    <th>Warehouse</th>
                    <th>Material</th>
                    <th>Reason</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                        {i.issueNumber}
                      </td>
                      <td>{i.warehouseCode}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{i.materialSku}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i.materialName}</div>
                      </td>
                      <td>
                        <span className="badge badge-warning">{i.reason}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                        -{Number(i.quantityGram).toLocaleString()} g
                      </td>
                      <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
