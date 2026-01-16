// app/(back-office)/dashboard-admin/layout.tsx
"use client";

import DashboardHeader from "./components/DashboardHeader";
import SidebarSuperAdmin from "./components/SidebarSuperAdmin";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex min-vh-100">
      <SidebarSuperAdmin />
      <div className="flex-grow-1 d-flex flex-column">
        <DashboardHeader />
        <main className="flex-grow-1 p-3 p-md-4">{children}</main>
      </div>
    </div>
  );
}
