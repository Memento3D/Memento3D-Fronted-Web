import React from 'react';
import { Row, Col, Button, Tag } from 'antd';
import {
  ArrowRightOutlined,
  CheckOutlined,
  SkinOutlined,
  CompressOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  tag: string;
  tagColor: string;
  description: string;
  dimensions: string;
  materials: string[];
  features: string[];
  idealFor: string;
  turnaround: string;
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'mini-keepsake',
    name: 'Mini Keepsake & Charm',
    category: 'Pocket Companion',
    tag: 'Daily Carry',
    tagColor: 'blue',
    description:
      'A tactile 3D relief miniature designed for keyrings, bags, or pocket pendants. Engineered with impact-resistant photopolymer resin.',
    dimensions: '4.5cm – 6.0cm scale',
    materials: ['Tough Polymer Resin', 'Silk PLA Matte'],
    features: [
      'Reinforced stainless steel eyelet',
      'Tactile micro-engraved reverse side',
      'Waterproof & scratch-resistant coat',
    ],
    idealFor: 'Pet portraits, initials, graduation crests',
    turnaround: '2-3 business days',
  },
  {
    id: 'standard-keepsake',
    name: 'Standard Desk Sculpture',
    category: 'Personalized Bust',
    tag: 'Most Popular',
    tagColor: 'cyan',
    description:
      'The quintessential Memento3D sculpture. High-definition facial and contour synthesis mounted on an authentic solid wood pedestal.',
    dimensions: '12cm – 15cm height',
    materials: ['Ceramic White Resin', 'Silk Bronze Bio-PLA', 'Obsidian Slate'],
    features: [
      'Natural walnut or oak mounting base',
      'Laser-inscribed metallic brass plaque',
      '0.08mm sub-millimeter print layer height',
      'Microfiber display cleaning kit included',
    ],
    idealFor: 'Weddings, anniversaries, individual portrait busts',
    turnaround: '3-4 business days',
  },
  {
    id: 'signature-memorial',
    name: 'Signature Memorial Artifact',
    category: 'Monumental Display',
    tag: 'Artisan Finish',
    tagColor: 'gold',
    description:
      'Museum-grade additive sculpture with hand-polishing and composite metal infusion. An everlasting family heirloom presented in a luxury collector’s case.',
    dimensions: '18cm – 24cm museum scale',
    materials: ['Cold-Cast Bronze Composite', 'Alabaster Marble SLA Resin'],
    features: [
      'Multi-pass artisan hand buffing & patina',
      'Heavy weighted brushed brass base',
      'Certificate of Authenticity with unique serial hash',
      'Satin-lined presentation gift chest',
    ],
    idealFor: 'Generational tributes, milestone legacy honors',
    turnaround: '5-7 business days',
  },
  {
    id: 'digital-export',
    name: 'Spatial 3D Digital Asset',
    category: 'AR & Virtual Worlds',
    tag: 'Instant Access',
    tagColor: 'purple',
    description:
      'Direct download of your fully textured, watertight 3D mesh package ready for spatial computing, game engines, or personal 3D printing.',
    dimensions: 'Real-world 1:1 scale (GLB / OBJ / STL)',
    materials: ['PBR 4K Texture Maps (Albedo, Normal, Roughness)'],
    features: [
      'Apple Vision Pro & Meta Quest AR Ready',
      'Watertight STL ready for any desktop 3D printer',
      'Unrestricted personal 3D usage license',
      'Permanent cloud vault backup',
    ],
    idealFor: '3D printing hobbyists, VR avatars, digital archivists',
    turnaround: 'Instant AI processing',
  },
];

export const ProductShowcase: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="products" className="home-section" style={{ background: 'rgba(9, 13, 22, 0.4)' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-badge">
            <SkinOutlined />
            <span>Curated Product Tiers</span>
          </div>
          <h2 className="section-title">
            Crafted for <span className="gradient-text-indigo">Every Milestone</span>
          </h2>
          <p className="section-subtitle">
            Explore our physical and digital formats. Every keepsake is individually calibrated, inspected, and tailored to preserve the emotional weight of your memories.
          </p>
        </div>

        {/* Product Cards Grid */}
        <Row gutter={[24, 24]}>
          {PRODUCTS.map((prod) => (
            <Col xs={24} md={12} lg={6} key={prod.id}>
              <div
                className="home-glass-card"
                style={{
                  padding: 24,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(160deg, rgba(18, 25, 41, 0.8) 0%, rgba(11, 16, 28, 0.9) 100%)',
                }}
              >
                <div>
                  {/* Top Badge & Category */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {prod.category}
                    </span>
                    <Tag color={prod.tagColor} style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}>
                      {prod.tag}
                    </Tag>
                  </div>

                  {/* Product Title */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 8, lineHeight: 1.3 }}>
                    {prod.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: 20 }}>
                    {prod.description}
                  </p>

                  {/* Specs Pill Box */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <CompressOutlined style={{ fontSize: 13, color: '#06b6d4' }} />
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>{prod.dimensions}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <SafetyCertificateOutlined style={{ fontSize: 13, color: '#10b981' }} />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Turnaround: {prod.turnaround}</span>
                    </div>
                  </div>

                  {/* Material Pills */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Supported Materials
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {prod.materials.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: 4,
                            color: '#a5b4fc',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Features List */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 16, marginBottom: 24 }}>
                    {prod.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <CheckOutlined style={{ fontSize: 12, color: '#10b981', marginTop: 4, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 12, fontStyle: 'italic' }}>
                    Ideal for: {prod.idealFor}
                  </div>
                  <Button
                    type="primary"
                    block
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      height: 40,
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                  >
                    Select & Customize
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};
