"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faInfoCircle,
  faMapMarkerAlt,
  faBox,
  faTag,
  faImage,
  faCamera,
  faCheckCircle,
  faChevronDown,
  faTimes,
  faPhone,
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
  categories: propCategories,
}) => {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [sousCategories, setSousCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDonData = (newData: any) => onChange(newData);

  // S'assurer que la quantité est toujours à 1
  useEffect(() => {
    if (donData.quantite !== "1") {
      setDonData({
        ...donData,
        quantite: "1",
      });
    }
  }, [donData.quantite]);

  // Initialiser is_whatsapp à 1 (true) par défaut
  useEffect(() => {
    if (donData.is_whatsapp === undefined) {
      setDonData({
        ...donData,
        is_whatsapp: 1,
        quantite: "1",
      });
    }
  }, [donData.is_whatsapp]);

  // Utiliser les catégories des props si disponibles, sinon les charger
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      console.log("📦 Utilisation des catégories depuis les props:", propCategories.length);
      setLocalCategories(propCategories);

      if (donData.categorie_uuid) {
        const selectedCat = propCategories.find(c => c.uuid === donData.categorie_uuid);
        if (selectedCat?.enfants && selectedCat.enfants.length > 0) {
          setSousCategories(selectedCat.enfants);
        }
      }
    } else {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
          console.log("📦 Réponse catégories brute:", response);

          if (Array.isArray(response)) {
            const activeCategories = response.filter(
              (cat: Category) => !cat.is_deleted && cat.deleted_at === null
            );

            const mainCategories = activeCategories.filter(
              (cat: Category) => !cat.path || cat.path === null || cat.path === ""
            );

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

            const processedCategories: Category[] = uniqueMainCategories.map((category: Category) => {
              const enfants = category.enfants || [];
              const activeEnfants = enfants.filter(
                (enfant: Category) => !enfant.is_deleted && enfant.deleted_at === null
              );

              return {
                ...category,
                enfants: activeEnfants
              };
            });

            const sortedCategories = processedCategories.sort(
              (a: Category, b: Category) => a.libelle.localeCompare(b.libelle)
            );

            setLocalCategories(sortedCategories);

            if (donData.categorie_uuid) {
              const selectedCat = sortedCategories.find(c => c.uuid === donData.categorie_uuid);
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
    }
  }, [propCategories, donData.categorie_uuid]);

  const handleCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const categorieUuid = e.target.value;
    const selectedCategory = localCategories.find(c => c.uuid === categorieUuid);

    setDonData({
      ...donData,
      categorie_uuid: categorieUuid,
      sous_categorie_uuid: "",
      quantite: "1",
    });

    if (selectedCategory?.enfants && selectedCategory.enfants.length > 0) {
      setSousCategories(selectedCategory.enfants);
    } else {
      setSousCategories([]);
    }
  };

  const handleSousCategorieChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const sousCategorieUuid = e.target.value;
    setDonData({
      ...donData,
      sous_categorie_uuid: sousCategorieUuid,
      quantite: "1",
    });
  };

  const handleNumeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9+\s]/g, '');
    setDonData({
      ...donData,
      numero: cleaned,
      quantite: "1",
    });
  };

  const handleWhatsappToggle = () => {
    setDonData({
      ...donData,
      is_whatsapp: donData.is_whatsapp === 1 ? 0 : 1,
      quantite: "1",
    });
  };

  if (step === 2) {
    return (
      <div className="container-fluid p-4">
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex align-items-center p-4 rounded-4 border" style={{ backgroundColor: "rgba(111, 66, 193, 0.1)", borderColor: "#6f42c1" }}>
              <div className="rounded-circle p-3 me-4 shadow-sm" style={{ backgroundColor: "#6f42c1" }}>
                <FontAwesomeIcon icon={faGift} className="text-white fs-3" />
              </div>
              <div>
                <h2 className="fw-bold mb-2 display-6" style={{ color: "#000000" }}>Détails du don</h2>
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
          <div className="col-lg-8">
            <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
              <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                <h4 className="fw-bold mb-0 d-flex align-items-center" style={{ color: "#000000" }}>
                  <FontAwesomeIcon icon={faInfoCircle} className="me-3 fs-3" style={{ color: "#6f42c1" }} />
                  Informations du don
                </h4>
              </div>

              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center" style={{ color: "#000000" }}>
                    <FontAwesomeIcon icon={faTag} className="me-2" style={{ color: "#6f42c1" }} />
                    Titre du don <span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                    style={{ fontSize: "1.1rem" }}
                    placeholder="Ex: Don de vêtements pour enfants"
                    value={donData.titre || ""}
                    onChange={(e) => setDonData({ ...donData, titre: e.target.value, quantite: "1" })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold fs-5 mb-3" style={{ color: "#000000" }}>
                    Description <span className="text-muted">(optionnelle)</span>
                  </label>
                  <textarea
                    className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                    style={{ fontSize: "1.1rem", minHeight: "100px" }}
                    rows={3}
                    placeholder="Décrivez l'objet que vous souhaitez donner..."
                    value={donData.description || ""}
                    onChange={(e) => setDonData({ ...donData, description: e.target.value, quantite: "1" })}
                  />
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-12">
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center" style={{ color: "#000000" }}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: "#6f42c1" }} />
                      Lieu de retrait <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border border-secondary rounded-4 py-3 px-4"
                      style={{ fontSize: "1.1rem" }}
                      placeholder="Ex: Rue 12, Angré, Abidjan"
                      value={donData.lieu_retrait || ""}
                      onChange={(e) => setDonData({ ...donData, lieu_retrait: e.target.value, quantite: "1" })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                      </div>
                      <div>
                        <label className="fw-bold mb-0" style={{ color: "#000000" }}>
                          Disponible sur WhatsApp
                        </label>
                        <p className="text-muted small mb-0">
                          Être contacté facilement via WhatsApp
                        </p>
                      </div>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ 
                          width: "3rem", 
                          height: "1.5rem",
                          backgroundColor: donData.is_whatsapp === 1 ? "#25D366" : "#ccc",
                          borderColor: donData.is_whatsapp === 1 ? "#25D366" : "#ccc",
                          cursor: "pointer"
                        }}
                        checked={donData.is_whatsapp === 1}
                        onChange={handleWhatsappToggle}
                      />
                    </div>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    Activez cette option si vous souhaitez être contacté via WhatsApp
                  </small>
                </div>

                {donData.is_whatsapp === 1 && (
                  <div className="mb-4">
                    <label className="form-label fw-bold fs-5 mb-3 d-flex align-items-center">
                      <FontAwesomeIcon icon={faPhone} className="me-2" style={{ color: "#6f42c1" }} />
                      Numéro de téléphone <span className="text-danger ms-1">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border rounded-start-4 px-4">
                        <FontAwesomeIcon icon={faPhone} style={{ color: "#6f42c1" }} />
                      </span>
                      <input
                        type="tel"
                        className="form-control form-control-lg border border-secondary rounded-end-4 py-3 px-4"
                        style={{ fontSize: "1.1rem" }}
                        placeholder="Ex: +225 07 XX XX XX XX"
                        value={donData.numero || ""}
                        onChange={handleNumeroChange}
                        required={donData.is_whatsapp === 1}
                      />
                    </div>
                    <small className="text-muted mt-2 d-block">
                      Ce numéro permettra aux personnes intéressées de vous contacter via WhatsApp
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 d-flex align-items-center" style={{ color: "#000000" }}>
                    <FontAwesomeIcon icon={faCamera} className="me-3 fs-3" style={{ color: "#6f42c1" }} />
                    Photo <span className="text-danger ms-1">*</span>
                  </h4>
                </div>

                <div className="card-body p-4">
                  {imagePreview ? (
                    <div className="position-relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded-4 border shadow-sm"
                        style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
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
                      onClick={() => document.getElementById('fileInputDon')?.click()}
                      style={{
                        cursor: 'pointer',
                        minHeight: "250px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        borderColor: "#6f42c1"
                      }}
                    >
                      <FontAwesomeIcon icon={faImage} className="fs-1 mb-3" style={{ color: "#6f42c1" }} />
                      <p className="text-secondary fs-6 mb-0">Cliquez pour ajouter une photo</p>
                      <p className="text-danger small mt-2">* Champ obligatoire</p>
                    </div>
                  )}

                  <div className="d-grid mt-3">
                    <label
                      className="btn btn-lg rounded-4 py-3 border fw-bold"
                      style={{
                        borderColor: "#6f42c1",
                        color: "#6f42c1",
                        backgroundColor: "transparent"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#6f42c1";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#6f42c1";
                      }}
                    >
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

              <div className="card border shadow-lg rounded-4 mb-4 hover-shadow transition-all">
                <div className="card-header bg-white border-bottom py-4 px-4 rounded-top-4">
                  <h4 className="fw-bold mb-0 d-flex align-items-center" style={{ color: "#000000" }}>
                    <FontAwesomeIcon icon={faBox} className="me-3 fs-3" style={{ color: "#6f42c1" }} />
                    Catégorie <span className="text-danger ms-1">*</span>
                  </h4>
                </div>

                <div className="card-body p-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border mb-3" role="status" style={{ color: "#6f42c1" }}>
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
                      <div className="mb-4">
                        <label className="form-label fw-bold fs-6 mb-3" style={{ color: "#000000" }}>
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
                            value={donData.categorie_uuid || ""}
                            onChange={handleCategorieChange}
                            required
                          >
                            <option value="">📦 Choisir une catégorie</option>
                            {localCategories.map((cat) => (
                              <option key={cat.uuid} value={cat.uuid}>
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
                        <div className="mb-3">
                          <label className="form-label fw-bold fs-6 mb-3" style={{ color: "#000000" }}>
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
                              value={donData.sous_categorie_uuid || ""}
                              onChange={handleSousCategorieChange}
                            >
                              <option value="">🔽 Sélectionner une sous-catégorie</option>
                              {sousCategories.map((sousCat) => (
                                <option key={sousCat.uuid} value={sousCat.uuid}>
                                  {sousCat.libelle}
                                </option>
                              ))}
                            </select>
                            <div className="position-absolute end-0 top-0 h-100 d-flex align-items-center pe-4" style={{ pointerEvents: "none", zIndex: 2 }}>
                              <FontAwesomeIcon icon={faChevronDown} className="text-secondary" style={{ fontSize: "1rem" }} />
                            </div>
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
    const selectedCategory = localCategories.find(c => c.uuid === donData.categorie_uuid);
    const selectedSousCategorie = sousCategories.find(
      sc => sc.uuid === donData.sous_categorie_uuid
    );

    return (
      <div className="container-fluid p-4">
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-center">
              <div className="rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-4" style={{ backgroundColor: "rgba(111, 66, 193, 0.1)" }}>
                <FontAwesomeIcon icon={faCheckCircle} className="fs-1" style={{ color: "#6f42c1" }} />
              </div>
              <h2 className="fw-bold mb-3 display-5" style={{ color: "#000000" }}>Récapitulatif du don</h2>
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
                    <h4 className="fw-bold mb-2" style={{ color: "#000000" }}>Détails du don</h4>
                    <p className="text-secondary mb-0">Informations principales</p>
                  </div>
                  <div className="badge fs-6 p-3 rounded-pill border" style={{ backgroundColor: "rgba(111, 66, 193, 0.1)", color: "#6f42c1", borderColor: "#6f42c1" }}>
                    <FontAwesomeIcon icon={faGift} className="me-2" />
                    Don
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Titre</p>
                      <p className="fw-bold mb-0 fs-5" style={{ color: "#000000" }}>
                        {donData.titre || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">
                        {selectedSousCategorie ? "Sous-catégorie" : "Catégorie"}
                      </p>
                      <p className="fw-bold mb-0 fs-5" style={{ color: "#000000" }}>
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
                      <p className="text-secondary mb-2 small">Lieu de retrait</p>
                      <p className="fw-bold mb-0 fs-5" style={{ color: "#000000" }}>
                        {donData.lieu_retrait || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-light rounded-4 border">
                      <p className="text-secondary mb-2 small">Contact WhatsApp</p>
                      <p className="fw-bold mb-0 fs-5" style={{ color: "#000000" }}>
                        {donData.is_whatsapp === 1 ? (
                          <span className="text-success">✅ Disponible</span>
                        ) : (
                          <span className="text-muted">❌ Non disponible</span>
                        )}
                      </p>
                      {donData.is_whatsapp === 1 && donData.numero && (
                        <p className="text-secondary mb-0 small mt-2">
                          Numéro: {donData.numero}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {donData.description && (
                  <div className="mt-5">
                    <p className="text-secondary mb-3 fw-bold">Description</p>
                    <div className="bg-light rounded-4 p-4 border">
                      <p className="mb-0 fs-5" style={{ lineHeight: 1.8, color: "#000000" }}>
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
                <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: "#000000" }}>
                  <FontAwesomeIcon icon={faImage} className="me-2" style={{ color: "#6f42c1" }} />
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

export default DonForm;