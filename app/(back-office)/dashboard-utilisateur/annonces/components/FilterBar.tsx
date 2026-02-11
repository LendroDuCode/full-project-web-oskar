"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faRefresh,
  faChartSimple,
  faFilterCircleXmark,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

interface FilterBarProps {
  onStatusChange?: (status: string) => void;
  onTypeChange?: (type: string) => void;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  onShowStats?: () => void;
  onClearFilters?: () => void;
  className?: string;
  selectedType?: string;
  selectedStatus?: string;
  loading?: boolean;
  totalItems?: number;
  selectedCount?: number;
}

export default function FilterBar({
  onStatusChange,
  onTypeChange,
  onSearchChange,
  onRefresh,
  onShowStats,
  onClearFilters,
  className = "",
  selectedType = "tous",
  selectedStatus = "tous",
  loading = false,
  totalItems = 0,
  selectedCount = 0,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const statusOptions = [
    { value: "tous", label: "Tous", color: colors.oskar.grey },
    { value: "en-attente", label: "En attente", color: colors.status.pending },
    { value: "publie", label: "Publié", color: colors.status.published },
    {
      value: "disponible",
      label: "Disponible",
      color: colors.status.available,
    },
    { value: "valide", label: "Validé", color: colors.status.validated },
    { value: "refuse", label: "Refusé", color: colors.oskar.secondary },
    { value: "bloque", label: "Bloqué", color: colors.status.blocked },
  ];

  const typeOptions = [
    { value: "tous", label: "Tous", color: colors.oskar.grey },
    { value: "produit", label: "Produits", color: colors.type.product },
    { value: "don", label: "Dons", color: colors.type.don },
    { value: "echange", label: "Échanges", color: colors.type.exchange },
  ];

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }
  }, [searchQuery, onSearchChange]);

  const handleStatusChange = (status: string) => {
    onStatusChange?.(status);
  };

  const handleTypeChange = (type: string) => {
    onTypeChange?.(type);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(searchQuery);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    onClearFilters?.();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedStatus !== "tous") count++;
    if (selectedType !== "tous") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-white border-b border-light shadow-sm ${className}`}>
      <div className="container-fluid px-4 py-3">
        {/* Barre supérieure */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <h2
              className="h5 fw-bold mb-0"
              style={{ color: colors.oskar.black }}
            >
              Gestion des annonces
            </h2>
            {totalItems > 0 && (
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                }}
              >
                {totalItems} annonce(s)
              </span>
            )}
            {selectedCount > 0 && (
              <span
                className="badge rounded-pill d-flex align-items-center gap-1"
                style={{
                  backgroundColor: colors.oskar.blueHover,
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                }}
              >
                <FontAwesomeIcon icon={faListCheck} size="xs" />
                {selectedCount} sélectionné(s)
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: "none",
                padding: "0.375rem 0.75rem",
                borderRadius: "6px",
              }}
            >
              <FontAwesomeIcon icon={faFilter} />
              {showFilters ? "Masquer filtres" : "Afficher filtres"}
            </button>

            <button
              type="button"
              className="btn btn-sm d-flex align-items-center gap-2"
              onClick={onRefresh}
              disabled={loading}
              style={{
                backgroundColor: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: "none",
                padding: "0.375rem 0.75rem",
                borderRadius: "6px",
              }}
            >
              <FontAwesomeIcon icon={faRefresh} spin={loading} />
              Rafraîchir
            </button>

            {onClearFilters && activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-2"
                onClick={handleClearFilters}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                <FontAwesomeIcon icon={faFilterCircleXmark} />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Filtres (conditionnellement affichés) */}
        {showFilters && (
          <div className="d-flex flex-column gap-3">
            {/* Filtres principaux */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              {/* Filtre par type */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-medium">Type:</span>
                <div className="d-flex gap-1 flex-wrap">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeChange(option.value)}
                      className={`btn btn-sm px-3 py-1 rounded-2 ${
                        selectedType === option.value
                          ? "fw-semibold"
                          : "fw-normal"
                      }`}
                      style={{
                        backgroundColor:
                          selectedType === option.value
                            ? option.color
                            : colors.oskar.lightGrey,
                        color:
                          selectedType === option.value
                            ? colors.oskar.lightGrey
                            : colors.oskar.grey,
                        border: `1px solid ${
                          selectedType === option.value
                            ? option.color
                            : colors.oskar.lightGrey
                        }`,
                        transition: "all 0.2s ease",
                        fontSize: "0.75rem",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vr opacity-50"></div>

              {/* Filtre par statut */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small fw-medium">Statut:</span>
                <div className="d-flex gap-1 flex-wrap">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={`btn btn-sm px-3 py-1 rounded-2 ${
                        selectedStatus === option.value
                          ? "fw-semibold"
                          : "fw-normal"
                      }`}
                      style={{
                        backgroundColor:
                          selectedStatus === option.value
                            ? option.color
                            : colors.oskar.lightGrey,
                        color:
                          selectedStatus === option.value
                            ? colors.oskar.lightGrey
                            : colors.oskar.grey,
                        border: `1px solid ${
                          selectedStatus === option.value
                            ? option.color
                            : colors.oskar.lightGrey
                        }`,
                        transition: "all 0.2s ease",
                        fontSize: "0.75rem",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recherche */}
            <div className="d-flex align-items-center gap-3">
              <form
                onSubmit={handleSearchSubmit}
                className="flex-grow-1"
                style={{ maxWidth: "400px" }}
              >
                <div className="input-group">
                  <span
                    className="input-group-text border border-end-0 rounded-start-2"
                    style={{
                      backgroundColor: colors.oskar.lightGrey,
                      padding: "0.5rem 1rem",
                      borderColor: colors.oskar.lightGrey,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}
                    />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Rechercher par titre, description, vendeur..."
                    className="form-control border rounded-end-2"
                    style={{
                      color: colors.oskar.black,
                      fontSize: "0.875rem",
                      padding: "0.5rem 1rem",
                      borderColor: colors.oskar.lightGrey,
                    }}
                  />
                </div>
              </form>

              {/* Compteur de filtres actifs */}
              {activeFilterCount > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFilter}
                    style={{
                      color: colors.oskar.blueHover,
                      fontSize: "0.875rem",
                    }}
                  />
                  <span
                    className="small"
                    style={{ color: colors.oskar.blueHover }}
                  >
                    {activeFilterCount} filtre(s) actif(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
