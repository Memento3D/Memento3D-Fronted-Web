import type { CSSProperties, ReactNode } from 'react';
import { Navbar } from '../../features/home/components/Navbar';
import { Footer } from '../../features/home/components/Footer';
import { useDashboardShell } from './DashboardShellContext';
import './shoppingPageFrame.css';

interface ShoppingPageFrameProps {
  children: ReactNode;
  publicClassName?: string;
  publicStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  showPublicFooter?: boolean;
}

/** The same shopping/account content fits either the public or dashboard shell. */
export function ShoppingPageFrame({ children, publicClassName, publicStyle, contentStyle, showPublicFooter = true }: ShoppingPageFrameProps) {
  const inDashboard = useDashboardShell();
  const Content = inDashboard ? 'div' : 'main';
  return <div className={inDashboard ? 'customer-page-content' : publicClassName}
    style={inDashboard ? { width: '100%', minWidth: 0, containerType: 'inline-size', containerName: 'customer-page' } : publicStyle}>
    {!inDashboard && <Navbar />}
    <Content style={inDashboard
      ? { ...contentStyle, width: '100%', minWidth: 0, margin: '0 auto', padding: '0 0 32px' }
      : contentStyle}>
      {children}
    </Content>
    {!inDashboard && showPublicFooter && <Footer />}
  </div>;
}
