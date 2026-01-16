import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ClientLayout from "./ClientLayout"; // Importez ClientLayout

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OSKAR - Plateforme de dons et d'échanges",
  description:
    "Rejoignez la communauté OSKAR pour donner, échanger et partager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* Enveloppez tout avec ClientLayout */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
