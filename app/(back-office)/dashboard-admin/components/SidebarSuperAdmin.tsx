"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  activeNav?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export default function SidebarSuperAdmin({
  userName = "Super Admin",
  userEmail = "admin@oskar.com",
  userAvatar = "https://ui-avatars.com/api/?name=SA&background=16a34a&color=fff&size=40",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    users: false,
    sellers: false,
    agents: false,
    categories: false,
    types: false,
    history: false,
    roles: false,
    civilites: false,
    marital: false,
    locations: false,
    settings: false,
  });

  // Détecter l'onglet actif basé sur l'URL
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    // Mettre à jour l'onglet actif basé sur l'URL
    if (pathname === "/dashboard-admin") {
      setActiveNav("dashboard");
    } else if (pathname.includes("/dashboard-admin/messages")) {
      setActiveNav("messages");
    } else if (pathname.includes("/dashboard-admin/rapports")) {
      setActiveNav("reports");
    } else if (pathname.includes("/dashboard-admin/analytiques")) {
      setActiveNav("analytics");
    } else if (pathname.includes("/dashboard-admin/monitoring")) {
      setActiveNav("monitoring");
    } else if (pathname.includes("/dashboard-admin/utilisateurs")) {
      setActiveNav("users");
      setOpenMenus((prev) => ({ ...prev, users: true }));
    } else if (pathname.includes("/dashboard-admin/vendeurs")) {
      setActiveNav("sellers");
      setOpenMenus((prev) => ({ ...prev, sellers: true }));
    } else if (pathname.includes("/dashboard-admin/agents")) {
      setActiveNav("agents");
      setOpenMenus((prev) => ({ ...prev, agents: true }));
    } else if (pathname.includes("/dashboard-admin/historiques")) {
      setActiveNav("history");
      setOpenMenus((prev) => ({ ...prev, history: true }));
    } else if (pathname.includes("/dashboard-admin/roles")) {
      setActiveNav("roles");
      setOpenMenus((prev) => ({ ...prev, roles: true }));
    } else if (pathname.includes("/dashboard-admin/civilites")) {
      setActiveNav("civilites");
      setOpenMenus((prev) => ({ ...prev, civilites: true }));
    } else if (pathname.includes("/dashboard-admin/statuts-matrimoniaux")) {
      setActiveNav("marital");
      setOpenMenus((prev) => ({ ...prev, marital: true }));
    } else if (
      pathname.includes("/dashboard-admin/pays") ||
      pathname.includes("/dashboard-admin/villes")
    ) {
      setActiveNav("locations");
      setOpenMenus((prev) => ({ ...prev, locations: true }));
    } else if (pathname.includes("/dashboard-admin/profile")) {
      setActiveNav("profile");
    } else if (pathname.includes("/dashboard-admin/parametres-systeme")) {
      setActiveNav("system-settings");
    } else if (pathname.includes("/dashboard-admin/notifications")) {
      setActiveNav("notifications");
    } else if (pathname.includes("/dashboard-admin/aide")) {
      setActiveNav("help");
    }
  }, [pathname]);

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: "fa-chart-line",
      badge: null,
      href: "/dashboard-admin",
      exact: true,
    },
    {
      id: "messages",
      label: "Messages",
      icon: "fa-message",
      badge: { count: 24, color: "bg-primary" },
      href: "/dashboard-admin/messages",
    },
    {
      id: "reports",
      label: "Rapports",
      icon: "fa-chart-pie",
      badge: null,
      href: "/dashboard-admin/rapports",
    },
    {
      id: "analytics",
      label: "Analytiques",
      icon: "fa-chart-simple",
      badge: { count: 3, color: "bg-info" },
      href: "/dashboard-admin/analytiques",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: "fa-desktop",
      badge: null,
      href: "/dashboard-admin/monitoring",
    },
  ];

  const managementItems = [
    {
      id: "users",
      label: "Gestion Utilisateurs",
      icon: "fa-users",
      submenu: [
        {
          id: "users-active",
          label: "Actifs",
          href: "/dashboard-admin/utilisateurs/liste-utilisateurs",
          icon: "fa-circle-check text-success",
        },
        {
          id: "users-blocked",
          label: "Bloqués",
          href: "/dashboard-admin/utilisateurs/liste-utilisateurs-bloques",
          icon: "fa-ban text-danger",
        },
        {
          id: "users-deleted",
          label: "Supprimés",
          href: "/dashboard-admin/utilisateurs/liste-utilisateurs-supprimes",
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
          id: "sellers-active",
          label: "Actifs",
          href: "/dashboard-admin/vendeurs/liste-vendeurs",
          icon: "fa-circle-check text-success",
        },
        {
          id: "sellers-blocked",
          label: "Bloqués",
          href: "/dashboard-admin/vendeurs/liste-vendeurs-bloques",
          icon: "fa-ban text-danger",
        },
        {
          id: "sellers-deleted",
          label: "Supprimés",
          href: "/dashboard-admin/vendeurs/liste-vendeurs-supprimes",
          icon: "fa-trash text-warning",
        },
      ],
    },
    {
      id: "agents",
      label: "Gestion Agents",
      icon: "fa-user-tie",
      submenu: [
        {
          id: "agents-active",
          label: "Actifs",
          href: "/dashboard-admin/agents/liste-agents",
          icon: "fa-circle-check text-success",
        },
        {
          id: "agents-blocked",
          label: "Bloqués",
          href: "/dashboard-admin/agents/liste-agents-bloques",
          icon: "fa-ban text-danger",
        },
        {
          id: "agents-deleted",
          label: "Supprimés",
          href: "/dashboard-admin/agents/liste-agents-supprimes",
          icon: "fa-trash text-warning",
        },
      ],
    },
    {
      id: "history",
      label: "Historique",
      icon: "fa-history",
      submenu: [
        {
          id: "history-actions",
          label: "Actions",
          href: "/dashboard-admin/historiques/actions",
          icon: "fa-clock-rotate-left text-primary",
        },
        {
          id: "history-logins",
          label: "Connexions",
          href: "/dashboard-admin/historiques/connexions",
          icon: "fa-sign-in-alt text-info",
        },

        {
          id: "history-audit",
          label: "Audit",
          href: "/dashboard-admin/historiques/logs-audit",
          icon: "fa-clipboard-list text-warning",
        },
      ],
    },
    {
      id: "roles",
      label: "Gestion Rôles",
      icon: "fa-user-shield",
      submenu: [
        {
          id: "roles-list",
          label: "Rôles",
          href: "/dashboard-admin/roles",
          icon: "fa-list text-info",
        },
      ],
    },
    {
      id: "civilites",
      label: "Gestion Civilités",
      icon: "fa-user-tie",
      submenu: [
        {
          id: "civilites-list",
          label: "Civilités",
          href: "/dashboard-admin/civilites",
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
          id: "marital-list",
          label: "Statuts",
          href: "/dashboard-admin/statut-matrimonial",
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
          id: "countries-list",
          label: "Pays",
          href: "/dashboard-admin/pays",
          icon: "fa-globe text-primary",
        },
        {
          id: "cities-list",
          label: "Villes",
          href: "/dashboard-admin/villes",
          icon: "fa-city text-info",
        },
      ],
    },
  ];

  const settingsItems = [
    {
      id: "profile",
      label: "Mon Profil",
      icon: "fa-user",
      href: "/dashboard-admin/profile",
    },
    {
      id: "system-settings",
      label: "Paramètres Système",
      icon: "fa-sliders",
      href: "/dashboard-admin/parametres-systeme",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "fa-bell",
      href: "/dashboard-admin/notifications",
    },
    {
      id: "help",
      label: "Aide & Support",
      icon: "fa-question-circle",
      href: "/dashboard-admin/aide",
    },
  ];

  // Vérifier si un élément de navigation est actif
  const isNavActive = (navId: string) => {
    return activeNav === navId;
  };

  // Vérifier si un sous-menu est actif
  const isSubmenuActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      id="sidebar"
      className={`d-flex flex-column text-white ${isCollapsed ? "w-auto" : "w-320"}`}
      style={{
        minHeight: "100vh",
        backgroundColor: "#1f2937",
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-4">
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
                <h5 className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
                  Super Admin
                </h5>
                <small className="text-secondary">Plateforme OSKAR</small>
              </div>
            )}
          </div>
          <button
            className="btn btn-link text-secondary p-1"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"
            }
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#374151";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <i
              className={`fa-solid fa-chevron-${isCollapsed ? "right" : "left"}`}
              style={{ fontSize: "0.9rem" }}
            ></i>
          </button>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="flex-grow-1 overflow-y-auto">
        <div className="p-4">
          <div className="d-flex flex-column gap-2">
            {/* Navigation de base */}
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-decoration-none d-flex align-items-center gap-4 px-4 py-3 rounded ${isNavActive(item.id) ? "bg-success text-white active-nav" : "text-white hover:bg-gray-700"}`}
                style={{
                  color: isNavActive(item.id) ? "white" : "#d1d5db",
                  backgroundColor: isNavActive(item.id)
                    ? "#16a34a"
                    : "transparent",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isNavActive(item.id)) {
                    e.currentTarget.style.backgroundColor = "#374151";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNavActive(item.id)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#d1d5db";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <i
                  className={`fa-solid ${item.icon} ${isCollapsed ? "" : "fa-fw"}`}
                  style={{
                    width: "24px",
                    textAlign: "center",
                    fontSize: "1rem",
                    color: isNavActive(item.id) ? "white" : "inherit",
                  }}
                ></i>
                {!isCollapsed && (
                  <>
                    <span className="flex-grow-1 fw-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`badge ${item.badge.color} rounded-pill ${isNavActive(item.id) ? "bg-white text-dark" : ""}`}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        {item.badge.count}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span
                    className={`position-absolute top-0 start-100 translate-middle badge ${item.badge.color} rounded-pill`}
                    style={{ fontSize: "0.6rem", padding: "0.2rem 0.35rem" }}
                  >
                    {item.badge.count > 9 ? "9+" : item.badge.count}
                  </span>
                )}
              </Link>
            ))}

            {/* Séparateur */}
            {!isCollapsed && (
              <div className="my-4 px-4">
                <div
                  className="text-secondary text-uppercase fw-bold"
                  style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}
                >
                  Gestion Utilisateurs
                </div>
              </div>
            )}

            {/* Menus de gestion déroulants */}
            {managementItems.map((item) => {
              const isMenuActive = isNavActive(item.id);
              const hasActiveSubmenu = item.submenu.some((subItem) =>
                isSubmenuActive(subItem.href),
              );

              return (
                <div key={item.id} className={!isCollapsed ? "mt-2" : ""}>
                  {!isCollapsed ? (
                    <>
                      <div
                        className={`d-flex align-items-center justify-content-between px-4 py-3 rounded cursor-pointer ${isMenuActive || hasActiveSubmenu ? "bg-gray-800 text-white" : ""}`}
                        style={{
                          color:
                            isMenuActive || hasActiveSubmenu
                              ? "white"
                              : "#d1d5db",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            isMenuActive || hasActiveSubmenu
                              ? "#374151"
                              : "transparent",
                        }}
                        onClick={() =>
                          toggleMenu(item.id as keyof typeof openMenus)
                        }
                        onMouseEnter={(e) => {
                          if (!isMenuActive && !hasActiveSubmenu) {
                            e.currentTarget.style.backgroundColor = "#374151";
                            e.currentTarget.style.color = "white";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMenuActive && !hasActiveSubmenu) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#d1d5db";
                            e.currentTarget.style.transform = "translateX(0)";
                          }
                        }}
                      >
                        <div className="d-flex align-items-center gap-4">
                          <i
                            className={`fa-solid ${item.icon} fa-fw`}
                            style={{
                              width: "24px",
                              textAlign: "center",
                              fontSize: "1rem",
                              color:
                                isMenuActive || hasActiveSubmenu
                                  ? "white"
                                  : "inherit",
                            }}
                          ></i>
                          <span
                            className={`fw-medium ${isMenuActive || hasActiveSubmenu ? "text-white" : ""}`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <i
                          className={`fa-solid fa-chevron-${openMenus[item.id as keyof typeof openMenus] ? "up" : "down"}`}
                          style={{ fontSize: "0.85rem" }}
                        ></i>
                      </div>

                      {(openMenus[item.id as keyof typeof openMenus] ||
                        hasActiveSubmenu) && (
                        <div className="mt-2 ms-5 ps-3 border-start border-secondary">
                          {item.submenu.map((subItem) => {
                            const isSubItemActive = isSubmenuActive(
                              subItem.href,
                            );

                            return (
                              <Link
                                key={subItem.id}
                                href={subItem.href}
                                className={`d-flex align-items-center gap-4 px-4 py-2.5 rounded text-decoration-none ${isSubItemActive ? "bg-gray-800 text-white" : ""}`}
                                style={{
                                  color: isSubItemActive ? "white" : "#d1d5db",
                                  fontSize: "0.9rem",
                                  transition: "all 0.2s ease",
                                  backgroundColor: isSubItemActive
                                    ? "#4b5563"
                                    : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSubItemActive) {
                                    e.currentTarget.style.backgroundColor =
                                      "#4b5563";
                                    e.currentTarget.style.color = "white";
                                    e.currentTarget.style.transform =
                                      "translateX(4px)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSubItemActive) {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color = "#d1d5db";
                                    e.currentTarget.style.transform =
                                      "translateX(0)";
                                  }
                                }}
                              >
                                <i
                                  className={`fa-solid ${subItem.icon.split(" ")[0]} fa-fw`}
                                  style={{
                                    width: "24px",
                                    fontSize: "0.9rem",
                                    color: subItem.icon.includes("text-")
                                      ? subItem.icon.split(" ")[1]
                                      : isSubItemActive
                                        ? "white"
                                        : "inherit",
                                  }}
                                ></i>
                                <span
                                  className={
                                    isSubItemActive ? "text-white" : ""
                                  }
                                >
                                  {subItem.label}
                                  {isSubItemActive && (
                                    <span className="ms-2">
                                      <i
                                        className="fas fa-circle text-success"
                                        style={{ fontSize: "0.5rem" }}
                                      ></i>
                                    </span>
                                  )}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.submenu[0].href}
                      className={`text-decoration-none d-flex align-items-center justify-content-center gap-3 px-3 py-3 rounded ${isMenuActive ? "bg-success text-white" : ""}`}
                      style={{
                        color: isMenuActive ? "white" : "#d1d5db",
                      }}
                      onMouseEnter={(e) => {
                        if (!isMenuActive) {
                          e.currentTarget.style.backgroundColor = "#374151";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMenuActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#d1d5db";
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon}`}
                        style={{
                          fontSize: "1.1rem",
                          color: isMenuActive ? "white" : "inherit",
                        }}
                      ></i>
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Paramètres (toujours en bas) */}
            {!isCollapsed && (
              <div className="mt-5 pt-4 border-top border-secondary">
                <div
                  className="text-secondary text-uppercase fw-bold px-4 mb-3"
                  style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}
                >
                  Configuration
                </div>
                {settingsItems.map((item) => {
                  const isItemActive = isNavActive(item.id);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`text-decoration-none d-flex align-items-center gap-4 px-4 py-3 rounded ${isItemActive ? "bg-success text-white" : "text-white hover:bg-gray-700"}`}
                      style={{
                        color: isItemActive ? "white" : "#d1d5db",
                        backgroundColor: isItemActive
                          ? "#16a34a"
                          : "transparent",
                        fontSize: "0.95rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isItemActive) {
                          e.currentTarget.style.backgroundColor = "#374151";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isItemActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#d1d5db";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon} fa-fw`}
                        style={{
                          width: "24px",
                          textAlign: "center",
                          fontSize: "1rem",
                          color: isItemActive ? "white" : "inherit",
                        }}
                      ></i>
                      <span
                        className={`fw-medium ${isItemActive ? "text-white" : ""}`}
                      >
                        {item.label}
                        {isItemActive && (
                          <span className="ms-2">
                            <i
                              className="fas fa-circle text-white"
                              style={{ fontSize: "0.5rem" }}
                            ></i>
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info & Footer */}
      <div className="border-top border-secondary p-4">
        {/* Info utilisateur */}
        {!isCollapsed && (
          <div className="d-flex align-items-center gap-4 mb-4 p-3 rounded bg-gray-800">
            <div
              className="rounded-circle overflow-hidden position-relative flex-shrink-0"
              style={{
                width: "52px",
                height: "52px",
                border: "3px solid #16a34a",
              }}
            >
              <img
                src={userAvatar}
                alt={userName}
                width={52}
                height={52}
                className="rounded-circle w-100 h-100 object-fit-cover"
              />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate">{userName}</div>
              <div className="text-secondary small text-truncate mt-1">
                {userEmail}
              </div>
            </div>
          </div>
        )}

        {/* Déconnexion */}
        <Link
          href="/logout"
          className="text-decoration-none d-flex align-items-center gap-4 px-4 py-3 rounded"
          style={{
            color: "#f87171",
            fontSize: "0.95rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#374151";
            e.currentTarget.style.color = "#fca5a5";
            e.currentTarget.style.transform = "translateX(4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ width: "24px", textAlign: "center", fontSize: "1rem" }}
          ></i>
          {!isCollapsed && <span className="fw-medium">Se déconnecter</span>}
        </Link>
      </div>

      <style jsx>{`
        .w-320 {
          width: 320px;
        }
        .w-auto {
          width: 80px;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .overflow-y-auto {
          overflow-y: auto;
          max-height: calc(100vh - 220px);
        }
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bg-gray-800 {
          background-color: #1f2937;
        }

        .active-nav {
          position: relative;
        }

        .active-nav::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 70%;
          background-color: #16a34a;
          border-radius: 0 4px 4px 0;
        }

        /* Scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        @media (max-width: 1400px) {
          .w-320 {
            width: 300px;
          }
        }

        @media (max-width: 1200px) {
          .w-320 {
            width: 280px;
          }
        }

        @media (max-width: 768px) {
          .w-320 {
            width: 260px;
          }
          .w-auto {
            width: 70px;
          }
        }
      `}</style>
    </aside>
  );
}
