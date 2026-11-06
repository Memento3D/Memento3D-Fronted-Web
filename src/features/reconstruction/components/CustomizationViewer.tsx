import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Button, Spin } from 'antd';
import type { CustomizationScene, CustomizationSelection } from '../../../services/modelCustomizationService';

function dispose(objects: Iterable<THREE.Object3D>) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  for (const object of objects) object.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  textures.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  geometries.forEach(value => value.dispose());
}

interface Props {
  scene: CustomizationScene;
  selection: CustomizationSelection;
  retry: number;
  refresh: () => Promise<CustomizationScene>;
  onReady: (selection: CustomizationSelection) => void;
  onError: (message: string) => void;
}

export function CustomizationViewer(props: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const runtime = useRef<{ update: () => void; reset: () => void; focusFace: () => void } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch { latest.current.onError('Thiết bị chưa hỗ trợ hiển thị 3D. Hãy bật WebGL hoặc dùng trình duyệt khác.'); setLoading(false); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);
    const world = new THREE.Scene();world.background = new THREE.Color('#111019');
    const camera = new THREE.PerspectiveCamera(36, 1, 0.001, 10000);
    const controls = new OrbitControls(camera, renderer.domElement);controls.enableDamping = true;
    world.add(new THREE.HemisphereLight(0xffffff, 0x67616f, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2.5);key.position.set(3, 5, 4);world.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1);fill.position.set(-3, 2, -2);world.add(fill);
    // The only centering/scaling transform belongs to this common parent.
    const root = new THREE.Group();world.add(root);
    const slots = new THREE.Group();root.add(slots);
    const cache = new Map<string, Promise<THREE.Group>>();
    const owned = new Set<THREE.Group>();
    const loader = new GLTFLoader();
    const downloads = new AbortController();
    let alive = true, generation = 0, framed = false;
    let base: THREE.Group | undefined;
    const cameraHome = new THREE.Vector3(), targetHome = new THREE.Vector3();
    const resize = () => {
      const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height);camera.aspect = width / height;camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);observer.observe(host);resize();
    renderer.setAnimationLoop(() => { controls.update();renderer.render(world, camera); });

    const load = (id: string | null, snapshot: CustomizationScene): Promise<THREE.Group> => {
      const asset = id ? snapshot.assets.find(item => item.assetVersionId === id) : undefined;
      if (id && !asset) return Promise.reject(new Error('Mẫu được chọn không thuộc mô hình này.'));
      const identity = id ? `${id}:${asset!.sha256}` : `base:${snapshot.baseModel.sha256}`;
      const cached = cache.get(identity);if (cached) return cached;
      const promise = (async () => {
        let url = asset?.url ?? snapshot.baseModel.url;
        let response = await fetch(url, { signal: downloads.signal });
        if (response.status === 401 || response.status === 403) {
          const fresh = await latest.current.refresh();
          url = id ? fresh.assets.find(item => item.assetVersionId === id)!.url : fresh.baseModel.url;
          response = await fetch(url, { signal: downloads.signal });
        }
        if (!response.ok) throw new Error('Không tải được mô hình hoặc phụ kiện. Bạn có thể thử tải lại.');
        const gltf = await loader.parseAsync(await response.arrayBuffer(), new URL('.', url).href);
        const object = gltf.scene;
        if (asset) {
          if (asset.matrixColumnMajor.length !== 16 || !asset.matrixColumnMajor.every(Number.isFinite)) {
            dispose([object]);throw new Error('Dữ liệu vị trí phụ kiện không hợp lệ.');
          }
          // Preserve the GLB root transform; apply the server matrix exactly once on a wrapper.
          const placement = new THREE.Group();placement.matrixAutoUpdate = false;
          placement.matrix.fromArray(asset.matrixColumnMajor);placement.add(object);
          if (!alive) { dispose([placement]);throw new Error('Viewer closed'); }
          owned.add(placement);return placement;
        }
        if (!alive) { dispose([object]);throw new Error('Viewer closed'); }
        owned.add(object);return object;
      })();
      cache.set(identity, promise);
      promise.catch(() => { if (cache.get(identity) === promise) cache.delete(identity); });
      return promise;
    };
    const update = async () => {
      const token = ++generation;
      const { scene, selection } = latest.current;
      const chosen = { ...selection };
      setLoading(true);
      try {
        const [body, ...accessories] = await Promise.all([
          load(null, scene), ...scene.groups.flatMap(group => chosen[group.id] ? [load(chosen[group.id], scene)] : []),
        ]);
        if (!alive || token !== generation) return;
        if (!base) { base = body;root.add(body); }
        slots.clear();accessories.forEach(object => slots.add(object));
        if (!framed) {
          const box = new THREE.Box3().setFromObject(body);
          const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
          if (box.isEmpty() || !Number.isFinite(size.length()) || size.length() === 0) throw new Error('Mô hình không có hình khối hợp lệ.');
          const scale = 2 / Math.max(size.x, size.y, size.z);
          root.scale.setScalar(scale);root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
          const height = size.y * scale;
          controls.target.set(0, height * 0.52, 0);camera.position.set(0, height * 0.7, 4.4);
          cameraHome.copy(camera.position);targetHome.copy(controls.target);
          controls.minDistance = 0.3;controls.maxDistance = 12;controls.update();framed = true;
        }
        setLoading(false);latest.current.onReady(chosen);
      } catch (error) {
        if (!alive || token !== generation) return;
        setLoading(false);latest.current.onError(error instanceof Error ? error.message : 'Không thể tải mô hình 3D.');
      }
    };
    runtime.current = { update: () => { void update(); }, focusFace: () => {
      if (!base || !framed) return;
      root.updateMatrixWorld(true);
      const head = base.getObjectByName('Personalized_Complete_Head');
      const box = new THREE.Box3().setFromObject(head ?? base);
      const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      if (!head) { center.y = box.max.y - size.y * 0.12;size.multiplyScalar(0.25); }
      const distance = Math.max(size.y, size.x / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.35;
      controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(0, 0, Math.max(distance, 0.4)));controls.update();
    }, reset: () => {
      camera.position.copy(cameraHome);controls.target.copy(targetHome);controls.update();
    } };
    void update();
    return () => {
      alive = false;generation++;downloads.abort();runtime.current = null;observer.disconnect();
      renderer.setAnimationLoop(null);controls.dispose();dispose(owned);owned.clear();cache.clear();
      renderer.dispose();renderer.domElement.remove();
    };
  }, []);

  useEffect(() => { runtime.current?.update(); }, [props.selection, props.retry]);

  return <div className="customization-viewport">
    <div ref={mount} className="customization-canvas" aria-label="Mô hình 3D tùy chỉnh, kéo để xoay và cuộn để phóng to" />
    {loading && <div className="customization-loading" role="status"><Spin /><span>Đang tải mô hình và phụ kiện…</span></div>}
    <div className="customization-camera-controls">
      <Button size="small" onClick={() => runtime.current?.focusFace()}>Xem gần khuôn mặt</Button>
      <Button size="small" onClick={() => runtime.current?.reset()}>Xem toàn thân</Button>
    </div>
    <span className="customization-view-hint">Kéo để xoay · Cuộn hoặc chụm để thu phóng</span>
  </div>;
}
