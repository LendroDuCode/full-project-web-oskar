import FilterBar from "../annonces/components/FilterBar";
import VerificationWorkstation from "./components/VerificationWorkstation";

export default function Certifications() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <FilterBar />
      <VerificationWorkstation />
    </main>
  );
}
