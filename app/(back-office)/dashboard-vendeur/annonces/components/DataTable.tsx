"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheck,
  faXmark,
  faGlobe,
  faLock,
  faBoxOpen,
  faUnlock,
  faCalendarCheck,
  faCalendarXmark,
  faTrash,
  faEdit,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faCheckSquare,
  faSquare,
  faChevronDown,
  faChevronUp,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatRelativeTime,
  truncateText,
  getStatusLabel,
  getTypeLabel,
} from "@/app/shared/utils/formatters";

interface AnnonceItem {
  uuid: string;
  title: string;
  description?: string;
  image: string;
  type: "produit" | "don" | "echange";
  status: string;
  date: string;
  price?: number | string | null;
  quantity?: number;
  estPublie?: boolean;
  estBloque?: boolean;
  seller?: {
    name: string;
    avatar?: string;
    isPro?: boolean;
    type?: string;
  };
  category?: string;
  originalData?: any;
}

interface DataTableProps {
  data: AnnonceItem[];
  loading?: boolean;
  error?: string | null;
  onValidate?: (uuid: string, type: string) => void;
  onReject?: (uuid: string, type: string) => void;
  onPublish?: (uuid: string, type: string, publish: boolean) => void;
  onBlock?: (uuid: string, type: string, block: boolean) => void;
  onDelete?: (uuid: string, type: string) => void;
  onView?: (uuid: string, type: string) => void;
  onEdit?: (uuid: string, type: string) => void;
  onRefresh?: () => void;
  selectedItems?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  onBulkAction?: (action: string, items: AnnonceItem[]) => void;
  className?: string;
}

export default function DataTable({
  data,
  loading = false,
  error = null,
  onValidate,
  onReject,
  onPublish,
  onBlock,
  onDelete,
  onView,
  onEdit,
  onRefresh,
  selectedItems = new Set(),
  onSelectionChange,
  onBulkAction,
  className = "",
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set(),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Utiliser useMemo pour optimiser les calculs
  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage],
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage],
  );

  const currentItems = useMemo(
    () => data.slice(startIndex, startIndex + itemsPerPage),
    [data, startIndex, itemsPerPage],
  );

  const getTypeConfig = (type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        bgColor: `${colors.type.product}15`,
        label: "Produit",
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        bgColor: `${colors.type.don}15`,
        label: "Don",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        bgColor: `${colors.type.exchange}15`,
        label: "Échange",
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusConfig = (item: AnnonceItem) => {
    let status = item.status;
    let color = colors.oskar.grey;
    let icon = null;
    let label = "Inconnu";

    // Gestion prioritaire des états bloqué/publie
    if (item.estBloque) {
      status = "bloque";
      color = colors.status.blocked;
      icon = faLock;
      label = "Bloqué";
    } else if (item.estPublie) {
      if (status === "publie" || status === "disponible") {
        color = colors.status.published;
        icon = faGlobe;
        label = "Publié";
      } else if (status === "en-attente" || status === "en_attente") {
        color = colors.status.pending;
        label = "En attente";
      } else if (status === "valide") {
        color = colors.status.validated;
        icon = faCheck;
        label = "Validé";
      } else if (status === "refuse") {
        color = colors.oskar.red;
        icon = faXmark;
        label = "Refusé";
      } else {
        color = colors.oskar.grey;
        label = getStatusLabel(status) || "Inconnu";
      }
    } else {
      // Non publié
      color = colors.oskar.warning;
      label = "Non publié";
    }

    return {
      label,
      color,
      icon,
    };
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === currentItems.length) {
      onSelectionChange?.(new Set());
    } else {
      const allUuids = new Set(currentItems.map((item) => item.uuid));
      onSelectionChange?.(allUuids);
    }
  };

  const toggleSelectItem = (uuid: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      newSelected.add(uuid);
    }
    onSelectionChange?.(newSelected);
  };

  const toggleExpandItem = (uuid: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(uuid)) {
      newExpanded.delete(uuid);
    } else {
      newExpanded.add(uuid);
    }
    setExpandedItems(newExpanded);
  };

  const handleAction = async (
    action: string,
    uuid: string,
    type: string,
    extra?: any,
  ) => {
    setProcessingItems((prev) => new Set(prev).add(uuid));

    try {
      switch (action) {
        case "view":
          onView?.(uuid, type);
          break;
        case "edit":
          onEdit?.(uuid, type);
          break;
        case "validate":
          onValidate?.(uuid, type);
          break;
        case "reject":
          onReject?.(uuid, type);
          break;
        case "publish":
          onPublish?.(uuid, type, true);
          break;
        case "unpublish":
          onPublish?.(uuid, type, false);
          break;
        case "block":
          onBlock?.(uuid, type, true);
          break;
        case "unblock":
          onBlock?.(uuid, type, false);
          break;
        case "delete":
          onDelete?.(uuid, type);
          break;
      }
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedItems.size === 0) {
      alert("Veuillez sélectionner au moins une annonce");
      return;
    }

    const selectedAnnonces = data.filter((item) =>
      selectedItems.has(item.uuid),
    );
    onBulkAction?.(action, selectedAnnonces);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="2x"
          style={{ color: colors.oskar.blueHover, marginBottom: "1rem" }}
        />
        <p className="text-muted">Chargement des annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          size="2x"
          style={{ color: colors.oskar.red, marginBottom: "1rem" }}
        />
        <h5 className="fw-semibold mb-2" style={{ color: colors.oskar.black }}>
          Erreur de chargement
        </h5>
        <p className="text-muted mb-3 text-center">{error}</p>
        {onRefresh && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={onRefresh}
            style={{
              backgroundColor: colors.oskar.blueHover,
              color: colors.oskar.lightGrey,
              border: "none",
              padding: "0.375rem 0.75rem",
              borderRadius: "6px",
            }}
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon
          icon={faBoxOpen}
          size="2x"
          style={{ color: colors.oskar.grey, marginBottom: "1rem" }}
        />
        <h5 className="fw-semibold mb-2" style={{ color: colors.oskar.black }}>
          Aucune annonce
        </h5>
        <p className="text-muted mb-0">
          Aucune annonce à afficher pour le moment
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-light rounded-3 shadow-sm ${className}`}
    >
      {/* Barre d'actions en masse */}
      {selectedItems.size > 0 && (
        <div
          className="px-4 py-3 border-bottom border-light"
          style={{ backgroundColor: colors.oskar.lightGrey }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <FontAwesomeIcon
                icon={faListCheck}
                style={{ color: colors.oskar.blueHover }}
              />
              <span className="fw-medium" style={{ color: colors.oskar.black }}>
                {selectedItems.size} annonce(s) sélectionnée(s)
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => handleBulkAction("publish")}
                style={{
                  backgroundColor: colors.status.published,
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faGlobe} size="xs" />
                Publier
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => handleBulkAction("unpublish")}
                style={{
                  backgroundColor: colors.oskar.warning,
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faCalendarXmark} size="xs" />
                Dépublier
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => handleBulkAction("block")}
                style={{
                  backgroundColor: colors.status.blocked,
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faLock} size="xs" />
                Bloquer
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => handleBulkAction("delete")}
                style={{
                  backgroundColor: colors.oskar.red,
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faTrash} size="xs" />
                Supprimer
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => onSelectionChange?.(new Set())}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr style={{ backgroundColor: colors.oskar.lightGrey }}>
              <th style={{ width: "40px" }} className="ps-4 py-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={
                      selectedItems.size === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </th>
              <th className="py-3 text-muted small fw-semibold">Annonce</th>
              <th className="py-3 text-muted small fw-semibold">Type</th>
              <th className="py-3 text-muted small fw-semibold">Statut</th>
              <th className="py-3 text-muted small fw-semibold">Prix</th>
              <th className="py-3 text-muted small fw-semibold">Quantité</th>
              <th className="py-3 text-muted small fw-semibold">Date</th>
              <th className="py-3 text-muted small fw-semibold text-end pe-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => {
              const typeConfig = getTypeConfig(item.type);
              const statusConfig = getStatusConfig(item);
              const isSelected = selectedItems.has(item.uuid);
              const isProcessing = processingItems.has(item.uuid);
              const isExpanded = expandedItems.has(item.uuid);
              const isPublished = item.estPublie === true;
              const isBlocked = item.estBloque === true;

              return (
                <tr
                  key={item.uuid}
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.oskar.blue}05`
                      : "transparent",
                  }}
                >
                  <td className="ps-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.uuid)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 overflow-hidden"
                        style={{
                          width: "48px",
                          height: "48px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-100 h-100 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/48?text=${item.title.charAt(0)}`;
                          }}
                        />
                      </div>

                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className="fw-semibold small"
                            style={{ color: colors.oskar.black }}
                          >
                            {truncateText(item.title, 50)}
                          </span>

                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent"
                            onClick={() => toggleExpandItem(item.uuid)}
                            style={{ color: colors.oskar.grey }}
                          >
                            <FontAwesomeIcon
                              icon={isExpanded ? faChevronUp : faChevronDown}
                              size="xs"
                            />
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-muted x-small mb-0">
                            {truncateText(item.description, 60)}
                          </p>
                        )}

                        {isExpanded && item.originalData && (
                          <div
                            className="mt-2 p-2 border rounded"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <div className="row">
                              <div className="col-6">
                                <span className="text-muted">UUID:</span>{" "}
                                <span className="fw-medium">{item.uuid}</span>
                              </div>
                              <div className="col-6">
                                <span className="text-muted">Catégorie:</span>{" "}
                                <span className="fw-medium">
                                  {item.category || "Non définie"}
                                </span>
                              </div>
                              {item.quantity && (
                                <div className="col-6 mt-1">
                                  <span className="text-muted">Quantité:</span>{" "}
                                  <span className="fw-medium">
                                    {item.quantity}
                                  </span>
                                </div>
                              )}
                              {item.seller && (
                                <div className="col-6 mt-1">
                                  <span className="text-muted">Vendeur:</span>{" "}
                                  <span className="fw-medium">
                                    {item.seller.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div
                      className="badge rounded-pill d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: typeConfig.bgColor,
                        color: typeConfig.color,
                        fontSize: "0.7rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      <FontAwesomeIcon icon={typeConfig.icon} size="xs" />
                      {typeConfig.label}
                    </div>
                  </td>

                  <td>
                    <div
                      className="badge rounded-pill d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: `${statusConfig.color}15`,
                        color: statusConfig.color,
                        fontSize: "0.7rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      {statusConfig.icon && (
                        <FontAwesomeIcon icon={statusConfig.icon} size="xs" />
                      )}
                      {statusConfig.label}
                    </div>
                  </td>

                  <td>
                    <span
                      className="fw-medium small"
                      style={{ color: colors.oskar.black }}
                    >
                      {formatPrice(item.price)}
                    </span>
                  </td>

                  <td>
                    <span
                      className="fw-medium small"
                      style={{ color: colors.oskar.black }}
                    >
                      {item.quantity || 1}
                    </span>
                  </td>

                  <td>
                    <div
                      className="small"
                      style={{ color: colors.oskar.black }}
                    >
                      {formatRelativeTime(item.date)}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex justify-content-end gap-1 pe-3">
                      {isProcessing ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          size="sm"
                          style={{ color: colors.oskar.blueHover }}
                        />
                      ) : (
                        <>
                          {/* Voir */}
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            onClick={() =>
                              handleAction("view", item.uuid, item.type)
                            }
                            title="Voir détails"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: `${colors.oskar.blueHover}15`,
                              color: colors.oskar.blueHover,
                              border: "none",
                              borderRadius: "4px",
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </button>

                          {/* Éditer */}
                          {onEdit && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction("edit", item.uuid, item.type)
                              }
                              title="Éditer"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: `${colors.oskar.secondary}15`,
                                color: colors.oskar.secondary,
                                border: "none",
                                borderRadius: "4px",
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                          )}

                          {/* Publier/Dépublier */}
                          {onPublish && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction(
                                  isPublished ? "unpublish" : "publish",
                                  item.uuid,
                                  item.type,
                                )
                              }
                              title={isPublished ? "Dépublier" : "Publier"}
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: isPublished
                                  ? `${colors.oskar.warning}15`
                                  : `${colors.status.published}15`,
                                color: isPublished
                                  ? colors.oskar.warning
                                  : colors.status.published,
                                border: "none",
                                borderRadius: "4px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  isPublished
                                    ? faCalendarXmark
                                    : faCalendarCheck
                                }
                                size="xs"
                              />
                            </button>
                          )}

                          {/* Bloquer/Débloquer */}
                          {onBlock && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction(
                                  isBlocked ? "unblock" : "block",
                                  item.uuid,
                                  item.type,
                                )
                              }
                              title={isBlocked ? "Débloquer" : "Bloquer"}
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: isBlocked
                                  ? `${colors.oskar.green}15`
                                  : `${colors.status.blocked}15`,
                                color: isBlocked
                                  ? colors.oskar.green
                                  : colors.status.blocked,
                                border: "none",
                                borderRadius: "4px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={isBlocked ? faUnlock : faLock}
                                size="xs"
                              />
                            </button>
                          )}

                          {/* Supprimer */}
                          {onDelete && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction("delete", item.uuid, item.type)
                              }
                              title="Supprimer"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: `${colors.oskar.red}15`,
                                color: colors.oskar.red,
                                border: "none",
                                borderRadius: "4px",
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} size="xs" />
                            </button>
                          )}
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

      {/* Pagination */}
      {data.length > itemsPerPage && (
        <div className="px-4 py-3 border-top border-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + itemsPerPage, data.length)} sur{" "}
              {data.length} annonces
              {selectedItems.size > 0 &&
                ` • ${selectedItems.size} sélectionnée(s)`}
            </div>

            <div className="d-flex align-items-center gap-3">
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: "auto" }}
              >
                <option value="5">5 par page</option>
                <option value="10">10 par page</option>
                <option value="20">20 par page</option>
                <option value="50">50 par page</option>
              </select>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                  </li>

                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                  </li>

                  <li className="page-item">
                    <span className="page-link">
                      Page {currentPage} sur {totalPages}
                    </span>
                  </li>

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </li>

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
