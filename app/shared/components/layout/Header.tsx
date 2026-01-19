// app/shared/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { FC, useState, useRef, useEffect } from "react";
import colors from "../../constants/colors";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";

interface NavLink {
  name: string;
  href: string;
  exact?: boolean;
}

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
}

const Header: FC = () => {
  const pathname = usePathname();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemsCount] = useState(3);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false); // État pour le modal
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, user, logout, openLoginModal } = useAuth();

  // Récupérer les catégories depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.LIST);

        // Filtrer les catégories actives
        const activeCategories = response.data.filter(
          (category: any) =>
            !category.is_deleted && category.deleted_at === null,
        );

        // Dédupliquer par libellé (au cas où il y aurait des doublons)
        const uniqueCategories = activeCategories.reduce(
          (acc: Category[], category: any) => {
            const exists = acc.find(
              (cat: Category) => cat.libelle === category.libelle,
            );
            if (!exists) {
              acc.push({
                uuid: category.uuid,
                libelle: category.libelle,
                slug: category.slug,
                type: category.type,
                description: category.description,
                image: category.image,
              });
            }
            return acc;
          },
          [] as Category[],
        );

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        // En cas d'erreur, définir un tableau vide
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Vérifier si nous sommes sur un dashboard
  const isDashboardPage = pathname.startsWith("/dashboard-");

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-menu-toggle")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Si nous sommes sur un dashboard, ne pas afficher le header normal
  if (isDashboardPage) {
    return null;
  }

  // Générer les liens de navigation à partir des catégories
  const generateNavLinks = (): NavLink[] => {
    // Commencer avec les liens fixes
    const links: NavLink[] = [
      { name: "Accueil", href: "/", exact: true },
      { name: "Don & Échange", href: "/dons-echanges" },
    ];

    // Ajouter les catégories dynamiques si elles sont chargées
    if (!loadingCategories && categories.length > 0) {
      categories.forEach((category) => {
        // Mapper les libellés vers vos routes existantes
        const routeMap: Record<string, string> = {
          "Vêtements & Chaussures": "/vetements-chaussures",
          "Éducation & Culture": "/education-culture",
          Électronique: "/electroniques",
          "Services de proximité": "/services-proximite",
          Autre: "/autres",
        };

        const href = routeMap[category.libelle] || "/";
        if (href !== "/") {
          links.push({
            name: category.libelle,
            href: href,
            exact: false,
          });
        }
      });
    } else {
      // Pendant le chargement ou en cas d'erreur, utiliser les routes par défaut
      const defaultLinks = [
        { name: "Vêtements & Chaussures", href: "/vetements-chaussures" },
        { name: "Éducation & Culture", href: "/education-culture" },
        { name: "Électronique", href: "/electroniques" },
        { name: "Services de proximité", href: "/services-proximite" },
        { name: "Autre", href: "/autres" },
      ];

      defaultLinks.forEach((link) => {
        if (!links.some((l) => l.href === link.href)) {
          links.push(link);
        }
      });
    }

    return links;
  };

  const navLinks = generateNavLinks();

  const isLinkActive = (link: NavLink) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  const getLinkColor = (link: NavLink) => {
    if (isLinkActive(link)) {
      return colors.oskar.black;
    }
    return colors.oskar.grey;
  };

  // Fonction pour ouvrir le modal de publication
  const handlePublishClick = () => {
    if (!isLoggedIn) {
      setShowPublishModal(true);
      return;
    }
    setShowPublishModal(true);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Fonction pour fermer le modal de publication
  const handleClosePublishModal = () => {
    setShowPublishModal(false);
  };

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user) return "U";

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <>
      <header
        className="bg-white shadow-sm sticky-top"
        style={{ zIndex: 1000 }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-2 py-md-3">
            {/* Logo et Bouton Menu Mobile */}
            <div className="d-flex align-items-center">
              {/* Bouton Menu Mobile */}
              <button
                className="btn btn-link border-0 p-0 me-3 d-lg-none mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                type="button"
                style={{
                  color: colors.oskar.grey,
                  fontSize: "1.25rem",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className={`fa-solid ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}
                  style={{ color: "inherit" }}
                ></i>
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="d-flex align-items-center text-decoration-none"
                aria-label="Accueil OSKAR"
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "clamp(36px, 8vw, 40px)",
                    height: "clamp(36px, 8vw, 40px)",
                    backgroundColor: colors.oskar.green,
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.greenHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold d-none d-sm-block"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "clamp(1.25rem, 5vw, 2rem)",
                  }}
                >
                  OSKAR
                </span>
              </Link>

              {/* Navigation Desktop */}
              <nav className="d-none d-lg-flex align-items-center ms-4 ms-xl-5">
                {navLinks.map((link, index) => (
                  <Link
                    key={`${link.name}-${index}`}
                    href={link.href}
                    className="text-decoration-none mx-2 mx-xl-3 position-relative"
                    style={{
                      transition: "color 0.3s",
                      color: getLinkColor(link),
                      fontWeight: isLinkActive(link) ? "600" : "400",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getLinkColor(link);
                    }}
                  >
                    {link.name}
                    {isLinkActive(link) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          left: "0",
                          width: "100%",
                          height: "2px",
                          backgroundColor: colors.oskar.green,
                          borderRadius: "2px",
                        }}
                      />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions Desktop */}
            <div className="d-none d-lg-flex align-items-center">
              {/* Icône Panier */}
              <Link href="/panier">
                <button
                  className="btn btn-link border-0 position-relative me-3"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.1rem",
                    color:
                      pathname === "/panier"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      pathname === "/panier"
                        ? colors.oskar.green
                        : colors.oskar.grey;
                  }}
                  aria-label="Panier"
                  type="button"
                >
                  <i className="fa-solid fa-shopping-cart"></i>
                  {cartItemsCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{
                        backgroundColor: colors.oskar.orange || "#ff6b35",
                        color: "white",
                        fontSize: "0.6rem",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        fontWeight: "bold",
                        transform: "translate(-30%, -25%)",
                      }}
                    >
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Icône Contact */}
              <Link href="/contact">
                <button
                  className="btn btn-link border-0 me-3"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.1rem",
                    color:
                      pathname === "/contact"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      pathname === "/contact"
                        ? colors.oskar.green
                        : colors.oskar.grey;
                  }}
                  aria-label="Contact"
                  type="button"
                >
                  <i className="fa-solid fa-phone"></i>
                </button>
              </Link>

              {/* Icône Favoris */}
              <Link href="/liste-favoris">
                <button
                  className="btn btn-link border-0 me-4"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.1rem",
                    color:
                      pathname === "/liste-favoris"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      pathname === "/liste-favoris"
                        ? colors.oskar.green
                        : colors.oskar.grey;
                  }}
                  aria-label="Favoris"
                  type="button"
                >
                  <i className="fa-solid fa-heart"></i>
                </button>
              </Link>

              {/* Compte utilisateur */}
              {isLoggedIn && user ? (
                <div
                  className="dropdown"
                  ref={dropdownRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-link border-0 d-flex align-items-center text-decoration-none p-0"
                    style={{
                      color: colors.oskar.grey,
                      transition: "color 0.3s",
                      background: "none",
                    }}
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.oskar.grey;
                    }}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getUserInitials()}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        minWidth: "240px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <div className="p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: colors.oskar.green,
                              color: "white",
                              fontSize: "1rem",
                              fontWeight: "bold",
                            }}
                          >
                            {getUserInitials()}
                          </div>
                          <div>
                            <h6
                              className="fw-bold mb-0"
                              style={{ fontSize: "0.95rem" }}
                            >
                              {user.firstName} {user.lastName}
                            </h6>
                            {user.email && (
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {user.email}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/mon-compte"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="fa-solid fa-user me-3 text-muted"></i>
                          <span>Mon compte</span>
                        </Link>
                        <Link
                          href="/mes-annonces"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="fa-solid fa-newspaper me-3 text-muted"></i>
                          <span>Mes annonces</span>
                        </Link>
                        <Link
                          href="/messages"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="fa-solid fa-envelope me-3 text-muted"></i>
                          <span>Messages</span>
                        </Link>
                        <div className="dropdown-divider my-2"></div>
                        <button
                          className="dropdown-item d-flex align-items-center py-2 text-danger"
                          onClick={handleLogout}
                          type="button"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <i className="fa-solid fa-right-from-bracket me-3"></i>
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-link border-0"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.1rem",
                    color: colors.oskar.grey,
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Se connecter"
                  onClick={openLoginModal}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.oskar.grey;
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-user"></i>
                </button>
              )}

              {/* Bouton Publier */}
              <button
                className="btn d-flex align-items-center ms-4"
                style={{
                  backgroundColor:
                    hoveredButton === "publish"
                      ? colors.oskar.greenHover
                      : colors.oskar.orange,
                  color: "white",
                  padding: "0.5rem 1.25rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  transition: "background-color 0.3s",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={() => setHoveredButton("publish")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="Publier une annonce"
                onClick={handlePublishClick}
                type="button"
              >
                <i className="fa-solid fa-plus me-2"></i>
                <span>Publier</span>
              </button>
            </div>

            {/* Actions Mobile */}
            <div className="d-flex d-lg-none align-items-center">
              <Link href="/panier">
                <button
                  className="btn btn-link border-0 me-2"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "1.1rem",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Panier"
                  type="button"
                >
                  <i className="fa-solid fa-shopping-cart"></i>
                  {cartItemsCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{
                        backgroundColor: colors.oskar.orange || "#ff6b35",
                        color: "white",
                        fontSize: "0.55rem",
                        minWidth: "16px",
                        height: "16px",
                        transform: "translate(-30%, -25%)",
                      }}
                    >
                      {cartItemsCount > 9 ? "9+" : cartItemsCount}
                    </span>
                  )}
                </button>
              </Link>

              <button
                className="btn ms-2"
                style={{
                  backgroundColor: colors.oskar.green,
                  color: "white",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  border: "none",
                  minWidth: "auto",
                }}
                onClick={handlePublishClick}
                aria-label="Publier"
                type="button"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          {/* Navigation Mobile */}
          <div className="d-lg-none border-top">
            <div className="scrollable-nav py-2">
              <div
                className="d-flex overflow-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {navLinks.map((link, index) => (
                  <Link
                    key={`${link.name}-${index}`}
                    href={link.href}
                    className={`text-decoration-none px-3 py-1 ${isLinkActive(link) ? "fw-semibold" : ""}`}
                    style={{
                      color: isLinkActive(link)
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      whiteSpace: "nowrap",
                      borderBottom: isLinkActive(link)
                        ? `2px solid ${colors.oskar.green}`
                        : "2px solid transparent",
                      fontSize: "0.85rem",
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 999 }}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
            style={{
              width: "min(85%, 320px)",
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center">
                <div
                  className="rounded d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: colors.oskar.green,
                  }}
                >
                  <span className="text-white fw-bold fs-5">O</span>
                </div>
                <span
                  className="fs-5 fw-bold"
                  style={{ color: colors.oskar.black }}
                >
                  OSKAR
                </span>
              </div>
              <button
                className="btn btn-link p-0"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                type="button"
              >
                <i
                  className="fa-solid fa-times fs-4"
                  style={{ color: colors.oskar.grey }}
                ></i>
              </button>
            </div>

            <div className="p-2">
              {navLinks.map((link, index) => (
                <Link
                  key={`${link.name}-${index}`}
                  href={link.href}
                  className={`d-flex align-items-center py-3 px-3 text-decoration-none`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: isLinkActive(link)
                      ? colors.oskar.green
                      : colors.oskar.grey,
                    borderLeft: isLinkActive(link)
                      ? `4px solid ${colors.oskar.green}`
                      : "4px solid transparent",
                  }}
                >
                  <span className={isLinkActive(link) ? "fw-semibold" : ""}>
                    {link.name}
                  </span>
                </Link>
              ))}

              {/* Bouton Publier dans le menu mobile */}
              <div className="p-3 mt-3">
                <button
                  className="btn w-100 py-3"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    handlePublishClick();
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-plus me-2"></i>
                  Publier une annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de publication d'annonce */}
      <PublishAdModal
        visible={showPublishModal}
        onHide={handleClosePublishModal}
        isLoggedIn={isLoggedIn}
        onLoginRequired={() => {
          handleClosePublishModal();
          openLoginModal();
        }}
      />
    </>
  );
};

export default Header;
