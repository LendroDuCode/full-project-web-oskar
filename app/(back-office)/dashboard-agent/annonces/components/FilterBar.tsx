"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

interface FilterBarProps {
  onStatusChange?: (status: string) => void;
  onContentTypeChange?: (type: string) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
  compact?: boolean;
  selectedContentType?: string;
  selectedStatus?: string;
}

export default function FilterBar({
  onStatusChange,
  onContentTypeChange,
  onSearchChange,
  className = "",
  compact = false,
  selectedContentType = "tous",
  selectedStatus = "tous",
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const statuses = [
    { id: "tous", label: "Tous" },
    { id: "en-attente", label: "En attente" },
    { id: "publie", label: "Publié" },
    { id: "disponible", label: "Disponible" },
    { id: "valide", label: "Validé" },
    { id: "refuse", label: "Refusé" },
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

  const handleReset = () => {
    setSearchQuery("");
    onStatusChange?.("tous");
    onContentTypeChange?.("tous");
    onSearchChange?.("");
  };

  return (
    <section
      className={`bg-white border-bottom border-light px-4 py-3 ${className}`}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Filtre par statut */}
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-medium text-dark fs-6">
              Statut:
            </label>
            <div className="d-flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => onStatusChange?.(status.id)}
                  className={`btn btn-sm px-3 py-2 rounded-2 ${
                    selectedStatus === status.id ? "fw-semibold" : "fw-normal"
                  }`}
                  style={{
                    backgroundColor:
                      selectedStatus === status.id ? "#10B981" : "#f8f9fa",
                    color: selectedStatus === status.id ? "white" : "#6c757d",
                    border:
                      selectedStatus === status.id
                        ? `1px solid #10B981`
                        : `1px solid #dee2e6`,
                    transition: "all 0.2s ease",
                    fontSize: "0.875rem",
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="vr opacity-50 d-none d-md-block"></div>

          {/* Filtre par type de contenu */}
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-medium text-dark fs-6">
              Type:
            </label>
            <select
              value={selectedContentType}
              onChange={handleContentTypeChange}
              className="form-select form-select-sm px-3 py-2 rounded-2 border"
              style={{
                color: "#212529",
                minWidth: "160px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="vr opacity-50 d-none d-md-block"></div>

          {/* Recherche */}
          <div
            className={`${compact ? "w-100" : "flex-grow-1"}`}
            style={{ maxWidth: compact ? "100%" : "400px" }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span
                  className="input-group-text border border-end-0 rounded-start-2"
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ color: "#6c757d", fontSize: "0.875rem" }}
                  />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher par titre, description, téléphone..."
                  className="form-control border rounded-end-2"
                  style={{
                    color: "#212529",
                    fontSize: "0.875rem",
                    padding: "0.5rem 1rem",
                  }}
                />
              </div>
            </form>
          </div>

          {/* Bouton de réinitialisation */}
          {!compact && (
            <button
              type="button"
              className="btn btn-sm px-3 py-2 rounded-2 border"
              onClick={handleReset}
              style={{
                backgroundColor: "#f8f9fa",
                color: "#6c757d",
                fontSize: "0.875rem",
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Version compacte pour mobile */}
        {compact && (
          <div className="mt-3 pt-3 border-top border-light">
            <div className="d-flex justify-content-between align-items-center">
              <button
                type="button"
                className="btn btn-sm px-3 py-2 rounded-2 border"
                onClick={handleReset}
                style={{
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                  fontSize: "0.875rem",
                }}
              >
                Réinitialiser
              </button>
              <div className="text-muted small">
                {selectedStatus !== "tous" && (
                  <span>
                    Filtre actif:{" "}
                    {statuses.find((s) => s.id === selectedStatus)?.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
