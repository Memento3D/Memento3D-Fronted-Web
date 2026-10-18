import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../../services/materialService';
import type { Material, CreateMaterialPayload, UpdateMaterialPayload, MaterialType } from '../../types/material';
import { MaterialModal } from './MaterialModal';
import { Plus, Search, Edit2, Ban, Layers, CheckCircle2, DollarSign } from 'lucide-react';

export const MaterialListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['materials', search, typeFilter],
    queryFn: () => materialService.list({ 
      search: search || undefined, 
      type: (typeFilter as MaterialType) || undefined,
      limit: 50 
    }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => materialService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMaterialPayload }) => 
      materialService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setIsModalOpen(false);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => materialService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const handleOpenCreate = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleDeactivate = (material: Material) => {
    if (window.confirm(`Are you sure you want to deactivate material SKU: ${material.sku}?`)) {
      deactivateMutation.mutate(material.id);
    }
  };

  const handleModalSubmit = async (payload: any) => {
    if (selectedMaterial) {
      await updateMutation.mutateAsync({ id: selectedMaterial.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const materials = data?.content || [];
  const activeCount = materials.filter(m => m.status === 'ACTIVE').length;

  return (
    <div id="material-list-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Materials Catalog (F01)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage filament types, technical properties, printing temperature windows, and unit cost per gram.
          </p>
        </div>
        <button 
          id="btn-create-material"
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <Plus size={18} />
          <span>New Material</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Total SKUs</span>
            <Layers size={18} color="var(--primary)" />
          </div>
          <div className="stat-value" id="stat-total-skus">{materials.length}</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Active Materials</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div className="stat-value" id="stat-active-skus">{activeCount}</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Avg. Cost / Gram</span>
            <DollarSign size={18} color="var(--accent)" />
          </div>
          <div className="stat-value" id="stat-avg-cost">
            {materials.length > 0 
              ? `${Math.round(materials.reduce((acc, m) => acc + Number(m.unitCost), 0) / materials.length)} ₫`
              : '0 ₫'}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="input-search-materials"
            type="text"
            className="form-control"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by material name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="select-filter-type"
          className="form-control"
          style={{ width: '180px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MaterialType | '')}
        >
          <option value="">All Types</option>
          <option value="PLA">PLA</option>
          <option value="PETG">PETG</option>
          <option value="ABS">ABS</option>
          <option value="RESIN">Resin</option>
          <option value="TPU">TPU</option>
          <option value="NYLON">Nylon</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="loading-materials">
            Loading materials catalog...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--danger)' }} id="error-materials">
            {(error as any)?.message || 'Failed to load materials'}
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="empty-materials">
            No materials found. Click "New Material" to add your first SKU.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="materials-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name & Color</th>
                  <th>Type</th>
                  <th>Density</th>
                  <th>Nozzle / Bed Temp</th>
                  <th>Unit Cost</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} id={`material-row-${m.sku}`}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {m.sku}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{ 
                            width: '14px', 
                            height: '14px', 
                            borderRadius: '50%', 
                            backgroundColor: m.colorHex || '#ccc',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'inline-block',
                            flexShrink: 0
                          }} 
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.color} • {m.diameter}mm</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{m.materialType}</span>
                    </td>
                    <td>{m.density ? `${m.density} g/cm³` : '—'}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <div>Nozzle: {m.printTempMin}°C - {m.printTempMax}°C</div>
                        <div style={{ color: 'var(--text-muted)' }}>Bed: {m.bedTempMin}°C - {m.bedTempMax}°C</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {Number(m.unitCost).toLocaleString()} ₫/g
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          id={`btn-edit-${m.sku}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleOpenEdit(m)}
                          title="Edit specification"
                        >
                          <Edit2 size={14} />
                        </button>
                        {m.status === 'ACTIVE' && (
                          <button
                            id={`btn-deactivate-${m.sku}`}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px' }}
                            onClick={() => handleDeactivate(m)}
                            title="Deactivate SKU"
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

      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        material={selectedMaterial}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
