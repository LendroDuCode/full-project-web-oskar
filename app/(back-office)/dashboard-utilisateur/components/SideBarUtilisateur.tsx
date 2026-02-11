"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeNav?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: {
    count: number;
    color: string;
  };
}

interface SubMenuItem {
  label: string;
  href: string;
  icon: string;
  badge?: {
    count: number;
    color: string;
  };
}

type MenuKey =
  | "dons"
  | "echanges"
  | "produits"
  | "annonces"
  | "favoris"
  | "boutique"
  | "commandes"
  | "stocks"
  | "categories"
  | "types"
  | "history"
  | "profile"
  | "settings";

interface ManagementItem {
  id: MenuKey;
  label: string;
  icon: string;
  submenu: SubMenuItem[];
}

interface ProfileItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export default function SidebarUtilisateur({
  activeNav = "dashboard",
  userName = "Utilisateur",
  userEmail = "utilisateur@oskar.com",
  userAvatar = "https://ui-avatars.com/api/?name=V&background=16a34a&color=fff&size=40",
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const [openMenus, setOpenMenus] = useState({
    dons: false,
    echanges: false,
    produits: false,
    annonces: false,
    favoris: false,
    boutique: false,
    commandes: false,
    stocks: false,
    categories: false,
    types: false,
    history: false,
    profile: false,
    settings: false,
  });

  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleMenu = (menu: MenuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: "fa-chart-line",
      href: "/dashboard-utilisateur/",
    },
  ];

  const managementItems: ManagementItem[] = [
    {
      id: "annonces",
      label: "Gestion des Annonces",
      icon: "fa-bullhorn",
      submenu: [
        {
          label: "Toutes les annonces",
          href: "/dashboard-utilisateur/annonces/liste-annonces",
          icon: "fa-list text-primary",
        },
      ],
    },
    {
      id: "favoris",
      label: "Mes Favoris",
      icon: "fa-heart",
      submenu: [
        {
          label: "Tous mes favoris",
          href: "/dashboard-utilisateur/favoris",
          icon: "fa-heart text-danger",
          badge: { count: 8, color: "bg-danger" },
        },
      ],
    },
  ];

  const profileItems: ProfileItem[] = [
    {
      id: "profile",
      label: "Mon Profil",
      icon: "fa-user",
      href: "/dashboard-utilisateur/profile",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: "fa-gear",
      href: "/dashboard-utilisateur/parametres",
    },
    {
      id: "help",
      label: "Aide & Support",
      icon: "fa-question-circle",
      href: "/dashboard-utilisateur/aide",
    },
    {
      id: "logout",
      label: "Déconnexion",
      icon: "fa-right-from-bracket",
      href: "/logout",
    },
  ];

  const isNavActive = (navId: string) => {
    return activeNav === navId;
  };

  const renderMenuItem = (item: SubMenuItem, index: number) => {
    return (
      <Link
        key={index}
        href={item.href}
        className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none position-relative"
        style={{
          color: "#d1d5db",
          fontSize: "0.85rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#4b5563";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#d1d5db";
        }}
      >
        <i
          className={`fa-solid ${item.icon} fa-fw`}
          style={{ width: "20px" }}
        ></i>
        <span className="flex-grow-1">{item.label}</span>
        {item.badge && (
          <span
            className={`badge ${item.badge.color} rounded-pill`}
            style={{ fontSize: "0.65rem", padding: "0.15rem 0.3rem" }}
          >
            {item.badge.count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      id="sidebar"
      className={`d-flex flex-column text-white ${isCollapsed ? "w-auto" : "w-280"}`}
      style={{
        minHeight: "100vh",
        backgroundColor: "#1f2937",
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="btn p-0 border-0 bg-transparent"
              aria-label="Accueil"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.transition = "transform 0.2s ease";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div
                className="rounded d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#16a34a",
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
                }}
              >
                O
              </div>
            </button>
            {!isCollapsed && (
              <div>
                <h6 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                  Utilisateur
                </h6>
                <small className="text-secondary">Plateforme OSKAR</small>
              </div>
            )}
          </div>
          <button
            className="btn btn-link text-secondary p-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <i
              className={`fa-solid fa-chevron-${isCollapsed ? "right" : "left"}`}
            ></i>
          </button>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="flex-grow-1 overflow-y-auto">
        <div className="p-3">
          <div className="d-flex flex-column gap-1">
            {/* Navigation de base */}
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded ${isNavActive(item.id) ? "bg-success text-white" : "text-white hover:bg-gray-700"}`}
                style={{
                  color: isNavActive(item.id) ? "white" : "#d1d5db",
                  backgroundColor: isNavActive(item.id)
                    ? "#16a34a"
                    : "transparent",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  if (!isNavActive(item.id)) {
                    e.currentTarget.style.backgroundColor = "#374151";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNavActive(item.id)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#d1d5db";
                  }
                }}
              >
                <i
                  className={`fa-solid ${item.icon} ${isCollapsed ? "" : "fa-fw"}`}
                  style={{ width: "20px", textAlign: "center" }}
                ></i>
                {!isCollapsed && (
                  <>
                    <span className="flex-grow-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`badge ${item.badge.color} rounded-pill ${isNavActive(item.id) ? "bg-white text-dark" : ""}`}
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.4rem" }}
                      >
                        {item.badge.count}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span
                    className={`position-absolute top-0 start-100 translate-middle badge ${item.badge.color} rounded-pill`}
                    style={{ fontSize: "0.55rem", padding: "0.15rem 0.3rem" }}
                  >
                    {item.badge.count > 9 ? "9+" : item.badge.count}
                  </span>
                )}
              </Link>
            ))}

            {/* Séparateur */}
            {!isCollapsed && (
              <div className="my-3 px-3">
                <div className="text-secondary small text-uppercase fw-bold">
                  Gestion des Ventes
                </div>
              </div>
            )}

            {/* Menus de gestion déroulants */}
            {managementItems.map((item) => (
              <div key={item.id} className={!isCollapsed ? "mt-1" : ""}>
                {!isCollapsed ? (
                  <>
                    <div
                      className="d-flex align-items-center justify-content-between px-3 py-2 rounded cursor-pointer"
                      style={{
                        color: "#d1d5db",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => toggleMenu(item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#374151";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#d1d5db";
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <i
                          className={`fa-solid ${item.icon} fa-fw`}
                          style={{ width: "20px", textAlign: "center" }}
                        ></i>
                        <span>{item.label}</span>
                        {/* Badge global pour le menu */}
                        {item.submenu.some((sub) => sub.badge) && (
                          <span className="ms-auto me-2">
                            {item.submenu
                              .filter((sub) => sub.badge)
                              .reduce(
                                (sum, sub) => sum + (sub.badge?.count || 0),
                                0,
                              ) > 0 && (
                              <span
                                className="badge bg-danger rounded-pill"
                                style={{
                                  fontSize: "0.6rem",
                                  padding: "0.1rem 0.3rem",
                                }}
                              >
                                {item.submenu
                                  .filter((sub) => sub.badge)
                                  .reduce(
                                    (sum, sub) => sum + (sub.badge?.count || 0),
                                    0,
                                  )}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <i
                        className={`fa-solid fa-chevron-${openMenus[item.id] ? "up" : "down"}`}
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </div>

                    {openMenus[item.id] && (
                      <div className="mt-1 ms-4">
                        {item.submenu.map((subItem, index) =>
                          renderMenuItem(subItem, index),
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.submenu[0].href}
                    className="text-decoration-none d-flex align-items-center justify-content-center gap-3 px-3 py-2 rounded position-relative"
                    style={{
                      color: "#d1d5db",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#374151";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#d1d5db";
                    }}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    {/* Badge pour version réduite */}
                    {item.submenu.some((sub) => sub.badge) && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill"
                        style={{ fontSize: "0.5rem", padding: "0.1rem 0.2rem" }}
                      >
                        {item.submenu
                          .filter((sub) => sub.badge)
                          .reduce(
                            (sum, sub) => sum + (sub.badge?.count || 0),
                            0,
                          )}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}

            {/* Profil & Paramètres */}
            {!isCollapsed && (
              <div className="mt-4 pt-3 border-top border-secondary">
                <div className="text-secondary small text-uppercase fw-bold px-3 mb-2">
                  Profil & Configuration
                </div>
                {profileItems.slice(0, -1).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded"
                    style={{
                      color: "#d1d5db",
                      fontSize: "0.9rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#374151";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#d1d5db";
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon} fa-fw`}
                      style={{ width: "20px", textAlign: "center" }}
                    ></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info & Footer */}
      <div className="border-top border-secondary p-3">
        {/* Info utilisateur */}
        {!isCollapsed && (
          <div className="d-flex align-items-center gap-3 mb-3 p-2">
            <div
              className="rounded-circle overflow-hidden position-relative"
              style={{
                width: "44px",
                height: "44px",
                border: "2px solid #16a34a",
              }}
            >
              <img
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="rounded-circle w-100 h-100 object-fit-cover"
              />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-semibold small text-truncate">{userName}</div>
              <div className="text-secondary extra-small text-truncate">
                {userEmail}
              </div>
            </div>
          </div>
        )}

        {/* Déconnexion */}
        <Link
          href="/logout"
          className="text-decoration-none d-flex align-items-center gap-3 px-3 py-2 rounded"
          style={{
            color: "#f87171",
            fontSize: "0.9rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#374151";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ width: "20px", textAlign: "center" }}
          ></i>
          {!isCollapsed && <span>Se déconnecter</span>}
        </Link>
      </div>

      <style jsx>{`
        .w-280 {
          width: 280px;
        }
        .extra-small {
          font-size: 0.75rem;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .overflow-y-auto {
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fa-fw {
          width: 1.25em !important;
        }
      `}</style>
    </aside>
  );
}
