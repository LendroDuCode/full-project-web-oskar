// app/providers.tsx
"use client";

import { PrimeReactProvider } from "primereact/api";

const primereactConfig = {
  ripple: true,
  inputStyle: "outlined" as const,
  locale: "fr",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider value={primereactConfig}>{children}</PrimeReactProvider>
  );
}
