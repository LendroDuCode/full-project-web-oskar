// app/(front-office)/commandes-nouvelles/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheckCircle,
  faTimesCircle,
  faTruck,
  faBox,
  faCheck,
  faBan,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faEnvelope,
  faPhone,
  faClock,
  faCalendar,
  faShoppingCart,
  faUser,
  faMoneyBill,
  faInfoCircle,
  faPrint,
  faCheckSquare,
  faSquare,
  faClipboardList,
  faStore,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG, buildApiUrl } from "@/config/env";
import colors from "@/app/shared/constants/colors";

// Types pour les commandes
interface Client {
  nom_complet: string;
  email: string;
  telephone?: string;
}

interface Produit {
  libelle: string;
  image: string;
}

interface Boutique {
  nom: string;
}

interface Item {
  produit: Produit;
  quantite: number;
  prix_unitaire: string;
  sous_total: string;
  boutique: Boutique;
}

interface Commande {
  uuid: string;
  numero_commande: string;
  total: number;
  statut: string;
  statut_paiement: string;
  created_at: string | null;
  client: Client;
  nombre_items: number;
  items: Item[];
}

// Composant de badge de statut
const StatusBadge = ({
  statut,
  statut_paiement,
}: {
  statut: string;
  statut_paiement: string;
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "en_attente":
        return {
          label: "En attente",
          color: "warning",
          icon: faClock,
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
        };
      case "confirmee":
        return {
          label: "Confirmée",
          color: "info",
          icon: faCheckCircle,
          bgColor: "bg-info bg-opacity-10",
          textColor: "text-info",
          borderColor: "border-info border-opacity-25",
        };
      case "preparee":
        return {
          label: "Préparée",
          color: "primary",
          icon: faBox,
          bgColor: "bg-primary bg-opacity-10",
          textColor: "text-primary",
          borderColor: "border-primary border-opacity-25",
        };
      case "expediee":
        return {
          label: "Expédiée",
          color: "success",
          icon: faTruck,
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
        };
      case "livree":
        return {
          label: "Livrée",
          color: "success",
          icon: faCheck,
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
        };
      case "annulee":
        return {
          label: "Annulée",
          color: "danger",
          icon: faBan,
          bgColor: "bg-danger bg-opacity-10",
          textColor: "text-danger",
          borderColor: "border-danger border-opacity-25",
        };
      default:
        return {
          label: "Inconnu",
          color: "secondary",
          icon: faInfoCircle,
          bgColor: "bg-secondary bg-opacity-10",
          textColor: "text-secondary",
          borderColor: "border-secondary border-opacity-25",
        };
    }
  };

  const paymentInfo =
    statut_paiement === "paye"
      ? {
          label: "Payée",
          color: "success",
          icon: faMoneyBill,
          bgColor: "bg-success bg-opacity-10",
          textColor: "text-success",
          borderColor: "border-success border-opacity-25",
        }
      : {
          label: "En attente",
          color: "warning",
          icon: faClock,
          bgColor: "bg-warning bg-opacity-10",
          textColor: "text-warning",
          borderColor: "border-warning border-opacity-25",
        };

  const statusInfo = getStatusInfo(statut);

  return (
    <div className="d-flex flex-column gap-1">
      <span
        className={`badge ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} d-inline-flex align-items-center gap-1`}
      >
        <FontAwesomeIcon icon={statusInfo.icon} className="fs-12" />
        <span>{statusInfo.label}</span>
      </span>
      <span
        className={`badge ${paymentInfo.bgColor} ${paymentInfo.textColor} border ${paymentInfo.borderColor} d-inline-flex align-items-center gap-1`}
      >
        <FontAwesomeIcon icon={paymentInfo.icon} className="fs-12" />
        <span>{paymentInfo.label}</span>
      </span>
    </div>
  );
};

// Composant de pagination
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  indexOfFirstItem,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  onPageChange: (page: number) => void;
}) => {
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-4 border-top">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted">
          Affichage de{" "}
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> commandes
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Première page"
              >
                «
              </button>
            </li>

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                ‹
              </button>
            </li>

            {renderPageNumbers().map((pageNum, index) => (
              <li
                key={index}
                className={`page-item ${
                  pageNum === currentPage ? "active" : ""
                } ${pageNum === "..." ? "disabled" : ""}`}
              >
                {pageNum === "..." ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(pageNum as number)}
                  >
                    {pageNum}
                  </button>
                )}
              </li>
            ))}

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                ›
              </button>
            </li>

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Dernière page"
              >
                »
              </button>
            </li>
          </ul>
        </nav>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Page :</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= totalPages) {
                onPageChange(value);
              }
            }}
            className="form-control form-control-sm text-center"
            style={{ width: "70px" }}
          />
          <span className="text-muted">sur {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default function CommandesNouvelles() {
  // États pour les données
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Commande | "client.nom_complet" | "created_at";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedCommandes, setSelectedCommandes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // États pour les actions en cours
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    confirmee: 0,
    preparee: 0,
    expediee: 0,
    livree: 0,
    annulee: 0,
    totalAmount: 0,
    avgOrderValue: 0,
  });

  // Récupérer le token
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("oskar_token");
  };

  // Fonction pour charger les commandes
  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Vous devez être connecté pour voir vos commandes");
      }

      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.COMMANDES.BOUTIQUE_ORDERS),
        {},
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          timeout: API_CONFIG.TIMEOUT,
        },
      );

      if (response.data.success) {
        const commandesData = response.data.data || [];
        setCommandes(commandesData);

        // Calculer les statistiques
        calculateStats(commandesData);

        // Mettre à jour la pagination
        setPagination((prev) => ({
          ...prev,
          total: commandesData.length,
          pages: Math.ceil(commandesData.length / prev.limit),
        }));
      } else {
        setError(
          response.data.message || "Impossible de charger les commandes",
        );
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des commandes:", err);

      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err.message?.includes("connecté")) {
        setError(err.message);
      } else {
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement des commandes. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les commandes au montage
  useEffect(() => {
    fetchCommandes();
  }, []);

  // Calculer les statistiques
  const calculateStats = (commandesList: Commande[]) => {
    let totalAmount = 0;
    let en_attente = 0;
    let confirmee = 0;
    let preparee = 0;
    let expediee = 0;
    let livree = 0;
    let annulee = 0;

    commandesList.forEach((commande) => {
      totalAmount += commande.total;

      switch (commande.statut) {
        case "en_attente":
          en_attente++;
          break;
        case "confirmee":
          confirmee++;
          break;
        case "preparee":
          preparee++;
          break;
        case "expediee":
          expediee++;
          break;
        case "livree":
          livree++;
          break;
        case "annulee":
          annulee++;
          break;
      }
    });

    const avgOrderValue =
      commandesList.length > 0 ? totalAmount / commandesList.length : 0;

    setStats({
      total: commandesList.length,
      en_attente,
      confirmee,
      preparee,
      expediee,
      livree,
      annulee,
      totalAmount,
      avgOrderValue,
    });
  };

  // Formater le prix
  const formatPrice = (price: number | string) => {
    const priceNum = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceNum);
  };

  // Formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  // Fonction de tri
  const requestSort = (
    key: keyof Commande | "client.nom_complet" | "created_at",
  ) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (
    key: keyof Commande | "client.nom_complet" | "created_at",
  ) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Filtrer et trier les commandes
  const filteredCommandes = useMemo(() => {
    let result = [...commandes];

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.numero_commande.toLowerCase().includes(searchLower) ||
          c.client.nom_complet.toLowerCase().includes(searchLower) ||
          c.client.email.toLowerCase().includes(searchLower) ||
          c.items.some((item) =>
            item.produit.libelle.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Filtrer par statut
    if (statusFilter !== "all") {
      result = result.filter((c) => c.statut === statusFilter);
    }

    // Filtrer par paiement
    if (paymentFilter !== "all") {
      result = result.filter((c) => c.statut_paiement === paymentFilter);
    }

    // Appliquer le tri
    if (sortConfig && result.length > 0) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "client.nom_complet") {
          aValue = a.client.nom_complet;
          bValue = b.client.nom_complet;
        } else if (sortConfig.key === "created_at") {
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
        } else {
          aValue = a[sortConfig.key as keyof Commande];
          bValue = b[sortConfig.key as keyof Commande];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [commandes, searchTerm, statusFilter, paymentFilter, sortConfig]);

  // Pagination côté client
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredCommandes.slice(startIndex, endIndex);
  }, [filteredCommandes, pagination.page, pagination.limit]);

  // Mettre à jour la pagination totale basée sur les résultats filtrés
  const filteredPagination = useMemo(() => {
    const totalPages = Math.ceil(filteredCommandes.length / pagination.limit);
    return {
      ...pagination,
      total: filteredCommandes.length,
      pages: totalPages > 0 ? totalPages : 1,
    };
  }, [filteredCommandes.length, pagination]);

  // Gestion de la sélection multiple
  const handleSelectCommande = (commandeId: string) => {
    setSelectedCommandes((prev) => {
      if (prev.includes(commandeId)) {
        return prev.filter((id) => id !== commandeId);
      } else {
        return [...prev, commandeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCommandes([]);
    } else {
      const allCommandeIds = currentItems.map((commande) => commande.uuid);
      setSelectedCommandes(allCommandeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageCommandeIds = currentItems.map((commande) => commande.uuid);
    const allSelected = pageCommandeIds.every((id) =>
      selectedCommandes.includes(id),
    );

    if (allSelected) {
      // Désélectionner tous les commandes de la page
      setSelectedCommandes((prev) =>
        prev.filter((id) => !pageCommandeIds.includes(id)),
      );
    } else {
      // Sélectionner tous les commandes de la page
      const newSelection = [
        ...new Set([...selectedCommandes, ...pageCommandeIds]),
      ];
      setSelectedCommandes(newSelection);
    }
  };

  // Mettre à jour le statut d'une commande
  const handleUpdateStatus = async (
    commandeUuid: string,
    newStatus: string,
  ) => {
    try {
      setUpdateLoading(commandeUuid);
      const token = getToken();

      if (!token) {
        throw new Error("Vous devez être connecté");
      }

      const response = await axios.put(
        buildApiUrl(
          API_ENDPOINTS.COMMANDES.VENDEUR_UPDATE_STATUS(commandeUuid),
        ),
        { statut: newStatus },
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          timeout: API_CONFIG.TIMEOUT,
        },
      );

      if (response.data.success) {
        // Mettre à jour la liste localement
        setCommandes((prev) =>
          prev.map((commande) =>
            commande.uuid === commandeUuid
              ? { ...commande, statut: newStatus }
              : commande,
          ),
        );

        // Recalculer les stats
        const updatedCommandes = commandes.map((commande) =>
          commande.uuid === commandeUuid
            ? { ...commande, statut: newStatus }
            : commande,
        );
        calculateStats(updatedCommandes);

        setSuccessMessage("Statut mis à jour avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setInfoMessage(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du statut. Veuillez réessayer.",
      );
    } finally {
      setUpdateLoading(null);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "confirm" | "prepare" | "ship" | "deliver" | "cancel",
  ) => {
    if (selectedCommandes.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins une commande");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const commandeId of selectedCommandes) {
        try {
          let newStatus = "";
          switch (action) {
            case "confirm":
              newStatus = "confirmee";
              break;
            case "prepare":
              newStatus = "preparee";
              break;
            case "ship":
              newStatus = "expediee";
              break;
            case "deliver":
              newStatus = "livree";
              break;
            case "cancel":
              newStatus = "annulee";
              break;
          }

          await handleUpdateStatus(commandeId, newStatus);
          successCount++;
        } catch (err) {
          console.error(`Erreur pour la commande ${commandeId}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} commande(s) mise(s) à jour avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      fetchCommandes();

      // Réinitialiser la sélection
      setSelectedCommandes([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage(err.message || "Erreur lors de l'action en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Exporter les commandes
  const handleExport = () => {
    if (filteredCommandes.length === 0) {
      setInfoMessage("Aucune commande à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    // Exporter en CSV
    const csvContent = [
      [
        "N° Commande",
        "Client",
        "Email",
        "Téléphone",
        "Total",
        "Statut",
        "Paiement",
        "Date",
        "Nombre d'articles",
      ],
      ...filteredCommandes.map((c) => [
        c.numero_commande,
        c.client.nom_complet,
        c.client.email,
        c.client.telephone || "N/A",
        formatPrice(c.total),
        c.statut,
        c.statut_paiement,
        formatDate(c.created_at),
        c.nombre_items,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commandes-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Export CSV réussi");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedCommandes([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((commande) =>
        selectedCommandes.includes(commande.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedCommandes, currentItems]);

  // Effet pour gérer les changements de filtres
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, statusFilter, paymentFilter]);

  const itemsPerPageOptions = [5, 10, 20, 50];

  return (
    <div className="p-3 p-md-4">
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-0 py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <p className="text-muted mb-1">Gestion des Commandes</p>
              <div className="d-flex align-items-center gap-3">
                <h2 className="h4 mb-0 fw-bold">Liste des Commandes</h2>
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  {filteredCommandes.length} commande(s){" "}
                  {selectedCommandes.length > 0 &&
                    `(${selectedCommandes.length} sélectionnée(s))`}
                </span>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={fetchCommandes}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} spin={loading} />
                Rafraîchir
              </button>

              <button
                onClick={handleExport}
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                disabled={commandes.length === 0 || loading}
              >
                <FontAwesomeIcon icon={faDownload} />
                Exporter CSV
              </button>
            </div>
          </div>

          {/* Messages d'alerte */}
          {error && (
            <div
              className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
              role="alert"
            >
              <FontAwesomeIcon icon={faBan} className="me-2" />
              <strong>Attention:</strong> {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {successMessage && (
            <div
              className="alert alert-success alert-dismissible fade show mt-3 mb-0"
              role="alert"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              <strong>Succès:</strong> {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          {infoMessage && (
            <div
              className="alert alert-info alert-dismissible fade show mt-3 mb-0"
              role="alert"
            >
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>Information:</strong> {infoMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setInfoMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          )}
        </div>

        {/* Barre d'actions en masse */}
        {selectedCommandes.length > 0 && (
          <div className="p-3 border-bottom bg-warning bg-opacity-10">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-warning"
                />
                <span className="fw-semibold">
                  {selectedCommandes.length} commande(s) sélectionnée(s)
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction("confirm")}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Confirmer</span>
                </button>

                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction("prepare")}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faBox} />
                  <span>Préparer</span>
                </button>

                <button
                  className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction("ship")}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faTruck} />
                  <span>Expédier</span>
                </button>

                <button
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction("deliver")}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Livrer</span>
                </button>

                <button
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction("cancel")}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faBan} />
                  <span>Annuler</span>
                </button>

                <button
                  className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                  onClick={() => {
                    setSelectedCommandes([]);
                    setSelectAll(false);
                  }}
                  disabled={bulkActionLoading}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <span>Annuler sélection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="p-4 border-bottom bg-light-subtle">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card border-0 bg-white shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <FontAwesomeIcon
                        icon={faShoppingCart}
                        className="text-primary fs-4"
                      />
                    </div>
                    <div>
                      <div className="fs-3 fw-bold">{stats.total}</div>
                      <div className="text-muted small">Commandes totales</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-white shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2">
                      <FontAwesomeIcon
                        icon={faMoneyBill}
                        className="text-success fs-4"
                      />
                    </div>
                    <div>
                      <div className="fs-3 fw-bold">
                        {formatPrice(stats.totalAmount)}
                      </div>
                      <div className="text-muted small">Chiffre d'affaires</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-white shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-warning fs-4"
                      />
                    </div>
                    <div>
                      <div className="fs-3 fw-bold">{stats.en_attente}</div>
                      <div className="text-muted small">En attente</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-white shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-info fs-4"
                      />
                    </div>
                    <div>
                      <div className="fs-3 fw-bold">
                        {formatPrice(stats.avgOrderValue)}
                      </div>
                      <div className="text-muted small">Panier moyen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-4 border-bottom bg-light-subtle">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Rechercher par N°, client, email ou produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0 ps-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="confirmee">Confirmée</option>
                  <option value="preparee">Préparée</option>
                  <option value="expediee">Expédiée</option>
                  <option value="livree">Livrée</option>
                  <option value="annulee">Annulée</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faMoneyBill} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0 ps-0"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">Tous les paiements</option>
                  <option value="en_attente">En attente</option>
                  <option value="paye">Payé</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0 ps-0"
                  value={pagination.limit}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      limit: Number(e.target.value),
                      page: 1,
                    }))
                  }
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-1">
              <button
                onClick={resetFilters}
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
                title="Réinitialiser les filtres"
              >
                <FontAwesomeIcon icon={faTimesCircle} />
                <span className="d-none d-md-inline">Reset</span>
              </button>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  Résultats: <strong>{filteredCommandes.length}</strong>{" "}
                  commande(s) sur <strong>{commandes.length}</strong> au total
                  {searchTerm && (
                    <>
                      {" "}
                      pour "<strong>{searchTerm}</strong>"
                    </>
                  )}
                  {statusFilter !== "all" && (
                    <>
                      {" "}
                      | Statut: "
                      <strong>
                        {statusFilter === "en_attente"
                          ? "En attente"
                          : statusFilter === "confirmee"
                            ? "Confirmée"
                            : statusFilter === "preparee"
                              ? "Préparée"
                              : statusFilter === "expediee"
                                ? "Expédiée"
                                : statusFilter === "livree"
                                  ? "Livrée"
                                  : "Annulée"}
                      </strong>
                      "
                    </>
                  )}
                  {paymentFilter !== "all" && (
                    <>
                      {" "}
                      | Paiement: "
                      <strong>
                        {paymentFilter === "paye" ? "Payé" : "En attente"}
                      </strong>
                      "
                    </>
                  )}
                </small>
              </div>
            </div>

            <div className="col-md-6 text-end">
              <div className="d-flex align-items-center gap-2 justify-content-end">
                {selectedCommandes.length > 0 && (
                  <small className="text-primary fw-semibold">
                    {selectedCommandes.length} sélectionnée(s)
                  </small>
                )}
                <button
                  onClick={handleSelectAllOnPage}
                  className="btn btn-sm btn-outline-primary"
                  disabled={currentItems.length === 0}
                >
                  <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                  Sélectionner la page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3">Chargement des commandes...</p>
            </div>
          ) : (
            <>
              {filteredCommandes.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="alert alert-info mx-auto"
                    style={{ maxWidth: "500px" }}
                  >
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className="fs-1 mb-3 text-info"
                    />
                    <h5 className="alert-heading">Aucune commande trouvée</h5>
                    <p className="mb-0">
                      {commandes.length === 0
                        ? "Aucune commande dans votre boutique"
                        : "Aucune commande ne correspond à vos critères de recherche"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "50px" }} className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectAll && currentItems.length > 0}
                              onChange={handleSelectAll}
                              disabled={currentItems.length === 0}
                              title={
                                selectAll
                                  ? "Tout désélectionner"
                                  : "Tout sélectionner"
                              }
                            />
                          </div>
                        </th>
                        <th style={{ width: "60px" }} className="text-center">
                          #
                        </th>
                        <th style={{ width: "150px" }}>
                          <button
                            className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                            onClick={() => requestSort("numero_commande")}
                          >
                            N° Commande
                            {getSortIcon("numero_commande")}
                          </button>
                        </th>
                        <th style={{ width: "180px" }}>
                          <button
                            className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                            onClick={() => requestSort("client.nom_complet")}
                          >
                            <FontAwesomeIcon icon={faUser} className="me-1" />
                            Client
                            {getSortIcon("client.nom_complet")}
                          </button>
                        </th>
                        <th style={{ width: "200px" }}>Produits</th>
                        <th style={{ width: "120px" }}>
                          <button
                            className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                            onClick={() => requestSort("total")}
                          >
                            <FontAwesomeIcon
                              icon={faMoneyBill}
                              className="me-1"
                            />
                            Total
                            {getSortIcon("total")}
                          </button>
                        </th>
                        <th style={{ width: "120px" }}>
                          <span className="fw-semibold">Statut</span>
                        </th>
                        <th style={{ width: "150px" }}>
                          <button
                            className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                            onClick={() => requestSort("created_at")}
                          >
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="me-1"
                            />
                            Date
                            {getSortIcon("created_at")}
                          </button>
                        </th>
                        <th style={{ width: "140px" }} className="text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((commande, index) => (
                        <tr
                          key={commande.uuid}
                          className={`align-middle ${selectedCommandes.includes(commande.uuid) ? "table-active" : ""}`}
                        >
                          <td className="text-center">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedCommandes.includes(
                                  commande.uuid,
                                )}
                                onChange={() =>
                                  handleSelectCommande(commande.uuid)
                                }
                              />
                            </div>
                          </td>
                          <td className="text-center text-muted fw-semibold">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </td>
                          <td>
                            <div className="fw-semibold font-monospace">
                              {commande.numero_commande}
                            </div>
                            <small className="text-muted">
                              {commande.nombre_items} article(s)
                            </small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div
                                  className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: "40px", height: "40px" }}
                                >
                                  <FontAwesomeIcon icon={faUser} />
                                </div>
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <div className="fw-semibold">
                                  {commande.client.nom_complet}
                                </div>
                                <div className="small text-muted">
                                  {commande.client.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {commande.items
                                .slice(0, 2)
                                .map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <img
                                      src={item.produit.image}
                                      alt={item.produit.libelle}
                                      className="rounded"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div>
                                      <div
                                        className="small text-truncate"
                                        style={{ maxWidth: "150px" }}
                                      >
                                        {item.produit.libelle}
                                      </div>
                                      <small className="text-muted">
                                        {item.quantite} ×{" "}
                                        {formatPrice(item.prix_unitaire)}
                                      </small>
                                    </div>
                                  </div>
                                ))}
                              {commande.items.length > 2 && (
                                <small className="text-muted">
                                  +{commande.items.length - 2} autre(s)
                                  produit(s)
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              className="fw-bold"
                              style={{ color: colors.oskar.green }}
                            >
                              {formatPrice(commande.total)}
                            </div>
                          </td>
                          <td>
                            <StatusBadge
                              statut={commande.statut}
                              statut_paiement={commande.statut_paiement}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <small className="text-muted">
                                {formatDate(commande.created_at)}
                              </small>
                            </div>
                          </td>
                          <td className="text-center">
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
                              <Link
                                href={`/dashboard-vendeur/commandes/${commande.uuid}`}
                                className="btn btn-outline-primary"
                                title="Voir détails"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Link>
                              <button
                                className="btn btn-outline-success"
                                title="Confirmer"
                                onClick={() =>
                                  handleUpdateStatus(commande.uuid, "confirmee")
                                }
                                disabled={
                                  updateLoading === commande.uuid ||
                                  commande.statut !== "en_attente"
                                }
                              >
                                {updateLoading === commande.uuid ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                )}
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                title="Contacter"
                                onClick={() =>
                                  (window.location.href = `/messages?commande=${commande.uuid}`)
                                }
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {filteredPagination.total > filteredPagination.limit && (
                    <Pagination
                      currentPage={filteredPagination.page}
                      totalPages={filteredPagination.pages}
                      totalItems={filteredCommandes.length}
                      itemsPerPage={filteredPagination.limit}
                      indexOfFirstItem={
                        (filteredPagination.page - 1) * filteredPagination.limit
                      }
                      onPageChange={(page) =>
                        setPagination((prev) => ({ ...prev, page }))
                      }
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .font-monospace {
          font-family:
            "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }

        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .bg-opacity-10 {
          background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
        }

        .border-opacity-25 {
          border-color: rgba(var(--bs-primary-rgb), 0.25) !important;
        }
      `}</style>
    </div>
  );
}
