import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Card, Button, Space, Slider, Tag, Typography, Tooltip, Alert, Spin } from 'antd';
import {
  RotateLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface Keepsake3DViewerProps {
  modelUrl?: string;
  modelName?: string;
  onProceedToOrder?: () => void;
  isUnlocked?: boolean;
}

export const Keepsake3DViewer: React.FC<Keepsake3DViewerProps> = ({
  modelUrl,
  modelName = 'Kỷ vật 3D Cá nhân hóa',
  onProceedToOrder,
  isUnlocked = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Simulation Clipping Plane
  const clippingPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 0));
  const boundingBoxRef = useRef<THREE.Box3>(new THREE.Box3());

  // State
  const [activeTab, setActiveTab] = useState<'inspect' | 'simulation'>('inspect');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Simulation controls state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0 to 100
  const simProgressRef = useRef(0);
  const isSimulatingRef = useRef(false);

  // Camera defaults for reset
  const defaultCamPos = useRef(new THREE.Vector3(0, 1.8, 3.8));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Dispose all 3D memory objects cleanly
  const cleanupScene = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (modelGroupRef.current) {
      modelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      sceneRef.current?.remove(modelGroupRef.current);
      modelGroupRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (rendererRef.current.domElement && mountRef.current) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      rendererRef.current = null;
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
  }, []);

  // Update simulation clipping plane position
  const updateClippingHeight = useCallback((progress: number) => {
    const box = boundingBoxRef.current;
    if (box.isEmpty()) return;

    const minY = box.min.y;
    const maxY = box.max.y;
    const currentY = minY + (maxY - minY) * (progress / 100);

    // Plane equation: normal . p + constant = 0
    // With normal (0, -1, 0), constant = currentY keeps points below currentY visible
    clippingPlaneRef.current.constant = currentY;
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0d14); // Sleek deep space tone
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 100);
    camera.position.copy(defaultCamPos.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer with local clipping enabled
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.localClippingEnabled = true; // Required for print simulation clipping planes
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 14;
    controls.minDistance = 0.8;
    controls.target.copy(defaultTarget.current);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(4, 8, 4);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0x7c5cfc, 2.0); // Violet rim
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const peachFill = new THREE.DirectionalLight(0xffbfae, 1.5); // Peach warm bounce
    peachFill.position.set(2, -3, 3);
    scene.add(peachFill);

    // 6. Virtual 3D Print Bed (Grid + Circular / Rectangular Platform)
    const bedGroup = new THREE.Group();
    const bedGrid = new THREE.GridHelper(4.0, 40, 0x7c5cfc, 0x2e274a);
    bedGrid.position.y = -0.01;
    bedGroup.add(bedGrid);

    // Circular bed frame border
    const ringGeo = new THREE.RingGeometry(1.98, 2.0, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7c5cfc, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0;
    bedGroup.add(ringMesh);

    scene.add(bedGroup);

    // 7. Load Model (GLB or fallback procedural sculpture geometry)
    setLoading(true);
    setLoadError(null);

    const applyModelToScene = (object: THREE.Group) => {
      // Compute bounding box
      const box = new THREE.Box3().setFromObject(object);
      boundingBoxRef.current = box;

      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Center model horizontally and position bottom on the virtual bed floor (y = 0)
      object.position.x = -center.x;
      object.position.z = -center.z;
      object.position.y = -box.min.y;

      // Recalculate box after positioning
      boundingBoxRef.current.setFromObject(object);

      // Clone materials and bind clipping planes
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            // Clone material to avoid polluting global loader cache
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) => {
                const cloned = m.clone();
                cloned.clippingPlanes = [clippingPlaneRef.current];
                cloned.clipIntersection = false;
                cloned.clipShadows = true;
                return cloned;
              });
            } else {
              const cloned = mesh.material.clone();
              cloned.clippingPlanes = [clippingPlaneRef.current];
              cloned.clipIntersection = false;
              cloned.clipShadows = true;
              mesh.material = cloned;
            }
          }
        }
      });

      // Position camera so full model is comfortably visible
      const maxDim = Math.max(size.x, size.y, size.z, 0.5);
      const fov = camera.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.9;
      cameraDistance = Math.min(Math.max(cameraDistance, 2.5), 10);

      camera.position.set(0, size.y * 0.7, cameraDistance);
      controls.target.set(0, size.y * 0.45, 0);
      defaultCamPos.current.copy(camera.position);
      defaultTarget.current.copy(controls.target);

      // Initial simulation cut height at 100% (fully visible in inspection mode)
      clippingPlaneRef.current.constant = 1000;

      scene.add(object);
      modelGroupRef.current = object;
      setLoading(false);
    };

    if (modelUrl && modelUrl.trim() !== '') {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          applyModelToScene(gltf.scene);
        },
        undefined,
        (error) => {
          console.warn('Could not load custom GLB from remote URL, falling back to demo model:', error);
          setLoadError('Không thể tải file GLB từ máy chủ. Hiển thị mô hình kỷ vật mẫu thay thế.');
          // Fallback procedural memorial bust
          createFallbackModel(applyModelToScene);
        }
      );
    } else {
      // Fallback procedural memorial keepsake sculpture
      createFallbackModel(applyModelToScene);
    }

    // 8. Render Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Simulation stepping
      if (isSimulatingRef.current) {
        simProgressRef.current += 0.35; // Advance print layer effect smoothly
        if (simProgressRef.current >= 100) {
          simProgressRef.current = 100;
          isSimulatingRef.current = false;
          setIsSimulating(false);
        }
        setSimProgress(Math.round(simProgressRef.current));
        updateClippingHeight(simProgressRef.current);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupScene();
    };
  }, [modelUrl, cleanupScene, updateClippingHeight]);

  // Helper to construct a beautiful procedural sculpture if remote GLB is not yet generated
  const createFallbackModel = (callback: (obj: THREE.Group) => void) => {
    const group = new THREE.Group();

    // Material with pearlescent SLA resin finish
    const resinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8e2f8,
      metalness: 0.1,
      roughness: 0.25,
      transmission: 0.35,
      thickness: 1.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    // Torus Knot sculpture
    const torusGeo = new THREE.TorusKnotGeometry(0.7, 0.22, 128, 32);
    const torusMesh = new THREE.Mesh(torusGeo, resinMaterial);
    torusMesh.position.y = 1.0;
    group.add(torusMesh);

    // Natural walnut wooden pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.0, 1.1, 0.25, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e1b,
      roughness: 0.6,
      metalness: 0.05,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.125;
    group.add(baseMesh);

    callback(group);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.copy(defaultCamPos.current);
    controlsRef.current.target.copy(defaultTarget.current);
    controlsRef.current.update();
  };

  // Toggle Tab
  const handleTabChange = (tab: 'inspect' | 'simulation') => {
    setActiveTab(tab);
    if (tab === 'inspect') {
      // In inspection mode, reveal entire model
      isSimulatingRef.current = false;
      setIsSimulating(false);
      clippingPlaneRef.current.constant = 1000;
    } else {
      // In simulation mode, start from current progress
      updateClippingHeight(simProgressRef.current);
    }
  };

  // Simulation Controls
  const handleToggleSimulation = () => {
    if (simProgressRef.current >= 100) {
      simProgressRef.current = 0;
      setSimProgress(0);
      updateClippingHeight(0);
    }
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    isSimulatingRef.current = nextState;
  };

  const handleRestartSimulation = () => {
    simProgressRef.current = 0;
    setSimProgress(0);
    updateClippingHeight(0);
    setIsSimulating(true);
    isSimulatingRef.current = true;
  };

  const handleSliderChange = (val: number) => {
    simProgressRef.current = val;
    setSimProgress(val);
    updateClippingHeight(val);
    if (val >= 100) {
      setIsSimulating(false);
      isSimulatingRef.current = false;
    }
  };

  return (
    <Card
      style={{
        background: 'var(--bg-card, #14121E)',
        borderColor: 'var(--border-default, #2E274A)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Viewer Header */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--border-default, #2E274A)',
          background: 'rgba(20, 18, 30, 0.95)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, padding: '2px 10px' }}>
            3D GLB
          </Tag>
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            {modelName}
          </Title>
        </div>

        {/* Tab Toggle: Inspect vs Print Simulation */}
        <Space>
          <Button
            type={activeTab === 'inspect' ? 'primary' : 'default'}
            icon={<EyeOutlined />}
            onClick={() => handleTabChange('inspect')}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              background: activeTab === 'inspect' ? 'var(--primary, #7C5CFC)' : 'transparent',
              borderColor: activeTab === 'inspect' ? 'var(--primary, #7C5CFC)' : '#443C68',
              color: '#fff',
            }}
          >
            Xem 3D 360°
          </Button>

          <Button
            type={activeTab === 'simulation' ? 'primary' : 'default'}
            icon={<PrinterOutlined />}
            onClick={() => handleTabChange('simulation')}
            style={{
              borderRadius: 8,
              fontWeight: 600,
              background: activeTab === 'simulation' ? '#0ea5e9' : 'transparent',
              borderColor: activeTab === 'simulation' ? '#0ea5e9' : '#443C68',
              color: '#fff',
            }}
          >
            Minh họa quá trình in (MVP)
          </Button>
        </Space>
      </div>

      {loadError && (
        <Alert
          type="info"
          message={loadError}
          showIcon
          style={{ margin: 12, borderRadius: 8 }}
        />
      )}

      {/* 3D WebGL Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: 480, background: '#0e0d14' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(14, 13, 20, 0.85)',
              zIndex: 10,
            }}
          >
            <Spin size="large" />
            <Text style={{ color: '#fff', marginTop: 16, fontWeight: 600 }}>
              Đang kết xuất mô hình 3D WebGL...
            </Text>
          </div>
        )}

        {/* The Three.js Mount Point */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Mandatory MVP Print Simulation Watermark & Label */}
        {activeTab === 'simulation' && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(14, 165, 233, 0.25)',
              border: '1px solid #0ea5e9',
              padding: '6px 16px',
              borderRadius: 9999,
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <PrinterOutlined style={{ color: '#38bdf8' }} />
            <span>Minh họa quá trình in</span>
          </div>
        )}

        {/* Freemium Watermark in Inspect mode */}
        {activeTab === 'inspect' && !isUnlocked && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255, 191, 174, 0.2)',
              border: '1px solid #FF9E87',
              padding: '4px 12px',
              borderRadius: 9999,
              color: '#FFBFAE',
              fontSize: '0.75rem',
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
            }}
          >
            🔒 Bản xem trước kiểm tra độ phân giải
          </div>
        )}

        {/* Viewport Control Buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 8,
            zIndex: 5,
          }}
        >
          <Tooltip title="Đặt lại góc nhìn Camera">
            <Button
              shape="circle"
              icon={<RotateLeftOutlined />}
              onClick={handleResetCamera}
              style={{
                background: 'rgba(30, 26, 48, 0.8)',
                color: '#fff',
                borderColor: '#443C68',
              }}
            />
          </Tooltip>
        </div>
      </div>

      {/* Simulation Controls or Inspection Footer Bar */}
      {activeTab === 'simulation' ? (
        <div
          style={{
            padding: '20px 24px',
            background: 'rgba(20, 18, 30, 0.98)',
            borderTop: '1px solid var(--border-default, #2E274A)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                type="primary"
                icon={isSimulating ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={handleToggleSimulation}
                style={{
                  background: isSimulating ? '#eab308' : '#0ea5e9',
                  borderColor: 'transparent',
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                {isSimulating ? 'Tạm dừng' : simProgress >= 100 ? 'Bắt đầu lại' : 'Tiếp tục mô phỏng'}
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleRestartSimulation}
                style={{
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#fff',
                  borderColor: '#443C68',
                }}
              >
                Xem lại từ đầu
              </Button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Text style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.2rem' }}>
                {simProgress}%
              </Text>
              <Text style={{ color: 'var(--text-secondary, #948aa8)', fontSize: '0.8rem', display: 'block' }}>
                Tiến độ minh họa lớp in
              </Text>
            </div>
          </div>

          {/* Interactive Progress Slider */}
          <Slider
            value={simProgress}
            onChange={handleSliderChange}
            min={0}
            max={100}
            styles={{
              track: { background: '#0ea5e9' },
              rail: { background: '#2e274a' },
            }}
          />

          {/* Mandatory Disclaimer */}
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoCircleOutlined style={{ color: '#38bdf8' }} />
              <Text style={{ color: '#bae6fd', fontSize: '0.82rem' }}>
                Đây là hiệu ứng minh họa, không phản ánh thời gian và đường chạy máy in thực tế.
              </Text>
            </div>

            {onProceedToOrder && (
              <Button
                type="primary"
                onClick={onProceedToOrder}
                style={{
                  background: 'var(--primary, #7C5CFC)',
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                Bỏ qua minh họa & Đặt hàng ngay
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Inspection Mode Footer */
        <div
          style={{
            padding: '18px 24px',
            background: 'rgba(20, 18, 30, 0.98)',
            borderTop: '1px solid var(--border-default, #2E274A)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleFilled style={{ color: 'var(--tertiary, #22c55e)' }} />
              <span>Mô hình xem trước đã sẵn sàng kiểm tra sản xuất</span>
            </div>
            <Text style={{ color: 'var(--text-secondary, #948aa8)', fontSize: '0.85rem' }}>
              Mô hình xem trước. Khả năng sản xuất sẽ được xưởng kiểm tra trước khi xác nhận đơn.
            </Text>
          </div>

          {onProceedToOrder && (
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={onProceedToOrder}
              style={{
                background: 'var(--primary, #7C5CFC)',
                borderRadius: 9999,
                fontWeight: 700,
                height: 46,
                padding: '0 28px',
                boxShadow: '0 8px 24px rgba(124, 92, 252, 0.4)',
              }}
            >
              Đặt sản xuất kỷ vật
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
