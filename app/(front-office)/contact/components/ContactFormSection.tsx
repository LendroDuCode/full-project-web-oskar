"use client";

import { useState, useRef, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faTag,
  faChevronDown,
  faCloudArrowUp,
  faPaperPlane,
  faBuilding,
  faLocationDot,
  faClock,
  faGlobe,
  faHeadset,
  faBriefcase,
  faShieldHalved,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import colors from "@/app/shared/constants/colors";

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  priority: "low" | "medium" | "high";
  message: string;
  attachments: File[];
  privacyConsent: boolean;
  newsletterConsent: boolean;
}

interface Department {
  id: number;
  name: string;
  email: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface SocialMedia {
  id: number;
  name: string;
  icon: any;
  url: string;
}

export default function ContactFormSection() {
  // États du formulaire
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    priority: "medium",
    message: "",
    attachments: [],
    privacyConsent: false,
    newsletterConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sujets disponibles
  const subjects = [
    "Sélectionnez un sujet",
    "Demande générale",
    "Support technique",
    "Problème de compte",
    "Paiement & Facturation",
    "Signaler une annonce",
    "Problèmes de sécurité",
    "Opportunités de partenariat",
    "Retours & Suggestions",
    "Autre",
  ];

  // Départements
  const departments: Department[] = [
    {
      id: 1,
      name: "Support client",
      email: "support@oskar.ci",
      icon: faHeadset,
      color: colors.oskar.blue,
      bgColor: "bg-primary bg-opacity-10",
    },
    {
      id: 2,
      name: "Affaires & Partenariats",
      email: "business@oskar.ci",
      icon: faBriefcase,
      color: colors.oskar.green,
      bgColor: "bg-success bg-opacity-10",
    },
    {
      id: 3,
      name: "Sécurité & Confiance",
      email: "safety@oskar.ci",
      icon: faShieldHalved,
      color: "#EF4444",
      bgColor: "bg-danger bg-opacity-10",
    },
    {
      id: 4,
      name: "Presse & Médias",
      email: "press@oskar.ci",
      icon: faNewspaper,
      color: "#9333EA",
      bgColor: "bg-purple bg-opacity-10",
    },
  ];

  // Réseaux sociaux
  const socialMedia: SocialMedia[] = [
    { id: 1, name: "Facebook", icon: faFacebook, url: "https://facebook.com" },
    {
      id: 2,
      name: "Instagram",
      icon: faInstagram,
      url: "https://instagram.com",
    },
    { id: 3, name: "Twitter", icon: faTwitter, url: "https://twitter.com" },
    { id: 4, name: "LinkedIn", icon: faLinkedin, url: "https://linkedin.com" },
  ];

  // Gestion des changements de formulaire
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "message") {
      setMessageLength(value.length);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePrioritySelect = (priority: "low" | "medium" | "high") => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.privacyConsent) {
      alert("Vous devez accepter la politique de confidentialité");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Formulaire soumis:", formData);
      setSubmitSuccess(true);

      // Réinitialiser le formulaire
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        priority: "medium",
        message: "",
        attachments: [],
        privacyConsent: false,
        newsletterConsent: false,
      });
      setMessageLength(0);

      // Cacher le message de succès après 5 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form-section" className="py-5 py-lg-6 bg-light">
      <div className="container">
        <div className="row g-4 g-lg-5">
          {/* Formulaire de contact */}
          <div className="col-lg-7">
            <div className="bg-white rounded-3 shadow-lg p-4 p-md-5">
              <div className="mb-4 mb-md-5">
                <h2 className="h1 fw-bold text-dark mb-3">
                  Envoyez-nous un message
                </h2>
                <p className="lead text-muted">
                  Remplissez le formulaire ci-dessous et nous vous répondrons
                  dans les plus brefs délais
                </p>
              </div>

              {submitSuccess && (
                <div
                  className="alert alert-success alert-dismissible fade show mb-4"
                  role="alert"
                >
                  <i className="fa-solid fa-check-circle me-2"></i>
                  Votre message a été envoyé avec succès ! Nous vous répondrons
                  sous 24 heures.
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSubmitSuccess(false)}
                  ></button>
                </div>
              )}

              <form id="contact-form" onSubmit={handleSubmit}>
                {/* Nom complet */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    Nom complet *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faUser} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="form-control py-3 border-start-0"
                      placeholder="Entrez votre nom complet"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email et téléphone */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      Adresse email *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="text-muted"
                        />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control py-3 border-start-0"
                        placeholder="votre@email.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      Numéro de téléphone
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="text-muted"
                        />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control py-3 border-start-0"
                        placeholder="+225 XX XX XX XX XX"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Sujet */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    Sujet *
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faTag} className="text-muted" />
                    </span>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="form-select py-3 border-start-0"
                      required
                      disabled={isSubmitting}
                    >
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priorité */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-3">
                    Niveau de priorité
                  </label>
                  <div className="row g-3">
                    {[
                      { level: "low", color: "success", label: "Faible" },
                      { level: "medium", color: "warning", label: "Moyenne" },
                      { level: "high", color: "danger", label: "Élevée" },
                    ].map((item) => (
                      <div key={item.level} className="col-md-4">
                        <div
                          className={`card border-2 cursor-pointer h-100 ${
                            formData.priority === item.level
                              ? `border-${item.color} bg-${item.color} bg-opacity-10`
                              : "border-light"
                          }`}
                          onClick={() =>
                            !isSubmitting &&
                            handlePrioritySelect(item.level as any)
                          }
                          style={{
                            cursor: isSubmitting ? "default" : "pointer",
                          }}
                        >
                          <div className="card-body text-center p-3">
                            <div className={`text-${item.color} mb-2`}>
                              <i className="fa-solid fa-circle fs-5"></i>
                            </div>
                            <p className="small fw-semibold text-dark mb-0">
                              {item.label}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-control py-3"
                    rows={5}
                    placeholder="Veuillez fournir autant de détails que possible concernant votre demande..."
                    required
                    disabled={isSubmitting}
                    minLength={20}
                    maxLength={1000}
                  ></textarea>
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">Minimum 20 caractères</small>
                    <small className="text-muted">{messageLength}/1000</small>
                  </div>
                </div>

                {/* Pièces jointes */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    Pièces jointes (Optionnel)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    onChange={handleFileUpload}
                    multiple
                    disabled={isSubmitting}
                  />
                  <div
                    className="border-2 border-dashed border-light rounded-3 p-4 text-center cursor-pointer"
                    onClick={isSubmitting ? undefined : triggerFileInput}
                    style={{
                      cursor: isSubmitting ? "default" : "pointer",
                      backgroundColor: isSubmitting ? "#f8f9fa" : "white",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCloudArrowUp}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="fw-medium text-dark mb-1">
                      Cliquez pour télécharger ou glisser-déposer
                    </p>
                    <p className="small text-muted mb-0">
                      PNG, JPG, PDF jusqu'à 10MB
                    </p>
                  </div>

                  {/* Aperçu des fichiers */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="small text-muted mb-2">
                        {formData.attachments.length} fichier(s) joint(s)
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="badge bg-light text-dark d-flex align-items-center gap-2"
                          >
                            <i className="fa-solid fa-paperclip"></i>
                            <span className="small">{file.name}</span>
                            <button
                              type="button"
                              className="btn-close btn-close-sm"
                              onClick={() => removeAttachment(index)}
                              disabled={isSubmitting}
                            ></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Consentements */}
                <div className="mb-4">
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      id="privacy-consent"
                      name="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={handleCheckboxChange}
                      className="form-check-input"
                      required
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="privacy-consent"
                      className="form-check-label small"
                    >
                      J'accepte la{" "}
                      <a
                        href="/politique-confidentialite"
                        className="text-decoration-none"
                        style={{ color: colors.oskar.green }}
                      >
                        Politique de confidentialité
                      </a>{" "}
                      d'OSKAR et consens au traitement de mes données
                      personnelles à des fins de support
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="newsletter-consent"
                      name="newsletterConsent"
                      checked={formData.newsletterConsent}
                      onChange={handleCheckboxChange}
                      className="form-check-input"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="newsletter-consent"
                      className="form-check-label small"
                    >
                      Je souhaite recevoir des mises à jour, astuces et offres
                      promotionnelles d'OSKAR
                    </label>
                  </div>
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  className="btn w-100 py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.green,
                    fontSize: "1.1rem",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Envoyer le message
                    </>
                  )}
                </button>

                <p className="text-center text-muted small mt-3">
                  Nous répondons généralement dans les 24 heures pendant les
                  jours ouvrables
                </p>
              </form>
            </div>
          </div>

          {/* Barre latérale d'informations */}
          <div className="col-lg-5">
            {/* Informations du bureau */}
            <div className="bg-white rounded-3 shadow-lg p-4 p-md-5 mb-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: colors.oskar.green,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-white fs-4"
                  />
                </div>
                <h3 className="h3 fw-bold text-dark mb-0">Notre bureau</h3>
              </div>

              <div className="vstack gap-4">
                <div className="d-flex gap-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-muted mt-1"
                    style={{ color: colors.oskar.green }}
                  />
                  <div>
                    <p className="fw-semibold text-dark mb-1">Adresse</p>
                    <p className="text-muted mb-0">Rue des Jardins, Cocody</p>
                    <p className="text-muted mb-0">Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-muted mt-1"
                    style={{ color: colors.oskar.green }}
                  />
                  <div>
                    <p className="fw-semibold text-dark mb-1">
                      Heures d'ouverture
                    </p>
                    <p className="text-muted mb-0">
                      Lundi - Vendredi: 8h00 - 18h00
                    </p>
                    <p className="text-muted mb-0">Samedi: 9h00 - 15h00</p>
                    <p className="text-muted mb-0">Dimanche: Fermé</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="text-muted mt-1"
                    style={{ color: colors.oskar.green }}
                  />
                  <div>
                    <p className="fw-semibold text-dark mb-1">Site web</p>
                    <a
                      href="https://oskar.ci"
                      className="text-decoration-none"
                      style={{ color: colors.oskar.green }}
                    >
                      www.oskar.ci
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Départements */}
            <div className="bg-white rounded-3 shadow-lg p-4 p-md-5 mb-4">
              <h3 className="h3 fw-bold text-dark mb-4">Départements</h3>

              <div className="vstack gap-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="d-flex gap-3 pb-3 border-bottom"
                  >
                    <div
                      className={`rounded d-flex align-items-center justify-content-center flex-shrink-0 ${dept.bgColor}`}
                      style={{ width: "48px", height: "48px" }}
                    >
                      <FontAwesomeIcon
                        icon={dept.icon}
                        style={{ color: dept.color }}
                      />
                    </div>
                    <div>
                      <p className="fw-semibold text-dark mb-1">{dept.name}</p>
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-decoration-none small"
                        style={{ color: colors.oskar.green }}
                      >
                        {dept.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div
              className="rounded-3 shadow-lg p-4 p-md-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)`,
              }}
            >
              <h3 className="h3 fw-bold mb-3">Connectez-vous avec nous</h3>
              <p className="opacity-90 mb-4">
                Suivez-nous sur les réseaux sociaux pour des mises à jour,
                astuces et histoires communautaires
              </p>

              <div className="row g-3">
                {socialMedia.map((social) => (
                  <div key={social.id} className="col-6">
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.2)";
                      }}
                    >
                      <FontAwesomeIcon icon={social.icon} className="fs-4" />
                      <span className="fw-semibold">{social.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
