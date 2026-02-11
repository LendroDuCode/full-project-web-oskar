"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faHeart as faHeartSolid,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faStore,
  faUser,
  faCalendar,
  faTrash,
  faChevronDown,
  faChevronUp,
  faBoxOpen,
  faMoneyBillWave,
  faCheck,
  faCircle,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatRelativeTime,
  truncateText,
  getStatusLabel,
  getTypeLabel,
} from "@/app/shared/utils/formatters";
import { FavoriItem } from "../type/favoris";

interface DataTableProps {
  data: FavoriItem[];
  loading?: boolean;
  error?: string | null;
  onRemoveFavorite?: (uuid: string, type: string, itemUuid: string) => void;
  onRefresh?: () => void;
  onView?: (uuid: string, type: string, itemUuid: string) => void; // Ajouté
  selectedItems?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectItem?: (uuid: string, checked: boolean) => void;
  className?: string;
}

export default function DataTable({
  data,
  loading = false,
  error = null,
  onRemoveFavorite,
  onRefresh,
  onView, // Ajouté
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  className = "",
}: DataTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set(),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const selectedItemsSet = useMemo(
    () => new Set(selectedItems),
    [selectedItems],
  );

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);
  const allSelectedOnCurrentPage =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedItemsSet.has(item.uuid));
  const allSelected = data.length > 0 && selectedItemsSet.size === data.length;

  const getTypeConfig = useCallback((type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        bgColor: `${colors.type.product}15`,
        badgeClass: "bg-primary bg-opacity-10 text-primary border-0",
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        bgColor: `${colors.type.don}15`,
        badgeClass: "bg-success bg-opacity-10 text-success border-0",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        bgColor: `${colors.type.exchange}15`,
        badgeClass: "bg-info bg-opacity-10 text-info border-0",
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  }, []);

  const getItemDetails = useCallback((item: FavoriItem) => {
    switch (item.type) {
      case "produit":
        return {
          title: item.produit?.libelle || "Produit sans nom",
          description: item.produit?.description,
          image: item.produit?.image || `https://via.placeholder.com/64?text=P`,
          price: item.produit?.prix,
          quantity: item.produit?.quantite || 1,
          status: item.produit?.statut,
          estPublie: item.produit?.estPublie,
          estBloque: item.produit?.estBloque,
          category: item.produit?.categorie?.libelle,
          seller: item.produit?.vendeur,
          sellerName: item.produit?.vendeur
            ? `${item.produit.vendeur.prenoms} ${item.produit.vendeur.nom}`
            : "Vendeur inconnu",
          boutique: item.produit?.boutique,
          itemUuid: item.itemUuid,
        };
      case "don":
        return {
          title: item.don?.nom || "Don sans nom",
          description: item.don?.description,
          image: item.don?.image || `https://via.placeholder.com/64?text=D`,
          price: null,
          quantity: item.don?.quantite || 1,
          status: item.don?.statut,
          estPublie: item.don?.estPublie,
          estBloque: item.don?.est_bloque,
          category: item.don?.categorie,
          seller: { name: item.don?.nom_donataire || "Donateur" },
          sellerName: item.don?.nom_donataire || "Donateur",
          date: item.don?.date_debut,
          itemUuid: item.itemUuid,
        };
      case "echange":
        return {
          title: item.echange?.nomElementEchange || "Échange sans nom",
          description: item.echange?.nomElementEchange,
          image: item.echange?.image || `https://via.placeholder.com/64?text=E`,
          price: item.echange?.prix,
          quantity: item.echange?.quantite || 1,
          status: item.echange?.statut,
          estPublie: item.echange?.estPublie,
          estBloque: item.echange?.estBloque,
          category: item.echange?.categorie,
          seller: { name: item.echange?.nom_initiateur || "Initié par" },
          sellerName: item.echange?.nom_initiateur || "Initié par",
          date: item.echange?.dateProposition,
          itemUuid: item.itemUuid,
        };
      default:
        return {
          title: "Élément sans nom",
          image: `https://via.placeholder.com/64?text=?`,
          quantity: 1,
          sellerName: "Inconnu",
          itemUuid: item.itemUuid,
        };
    }
  }, []);

  const getStatusConfig = useCallback(
    (item: FavoriItem) => {
      const details = getItemDetails(item);
      let status = details.status || "inconnu";
      let badgeClass = "bg-secondary bg-opacity-10 text-secondary border-0";

      if (details.estBloque) {
        status = "bloque";
        badgeClass = "bg-danger bg-opacity-10 text-danger border-0";
      } else if (details.estPublie) {
        status = "publie";
        badgeClass = "bg-success bg-opacity-10 text-success border-0";
      } else if (status === "en-attente" || status === "en_attente") {
        badgeClass = "bg-warning bg-opacity-10 text-warning border-0";
      } else if (status === "disponible") {
        badgeClass = "bg-success bg-opacity-10 text-success border-0";
      } else if (status === "vendu") {
        badgeClass = "bg-dark bg-opacity-10 text-dark border-0";
      }

      return {
        label: getStatusLabel(status),
        badgeClass,
      };
    },
    [getItemDetails],
  );

  const toggleExpandItem = useCallback((uuid: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
      } else {
        newSet.add(uuid);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      onSelectAll?.(checked);
    },
    [onSelectAll],
  );

  const handleSelectItem = useCallback(
    (uuid: string, checked: boolean) => {
      onSelectItem?.(uuid, checked);
    },
    [onSelectItem],
  );

  const handleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      currentItems.forEach((item) => {
        onSelectItem?.(item.uuid, checked);
      });
    },
    [currentItems, onSelectItem],
  );

  const handleViewDetails = useCallback(
    (item: FavoriItem) => {
      if (onView) {
        // Utiliser la fonction onView passée par le parent (pour ouvrir la modal)
        onView(item.uuid, item.type, item.itemUuid);
      } else {
        // Fallback: redirection
        router.push(`/${item.type}s/${item.itemUuid}`);
      }
    },
    [router, onView],
  );

  const handleOpenInNewTab = useCallback((item: FavoriItem) => {
    window.open(`/${item.type}s/${item.itemUuid}`, "_blank");
  }, []);

  const handleRemoveFavorite = useCallback(
    async (item: FavoriItem) => {
      if (!onRemoveFavorite) return;

      if (
        confirm("Êtes-vous sûr de vouloir retirer cet élément de vos favoris ?")
      ) {
        setProcessingItems((prev) => new Set(prev).add(item.uuid));
        try {
          await onRemoveFavorite(item.uuid, item.type, item.itemUuid);
        } finally {
          setProcessingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.uuid);
            return newSet;
          });
        }
      }
    },
    [onRemoveFavorite],
  );

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div
          className="spinner-border text-danger"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="text-muted mt-3">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="bg-danger bg-opacity-10 rounded-circle p-4 mb-3">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="2x"
            className="text-danger"
          />
        </div>
        <h5 className="fw-semibold mb-2">Erreur de chargement</h5>
        <p className="text-muted mb-4 text-center">{error}</p>
        {onRefresh && (
          <button type="button" className="btn btn-danger" onClick={onRefresh}>
            <FontAwesomeIcon icon={faSpinner} className="me-2" />
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="bg-light rounded-circle p-5 mb-4">
          <FontAwesomeIcon
            icon={faHeartSolid}
            size="3x"
            className="text-muted"
          />
        </div>
        <h5 className="fw-semibold mb-2">Aucun favori trouvé</h5>
        <p className="text-muted mb-4 text-center">
          Vous n'avez pas encore d'éléments dans vos favoris
        </p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => router.push("/")}
        >
          <FontAwesomeIcon icon={faHeartSolid} className="me-2" />
          Parcourir les annonces
        </button>
      </div>
    );
  }

  return (
    <div className={`card border-0 shadow-sm ${className}`}>
      <div className="card-body p-0">
        {selectedItemsSet.size > 0 && (
          <div className="bg-primary bg-opacity-10 border-bottom px-4 py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary rounded-circle p-2">
                  <FontAwesomeIcon icon={faCheck} className="text-white" />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold text-primary">
                    {selectedItemsSet.size} élément(s) sélectionné(s)
                  </h6>
                  <p className="text-muted mb-0 small">
                    {selectedItemsSet.size} sur {data.length} favoris
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleSelectAll(false)}
              >
                Tout désélectionner
              </button>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-4" style={{ width: "50px" }}>
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      disabled={loading || data.length === 0}
                      aria-label="Sélectionner tous les favoris"
                    />
                  </div>
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted">
                  Élément
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted">
                  Type
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted">
                  Statut
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted">
                  Prix
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted">
                  Ajouté le
                </th>
                <th className="py-3 text-uppercase small fw-semibold text-muted text-end pe-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const typeConfig = getTypeConfig(item.type);
                const details = getItemDetails(item);
                const statusConfig = getStatusConfig(item);
                const isProcessing = processingItems.has(item.uuid);
                const isExpanded = expandedItems.has(item.uuid);
                const isSelected = selectedItemsSet.has(item.uuid);

                return (
                  <tr
                    key={item.uuid}
                    className={`
                      ${isSelected ? "table-primary" : ""}
                      ${isExpanded ? "table-active" : ""}
                      position-relative
                    `}
                    style={{
                      borderLeft: isSelected
                        ? `3px solid var(--bs-primary)`
                        : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <td className="ps-4 align-middle">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectItem(item.uuid, e.target.checked)
                          }
                          disabled={isProcessing}
                          aria-label={`Sélectionner ${details.title}`}
                        />
                      </div>
                    </td>

                    <td className="align-middle">
                      <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          <div
                            className="rounded-3 overflow-hidden border"
                            style={{
                              width: "60px",
                              height: "60px",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={details.image}
                              alt={details.title}
                              className="w-100 h-100 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/60/6f42c1/ffffff?text=${details.title.charAt(0)}`;
                              }}
                            />
                          </div>
                          <div
                            className="position-absolute top-0 end-0 p-1"
                            style={{
                              backgroundColor: colors.oskar.red,
                              borderRadius: "0 0.375rem",
                              transform: "translate(25%, -25%)",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faHeartSolid}
                              size="xs"
                              className="text-white"
                            />
                          </div>
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex align-items-start justify-content-between mb-1">
                            <h6
                              className="fw-semibold mb-0"
                              style={{ color: colors.oskar.black }}
                            >
                              {truncateText(details.title, 40)}
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0 text-muted"
                              onClick={() => toggleExpandItem(item.uuid)}
                              aria-label={
                                isExpanded
                                  ? "Réduire les détails"
                                  : "Voir plus de détails"
                              }
                            >
                              <FontAwesomeIcon
                                icon={isExpanded ? faChevronUp : faChevronDown}
                                size="xs"
                              />
                            </button>
                          </div>

                          {details.description && (
                            <p className="text-muted small mb-2">
                              {truncateText(details.description, 60)}
                            </p>
                          )}

                          <div className="d-flex align-items-center flex-wrap gap-2">
                            {details.category && (
                              <span className="badge bg-light text-dark border">
                                {details.category}
                              </span>
                            )}

                            {details.quantity > 1 && (
                              <span className="text-muted small">
                                <FontAwesomeIcon
                                  icon={faBoxOpen}
                                  className="me-1"
                                />
                                {details.quantity} unités
                              </span>
                            )}

                            {details.sellerName && (
                              <span className="text-muted small">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="me-1"
                                />
                                {truncateText(details.sellerName, 20)}
                              </span>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-3 p-3 border rounded bg-light">
                              <div className="row g-2">
                                <div className="col-md-6">
                                  <small className="text-muted d-block">
                                    ID de l'élément
                                  </small>
                                  <code className="fw-medium small d-block text-truncate">
                                    {details.itemUuid}
                                  </code>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted d-block">
                                    ID du favori
                                  </small>
                                  <code className="fw-medium small d-block text-truncate">
                                    {item.uuid}
                                  </code>
                                </div>
                                {details.boutique && (
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">
                                      Boutique
                                    </small>
                                    <span className="fw-medium small d-block">
                                      <FontAwesomeIcon
                                        icon={faStore}
                                        className="me-1"
                                      />
                                      {details.boutique.nom}
                                    </span>
                                  </div>
                                )}
                                {details.date && (
                                  <div className="col-md-6">
                                    <small className="text-muted d-block">
                                      Date de publication
                                    </small>
                                    <span className="fw-medium small d-block">
                                      <FontAwesomeIcon
                                        icon={faCalendar}
                                        className="me-1"
                                      />
                                      {new Date(
                                        details.date,
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                )}
                                <div className="col-12 mt-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => handleOpenInNewTab(item)}
                                  >
                                    <FontAwesomeIcon
                                      icon={faExternalLinkAlt}
                                      className="me-1"
                                    />
                                    Ouvrir dans un nouvel onglet
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleViewDetails(item)}
                                  >
                                    <FontAwesomeIcon
                                      icon={faEye}
                                      className="me-1"
                                    />
                                    Voir les détails
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="align-middle">
                      <div
                        className={`badge rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 ${typeConfig.badgeClass}`}
                      >
                        <FontAwesomeIcon icon={typeConfig.icon} size="sm" />
                        <span className="fw-medium">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    </td>

                    <td className="align-middle">
                      <div
                        className={`badge rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 ${statusConfig.badgeClass}`}
                      >
                        <FontAwesomeIcon icon={faCircle} size="xs" />
                        <span className="fw-medium">{statusConfig.label}</span>
                      </div>
                    </td>

                    <td className="align-middle">
                      <div className="d-flex align-items-center gap-2">
                        {details.price ? (
                          <>
                            <FontAwesomeIcon
                              icon={faMoneyBillWave}
                              className="text-success"
                            />
                            <span
                              className="fw-bold"
                              style={{ color: colors.oskar.black }}
                            >
                              {formatPrice(details.price)}
                            </span>
                          </>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border-0">
                            Gratuit
                          </span>
                        )}
                      </div>
                      {Number(details.quantity) > 1 && details.price && (
                        <small className="text-muted d-block mt-1">
                          {formatPrice(
                            Number(details.price) / Number(details.quantity),
                          )}
                          /unité
                        </small>
                      )}
                    </td>

                    <td className="align-middle">
                      <div className="d-flex flex-column">
                        <div
                          className="fw-medium"
                          style={{ color: colors.oskar.black }}
                        >
                          {formatRelativeTime(item.createdAt)}
                        </div>
                        <div className="text-muted small">
                          {new Date(item.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="align-middle text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        {isProcessing ? (
                          <div
                            className="spinner-border spinner-border-sm text-danger"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Traitement...
                            </span>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                              onClick={() => handleViewDetails(item)}
                              title="Voir les détails"
                              style={{
                                width: "36px",
                                height: "36px",
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                              onClick={() => handleRemoveFavorite(item)}
                              title="Retirer des favoris"
                              disabled={isProcessing}
                              style={{
                                width: "36px",
                                height: "36px",
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.length > 0 && (
          <div className="border-top px-4 py-3 bg-light">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="text-muted small">
                Affichage de{" "}
                <span className="fw-semibold">{startIndex + 1}</span> à{" "}
                <span className="fw-semibold">
                  {Math.min(startIndex + itemsPerPage, data.length)}
                </span>{" "}
                sur <span className="fw-semibold">{data.length}</span> favoris
                {selectedItemsSet.size > 0 && (
                  <span className="ms-2 text-primary">
                    (
                    <span className="fw-semibold">{selectedItemsSet.size}</span>{" "}
                    sélectionné(s))
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">Afficher</span>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-muted small">par page</span>
                </div>

                <nav aria-label="Navigation des pages">
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        aria-label="Première page"
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </button>
                    </li>

                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Page précédente"
                      >
                        <span aria-hidden="true">&lsaquo;</span>
                      </button>
                    </li>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <li
                          key={pageNum}
                          className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    })}

                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Page suivante"
                      >
                        <span aria-hidden="true">&rsaquo;</span>
                      </button>
                    </li>

                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        aria-label="Dernière page"
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </button>
                    </li>
                  </ul>
                </nav>

                <div className="text-muted small d-none d-md-block">
                  Page <span className="fw-semibold">{currentPage}</span> sur{" "}
                  <span className="fw-semibold">{totalPages}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-top">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={allSelectedOnCurrentPage}
                  onChange={(e) => handleSelectAllOnPage(e.target.checked)}
                  disabled={loading || currentItems.length === 0}
                  aria-label={`Sélectionner tous les éléments de la page actuelle`}
                />
                <label className="form-check-label small text-muted">
                  Sélectionner les {currentItems.length} éléments de cette page
                  {selectedItemsSet.size > 0 && (
                    <span className="ms-2">
                      ({selectedItemsSet.size} au total)
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
