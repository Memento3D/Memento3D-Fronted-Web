import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button, Space, Tooltip, Modal, Tag } from 'antd';
import { 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Play, 
  Pause, 
  Box 
} from 'lucide-react';

export interface Model3DPreviewProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  modelUrl?: string; // Optional remote GLB/OBJ/STL URL
  initialWireframe?: boolean;
}

export const Model3DPreview: React.FC<Model3DPreviewProps> = ({
  open,
  onClose,
  title = 'Bản dựng 3D Kỷ vật & Mô hình in thực tế',
  modelUrl: _modelUrl,
  initialWireframe = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(initialWireframe);
  const [autoRotate, setAutoRotate] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [materialTheme, setMaterialTheme] = useState<'resin' | 'pla' | 'gold' | 'cyber'>('resin');
  const [activeModelType, setActiveModelType] = useState<'bust' | 'gear' | 'torus'>('bust');

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF3EEFF);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.maxDistance = 12;
    controls.minDistance = 1.2;
    controlsRef.current = controls;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xFFBFAE, 2.0); // Peach rim
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const accentLight = new THREE.DirectionalLight(0x7C5CFC, 1.8); // Violet fill
    accentLight.position.set(3, -4, 2);
    scene.add(accentLight);

    // 5. Floor Grid
    const grid = new THREE.GridHelper(8, 20, 0x7C5CFC, 0xE2D9F7);
    grid.position.y = -1.0;
    scene.add(grid);

    // 6. Parametric Mesh Geometry
    let geometry: THREE.BufferGeometry;
    if (activeModelType === 'gear') {
      geometry = new THREE.TorusGeometry(1.0, 0.35, 24, 64);
    } else if (activeModelType === 'torus') {
      geometry = new THREE.TorusKnotGeometry(0.8, 0.28, 100, 16);
    } else {
      // Stylized Keepsake Figurine / Bust
      geometry = new THREE.DodecahedronGeometry(1.1, 2);
    }

    // Material setup
    const getMaterial = () => {
      if (materialTheme === 'gold') {
        return new THREE.MeshStandardMaterial({
          color: 0xFFBFAE,
          roughness: 0.2,
          metalness: 0.8,
          wireframe,
        });
      }
      if (materialTheme === 'pla') {
        return new THREE.MeshStandardMaterial({
          color: 0xC9E8D5,
          roughness: 0.45,
          metalness: 0.1,
          wireframe,
        });
      }
      if (materialTheme === 'cyber') {
        return new THREE.MeshPhysicalMaterial({
          color: 0x7C5CFC,
          emissive: 0x2e1065,
          roughness: 0.1,
          metalness: 0.8,
          wireframe,
        });
      }
      // Resin default
      return new THREE.MeshPhysicalMaterial({
        color: 0x7C5CFC,
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe,
      });
    };

    const material = getMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshRef.current = mesh;
    scene.add(mesh);

    // 7. Animation Loop with Visibility State Optimization
    let animId: number;
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;
      animId = requestAnimationFrame(animate);
      controls.autoRotate = autoRotate;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animate();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 700;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [open, autoRotate, wireframe, materialTheme, activeModelType]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.5, 4.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isFullscreen ? '96vw' : 880}
      style={isFullscreen ? { top: 20 } : {}}
      styles={{
        body: {
          background: '#F3EEFF',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-modal, 12px)',
        },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-default, #E2D9F7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Box size={20} color="var(--primary, #7C5CFC)" />
            <span style={{ color: 'var(--text-primary, #28243D)', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-family, "Plus Jakarta Sans")' }}>{title}</span>
            <Tag style={{ borderRadius: 'var(--radius-sm, 6px)', background: 'var(--surface-container, #F1EBFF)', color: 'var(--primary-system, #5F3ADD)', border: 'none', fontWeight: 600 }}>Web-GL 4K Engine</Tag>
          </div>
        </div>
      }
    >
      <div style={{ position: 'relative', width: '100%', height: isFullscreen ? '78vh' : '520px', background: 'var(--surface-container, #F3EEFF)' }}>
        {/* Three.js Canvas Container */}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Top Controls Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border-default, #E2D9F7)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Tooltip title={autoRotate ? 'Dừng xoay tự động' : 'Tự động xoay'}>
            <Button
              size="small"
              type={autoRotate ? 'primary' : 'default'}
              icon={autoRotate ? <Pause size={14} /> : <Play size={14} />}
              style={{ borderRadius: 'var(--radius-sm, 6px)' }}
              onClick={() => setAutoRotate(!autoRotate)}
            />
          </Tooltip>
          <Tooltip title={wireframe ? 'Tắt khung dây (Wireframe)' : 'Bật khung dây (Wireframe)'}>
            <Button
              size="small"
              type={wireframe ? 'primary' : 'default'}
              icon={<Eye size={14} />}
              style={{ borderRadius: 'var(--radius-sm, 6px)' }}
              onClick={() => setWireframe(!wireframe)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại góc nhìn camera">
            <Button
              size="small"
              icon={<RotateCcw size={14} />}
              style={{ borderRadius: 'var(--radius-sm, 6px)' }}
              onClick={handleResetCamera}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}>
            <Button
              size="small"
              icon={isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              style={{ borderRadius: 'var(--radius-sm, 6px)' }}
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </div>

        {/* Floating Bottom Material / Model Selectors */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            background: 'var(--surface-container, rgba(255, 255, 255, 0.95))',
            padding: '10px 18px',
            borderRadius: 'var(--radius-card, 10px)',
            border: '1px solid var(--border-default, #E2D9F7)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6A6282)', fontWeight: 600 }}>Mô hình demo:</span>
            <Space size={4}>
              <Button
                size="small"
                type={activeModelType === 'bust' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('bust')}
                style={{ borderRadius: 'var(--radius-sm, 6px)', fontWeight: 600 }}
              >
                Kỷ vật Đa diện
              </Button>
              <Button
                size="small"
                type={activeModelType === 'gear' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('gear')}
                style={{ borderRadius: 'var(--radius-sm, 6px)', fontWeight: 600 }}
              >
                Vòng Ring
              </Button>
              <Button
                size="small"
                type={activeModelType === 'torus' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('torus')}
                style={{ borderRadius: 'var(--radius-sm, 6px)', fontWeight: 600 }}
              >
                Khớp Nối Torus
              </Button>
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6A6282)', fontWeight: 600 }}>Vật liệu giả lập:</span>
            <Space size={8}>
              <button
                onClick={() => setMaterialTheme('resin')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#7C5CFC',
                  border: materialTheme === 'resin' ? '2.5px solid #28243D' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
                title="Atelier Violet 8K"
              />
              <button
                onClick={() => setMaterialTheme('pla')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#C9E8D5',
                  border: materialTheme === 'pla' ? '2.5px solid #28243D' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
                title="Mint Fresh"
              />
              <button
                onClick={() => setMaterialTheme('gold')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#FFBFAE',
                  border: materialTheme === 'gold' ? '2.5px solid #28243D' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
                title="Peach Velvet"
              />
              <button
                onClick={() => setMaterialTheme('cyber')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#5F3ADD',
                  border: materialTheme === 'cyber' ? '2.5px solid #28243D' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'none',
                }}
                title="Deep Royal Violet"
              />
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
};
