// app/(back-office)/dashboard-admin/agents/page.tsx

"use client";
export const dynamic = 'force-dynamic';

import { useSearchParams } from "next/navigation";
// Si vous n'utilisez pas useSearchParams, retirez l'import

export default function AgentsPage() {
  // Si vous n'utilisez pas useSearchParams, vous pouvez retirer cette ligne
  // const searchParams = useSearchParams();
  
  return (
    <div>
      <h1>Gestion des Agents</h1>
      <p>Contenu de la page agents</p>
    </div>
  );
}