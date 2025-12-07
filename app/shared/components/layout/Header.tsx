// app/shared/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { FC, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "../../constants/colors";
import { usePathname } from "next/navigation";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import LoginModal from "@/app/(front-office)/auth/login/page";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";

interface NavLink {
  name: string;
  href: string;
  exact?: boolean;
}

const Header: FC = () => {
  const pathname = usePathname();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Charger l'état de connexion au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem("oskar_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUserData(user);
    }
  }, []);

  // Mettez à jour les liens pour correspondre à votre structure
  const navLinks: NavLink[] = [
    { name: "Accueil", href: "/", exact: true },
    { name: "Don & Échange", href: "/dons-echanges" },
    { name: "Vêtements & Chaussures", href: "/vetements-chaussures" },
    { name: "Électronique", href: "/electroniques" },
    { name: "Éducation & Culture", href: "/education-culture" },
    { name: "Services de proximité", href: "/services-proximite" },
  ];

  // Fonction pour déterminer si un lien est actif
  const isLinkActive = (link: NavLink) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  // Fonction pour obtenir la couleur du lien
  const getLinkColor = (link: NavLink) => {
    if (isLinkActive(link)) {
      return colors.oskar.black;
    }
    return colors.oskar.grey;
  };

  // Gestion de la connexion réussie
  const handleLoginSuccess = (userData: {
    firstName: string;
    lastName: string;
  }) => {
    setIsLoggedIn(true);
    setUserData(userData);
    setLoginModalVisible(false);

    // Sauvegarder dans localStorage
    localStorage.setItem("oskar_user", JSON.stringify(userData));
  };

  // Gestion de la déconnexion
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("oskar_user");
    setDropdownOpen(false);
  };

  // Gestion du basculement vers l'inscription
  const handleSwitchToRegister = () => {
    setLoginModalVisible(false);
    // Redirection vers la page d'inscription
    window.location.href = "/inscription";
  };

  // Ouvrir la modal de publication
  const handlePublishClick = () => {
    if (isLoggedIn) {
      setPublishModalVisible(true);
    } else {
      setLoginModalVisible(true);
    }
  };

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className="bg-white shadow-sm sticky-top"
        style={{ zIndex: 1000 }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center">
              {/* Logo */}
              <Link
                href="/"
                className="d-flex align-items-center text-decoration-none me-5"
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "40px",
                    height: "40px",
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
                  <span className="text-white fw-bold fs-5">O</span>
                </div>
                <span
                  className="fs-3 fw-bold"
                  style={{ color: colors.oskar.black }}
                >
                  OSKAR
                </span>
              </Link>

              {/* Navigation Desktop */}
              <nav className="d-none d-lg-flex align-items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-decoration-none mx-3 position-relative"
                    style={{
                      transition: "color 0.3s",
                      color: getLinkColor(link),
                      fontWeight: isLinkActive(link) ? "600" : "400",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getLinkColor(link);
                    }}
                  >
                    {link.name}
                    {/* Indicateur visuel pour le lien actif */}
                    {isLinkActive(link) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-5px",
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

            {/* Actions */}
            <div className="d-flex align-items-center">
              {/* Icône Téléphone/Contact */}
              <Link href="/contact" passHref>
                <button
                  className="btn btn-link border-0 me-3 position-relative"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.25rem",
                    color:
                      pathname === "/contact"
                        ? colors.oskar.green
                        : colors.oskar.grey,
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
                >
                  <i className="fa-solid fa-phone"></i>
                  {pathname === "/contact" && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-5px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "4px",
                        height: "4px",
                        backgroundColor: colors.oskar.green,
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </button>
              </Link>

              {/* Icône Favoris */}
              <Link href="/liste-favoris" passHref>
                <button
                  className="btn btn-link border-0 me-3 position-relative"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.25rem",
                    color:
                      pathname === "/liste-favoris"
                        ? colors.oskar.green
                        : colors.oskar.grey,
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
                >
                  <i className="fa-regular fa-heart"></i>
                  {pathname === "/liste-favoris" && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-5px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "4px",
                        height: "4px",
                        backgroundColor: colors.oskar.green,
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </button>
              </Link>

              {/* Icône Compte/Login - Ouvre la modal */}
              {isLoggedIn && userData ? (
                <div
                  className="dropdown me-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-link border-0 d-flex align-items-center text-decoration-none"
                    style={{
                      color: colors.oskar.grey,
                      transition: "color 0.3s",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.oskar.grey;
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                      }}
                    >
                      {userData.firstName?.charAt(0)}
                      {userData.lastName?.charAt(0)}
                    </div>
                    <span className="d-none d-md-inline">
                      {userData.firstName}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-down ms-1 small ${dropdownOpen ? "rotate-180" : ""}`}
                    ></i>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        minWidth: "200px",
                        position: "absolute",
                        inset: "0px auto auto 0px",
                        margin: "0px",
                        transform: "translate(-100px, 40px)",
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
                            {userData.firstName?.charAt(0)}
                            {userData.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">
                              {userData.firstName} {userData.lastName}
                            </h6>
                            <small className="text-muted">
                              {userData.email || "utilisateur@exemple.com"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/mon-compte"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="fa-regular fa-user me-3 text-muted"></i>
                          <span>Mon compte</span>
                        </Link>
                        <Link
                          href="/mes-annonces"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="fa-regular fa-newspaper me-3 text-muted"></i>
                          <span>Mes annonces</span>
                        </Link>
                        <Link
                          href="/messages"
                          className="dropdown-item d-flex align-items-center py-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="fa-regular fa-envelope me-3 text-muted"></i>
                          <span>Messages</span>
                        </Link>
                        <div className="dropdown-divider my-2"></div>
                        <button
                          className="dropdown-item d-flex align-items-center py-2 text-danger"
                          onClick={handleLogout}
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
                  className="btn btn-link border-0 me-4 position-relative"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1.25rem",
                    color: colors.oskar.grey,
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  aria-label="Se connecter"
                  onClick={() => setLoginModalVisible(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.oskar.grey;
                  }}
                >
                  <i className="fa-regular fa-user"></i>
                </button>
              )}

              {/* Bouton Publier une annonce - CORRIGÉ : Ouvre bien la modal */}
              <button
                className="btn d-flex align-items-center"
                style={{
                  backgroundColor:
                    hoveredButton === "publish"
                      ? colors.oskar.greenHover
                      : colors.oskar.green,
                  color: "white",
                  padding: "10px 24px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={() => setHoveredButton("publish")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="Publier une annonce"
                onClick={handlePublishClick}
              >
                <i className="fa-solid fa-plus me-2"></i>
                <span className="d-none d-sm-inline">Publier une Annonce</span>
                <span className="d-inline d-sm-none">Publier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Mobile */}
        <div className="d-lg-none border-top">
          <div className="container">
            <div className="scrollable-nav py-2">
              <div className="d-flex overflow-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-decoration-none px-3 py-2 ${isLinkActive(link) ? "fw-semibold" : ""}`}
                    style={{
                      color: isLinkActive(link)
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      whiteSpace: "nowrap",
                      borderBottom: isLinkActive(link)
                        ? `2px solid ${colors.oskar.green}`
                        : "2px solid transparent",
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

      {/* Modal de connexion */}
      {loginModalVisible && (
        <LoginModal
          visible={loginModalVisible}
          onHide={() => setLoginModalVisible(false)}
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Modal de publication d'annonce */}
      {publishModalVisible && (
        <PublishAdModal
          visible={publishModalVisible}
          onHide={() => setPublishModalVisible(false)}
          isLoggedIn={isLoggedIn}
          onLoginRequired={() => {
            setPublishModalVisible(false);
            setLoginModalVisible(true);
          }}
        />
      )}

      <style jsx>{`
        .rotate-180 {
          transform: rotate(180deg);
          transition: transform 0.3s ease;
        }

        .scrollable-nav {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .scrollable-nav::-webkit-scrollbar {
          display: none;
        }

        .dropdown-menu {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
