// components/ClientSearchParams.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, ReactNode } from 'react';

interface SearchParamsContextType {
  searchParams: URLSearchParams;
}

const SearchParamsContext = createContext<SearchParamsContextType | null>(null);

export function useSearchParamsSafe() {
  const context = useContext(SearchParamsContext);
  if (!context) {
    throw new Error('useSearchParamsSafe must be used within SearchParamsProvider');
  }
  return context.searchParams;
}

export function SearchParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  
  return (
    <SearchParamsContext.Provider value={{ searchParams }}>
      {children}
    </SearchParamsContext.Provider>
  );
}