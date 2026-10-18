import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Tooltip } from 'antd';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { WarehouseSelector } from '../../features/warehouse/components/WarehouseSelector';
import { useWarehouseContext } from '../../features/warehouse/context/WarehouseContext';
import { 
  Box, 
  Warehouse, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Printer, 
  History,
  ShieldCheck,
  Cpu,
  RefreshCw,
  LogOut
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const { hasAccess, isLoading: isWarehouseLoading } = useWarehouseContext();

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await queryClient.invalidateQueries();
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-container" id="app-root">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar-navigation">
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--primary-glow)'
          }}>
            <Cpu size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>Memento3D</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inventory Hub</div>
          </div>
        </div>

        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
          {/* Master Data */}
          <div style={{ padding: '0 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Master Data
          </div>
          <NavLink to="/manager/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-materials">
            <Box size={18} />
            <span>Materials Catalog</span>
          </NavLink>
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER') && (
            <NavLink to="/manager/warehouses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-warehouses">
              <Warehouse size={18} />
              <span>Warehouses</span>
            </NavLink>
          )}

          {/* Inventory Control */}
          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Inventory Control
          </div>
          <NavLink to="/manager/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-inventory">
            <Layers size={18} />
            <span>Stock Balances</span>
          </NavLink>
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_WAREHOUSE') && (
            <>
              <NavLink to="/manager/inventory/receipts/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-in">
                <ArrowDownLeft size={18} />
                <span>Goods Receipt</span>
              </NavLink>
              <NavLink to="/manager/inventory/issues/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-out">
                <ArrowUpRight size={18} />
                <span>Manual Issue</span>
              </NavLink>
            </>
          )}

          {/* Production & Audit */}
          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Production & Audit
          </div>
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_OPERATOR') && (
            <NavLink to="/manager/print-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-print-jobs">
              <Printer size={18} />
              <span>Print Jobs</span>
            </NavLink>
          )}
          <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ledger">
            <History size={18} />
            <span>Ledger History</span>
          </NavLink>
        </div>

        {/* User Profile & Logout Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={16} color="var(--primary)" />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || 'Authenticated User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@memento3d.com'}
              </div>
            </div>
          </div>
          
          <Tooltip title="Sign Out of Session">
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Workspace /</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Manager Operations Portal</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Warehouse Scoping Selector (F01) */}
            <WarehouseSelector />

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.775rem', gap: '6px', borderRadius: '6px' }}
              title="Refresh and sync data with live database"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Live DB'}</span>
            </button>
            <span className="badge badge-active" id="system-status-indicator">
              PostgreSQL ACID Active
            </span>
            <span className="badge badge-info" id="manager-role-badge">
              {user?.role || 'ROLE_OPERATOR'}
            </span>
          </div>
        </header>

        {/* Global Access Warning if user has no assigned warehouse */}
        {!hasAccess && !isWarehouseLoading && (
          <div style={{ padding: '16px 24px 0' }}>
            <Alert
              type="error"
              showIcon
              message="Warehouse Access Denied"
              description="Your user account is not currently assigned to any active warehouse facility. All inventory receipts, issues, and reservations require an active warehouse membership. Please contact an Administrator or Warehouse Manager to assign membership."
            />
          </div>
        )}

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
