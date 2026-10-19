import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Tag, Radio } from 'antd';
import {
  RotateLeftOutlined,
  CompassOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

type MaterialTheme = 'bronze' | 'ivory' | 'obsidian' | 'cyan-resin';
type RenderMode = 'solid' | 'wireframe' | 'xray';

interface MaterialConfig {
  name: string;
  color: string;
  glow: string;
  specular: string;
  desc: string;
}

const MATERIALS: Record<MaterialTheme, MaterialConfig> = {
  bronze: {
    name: 'Đồng lụa đúc (Silk Bronze)',
    color: '#d97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    specular: '#fef3c7',
    desc: 'Ánh kim loại sang trọng với sắc đồng ấm và bề mặt bóng mờ cổ điển.',
  },
  ivory: {
    name: 'Resin ngà mờ (Matte Ivory)',
    color: '#f8fafc',
    glow: 'rgba(248, 250, 252, 0.3)',
    specular: '#ffffff',
    desc: 'Thẩm mỹ điêu khắc cổ điển tinh tế với bề mặt mịn màng cao cấp.',
  },
  obsidian: {
    name: 'Đá phiến Obsidian SLA',
    color: '#334155',
    glow: 'rgba(51, 65, 85, 0.5)',
    specular: '#94a3b8',
    desc: 'Màu đen huyền bí hiện đại với độ tương phản đổ bóng sắc nét.',
  },
  'cyan-resin': {
    name: 'Resin quang hóa xanh trong',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.6)',
    specular: '#a5f3fc',
    desc: 'Độ truyền sáng khúc xạ nội vi với viền sáng quang học độc đáo.',
  },
};

export const ThreeDExperience: React.FC = () => {
  const [material, setMaterial] = useState<MaterialTheme>('bronze');
  const [renderMode, setRenderMode] = useState<RenderMode>('solid');
  const [rotation, setRotation] = useState({ x: -15, y: 35 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setRotation({
      x: Math.max(-60, Math.min(60, dragStart.current.rotX - deltaY * 0.4)),
      y: (dragStart.current.rotY + deltaX * 0.5) % 360,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Auto slow rotate when idle
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => ({ ...prev, y: (prev.y + 0.3) % 360 }));
    }, 40);
    return () => clearInterval(interval);
  }, [isDragging]);

  const activeMat = MATERIALS[material];

  return (
    <section id="experience" className="home-section" style={{ position: 'relative' }}>
      <div className="home-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-badge">
            <CompassOutlined />
            <span>Trải nghiệm Tương tác 3D Trực quan</span>
          </div>
          <h2 className="section-title">
            Kiểm tra & Trải nghiệm <span className="gradient-text-cyan">Thời gian thực</span>
          </h2>
          <p className="section-subtitle">
            Tương tác trực tiếp với bộ xem mô hình 3D. Xoay 360 độ, xem trước các chất liệu hoàn thiện vật lý và kiểm tra cấu trúc lưới đa giác.
          </p>
        </div>

        {/* 3D Interactive Workbench */}
        <div
          className="home-glass-card"
          style={{
            padding: 32,
            background: 'linear-gradient(170deg, rgba(15, 23, 42, 0.9) 0%, rgba(8, 12, 22, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Row gutter={[32, 32]} align="middle">
            {/* Left 3D Viewport Area */}
            <Col xs={24} lg={15}>
              <div
                className="viewer-canvas-box"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  boxShadow: `inset 0 0 80px rgba(0, 0, 0, 0.8), 0 0 40px ${activeMat.glow}`,
                  perspective: 1000,
                }}
              >
                {/* 3D Interactive Transform Stage */}
                <div
                  style={{
                    width: 220,
                    height: 260,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Outer Polygonal Wireframe Cage */}
                  <div
                    style={{
                      position: 'absolute',
                      width: 200,
                      height: 240,
                      border: renderMode === 'wireframe' ? '2px dashed #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 24,
                      boxShadow: renderMode === 'wireframe' ? '0 0 25px rgba(56, 189, 248, 0.5)' : 'none',
                      background:
                        renderMode === 'xray'
                          ? 'rgba(6, 182, 212, 0.15)'
                          : renderMode === 'solid'
                          ? `radial-gradient(circle at 30% 30%, ${activeMat.specular} 0%, ${activeMat.color} 65%, #050811 100%)`
                          : 'transparent',
                      transform: 'translateZ(20px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      textAlign: 'center',
                      transition: 'background 0.3s ease, border-color 0.3s ease',
                    }}
                  >
                    {/* Simulated Faceted Bust Silhouette */}
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background:
                          renderMode === 'solid'
                            ? `linear-gradient(135deg, ${activeMat.specular} 0%, ${activeMat.color} 80%)`
                            : 'transparent',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        marginBottom: 16,
                        boxShadow: `0 0 30px ${activeMat.glow}`,
                      }}
                    />

                    {/* Pedestal Representation */}
                    <div
                      style={{
                        width: 130,
                        height: 36,
                        borderRadius: 8,
                        background: renderMode === 'solid' ? '#1e293b' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 700 }}>
                        MEMENTO3D • 2026
                      </span>
                    </div>
                  </div>

                  {/* Rotational Axis Ring */}
                  <div
                    style={{
                      position: 'absolute',
                      width: 280,
                      height: 280,
                      borderRadius: '50%',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      transform: 'rotateX(85deg) translateZ(-60px)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Drag Hint Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 20,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 9999,
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                >
                  <RotateLeftOutlined style={{ color: '#38bdf8' }} />
                  <span>Nhấp và kéo chuột để xoay 360°</span>
                </div>

                {/* Reset Camera Button */}
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => setRotation({ x: -15, y: 35 })}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    fontSize: '0.75rem',
                    borderRadius: 8,
                  }}
                >
                  Đặt lại góc nhìn
                </Button>

                {/* Demo Disclaimer */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  Mô phỏng 3D Thời gian thực
                </div>
              </div>
            </Col>

            {/* Right Controls & Spec Inspection */}
            <Col xs={24} lg={9}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Material Finish Selection */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Chất liệu hoàn thiện vật lý
                    </span>
                    <Tag color="cyan" style={{ fontSize: '0.7rem', margin: 0 }}>
                      Đang chọn
                    </Tag>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {(Object.keys(MATERIALS) as MaterialTheme[]).map((mKey) => {
                      const m = MATERIALS[mKey];
                      const isSel = material === mKey;
                      return (
                        <div
                          key={mKey}
                          onClick={() => setMaterial(mKey)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: isSel ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSel ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: m.color,
                                boxShadow: `0 0 8px ${m.glow}`,
                              }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{m.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>
                    {activeMat.desc}
                  </div>
                </div>

                {/* Shading & Topology Mode */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Chế độ hiển thị khung nhìn
                  </div>
                  <Radio.Group
                    value={renderMode}
                    onChange={(e) => setRenderMode(e.target.value)}
                    style={{ width: '100%', display: 'flex', gap: 8 }}
                  >
                    <Radio.Button value="solid" style={{ flex: 1, textAlign: 'center' }}>
                      Đặc khối (Solid)
                    </Radio.Button>
                    <Radio.Button value="wireframe" style={{ flex: 1, textAlign: 'center' }}>
                      Lưới đa giác (Wireframe)
                    </Radio.Button>
                    <Radio.Button value="xray" style={{ flex: 1, textAlign: 'center' }}>
                      Tia X (X-Ray)
                    </Radio.Button>
                  </Radio.Group>
                </div>

                {/* Topology Specs */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: 8, textTransform: 'uppercase' }}>
                    Thông số đo đạc mô hình
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mật độ tam giác</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>48.200 Tam giác</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Bề mặt khép kín</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>Khép kín 100%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Độ dày lớp in</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>0.08 mm</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Thời gian in dự kiến</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>7 giờ 45 phút</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
};
export default ThreeDExperience;
