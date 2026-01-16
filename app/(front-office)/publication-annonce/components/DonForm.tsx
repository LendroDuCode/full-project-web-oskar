// components/PublishAdModal/DonForm.tsx

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faTag,
  faAlignLeft,
  faMapMarkerAlt,
  faBox,
  faUser,
  faCamera,
  faImage,
  faInfoCircle,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
  faPhone,
  faGlobe,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client"; // Assure-toi que ce client gère les headers (ex: JSON)
import { Category, DonData } from "./constantes/types";

interface DonFormProps {
  donData: DonData;
  conditions: { value: string; label: string }[];
  imagePreview: string | null;
  onChange: (newData: DonData) => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
}

const DonForm: React.FC<DonFormProps> = ({
  donData,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setDonData = (newData: DonData) => onChange(newData);

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          const formattedCategories: Category[] = response.map((item) => ({
            label: item.libelle || item.type || "Sans nom",
            value: item.uuid,
            uuid: item.uuid,
            icon: faList,
          }));
          setCategories(formattedCategories);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err: any) {
        console.error("Erreur chargement catégories:", err);
        setError("Impossible de charger les catégories. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderDonStep2 = () => (
    <div className="p-4">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon icon={faGift} className="text-warning fs-3" />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">Informations principales</h3>
          <p className="text-muted mb-0">Remplissez les détails de votre don</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning border-0 mb-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
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
                Description du don
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                  Titre du don *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg border-light"
                  placeholder="Ex: Feu"
                  value={donData.titre}
                  onChange={(e) =>
                    setDonData({ ...donData, titre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                  Type de don *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg border-light"
                  placeholder="Ex: Allumette"
                  value={donData.type_don}
                  onChange={(e) =>
                    setDonData({ ...donData, type_don: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faGlobe}
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
              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faAlignLeft}
                    className="me-2 text-warning"
                  />
                  Description détaillée *
                </label>
                <textarea
                  className="form-control border-light"
                  rows={4}
                  placeholder="Décrivez ce que vous donnez..."
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
                    <label className="form-label fw-semibold d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Lieu de retrait *
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Ex: Centre jeunesse Abobo Baoulé"
                      value={donData.lieu_retrait}
                      onChange={(e) =>
                        setDonData({ ...donData, lieu_retrait: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="me-2 text-warning"
                      />
                      Quantité *
                    </label>
                    <input
                      type="number"
                      className="form-control border-light"
                      value={donData.quantite}
                      onChange={(e) =>
                        setDonData({ ...donData, quantite: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon icon={faUser} className="text-warning me-2" />
                Informations personnelles
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Nom du donataire *
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Votre nom ou organisation"
                      value={donData.nom_donataire}
                      onChange={(e) =>
                        setDonData({
                          ...donData,
                          nom_donataire: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Numéro de contact *
                    </label>
                    <input
                      type="tel"
                      className="form-control border-light"
                      placeholder="Ex: 000002222222"
                      value={donData.numero}
                      onChange={(e) =>
                        setDonData({ ...donData, numero: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      État du produit
                    </label>
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
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Disponibilité
                    </label>
                    <select
                      className="form-select border-light"
                      value={donData.disponibilite}
                      onChange={(e) =>
                        setDonData({
                          ...donData,
                          disponibilite: e.target.value,
                        })
                      }
                    >
                      <option value="immediate">Immédiate</option>
                      <option value="semaine">Cette semaine</option>
                      <option value="mois">Ce mois-ci</option>
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
                <label className="form-label fw-semibold">Photo du don *</label>
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
                    <p className="text-muted small mb-0">
                      Ajoutez une photo claire
                    </p>
                  </div>
                )}
                <div className="d-grid">
                  <label className="btn btn-outline-warning btn-lg">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    {imagePreview ? "Changer la photo" : "Ajouter une photo"}
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
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Chargement...
                  </div>
                ) : error ? (
                  <div className="text-danger small">Erreur de chargement</div>
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
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.uuid}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="alert alert-warning border-0">
                <small className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Une photo claire augmente les chances que votre don trouve
                  preneur
                </small>
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
        <p className="text-muted">
          Vérifiez les informations avant publication
        </p>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">
                Détails du don
              </h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Titre</p>
                  <p className="fw-bold text-dark">
                    {donData.titre || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Type de don</p>
                  <p className="fw-bold text-dark">
                    {donData.type_don || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Catégorie</p>
                  <p className="fw-bold text-dark">
                    {categories.find((c) => c.uuid === donData.categorie_uuid)
                      ?.label || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Quantité</p>
                  <p className="fw-bold text-dark">{donData.quantite}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">État</p>
                  <p className="fw-bold text-dark">
                    {conditions.find((c) => c.value === donData.condition)
                      ?.label || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Localisation</p>
                  <p className="fw-bold text-dark">
                    {donData.localisation || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Lieu de retrait</p>
                  <p className="fw-bold text-dark">
                    {donData.lieu_retrait || "Non renseigné"}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <p className="text-muted mb-1">Disponibilité</p>
                  <p className="fw-bold text-dark">
                    {donData.disponibilite === "immediate"
                      ? "Immédiate"
                      : donData.disponibilite === "semaine"
                        ? "Cette semaine"
                        : "Ce mois-ci"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-muted mb-2">Description</p>
                <div className="bg-light rounded p-3">
                  <p className="mb-0">
                    {donData.description || "Aucune description"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h6 className="fw-bold text-dark mb-3">
                  Informations de contact
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Nom du donataire</p>
                    <p className="fw-bold text-dark">
                      {donData.nom_donataire || "Non renseigné"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Numéro de contact</p>
                    <p className="fw-bold text-dark">
                      {donData.numero || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold text-dark mb-4">Photo du don</h5>
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
              <div className="alert alert-success border-0">
                <h6 className="fw-bold mb-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Prêt à publier
                </h6>
                <p className="small mb-0">
                  Votre don sera visible par toute la communauté dès validation.
                </p>
              </div>
              <div className="alert alert-info border-0 mt-3">
                <h6 className="fw-bold mb-2">Conseils pour un don réussi</h6>
                <ul className="small mb-0 ps-3">
                  <li>Répondez rapidement aux demandes</li>
                  <li>Précisez bien le lieu de retrait</li>
                  <li>Soyez disponible pour les échanges</li>
                </ul>
              </div>
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
