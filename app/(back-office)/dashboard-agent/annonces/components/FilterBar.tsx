// app/(back-office)/dashboard-agent/annonces/components/FilterBar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch,
  faClock,
  faGlobe,
  faBan,
  faFilter,
  faRefresh,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface FilterBarProps {
  onStatusChange?: (status: string) => void;
  onContentTypeChange?: (type: string) => void;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  onReset?: () => void;
  className?: string;
  compact?: boolean;
  selectedContentType?: string;
  selectedStatus?: string;
  loading?: boolean;
  totalItems?: number;
}

export default function FilterBar({
  onStatusChange,
  onContentTypeChange,
  onSearchChange,
  onRefresh,
  onReset,
  className = "",
  compact = false,
  selectedContentType = "tous",
  selectedStatus = "tous",
  loading = false,
  totalItems = 0,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ STATUTS SIMPLIFIÉS: En attente, Publié, Bloqué
  const statuses = [
    { 
      id: "tous", 
      label: "Tous", 
      color: colors.oskar.grey,
      icon: null,
    },
    { 
      id: "en-attente", 
      label: "En attente", 
      color: colors.status.pending,
      icon: faClock,
    },
    { 
      id: "publie", 
      label: "Publié", 
      color: colors.status.published,
      icon: faGlobe,
    },
    { 
      id: "bloque", 
      label: "Bloqué", 
      color: colors.status.blocked,
      icon: faBan,
    },
  ];

  const contentTypes = [
    { value: "tous", label: "Tous les types" },
    { value: "produit", label: "Produits" },
    { value: "don", label: "Dons" },
    { value: "echange", label: "Échanges" },
  ];

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onContentTypeChange?.(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(searchQuery);
  };

  const handleStatusClick = (statusId: string) => {
    onStatusChange?.(statusId);
  };

  const handleReset = () => {
    setSearchQuery("");
    onReset?.();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedStatus !== "tous") count++;
    if (selectedContentType !== "tous") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-white rounded-3 shadow-sm border ${className}`}>
      <div className="container-fluid px-4 py-3">
        {/* En-tête avec compteurs */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <h2 className="h6 fw-bold mb-0" style={{ color: colors.oskar.black }}>
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
            {activeFilterCount > 0 && (
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: colors.oskar.blueHover,
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                }}
              >
                {activeFilterCount} filtre(s)
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center gap-1"
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
              <FontAwesomeIcon icon={faRefresh} spin={loading} size="sm" />
              <span className="small">Rafraîchir</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-1"
                onClick={handleReset}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                <FontAwesomeIcon icon={faXmark} size="sm" />
                <span className="small">Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Filtre par type */}
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-medium" style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}>
              Type:
            </label>
            <select
              value={selectedContentType}
              onChange={handleContentTypeChange}
              className="form-select form-select-sm border rounded-2"
              style={{
                color: colors.oskar.black,
                minWidth: "140px",
                fontSize: "0.875rem",
                cursor: "pointer",
                padding: "0.375rem 0.75rem",
              }}
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="vr opacity-25" style={{ height: "30px" }}></div>

          {/* Filtre par statut - BOUTONS COLORÉS */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="form-label mb-0 fw-medium" style={{ color: colors.oskar.grey, fontSize: "0.875rem" }}>
              Statut:
            </label>
            <div className="d-flex gap-1 flex-wrap">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => handleStatusClick(status.id)}
                  className={`btn btn-sm d-flex align-items-center gap-1 px-3 py-1 rounded-2 ${
                    selectedStatus === status.id ? "fw-semibold" : "fw-normal"
                  }`}
                  style={{
                    backgroundColor:
                      selectedStatus === status.id
                        ? status.color
                        : colors.oskar.lightGrey,
                    color:
                      selectedStatus === status.id
                        ? "white"
                        : colors.oskar.grey,
                    border: `1px solid ${
                      selectedStatus === status.id
                        ? status.color
                        : colors.oskar.lightGrey
                    }`,
                    transition: "all 0.2s ease",
                    fontSize: "0.875rem",
                  }}
                >
                  {status.icon && (
                    <FontAwesomeIcon icon={status.icon} size="xs" />
                  )}
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="vr opacity-25" style={{ height: "30px" }}></div>

          {/* Recherche */}
          <div style={{ flex: "1 1 auto", minWidth: "250px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text border border-end-0 rounded-start-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
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
                  onChange={handleSearchChange}
                  placeholder="Rechercher par titre, description..."
                  className="form-control border rounded-end-2"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "0.875rem",
                    padding: "0.375rem 0.75rem",
                    borderColor: colors.oskar.lightGrey,
                  }}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Version compacte pour mobile */}
        {compact && (
          <div className="mt-3 pt-2 border-top">
            <div className="text-muted small">
              {selectedStatus !== "tous" && (
                <span className="me-2">
                  Statut: {statuses.find(s => s.id === selectedStatus)?.label}
                </span>
              )}
              {selectedContentType !== "tous" && (
                <span>
                  Type: {contentTypes.find(t => t.value === selectedContentType)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}