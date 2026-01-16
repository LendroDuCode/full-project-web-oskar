// components/VerificationWorkstation.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBriefcase,
  faClock,
  faCircle,
  faSearchPlus,
  faDownload,
  faInfoCircle,
  faScaleBalanced,
  faCheck,
  faLightbulb,
  faTimesCircle,
  faShieldHalved,
  faFlag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface QueueItem {
  id: string;
  name: string;
  userId: string;
  avatar: string;
  type: "particulier" | "professionnel";
  waitingTime: string;
  status: "en-attente" | "en-cours" | "traite";
  selected?: boolean;
}

interface VerificationDetail {
  id: string;
  name: string;
  type: "particulier" | "professionnel";
  submissionDate: string;
  submissionTime: string;
  documentType: string;
  documentImage: string;
  comparisons: {
    field: string;
    userValue: string;
    documentValue: string;
    status: "match" | "mismatch" | "pending";
  }[];
  verificationNote: string;
}

interface VerificationWorkstationProps {
  className?: string;
  onSelectQueueItem?: (item: QueueItem) => void;
  onValidate?: (id: string) => void;
  onReject?: (id: string) => void;
  onReport?: (id: string) => void;
}

export default function VerificationWorkstation({
  className = "",
  onSelectQueueItem,
  onValidate,
  onReject,
  onReport,
}: VerificationWorkstationProps) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: "1",
      name: "Kouassi Jean",
      userId: "#45892",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
      type: "particulier",
      waitingTime: "Il y a 2h",
      status: "en-attente",
      selected: true,
    },
    {
      id: "2",
      name: "Célestin Mobile",
      userId: "#45891",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
      type: "professionnel",
      waitingTime: "Il y a 5h",
      status: "en-attente",
      selected: false,
    },
  ]);

  const [currentVerification, setCurrentVerification] =
    useState<VerificationDetail>({
      id: "1",
      name: "Kouassi Jean",
      type: "particulier",
      submissionDate: "10 Décembre 2024",
      submissionTime: "14:30",
      documentType: "Carte Nationale d'Identité (CNI)",
      documentImage:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/271f939d15-7aa3b4b1a0f061e955dc.png",
      comparisons: [
        {
          field: "name",
          userValue: "Kouassi Jean",
          documentValue: "Jean Michel Kouassi",
          status: "mismatch",
        },
        {
          field: "dob",
          userValue: "12/05/1990",
          documentValue: "12/05/1990",
          status: "match",
        },
        {
          field: "id",
          userValue: "CI2024AB123456",
          documentValue: "CI2024AB123456",
          status: "match",
        },
        {
          field: "address",
          userValue: "Abidjan, Cocody",
          documentValue: "Abidjan, Cocody",
          status: "match",
        },
      ],
      verificationNote:
        "Le nom sur le profil diffère légèrement du document officiel. Vérifiez si 'Kouassi Jean' est une version simplifiée acceptable de 'Jean Michel Kouassi'.",
    });

  const handleSelectQueueItem = (item: QueueItem) => {
    // Mettre à jour la sélection
    const updatedItems = queueItems.map((q) => ({
      ...q,
      selected: q.id === item.id,
    }));
    setQueueItems(updatedItems);

    // Mettre à jour les détails de vérification
    setCurrentVerification({
      ...currentVerification,
      name: item.name,
      type: item.type,
    });

    onSelectQueueItem?.(item);
  };

  const handleValidate = () => {
    onValidate?.(currentVerification.id);

    // Retirer de la file d'attente
    const updatedItems = queueItems.filter(
      (item) => item.id !== currentVerification.id,
    );
    setQueueItems(updatedItems);

    // Sélectionner le prochain élément si disponible
    if (updatedItems.length > 0) {
      handleSelectQueueItem({ ...updatedItems[0], selected: true });
    }
  };

  const handleReject = () => {
    onReject?.(currentVerification.id);

    // Retirer de la file d'attente
    const updatedItems = queueItems.filter(
      (item) => item.id !== currentVerification.id,
    );
    setQueueItems(updatedItems);

    // Sélectionner le prochain élément si disponible
    if (updatedItems.length > 0) {
      handleSelectQueueItem({ ...updatedItems[0], selected: true });
    }
  };

  const handleReport = () => {
    onReport?.(currentVerification.id);
  };

  const getStatusColor = (status: "match" | "mismatch" | "pending") => {
    switch (status) {
      case "match":
        return { bg: colors.oskar.green + "20", text: colors.oskar.green };
      case "mismatch":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "pending":
        return { bg: colors.oskar.lightGrey, text: colors.oskar.grey };
      default:
        return { bg: colors.oskar.lightGrey, text: colors.oskar.grey };
    }
  };

  const getStatusText = (status: "match" | "mismatch" | "pending") => {
    switch (status) {
      case "match":
        return "Correspondance";
      case "mismatch":
        return "Différence détectée";
      case "pending":
        return "En vérification";
      default:
        return "En vérification";
    }
  };

  return (
    <div
      className={`d-flex flex-grow overflow-hidden ${className}`}
      style={{ height: "calc(100vh - 180px)" }}
    >
      {/* Panneau gauche - File d'attente */}
      <section
        className="bg-white border-end border-light d-flex flex-column"
        style={{ width: "384px", minWidth: "384px" }}
      >
        {/* En-tête */}
        <div className="px-4 py-3 border-bottom border-light">
          <div className="d-flex align-items-center justify-content-between">
            <h3
              className="fw-semibold mb-0"
              style={{ color: colors.oskar.black }}
            >
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              File d'attente
            </h3>
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: colors.oskar.green,
                color: "white",
                fontSize: "0.75rem",
                padding: "0.25rem 0.75rem",
              }}
            >
              {queueItems.length} demande{queueItems.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Liste de la file d'attente */}
        <div className="flex-grow-1 overflow-auto p-3">
          <div className="d-flex flex-column gap-3">
            {queueItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-3 cursor-pointer transition-all ${
                  item.selected ? "border-2 shadow-sm" : "border border-light"
                }`}
                style={{
                  borderColor: item.selected
                    ? colors.oskar.green
                    : colors.oskar.lightGrey,
                  backgroundColor: "white",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleSelectQueueItem(item)}
                onMouseEnter={(e) => {
                  if (!item.selected) {
                    e.currentTarget.style.borderColor = colors.oskar.green;
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.selected) {
                    e.currentTarget.style.borderColor = colors.oskar.lightGrey;
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle overflow-hidden position-relative"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-100 h-100 object-cover"
                      />
                    </div>
                    <div>
                      <h4
                        className="fw-semibold mb-1"
                        style={{ color: colors.oskar.black }}
                      >
                        {item.name}
                      </h4>
                      <p className="small text-muted mb-0">ID: {item.userId}</p>
                    </div>
                  </div>
                  <span
                    className={`badge rounded-pill d-flex align-items-center gap-1 ${
                      item.type === "professionnel"
                        ? "bg-orange"
                        : "bg-secondary"
                    }`}
                    style={{
                      backgroundColor:
                        item.type === "professionnel"
                          ? "#FEF3C7"
                          : colors.oskar.lightGrey,
                      color:
                        item.type === "professionnel"
                          ? "#92400E"
                          : colors.oskar.grey,
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.75rem",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        item.type === "professionnel" ? faBriefcase : faUser
                      }
                      style={{ fontSize: "0.65rem" }}
                    />
                    {item.type === "professionnel" ? "Pro" : "Particulier"}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FontAwesomeIcon
                      icon={faClock}
                      style={{ fontSize: "0.75rem" }}
                    />
                    <span>{item.waitingTime}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-warning small fw-medium">
                    <FontAwesomeIcon
                      icon={faCircle}
                      style={{
                        fontSize: "0.375rem",
                        color: item.selected
                          ? colors.oskar.green
                          : colors.oskar.orange,
                      }}
                    />
                    <span
                      style={{
                        color: item.selected
                          ? colors.oskar.green
                          : colors.oskar.orange,
                      }}
                    >
                      En attente
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message si file d'attente vide */}
          {queueItems.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-3">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.grey,
                    fontSize: "1.5rem",
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              </div>
              <h5
                className="fw-semibold mb-2"
                style={{ color: colors.oskar.black }}
              >
                File d'attente vide
              </h5>
              <p className="text-muted mb-0 small">
                Toutes les demandes ont été traitées. Aucune vérification en
                attente.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Panneau droit - Détails de vérification */}
      <section
        className="flex-grow-1 bg-light overflow-auto"
        style={{ backgroundColor: colors.oskar.lightGrey }}
      >
        <div className="p-4">
          {/* En-tête des détails */}
          <div className="mb-5">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3">
              <h2
                className="fw-bold mb-2 mb-md-0"
                style={{ color: colors.oskar.black, fontSize: "1.5rem" }}
              >
                Vérification de : {currentVerification.name}
              </h2>
              <span
                className="badge rounded-3 d-flex align-items-center gap-2"
                style={{
                  backgroundColor:
                    currentVerification.type === "professionnel"
                      ? "#FEF3C7"
                      : colors.oskar.lightGrey,
                  color:
                    currentVerification.type === "professionnel"
                      ? "#92400E"
                      : colors.oskar.black,
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                }}
              >
                <FontAwesomeIcon
                  icon={
                    currentVerification.type === "professionnel"
                      ? faBriefcase
                      : faUser
                  }
                />
                Compte{" "}
                {currentVerification.type === "professionnel"
                  ? "Professionnel"
                  : "Particulier"}
              </span>
            </div>
            <p className="text-muted small mb-0">
              Demande soumise le {currentVerification.submissionDate} à{" "}
              {currentVerification.submissionTime}
            </p>
          </div>

          {/* Visualiseur de document */}
          <div className="bg-white rounded-3 p-4 mb-4 shadow-sm">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
              <h3
                className="fw-semibold mb-2 mb-md-0"
                style={{ color: colors.oskar.black }}
              >
                Document d'identité
              </h3>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                  }}
                >
                  <FontAwesomeIcon icon={faSearchPlus} />
                  Agrandir
                </button>
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Télécharger
                </button>
              </div>
            </div>

            {/* Document image */}
            <div
              className="rounded-3 overflow-hidden mb-3"
              style={{
                backgroundColor: colors.oskar.lightGrey,
                border: `2px solid ${colors.oskar.lightGrey}`,
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={currentVerification.documentImage}
                alt={`Document d'identité de ${currentVerification.name}`}
                className="img-fluid"
                style={{
                  maxHeight: "384px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>Type de document: {currentVerification.documentType}</span>
            </div>
          </div>

          {/* Comparaison des données */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
            <h3
              className="fw-semibold mb-4 d-flex align-items-center gap-2"
              style={{ color: colors.oskar.black }}
            >
              <FontAwesomeIcon
                icon={faScaleBalanced}
                style={{ color: colors.oskar.green }}
              />
              Comparaison des données
            </h3>

            <div className="d-flex flex-column gap-3">
              {currentVerification.comparisons.map((comparison, index) => {
                const statusColor = getStatusColor(comparison.status);
                const statusText = getStatusText(comparison.status);

                return (
                  <div
                    key={index}
                    className="p-3 rounded-3"
                    style={{ backgroundColor: colors.oskar.lightGrey }}
                  >
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3">
                      <span
                        className="small fw-medium mb-1 mb-md-0"
                        style={{ color: colors.oskar.grey }}
                      >
                        {comparison.field === "name" && "Nom complet"}
                        {comparison.field === "dob" && "Date de naissance"}
                        {comparison.field === "id" && "Numéro de document"}
                        {comparison.field === "address" && "Adresse"}
                      </span>
                      <span
                        className="badge rounded-pill d-flex align-items-center gap-1"
                        style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.75rem",
                        }}
                      >
                        {comparison.status === "match" && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{ fontSize: "0.65rem" }}
                          />
                        )}
                        {statusText}
                      </span>
                    </div>

                    {comparison.field === "id" ||
                    comparison.field === "address" ? (
                      <div>
                        <p className="small text-muted mb-1">
                          {comparison.field === "id" ? "Numéro CNI" : "Ville"}
                        </p>
                        <p
                          className="fw-semibold mb-0"
                          style={{ color: colors.oskar.black }}
                        >
                          {comparison.userValue}
                        </p>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-md-6 mb-2 mb-md-0">
                          <p className="small text-muted mb-1">
                            Profil utilisateur
                          </p>
                          <p
                            className="fw-semibold mb-0"
                            style={{ color: colors.oskar.black }}
                          >
                            {comparison.userValue}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="small text-muted mb-1">
                            Document officiel
                          </p>
                          <p
                            className="fw-semibold mb-0"
                            style={{ color: colors.oskar.black }}
                          >
                            {comparison.documentValue}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note de vérification */}
            <div
              className="mt-4 p-3 rounded-3"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <div className="d-flex gap-3">
                <FontAwesomeIcon
                  icon={faLightbulb}
                  style={{
                    color: "#3B82F6",
                    marginTop: "0.25rem",
                  }}
                />
                <div>
                  <h4
                    className="fw-semibold small mb-1"
                    style={{ color: colors.oskar.black }}
                  >
                    Note de vérification
                  </h4>
                  <p className="small text-muted mb-0">
                    {currentVerification.verificationNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-3 p-4 shadow-sm">
            <div className="row g-3">
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleReject}
                  style={{
                    backgroundColor: "#EF4444",
                    color: "white",
                    border: "none",
                    padding: "0.75rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#DC2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#EF4444";
                  }}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  Rejeter
                </button>
              </div>
              <div className="col-md-6">
                <button
                  type="button"
                  className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleValidate}
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    border: "none",
                    padding: "0.75rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.greenHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                  }}
                >
                  <FontAwesomeIcon icon={faShieldHalved} />
                  Valider & Certifier
                </button>
              </div>
            </div>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none p-0"
                onClick={handleReport}
                style={{
                  color: colors.oskar.grey,
                  fontSize: "0.875rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.oskar.black;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.oskar.grey;
                }}
              >
                <FontAwesomeIcon icon={faFlag} className="me-2" />
                Signaler un problème
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
