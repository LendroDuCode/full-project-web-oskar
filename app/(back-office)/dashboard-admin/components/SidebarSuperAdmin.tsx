"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);
  const [openMenus, setOpenMenus] = useState({
    users: true, // Ouvert par défaut pour meilleure UX
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

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // Auto-collapse sur tablette
      if (window.innerWidth < 1200 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      }

      // Fermer le menu mobile sur passage en desktop
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;
  const isDesktop = windowWidth >= 1200;
  const isLargeDesktop = windowWidth >= 1600;

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

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Fermeture au clic extérieur sur mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-sidebar-toggle")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isMobileOpen]);

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
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

  // Calculer la largeur de la sidebar
  const getSidebarWidth = () => {
    if (isMobile) return "100%";
    if (isCollapsed) return isTablet ? "70px" : "80px";
    if (isLargeDesktop) return "360px";
    if (isDesktop) return "320px";
    if (isTablet) return "280px";
    return "260px";
  };

  return (
    <>
      {/* Bouton toggle mobile */}
      {isMobile && (
        <button
          className="btn btn-success position-fixed mobile-sidebar-toggle d-flex align-items-center justify-content-center shadow-lg"
          onClick={toggleSidebar}
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          style={{
            left: isMobileOpen ? "calc(100% - 60px)" : "16px",
            top: "16px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            zIndex: 1100,
            backgroundColor: "#16a34a",
            border: "none",
            color: "white",
            fontSize: "1.2rem",
            transition: "left 0.3s ease",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
          }}
        >
          <i
            className={`fa-solid ${isMobileOpen ? "fa-times" : "fa-bars"}`}
          ></i>
        </button>
      )}

      {/* Overlay mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        id="sidebar"
        className={`d-flex flex-column text-white position-${isMobile ? "fixed" : "sticky"} top-0`}
        style={{
          width: getSidebarWidth(),
          minHeight: "100vh",
          backgroundColor: "#1f2937",
          zIndex: 1050,
          left: isMobile ? (isMobileOpen ? 0 : "-100%") : 0,
          transition: "width 0.3s ease, left 0.3s ease",
          boxShadow:
            isMobile && isMobileOpen ? "4px 0 20px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {/* Header */}
        <div
          className={`p-${isMobile ? "3" : "4"} border-bottom border-secondary`}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3 gap-lg-4">
              <button
                onClick={handleLogoClick}
                className="btn p-0 border-0 bg-transparent"
                aria-label="Accueil"
                style={{
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width:
                      isCollapsed && !isMobile
                        ? "40px"
                        : isMobile
                          ? "44px"
                          : "48px",
                    height:
                      isCollapsed && !isMobile
                        ? "40px"
                        : isMobile
                          ? "44px"
                          : "48px",
                    backgroundColor: "#16a34a",
                    fontSize:
                      isCollapsed && !isMobile
                        ? "1.1rem"
                        : isMobile
                          ? "1.2rem"
                          : "1.3rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  O
                </div>
              </button>
              {!isCollapsed && !isMobile && (
                <div>
                  <h5
                    className="fw-bold mb-0"
                    style={{ fontSize: isTablet ? "1rem" : "1.2rem" }}
                  >
                    Super Admin
                  </h5>
                  <small
                    className="text-secondary"
                    style={{ fontSize: isTablet ? "0.7rem" : "0.8rem" }}
                  >
                    Plateforme OSKAR
                  </small>
                </div>
              )}
              {isMobile && !isCollapsed && (
                <div>
                  <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
                    Super Admin
                  </h5>
                  <small
                    className="text-secondary"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Plateforme OSKAR
                  </small>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                className="btn btn-link text-secondary p-1"
                onClick={toggleSidebar}
                aria-label={
                  isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"
                }
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
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
                  style={{ fontSize: isTablet ? "0.8rem" : "0.9rem" }}
                ></i>
              </button>
            )}
          </div>
        </div>

        {/* Navigation principale */}
        <div
          className="flex-grow-1 overflow-y-auto"
          style={{
            maxHeight: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 220px)",
          }}
        >
          <div className={`p-${isMobile ? "3" : "4"}`}>
            <div className="d-flex flex-column gap-2">
              {/* Navigation de base */}
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-decoration-none d-flex align-items-center gap-${isCollapsed ? "3" : "4"} px-${isCollapsed ? "2" : "4"} py-${isMobile ? "2" : "3"} rounded ${isNavActive(item.id) ? "bg-success text-white active-nav" : "text-white hover:bg-gray-700"}`}
                  style={{
                    color: isNavActive(item.id) ? "white" : "#d1d5db",
                    backgroundColor: isNavActive(item.id)
                      ? "#16a34a"
                      : "transparent",
                    fontSize: isCollapsed
                      ? "0.8rem"
                      : isMobile
                        ? "0.9rem"
                        : "0.95rem",
                    transition: "all 0.2s ease",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  onClick={() => isMobile && setIsMobileOpen(false)}
                  onMouseEnter={(e) => {
                    if (!isNavActive(item.id)) {
                      e.currentTarget.style.backgroundColor = "#374151";
                      e.currentTarget.style.color = "white";
                      if (!isCollapsed) {
                        e.currentTarget.style.transform = "translateX(4px)";
                      }
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
                    className={`fa-solid ${item.icon}`}
                    style={{
                      width: isCollapsed ? "auto" : "24px",
                      textAlign: "center",
                      fontSize: isCollapsed ? "1.1rem" : "1rem",
                      color: isNavActive(item.id) ? "white" : "inherit",
                    }}
                  ></i>
                  {!isCollapsed && (
                    <>
                      <span className="flex-grow-1 fw-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`badge ${item.badge} rounded-pill ${isNavActive(item.id) ? "bg-white text-dark" : ""}`}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{
                        fontSize: "0.6rem",
                        padding: "0.2rem 0.35rem",
                      }}
                    >
                      {typeof item.badge === "number" && item.badge > 9
                        ? "9+"
                        : item.badge}
                    </span>
                  )}
                </Link>
              ))}

              {/* Séparateur */}
              {!isCollapsed && (
                <div
                  className={`my-${isMobile ? "3" : "4"} px-${isMobile ? "3" : "4"}`}
                >
                  <div
                    className="text-secondary text-uppercase fw-bold"
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      letterSpacing: "0.5px",
                    }}
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
                          className={`d-flex align-items-center justify-content-between px-${isMobile ? "3" : "4"} py-${isMobile ? "2" : "3"} rounded cursor-pointer ${isMenuActive || hasActiveSubmenu ? "bg-gray-800 text-white" : ""}`}
                          style={{
                            color:
                              isMenuActive || hasActiveSubmenu
                                ? "white"
                                : "#d1d5db",
                            cursor: "pointer",
                            fontSize: isMobile ? "0.9rem" : "0.95rem",
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
                              e.currentTarget.style.transform =
                                "translateX(4px)";
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
                          <div className="d-flex align-items-center gap-3 gap-lg-4">
                            <i
                              className={`fa-solid ${item.icon}`}
                              style={{
                                width: "24px",
                                textAlign: "center",
                                fontSize: isMobile ? "0.9rem" : "1rem",
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
                            style={{
                              fontSize: isMobile ? "0.75rem" : "0.85rem",
                            }}
                          ></i>
                        </div>

                        {(openMenus[item.id as keyof typeof openMenus] ||
                          hasActiveSubmenu) && (
                          <div
                            className={`mt-2 ms-${isMobile ? "4" : "5"} ps-${isMobile ? "2" : "3"} border-start border-secondary`}
                          >
                            {item.submenu.map((subItem) => {
                              const isSubItemActive = isSubmenuActive(
                                subItem.href,
                              );

                              return (
                                <Link
                                  key={subItem.id}
                                  href={subItem.href}
                                  className={`d-flex align-items-center gap-3 gap-lg-4 px-${isMobile ? "3" : "4"} py-${isMobile ? "2" : "2.5"} rounded text-decoration-none ${isSubItemActive ? "bg-gray-800 text-white" : ""}`}
                                  style={{
                                    color: isSubItemActive
                                      ? "white"
                                      : "#d1d5db",
                                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                                    transition: "all 0.2s ease",
                                    backgroundColor: isSubItemActive
                                      ? "#4b5563"
                                      : "transparent",
                                  }}
                                  onClick={() =>
                                    isMobile && setIsMobileOpen(false)
                                  }
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
                                    className={`fa-solid ${subItem.icon.split(" ")[0]}`}
                                    style={{
                                      width: "20px",
                                      fontSize: isMobile ? "0.8rem" : "0.9rem",
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
                                          style={{ fontSize: "0.4rem" }}
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
                        onClick={() => isMobile && setIsMobileOpen(false)}
                        onMouseEnter={(e) => {
                          if (!isMenuActive) {
                            e.currentTarget.style.backgroundColor = "#374151";
                            e.currentTarget.style.color = "white";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMenuActive) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#d1d5db";
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <i
                          className={`fa-solid ${item.icon}`}
                          style={{
                            fontSize: isTablet ? "1rem" : "1.1rem",
                            color: isMenuActive ? "white" : "inherit",
                          }}
                        ></i>
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Paramètres */}
              {!isCollapsed && (
                <div
                  className={`mt-${isMobile ? "4" : "5"} pt-${isMobile ? "3" : "4"} border-top border-secondary`}
                >
                  <div
                    className="text-secondary text-uppercase fw-bold px-3 px-lg-4 mb-3"
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Configuration
                  </div>
                  {settingsItems.map((item) => {
                    const isItemActive = isNavActive(item.id);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`text-decoration-none d-flex align-items-center gap-3 gap-lg-4 px-3 px-lg-4 py-2 py-lg-3 rounded ${isItemActive ? "bg-success text-white" : "text-white hover:bg-gray-700"}`}
                        style={{
                          color: isItemActive ? "white" : "#d1d5db",
                          backgroundColor: isItemActive
                            ? "#16a34a"
                            : "transparent",
                          fontSize: isMobile ? "0.9rem" : "0.95rem",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => isMobile && setIsMobileOpen(false)}
                        onMouseEnter={(e) => {
                          if (!isItemActive) {
                            e.currentTarget.style.backgroundColor = "#374151";
                            e.currentTarget.style.color = "white";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isItemActive) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#d1d5db";
                            e.currentTarget.style.transform = "translateX(0)";
                          }
                        }}
                      >
                        <i
                          className={`fa-solid ${item.icon}`}
                          style={{
                            width: "24px",
                            textAlign: "center",
                            fontSize: isMobile ? "0.9rem" : "1rem",
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
                                style={{ fontSize: "0.4rem" }}
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
        <div className="border-top border-secondary p-3 p-lg-4">
          {/* Info utilisateur */}
          {!isCollapsed && (
            <div
              className={`d-flex align-items-center gap-3 gap-lg-4 mb-3 mb-lg-4 p-2 p-lg-3 rounded bg-gray-800`}
            >
              <div
                className="rounded-circle overflow-hidden position-relative flex-shrink-0"
                style={{
                  width: isMobile ? "44px" : isTablet ? "48px" : "52px",
                  height: isMobile ? "44px" : isTablet ? "48px" : "52px",
                  border: `3px solid #16a34a`,
                }}
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="rounded-circle w-100 h-100 object-fit-cover"
                />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold text-truncate"
                  style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                >
                  {userName}
                </div>
                <div
                  className="text-secondary small text-truncate mt-1"
                  style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}
                >
                  {userEmail}
                </div>
              </div>
            </div>
          )}

          {/* Déconnexion */}
          <Link
            href="/logout"
            className={`text-decoration-none d-flex align-items-center gap-3 gap-lg-4 px-3 px-lg-4 py-2 py-lg-3 rounded`}
            style={{
              color: "#f87171",
              fontSize: isMobile ? "0.9rem" : "0.95rem",
              transition: "all 0.2s ease",
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
            onClick={() => isMobile && setIsMobileOpen(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#374151";
              e.currentTarget.style.color = "#fca5a5";
              if (!isCollapsed) {
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <i
              className="fa-solid fa-right-from-bracket"
              style={{
                width: isCollapsed ? "auto" : "24px",
                textAlign: "center",
                fontSize: isCollapsed ? "1.1rem" : "1rem",
              }}
            ></i>
            {!isCollapsed && <span className="fw-medium">Se déconnecter</span>}
          </Link>
        </div>
      </aside>

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
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
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

        /* Responsive breakpoints */
        @media (max-width: 1600px) and (min-width: 1200px) {
          .w-320 {
            width: 300px;
          }
        }

        @media (max-width: 1199px) and (min-width: 768px) {
          .w-320 {
            width: 280px;
          }
          .w-auto {
            width: 70px;
          }
        }

        @media (max-width: 767px) {
          .position-fixed {
            position: fixed !important;
          }
        }

        /* Animations */
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}
