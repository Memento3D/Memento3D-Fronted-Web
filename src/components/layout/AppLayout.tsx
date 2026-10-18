import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Box, 
  Warehouse, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Printer, 
  History,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const AppLayout: React.FC = () => {
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
          <div style={{ padding: '0 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Master Data
          </div>
          <NavLink to="/manager/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-materials">
            <Box size={18} />
            <span>Materials Catalog</span>
          </NavLink>
          <NavLink to="/manager/warehouses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-warehouses">
            <Warehouse size={18} />
            <span>Warehouses</span>
          </NavLink>

          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Inventory Control
          </div>
          <NavLink to="/manager/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-inventory">
            <Layers size={18} />
            <span>Stock Balances</span>
          </NavLink>
          <NavLink to="/manager/inventory/receipts/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-in">
            <ArrowDownLeft size={18} />
            <span>Goods Receipt</span>
          </NavLink>
          <NavLink to="/manager/inventory/issues/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-out">
            <ArrowUpRight size={18} />
            <span>Manual Issue</span>
          </NavLink>

          <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Production & Audit
          </div>
          <NavLink to="/manager/print-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-print-jobs">
            <Printer size={18} />
            <span>Print Jobs</span>
          </NavLink>
          <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ledger">
            <History size={18} />
            <span>Ledger History</span>
          </NavLink>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={16} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>Operator Hub</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              Active System
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Workspace /</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Manager Operations Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="badge badge-active" id="system-status-indicator">
              PostgreSQL ACID Active
            </span>
            <span className="badge badge-info" id="manager-role-badge">
              ROLE_OPERATOR
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
