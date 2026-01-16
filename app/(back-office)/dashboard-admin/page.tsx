// app/(back-office)/dashboard-admin/page.tsx
import KpiCardsSection from "./components/KpiCardsSection";
import ChartsSection from "./components/ChartsSection";
import AuditLogsSection from "./components/AuditLogsSection";

export default function DashboardAdminHomePage() {
  return (
    <>
      <div className="p-3 p-md-4">
        <KpiCardsSection />
        <ChartsSection />
        <AuditLogsSection />
      </div>
    </>
  );
}
