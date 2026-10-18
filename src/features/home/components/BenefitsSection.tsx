import React from 'react';
import { Tag } from 'antd';
import {
  RocketOutlined,
  MobileOutlined,
  HeartOutlined,
  ToolOutlined,
  SafetyOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';

export const BenefitsSection: React.FC = () => {
  return (
    <section id="benefits" className="home-section" style={{ position: 'relative' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-badge">
            <DeploymentUnitOutlined />
            <span>Why Memento3D</span>
          </div>
          <h2 className="section-title">
            Engineered for <span className="gradient-text-indigo">Emotional Longevity</span>
          </h2>
          <p className="section-subtitle">
            We bridge state-of-the-art AI photogrammetry with precision additive manufacturing to create keepsakes that honor what photos cannot hold.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          {/* Card 1: Large Bento Feature (Span 8) */}
          <div
            className="home-glass-card bento-col-8"
            style={{
              padding: 36,
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 320,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <RocketOutlined style={{ fontSize: 26, color: '#818cf8' }} />
              </div>

              <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Neural Photogrammetry
              </Tag>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: 12, lineHeight: 1.25 }}>
                AI-Powered 3D Reconstruction Pipeline
              </h3>

              <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: 640 }}>
                Traditional 3D sculpture requires hundreds of hours of manual digital sculpting by 3D artists. Memento3D automates volumetric depth estimation and geometric triangulation, delivering ready-to-print manifold meshes directly from ordinary multi-angle photographs.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                paddingTop: 24,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginTop: 20,
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Geometry</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>Watertight Manifold</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Processing</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>Cloud Accelerated</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Manual CAD Needed</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>Zero Hours</div>
              </div>
            </div>
          </div>

          {/* Card 2: Mobile Photo Simplicity (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 320,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <MobileOutlined style={{ fontSize: 26, color: '#06b6d4' }} />
              </div>

              <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Frictionless Upload
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Any Smartphone Photo
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
                You do not need specialized LiDAR scanners or 3D cameras. Just upload your favorite portraits, candids, or pet photos straight from your camera roll.
              </p>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
              Supports iOS, Android & Desktop web
            </div>
          </div>

          {/* Card 3: Personalized Keepsakes & Engraving (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <HeartOutlined style={{ fontSize: 26, color: '#f43f5e' }} />
              </div>

              <Tag color="magenta" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Personalized
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Emotional Tactile Artifacts
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Add custom inscribed names, dates, or coordinate coordinates laser-engraved onto solid walnut and brushed brass pedestals.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600 }}>
              Individually personalized per order
            </div>
          </div>

          {/* Card 4: Precision 3D Print Farm (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <ToolOutlined style={{ fontSize: 26, color: '#10b981' }} />
              </div>

              <Tag color="green" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Industrial Farm
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Calibrated Print Farms
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Managed via regional OctoPrint hubs and automated spool humidity chambers. Every job undergoes strict optical QC before dispatch.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
              SLA photopolymer & bio-composite FDM
            </div>
          </div>

          {/* Card 5: Heirloom Durability (Span 4) */}
          <div
            className="home-glass-card bento-col-4"
            style={{
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 300,
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <SafetyOutlined style={{ fontSize: 26, color: '#eab308' }} />
              </div>

              <Tag color="gold" style={{ borderRadius: 6, fontWeight: 700, marginBottom: 12 }}>
                Archival Grade
              </Tag>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Heirloom Material Longevity
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Treated with UV inhibitors and non-toxic protective sealants to prevent discoloration, yellowing, or structural degradation over decades.
              </p>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#eab308', fontWeight: 600 }}>
              UV-sealed & impact-resistant finishes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
