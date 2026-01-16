"use client";

import DashboardHeaderUtilisateur from "./components/DashboardHeaderUtilisateur";
import SidebarUtilisateur from "./components/SideBarUtilisateur";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar affichée partout */}
      <SidebarUtilisateur />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Header affiché partout */}
        <DashboardHeaderUtilisateur />

        <main className="flex-grow-1 overflow-auto p-3 p-md-4">{children}</main>
      </div>
    </div>
  );
}
