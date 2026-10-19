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
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
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
    scene.background = new THREE.Color(0x0a0f1d);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x0ea5e9, 2.0); // Cyan rim
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const accentLight = new THREE.DirectionalLight(0x8b5cf6, 1.5); // Purple fill
    accentLight.position.set(3, -4, 2);
    scene.add(accentLight);

    // 5. Floor Grid
    const grid = new THREE.GridHelper(8, 20, 0x0ea5e9, 0x1e293b);
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
          color: 0xf59e0b,
          roughness: 0.2,
          metalness: 0.9,
          wireframe,
        });
      }
      if (materialTheme === 'pla') {
        return new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.45,
          metalness: 0.1,
          wireframe,
        });
      }
      if (materialTheme === 'cyber') {
        return new THREE.MeshPhysicalMaterial({
          color: 0x8b5cf6,
          emissive: 0x2e1065,
          roughness: 0.1,
          metalness: 0.8,
          wireframe,
        });
      }
      // Resin default
      return new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
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

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.autoRotate = autoRotate;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animId);
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
          background: '#0d1322',
          padding: 0,
          overflow: 'hidden',
        },
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Box size={20} color="#0ea5e9" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{title}</span>
            <Tag color="cyan">Web-GL 4K Engine</Tag>
          </div>
        </div>
      }
    >
      <div style={{ position: 'relative', width: '100%', height: isFullscreen ? '78vh' : '520px', background: '#080c14' }}>
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
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            padding: '6px 10px',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Tooltip title={autoRotate ? 'Dừng xoay tự động' : 'Tự động xoay'}>
            <Button
              size="small"
              type={autoRotate ? 'primary' : 'default'}
              icon={autoRotate ? <Pause size={14} /> : <Play size={14} />}
              onClick={() => setAutoRotate(!autoRotate)}
            />
          </Tooltip>
          <Tooltip title={wireframe ? 'Tắt khung dây (Wireframe)' : 'Bật khung dây (Wireframe)'}>
            <Button
              size="small"
              type={wireframe ? 'primary' : 'default'}
              icon={<Eye size={14} />}
              onClick={() => setWireframe(!wireframe)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại góc nhìn camera">
            <Button
              size="small"
              icon={<RotateCcw size={14} />}
              onClick={handleResetCamera}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}>
            <Button
              size="small"
              icon={isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
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
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Mô hình demo:</span>
            <Space size={4}>
              <Button
                size="small"
                type={activeModelType === 'bust' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('bust')}
                style={{ color: activeModelType === 'bust' ? '#fff' : '#94a3b8' }}
              >
                Kỷ vật Đa diện
              </Button>
              <Button
                size="small"
                type={activeModelType === 'gear' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('gear')}
                style={{ color: activeModelType === 'gear' ? '#fff' : '#94a3b8' }}
              >
                Vòng Ring
              </Button>
              <Button
                size="small"
                type={activeModelType === 'torus' ? 'primary' : 'text'}
                onClick={() => setActiveModelType('torus')}
                style={{ color: activeModelType === 'torus' ? '#fff' : '#94a3b8' }}
              >
                Khớp Nối Torus
              </Button>
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Vật liệu giả lập:</span>
            <Space size={6}>
              <button
                onClick={() => setMaterialTheme('resin')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#38bdf8',
                  border: materialTheme === 'resin' ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                title="Resin Quang Hóa 8K"
              />
              <button
                onClick={() => setMaterialTheme('pla')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: materialTheme === 'pla' ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                title="PLA+ Sinh Học Xanh"
              />
              <button
                onClick={() => setMaterialTheme('gold')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  border: materialTheme === 'gold' ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                title="In Kim Loại / Gold Silk"
              />
              <button
                onClick={() => setMaterialTheme('cyber')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  border: materialTheme === 'cyber' ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                title="Cyber Purple Glow"
              />
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
};
