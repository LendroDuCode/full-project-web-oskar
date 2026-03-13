"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCheck,
  faSpinner,
  faTimes,
  faInfoCircle,
  faImage,
  faStore,
  faFileAlt,
  faClipboardCheck,
  faTag,
  faPalette,
  faSyncAlt,
  faUndo,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types harmonisés avec ceux de la page
interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string | null;
  image_key?: string;
  statut: string;
}

interface Boutique {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key: string | null;
  banniere_key: string | null;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  vendeurUuid: string;
  agentUuid: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
}

interface EditBoutiqueModalProps {
  show: boolean;
  boutique: Boutique | null;
  loading: boolean;
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
}

const EditBoutiqueModal = ({
  show,
  boutique,
  loading,
  onClose,
  onUpdate,
}: EditBoutiqueModalProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    type_boutique_uuid: "",
    description: "",
    logo: null as File | null,
    banniere: null as File | null,
    politique_retour: "",
    conditions_utilisation: "",
  });

  const [typesBoutique, setTypesBoutique] = useState<TypeBoutique[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannierePreview, setBannierePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOriginalLogo, setShowOriginalLogo] = useState(true);
  const [showOriginalBanniere, setShowOriginalBanniere] = useState(true);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fonction pour construire l'URL d'une image
  const buildImageUrl = (imagePath: string | null): string | null => {
    if (!imagePath) return null;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
    const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

    // Déjà une URL complète
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      if (imagePath.includes("localhost")) {
        const productionUrl = apiUrl.replace(/\/api$/, "");
        return imagePath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
      }
      return imagePath;
    }

    // Chemin simple
    return `${apiUrl}${filesUrl}/${imagePath}`;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banniere",
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          [type]: "L'image ne doit pas dépasser 5MB",
        });
        return;
      }

      // Validation du type
      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          [type]: "Veuillez sélectionner une image valide",
        });
        return;
      }

      setErrors({ ...errors, [type]: "" });

      if (type === "logo") {
        setFormData({ ...formData, logo: file });
        setLogoPreview(URL.createObjectURL(file));
        setShowOriginalLogo(false);
      } else {
        setFormData({ ...formData, banniere: file });
        setBannierePreview(URL.createObjectURL(file));
        setShowOriginalBanniere(false);
      }
    }
  };

  const fetchTypesBoutique = async () => {
    try {
      setLoadingTypes(true);
      console.log("📥 Chargement des types de boutique...");
      const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.LIST);

      // Gestion flexible du format de réponse
      let types: TypeBoutique[] = [];

      if (Array.isArray(response)) {
        types = response;
      } else if (response && Array.isArray(response.data)) {
        types = response.data;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        types = response.data.data;
      }

      console.log(`📊 ${types.length} type(s) chargé(s)`);
      setTypesBoutique(types);
    } catch (error: any) {
      console.error("❌ Erreur chargement types boutique:", error);
      setErrors({
        types: "Erreur lors du chargement des types de boutique",
      });
      setTypesBoutique([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const resetToOriginalImage = (type: "logo" | "banniere") => {
    if (type === "logo") {
      setFormData({ ...formData, logo: null });
      setLogoPreview(boutique?.logo ? buildImageUrl(boutique.logo) : null);
      setShowOriginalLogo(true);
    } else {
      setFormData({ ...formData, banniere: null });
      setBannierePreview(
        boutique?.banniere ? buildImageUrl(boutique.banniere) : null,
      );
      setShowOriginalBanniere(true);
    }
    setErrors({ ...errors, [type]: "" });
  };

  const resetForm = () => {
    if (boutique) {
      setFormData({
        nom: boutique.nom,
        type_boutique_uuid: boutique.type_boutique_uuid,
        description: boutique.description || "",
        logo: null,
        banniere: null,
        politique_retour: boutique.politique_retour || "",
        conditions_utilisation: boutique.conditions_utilisation || "",
      });
      setLogoPreview(boutique.logo ? buildImageUrl(boutique.logo) : null);
      setBannierePreview(
        boutique.banniere ? buildImageUrl(boutique.banniere) : null,
      );
      setShowOriginalLogo(true);
      setShowOriginalBanniere(true);
      setErrors({});
    }
  };

  // Nettoyer les URLs blob
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannierePreview && bannierePreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannierePreview);
      }
    };
  }, [logoPreview, bannierePreview]);

  useEffect(() => {
    if (show) {
      fetchTypesBoutique();
      resetForm();
    }
  }, [show, boutique]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.type_boutique_uuid) newErrors.type = "Le type est requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log("✏️ Envoi des modifications...");
      await onUpdate(formData);
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
    }
  };

  const handleClose = () => {
    // Nettoyer les URLs blob
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    if (bannierePreview && bannierePreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannierePreview);
    }
    resetForm();
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (!show || !boutique) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1050,
        backdropFilter: "blur(4px)",
      }}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          {/* Header avec gradient jaune */}
          <div
            className="modal-header border-0 text-white position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            }}
          >
            <div className="position-absolute top-0 end-0 bottom-0 start-0 opacity-20">
              <FontAwesomeIcon
                icon={faStore}
                className="position-absolute"
                style={{
                  fontSize: isMobile ? "120px" : "180px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(-10deg)",
                  opacity: 0.3,
                }}
              />
            </div>
            <div className="position-relative z-1 w-100">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div>
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2 gap-md-3" style={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
                    <div className="bg-white bg-opacity-25 rounded-circle p-2 p-md-3">
                      <FontAwesomeIcon icon={faEdit} className={isMobile ? "fs-6" : "fs-4"} />
                    </div>
                    <div>
                      <span>Modifier la boutique</span>
                      <p className="mb-0 text-white text-opacity-90 small fw-normal" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                        {boutique.nom} • Créée le{" "}
                        {formatDate(boutique.created_at)}
                      </p>
                    </div>
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white bg-white bg-opacity-25 rounded-circle p-1 p-md-2"
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Fermer"
                ></button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-0">
              {/* Informations principales */}
              <div
                className="p-3 p-md-4"
                style={{
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                }}
              >
                <div className="row g-3 g-md-4">
                  <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3 p-md-4">
                        <h6 className="fw-bold mb-2 mb-md-3 text-dark d-flex align-items-center gap-2">
                          <div
                            className="bg-yellow bg-opacity-10 rounded-circle p-1 p-md-2"
                            style={{
                              backgroundColor: "rgba(251, 191, 36, 0.1)",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-yellow"
                              style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                            />
                          </div>
                          <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>Informations principales</span>
                        </h6>

                        <div className="row g-2 g-md-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                              Nom de la boutique{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-end-0" style={{ padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem" }}>
                                <FontAwesomeIcon
                                  icon={faStore}
                                  className="text-yellow"
                                  style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                                />
                              </span>
                              <input
                                type="text"
                                className={`form-control border-start-0 ${errors.nom ? "is-invalid" : ""}`}
                                placeholder="Nom de votre boutique"
                                value={formData.nom}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    nom: e.target.value,
                                  });
                                  if (errors.nom)
                                    setErrors({ ...errors, nom: "" });
                                }}
                                required
                                disabled={loading}
                                style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem" }}
                              />
                            </div>
                            {errors.nom && (
                              <div className="invalid-feedback d-block" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                                {errors.nom}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                              Type de boutique{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-white border-end-0" style={{ padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem" }}>
                                <FontAwesomeIcon
                                  icon={faTag}
                                  className="text-yellow"
                                  style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                                />
                              </span>
                              <select
                                className={`form-control border-start-0 ${errors.type ? "is-invalid" : ""}`}
                                value={formData.type_boutique_uuid}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    type_boutique_uuid: e.target.value,
                                  });
                                  if (errors.type)
                                    setErrors({ ...errors, type: "" });
                                }}
                                required
                                disabled={loading || loadingTypes}
                                style={{ fontSize: isMobile ? "0.8rem" : "0.875rem", padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem" }}
                              >
                                <option value="">
                                  Sélectionner un type...
                                </option>
                                {typesBoutique.map((type) => (
                                  <option key={type.uuid} value={type.uuid}>
                                    {type.libelle}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {loadingTypes && (
                              <div className="mt-2">
                                <div className="d-flex align-items-center gap-2">
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    className="text-yellow"
                                    style={{ color: "#fbbf24", fontSize: isMobile ? "0.7rem" : "0.8rem" }}
                                  />
                                  <small
                                    className="text-yellow"
                                    style={{ color: "#fbbf24", fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                                  >
                                    Chargement des types...
                                  </small>
                                </div>
                              </div>
                            )}
                            {errors.type && (
                              <div className="invalid-feedback d-block" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                                {errors.type}
                              </div>
                            )}
                          </div>

                          <div className="col-12">
                            <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                              Description
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-white align-items-start border-end-0 pt-3" style={{ padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem" }}>
                                <FontAwesomeIcon
                                  icon={faFileAlt}
                                  className="text-yellow"
                                  style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                                />
                              </span>
                              <textarea
                                className="form-control border-start-0"
                                rows={isMobile ? 3 : 4}
                                placeholder="Décrivez votre boutique en détail..."
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                                disabled={loading}
                                style={{ 
                                  minHeight: isMobile ? "80px" : "120px",
                                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                                  padding: isMobile ? "0.3rem 0.5rem" : "0.375rem 0.75rem"
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                Présentez votre boutique aux clients
                              </small>
                              <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                {formData.description.length}/1000 caractères
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3 p-md-4">
                        <h6 className="fw-bold mb-2 mb-md-3 text-dark d-flex align-items-center gap-2">
                          <div
                            className="bg-yellow bg-opacity-10 rounded-circle p-1 p-md-2"
                            style={{
                              backgroundColor: "rgba(251, 191, 36, 0.1)",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPalette}
                              className="text-yellow"
                              style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                            />
                          </div>
                          <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>Identité visuelle</span>
                        </h6>

                        {/* Logo */}
                        <div className="mb-3 mb-md-4">
                          <label className="form-label fw-semibold text-dark mb-1 mb-md-2" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                            Logo de la boutique
                          </label>
                          <div className="position-relative">
                            <div
                              className={`border ${errors.logo ? "border-danger" : "border-dashed"} rounded-3 p-2 p-md-3 text-center bg-white`}
                              style={{ minHeight: isMobile ? "150px" : "200px" }}
                            >
                              {logoPreview ? (
                                <div className="position-relative">
                                  <img
                                    src={logoPreview}
                                    alt="Logo"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: isMobile ? "100px" : "150px" }}
                                    onError={(e) => {
                                      // Si l'image échoue à charger, afficher un placeholder
                                      (e.target as HTMLImageElement).src =
                                        `https://via.placeholder.com/150/fbbf24/ffffff?text=Logo`;
                                    }}
                                  />
                                  <div className="mt-2 mt-md-3 d-flex gap-1 gap-md-2 justify-content-center">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() =>
                                        resetToOriginalImage("logo")
                                      }
                                      disabled={loading || showOriginalLogo}
                                      style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", padding: isMobile ? "0.2rem 0.4rem" : "0.25rem 0.5rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faUndo}
                                        className="me-1"
                                        style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                      />
                                      Rétablir
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() =>
                                        document
                                          .getElementById("logo-upload-edit")
                                          ?.click()
                                      }
                                      disabled={loading}
                                      style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", padding: isMobile ? "0.2rem 0.4rem" : "0.25rem 0.5rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faSyncAlt}
                                        className="me-1"
                                        style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                      />
                                      Changer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                  <FontAwesomeIcon
                                    icon={faCamera}
                                    className="text-muted mb-2"
                                    style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}
                                  />
                                  <p className="text-muted mb-2" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                                    Aucun logo sélectionné
                                  </p>
                                  <input
                                    type="file"
                                    className="form-control d-none"
                                    id="logo-upload-edit"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFileChange(e, "logo")
                                    }
                                    disabled={loading}
                                  />
                                  <label
                                    htmlFor="logo-upload-edit"
                                    className="btn btn-sm btn-outline-warning"
                                    style={{
                                      cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                      borderColor: "#fbbf24",
                                      color: "#fbbf24",
                                      fontSize: isMobile ? "0.7rem" : "0.8rem",
                                      padding: isMobile ? "0.2rem 0.5rem" : "0.25rem 0.75rem"
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faImage}
                                      className="me-1"
                                      style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                    />
                                    {boutique.logo
                                      ? "Changer le logo"
                                      : "Ajouter un logo"}
                                  </label>
                                </div>
                              )}
                            </div>
                            {errors.logo && (
                              <div className="invalid-feedback d-block mt-2" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                                {errors.logo}
                              </div>
                            )}
                            {showOriginalLogo && boutique.logo && (
                              <small className="text-muted d-block mt-2" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                  className="me-1"
                                  style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                />
                                Logo original conservé
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Bannière */}
                        <div>
                          <label className="form-label fw-semibold text-dark mb-1 mb-md-2" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                            Bannière
                          </label>
                          <div className="position-relative">
                            <div
                              className={`border ${errors.banniere ? "border-danger" : "border-dashed"} rounded-3 p-2 p-md-3 text-center bg-white`}
                              style={{ minHeight: isMobile ? "100px" : "120px" }}
                            >
                              {bannierePreview ? (
                                <div className="position-relative">
                                  <img
                                    src={bannierePreview}
                                    alt="Bannière"
                                    className="img-fluid rounded shadow-sm"
                                    style={{
                                      maxHeight: isMobile ? "70px" : "100px",
                                      width: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      // Si l'image échoue à charger, afficher un placeholder
                                      (e.target as HTMLImageElement).src =
                                        `https://via.placeholder.com/400x100/fbbf24/ffffff?text=Bannière`;
                                    }}
                                  />
                                  <div className="mt-2 mt-md-3 d-flex gap-1 gap-md-2 justify-content-center">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() =>
                                        resetToOriginalImage("banniere")
                                      }
                                      disabled={loading || showOriginalBanniere}
                                      style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", padding: isMobile ? "0.2rem 0.4rem" : "0.25rem 0.5rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faUndo}
                                        className="me-1"
                                        style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                      />
                                      Rétablir
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() =>
                                        document
                                          .getElementById(
                                            "banniere-upload-edit",
                                          )
                                          ?.click()
                                      }
                                      disabled={loading}
                                      style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", padding: isMobile ? "0.2rem 0.4rem" : "0.25rem 0.5rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faSyncAlt}
                                        className="me-1"
                                        style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                      />
                                      Changer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                  <FontAwesomeIcon
                                    icon={faImage}
                                    className="text-muted mb-2"
                                    style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}
                                  />
                                  <p className="text-muted mb-2 small" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                                    Bannière optionnelle
                                  </p>
                                  <input
                                    type="file"
                                    className="form-control d-none"
                                    id="banniere-upload-edit"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFileChange(e, "banniere")
                                    }
                                    disabled={loading}
                                  />
                                  <label
                                    htmlFor="banniere-upload-edit"
                                    className="btn btn-sm btn-outline-warning"
                                    style={{
                                      cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                      borderColor: "#fbbf24",
                                      color: "#fbbf24",
                                      fontSize: isMobile ? "0.7rem" : "0.8rem",
                                      padding: isMobile ? "0.2rem 0.5rem" : "0.25rem 0.75rem"
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faImage}
                                      className="me-1"
                                      style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                    />
                                    {boutique.banniere
                                      ? "Changer la bannière"
                                      : "Ajouter une bannière"}
                                  </label>
                                </div>
                              )}
                            </div>
                            {errors.banniere && (
                              <div className="invalid-feedback d-block mt-2" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                                {errors.banniere}
                              </div>
                            )}
                            {showOriginalBanniere && boutique.banniere && (
                              <small className="text-muted d-block mt-2" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                <FontAwesomeIcon
                                  icon={faInfoCircle}
                                  className="me-1"
                                  style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}
                                />
                                Bannière originale conservée
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions et politiques */}
              <div className="p-3 p-md-4 border-top">
                <h6 className="fw-bold mb-2 mb-md-3 text-dark d-flex align-items-center gap-2">
                  <div
                    className="bg-yellow bg-opacity-10 rounded-circle p-1 p-md-2"
                    style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                  >
                    <FontAwesomeIcon
                      icon={faClipboardCheck}
                      className="text-yellow"
                      style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                    />
                  </div>
                  <span style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>Conditions et politiques</span>
                </h6>

                <div className="row g-3 g-md-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3 p-md-4">
                        <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                          Politique de retour
                        </label>
                        <textarea
                          className="form-control"
                          rows={isMobile ? 3 : 5}
                          placeholder="Décrivez votre politique de retour et d'échange..."
                          value={formData.politique_retour}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              politique_retour: e.target.value,
                            })
                          }
                          disabled={loading}
                          style={{ 
                            minHeight: isMobile ? "100px" : "150px",
                            fontSize: isMobile ? "0.8rem" : "0.875rem"
                          }}
                        />
                        <div className="d-flex justify-content-between mt-2">
                          <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                            Informations importantes pour vos clients
                          </small>
                          <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                            {formData.politique_retour.length}/2000 caractères
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body p-3 p-md-4">
                        <label className="form-label fw-semibold text-dark" style={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
                          Conditions d'utilisation
                        </label>
                        <textarea
                          className="form-control"
                          rows={isMobile ? 3 : 5}
                          placeholder="Décrivez les conditions générales d'utilisation..."
                          value={formData.conditions_utilisation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditions_utilisation: e.target.value,
                            })
                          }
                          disabled={loading}
                          style={{ 
                            minHeight: isMobile ? "100px" : "150px",
                            fontSize: isMobile ? "0.8rem" : "0.875rem"
                          }}
                        />
                        <div className="d-flex justify-content-between mt-2">
                          <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                            Règles et conditions de votre boutique
                          </small>
                          <small className="text-muted" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                            {formData.conditions_utilisation.length}/2000
                            caractères
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseils */}
                <div className="mt-3 mt-md-4">
                  <div className="alert alert-light border shadow-sm p-2 p-md-3">
                    <div className="d-flex align-items-start gap-2 gap-md-3">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="text-yellow mt-1"
                        style={{ color: "#fbbf24", fontSize: isMobile ? "0.8rem" : "1rem" }}
                      />
                      <div>
                        <small className="fw-semibold d-block mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                          Conseils pour une bonne boutique :
                        </small>
                        <small className="text-muted d-block" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                          • Des images de qualité augmentent la confiance des clients
                        </small>
                        <small className="text-muted d-block" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                          • Des conditions claires réduisent les litiges
                        </small>
                        <small className="text-muted d-block" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                          • Une description complète améliore le référencement
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="modal-footer border-0 p-3 p-md-4"
              style={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 gap-2 gap-md-0">
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm btn-md d-flex align-items-center gap-2"
                    onClick={handleClose}
                    disabled={loading}
                    style={{ fontSize: isMobile ? "0.8rem" : "1rem", padding: isMobile ? "0.3rem 0.8rem" : "0.5rem 1rem" }}
                  >
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                    Annuler
                  </button>
                </div>

                <div className="d-flex gap-2 gap-md-3">
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm btn-md d-flex align-items-center gap-2"
                    onClick={resetForm}
                    disabled={loading}
                    style={{
                      borderColor: "#fbbf24",
                      color: "#fbbf24",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      padding: isMobile ? "0.3rem 0.8rem" : "0.5rem 1rem"
                    }}
                  >
                    <FontAwesomeIcon icon={faUndo} style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                    Réinitialiser
                  </button>

                  <button
                    type="submit"
                    className="btn btn-warning btn-sm btn-md d-flex align-items-center gap-2 shadow"
                    disabled={loading || loadingTypes}
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      border: "none",
                      minWidth: isMobile ? "140px" : "180px",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      padding: isMobile ? "0.3rem 0.8rem" : "0.5rem 1rem"
                    }}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                          style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }}
                        />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="me-2" style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-content {
          animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 20px;
          overflow: hidden;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 0.25rem rgba(251, 191, 36, 0.25);
        }

        .border-dashed {
          border-style: dashed !important;
          transition: all 0.3s ease;
        }

        .border-dashed:hover {
          border-color: #fbbf24 !important;
          background-color: rgba(251, 191, 36, 0.05);
        }

        .card {
          transition: all 0.3s ease;
          border-radius: 15px;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .btn-outline-warning {
          border-color: #fbbf24;
          color: #fbbf24;
          transition: all 0.3s ease;
        }

        .btn-outline-warning:hover {
          background-color: #fbbf24;
          border-color: #fbbf24;
          color: white;
        }

        .btn-warning {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }

        .btn-warning:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
        }

        .modal-header {
          border-radius: 15px 15px 0 0;
        }

        .input-group-text {
          border-radius: 10px 0 0 10px;
          border-right: none;
        }

        .form-control {
          border-radius: 0 10px 10px 0;
        }

        textarea.form-control {
          border-radius: 10px;
        }

        .invalid-feedback {
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        /* Media queries pour mobile */
        @media (max-width: 768px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .modal-content {
            border-radius: 15px;
          }
          
          .btn-sm {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EditBoutiqueModal;