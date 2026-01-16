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

export default function SidebarModPanel({
  activeNav = "dashboard",
  userName = "Modérateur",
  userEmail = "mod@oskar.com",
  userAvatar = "https://ui-avatars.com/api/?name=O&background=16a34a&color=fff&size=40",
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const [openMenus, setOpenMenus] = useState({
    users: false,
    sellers: false,
    categories: false,
    types: false,
    history: false,
    roles: false,
    civilites: false,
    marital: false,
    locations: false,
  });

  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: "fa-chart-line",
      badge: null,
      href: "/dashboard-agent/dashboard",
    },
    {
      id: "ads",
      label: "Annonces",
      icon: "fa-rectangle-ad",
      badge: { count: 54, color: "bg-warning" },
      href: "/dashboard-agent/annonces",
    },
    {
      id: "certification",
      label: "Certifications",
      icon: "fa-certificate",
      badge: { count: 23, color: "bg-danger" },
      href: "/dashboard-agent/certifications",
    },
    {
      id: "shops",
      label: "Boutiques",
      icon: "fa-store",
      badge: null,
      href: "/dashboard-agent/boutiques",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "fa-message",
      badge: { count: 12, color: "bg-primary" },
      href: "/dashboard-agent/messages",
    },
    {
      id: "reports",
      label: "Signalements",
      icon: "fa-flag",
      badge: null,
      href: "/dashboard-agent/signalements",
    },
    {
      id: "support",
      label: "Support",
      icon: "fa-headset",
      badge: { count: 8, color: "bg-info" },
      href: "/dashboard-agent/support",
    },
  ];

  const managementItems = [
    {
      id: "users",
      label: "Gestion Utilisateurs",
      icon: "fa-users",
      submenu: [
        {
          label: "Actifs",
          href: "/dashboard-agent/utilisateurs/actifs",
          icon: "fa-circle-check text-success",
        },
        {
          label: "Bloqués",
          href: "/dashboard-agent/utilisateurs/bloques",
          icon: "fa-ban text-danger",
        },
        {
          label: "Supprimés",
          href: "/dashboard-agent/utilisateurs/supprimes",
          icon: "fa-trash text-warning",
        },
      ],
    },
    {
      id: "sellers",
      label: "Gestion Vendeurs",
      icon: "fa-store",
      submenu: [
        {
          label: "Actifs",
          href: "/dashboard-agent/vendeurs/actifs",
          icon: "fa-circle-check text-success",
        },
        {
          label: "Bloqués",
          href: "/dashboard-agent/vendeurs/bloques",
          icon: "fa-ban text-danger",
        },
        {
          label: "Supprimés",
          href: "/dashboard-agent/vendeurs/supprimes",
          icon: "fa-trash text-warning",
        },
      ],
    },
    {
      id: "categories",
      label: "Gestion Catégories",
      icon: "fa-layer-group",
      submenu: [
        {
          label: "Liste des catégories",
          href: "/dashboard-agent/categories/liste",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "types",
      label: "Types de Boutiques",
      icon: "fa-shop",
      submenu: [
        {
          label: "Liste des types",
          href: "/dashboard-agent/types-boutiques",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "history",
      label: "Historique",
      icon: "fa-history",
      submenu: [
        {
          label: "Historique actions",
          href: "/dashboard-agent/historique/actions",
          icon: "fa-clock-rotate-left text-primary",
        },
        {
          label: "Historique connexions",
          href: "/dashboard-agent/historique/connexions",
          icon: "fa-sign-in-alt text-info",
        },
        {
          label: "Journal des erreurs",
          href: "/dashboard-agent/historique/erreurs",
          icon: "fa-bug text-danger",
        },
      ],
    },
    {
      id: "roles",
      label: "Gestion des Rôles",
      icon: "fa-user-tag",
      submenu: [
        {
          label: "Liste des rôles",
          href: "/dashboard-agent/roles/liste",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "civilites",
      label: "Civilités",
      icon: "fa-user-tie",
      submenu: [
        {
          label: "Liste des civilités",
          href: "/dashboard-agent/civilites/liste",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "marital",
      label: "Statuts Matrimoniaux",
      icon: "fa-heart",
      submenu: [
        {
          label: "Liste des statuts",
          href: "/dashboard-agent/statuts-matrimoniaux",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "locations",
      label: "Villes & Pays",
      icon: "fa-earth-africa",
      submenu: [
        {
          label: "Liste des pays",
          href: "/dashboard-agent/pays",
          icon: "fa-globe text-primary",
        },
        {
          label: "Liste des villes",
          href: "/dashboard-agent/villes",
          icon: "fa-city text-info",
        },
      ],
    },
  ];

  const settingsItems = [
    {
      id: "settings",
      label: "Paramètres",
      icon: "fa-gear",
      href: "/dashboard-agent/parametres",
    },
    {
      id: "profile",
      label: "Mon Profil",
      icon: "fa-user",
      href: "/dashboard-agent/profile",
    },
    {
      id: "help",
      label: "Aide & Guide",
      icon: "fa-question-circle",
      href: "/dashboard-agent/aide",
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
                  Modérateur
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
                  Gestion Administratif
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
                      onClick={() =>
                        toggleMenu(item.id as keyof typeof openMenus)
                      }
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
                      </div>
                      <i
                        className={`fa-solid fa-chevron-${openMenus[item.id as keyof typeof openMenus] ? "up" : "down"}`}
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </div>

                    {openMenus[item.id as keyof typeof openMenus] && (
                      <div className="mt-1 ms-4">
                        {item.submenu.map((subItem, index) => (
                          <Link
                            key={index}
                            href={subItem.href}
                            className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none"
                            style={{
                              color: "#d1d5db",
                              fontSize: "0.85rem",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#4b5563";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#d1d5db";
                            }}
                          >
                            <i
                              className={`fa-solid ${subItem.icon} fa-fw`}
                              style={{ width: "20px" }}
                            ></i>
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.submenu[0].href}
                    className="text-decoration-none d-flex align-items-center justify-content-center gap-3 px-3 py-2 rounded"
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
                  </Link>
                )}
              </div>
            ))}

            {/* Paramètres (toujours en bas) */}
            {!isCollapsed && (
              <div className="mt-4 pt-3 border-top border-secondary">
                <div className="text-secondary small text-uppercase fw-bold px-3 mb-2">
                  Configuration
                </div>
                {settingsItems.slice(0, -1).map((item) => (
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
