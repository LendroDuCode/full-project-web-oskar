// components/FilterBar.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface FilterBarProps {
  onAccountTypeChange?: (
    type: "tous" | "particulier" | "professionnel",
  ) => void;
  onStatusChange?: (status: string) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
  defaultAccountType?: "tous" | "particulier" | "professionnel";
  defaultStatus?: string;
}

export default function FilterBar({
  onAccountTypeChange,
  onStatusChange,
  onSearchChange,
  className = "",
  defaultAccountType = "tous",
  defaultStatus = "En attente",
}: FilterBarProps) {
  const [activeAccountType, setActiveAccountType] = useState<
    "tous" | "particulier" | "professionnel"
  >(defaultAccountType);
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const accountTypes = [
    { id: "tous", label: "Tous" },
    { id: "particulier", label: "Particulier" },
    { id: "professionnel", label: "Professionnel" },
  ] as const;

  const statusOptions = [
    { value: "en-attente", label: "En attente" },
    { value: "rejete", label: "Rejeté" },
    { value: "valide", label: "Validé" },
  ];

  const handleAccountTypeClick = (
    type: "tous" | "particulier" | "professionnel",
  ) => {
    setActiveAccountType(type);
    onAccountTypeChange?.(type);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onStatusChange?.(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(searchQuery);
  };

  return (
    <section
      className={`bg-white border-bottom border-light px-4 py-3 ${className}`}
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4">
          {/* Type de Compte - Toggle */}
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-nowrap fw-medium small"
              style={{ color: colors.oskar.black }}
            >
              Type de Compte:
            </span>
            <div
              className="d-flex rounded-3 p-1"
              style={{
                backgroundColor: colors.oskar.lightGrey,
              }}
            >
              {accountTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleAccountTypeClick(type.id)}
                  className={`btn btn-sm px-3 py-2 rounded-2 ${activeAccountType === type.id ? "fw-semibold" : ""}`}
                  style={{
                    backgroundColor:
                      activeAccountType === type.id ? "white" : "transparent",
                    color:
                      activeAccountType === type.id
                        ? colors.oskar.black
                        : colors.oskar.grey,
                    border: "none",
                    boxShadow:
                      activeAccountType === type.id
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    transition: "all 0.2s ease",
                    minWidth: "100px",
                  }}
                  onMouseEnter={(e) => {
                    if (activeAccountType !== type.id) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeAccountType !== type.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div
            className="d-none d-md-block"
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: colors.oskar.lightGrey,
            }}
          />

          {/* Filtre Statut */}
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-nowrap fw-medium small"
              style={{ color: colors.oskar.black }}
            >
              Statut:
            </span>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="form-select form-select-sm rounded-2"
              style={{
                minWidth: "140px",
                borderColor: colors.oskar.lightGrey,
                color: colors.oskar.black,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.grey;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.lightGrey;
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.green;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.oskar.green}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.lightGrey;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Séparateur */}
          <div
            className="d-none d-md-block"
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: colors.oskar.lightGrey,
            }}
          />

          {/* Barre de recherche */}
          <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span
                  className="input-group-text border-0 rounded-start-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    borderRight: "none",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.875rem",
                    }}
                  />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher par Nom ou ID"
                  className="form-control border-0 rounded-end-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    fontSize: "0.875rem",
                    padding: "0.5rem 1rem",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.boxShadow = `0 0 0 2px ${colors.oskar.green}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = colors.oskar.lightGrey;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
