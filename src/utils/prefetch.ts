/**
 * Intelligent Route & Asset Prefetcher for Memento3D
 * Warms up route chunks and caches upon user intent (hover/focus)
 */

const prefetchedModules = new Set<string>();

export function prefetchChunk(name: string, importFn: () => Promise<unknown>): void {
  if (prefetchedModules.has(name)) return;
  prefetchedModules.add(name);

  // Defer non-critical prefetch to idle time if browser supports requestIdleCallback
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      importFn().catch(() => {
        prefetchedModules.delete(name);
      });
    }, { timeout: 1500 });
  } else {
    setTimeout(() => {
      importFn().catch(() => {
        prefetchedModules.delete(name);
      });
    }, 100);
  }
}
