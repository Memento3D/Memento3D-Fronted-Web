import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { warehouseService } from '../../services/warehouseService';
import { materialService } from '../../services/materialService';
import type { CreateStockReceiptPayload } from '../../types/inventory';
import { ArrowDownLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StockReceiptPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [warehouseId, setWarehouseId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantityGram, setQuantityGram] = useState('2000');
  const [unitCost, setUnitCost] = useState('250');
  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
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

  const { data: receiptsData, isLoading: isLoadingReceipts } = useQuery({
    queryKey: ['stock-receipts'],
    queryFn: () => inventoryService.listReceipts({ limit: 20 }),
  });

  const receiptMutation = useMutation({
    mutationFn: (payload: CreateStockReceiptPayload) => inventoryService.createReceipt(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-receipts'] });
      setSuccessMessage(`Goods receipt #${res.receiptNumber} registered successfully!`);
      setErrorMessage(null);
      setSupplier('');
      setBatchNumber('');
      setNote('');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to process goods receipt');
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!warehouseId) {
      setErrorMessage('Please select a destination warehouse');
      return;
    }
    if (!materialId) {
      setErrorMessage('Please select a material');
      return;
    }

    const qty = parseFloat(quantityGram);
    if (!qty || qty <= 0) {
      setErrorMessage('Receipt quantity must be greater than zero');
      return;
    }

    // Generate unique idempotency key for this submission
    const idempotencyKey = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    receiptMutation.mutate({
      warehouseId,
      materialId,
      quantityGram: qty,
      unitCost: parseFloat(unitCost) || 0,
      supplier: supplier.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      idempotencyKey,
      note: note.trim() || undefined,
    });
  };

  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];
  const receipts = receiptsData?.content || [];

  return (
    <div id="stock-receipt-page">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Goods Receipt / Stock In (F04)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Receive incoming raw materials into storage, update unit costs, and append to the immutable transaction ledger.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownLeft size={20} color="var(--primary)" />
            <span>New Stock In Receipt</span>
          </h2>

          {successMessage && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }} id="receipt-success-alert">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }} id="receipt-error-alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Destination Warehouse *</label>
              <select
                id="select-receipt-warehouse"
                className="form-control"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                disabled={receiptMutation.isPending}
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
                id="select-receipt-material"
                className="form-control"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                disabled={receiptMutation.isPending}
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
                  id="input-receipt-quantity"
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 2000"
                  value={quantityGram}
                  onChange={(e) => setQuantityGram(e.target.value)}
                  disabled={receiptMutation.isPending}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost (VND / gram) *</label>
                <input
                  id="input-receipt-cost"
                  type="number"
                  step="1"
                  className="form-control"
                  placeholder="e.g. 250"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  disabled={receiptMutation.isPending}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier / Vendor</label>
              <input
                id="input-receipt-supplier"
                type="text"
                className="form-control"
                placeholder="e.g. eSun Vietnam Distributor"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                disabled={receiptMutation.isPending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Batch / Lot Number</label>
              <input
                id="input-receipt-batch"
                type="text"
                className="form-control"
                placeholder="e.g. LOT-202610-PLA"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                disabled={receiptMutation.isPending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Purchase Order Ref</label>
              <textarea
                id="textarea-receipt-note"
                className="form-control"
                rows={2}
                placeholder="Optional invoice or delivery reference..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={receiptMutation.isPending}
              />
            </div>

            <button
              id="btn-submit-receipt"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={receiptMutation.isPending}
            >
              <Save size={16} />
              <span>{receiptMutation.isPending ? 'Processing Stock In...' : 'Confirm Goods Receipt'}</span>
            </button>
          </form>
        </div>

        {/* History Table Panel */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: '#fff' }}>
            Recent Goods Receipts
          </div>
          {isLoadingReceipts ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading receipts...
            </div>
          ) : receipts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No receipts recorded yet.
            </div>
          ) : (
            <div className="data-table-wrapper" style={{ border: 'none' }}>
              <table className="data-table" id="recent-receipts-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Warehouse</th>
                    <th>Material</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {r.receiptNumber}
                      </td>
                      <td>{r.warehouseCode}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{r.materialSku}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.materialName}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                        +{Number(r.quantityGram).toLocaleString()} g
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {Number(r.unitCost).toLocaleString()} ₫
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
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
