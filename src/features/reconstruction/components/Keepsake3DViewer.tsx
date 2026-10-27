import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Card, Button, Space, Slider, Tag, Typography, Tooltip, Alert, Spin, Drawer } from 'antd';
import {
  RotateLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
  WarningOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface Keepsake3DViewerProps {
  modelUrl?: string;
  modelName?: string;
  onProceedToOrder?: () => void;
  isUnlocked?: boolean;
  isProcessing?: boolean;
  statusMessage?: string;
  onRetry?: () => void;
}

export const Keepsake3DViewer: React.FC<Keepsake3DViewerProps> = ({
  modelUrl,
  modelName = 'Kỷ vật 3D Cá nhân hóa',
  onProceedToOrder,
  isUnlocked = false,
  isProcessing = false,
  statusMessage,
  onRetry,
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
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasValidModel, setHasValidModel] = useState(false);

  // Separate Demo Showcase modal/drawer state
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

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
    renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // 6. Virtual 3D Print Bed (Grid + Circular Platform)
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

    // 7. Load Model (ONLY from actual modelUrl, NO silent fallback to arbitrary geometric primitives!)
    const applyModelToScene = (object: THREE.Group) => {
      // Remove any previous model group
      if (modelGroupRef.current) {
        scene.remove(modelGroupRef.current);
      }

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
      setHasValidModel(true);
      setLoading(false);
      setLoadError(null);
    };

    if (modelUrl && modelUrl.trim() !== '') {
      setLoading(true);
      setLoadError(null);
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          applyModelToScene(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Failed to load GLB model from URL:', modelUrl, error);
          setLoading(false);
          setHasValidModel(false);
          setLoadError(
            'Không thể tải file mô hình 3D (.glb) từ máy chủ lưu trữ. Vui lòng thử tải lại hoặc liên hệ hỗ trợ kỹ thuật.'
          );
        }
      );
    } else {
      // Honest state: If no URL is provided, leave print bed empty and display truthful status overlay
      if (modelGroupRef.current) {
        scene.remove(modelGroupRef.current);
        modelGroupRef.current = null;
      }
      setHasValidModel(false);
      setLoading(false);
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

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.copy(defaultCamPos.current);
    controlsRef.current.target.copy(defaultTarget.current);
    controlsRef.current.update();
  };

  // Toggle Tab
  const handleTabChange = (tab: 'inspect' | 'simulation') => {
    if (tab === 'simulation' && !hasValidModel) {
      return;
    }
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
    if (!hasValidModel) return;
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
    if (!hasValidModel) return;
    simProgressRef.current = 0;
    setSimProgress(0);
    updateClippingHeight(0);
    setIsSimulating(true);
    isSimulatingRef.current = true;
  };

  const handleSliderChange = (val: number) => {
    if (!hasValidModel) return;
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
          <Tag color={hasValidModel ? 'purple' : 'default'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 10px' }}>
            {hasValidModel ? (isUnlocked ? '3D GLB HOÀN THIỆN' : '3D GLB XEM TRƯỚC') : 'BÀN IN ẢO'}
          </Tag>
          <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            {modelName}
          </Title>
        </div>

        {/* Tab Toggle: Inspect vs Print Simulation & Demo Showcase */}
        <Space wrap>
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

          <Tooltip title={!hasValidModel ? 'Cần có mô hình 3D thực tế của bạn trước khi chạy minh họa in' : ''}>
            <Button
              type={activeTab === 'simulation' ? 'primary' : 'default'}
              icon={<PrinterOutlined />}
              onClick={() => handleTabChange('simulation')}
              disabled={!hasValidModel}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background: activeTab === 'simulation' ? '#0ea5e9' : 'transparent',
                borderColor: activeTab === 'simulation' ? '#0ea5e9' : '#443C68',
                color: hasValidModel ? '#fff' : 'rgba(255, 255, 255, 0.35)',
              }}
            >
              Minh họa quá trình in
            </Button>
          </Tooltip>

          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setShowDemoDrawer(true)}
            style={{
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary, #948aa8)',
            }}
          >
            Mô hình mẫu
          </Button>
        </Space>
      </div>

      {loadError && (
        <Alert
          type="error"
          message="Lỗi nạp mô hình 3D"
          description={loadError}
          showIcon
          action={
            onRetry ? (
              <Button size="small" type="primary" onClick={onRetry} style={{ borderRadius: 6 }}>
                Thử lại tải GLB
              </Button>
            ) : undefined
          }
          style={{ margin: 12, borderRadius: 10 }}
        />
      )}

      {/* 3D WebGL Canvas Container */}
      <div style={{ position: 'relative', width: '100%', height: 480, background: '#0e0d14' }}>
        {/* Loading Spinner */}
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
              Đang tải và kết xuất mô hình 3D GLB từ ảnh chụp của bạn...
            </Text>
          </div>
        )}

        {/* Empty State / Processing Truthful Overlay */}
        {!hasValidModel && !loading && !loadError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(14, 13, 20, 0.65)',
              zIndex: 8,
              padding: 24,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(124, 92, 252, 0.15)',
                color: 'var(--primary, #7C5CFC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                marginBottom: 16,
              }}
            >
              {isProcessing ? <Spin /> : <PrinterOutlined />}
            </div>
            <Title level={4} style={{ color: '#fff', margin: '0 0 8px', fontWeight: 700 }}>
              {isProcessing
                ? 'AI đang dựng mô hình 3D từ ảnh chụp của bạn...'
                : 'Chưa có mô hình 3D được nạp'}
            </Title>
            <Text style={{ color: 'var(--text-secondary, #948aa8)', maxWidth: 460, fontSize: '0.9rem' }}>
              {statusMessage ||
                (isProcessing
                  ? 'Khi cụm AI xử lý hoàn tất, mô hình 3D thực tế của bạn sẽ tự động xuất hiện trên bàn in ảo này.'
                  : 'Hãy tải ảnh hoặc chụp bằng camera laptop để tạo kỷ vật 3D chân thực.')}
            </Text>
          </div>
        )}

        {/* The Three.js Mount Point */}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Mandatory Print Simulation Watermark & Label */}
        {activeTab === 'simulation' && hasValidModel && (
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
            <span>Minh họa quá trình in (Mặt cắt mô hình của bạn)</span>
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
      {activeTab === 'simulation' && hasValidModel ? (
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
                Tiến độ lớp cắt trực quan
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

          {/* Truthful Simulation Disclaimer */}
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
                Minh họa quá trình in sử dụng chính mô hình 3D thực tế của bạn qua mặt cắt Three.js. Tiến độ này mang tính trực quan hóa, không phản ánh thời gian sản xuất resin tại xưởng.
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
                Đặt hàng chế tác
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
              {hasValidModel ? (
                <>
                  <CheckCircleFilled style={{ color: 'var(--tertiary, #22c55e)' }} />
                  <span>Mô hình 3D thực tế của bạn đã được tải thành công</span>
                </>
              ) : isProcessing ? (
                <>
                  <Spin size="small" />
                  <span>Đang theo dõi quá trình xử lý AI thời gian thực</span>
                </>
              ) : (
                <>
                  <InfoCircleOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
                  <span>Chờ dữ liệu ảnh để bắt đầu tái tạo</span>
                </>
              )}
            </div>
            <Text style={{ color: 'var(--text-secondary, #948aa8)', fontSize: '0.85rem' }}>
              {hasValidModel
                ? 'Bạn có thể xoay 360 độ hoặc chuyển sang tab "Minh họa quá trình in" để xem hiệu ứng bồi đắp từng lớp.'
                : 'Mọi mô hình hiển thị tại đây đều là kết quả thực tế từ ảnh chụp của bạn, không dùng vật thể ngẫu nhiên.'}
            </Text>
          </div>

          {onProceedToOrder && hasValidModel && (
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

      {/* Dedicated Separate Sample Model Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined style={{ color: 'var(--primary, #7C5CFC)' }} />
            <span>Mô Hình Mẫu Tham Khảo (Phòng Trưng Bày)</span>
          </div>
        }
        placement="right"
        width={420}
        open={showDemoDrawer}
        onClose={() => setShowDemoDrawer(false)}
        styles={{
          body: { background: '#0B0A10', color: 'var(--text-primary)' },
          header: { background: '#14121E', borderBottom: '1px solid #2E274A' },
        }}
      >
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="MẪU THAM KHẢO — KHÔNG PHẢI KỶ VẬT CỦA BẠN"
          description="Khu vực này trưng bày các tác phẩm mẫu đã được xử lý hoàn thiện để bạn tham khảo chất lượng bề mặt và độ chi tiết của công nghệ in Resin SLA."
          style={{ marginBottom: 20, borderRadius: 10 }}
        />

        <Card
          style={{
            background: '#14121E',
            borderColor: '#2E274A',
            borderRadius: 16,
            marginBottom: 16,
          }}
          styles={{ body: { padding: 16 } }}
        >
          <Title level={5} style={{ color: '#fff', margin: '0 0 6px' }}>
            Tượng chân dung Điêu khắc Mẫu
          </Title>
          <Text style={{ color: 'var(--text-secondary, #948aa8)', fontSize: '0.85rem', display: 'block', marginBottom: 12 }}>
            Mô hình mẫu chuẩn glTF 2.0 với độ phân giải lưới 50.000 đa giác và chất liệu phủ mô phỏng nhựa resin quang hóa.
          </Text>
          <Tag color="cyan">glTF Binary (.glb)</Tag>
          <Tag color="purple">SLA Resin Finish</Tag>
        </Card>
      </Drawer>
    </Card>
  );
};

export default Keepsake3DViewer;
