"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faInfoCircle,
  faMoneyBill,
  faMapMarkerAlt,
  faImage,
  faCamera,
  faTimes,
  faTag,
  faBox,
  faCheckCircle,
  faExclamationCircle,
  faList,
  faStore,
  faBuilding,
  faPlusCircle,
  faChevronDown,
  faStar,
  faGift,
  faTruck,
  faShield,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import {
  Category,
  VenteData,
  Boutique,
  VenteFormProps,
} from "../components/constantes/types";

// ============================================
// FONCTION POUR DÉCODER LE TOKEN JWT
// ============================================
const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("⚠️ Format de token invalide");
      return null;
    }
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const decoded = atob(paddedBase64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("❌ Erreur lors du décodage du token:", error);
    return null;
  }
};

// ============================================
// COMPOSANT D'IMAGE SÉCURISÉ AVEC buildImageUrl
// ============================================
const SafeImage = ({
  src,
  alt,
  className,
  style,
  fallbackIcon = faStore,
  fallbackSize = "24px",
}: any) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || "");

  useEffect(() => {
    setImgSrc(src || "");
    setError(false);
  }, [src]);

  if (error || !imgSrc) {
    return (
      <div
        className={`${className} d-flex align-items-center justify-content-center bg-light rounded-circle`}
        style={{
          ...style,
        }}
      >
        <FontAwesomeIcon
          icon={fallbackIcon}
          className="text-secondary"
          style={{ fontSize: fallbackSize }}
        />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
};

const VenteForm: React.FC<VenteFormProps> = ({
  venteData,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
  user,
  validationErrors = {},
  // Props optionnelles avec valeurs par défaut
  boutiques: externalBoutiques = [],
  selectedBoutique: externalSelectedBoutique = null,
  onBoutiqueChange: externalOnBoutiqueChange,
  saleMode,
  onOpenCreateBoutique,
  onOpenVendeurRegister,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sousCategories, setSousCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBoutiques, setLoadingBoutiques] = useState(false);
  const [boutiques, setBoutiques] = useState<Boutique[]>(externalBoutiques);
  const [userType, setUserType] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ✅ Fonction pour formater le numéro de téléphone avec +225
  const formatPhoneNumber = (value: string): string => {
    // Garder seulement le préfixe +225 et les chiffres
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça commence par +225, on le garde, sinon on l'ajoute
    if (!cleaned.startsWith('+225')) {
      cleaned = '+225' + cleaned.replace(/^0+/, '');
    }
    
    // Extraire les chiffres après +225
    let numbers = cleaned.replace('+225', '').replace(/\s/g, '');
    
    // Limiter à 10 chiffres
    numbers = numbers.slice(0, 10);
    
    // Formater avec des espaces tous les 2 chiffres
    let formatted = '+225';
    if (numbers.length > 0) {
      // Format: +225 07 09 18 18 64
      const parts = [];
      for (let i = 0; i < numbers.length; i += 2) {
        parts.push(numbers.substr(i, 2));
      }
      formatted += ' ' + parts.join(' ');
    }
    
    return formatted;
  };

  // ✅ Fonction pour valider le numéro de téléphone
  const validatePhoneNumber = (phone: string): boolean => {
    // Enlever le préfixe +225 et les espaces
    const numbers = phone.replace(/^\+225\s*/, '').replace(/\s/g, '');
    // Vérifier qu'il reste exactement 10 chiffres
    return /^\d{10}$/.test(numbers);
  };

  // ✅ Gestionnaire de changement pour le téléphone (pour le champ lieu qui sert de contact)
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    
    // Mettre à jour les données
    onChange({ ...venteData, lieu: formatted });
    
    // Valider et afficher une erreur si nécessaire
    if (formatted !== '+225 ') {
      const isValid = validatePhoneNumber(formatted);
      setPhoneError(isValid ? null : "Le numéro doit contenir 10 chiffres (ex: 07 09 18 18 64)");
    } else {
      setPhoneError(null);
    }
  };

  // ✅ DÉTERMINER LE TYPE D'UTILISATEUR À PARTIR DU TOKEN
  useEffect(() => {
    const getUserTypeFromToken = () => {
      try {
        const token = 
          localStorage.getItem("oskar_token") ||
          localStorage.getItem("temp_token") ||
          localStorage.getItem("tempToken") ||
          localStorage.getItem("token");
        
        console.log("🔍 Token trouvé:", token ? token.substring(0, 20) + "..." : "aucun");
        
        if (!token) {
          console.log("ℹ️ Aucun token trouvé");
          setUserType(null);
          return;
        }

        const decoded = decodeToken(token);
        console.log("📦 Token décodé:", decoded);
        
        if (decoded) {
          const type = decoded.type || decoded.user_type || decoded.role;
          console.log("✅ Type utilisateur extrait du token:", type);
          setUserType(type ? type.toLowerCase() : null);
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la lecture du token:", error);
        setUserType(null);
      }
    };

    getUserTypeFromToken();
  }, []);

  // Fonction pour vérifier si l'utilisateur est un vendeur
  const isUserVendeur = useCallback(() => {
    console.log("🔍 Vérification type utilisateur - userType:", userType);
    console.log("🔍 Vérification type utilisateur - user prop:", user);
    
    if (userType === "vendeur") {
      console.log("✅ Utilisateur est un vendeur (basé sur token)");
      return true;
    }
    
    if (user) {
      if (user.type?.toLowerCase() === "vendeur") {
        console.log("✅ Utilisateur est un vendeur (basé sur user.type)");
        return true;
      }
      if (user.role?.toLowerCase() === "vendeur") {
        console.log("✅ Utilisateur est un vendeur (basé sur user.role)");
        return true;
      }
      if (user.userData?.type?.toLowerCase() === "vendeur") {
        console.log("✅ Utilisateur est un vendeur (basé sur userData)");
        return true;
      }
    }
    
    console.log("❌ Utilisateur n'est pas un vendeur");
    return false;
  }, [user, userType]);

  // Charger toutes les boutiques si aucune n'est fournie de l'extérieur
  useEffect(() => {
    const fetchAllBoutiques = async () => {
      console.log("🏪 Chargement des boutiques - isUserVendeur:", isUserVendeur());
      console.log("🏪 externalBoutiques:", externalBoutiques);
      
      if (externalBoutiques && externalBoutiques.length > 0) {
        console.log(`✅ Utilisation des ${externalBoutiques.length} boutiques externes`);
        setBoutiques(externalBoutiques);
        return;
      }

      if (!isUserVendeur()) {
        console.log("ℹ️ Utilisateur non vendeur, pas de chargement de boutiques");
        setBoutiques([]);
        return;
      }

      try {
        setLoadingBoutiques(true);
        console.log("🏪 Chargement de toutes les boutiques pour le vendeur...");

        const response = await api.get(API_ENDPOINTS.BOUTIQUES.ALL);
        console.log("📦 Réponse boutiques:", response);

        let boutiquesData: Boutique[] = [];
        if (response?.data && Array.isArray(response.data)) {
          boutiquesData = response.data;
        } else if (Array.isArray(response)) {
          boutiquesData = response;
        }

        const boutiquesValides = boutiquesData.filter(
          (b) => !b.est_bloque && !b.est_ferme,
        );

        console.log(`✅ ${boutiquesValides.length} boutiques disponibles`);
        setBoutiques(boutiquesValides);
      } catch (error) {
        console.error("❌ Erreur chargement boutiques:", error);
      } finally {
        setLoadingBoutiques(false);
      }
    };

    fetchAllBoutiques();
  }, [externalBoutiques, isUserVendeur]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        console.log("📦 Réponse catégories brute:", response);

        if (Array.isArray(response)) {
          // Filtrer pour garder seulement les catégories principales (sans path ou path null)
          const mainCategories = response.filter(
            (cat: Category) => !cat.path || cat.path === null
          );
          
          console.log("📊 Catégories principales:", mainCategories.map(c => ({ 
            libelle: c.libelle, 
            uuid: c.uuid,
            enfants: c.enfants?.length || 0 
          })));
          
          setCategories(mainCategories);
          
          // Si une catégorie est déjà sélectionnée, charger ses sous-catégories
          if (venteData.categorie_uuid) {
            const selectedCat = response.find(c => c.uuid === venteData.categorie_uuid);
            if (selectedCat?.enfants && selectedCat.enfants.length > 0) {
              setSousCategories(selectedCat.enfants);
            }
          }
        }
      } catch (err: any) {
        console.error("Erreur chargement catégories:", err);
        setError("Impossible de charger les catégories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [venteData.categorie_uuid]);

  // Gérer le changement de catégorie principale
  const handleCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const categorieUuid = e.target.value;
    const selectedCategory = categories.find(c => c.uuid === categorieUuid);
    
    // Mettre à jour la catégorie principale
    onChange({
      ...venteData,
      categorie_uuid: categorieUuid,
      sous_categorie_uuid: "", // Réinitialiser la sous-catégorie
    });

    // Charger les sous-catégories
    if (selectedCategory?.enfants && selectedCategory.enfants.length > 0) {
      setSousCategories(selectedCategory.enfants);
    } else {
      setSousCategories([]);
    }
  };

  // Gérer le changement de sous-catégorie
  const handleSousCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const sousCategorieUuid = e.target.value;
    onChange({
      ...venteData,
      sous_categorie_uuid: sousCategorieUuid,
    });
  };

  // Gérer le changement de boutique
  const handleBoutiqueSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const uuid = e.target.value;
    const selectedBoutique = boutiques.find(b => b.uuid === uuid);
    
    onChange({
      ...venteData,
      boutiqueUuid: uuid,
      boutiqueNom: selectedBoutique?.nom || "",
    });

    if (externalOnBoutiqueChange) {
      externalOnBoutiqueChange(uuid);
    }
  };

  const handlePrixChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    onChange({ ...venteData, prix: numericValue });
  };

  const renderVenteStep2 = () => {
    const vendeur = isUserVendeur();
    console.log("🎨 Rendu étape 2 - estVendeur:", vendeur);
    console.log("🎨 Boutiques disponibles:", boutiques.length);

    return (
      <div className="container-fluid p-4">
        {/* En-tête avec progression */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center bg-success bg-opacity-10 p-4 rounded-4 border border-success border-opacity-25">
              <div className="rounded-circle bg-success p-3 me-4 shadow-sm">
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-white fs-3"
                />
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-2 display-6">Détails de la vente</h2>
                <p className="text-secondary mb-0 fs-5">
                  Décrivez votre produit et fixez votre prix
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning border d-flex align-items-center p-4 rounded-4">
                <FontAwesomeIcon icon={faExclamationCircle} className="fs-3 me-3 text-warning" />
                <div>
                  <strong className="d-block fs-5 mb-1">Erreur de chargement</strong>
                  <span className="fs-6">{error}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Colonne principale - Formulaire */}
          <div className="col-lg-8">
            <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
              <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-success me-3 fs-3"
                  />
                  Information du produit
                </h4>
              </div>
              
              <div className="card-body p-4">
                {/* Section Boutique - UNIQUEMENT pour les vendeurs */}
                {vendeur && (
                  <div className="mb-5">
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faStore}
                        className="me-2 text-success"
                      />
                      Boutique
                      <span className="badge bg-success bg-opacity-10 text-success ms-3 px-3 py-2 fs-6 rounded-pill">
                        Requis pour les vendeurs
                      </span>
                    </label>

                    {loadingBoutiques ? (
                      <div className="alert alert-info border rounded-4 p-4">
                        <div className="d-flex align-items-center">
                          <div className="spinner-border text-info me-3" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                          <div>
                            <strong className="d-block fs-5 mb-1">Chargement en cours</strong>
                            <span className="fs-6">Récupération de vos boutiques...</span>
                          </div>
                        </div>
                      </div>
                    ) : boutiques.length === 0 ? (
                      <div className="alert alert-warning border rounded-4 p-4">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faExclamationCircle} className="fs-2 text-warning me-3" />
                            <div>
                              <strong className="d-block fs-5 mb-1">Aucune boutique trouvée</strong>
                              <span className="fs-6">Vous devez créer une boutique pour vendre des produits</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-success btn-lg px-4 py-3 rounded-4 d-flex align-items-center gap-2 shadow"
                            onClick={onOpenCreateBoutique}
                          >
                            <FontAwesomeIcon icon={faPlusCircle} />
                            Créer une boutique
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="position-relative">
                        <select
                          className="form-select form-select-lg border rounded-4 py-3 px-4 bg-white"
                          style={{ 
                            fontSize: "1.1rem",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none",
                            backgroundImage: "none",
                            paddingRight: "3rem"
                          }}
                          value={venteData.boutiqueUuid}
                          onChange={handleBoutiqueSelect}
                          required
                        >
                          <option value="" className="py-2">🏪 Sélectionnez boutique (requis)</option>
                          {boutiques.map((boutique) => (
                            <option key={boutique.uuid} value={boutique.uuid} className="py-2">
                              🏪 {boutique.nom} - {boutique.statut === "actif" ? "✓ Active" : `⏳ ${boutique.statut}`}
                            </option>
                          ))}
                        </select>
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className="position-absolute end-0 top-50 translate-middle-y me-4 text-secondary"
                          style={{ 
                            pointerEvents: "none", 
                            fontSize: "1.2rem",
                            zIndex: 2
                          }}
                        />
                      </div>
                    )}

                    {venteData.boutiqueUuid && (
                      <div className="mt-4 p-4 bg-success bg-opacity-10 rounded-4 border border-success d-flex align-items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="fs-2 text-success me-3" />
                        <div>
                          <strong className="d-block fs-5 text-success">Produit associé à la boutique</strong>
                          <span className="text-secondary">Votre produit sera vendu via cette boutique</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message pour les non-vendeurs */}
                {!vendeur && (
                  <div className="mb-5">
                    <div className="alert alert-info border rounded-4 p-4 d-flex align-items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="fs-2 text-info me-4" />
                      <div>
                        <strong className="d-block fs-5 mb-1">Publication en tant que particulier</strong>
                        <span className="fs-6">Vous pouvez publier des annonces sans boutique</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nom du produit */}
                <div className="mb-4" style={{ minHeight: "110px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Nom du produit <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className={`form-control form-control-lg border ${validationErrors.libelle ? 'border-danger' : 'border-secondary'} rounded-4 py-3 px-4`}
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Casque Audio Sony WH-1000XM5"
                      value={venteData.libelle}
                      onChange={(e) =>
                        onChange({ ...venteData, libelle: e.target.value })
                      }
                      required
                    />
                    {validationErrors.libelle && (
                      <div className="text-danger mt-2 d-flex align-items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                        {validationErrors.libelle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Prix et Quantité */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6" style={{ minHeight: "120px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Prix (FCFA) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border rounded-start-4 px-4">
                        <FontAwesomeIcon icon={faMoneyBill} className="text-success fs-4" />
                      </span>
                      <input
                        type="text"
                        className={`form-control form-control-lg border ${validationErrors.prix ? 'border-danger' : 'border-secondary'} rounded-end-4 py-3`}
                        style={{ fontSize: "1.1rem" }}
                        placeholder="250000"
                        value={venteData.prix}
                        onChange={handlePrixChange}
                        required
                      />
                    </div>
                    {validationErrors.prix && (
                      <div className="text-danger mt-2 d-flex align-items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                        {validationErrors.prix}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6" style={{ minHeight: "120px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Quantité <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      value={venteData.quantite}
                      onChange={(e) =>
                        onChange({ ...venteData, quantite: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Type de produit et Lieu (Contact) - avec gestion améliorée du téléphone */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6" style={{ minHeight: "120px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Type de produit
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: accessoire audio"
                      value={venteData.type}
                      onChange={(e) =>
                        onChange({ ...venteData, type: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6" style={{ minHeight: "120px" }}>
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="me-2 text-success"
                      />
                      Numéro de contact <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border rounded-start-4 px-4">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-success fs-4" />
                      </span>
                      <input
                        type="tel"
                        className={`form-control form-control-lg border ${phoneError ? 'border-danger' : validationErrors.lieu ? 'border-danger' : 'border-secondary'} rounded-end-4 py-3`}
                        style={{ fontSize: "1.1rem" }}
                        placeholder="+225 07 09 18 18 64"
                        value={venteData.lieu}
                        onChange={handlePhoneChange}
                        required
                      />
                    </div>
                    {phoneError && (
                      <div className="text-danger mt-2 small">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                        {phoneError}
                      </div>
                    )}
                    {validationErrors.lieu && !phoneError && (
                      <div className="text-danger mt-2 d-flex align-items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                        {validationErrors.lieu}
                      </div>
                    )}
                    <small className="text-muted mt-1 d-block">
                      Format: +225 suivi de 10 chiffres
                    </small>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4" style={{ minHeight: "200px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Description
                  </label>
                  <textarea
                    className={`form-control form-control-lg border ${validationErrors.description ? 'border-danger' : 'border-secondary'} rounded-4 py-3 px-4`}
                    style={{ fontSize: "1.1rem", minHeight: "150px" }}
                    rows={4}
                    placeholder="Décrivez votre produit en détail..."
                    value={venteData.description}
                    onChange={(e) =>
                      onChange({ ...venteData, description: e.target.value })
                    }
                  />
                  {validationErrors.description && (
                    <div className="text-danger mt-2 d-flex align-items-center">
                      <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                      {validationErrors.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Photo et Catégories */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              {/* Photo du produit */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="text-success me-3 fs-3"
                    />
                    Photo
                  </h4>
                </div>
                
                <div className="card-body p-4" style={{ minHeight: "400px" }}>
                  {imagePreview ? (
                    <div className="position-relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded-4 border shadow-sm"
                        style={{
                          maxHeight: "250px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/images/default-product.png";
                        }}
                      />
                      <button
                        type="button"
                        onClick={onRemoveImage}
                        className="btn btn-danger position-absolute top-0 end-0 m-3 rounded-circle shadow"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="text-center border border-dashed border-secondary rounded-4 p-5 mb-4 bg-light bg-opacity-25"
                      onClick={() => document.getElementById('fileInput')?.click()}
                      style={{ cursor: 'pointer', minHeight: "250px", display: "flex", flexDirection: "column", justifyContent: "center" }}
                    >
                      <FontAwesomeIcon
                        icon={faImage}
                        className="text-secondary fs-1 mb-3"
                      />
                      <p className="text-secondary fs-6 mb-0">
                        Cliquez pour ajouter une photo
                      </p>
                    </div>
                  )}
                  
                  <div className="d-grid mt-3">
                    <label className="btn btn-outline-success btn-lg rounded-4 py-3 border fw-bold">
                      <FontAwesomeIcon icon={faCamera} className="me-2" />
                      {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={onImageUpload}
                      />
                    </label>
                  </div>

                  <div className="mt-4 p-3 bg-light rounded-4 border">
                    <small className="text-secondary d-block">
                      <strong className="text-dark">📸 Conseils :</strong>
                    </small>
                    <small className="text-secondary d-block mt-2">
                      • Photos de qualité = plus de ventes
                    </small>
                    <small className="text-secondary d-block">
                      • Montrez le produit sous différents angles
                    </small>
                    <small className="text-secondary d-block">
                      • Évitez le flou et les arrière-plans encombrés
                    </small>
                  </div>
                </div>
              </div>

              {/* Catégorie principale */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faList}
                      className="text-success me-3 fs-3"
                    />
                    Catégorie
                  </h4>
                </div>
                
                <div className="card-body p-4" style={{ minHeight: "250px" }}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="text-secondary">Chargement des catégories...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger rounded-4 py-3">
                      <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                      {error}
                    </div>
                  ) : (
                    <>
                      <div className="mb-4" style={{ minHeight: "100px" }}>
                        <label className="form-label fw-bold fs-6 mb-3">
                          Catégorie principale <span className="text-danger">*</span>
                        </label>
                        <div className="position-relative">
                          <select
                            className={`form-select form-select-lg border ${validationErrors.categorie ? 'border-danger' : 'border-secondary'} rounded-4 py-3 px-4 bg-white`}
                            style={{ 
                              fontSize: "1rem",
                              WebkitAppearance: "none",
                              MozAppearance: "none",
                              appearance: "none",
                              backgroundImage: "none",
                              paddingRight: "3rem"
                            }}
                            value={venteData.categorie_uuid}
                            onChange={handleCategorieChange}
                            required
                          >
                            <option value="" className="py-2">📦 Choisir catégorie</option>
                            {categories.map((cat) => (
                              <option key={cat.uuid} value={cat.uuid} className="py-2">
                                {cat.libelle}
                              </option>
                            ))}
                          </select>
                          <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className="position-absolute end-0 top-50 translate-middle-y me-4 text-secondary"
                            style={{ 
                              pointerEvents: "none", 
                              fontSize: "1rem",
                              zIndex: 2
                            }}
                          />
                        </div>
                        {validationErrors.categorie && (
                          <div className="text-danger mt-2 d-flex align-items-center">
                            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                            {validationErrors.categorie}
                          </div>
                        )}
                      </div>

                      {/* Sous-catégorie */}
                      {sousCategories.length > 0 && (
                        <div className="mb-3" style={{ minHeight: "100px" }}>
                          <label className="form-label fw-bold fs-6 mb-3">
                            Sous-catégorie
                          </label>
                          <div className="position-relative">
                            <select
                              className="form-select form-select-lg border border-secondary rounded-4 py-3 px-4 bg-white"
                              style={{ 
                                fontSize: "1rem",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                appearance: "none",
                                backgroundImage: "none",
                                paddingRight: "3rem"
                              }}
                              value={venteData.sous_categorie_uuid || ""}
                              onChange={handleSousCategorieChange}
                            >
                              <option value="" className="py-2">🔽 Sous-catégorie</option>
                              {sousCategories.map((sousCat) => (
                                <option key={sousCat.uuid} value={sousCat.uuid} className="py-2">
                                  {sousCat.libelle}
                                </option>
                              ))}
                            </select>
                            <FontAwesomeIcon 
                              icon={faChevronDown} 
                              className="position-absolute end-0 top-50 translate-middle-y me-4 text-secondary"
                              style={{ 
                                pointerEvents: "none", 
                                fontSize: "1rem",
                                zIndex: 2
                              }}
                            />
                          </div>
                          <small className="text-secondary mt-2 d-block">
                            <i className="fa-regular fa-circle-question me-1"></i>
                            Optionnel - Affinez votre catégorie
                          </small>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* État du produit */}
              <div className="card border shadow-lg rounded-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faTag}
                      className="text-success me-3 fs-3"
                    />
                    État
                  </h4>
                </div>
                
                <div className="card-body p-4" style={{ minHeight: "200px" }}>
                  <div className="position-relative">
                    <select
                      className="form-select form-select-lg border border-secondary rounded-4 py-3 px-4 bg-white"
                      style={{ 
                        fontSize: "1rem",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        backgroundImage: "none",
                        paddingRight: "3rem"
                      }}
                      value={venteData.condition}
                      onChange={(e) =>
                        onChange({ ...venteData, condition: e.target.value })
                      }
                    >
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value} className="py-2">
                          {cond.label}
                        </option>
                      ))}
                    </select>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className="position-absolute end-0 top-50 translate-middle-y me-4 text-secondary"
                      style={{ 
                        pointerEvents: "none", 
                        fontSize: "1rem",
                        zIndex: 2
                      }}
                    />
                  </div>

                  {/* Badges d'informations supplémentaires */}
                  <div className="mt-4 d-flex gap-2 flex-wrap">
                    <span className="badge bg-light text-dark border border-secondary px-3 py-2 rounded-pill">
                      <FontAwesomeIcon icon={faGift} className="me-1" />
                      Livraison possible
                    </span>
                    <span className="badge bg-light text-dark border border-secondary px-3 py-2 rounded-pill">
                      <FontAwesomeIcon icon={faShield} className="me-1" />
                      Paiement sécurisé
                    </span>
                    <span className="badge bg-light text-dark border border-secondary px-3 py-2 rounded-pill">
                      <FontAwesomeIcon icon={faStar} className="me-1 text-warning" />
                      Vérifié
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVenteStep3 = () => {
    const selectedBoutique = boutiques.find(
      (b) => b.uuid === venteData.boutiqueUuid,
    );

    // Trouver la catégorie sélectionnée
    const selectedCategorie = categories.find(c => c.uuid === venteData.categorie_uuid);
    
    // Trouver la sous-catégorie sélectionnée
    const selectedSousCategorie = sousCategories.find(
      sc => sc.uuid === venteData.sous_categorie_uuid
    );

    return (
      <div className="container-fluid p-4">
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-4">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-success fs-1"
                />
              </div>
              <h2 className="fw-bold text-dark mb-3 display-5">Récapitulatif de la vente</h2>
              <p className="text-secondary fs-5">
                Vérifiez les informations avant publication
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border shadow-lg rounded-4 hover-shadow transition-all">
              <div className="card-body p-5">
                {/* En-tête avec badge */}
                <div className="d-flex justify-content-between align-items-start mb-5 pb-4 border-bottom">
                  <div>
                    <h4 className="fw-bold text-dark mb-2">Détails du produit</h4>
                    <p className="text-secondary mb-0">Informations principales</p>
                  </div>
                  <div className="badge bg-success bg-opacity-10 text-success fs-6 p-3 rounded-pill border border-success">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    {selectedBoutique ? "Vente via boutique" : "Vente particulier"}
                  </div>
                </div>

                {/* Section boutique */}
                {selectedBoutique && (
                  <div className="mb-5 p-4 bg-success bg-opacity-10 rounded-4 border border-success">
                    <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faStore}
                        className="me-2 text-success"
                      />
                      Vente via boutique
                    </h5>
                    <div className="d-flex align-items-center">
                      {selectedBoutique.logo ? (
                        <SafeImage
                          src={selectedBoutique.logo}
                          alt={selectedBoutique.nom}
                          className="rounded-circle me-4 border border-success"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                          fallbackIcon={faStore}
                          fallbackSize="32px"
                        />
                      ) : (
                        <div className="bg-white rounded-circle p-3 me-4 border border-success">
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className="text-success fs-1"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="fw-bold mb-2">{selectedBoutique.nom}</h4>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-dark border border-secondary px-3 py-2">
                            {selectedBoutique.type_boutique?.libelle || "Boutique"}
                          </span>
                          {selectedBoutique.statut === "actif" && (
                            <span className="badge bg-success text-white px-3 py-2">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Titre du produit et prix */}
                <div className="row mb-5">
                  <div className="col-md-8">
                    <h3 className="fw-bold text-dark mb-3 display-6">
                      {venteData.libelle || "Non renseigné"}
                    </h3>
                    <div className="d-flex align-items-center flex-wrap gap-4">
                      <div className="display-5 fw-bold text-success">
                        {venteData.prix
                          ? `${parseInt(venteData.prix).toLocaleString()} FCFA`
                          : "Prix non défini"}
                      </div>
                      <div className="badge bg-light text-dark border border-secondary p-3 rounded-pill">
                        <FontAwesomeIcon icon={faBox} className="me-2" />
                        Quantité: {venteData.quantite}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails du produit */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Catégorie</p>
                      <p className="fw-bold text-dark mb-1 fs-5">
                        {selectedCategorie?.libelle || "Non renseigné"}
                      </p>
                      {selectedSousCategorie && (
                        <p className="text-secondary mb-0 small">
                          Sous-catégorie: {selectedSousCategorie.libelle}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Type</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {venteData.type || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">État</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {conditions.find((c) => c.value === venteData.condition)
                          ?.label || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Contact</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {venteData.lieu || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {venteData.description && (
                  <div className="mt-5">
                    <p className="text-secondary mb-3 fw-bold">Description</p>
                    <div className="bg-light rounded-4 p-4 border">
                      <p className="mb-0 fs-5" style={{ lineHeight: 1.8 }}>
                        {venteData.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border shadow-lg rounded-4 hover-shadow transition-all sticky-top" style={{ top: "20px" }}>
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                  <FontAwesomeIcon icon={faImage} className="me-2 text-success" />
                  Photo du produit
                </h5>
                
                {imagePreview ? (
                  <div className="text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-fluid rounded-4 border shadow-sm"
                      style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-product.png";
                      }}
                    />
                    <p className="text-success mt-3 small">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      Photo ajoutée
                    </p>
                  </div>
                ) : (
                  <div className="text-center border border-dashed border-secondary rounded-4 p-5">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-secondary fs-1 mb-3"
                    />
                    <p className="text-secondary mb-0">Aucune photo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (step === 2) return renderVenteStep2();
  if (step === 3) return renderVenteStep3();
  return null;
};

export default VenteForm;