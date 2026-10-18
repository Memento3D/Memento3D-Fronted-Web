import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip } from 'antd';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { WarehouseSelector } from '../../features/warehouse/components/WarehouseSelector';
import { 
  Box, 
  Warehouse, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Sliders,
  ClipboardCheck,
  CheckSquare,
  Printer, 
  History,
  ShieldCheck,
  Cpu,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Users
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

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

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isManager = user?.role === 'ROLE_MANAGER' || isAdmin;

  return (
    <div className="app-container" id="app-root">
      {/* Sidebar Navigation */}
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
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enterprise WMS</div>
          </div>
        </div>

        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
          {/* Executive & Governance */}
          <div style={{ padding: '0 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Control Center
          </div>

          {isAdmin && (
            <NavLink to="/manager/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-dashboard">
              <Users size={18} />
              <span>Admin & RBAC</span>
            </NavLink>
          )}

          {isManager && (
            <>
              <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-manager-dashboard">
                <LayoutDashboard size={18} />
                <span>Manager Dashboard</span>
              </NavLink>
              <NavLink to="/manager/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-approvals">
                <CheckSquare size={18} />
                <span>Approvals Center</span>
              </NavLink>
            </>
          )}

          {/* Master Catalogs */}
          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Master Data
          </div>
          <NavLink to="/manager/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-materials">
            <Box size={18} />
            <span>Materials Catalog</span>
          </NavLink>
          {isManager && (
            <NavLink to="/manager/warehouses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-warehouses">
              <Warehouse size={18} />
              <span>Warehouses</span>
            </NavLink>
          )}

          {/* WMS Operations Workflow */}
          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Inventory Operations
          </div>
          <NavLink to="/manager/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-inventory">
            <Layers size={18} />
            <span>Stock Balances</span>
          </NavLink>

          <NavLink to="/manager/receipts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-receipts">
            <ArrowDownLeft size={18} />
            <span>Goods Receipts</span>
          </NavLink>

          <NavLink to="/manager/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-issues">
            <ArrowUpRight size={18} />
            <span>Stock Issues</span>
          </NavLink>

          <NavLink to="/manager/transfers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-transfers">
            <ArrowLeftRight size={18} />
            <span>Transfers</span>
          </NavLink>

          <NavLink to="/manager/adjustments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-adjustments">
            <Sliders size={18} />
            <span>Adjustments</span>
          </NavLink>

          <NavLink to="/manager/stock-counts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-counts">
            <ClipboardCheck size={18} />
            <span>Stock Counts / Audit</span>
          </NavLink>

          {/* Production & Ledger */}
          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Audit & Production
          </div>
          <NavLink to="/manager/print-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-print-jobs">
            <Printer size={18} />
            <span>Print Jobs (Reservation)</span>
          </NavLink>
          <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ledger">
            <History size={18} />
            <span>Stock Movement Ledger</span>
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
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isAdmin ? 'System Administrator Portal' : isManager ? 'Operations & Manager Portal' : 'Warehouse Operational Workspace'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Warehouse Scoping Selector */}
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
              {user?.role || 'ROLE_WAREHOUSE'}
            </span>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
