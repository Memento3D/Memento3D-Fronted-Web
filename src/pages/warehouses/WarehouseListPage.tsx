import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../../services/warehouseService';
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload } from '../../types/warehouse';
import { WarehouseModal } from './WarehouseModal';
import { Plus, Search, Edit2, Ban, Warehouse as WarehouseIcon, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

export const WarehouseListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['warehouses', search],
    queryFn: () => warehouseService.list({ 
      search: search || undefined, 
      limit: 50 
    }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) => warehouseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsModalOpen(false);
      setActionError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehousePayload }) => 
      warehouseService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsModalOpen(false);
      setActionError(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => warehouseService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Cannot deactivate warehouse. Ensure stock on hand and reservations are zero.');
    },
  });

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleDeactivate = (wh: Warehouse) => {
    if (window.confirm(`Are you sure you want to deactivate Warehouse ${wh.code}? You cannot deactivate warehouses with active inventory stock or reservations.`)) {
      deactivateMutation.mutate(wh.id);
    }
  };

  const handleModalSubmit = async (payload: any) => {
    if (selectedWarehouse) {
      await updateMutation.mutateAsync({ id: selectedWarehouse.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const warehouses = data?.content || [];
  const activeCount = warehouses.filter(w => w.status === 'ACTIVE').length;

  return (
    <div id="warehouse-list-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Warehouse Facilities (F02)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configure manufacturing sites, storage hubs, and enforce inventory deactivation protection.
          </p>
        </div>
        <button 
          id="btn-create-warehouse"
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <Plus size={18} />
          <span>New Warehouse</span>
        </button>
      </div>

      {actionError && (
        <div style={{ 
          padding: '14px 18px', 
          marginBottom: '20px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--danger-bg)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem'
        }} id="warehouse-action-error">
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Total Facilities</span>
            <WarehouseIcon size={18} color="var(--primary)" />
          </div>
          <div className="stat-value" id="stat-total-warehouses">{warehouses.length}</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Operational Hubs</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div className="stat-value" id="stat-active-warehouses">{activeCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="input-search-warehouses"
            type="text"
            className="form-control"
            style={{ paddingLeft: '40px' }}
            placeholder="Search warehouse code or facility name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="loading-warehouses">
            Loading warehouses...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--danger)' }} id="error-warehouses">
            {(error as any)?.message || 'Failed to load warehouses'}
          </div>
        ) : warehouses.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="empty-warehouses">
            No warehouses registered yet. Click "New Warehouse" to add a hub.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="warehouses-table">
              <thead>
                <tr>
                  <th>Facility Code</th>
                  <th>Warehouse Name</th>
                  <th>Physical Address</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w.id} id={`warehouse-row-${w.code}`}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      {w.code}
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {w.name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>{w.location || 'Not specified'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${w.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          id={`btn-edit-wh-${w.code}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleOpenEdit(w)}
                          title="Edit warehouse"
                        >
                          <Edit2 size={14} />
                        </button>
                        {w.status === 'ACTIVE' && (
                          <button
                            id={`btn-deactivate-wh-${w.code}`}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px' }}
                            onClick={() => handleDeactivate(w)}
                            title="Deactivate warehouse"
                            disabled={deactivateMutation.isPending}
                          >
                            <Ban size={14} />
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

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        warehouse={selectedWarehouse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
