"use client";

import SidebarModPanel from "./components/SidebarProps";
import ModPanelHeader from "./components/ModPanelHeader";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar affichée partout */}
      <SidebarModPanel />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Header affiché partout */}
        <ModPanelHeader />

        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}
