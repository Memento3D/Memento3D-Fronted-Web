import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../features/home/components/Navbar';
import { Footer } from '../../features/home/components/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div
      id="public-layout-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
