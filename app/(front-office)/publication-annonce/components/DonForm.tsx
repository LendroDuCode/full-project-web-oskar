"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faInfoCircle,
  faMapMarkerAlt,
  faPhone,
  faBox,
  faTag,
  faImage,
  faCamera,
  faCheckCircle,
  faChevronDown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { DonFormProps, Category } from "./constantes/types";

const DonForm: React.FC<DonFormProps> = ({
  donData,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
  categories: externalCategories = [],
  sous_categorie_uuid: externalSousCategorieUuid,
}) => {
  const [categories, setCategories] = useState<Category[]>(externalCategories);
  const [sousCategories, setSousCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const setDonData = (newData: any) => onChange(newData);

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

  // ✅ Gestionnaire de changement pour le téléphone
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    
    // Mettre à jour les données
    setDonData({ ...donData, numero: formatted });
    
    // Valider et afficher une erreur si nécessaire
    if (formatted !== '+225 ') {
      const isValid = validatePhoneNumber(formatted);
      setPhoneError(isValid ? null : "Le numéro doit contenir 10 chiffres (ex: 07 09 18 18 64)");
    } else {
      setPhoneError(null);
    }
  };

  // Charger les catégories seulement si externalCategories n'est pas fourni
  useEffect(() => {
    if (externalCategories.length === 0) {
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
            if (donData.categorie_uuid) {
              const selectedCat = response.find(c => c.uuid === donData.categorie_uuid);
              if (selectedCat?.enfants && selectedCat.enfants.length > 0) {
                setSousCategories(selectedCat.enfants);
              }
            }
          } else {
            throw new Error("Format invalide");
          }
        } catch (err: any) {
          console.error("Erreur catégories:", err);
          setError("Impossible de charger les catégories.");
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    } else {
      // Si des catégories sont fournies de l'extérieur, les utiliser
      setCategories(externalCategories);
      
      // Charger les sous-catégories si une catégorie est sélectionnée
      if (donData.categorie_uuid) {
        const selectedCat = externalCategories.find(c => c.uuid === donData.categorie_uuid);
        if (selectedCat?.enfants && selectedCat.enfants.length > 0) {
          setSousCategories(selectedCat.enfants);
        }
      }
    }
  }, [externalCategories, donData.categorie_uuid]);

  // Gérer le changement de catégorie principale
  const handleCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const categorieUuid = e.target.value;
    const selectedCategory = categories.find(c => c.uuid === categorieUuid);
    
    // Mettre à jour la catégorie principale
    setDonData({
      ...donData,
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
    setDonData({
      ...donData,
      sous_categorie_uuid: sousCategorieUuid,
    });
  };

  if (step === 2) {
    return (
      <div className="container-fluid p-4">
        {/* En-tête */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center bg-warning bg-opacity-10 p-4 rounded-4 border border-warning border-opacity-25">
              <div className="rounded-circle bg-warning p-3 me-4 shadow-sm">
                <FontAwesomeIcon
                  icon={faGift}
                  className="text-white fs-3"
                />
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-2 display-6">Détails du don</h2>
                <p className="text-secondary mb-0 fs-5">
                  Décrivez ce que vous souhaitez offrir
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning border d-flex align-items-center p-4 rounded-4">
                <FontAwesomeIcon icon={faInfoCircle} className="fs-3 me-3 text-warning" />
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
                    className="text-warning me-3 fs-3"
                  />
                  Informations du don
                </h4>
              </div>
              
              <div className="card-body p-4">
                {/* Type de don */}
                <div className="mb-4" style={{ minHeight: "100px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Type de don <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <select
                      className="form-select form-select-lg border border-secondary rounded-4 py-3 px-4 bg-white"
                      style={{ 
                        fontSize: "1.1rem",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        backgroundImage: "none",
                        paddingRight: "3rem"
                      }}
                      value={donData.type_don}
                      onChange={(e) =>
                        setDonData({ ...donData, type_don: e.target.value })
                      }
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="alimentaire">Alimentaire</option>
                      <option value="vestimentaire">Vestimentaire</option>
                      <option value="mobilier">Mobilier</option>
                      <option value="scolaire">Scolaire</option>
                      <option value="autre">Autre</option>
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
                </div>

                {/* Titre */}
                <div className="mb-4" style={{ minHeight: "110px" }}>
                  <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faTag}
                      className="me-2 text-warning"
                    />
                    Titre du don <span className="text-danger ms-1">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Don de vêtements pour enfants"
                      value={donData.titre}
                      onChange={(e) =>
                        setDonData({ ...donData, titre: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4" style={{ minHeight: "120px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Description
                  </label>
                  <textarea
                    className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                    style={{ fontSize: "1.1rem", minHeight: "100px" }}
                    rows={3}
                    placeholder="Décrivez l'objet que vous souhaitez donner..."
                    value={donData.description}
                    onChange={(e) =>
                      setDonData({ ...donData, description: e.target.value })
                    }
                  />
                </div>

                {/* Localisation et Lieu de retrait */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Localisation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Abidjan, Cocody"
                      value={donData.localisation}
                      onChange={(e) =>
                        setDonData({ ...donData, localisation: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Lieu de retrait <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Rue 12, Angré"
                      value={donData.lieu_retrait}
                      onChange={(e) =>
                        setDonData({ ...donData, lieu_retrait: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Contact et Quantité - avec gestion améliorée du téléphone */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="me-2 text-warning"
                      />
                      Numéro de contact <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control form-control-lg border ${phoneError ? 'border-danger' : 'border-secondary'} rounded-4 py-3 px-4`}
                      style={{ fontSize: "1.1rem" }}
                      placeholder="+225 07 09 18 18 64"
                      value={donData.numero}
                      onChange={handlePhoneChange}
                      required
                    />
                    {phoneError && (
                      <div className="text-danger mt-2 small">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                        {phoneError}
                      </div>
                    )}
                    <small className="text-muted mt-1 d-block">
                      Format: +225 suivi de 10 chiffres
                    </small>
                  </div>
                  <div className="col-md-6" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Quantité <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      value={donData.quantite}
                      onChange={(e) =>
                        setDonData({ ...donData, quantite: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Nom du donataire */}
                <div className="mb-4" style={{ minHeight: "100px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Nom du donataire
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                    style={{ fontSize: "1.1rem" }}
                    placeholder="Ex: Association Caritas"
                    value={donData.nom_donataire}
                    onChange={(e) =>
                      setDonData({ ...donData, nom_donataire: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Photo et Catégorie */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              {/* Photo */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="text-warning me-3 fs-3"
                    />
                    Photo
                  </h4>
                </div>
                
                <div className="card-body p-4" style={{ minHeight: "350px" }}>
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
                      onClick={() => document.getElementById('fileInputDon')?.click()}
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
                    <label className="btn btn-outline-warning btn-lg rounded-4 py-3 border fw-bold">
                      <FontAwesomeIcon icon={faCamera} className="me-2" />
                      {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                      <input
                        id="fileInputDon"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={onImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Catégorie principale */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faBox}
                      className="text-warning me-3 fs-3"
                    />
                    Catégorie
                  </h4>
                </div>
                
                <div className="card-body p-4" style={{ minHeight: "200px" }}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-warning mb-3" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="text-secondary">Chargement des catégories...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger rounded-4 py-3">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
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
                            className="form-select form-select-lg border border-secondary rounded-4 py-3 px-4 bg-white"
                            style={{ 
                              fontSize: "1rem",
                              WebkitAppearance: "none",
                              MozAppearance: "none",
                              appearance: "none",
                              backgroundImage: "none",
                              paddingRight: "3rem"
                            }}
                            value={donData.categorie_uuid}
                            onChange={handleCategorieChange}
                            required
                          >
                            <option value="" className="py-2">📦 Choisir une catégorie</option>
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
                              value={donData.sous_categorie_uuid || ""}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const selectedCategory = categories.find(c => c.uuid === donData.categorie_uuid);
    const selectedSousCategorie = sousCategories.find(
      sc => sc.uuid === donData.sous_categorie_uuid
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
              <h2 className="fw-bold text-dark mb-3 display-5">Récapitulatif du don</h2>
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
                    <h4 className="fw-bold text-dark mb-2">Détails du don</h4>
                    <p className="text-secondary mb-0">Informations principales</p>
                  </div>
                  <div className="badge bg-warning bg-opacity-10 text-warning fs-6 p-3 rounded-pill border border-warning">
                    <FontAwesomeIcon icon={faGift} className="me-2" />
                    Don
                  </div>
                </div>

                {/* Informations principales */}
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Titre</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.titre || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Type de don</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.type_don || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Catégorie</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {selectedCategory?.label || "Non renseigné"}
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
                      <p className="text-secondary mb-2 small">Quantité</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.quantite}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Localisation</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.localisation || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Lieu de retrait</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.lieu_retrait || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Contact</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {donData.numero || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  {donData.nom_donataire && (
                    <div className="col-md-6">
                      <div className="p-4 bg-light rounded-4 border">
                        <p className="text-secondary mb-2 small">Donataire</p>
                        <p className="fw-bold text-dark mb-0 fs-5">
                          {donData.nom_donataire}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {donData.description && (
                  <div className="mt-5">
                    <p className="text-secondary mb-3 fw-bold">Description</p>
                    <div className="bg-light rounded-4 p-4 border">
                      <p className="mb-0 fs-5" style={{ lineHeight: 1.8 }}>
                        {donData.description}
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
                  <FontAwesomeIcon icon={faImage} className="me-2 text-warning" />
                  Photo de l'objet
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
  }

  return null;
};

export default DonForm;