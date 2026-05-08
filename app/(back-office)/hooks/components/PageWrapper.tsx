// components/PageWrapper.tsx
'use client';

import { Suspense } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  color?: string;
}

export function PageWrapper({ 
  children, 
  fallbackMessage = "Chargement de la page...",
  color = "primary"
}: PageWrapperProps) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className={`spinner-border text-${color} mb-3`} style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">{fallbackMessage}</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}