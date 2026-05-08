// components/SuspenseBoundary.tsx
'use client';

import { Suspense } from 'react';

export function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement de la page...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}