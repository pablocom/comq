import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createServiceContainer, type Services } from '@infrastructure/di/ServiceContainer';

const ServiceContext = createContext<Services | null>(null);

export function useServices(): Services {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => createServiceContainer(), []);

  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}
