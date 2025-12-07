"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SimpleBreadcrumb() {
  const pathname = usePathname();

  // Dictionnaire des labels pour les routes
  const routeLabels: Record<string, string> = {
    "/": "Accueil",
    "/contact": "Contact",
    "/liste-favoris": "Mes Favoris",
    "/dons-echanges": "Don & Échange",
    "/vetements-chaussures": "Vêtements & Chaussures",
    "/electroniques": "Électronique",
    "/education-culture": "Éducation & Culture",
    "/services-proximite": "Services de proximité",
  };

  // Générer les segments du chemin
  const segments = pathname.split("/").filter((segment) => segment);

  // Construire le breadcrumb
  const breadcrumbItems = [];
  let currentPath = "";

  // Toujours commencer par l'accueil
  breadcrumbItems.push({ label: "Accueil", href: "/", isLast: false });

  // Ajouter les segments du chemin
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Utiliser le label personnalisé ou formater le segment
    const label =
      routeLabels[currentPath] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    breadcrumbItems.push({ label, href: currentPath, isLast });
  });

  return (
    <nav aria-label="breadcrumb" className="bg-white border-bottom py-3">
      <div className="container">
        <ol className="breadcrumb mb-0">
          {breadcrumbItems.map((item, index) => (
            <li
              key={item.href}
              className={`breadcrumb-item ${item.isLast ? "active" : ""}`}
              aria-current={item.isLast ? "page" : undefined}
            >
              {item.isLast ? (
                <span className="fw-medium text-dark">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-decoration-none text-secondary"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
