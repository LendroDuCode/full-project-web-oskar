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
  faChevronDown,
  faChevronUp,
  faListCheck,
  faBoxOpen,
  faUser,
  faMoneyBillWave,
  faImage,
  faStore,
  faCheckCircle,
  faClock,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatRelativeTime,
  truncateText,
} from "@/app/shared/utils/formatters";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    if (imagePath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return imagePath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return imagePath;
  }

  if (imagePath.includes("%2F")) {
    return `${apiUrl}${filesUrl}/${imagePath}`;
  }

  return `${apiUrl}${filesUrl}/${imagePath}`;
};

interface FavoriItem {
  uuid: string;
  favoriteId: string;
  itemUuid: string;
  title: string;
  description?: string;
  image: string | null;
  image_key?: string;
  type: "produit" | "don" | "echange" | "annonce";
  status: string;
  date: string;
  price?: number | string | null;
  quantity?: number;
  estPublie?: boolean;
  estBloque?: boolean;
  seller?: {
    name: string;
    avatar?: string | null; // ✅ Peut être string, null ou undefined
    avatar_key?: string | null; // ✅ Peut être string, null ou undefined
    uuid?: string | null; // ✅ Peut être string, null ou undefined
    isPro?: boolean;
    type?: string;
  };
  category?: string;
  categoryUuid?: string;
  originalData?: any;
  addedAt: string;
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  // Gestion des erreurs d'image
  const handleImageError = (
    favoriteId: string,
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;

    if (target.src.includes("localhost")) {
      const productionUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
        "https://oskar-api.mysonec.pro";
      target.src = target.src.replace(
        /http:\/\/localhost(:\d+)?/g,
        productionUrl,
      );
      return;
    }

    if (target.src.includes("%20")) {
      target.src = target.src.replace(/%20/g, "");
      return;
    }

    setImageErrors((prev) => new Set(prev).add(favoriteId));
    target.onerror = null;
  };

  // Obtenir l'URL de l'image
  const getImageUrl = (item: FavoriItem): string | null => {
    if (imageErrors.has(item.favoriteId)) return null;

    if (item.image_key) {
      const url = buildImageUrl(item.image_key);
      if (url) return url;
    }

    if (item.image) {
      const url = buildImageUrl(item.image);
      if (url) return url;
    }

    return null;
  };

  // Obtenir l'URL de l'avatar du vendeur (avec gestion null)
  const getAvatarUrl = (seller: FavoriItem["seller"]): string | null => {
    if (!seller) return null;

    if (seller.avatar_key) {
      return buildImageUrl(seller.avatar_key);
    }

    if (seller.avatar) {
      return buildImageUrl(seller.avatar);
    }

    return null;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        bgColor: `${colors.type.product}15`,
        label: "Produit",
        badgeColor: colors.type.product,
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        bgColor: `${colors.type.don}15`,
        label: "Don",
        badgeColor: "#9C27B0",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        bgColor: `${colors.type.exchange}15`,
        label: "Échange",
        badgeColor: "#2196F3",
      },
      annonce: {
        icon: faBullhorn,
        color: colors.oskar.warning,
        bgColor: `${colors.oskar.warning}15`,
        label: "Annonce",
        badgeColor: colors.oskar.warning,
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusConfig = (item: FavoriItem) => {
    if (item.estBloque) {
      return {
        label: "Bloqué",
        color: colors.status.blocked,
        icon: faBan,
        bgColor: `${colors.status.blocked}15`,
      };
    } else if (item.estPublie) {
      return {
        label: "Publié",
        color: colors.status.published,
        icon: faCheckCircle,
        bgColor: `${colors.status.published}15`,
      };
    } else if (item.status === "en-attente" || item.status === "en_attente") {
      return {
        label: "En attente",
        color: colors.status.pending,
        icon: faClock,
        bgColor: `${colors.status.pending}15`,
      };
    } else {
      return {
        label: "Favori",
        color: colors.oskar.grey,
        icon: faHeart,
        bgColor: `${colors.oskar.grey}15`,
      };
    }
  };

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === currentItems.length) {
      currentItems.forEach((item) => {
        if (selectedItems.has(item.favoriteId)) {
          onSelectionChange?.(item.favoriteId);
        }
      });
    } else {
      currentItems.forEach((item) => {
        if (!selectedItems.has(item.favoriteId)) {
          onSelectionChange?.(item.favoriteId);
        }
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
    async (action: string, favoriteId: string, type: string) => {
      setProcessingItems((prev) => new Set(prev).add(favoriteId));

      try {
        switch (action) {
          case "view":
            onView?.(favoriteId);
            break;
          case "remove":
            await onRemove?.(favoriteId, type);
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
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
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
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
                }}
              >
                <FontAwesomeIcon icon={faHeartCrack} size="xs" />
                Retirer
              </button>

              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={() => {
                  // Désélectionner tous les éléments
                  currentItems.forEach((item) => {
                    if (selectedItems.has(item.favoriteId)) {
                      onSelectionChange?.(item.favoriteId);
                    }
                  });
                }}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "1px solid #dee2e6",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
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
                      currentItems.length > 0 &&
                      currentItems.every((item) =>
                        selectedItems.has(item.favoriteId),
                      )
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
              const imageUrl = getImageUrl(item);
              const avatarUrl = getAvatarUrl(item.seller);

              return (
                <tr
                  key={item.favoriteId}
                  style={{
                    backgroundColor: isSelected
                      ? `${colors.oskar.blue}10`
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
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                            onError={(e) =>
                              handleImageError(item.favoriteId, e)
                            }
                          />
                        ) : (
                          <div
                            className="w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: typeConfig.bgColor,
                              color: typeConfig.color,
                            }}
                          >
                            <FontAwesomeIcon icon={faImage} size="xs" />
                          </div>
                        )}
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
                          >
                            <FontAwesomeIcon
                              icon={isExpanded ? faChevronUp : faChevronDown}
                              size="xs"
                            />
                          </button>
                        </div>

                        {item.description && (
                          <p className="text-muted small mb-0">
                            {truncateText(item.description, 80)}
                          </p>
                        )}

                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {item.category && (
                            <span className="badge bg-light text-dark border small">
                              {truncateText(item.category, 20)}
                            </span>
                          )}
                          {item.seller?.name && (
                            <span className="text-muted small">
                              <FontAwesomeIcon icon={faUser} className="me-1" />
                              {truncateText(item.seller.name, 20)}
                            </span>
                          )}
                          {item.seller?.isPro && (
                            <span className="badge bg-primary bg-opacity-10 text-primary small">
                              <FontAwesomeIcon
                                icon={faStore}
                                className="me-1"
                              />
                              Pro
                            </span>
                          )}
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-muted small">
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
                            className="mt-3 p-3 bg-light rounded-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="small text-muted mb-1">
                                  ID Favori
                                </div>
                                <code className="small d-block text-break">
                                  {item.favoriteId}
                                </code>
                              </div>
                              <div className="col-md-6">
                                <div className="small text-muted mb-1">
                                  Date de création
                                </div>
                                <div className="fw-medium small">
                                  {new Date(item.addedAt).toLocaleString(
                                    "fr-FR",
                                  )}
                                </div>
                              </div>
                              {item.seller?.uuid && (
                                <div className="col-md-6">
                                  <div className="small text-muted mb-1">
                                    UUID du vendeur
                                  </div>
                                  <code className="small d-block text-break">
                                    {item.seller.uuid}
                                  </code>
                                </div>
                              )}
                              {avatarUrl && item.seller?.name && (
                                <div className="col-md-6">
                                  <div className="small text-muted mb-1">
                                    Avatar
                                  </div>
                                  <img
                                    src={avatarUrl}
                                    alt={item.seller.name}
                                    className="rounded-circle"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className="badge rounded-pill d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: typeConfig.bgColor,
                        color: typeConfig.color,
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.65rem",
                      }}
                    >
                      <FontAwesomeIcon icon={typeConfig.icon} size="xs" />
                      {typeConfig.label}
                    </span>
                  </td>

                  <td>
                    <span
                      className="badge rounded-pill d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.65rem",
                      }}
                    >
                      <FontAwesomeIcon icon={statusConfig.icon} size="xs" />
                      {statusConfig.label}
                    </span>
                  </td>

                  <td>
                    {item.price ? (
                      <span
                        className="fw-medium small"
                        style={{ color: colors.oskar.green }}
                      >
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="me-1"
                          size="xs"
                        />
                        {formatPrice(item.price)}
                      </span>
                    ) : (
                      <span className="text-success small">
                        <FontAwesomeIcon
                          icon={faGift}
                          className="me-1"
                          size="xs"
                        />
                        Gratuit
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="small fw-medium">
                      {formatRelativeTime(item.addedAt)}
                    </div>
                    <div className="text-muted small">
                      {new Date(item.addedAt).toLocaleDateString("fr-FR")}
                    </div>
                  </td>

                  <td>
                    <div
                      className="d-flex justify-content-end gap-2 pe-3"
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
                            className="btn btn-sm p-2 d-flex align-items-center justify-content-center"
                            onClick={() =>
                              handleAction("view", item.favoriteId, item.type)
                            }
                            title="Voir les détails"
                            style={{
                              backgroundColor: `${colors.oskar.blueHover}15`,
                              color: colors.oskar.blueHover,
                              border: "none",
                              borderRadius: "6px",
                              width: "32px",
                              height: "32px",
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} size="sm" />
                          </button>

                          {onRemove && (
                            <button
                              type="button"
                              className="btn btn-sm p-2 d-flex align-items-center justify-content-center"
                              onClick={() =>
                                handleAction(
                                  "remove",
                                  item.favoriteId,
                                  item.type,
                                )
                              }
                              title="Retirer des favoris"
                              style={{
                                backgroundColor: `${colors.oskar.red}15`,
                                color: colors.oskar.red,
                                border: "none",
                                borderRadius: "6px",
                                width: "32px",
                                height: "32px",
                              }}
                            >
                              <FontAwesomeIcon icon={faHeartCrack} size="sm" />
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
