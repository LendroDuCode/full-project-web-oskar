"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faInfoCircle,
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
import { EchangeFormProps, Category } from "./constantes/types";

const EchangeForm: React.FC<EchangeFormProps> = ({
  echangeData,
  categories: initialCategories,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sousCategories, setSousCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEchangeData = (newData: any) => onChange(newData);

  // ✅ Fonction pour formater le prix avec séparateur de milliers
  const formatPrix = (value: string): string => {
    // Supprimer tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    
    // Formater avec des espaces tous les 3 chiffres
    if (numbers) {
      return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    return '';
  };

  // ✅ Fonction pour extraire la valeur numérique (sans espaces)
  const extractNumericValue = (formattedValue: string): string => {
    return formattedValue.replace(/\s/g, '');
  };

  // ✅ Gestionnaire de changement pour le prix
  const handlePrixChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrix(e.target.value);
    
    // Mettre à jour l'affichage avec le format
    e.target.value = formatted;
    
    // Stocker la valeur sans espaces dans les données
    const numericValue = extractNumericValue(formatted);
    setEchangeData({
      ...echangeData,
      prix: numericValue,
    });
  };

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        console.log("📦 Réponse catégories brute:", response);

        if (Array.isArray(response)) {
          // Filtrer les catégories actives
          const activeCategories = response.filter(
            (cat: Category) => !cat.is_deleted && cat.deleted_at === null
          );

          // Identifier les catégories principales
          const mainCategories = activeCategories.filter(
            (cat: Category) => !cat.path || cat.path === null || cat.path === ""
          );

          // Éliminer les doublons
          const uniqueCategoriesMap = new Map<string, Category>();
          mainCategories.forEach((category: Category) => {
            const existing = uniqueCategoriesMap.get(category.libelle);
            if (!existing) {
              uniqueCategoriesMap.set(category.libelle, category);
            } else {
              const existingId = existing.id || 0;
              const currentId = category.id || 0;
              if (currentId > existingId) {
                uniqueCategoriesMap.set(category.libelle, category);
              }
            }
          });

          const uniqueMainCategories = Array.from(uniqueCategoriesMap.values());

          // Traiter les enfants
          const processedCategories: Category[] = uniqueMainCategories.map((category: Category) => {
            const enfants = category.enfants || [];
            const activeEnfants = enfants.filter(
              (enfant: Category) => !enfant.is_deleted && enfant.deleted_at === null
            );

            const uniqueChildrenMap = new Map<string, Category>();
            activeEnfants.forEach((enfant: Category) => {
              if (!uniqueChildrenMap.has(enfant.libelle)) {
                uniqueChildrenMap.set(enfant.libelle, enfant);
              } else {
                const existing = uniqueChildrenMap.get(enfant.libelle)!;
                if ((enfant.id || 0) > (existing.id || 0)) {
                  uniqueChildrenMap.set(enfant.libelle, enfant);
                }
              }
            });

            const uniqueChildren = Array.from(uniqueChildrenMap.values());

            return {
              ...category,
              enfants: uniqueChildren
            };
          });

          // Trier par libellé
          const sortedCategories = processedCategories.sort(
            (a: Category, b: Category) => a.libelle.localeCompare(b.libelle)
          );

          setCategories(sortedCategories);

          // Si une catégorie est déjà sélectionnée, charger ses sous-catégories
          if (echangeData.categorie_uuid) {
            const selectedCat = sortedCategories.find(c => c.uuid === echangeData.categorie_uuid);
            if (selectedCat?.enfants && selectedCat.enfants.length > 0) {
              setSousCategories(selectedCat.enfants);
            }
          }
        }
      } catch (err: any) {
        console.error("Erreur catégories:", err);
        setError("Impossible de charger les catégories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [echangeData.categorie_uuid]);

  // Gérer le changement de catégorie principale
  const handleCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const categorieUuid = e.target.value;
    const selectedCategory = categories.find(c => c.uuid === categorieUuid);

    setEchangeData({
      ...echangeData,
      categorie_uuid: categorieUuid,
      sous_categorie_uuid: "",
      final_categorie_uuid: categorieUuid
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

    setEchangeData({
      ...echangeData,
      sous_categorie_uuid: sousCategorieUuid,
      final_categorie_uuid: sousCategorieUuid || echangeData.categorie_uuid
    });
  };

  if (step === 2) {
    return (
      <div className="container-fluid p-4">
        {/* En-tête */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center bg-primary bg-opacity-10 p-4 rounded-4 border border-primary border-opacity-25">
              <div className="rounded-circle bg-primary p-3 me-4 shadow-sm">
                <FontAwesomeIcon icon={faExchangeAlt} className="text-white fs-3" />
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-2 display-6">Détails de l'échange</h2>
                <p className="text-secondary mb-0 fs-5">
                  Décrivez ce que vous recherchez
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
                  <FontAwesomeIcon icon={faInfoCircle} className="text-primary me-3 fs-3" />
                  Informations de l'échange
                </h4>
              </div>

              <div className="card-body p-4">
                {/* Titre de l'échange - Obligatoire */}
                <div className="mb-4" style={{ minHeight: "110px" }}>
                  <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                    Titre de l'échange <span className="text-danger ms-1">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: iPhone 12 contre Samsung S21"
                      value={echangeData.nomElementEchange || ""}
                      onChange={(e) =>
                        setEchangeData({
                          ...echangeData,
                          nomElementEchange: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Objet recherché - Obligatoire */}
                <div className="row g-4 mb-4">
                  <div className="col-md-12" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Objet recherché <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Samsung Galaxy S21"
                      value={echangeData.objetDemande || ""}
                      onChange={(e) =>
                        setEchangeData({
                          ...echangeData,
                          objetDemande: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Prix estimé - Obligatoire avec formatage */}
                <div className="row g-4 mb-4">
                  <div className="col-md-12" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Prix estimé (FCFA) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: 100 000"
                      value={echangeData.prix ? formatPrix(echangeData.prix) : ""}
                      onChange={handlePrixChange}
                      inputMode="numeric"
                      required
                    />
                    <small className="text-muted mt-1 d-block">
                      Les espaces sont ajoutés automatiquement pour les milliers
                    </small>
                  </div>
                </div>

                {/* Quantité - Optionnelle */}
                <div className="row g-4 mb-4">
                  <div className="col-md-12" style={{ minHeight: "100px" }}>
                    <label className="form-label fw-bold fs-5 mb-3">
                      Quantité <span className="text-muted">(optionnelle, défaut: 1)</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      value={echangeData.quantite || 1}
                      onChange={(e) =>
                        setEchangeData({
                          ...echangeData,
                          quantite: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>

                {/* Message - Optionnel */}
                <div className="mb-4" style={{ minHeight: "120px" }}>
                  <label className="form-label fw-bold fs-5 mb-3">
                    Message <span className="text-muted">(optionnel)</span>
                  </label>
                  <textarea
                    className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                    style={{ fontSize: "1.1rem", minHeight: "100px" }}
                    rows={3}
                    placeholder="Souhaitez-vous ajouter un message ?"
                    value={echangeData.message || ""}
                    onChange={(e) =>
                      setEchangeData({
                        ...echangeData,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Photo et Catégorie */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              {/* Photo - Obligatoire */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon icon={faCamera} className="text-primary me-3 fs-3" />
                    Photo <span className="text-danger ms-1">*</span>
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
                      className="text-center border border-dashed rounded-4 p-5 mb-4 bg-light bg-opacity-25"
                      onClick={() => document.getElementById('fileInputEchange')?.click()}
                      style={{ 
                        cursor: 'pointer', 
                        minHeight: "250px", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "center",
                        borderColor: "#0d6efd"
                      }}
                    >
                      <FontAwesomeIcon icon={faImage} className="fs-1 mb-3 text-primary" />
                      <p className="text-secondary fs-6 mb-0">
                        Cliquez pour ajouter une photo
                      </p>
                      <p className="text-danger small mt-2">* Champ obligatoire</p>
                    </div>
                  )}

                  <div className="d-grid mt-3">
                    <label className="btn btn-outline-primary btn-lg rounded-4 py-3 border fw-bold">
                      <FontAwesomeIcon icon={faCamera} className="me-2" />
                      {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                      <input
                        id="fileInputEchange"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={onImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Catégorie principale - Obligatoire */}
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
                    <FontAwesomeIcon icon={faTag} className="text-primary me-3 fs-3" />
                    Catégorie <span className="text-danger ms-1">*</span>
                  </h4>
                </div>

                <div className="card-body p-4" style={{ minHeight: "200px" }}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary mb-3" role="status">
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
                            value={echangeData.categorie_uuid || ""}
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
                          <div className="position-absolute end-0 top-0 h-100 d-flex align-items-center pe-4" style={{ pointerEvents: "none", zIndex: 2 }}>
                            <FontAwesomeIcon icon={faChevronDown} className="text-secondary" style={{ fontSize: "1rem" }} />
                          </div>
                        </div>
                      </div>

                      {sousCategories.length > 0 && (
                        <div className="mb-3" style={{ minHeight: "100px" }}>
                          <label className="form-label fw-bold fs-6 mb-3">
                            Sous-catégorie <span className="text-info">(Recommandé)</span>
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
                              value={echangeData.sous_categorie_uuid || ""}
                              onChange={handleSousCategorieChange}
                            >
                              <option value="" className="py-2">🔽 Sous-catégorie</option>
                              {sousCategories.map((sousCat) => (
                                <option key={sousCat.uuid} value={sousCat.uuid} className="py-2">
                                  {sousCat.libelle}
                                </option>
                              ))}
                            </select>
                            <div className="position-absolute end-0 top-0 h-100 d-flex align-items-center pe-4" style={{ pointerEvents: "none", zIndex: 2 }}>
                              <FontAwesomeIcon icon={faChevronDown} className="text-secondary" style={{ fontSize: "1rem" }} />
                            </div>
                          </div>
                          <div className="mt-2 p-2 bg-info bg-opacity-10 rounded-3">
                            <small className="text-info">
                              <i className="fa-regular fa-circle-info me-1"></i>
                              {echangeData.sous_categorie_uuid ? (
                                <>✅ La sous-catégorie sélectionnée sera enregistrée</>
                              ) : (
                                <>👉 Sélectionnez une sous-catégorie pour un ciblage plus précis</>
                              )}
                            </small>
                          </div>
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
    const selectedCategory = categories.find(c => c.uuid === echangeData.categorie_uuid);
    const selectedSousCategorie = sousCategories.find(
      sc => sc.uuid === echangeData.sous_categorie_uuid
    );

    // ✅ Fonction pour formater l'affichage du prix dans le récapitulatif
    const formatPrixDisplay = (prix: string): string => {
      if (!prix) return "Non renseigné";
      const numbers = prix.replace(/\D/g, '');
      if (numbers) {
        const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `${formatted} FCFA`;
      }
      return "Non renseigné";
    };

    return (
      <div className="container-fluid p-4">
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1" />
              </div>
              <h2 className="fw-bold text-dark mb-3 display-5">Récapitulatif de l'échange</h2>
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
                <div className="d-flex justify-content-between align-items-start mb-5 pb-4 border-bottom">
                  <div>
                    <h4 className="fw-bold text-dark mb-2">Détails de l'échange</h4>
                    <p className="text-secondary mb-0">Informations principales</p>
                  </div>
                  <div className="badge bg-primary bg-opacity-10 text-primary fs-6 p-3 rounded-pill border border-primary">
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                    Échange
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Titre</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {echangeData.nomElementEchange || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">
                        {selectedSousCategorie ? "Sous-catégorie" : "Catégorie"}
                      </p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {selectedSousCategorie?.libelle || selectedCategory?.libelle || "Non renseigné"}
                      </p>
                      {selectedCategory && selectedSousCategorie && (
                        <p className="text-secondary mb-0 small">
                          Catégorie principale: {selectedCategory.libelle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Vous recherchez</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {echangeData.objetDemande || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Prix estimé</p>
                      <p className="fw-bold text-dark mb-0 fs-5">
                        {formatPrixDisplay(echangeData.prix)}
                      </p>
                    </div>
                  </div>
                  {echangeData.quantite && parseInt(echangeData.quantite) > 1 && (
                    <div className="col-md-6">
                      <div className="p-4 bg-light rounded-4 border">
                        <p className="text-secondary mb-2 small">Quantité</p>
                        <p className="fw-bold text-dark mb-0 fs-5">
                          {echangeData.quantite}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {echangeData.message && (
                  <div className="mt-5">
                    <p className="text-secondary mb-3 fw-bold">Message</p>
                    <div className="bg-light rounded-4 p-4 border">
                      <p className="mb-0 fs-5" style={{ lineHeight: 1.8 }}>
                        {echangeData.message}
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
                  <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
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
                    <FontAwesomeIcon icon={faImage} className="text-secondary fs-1 mb-3" />
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

export default EchangeForm;