import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * High-performance, lightweight 3D Digital Manufacturing scene.
 * Visualizes an interactive holographic 3D printing core with particle ring,
 * ambient glow, and subtle mouse-tracking parallax.
 * Strictly optimized to prevent unnecessary re-renders and memory leaks.
 */
export const DashboardScene: React.FC = React.memo(() => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0ea5e9, 3.0); // Cyan light
    dirLight1.position.set(4, 5, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 2.5); // Purple accent
    dirLight2.position.set(-4, -2, -2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 3. Central Holographic Object (Stylized 3D Manufacturing Keepsake)
    const group = new THREE.Group();
    scene.add(group);

    // Outer Wireframe Cage (Octahedron/Icosahedron)
    const cageGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    group.add(cageMesh);

    // Inner Glowing Core
    const coreGeo = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Orbiting Particle Ring
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x0ea5e9);
    const c2 = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.7 + (Math.random() - 0.5) * 0.4;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 0.6;
      const z = Math.sin(angle) * radius;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const mixed = c1.clone().lerp(c2, Math.random());
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    group.add(particlePoints);

    // Base Circular Grid Platform
    const gridHelper = new THREE.GridHelper(3.6, 12, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -1.3;
    scene.add(gridHelper);

    // 4. Subtle Parallax on Mouse Move
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Limit rotation to ~3 degrees (0.05 rad)
      targetRotationY = x * 0.08;
      targetRotationX = -y * 0.08;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 5. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow rotation
      cageMesh.rotation.y += delta * 0.25;
      cageMesh.rotation.x += delta * 0.15;

      coreMesh.rotation.y -= delta * 0.4;
      coreMesh.rotation.z += delta * 0.2;

      particlePoints.rotation.y += delta * 0.15;
      particlePoints.rotation.x = Math.sin(elapsedTime * 0.4) * 0.1;

      // Vertical floating motion
      group.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Smooth parallax damping
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      cageGeo.dispose();
      cageMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
        position: 'relative',
        cursor: 'grab',
      }}
      title="Memento3D Digital Twin Core (Di chuyển chuột để xoay nhẹ)"
    />
  );
});

DashboardScene.displayName = 'DashboardScene';
