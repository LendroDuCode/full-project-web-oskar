// app/(front-office)/publication-annonce/components/ExchangeForm.tsx

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faInfoCircle,
  faBox,
  faHandHoldingHeart,
  faImage,
  faCamera,
  faPhone,
  faTag,
  faCheckCircle,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEchangeData = (newData: any) => onChange(newData);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          const formatted: Category[] = response.map((item) => ({
            label: item.libelle || item.type || "Sans nom",
            value: item.uuid,
            uuid: item.uuid,
            icon: faExchangeAlt,
          }));
          setCategories(formatted);
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

    if (initialCategories.length === 0) {
      fetchCategories();
    }
  }, [initialCategories]);

  // Le reste de votre composant reste identique...
  // (je garde le code que vous aviez déjà pour la partie rendu)

  if (step === 2) {
    return (
      <div className="p-4">
        <div className="d-flex align-items-center mb-5">
          <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
            <FontAwesomeIcon
              icon={faExchangeAlt}
              className="text-primary fs-3"
            />
          </div>
          <div>
            <h3 className="fw-bold text-dark mb-1">Détails de l'échange</h3>
            <p className="text-muted mb-0">
              Décrivez ce que vous proposez et recherchez
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-warning border-0 mb-4">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" /> {error}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-4">
                <h5 className="fw-bold mb-0 text-dark">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-primary me-2"
                  />
                  Objets de l'échange
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faTag}
                      className="me-2 text-primary"
                    />
                    Titre de l'échange *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg border-light"
                    placeholder="Ex: Cahier vs Galaxy S21"
                    value={echangeData.nomElementEchange}
                    onChange={(e) =>
                      setEchangeData({
                        ...echangeData,
                        nomElementEchange: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold d-block mb-3">
                    Type d'échange *
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check form-check-card">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="typeEchange"
                        id="typeProduit"
                        checked={echangeData.typeEchange === "produit"}
                        onChange={() =>
                          setEchangeData({
                            ...echangeData,
                            typeEchange: "produit",
                          })
                        }
                      />
                      <label
                        className="form-check-label border rounded-3 p-3 w-100 text-center cursor-pointer"
                        htmlFor="typeProduit"
                      >
                        <FontAwesomeIcon
                          icon={faBox}
                          className="fs-3 d-block mb-2 text-primary"
                        />
                        <span className="fw-semibold">Produit</span>
                      </label>
                    </div>
                    <div className="form-check form-check-card">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="typeEchange"
                        id="typeService"
                        checked={echangeData.typeEchange === "service"}
                        onChange={() =>
                          setEchangeData({
                            ...echangeData,
                            typeEchange: "service",
                          })
                        }
                      />
                      <label
                        className="form-check-label border rounded-3 p-3 w-100 text-center cursor-pointer"
                        htmlFor="typeService"
                      >
                        <FontAwesomeIcon
                          icon={faHandHoldingHeart}
                          className="fs-3 d-block mb-2 text-primary"
                        />
                        <span className="fw-semibold">Service</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Objet proposé *
                      </label>
                      <input
                        type="text"
                        className="form-control border-light"
                        placeholder="Ex: iPhone 12 Pro"
                        value={echangeData.objetPropose}
                        onChange={(e) =>
                          setEchangeData({
                            ...echangeData,
                            objetPropose: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Objet recherché *
                      </label>
                      <input
                        type="text"
                        className="form-control border-light"
                        placeholder="Ex: Samsung Galaxy S21"
                        value={echangeData.objetDemande}
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
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="me-2 text-primary"
                        />
                        Numéro de contact *
                      </label>
                      <input
                        type="tel"
                        className="form-control border-light"
                        placeholder="Ex: 00225 0546895765"
                        value={echangeData.numero}
                        onChange={(e) =>
                          setEchangeData({
                            ...echangeData,
                            numero: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        className="form-control border-light"
                        value={echangeData.quantite}
                        onChange={(e) =>
                          setEchangeData({
                            ...echangeData,
                            quantite: e.target.value,
                          })
                        }
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Prix estimé (FCFA)
                      </label>
                      <input
                        type="number"
                        className="form-control border-light"
                        placeholder="Ex: 100000"
                        value={echangeData.prix}
                        onChange={(e) =>
                          setEchangeData({
                            ...echangeData,
                            prix: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Message</label>
                      <textarea
                        className="form-control border-light"
                        rows={2}
                        placeholder="Souhaitez-vous procéder à un échange ?"
                        value={echangeData.message}
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
            </div>
          </div>
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-sm sticky-top"
              style={{ top: "20px" }}
            >
              <div className="card-header bg-white border-0 py-4">
                <h5 className="fw-bold mb-0 text-dark">
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="text-primary me-2"
                  />
                  Photo & Catégorie
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Photo de l'objet
                  </label>
                  {imagePreview ? (
                    <div className="position-relative mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded-3 border"
                        style={{
                          maxHeight: "200px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                      <button
                        type="button"
                        onClick={onRemoveImage}
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                        style={{ width: "32px", height: "32px" }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center border-dashed border-2 border-light rounded-3 p-5 mb-3 bg-light bg-opacity-25">
                      <FontAwesomeIcon
                        icon={faImage}
                        className="text-muted fs-1 mb-3"
                      />
                      <p className="text-muted small mb-0">Ajoutez une photo</p>
                    </div>
                  )}
                  <div className="d-grid">
                    <label className="btn btn-outline-primary btn-lg">
                      <FontAwesomeIcon icon={faCamera} className="me-2" />
                      {imagePreview ? "Changer" : "Ajouter une photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={onImageUpload}
                      />
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Catégorie *</label>
                  {loading ? (
                    <div className="text-center py-2">
                      <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                      Chargement...
                    </div>
                  ) : error ? (
                    <div className="text-danger small">Erreur</div>
                  ) : (
                    <select
                      className="form-select border-light"
                      value={echangeData.categorie_uuid}
                      onChange={(e) =>
                        setEchangeData({
                          ...echangeData,
                          categorie_uuid: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Sélectionnez</option>
                      {categories.map((cat) => (
                        <option key={cat.uuid} value={cat.uuid}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
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
    return (
      <div className="p-4">
        <div className="text-center mb-5">
          <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success fs-1"
            />
          </div>
          <h3 className="fw-bold text-dark mb-2">Récapitulatif de l'échange</h3>
          <p className="text-muted">Vérifiez avant publication</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">
                  Détails
                </h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Titre</p>
                    <p className="fw-bold text-dark">
                      {echangeData.nomElementEchange || "Non renseigné"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Type</p>
                    <p className="fw-bold text-dark">
                      {echangeData.typeEchange === "produit"
                        ? "Produit"
                        : "Service"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Vous proposez</p>
                    <p className="fw-bold text-dark">
                      {echangeData.objetPropose || "Non renseigné"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Vous recherchez</p>
                    <p className="fw-bold text-dark">
                      {echangeData.objetDemande || "Non renseigné"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Catégorie</p>
                    <p className="fw-bold text-dark">
                      {categories.find(
                        (c) => c.uuid === echangeData.categorie_uuid,
                      )?.label || "Non renseigné"}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Quantité</p>
                    <p className="fw-bold text-dark">{echangeData.quantite}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Téléphone</p>
                    <p className="fw-bold text-dark">
                      {echangeData.numero || "Non renseigné"}
                    </p>
                  </div>
                </div>
                {echangeData.message && (
                  <div className="mt-4">
                    <p className="text-muted mb-2">Message</p>
                    <div className="bg-light rounded p-3">
                      <p className="mb-0">{echangeData.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-4">Photo</h5>
                {imagePreview ? (
                  <div className="text-center mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-fluid rounded-3 border shadow-sm"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="text-center border-dashed border-2 border-light rounded-3 p-4 mb-4">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="text-muted small mb-0">Aucune photo</p>
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
