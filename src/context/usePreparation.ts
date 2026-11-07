import { useContext } from 'react';
import { PreparationContext, type PreparationContextValue } from '@/context/PreparationContext';

export function usePreparation(): PreparationContextValue {
  const value = useContext(PreparationContext);
  if (!value) {
    throw new Error('usePreparation must be used inside PreparationProvider');
  }
  return value;
}
