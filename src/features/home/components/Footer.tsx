import React from 'react';
import { Row, Col } from 'antd';
import {
  CodeSandboxOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#04060d',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 80,
        paddingBottom: 40,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="home-container">
        <Row gutter={[48, 40]}>
          {/* Brand Info */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CodeSandboxOutlined style={{ fontSize: 20, color: '#ffffff' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Memento<span className="gradient-text-cyan">3D</span>
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 20, maxWidth: 320 }}>
              Physical keepsakes crafted from personal moments. Combining AI neural photogrammetry with precision additive manufacturing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.825rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EnvironmentOutlined style={{ color: '#06b6d4' }} />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined style={{ color: '#818cf8' }} />
                <span>contact@memento3d.vn</span>
              </div>
            </div>
          </Col>

          {/* Column: Products */}
          <Col xs={12} sm={8} md={5}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Keepsakes
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <span className="nav-link" onClick={() => scrollTo('products')} style={{ fontSize: '0.875rem' }}>
                  Standard Desk Busts
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('products')} style={{ fontSize: '0.875rem' }}>
                  Mini Pocket Charms
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('products')} style={{ fontSize: '0.875rem' }}>
                  Signature Memorials
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('products')} style={{ fontSize: '0.875rem' }}>
                  Spatial 3D Assets (.GLB)
                </span>
              </li>
            </ul>
          </Col>

          {/* Column: Technology */}
          <Col xs={12} sm={8} md={5}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Technology
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <span className="nav-link" onClick={() => scrollTo('how-it-works')} style={{ fontSize: '0.875rem' }}>
                  Neural Photogrammetry
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('experience')} style={{ fontSize: '0.875rem' }}>
                  Real-Time 3D Studio
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('benefits')} style={{ fontSize: '0.875rem' }}>
                  OctoPrint Farm Fleet
                </span>
              </li>
              <li>
                <span className="nav-link" onClick={() => scrollTo('benefits')} style={{ fontSize: '0.875rem' }}>
                  Material QC System
                </span>
              </li>
            </ul>
          </Col>

          {/* Column: Portals & Navigation */}
          <Col xs={24} sm={8} md={6}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Actor Portals
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <a href="/login" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Client Portal
                </a>
              </li>
              <li>
                <a href="/manager/login" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Operations & Facility
                </a>
              </li>
              <li>
                <a href="/warehouse/login" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Warehouse & WMS Terminal
                </a>
              </li>
              <li>
                <a href="/operator/login" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Print Farm Station
                </a>
              </li>
              <li>
                <a href="/admin/login" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  System Admin Console
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} Memento3D. All rights reserved. Memories, Reimagined in 3D.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ color: '#94a3b8' }}>Platform Status: Connected to Spring Boot & Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
