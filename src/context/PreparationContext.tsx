import { createContext, useState, type ReactNode } from 'react';
import type { PreparationRequest } from '@/types/preparation';

export type PreparationContextValue = {
  request: PreparationRequest | null;
  setRequest: (request: PreparationRequest | null) => void;
};

export const PreparationContext = createContext<PreparationContextValue | null>(null);

export function PreparationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<PreparationRequest | null>(null);

  return (
    <PreparationContext.Provider value={{ request, setRequest }}>
      {children}
    </PreparationContext.Provider>
  );
}
