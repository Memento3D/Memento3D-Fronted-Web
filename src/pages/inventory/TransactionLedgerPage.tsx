import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { warehouseService } from '../../services/warehouseService';
import type { InventoryTransactionType } from '../../types/inventory';
import { History, Filter, ArrowDownLeft, ArrowUpRight, Lock, Unlock, RotateCcw, PackageCheck } from 'lucide-react';

export const TransactionLedgerPage: React.FC = () => {
  const [warehouseId, setWarehouseId] = useState('');
  const [txType, setTxType] = useState<InventoryTransactionType | ''>('');

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => warehouseService.list({ limit: 100 }),
  });

  const { data: txData, isLoading, error } = useQuery({
    queryKey: ['inventory-transactions', warehouseId, txType],
    queryFn: () => inventoryService.listTransactions({
      warehouseId: warehouseId || undefined,
      type: (txType as InventoryTransactionType) || undefined,
      limit: 50,
    }),
  });

  const warehouses = warehousesData?.content || [];
  const transactions = txData?.content || [];

  const renderBadge = (type: InventoryTransactionType) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDownLeft size={12} /> RECEIPT
          </span>
        );
      case 'ISSUE':
        return (
          <span className="badge badge-inactive" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={12} /> ISSUE
          </span>
        );
      case 'RESERVATION_HOLD':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> HOLD
          </span>
        );
      case 'RESERVATION_RELEASE':
        return (
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Unlock size={12} /> RELEASE
          </span>
        );
      case 'PRINT_ISSUE':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <PackageCheck size={12} /> PRINT ISSUE
          </span>
        );
      case 'PRINT_RETURN':
        return (
          <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> PRINT RETURN
          </span>
        );
      default:
        return <span className="badge badge-info">{type}</span>;
    }
  };

  return (
    <div id="transaction-ledger-page">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={26} color="var(--primary)" />
          <span>Inventory Transaction Ledger (F08)</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Immutable accounting audit trail. Every physical stock delta, reservation hold, and return restock is permanently recorded.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Filter size={18} color="var(--text-muted)" />
        <select
          id="select-ledger-warehouse"
          className="form-control"
          style={{ width: '240px' }}
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="">All Warehouses</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.code} — {wh.name}
            </option>
          ))}
        </select>

        <select
          id="select-ledger-type"
          className="form-control"
          style={{ width: '220px' }}
          value={txType}
          onChange={(e) => setTxType(e.target.value as InventoryTransactionType | '')}
        >
          <option value="">All Transaction Types</option>
          <option value="RECEIPT">RECEIPT (Goods In)</option>
          <option value="ISSUE">ISSUE (Manual Out)</option>
          <option value="RESERVATION_HOLD">RESERVATION_HOLD</option>
          <option value="RESERVATION_RELEASE">RESERVATION_RELEASE</option>
          <option value="PRINT_ISSUE">PRINT_ISSUE (Issued to Printer)</option>
          <option value="PRINT_RETURN">PRINT_RETURN (Reconciliation Restock)</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="loading-transactions">
            Loading audit transactions...
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--danger)' }} id="error-transactions">
            {(error as any)?.message || 'Failed to load transactions'}
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }} id="empty-transactions">
            No ledger entries found.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="transactions-ledger-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Facility</th>
                  <th>Material</th>
                  <th style={{ textAlign: 'right' }}>Δ On-Hand</th>
                  <th style={{ textAlign: 'right' }}>Balance (Before → After)</th>
                  <th style={{ textAlign: 'right' }}>Δ Reserved</th>
                  <th>Reference / Job</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} id={`tx-row-${tx.id}`}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td>{renderBadge(tx.transactionType)}</td>
                    <td style={{ fontWeight: 600 }}>{tx.warehouseCode}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{tx.materialSku}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {Number(tx.deltaOnHandGram) > 0 ? (
                        <span style={{ color: '#34d399' }}>+{Number(tx.deltaOnHandGram).toLocaleString()} g</span>
                      ) : Number(tx.deltaOnHandGram) < 0 ? (
                        <span style={{ color: '#f87171' }}>{Number(tx.deltaOnHandGram).toLocaleString()} g</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0 g</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
                      {Number(tx.beforeOnHandGram).toLocaleString()} → <strong style={{ color: '#fff' }}>{Number(tx.afterOnHandGram).toLocaleString()} g</strong>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>
                      {Number(tx.deltaReservedGram) > 0 ? (
                        <span style={{ color: '#fbbf24' }}>+{Number(tx.deltaReservedGram).toLocaleString()} g</span>
                      ) : Number(tx.deltaReservedGram) < 0 ? (
                        <span style={{ color: '#38bdf8' }}>{Number(tx.deltaReservedGram).toLocaleString()} g</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0 g</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--primary)' }}>
                      {tx.referenceId || tx.printJobId || '—'}
                    </td>
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
