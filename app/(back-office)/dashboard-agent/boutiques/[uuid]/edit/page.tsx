"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTimes,
  faStore,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export default function EditBoutiquePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    type_boutique_uuid: "",
    politique_retour: "",
    conditions_utilisation: "",
  });

  const [typeBoutiques, setTypeBoutiques] = useState<any[]>([]);

  useEffect(() => {
    fetchBoutique();
    fetchTypeBoutiques();
  }, [uuid]);

  const fetchBoutique = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.BOUTIQUES.DETAIL(uuid));

      setFormData({
        nom: response.data.nom || "",
        description: response.data.description || "",
        type_boutique_uuid: response.data.type_boutique_uuid || "",
        politique_retour: response.data.politique_retour || "",
        conditions_utilisation: response.data.conditions_utilisation || "",
      });
    } catch (err: any) {
      setError("Erreur lors du chargement de la boutique");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  const fetchTypeBoutiques = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.LIST);
      setTypeBoutiques(response.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des types de boutique");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      await api.put(API_ENDPOINTS.BOUTIQUES.DETAIL(uuid), formData);

      setSuccessMessage("Boutique mise à jour avec succès !");
      setTimeout(() => {
        router.push(`/boutiques/${uuid}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="fs-3 text-primary"
          />
          <p className="mt-3">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            onClick={() => router.push(`/boutiques/${uuid}`)}
            className="btn btn-outline-secondary btn-sm mb-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour aux détails
          </button>
          <h1 className="h3 fw-bold mb-0">Modifier la boutique</h1>
        </div>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="alert alert-danger mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          {successMessage}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faStore} className="me-2" />
                  Nom de la boutique *
                </label>
                <input
                  type="text"
                  name="nom"
                  className="form-control"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Nom de votre boutique"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Type de boutique *
                </label>
                <select
                  name="type_boutique_uuid"
                  className="form-select"
                  value={formData.type_boutique_uuid}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {typeBoutiques.map((type) => (
                    <option key={type.uuid} value={type.uuid}>
                      {type.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de votre boutique..."
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Politique de retour
                </label>
                <textarea
                  name="politique_retour"
                  className="form-control"
                  rows={3}
                  value={formData.politique_retour}
                  onChange={handleChange}
                  placeholder="Votre politique de retour..."
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Conditions d'utilisation
                </label>
                <textarea
                  name="conditions_utilisation"
                  className="form-control"
                  rows={3}
                  value={formData.conditions_utilisation}
                  onChange={handleChange}
                  placeholder="Conditions d'utilisation de votre boutique..."
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.push(`/boutiques/${uuid}`)}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
