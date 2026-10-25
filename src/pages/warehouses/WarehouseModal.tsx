import React, { useState, useEffect } from 'react';
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload } from '../../types/warehouse';
import { X, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWarehousePayload | UpdateWarehousePayload) => Promise<void>;
  warehouse?: Warehouse | null;
  isLoading: boolean;
}

export const WarehouseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  warehouse,
  isLoading,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (warehouse) {
      setCode(warehouse.code);
      setName(warehouse.name);
      setLocation(warehouse.location || '');
    } else {
      setCode('');
      setName('');
      setLocation('');
    }
    setError(null);
  }, [warehouse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Warehouse code is required');
      return;
    }
    if (!name.trim()) {
      setError('Warehouse name is required');
      return;
    }

    try {
      const payload: CreateWarehousePayload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        location: location.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay" id="warehouse-modal-overlay">
      <div className="modal-content" id="warehouse-modal-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {warehouse ? 'Edit Warehouse Facility' : 'Register New Warehouse (F02)'}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
            id="btn-close-warehouse-modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '16px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }} id="warehouse-form-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Warehouse Code *</label>
            <input
              id="input-warehouse-code"
              type="text"
              className="form-control"
              placeholder="e.g. WH-HCM-01"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Name *</label>
            <input
              id="input-warehouse-name"
              type="text"
              className="form-control"
              placeholder="e.g. Thu Duc 3D Printing Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address / Location</label>
            <textarea
              id="textarea-warehouse-location"
              className="form-control"
              rows={3}
              placeholder="Building, street, district, coordinates..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              id="btn-cancel-warehouse"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              id="btn-save-warehouse"
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              <Save size={16} />
              <span>{isLoading ? 'Saving...' : 'Save Warehouse'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
