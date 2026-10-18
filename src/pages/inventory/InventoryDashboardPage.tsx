import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { warehouseService } from '../../services/warehouseService';
import { ShieldCheck, Clock, Archive } from 'lucide-react';

export const InventoryDashboardPage: React.FC = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => warehouseService.list({ limit: 100 }),
  });

  const { data: balancesData, isLoading, error } = useQuery({
    queryKey: ['inventory-balances', selectedWarehouseId],
    queryFn: () => inventoryService.listBalances({ 
      warehouseId: selectedWarehouseId || undefined,
      limit: 100 
    }),
  });

  const warehouses = warehousesData?.content || [];
  const balances = balancesData?.content || [];

  const totalOnHand = balances.reduce((sum, b) => sum + Number(b.onHandGram), 0);
  const totalReserved = balances.reduce((sum, b) => sum + Number(b.reservedGram), 0);
  const totalAvailable = balances.reduce((sum, b) => sum + Number(b.availableGram), 0);

  return (
    <div id="inventory-dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Inventory Dashboard (F03)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time multi-warehouse stock monitoring. Formula: Available = On-Hand - Reserved.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Total On-Hand</span>
            <Archive size={18} color="var(--primary)" />
          </div>
          <div className="stat-value" id="stat-total-on-hand">
            {(totalOnHand / 1000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical inventory stored</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Total Reserved</span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div className="stat-value" id="stat-total-reserved" style={{ color: '#fbbf24' }}>
            {(totalReserved / 1000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allocated for queued print jobs</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">Net Available</span>
            <ShieldCheck size={18} color="var(--success)" />
          </div>
          <div className="stat-value" id="stat-total-available" style={{ color: '#34d399' }}>
            {(totalAvailable / 1000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for new reservations</div>
        </div>
      </div>

      {/* Warehouse Filter */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Filter Warehouse:
        </label>
        <select
          id="select-dashboard-warehouse"
          className="form-control"
          style={{ width: '280px' }}
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
        >
          <option value="">All Warehouses & Hubs</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.code} — {wh.name}
            </option>
          ))}
        </select>
      </div>

      {/* Balances Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="loading-balances">
            Loading inventory balances...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--danger)' }} id="error-balances">
            {(error as any)?.message || 'Failed to load balances'}
          </div>
        ) : balances.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="empty-balances">
            No stock records found for the selected warehouse. Use "Goods Receipt" to import material.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="inventory-balances-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Material SKU</th>
                  <th>Material Details</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>On-Hand</th>
                  <th style={{ textAlign: 'right' }}>Reserved</th>
                  <th style={{ textAlign: 'right' }}>Available</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b) => (
                  <tr key={b.id} id={`balance-row-${b.warehouseCode}-${b.materialSku}`}>
                    <td>
                      <span className="badge badge-info">{b.warehouseCode}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{b.warehouseName}</div>
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                      {b.materialSku}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{b.materialName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color: {b.materialColor}</div>
                    </td>
                    <td>
                      <span className="badge badge-active">{b.materialType}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {Number(b.onHandGram).toLocaleString()} g
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                      {Number(b.reservedGram).toLocaleString()} g
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                      {Number(b.availableGram).toLocaleString()} g
                    </td>
                    <td>{new Date(b.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
