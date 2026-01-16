//app/ClientLayout
"use client";

import { AuthProvider } from "./(front-office)/auth/AuthContext";
import Header from "./shared/components/layout/Header";
import AuthModals from "./(front-office)/auth/AuthModals";
import Footer from "./shared/components/layout/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Header />
      <main>{children}</main>
      <AuthModals />
      <Footer />
    </AuthProvider>
  );
}
