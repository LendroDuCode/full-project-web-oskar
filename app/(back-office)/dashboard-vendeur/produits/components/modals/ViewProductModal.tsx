"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faShoppingCart,
  faMoneyBill,
  faMapMarkerAlt,
  faImage,
  faTag,
  faBox,
  faInfoCircle,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faStar,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface Category {
  uuid: string;
  libelle: string;
  type?: string;
}

interface Product {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image: string | null;
  image_key?: string;
  disponible: boolean;
  statut: "publie" | "non_publie" | "en_attente" | "bloque";
  prix: string;
  description: string | null;
  etoile: string;
  vendeurUuid: string;
  boutiqueUuid: string;
  lieu: string;
  condition: string;
  garantie: string;
  categorie_uuid: string;
  categorie: {
    uuid: string;
    libelle: string;
    type: string;
    image: string | null;
    image_key?: string;
  };
  estPublie: boolean;
  estBloque: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
}

interface ViewProductModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
}

const conditions = [
  { value: "neuf", label: "Neuf" },
  { value: "tres_bon_etat", label: "Très bon état" },
  { value: "bon_etat", label: "Bon état" },
  { value: "etat_moyen", label: "État moyen" },
  { value: "a_renover", label: "À rénover" },
];

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  product,
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);

  // Charger les catégories et trouver la catégorie du produit
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
      if (Array.isArray(response)) {
        setCategories(response);
        const foundCategory = response.find(
          (c) => c.uuid === product.categorie_uuid,
        );
        if (foundCategory) {
          setCategory(foundCategory);
        }
      }
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
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

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Obtenir le libellé de l'état
  const getConditionLabel = (conditionValue?: string) => {
    const condition = conditions.find((c) => c.value === conditionValue);
    return condition?.label || "Non spécifié";
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-white">
            <h5 className="modal-title fw-bold text-dark">
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="me-2 text-primary"
              />
              Détails du Produit
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="row">
              {/* Image du produit */}
              <div className="col-md-5">
                <div className="sticky-top" style={{ top: "20px" }}>
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.libelle}
                          className="img-fluid rounded-top"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://via.placeholder.com/400x300/cccccc/ffffff?text=${product.libelle?.charAt(0) || "P"}`;
                          }}
                        />
                      ) : (
                        <div
                          className="bg-light rounded-top d-flex align-items-center justify-content-center"
                          style={{ height: "300px" }}
                        >
                          <FontAwesomeIcon
                            icon={faImage}
                            className="text-muted fs-1"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h4 className="fw-bold text-dark mb-0">
                            {formatPrice(parseFloat(product.prix))}{" "}
                          </h4>
                          <span
                            className={`badge ${product.disponible ? "bg-success" : "bg-danger"}`}
                          >
                            {product.disponible ? "Disponible" : "Indisponible"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations rapides */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="fw-bold text-dark mb-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="me-2 text-primary"
                        />
                        Informations rapides
                      </h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <p className="text-muted mb-1 small">Quantité</p>
                          <p className="fw-bold">{product.quantite || "1"}</p>
                        </div>
                        <div className="col-6">
                          <p className="text-muted mb-1 small">Note</p>
                          <div className="text-warning">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={
                                  i < parseInt(product.etoile || "3")
                                    ? "text-warning"
                                    : "text-light"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <div className="col-6">
                          <p className="text-muted mb-1 small">Garantie</p>
                          <p className="fw-bold">
                            {product.garantie === "oui" ? (
                              <span className="text-success">
                                <FontAwesomeIcon
                                  icon={faCertificate}
                                  className="me-1"
                                />
                                Oui
                              </span>
                            ) : (
                              "Non"
                            )}
                          </p>
                        </div>
                        <div className="col-6">
                          <p className="text-muted mb-1 small">Type</p>
                          <p className="fw-bold">
                            {product.type || "Non spécifié"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails du produit */}
              <div className="col-md-7">
                <div className="mb-4">
                  <h3 className="fw-bold text-dark mb-2">{product.libelle}</h3>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      <FontAwesomeIcon icon={faTag} className="me-1" />
                      {category?.libelle || "Catégorie inconnue"}
                    </span>
                    <span className="badge bg-info bg-opacity-10 text-info">
                      <FontAwesomeIcon icon={faBox} className="me-1" />
                      {getConditionLabel(product.condition)}
                    </span>
                  </div>
                </div>

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold text-dark mb-3">Description</h6>
                    <p className="mb-0">
                      {product.description || "Aucune description disponible."}
                    </p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="fw-bold text-dark mb-3">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2 text-success"
                          />
                          Localisation
                        </h6>
                        <p className="mb-0">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2 text-muted"
                          />
                          {product.lieu || "Non spécifié"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="fw-bold text-dark mb-3">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="me-2 text-info"
                          />
                          Dates
                        </h6>
                        <div className="mb-2">
                          <small className="text-muted">
                            Date de publication
                          </small>
                          <p className="mb-0 fw-bold"></p>
                        </div>
                        {product.createdAt && (
                          <div>
                            <small className="text-muted">
                              Date de création
                            </small>
                            <p className="mb-0 fw-bold">
                              {formatDate(product.createdAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-body">
                    <h6 className="fw-bold text-dark mb-3">
                      Statut du produit
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`rounded-circle ${product.disponible ? "bg-success" : "bg-danger"} p-2`}
                      >
                        <FontAwesomeIcon
                          icon={
                            product.disponible ? faCheckCircle : faTimesCircle
                          }
                          className="text-white"
                        />
                      </div>
                      <div>
                        <p className="fw-bold mb-1">
                          {product.disponible
                            ? "Produit disponible à la vente"
                            : "Produit indisponible"}
                        </p>
                        <p className="text-muted small mb-0">
                          {product.disponible
                            ? "Ce produit est actuellement visible par les acheteurs."
                            : "Ce produit n'est pas visible par les acheteurs."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identifiant */}
                <div className="mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                    ID du produit: {product.uuid}
                  </p>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
              <button className="btn btn-primary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
