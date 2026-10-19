import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip, Avatar } from 'antd';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { WarehouseSelector } from '../../features/warehouse/components/WarehouseSelector';
import { getRoleLabel } from '../../locales/i18n';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { getRoleHomeRoute } from '../../utils/roleHomeRoutes';
import { 
  Home,
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
  Users,
  ShoppingBag
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
  const isOperator = user?.role === 'ROLE_OPERATOR';
  const isWarehouse = user?.role === 'ROLE_WAREHOUSE';

  const homeRoute = getRoleHomeRoute(user?.role);

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
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hệ thống Quản lý WMS</div>
          </div>
        </div>

        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
          {/* Actor Home Landing Page - ALWAYS FIRST */}
          <div style={{ padding: '0 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Không gian làm việc
          </div>

          <NavLink to={homeRoute} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-actor-home">
            <Home size={18} />
            <span>Trang chủ</span>
          </NavLink>

          {/* Operator Specific View */}
          {isOperator && (
            <>
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vận hành xưởng in
              </div>
              <NavLink to="/manager/print-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-operator-jobs">
                <Printer size={18} />
                <span>Lệnh in của tôi</span>
              </NavLink>
              <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-operator-ledger">
                <History size={18} />
                <span>Lịch sử vật tư</span>
              </NavLink>
            </>
          )}

          {/* Warehouse Specific View */}
          {isWarehouse && (
            <>
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hậu cần kho WMS
              </div>
              <NavLink to="/manager/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-inventory">
                <Layers size={18} />
                <span>Tồn kho thực tế</span>
              </NavLink>
              <NavLink to="/manager/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-materials">
                <Box size={18} />
                <span>Danh mục Vật liệu</span>
              </NavLink>
              <NavLink to="/manager/receipts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-receipts">
                <ArrowDownLeft size={18} />
                <span>Nhập kho</span>
              </NavLink>
              <NavLink to="/manager/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-issues">
                <ArrowUpRight size={18} />
                <span>Xuất kho</span>
              </NavLink>
              <NavLink to="/manager/transfers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-transfers">
                <ArrowLeftRight size={18} />
                <span>Điều chuyển kho</span>
              </NavLink>
              <NavLink to="/manager/adjustments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-adjustments">
                <Sliders size={18} />
                <span>Điều chỉnh kho</span>
              </NavLink>
              <NavLink to="/manager/stock-counts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-counts">
                <ClipboardCheck size={18} />
                <span>Kiểm kê kho</span>
              </NavLink>
              <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ledger">
                <History size={18} />
                <span>Sổ cái biến động kho</span>
              </NavLink>
            </>
          )}

          {/* Manager & Admin Executive Modules */}
          {isManager && (
            <>
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Điều hành & Giám sát
              </div>

              {isAdmin && (
                <>
                  <NavLink to="/admin/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-portal">
                    <ShieldCheck size={18} />
                    <span>Admin Portal</span>
                  </NavLink>
                  <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-users">
                    <Users size={18} />
                    <span>Quản trị & Phân quyền</span>
                  </NavLink>
                </>
              )}

              <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-manager-dashboard">
                <LayoutDashboard size={18} />
                <span>Tổng quan Quản lý</span>
              </NavLink>

              <NavLink to="/manager/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-approvals">
                <CheckSquare size={18} />
                <span>Trung tâm phê duyệt</span>
              </NavLink>

              {/* Master Catalogs */}
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Dữ liệu danh mục
              </div>
              <NavLink to="/manager/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-materials">
                <Box size={18} />
                <span>Danh mục Vật liệu</span>
              </NavLink>
              <NavLink to="/manager/warehouses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-warehouses">
                <Warehouse size={18} />
                <span>Quản lý Kho</span>
              </NavLink>

              {/* WMS Operations Workflow */}
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vận hành tồn kho
              </div>
              <NavLink to="/manager/inventory" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-inventory">
                <Layers size={18} />
                <span>Tồn kho thực tế</span>
              </NavLink>
              <NavLink to="/manager/receipts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-receipts">
                <ArrowDownLeft size={18} />
                <span>Nhập kho</span>
              </NavLink>
              <NavLink to="/manager/issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-issues">
                <ArrowUpRight size={18} />
                <span>Xuất kho</span>
              </NavLink>
              <NavLink to="/manager/transfers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-transfers">
                <ArrowLeftRight size={18} />
                <span>Điều chuyển kho</span>
              </NavLink>
              <NavLink to="/manager/adjustments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-adjustments">
                <Sliders size={18} />
                <span>Điều chỉnh kho</span>
              </NavLink>
              <NavLink to="/manager/stock-counts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-stock-counts">
                <ClipboardCheck size={18} />
                <span>Kiểm kê kho</span>
              </NavLink>

              {/* Production & Ledger */}
              <div style={{ padding: '20px 18px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sản xuất & Đơn hàng
              </div>
              <NavLink to="/manager/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-manager-orders">
                <ShoppingBag size={18} />
                <span>Xử lý đơn hàng</span>
              </NavLink>
              <NavLink to="/manager/print-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-print-jobs">
                <Printer size={18} />
                <span>Lệnh in (Giữ vật liệu)</span>
              </NavLink>
              <NavLink to="/manager/inventory/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ledger">
                <History size={18} />
                <span>Sổ cái biến động kho</span>
              </NavLink>
            </>
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tooltip title="Xem và cập nhật Hồ sơ cá nhân & Bảo mật">
            <div
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer', flex: 1, paddingRight: 8 }}
            >
              {user?.avatarUrl ? (
                <Avatar
                  src={user.avatarUrl}
                  size={32}
                  style={{ border: '1px solid rgba(14, 165, 233, 0.4)', flexShrink: 0 }}
                />
              ) : (
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
              )}
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || 'Authenticated User'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'user@memento3d.com'}
                </div>
              </div>
            </div>
          </Tooltip>
          
          <Tooltip title="Đăng xuất khỏi hệ thống">
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
              title="Đăng xuất"
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Không gian /</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isAdmin ? 'Cổng Quản trị viên Hệ thống' : isManager ? 'Cổng Quản lý & Vận hành' : isOperator ? 'Trạm Vận hành Xưởng in 3D' : 'Không gian Thao tác Kho WMS'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Real-time Notification Center */}
            <NotificationCenter />

            {/* Warehouse Scoping Selector */}
            <WarehouseSelector />

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.775rem', gap: '6px', borderRadius: '6px' }}
              title="Làm mới và đồng bộ dữ liệu CSDL"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ CSDL'}</span>
            </button>
            <span className="badge badge-active" id="system-status-indicator">
              CSDL ACID Sẵn sàng
            </span>
            <span className="badge badge-info" id="manager-role-badge">
              {getRoleLabel(user?.role || 'ROLE_WAREHOUSE')}
            </span>
          </div>
        </header>

        <div className="content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
