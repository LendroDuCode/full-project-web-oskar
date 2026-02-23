// app/(front-office)/publication-annonce/components/DonForm.tsx

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingHeart,
  faInfoCircle,
  faMapMarkerAlt,
  faBox,
  faPhone,
  faUser,
  faImage,
  faCamera,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { DonFormProps, Category } from "./constantes/types";

const DonForm: React.FC<DonFormProps> = ({
  donData,
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

  const setDonData = (newData: any) => onChange(newData);

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
            icon: faHandHoldingHeart,
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

  const renderDonStep2 = () => (
    <div className="p-4">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon
            icon={faHandHoldingHeart}
            className="text-warning fs-3"
          />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">Détails du don</h3>
          <p className="text-muted mb-0">
            Décrivez ce que vous souhaitez donner
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
                  className="text-warning me-2"
                />
                Informations sur le don
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Titre du don *</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-light"
                  placeholder="Ex: Don de vêtements bébé"
                  value={donData.titre}
                  onChange={(e) =>
                    setDonData({ ...donData, titre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Description *</label>
                <textarea
                  className="form-control border-light"
                  rows={3}
                  placeholder="Décrivez votre don en détail..."
                  value={donData.description}
                  onChange={(e) =>
                    setDonData({ ...donData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Localisation *
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Ex: Abidjan, Cocody"
                      value={donData.localisation}
                      onChange={(e) =>
                        setDonData({ ...donData, localisation: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Lieu de retrait
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Adresse précise"
                      value={donData.lieu_retrait}
                      onChange={(e) =>
                        setDonData({ ...donData, lieu_retrait: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="me-2 text-warning"
                      />
                      Quantité
                    </label>
                    <input
                      type="number"
                      className="form-control border-light"
                      value={donData.quantite}
                      onChange={(e) =>
                        setDonData({ ...donData, quantite: e.target.value })
                      }
                      min="1"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="me-2 text-warning"
                      />
                      Numéro de contact
                    </label>
                    <input
                      type="tel"
                      className="form-control border-light"
                      placeholder="Ex: 00225 0546895765"
                      value={donData.numero}
                      onChange={(e) =>
                        setDonData({ ...donData, numero: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="me-2 text-warning"
                      />
                      Nom du donataire
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="À qui s'adresse ce don ?"
                      value={donData.nom_donataire}
                      onChange={(e) =>
                        setDonData({
                          ...donData,
                          nom_donataire: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Condition</label>
                    <select
                      className="form-select border-light"
                      value={donData.condition}
                      onChange={(e) =>
                        setDonData({ ...donData, condition: e.target.value })
                      }
                    >
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
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
                  className="text-warning me-2"
                />
                Photo & Catégorie
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Photo du don</label>
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
                  <label className="btn btn-outline-warning btn-lg">
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
                    value={donData.categorie_uuid}
                    onChange={(e) =>
                      setDonData({ ...donData, categorie_uuid: e.target.value })
                    }
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
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

  const renderDonStep3 = () => (
    <div className="p-4">
      <div className="text-center mb-5">
        <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-3">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Récapitulatif du don</h3>
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
                    {donData.titre || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Localisation</p>
                  <p className="fw-bold text-dark">
                    {donData.localisation || "Non renseignée"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Catégorie</p>
                  <p className="fw-bold text-dark">
                    {categories.find((c) => c.uuid === donData.categorie_uuid)
                      ?.label || "Non renseignée"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Quantité</p>
                  <p className="fw-bold text-dark">{donData.quantite}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Condition</p>
                  <p className="fw-bold text-dark">
                    {conditions.find((c) => c.value === donData.condition)
                      ?.label || "Non renseignée"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Téléphone</p>
                  <p className="fw-bold text-dark">
                    {donData.numero || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-2">Description</p>
                <div className="bg-light rounded p-3">
                  <p className="mb-0">
                    {donData.description || "Non renseignée"}
                  </p>
                </div>
              </div>
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

  if (step === 2) return renderDonStep2();
  if (step === 3) return renderDonStep3();
  return null;
};

export default DonForm;
