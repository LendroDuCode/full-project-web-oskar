"use client";

import { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faHeart,
  faHeartCrack,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faBullhorn,
  faSpinner,
  faExclamationTriangle,
  faCalendarPlus,
  faCheckSquare,
  faSquare,
  faChevronDown,
  faChevronUp,
  faListCheck,
  faTrash,
  faBoxOpen,
  faUser,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatRelativeTime,
  truncateText,
  getTypeLabel,
  getStatusLabel,
} from "@/app/shared/utils/formatters";

interface FavoriItem {
  uuid: string;
  title: string;
  description?: string;
  image: string;
  type: "produit" | "don" | "echange" | "annonce";
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
  favoriteId: string;
  addedAt: string;
  itemUuid: string;
}

interface FavorisTableProps {
  data: FavoriItem[];
  loading?: boolean;
  error?: string | null;
  onRemove?: (favoriteId: string, type: string) => void;
  onView?: (favoriteId: string) => void;
  onRefresh?: () => void;
  selectedItems?: Set<string>;
  onSelectionChange?: (favoriteId: string) => void;
  onBulkRemove?: (items: FavoriItem[]) => void;
  className?: string;
}

export default function FavorisTable({
  data,
  loading = false,
  error = null,
  onRemove,
  onView,
  onRefresh,
  selectedItems = new Set(),
  onSelectionChange,
  onBulkRemove,
  className = "",
}: FavorisTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingItems, setProcessingItems] = useState<Set<string>>(
    new Set(),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

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
      annonce: {
        icon: faBullhorn,
        color: colors.oskar.warning,
        bgColor: `${colors.oskar.warning}15`,
        label: "Annonce",
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusConfig = (item: FavoriItem) => {
    let color = colors.oskar.grey;
    let label = "Favori";
    let icon = faHeart;

    if (item.estBloque) {
      color = colors.status.blocked;
      label = "Bloqué";
      icon = faHeartCrack;
    } else if (item.estPublie) {
      color = colors.status.published;
      label = "Publié";
    } else if (item.status === "en-attente" || item.status === "en_attente") {
      color = colors.status.pending;
      label = "En attente";
    } else {
      label = getStatusLabel(item.status) || "Favori";
    }

    return {
      label,
      color,
      icon,
    };
  };

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === currentItems.length) {
      // Tout désélectionner
      const newSelected = new Set<string>();
      onSelectionChange?.(Array.from(selectedItems)[0] || "");
    } else {
      // Sélectionner tous les éléments de la page
      currentItems.forEach((item) => {
        onSelectionChange?.(item.favoriteId);
      });
    }
  }, [currentItems, selectedItems, onSelectionChange]);

  const toggleSelectItem = useCallback(
    (favoriteId: string) => {
      onSelectionChange?.(favoriteId);
    },
    [onSelectionChange],
  );

  const toggleExpandItem = useCallback((favoriteId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(favoriteId)) {
        newSet.delete(favoriteId);
      } else {
        newSet.add(favoriteId);
      }
      return newSet;
    });
  }, []);

  const isClickOnInteractiveElement = (
    element: EventTarget | null,
  ): boolean => {
    if (!element || !(element instanceof Element)) return false;

    const targetElement = element as Element;
    return (
      targetElement.closest?.("button") !== null ||
      targetElement.closest?.("input") !== null ||
      targetElement.closest?.("a") !== null ||
      targetElement.closest?.("select") !== null ||
      targetElement.closest?.("textarea") !== null
    );
  };

  const handleAction = useCallback(
    async (action: string, favoriteId: string, uuid: string, type: string) => {
      setProcessingItems((prev) => new Set(prev).add(favoriteId));

      try {
        switch (action) {
          case "view":
            onView?.(favoriteId);
            break;
          case "remove":
            if (confirm("Retirer cet élément de vos favoris ?")) {
              await onRemove?.(favoriteId, type);
            }
            break;
        }
      } catch (error) {
        console.error(`Erreur lors de l'action ${action}:`, error);
      } finally {
        setProcessingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(favoriteId);
          return newSet;
        });
      }
    },
    [onRemove, onView],
  );

  const handleBulkRemove = useCallback(() => {
    if (selectedItems.size === 0) {
      alert("Veuillez sélectionner au moins un favori");
      return;
    }

    if (confirm(`Retirer ${selectedItems.size} élément(s) de vos favoris ?`)) {
      const selectedFavoris = data.filter((item) =>
        selectedItems.has(item.favoriteId),
      );
      onBulkRemove?.(selectedFavoris);
    }
  }, [selectedItems, data, onBulkRemove]);

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>, favoriteId: string) => {
      if (isClickOnInteractiveElement(e.target)) {
        return;
      }
      toggleExpandItem(favoriteId);
    },
    [toggleExpandItem],
  );

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="2x"
          style={{ color: colors.oskar.blueHover, marginBottom: "1rem" }}
        />
        <p className="text-muted">Chargement des favoris...</p>
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
          icon={faHeart}
          size="2x"
          style={{ color: colors.oskar.grey, marginBottom: "1rem" }}
        />
        <h5 className="fw-semibold mb-2" style={{ color: colors.oskar.black }}>
          Aucun favori
        </h5>
        <p className="text-muted mb-0">
          Vous n'avez pas encore ajouté d'éléments à vos favoris
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-light rounded-3 shadow-sm ${className}`}
    >
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
                {selectedItems.size} favori(s) sélectionné(s)
              </span>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={handleBulkRemove}
                style={{
                  backgroundColor: colors.oskar.red,
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faHeartCrack} size="xs" />
                Retirer
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() =>
                  onSelectionChange?.(Array.from(selectedItems)[0] || "")
                }
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
                    aria-label="Sélectionner tous les favoris"
                  />
                </div>
              </th>
              <th className="py-3 text-muted small fw-semibold">Élément</th>
              <th className="py-3 text-muted small fw-semibold">Type</th>
              <th className="py-3 text-muted small fw-semibold">Statut</th>
              <th className="py-3 text-muted small fw-semibold">Prix</th>
              <th className="py-3 text-muted small fw-semibold">Ajouté le</th>
              <th className="py-3 text-muted small fw-semibold text-end pe-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => {
              const typeConfig = getTypeConfig(item.type);
              const statusConfig = getStatusConfig(item);
              const isSelected = selectedItems.has(item.favoriteId);
              const isProcessing = processingItems.has(item.favoriteId);
              const isExpanded = expandedItems.has(item.favoriteId);

              return (
                <tr
                  key={item.favoriteId}
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.oskar.blue}05`
                      : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={(e) => handleRowClick(e, item.favoriteId)}
                >
                  <td className="ps-4" onClick={(e) => e.stopPropagation()}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.favoriteId)}
                        style={{ cursor: "pointer" }}
                        aria-label={`Sélectionner ${item.title}`}
                      />
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 overflow-hidden position-relative"
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
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/48?text=${item.title.charAt(0)}`;
                          }}
                        />
                        <div
                          className="position-absolute top-0 end-0 m-1"
                          style={{
                            backgroundColor: colors.oskar.red,
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faHeart} size="xs" />
                        </div>
                      </div>

                      <div className="flex-grow-1">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandItem(item.favoriteId);
                            }}
                            style={{ color: colors.oskar.grey }}
                            aria-label={isExpanded ? "Réduire" : "Développer"}
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

                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {item.category && (
                            <span className="badge bg-light text-dark border x-small">
                              {item.category}
                            </span>
                          )}
                          {item.seller?.name && (
                            <span className="text-muted x-small">
                              <FontAwesomeIcon icon={faUser} className="me-1" />
                              {truncateText(item.seller.name, 20)}
                            </span>
                          )}
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-muted x-small">
                              <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="me-1"
                              />
                              {item.quantity} unités
                            </span>
                          )}
                        </div>

                        {isExpanded && (
                          <div
                            className="mt-2 p-2 border rounded bg-light"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="row g-2">
                              <div className="col-md-6">
                                <small className="text-muted d-block">
                                  ID Favori
                                </small>
                                <code className="fw-medium small d-block text-truncate">
                                  {item.favoriteId}
                                </code>
                              </div>
                              <div className="col-md-6">
                                <small className="text-muted d-block">
                                  Date de création
                                </small>
                                <span className="fw-medium small d-block">
                                  {new Date(item.addedAt).toLocaleDateString(
                                    "fr-FR",
                                  )}
                                </span>
                              </div>
                              {item.seller?.isPro && (
                                <div className="col-12">
                                  <span className="badge bg-primary bg-opacity-10 text-primary">
                                    Professionnel
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
                    <div className="d-flex align-items-center gap-1">
                      {item.price ? (
                        <>
                          <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="text-success"
                            size="xs"
                          />
                          <span
                            className="fw-medium small"
                            style={{ color: colors.oskar.black }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted small">Gratuit</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div
                      className="small"
                      style={{ color: colors.oskar.black }}
                    >
                      {formatRelativeTime(item.addedAt)}
                    </div>
                    <div className="text-muted x-small">
                      {new Date(item.addedAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>

                  <td>
                    <div
                      className="d-flex justify-content-end gap-1 pe-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isProcessing ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          size="sm"
                          style={{ color: colors.oskar.blueHover }}
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            onClick={() =>
                              handleAction(
                                "view",
                                item.favoriteId,
                                item.uuid,
                                item.type,
                              )
                            }
                            title="Voir les détails"
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

                          {onRemove && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction(
                                  "remove",
                                  item.favoriteId,
                                  item.uuid,
                                  item.type,
                                )
                              }
                              title="Retirer des favoris"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: `${colors.oskar.red}15`,
                                color: colors.oskar.red,
                                border: "none",
                                borderRadius: "4px",
                              }}
                            >
                              <FontAwesomeIcon icon={faHeartCrack} size="xs" />
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

      {data.length > itemsPerPage && (
        <div className="px-4 py-3 border-top border-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + itemsPerPage, data.length)} sur{" "}
              {data.length} favoris
              {selectedItems.size > 0 &&
                ` • ${selectedItems.size} sélectionné(s)`}
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
