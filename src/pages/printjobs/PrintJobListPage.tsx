import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { printJobService } from '../../services/printJobService';
import { warehouseService } from '../../services/warehouseService';
import { materialService } from '../../services/materialService';
import type { PrintJob, CreatePrintJobPayload } from '../../types/printJob';
import { 
  Printer, 
  Plus, 
  Lock, 
  PackageCheck, 
  RotateCcw, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Save 
} from 'lucide-react';

export const PrintJobListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [activeModal, setActiveModal] = useState<'RESERVE' | 'ISSUE' | 'RECONCILE' | null>(null);

  // Form states
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newEstimatedGram, setNewEstimatedGram] = useState('400');

  // Action states
  const [actionWarehouseId, setActionWarehouseId] = useState('');
  const [reserveGram, setReserveGram] = useState('400');
  const [issueGram, setIssueGram] = useState('400');
  const [issueNote, setIssueNote] = useState('');

  // Reconciliation states
  const [usedGram, setUsedGram] = useState('350');
  const [wasteGram, setWasteGram] = useState('30');
  const [returnedGram, setReturnedGram] = useState('20');
  const [reconcileNote, setReconcileNote] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: printJobsData, isLoading } = useQuery({
    queryKey: ['print-jobs'],
    queryFn: () => printJobService.list({ limit: 50 }),
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => warehouseService.list({ limit: 100 }),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials-select'],
    queryFn: () => materialService.list({ limit: 100 }),
  });

  const createJobMutation = useMutation({
    mutationFn: (payload: CreatePrintJobPayload) => printJobService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      setIsCreateOpen(false);
      setFeedbackMessage('Print job created successfully!');
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const reserveMutation = useMutation({
    mutationFn: ({ id, warehouseId, gram }: { id: string; warehouseId: string; gram: number }) =>
      printJobService.reserveStock(id, { warehouseId, reservedGram: gram }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      setActiveModal(null);
      setFeedbackMessage('Material reserved successfully!');
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const issueMutation = useMutation({
    mutationFn: ({ id, warehouseId, gram, note }: { id: string; warehouseId: string; gram: number; note?: string }) =>
      printJobService.issueMaterial(id, { warehouseId, issuedGram: gram, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      setActiveModal(null);
      setFeedbackMessage('Material issued to printer successfully!');
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const startPrintMutation = useMutation({
    mutationFn: (id: string) => printJobService.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      setFeedbackMessage('Print Job started printing!');
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      printJobService.reconcileConsumption(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      setActiveModal(null);
      setFeedbackMessage('Print job reconciled & completed. Unused filament restocked!');
    },
    onError: (err: any) => setErrorMessage(err.message),
  });

  const printJobs = printJobsData?.content || [];
  const warehouses = warehousesData?.content || [];
  const materials = materialsData?.content || [];

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialId) {
      setErrorMessage('Please select a material');
      return;
    }
    createJobMutation.mutate({
      materialId: newMaterialId,
      estimatedGram: parseFloat(newEstimatedGram) || 400,
    });
  };

  const handleOpenReserve = (job: PrintJob) => {
    setSelectedJob(job);
    setReserveGram(job.estimatedGram.toString());
    setErrorMessage(null);
    setActiveModal('RESERVE');
  };

  const handleOpenIssue = (job: PrintJob) => {
    setSelectedJob(job);
    setIssueGram(job.estimatedGram.toString());
    setErrorMessage(null);
    setActiveModal('ISSUE');
  };

  const handleOpenReconcile = (job: PrintJob) => {
    setSelectedJob(job);
    setUsedGram('350');
    setWasteGram('30');
    setReturnedGram('20');
    setErrorMessage(null);
    setActiveModal('RECONCILE');
  };

  return (
    <div id="print-job-list-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={26} color="var(--primary)" />
            <span>Print Job Fulfillment & Consumption (F06, F07)</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Full lifecycle: Reserve stock → Issue to printer → Start print → Reconcile (Issued = Used + Waste + Returned).
          </p>
        </div>
        <button 
          id="btn-create-print-job"
          className="btn btn-primary"
          onClick={() => { setIsCreateOpen(true); setErrorMessage(null); }}
        >
          <Plus size={18} />
          <span>New Print Job</span>
        </button>
      </div>

      {feedbackMessage && (
        <div style={{ padding: '12px 18px', marginBottom: '20px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '12px 18px', marginBottom: '20px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Jobs Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading print jobs...
          </div>
        ) : printJobs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No print jobs active. Click "New Print Job" to initialize a production run.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="print-jobs-table">
              <thead>
                <tr>
                  <th>Job Number</th>
                  <th>Material SKU</th>
                  <th>Estimated</th>
                  <th>Status</th>
                  <th>Printer</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {printJobs.map((j) => (
                  <tr key={j.id} id={`job-row-${j.jobNumber}`}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      {j.jobNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{j.materialSku}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{j.materialName} ({j.materialColor})</div>
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {Number(j.estimatedGram).toLocaleString()} g
                    </td>
                    <td>
                      <span className={`badge ${
                        j.status === 'COMPLETED' ? 'badge-active' :
                        j.status === 'PRINTING' ? 'badge-info' :
                        j.status === 'RESERVED' || j.status === 'ISSUED' ? 'badge-warning' :
                        'badge-inactive'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td>{j.printerName ? `${j.printerName} (${j.printerModel})` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {j.status === 'CREATED' && (
                          <button
                            id={`btn-reserve-${j.jobNumber}`}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenReserve(j)}
                          >
                            <Lock size={14} color="#fbbf24" />
                            <span>Reserve (F06)</span>
                          </button>
                        )}
                        {(j.status === 'RESERVED' || j.status === 'CREATED') && (
                          <button
                            id={`btn-issue-${j.jobNumber}`}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenIssue(j)}
                          >
                            <PackageCheck size={14} color="var(--primary)" />
                            <span>Issue to Printer</span>
                          </button>
                        )}
                        {j.status === 'ISSUED' && (
                          <button
                            id={`btn-start-${j.jobNumber}`}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => startPrintMutation.mutate(j.id)}
                            disabled={startPrintMutation.isPending}
                          >
                            <Play size={14} />
                            <span>Start Print</span>
                          </button>
                        )}
                        {(j.status === 'PRINTING' || j.status === 'ISSUED') && (
                          <button
                            id={`btn-reconcile-${j.jobNumber}`}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--success)' }}
                            onClick={() => handleOpenReconcile(j)}
                          >
                            <RotateCcw size={14} color="var(--success)" />
                            <span>Reconcile (F07)</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Print Job */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Initialize Production Print Job</h2>
              <button className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }} onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateJob} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Material Required *</label>
                <select className="form-control" value={newMaterialId} onChange={(e) => setNewMaterialId(e.target.value)} required>
                  <option value="">Select Material...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.sku} — {m.name} ({m.color})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Usage (grams) *</label>
                <input type="number" step="1" className="form-control" value={newEstimatedGram} onChange={(e) => setNewEstimatedGram(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={createJobMutation.isPending}>
                <Save size={16} />
                <span>Create Print Job</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reserve Material */}
      {activeModal === 'RESERVE' && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Reserve Stock for {selectedJob.jobNumber}</h2>
              <button className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Select Warehouse Source *</label>
                <select className="form-control" value={actionWarehouseId} onChange={(e) => setActionWarehouseId(e.target.value)} required>
                  <option value="">Choose Warehouse...</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.code} — {wh.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Grams to Reserve *</label>
                <input type="number" step="0.01" className="form-control" value={reserveGram} onChange={(e) => setReserveGram(e.target.value)} required />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => reserveMutation.mutate({ id: selectedJob.id, warehouseId: actionWarehouseId, gram: parseFloat(reserveGram) })}
                disabled={reserveMutation.isPending || !actionWarehouseId}
              >
                <Lock size={16} />
                <span>Confirm Reservation (F06)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Material */}
      {activeModal === 'ISSUE' && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Issue Material to Printer ({selectedJob.jobNumber})</h2>
              <button className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Warehouse Source *</label>
                <select className="form-control" value={actionWarehouseId} onChange={(e) => setActionWarehouseId(e.target.value)} required>
                  <option value="">Choose Warehouse...</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>{wh.code} — {wh.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Issued (grams) *</label>
                <input type="number" step="0.01" className="form-control" value={issueGram} onChange={(e) => setIssueGram(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Technician Notes</label>
                <input type="text" className="form-control" placeholder="e.g. Spool mounted to Prusa MK4" value={issueNote} onChange={(e) => setIssueNote(e.target.value)} />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => issueMutation.mutate({ id: selectedJob.id, warehouseId: actionWarehouseId, gram: parseFloat(issueGram), note: issueNote })}
                disabled={issueMutation.isPending || !actionWarehouseId}
              >
                <PackageCheck size={16} />
                <span>Confirm Material Issue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reconciliation */}
      {activeModal === 'RECONCILE' && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Reconcile Print Consumption (F07)</h2>
              <button className="btn btn-secondary" style={{ padding: '6px', borderRadius: '50%' }} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Formula required: </span>
                <strong style={{ color: '#fff' }}>Issued = Used + Waste + Returned</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Final Part Weight (Used grams) *</label>
                <input type="number" step="0.01" className="form-control" value={usedGram} onChange={(e) => setUsedGram(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Purge / Support Waste (grams) *</label>
                <input type="number" step="0.01" className="form-control" value={wasteGram} onChange={(e) => setWasteGram(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unused Spool Tail (Returned to stock grams) *</label>
                <input type="number" step="0.01" className="form-control" value={returnedGram} onChange={(e) => setReturnedGram(e.target.value)} required />
                <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', display: 'block' }}>
                  ⚡ Returned quantity will automatically be restocked into inventory balance.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">QC Notes</label>
                <textarea className="form-control" rows={2} placeholder="Quality check results..." value={reconcileNote} onChange={(e) => setReconcileNote(e.target.value)} />
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                onClick={() => reconcileMutation.mutate({
                  id: selectedJob.id,
                  payload: {
                    usedGram: parseFloat(usedGram) || 0,
                    wasteGram: parseFloat(wasteGram) || 0,
                    returnedGram: parseFloat(returnedGram) || 0,
                    note: reconcileNote,
                  }
                })}
                disabled={reconcileMutation.isPending}
              >
                <RotateCcw size={16} />
                <span>Confirm & Restock Returned</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
