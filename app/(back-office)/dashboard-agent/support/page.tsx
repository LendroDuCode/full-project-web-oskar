import SupportTicketsSection from "./components/SupportTicketsSection";
import TicketPreviewPane from "./components/TicketPreviewPane";

export default function Support() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <SupportTicketsSection />
      <TicketPreviewPane />
    </main>
  );
}
