import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';

/** Guard router navigation plus native Back/Forward without changing router type. */
export function useUnsavedDesignGuard(dirty: boolean) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  useEffect(() => {
    if (!dirty) return;
    const confirmLeave = () => window.confirm('Thiết kế chưa được lưu. Bạn muốn rời trang?');
    const originalPush = navigator.push, originalReplace = navigator.replace;
    const push: typeof navigator.push = (...args) => { if (confirmLeave()) originalPush.apply(navigator, args); };
    const replace: typeof navigator.replace = (...args) => { if (confirmLeave()) originalReplace.apply(navigator, args); };
    navigator.push = push;navigator.replace = replace;
    let index: number | undefined = window.history.state?.idx;
    let restoring = false;
    const pop = (event: PopStateEvent) => {
      if (restoring) { restoring = false;event.stopImmediatePropagation();return; }
      const next: number | undefined = event.state?.idx;
      if (index !== undefined && next !== undefined && index !== next && !confirmLeave()) {
        event.stopImmediatePropagation();restoring = true;window.history.go(index - next);return;
      }
      index = next;
    };
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault();event.returnValue = ''; };
    // Native links bypass the router. New-tab links do not discard this design.
    const link = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!anchor || anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      // React Router links call the guarded navigator; only intercept external/native navigation.
      if (anchor.origin === window.location.origin && !anchor.hasAttribute('download')) return;
      if (!confirmLeave()) { event.preventDefault();event.stopPropagation(); }
    };
    window.addEventListener('popstate', pop, true);window.addEventListener('beforeunload', unload);
    document.addEventListener('click', link, true);
    return () => {
      if (navigator.push === push) navigator.push = originalPush;
      if (navigator.replace === replace) navigator.replace = originalReplace;
      window.removeEventListener('popstate', pop, true);window.removeEventListener('beforeunload', unload);
      document.removeEventListener('click', link, true);
    };
  }, [dirty, navigator]);
}
