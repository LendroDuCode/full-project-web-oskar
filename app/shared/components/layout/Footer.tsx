// components/Footer.tsx
"use client";

import Link from "next/link";
import colors from "../../constants/colors";

const Footer = () => {
  const quickLinks = [
    { label: "Accueil", href: "/" },
    { label: "Parcourir les annonces", href: "/annonces" },
    { label: "Publier une annonce", href: "/publier" },
    { label: "Mes favoris", href: "/favoris" },
    { label: "Mon compte", href: "/compte" },
  ];

  const categories = [
    { label: "Électronique", href: "/categories/electronique" },
    { label: "Vêtements & Chaussures", href: "/categories/vetements" },
    { label: "Éducation & Culture", href: "/categories/education" },
    { label: "Services de proximité", href: "/categories/services" },
  ];

  const supportLinks = [
    { label: "Centre d'aide", href: "/aide" },
    { label: "Conseils de sécurité", href: "/securite" },
    { label: "Nous contacter", href: "/contact" },
    { label: "Conditions d'utilisation", href: "/conditions" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ];

  const socialLinks = [
    { icon: "fa-facebook-f", href: "#", label: "Facebook" },
    { icon: "fa-instagram", href: "#", label: "Instagram" },
    { icon: "fa-whatsapp", href: "#", label: "WhatsApp" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-5 pb-4"
      style={{ backgroundColor: colors.oskar.black }}
    >
      <div className="container">
        <div className="row">
          {/* Logo et description */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div
                className="rounded d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: colors.oskar.green,
                }}
              >
                <span className="text-white fw-bold fs-5">O</span>
              </div>
              <span className="text-white fs-3 fw-bold">OSKAR</span>
            </div>
            <p className="mb-4" style={{ color: "#9CA3AF", lineHeight: "1.6" }}>
              La Plateforme de partage communautaire. Donnez, échangez, vendez.
            </p>

            {/* Réseaux sociaux */}
            <div className="d-flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#374151",
                    color: "white",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }}
                  aria-label={social.label}
                >
                  <i className={`fa-brands ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="h5 fw-bold mb-3" style={{ color: "white" }}>
              Liens rapides
            </h3>
            <ul className="list-unstyled">
              {quickLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <Link
                    href={link.href}
                    className="text-decoration-none"
                    style={{
                      color: "#9CA3AF",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9CA3AF";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="h5 fw-bold mb-3" style={{ color: "white" }}>
              Catégories
            </h3>
            <ul className="list-unstyled">
              {categories.map((category) => (
                <li key={category.label} className="mb-2">
                  <Link
                    href={category.href}
                    className="text-decoration-none"
                    style={{
                      color: "#9CA3AF",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9CA3AF";
                    }}
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="h5 fw-bold mb-3" style={{ color: "white" }}>
              Support
            </h3>
            <ul className="list-unstyled">
              {supportLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <Link
                    href={link.href}
                    className="text-decoration-none"
                    style={{
                      color: "#9CA3AF",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9CA3AF";
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="border-top pt-4 mt-4"
          style={{ borderColor: "#374151 !important" }}
        >
          <div className="row align-items-center">
            <div className="col-md-6 mb-2 mb-md-0">
              <p
                className="mb-0"
                style={{ color: "#9CA3AF", fontSize: "0.875rem" }}
              >
                © {currentYear} OSKAR. Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p
                className="mb-0 d-flex align-items-center justify-content-md-end gap-1"
                style={{ color: "#9CA3AF", fontSize: "0.875rem" }}
              >
                Fait avec
                <i
                  className="fas fa-heart mx-1"
                  style={{ color: colors.oskar.green }}
                ></i>
                en Côte d'Ivoire
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
