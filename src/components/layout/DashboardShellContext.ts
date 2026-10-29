import { createContext, useContext } from 'react';

export const DashboardShellContext = createContext(false);
export const useDashboardShell = () => useContext(DashboardShellContext);
