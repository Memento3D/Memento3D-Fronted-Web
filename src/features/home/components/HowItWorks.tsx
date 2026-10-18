import React, { useState } from 'react';
import { Row, Col, Tag } from 'antd';
import {
  CloudUploadOutlined,
  ExperimentOutlined,
  BgColorsOutlined,
  GiftOutlined,
  CheckOutlined,
} from '@ant-design/icons';

interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
  details: string[];
  metrics: string;
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Upload Your Photos',
    subtitle: 'Smartphone or Digital Camera',
    description:
      'Simply snap 1 to 5 clear photos of the person, pet, or landmark you wish to commemorate. No professional photography or LiDAR hardware required.',
    icon: <CloudUploadOutlined style={{ fontSize: 28, color: '#38bdf8' }} />,
    tag: 'Instant Ingestion',
    tagColor: 'cyan',
    details: ['Supports JPEG, PNG, HEIC', 'Automatic lighting correction', 'Background subject isolation'],
    metrics: '< 10 Seconds Upload',
  },
  {
    number: '02',
    title: 'AI Reconstructs in 3D',
    subtitle: 'Neural Mesh Synthesis',
    description:
      'Our proprietary neural photogrammetry engine synthesizes multi-view depth maps into a high-density, watertight polygonal mesh with zero open edges.',
    icon: <ExperimentOutlined style={{ fontSize: 28, color: '#818cf8' }} />,
    tag: 'AI Topology',
    tagColor: 'purple',
    details: ['Watertight STL / OBJ output', 'Sub-millimeter facial contouring', 'Auto-healing manifold mesh'],
    metrics: '99.4% Mesh Precision',
  },
  {
    number: '03',
    title: 'Customize Your Keepsake',
    subtitle: 'Materials & Finishes',
    description:
      'Choose your physical dimension, premium polymer finish (Silk Bronze, Matte Stone, Crystal Clear Resin), and customize an engraved pedestal with names and dates.',
    icon: <BgColorsOutlined style={{ fontSize: 28, color: '#f59e0b' }} />,
    tag: 'Bespoke Customizer',
    tagColor: 'gold',
    details: ['8cm to 25cm desktop scales', 'Eco Bio-PLA & SLA Photopolymers', 'Laser-etched pedestal text'],
    metrics: '12+ Finish Palettes',
  },
  {
    number: '04',
    title: 'Print & Preserve Forever',
    subtitle: 'Additive Manufacturing & Delivery',
    description:
      'Dispatched to our climate-controlled regional 3D print farms. Each piece is crafted with calibrated layers, UV cured, hand-inspected, and delivered in protective gift packaging.',
    icon: <GiftOutlined style={{ fontSize: 28, color: '#10b981' }} />,
    tag: 'Industrial Farm',
    tagColor: 'green',
    details: ['OctoPrint automated queue', 'Individual QC & hand polishing', 'Heirloom gift unboxing'],
    metrics: 'Fulfillment in 48-72h',
  },
];

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="home-section" style={{ position: 'relative' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-badge">
            <span>Seamless 4-Step Journey</span>
          </div>
          <h2 className="section-title">
            How Your Memories Become <span className="gradient-text-cyan">Tangible Art</span>
          </h2>
          <p className="section-subtitle">
            From an ordinary photo in your phone gallery to a timeless 3D sculpture sitting on your desk. No technical expertise required.
          </p>
        </div>

        {/* Interactive Step Navigator Grid */}
        <Row gutter={[24, 24]}>
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <Col xs={24} sm={12} lg={6} key={step.number}>
                <div
                  onClick={() => setActiveStep(idx)}
                  className="home-glass-card"
                  style={{
                    padding: 24,
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: isActive ? 'rgba(99, 102, 241, 0.7)' : 'rgba(255, 255, 255, 0.08)',
                    background: isActive
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'rgba(15, 23, 42, 0.55)',
                    boxShadow: isActive ? '0 10px 30px rgba(99, 102, 241, 0.25)' : 'none',
                    transform: isActive ? 'translateY(-4px)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <span
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          color: isActive ? '#818cf8' : '#475569',
                          letterSpacing: '-0.05em',
                        }}
                      >
                        {step.number}
                      </span>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                        }}
                      >
                        {step.icon}
                      </div>
                    </div>

                    <Tag color={step.tagColor} style={{ marginBottom: 12, borderRadius: 6, fontWeight: 700 }}>
                      {step.tag}
                    </Tag>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                      {step.title}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginBottom: 12 }}>
                      {step.subtitle}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Bullet points for active step */}
                  <div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                      {step.details.map((detail, dIdx) => (
                        <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CheckOutlined style={{ fontSize: 12, color: isActive ? '#38bdf8' : '#64748b' }} />
                          <span style={{ fontSize: '0.78rem', color: isActive ? '#e2e8f0' : '#94a3b8' }}>{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Spec</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{step.metrics}</span>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </section>
  );
};
