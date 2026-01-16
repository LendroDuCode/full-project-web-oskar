// app/(back-office)/dashboard-vendeur/commandes/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPrint,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faTruck,
  faBox,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faMoneyBill,
  faShoppingCart,
  faUser,
  faEye,
  faCalendar,
  faCreditCard,
  faInfoCircle,
  faEdit,
  faBan,
  faCheck,
  faFileInvoice,
  faStore,
  faTag,
  faCalculator,
  faQrcode,
  faReceipt,
  faStar,
  faShippingFast,
  faBoxOpen,
  faUserCheck,
  faChartLine,
  faExchangeAlt,
  faHistory,
  faPaperclip,
  faCommentDots,
  faRedo,
  faExternalLinkAlt,
  faPlayCircle,
  faPauseCircle,
  faHourglassHalf,
  faExclamationTriangle,
  faHandPaper,
  faCheckDouble,
  faTruckLoading,
  faBoxes,
  faClipboardCheck,
  faThumbsUp,
  faThumbsDown,
  faBan as faBanSolid,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG, buildApiUrl } from "@/config/env";

// Types
interface Client {
  uuid: string;
  nom_complet: string;
  email: string;
  telephone: string;
}

interface InformationLivraison {
  adresse: string;
  instructions: string | null;
}

interface Produit {
  uuid: string;
  libelle: string;
  image: string;
  prix_original: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  logo: string;
}

interface Item {
  uuid: string;
  produit: Produit;
  quantite: number;
  prix_unitaire_vendu: string;
  sous_total: string;
  boutique: Boutique;
}

interface Statistiques {
  nombre_items: number;
  valeur_totale: string;
  quantite_totale: number;
}

interface CommandeDetail {
  uuid: string;
  numero_commande: string;
  total_vendeur: number;
  statut: string;
  statut_paiement: string;
  created_at: string | null;
  updated_at: string | null;
  mode_paiement: string;
  client: Client;
  informations_livraison: InformationLivraison;
  items: Item[];
  statistiques: Statistiques;
}

// Types pour les statuts
type CommandeStatut =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "expediee"
  | "livree"
  | "annulee"
  | "refusee";

export default function CommandeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const commandeUuid = params.uuid as string;

  const [commande, setCommande] = useState<CommandeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("produits");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Récupérer le token
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("oskar_token");
  };

  // Charger les détails de la commande
  const fetchCommandeDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);
    setUpdateMessage(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Vous devez être connecté");
      }

      const response = await axios.get(
        buildApiUrl(
          API_ENDPOINTS.COMMANDES.DETAIL_COMMANDES_VENDEUR(commandeUuid),
        ),
        {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          timeout: API_CONFIG.TIMEOUT,
        },
      );

      if (response.data.success) {
        setCommande(response.data.data);
        setSelectedStatus(response.data.data.statut);
        // Précharger la première image
        if (response.data.data.items?.[0]?.produit?.image) {
          const img = new Image();
          img.src = response.data.data.items[0].produit.image;
          img.onload = () => setImageLoaded(true);
        } else {
          setImageLoaded(true);
        }
      } else {
        setError(response.data.message || "Impossible de charger la commande");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails:", err);

      if (err.response?.status === 404) {
        setError("Commande non trouvée");
      } else if (err.response?.status === 401) {
        setError("Votre session a expiré");
      } else {
        setError(
          err.response?.data?.message ||
            "Erreur lors du chargement des détails",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [commandeUuid]);

  // Charger au montage
  useEffect(() => {
    if (commandeUuid) {
      fetchCommandeDetail();
    }
  }, [commandeUuid, fetchCommandeDetail]);

  // Mettre à jour le statut
  const handleUpdateStatus = async (newStatus: CommandeStatut) => {
    if (!commande) return;

    try {
      setUpdating(true);
      setUpdateMessage(null);
      const token = getToken();

      if (!token) {
        throw new Error("Vous devez être connecté");
      }

      const response = await axios.post(
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
        setCommande((prev) => (prev ? { ...prev, statut: newStatus } : null));
        setSelectedStatus(newStatus);
        setUpdateMessage(
          `Statut mis à jour: ${getStatusInfo(newStatus).label}`,
        );
        setTimeout(() => setUpdateMessage(null), 5000);
        setShowStatusModal(false);
        fetchCommandeDetail();
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du statut",
      );
    } finally {
      setUpdating(false);
    }
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

  // Obtenir les informations du statut
  const getStatusInfo = (status: CommandeStatut) => {
    switch (status) {
      case "en_attente":
        return {
          label: "En attente",
          color: "warning",
          icon: faHourglassHalf,
          bgColor: "bg-warning",
          textColor: "text-warning",
          bgOpacityColor: "bg-warning bg-opacity-10",
          iconColor: "text-warning",
          progress: 10,
          description: "Commande reçue, en attente de confirmation",
        };
      case "confirmee":
        return {
          label: "Confirmée",
          color: "info",
          icon: faCheckCircle,
          bgColor: "bg-info",
          textColor: "text-info",
          bgOpacityColor: "bg-info bg-opacity-10",
          iconColor: "text-info",
          progress: 30,
          description: "Commande confirmée par le vendeur",
        };
      case "en_preparation":
        return {
          label: "En préparation",
          color: "primary",
          icon: faBoxes,
          bgColor: "bg-primary",
          textColor: "text-primary",
          bgOpacityColor: "bg-primary bg-opacity-10",
          iconColor: "text-primary",
          progress: 50,
          description: "Les produits sont en cours de préparation",
        };
      case "expediee":
        return {
          label: "Expédiée",
          color: "success",
          icon: faTruckLoading,
          bgColor: "bg-success",
          textColor: "text-success",
          bgOpacityColor: "bg-success bg-opacity-10",
          iconColor: "text-success",
          progress: 75,
          description: "Commande expédiée au client",
        };
      case "livree":
        return {
          label: "Livrée",
          color: "success",
          icon: faCheckDouble,
          bgColor: "bg-success",
          textColor: "text-success",
          bgOpacityColor: "bg-success bg-opacity-10",
          iconColor: "text-success",
          progress: 100,
          description: "Commande livrée avec succès",
        };
      case "annulee":
        return {
          label: "Annulée",
          color: "danger",
          icon: faBanSolid,
          bgColor: "bg-danger",
          textColor: "text-danger",
          bgOpacityColor: "bg-danger bg-opacity-10",
          iconColor: "text-danger",
          progress: 0,
          description: "Commande annulée",
        };
      case "refusee":
        return {
          label: "Refusée",
          color: "danger",
          icon: faThumbsDown,
          bgColor: "bg-danger",
          textColor: "text-danger",
          bgOpacityColor: "bg-danger bg-opacity-10",
          iconColor: "text-danger",
          progress: 0,
          description: "Commande refusée",
        };
      default:
        return {
          label: "Inconnu",
          color: "secondary",
          icon: faInfoCircle,
          bgColor: "bg-secondary",
          textColor: "text-secondary",
          bgOpacityColor: "bg-secondary bg-opacity-10",
          iconColor: "text-secondary",
          progress: 0,
          description: "Statut inconnu",
        };
    }
  };

  // Obtenir les informations du paiement
  const getPaymentInfo = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paye":
        return {
          label: "Payée",
          color: "success",
          icon: faCheckCircle,
          bgColor: "bg-success",
          bgOpacityColor: "bg-success bg-opacity-10",
          iconColor: "text-success",
        };
      case "en_attente":
        return {
          label: "En attente",
          color: "warning",
          icon: faClock,
          bgColor: "bg-warning",
          bgOpacityColor: "bg-warning bg-opacity-10",
          iconColor: "text-warning",
        };
      default:
        return {
          label: "Non spécifié",
          color: "secondary",
          icon: faInfoCircle,
          bgColor: "bg-secondary",
          bgOpacityColor: "bg-secondary bg-opacity-10",
          iconColor: "text-secondary",
        };
    }
  };

  // Obtenir le mode de paiement
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "carte":
        return "Carte bancaire";
      case "virement":
        return "Virement bancaire";
      case "mobile_money":
        return "Mobile Money";
      case "especes":
        return "Espèces";
      case "non_specifie":
        return "Non spécifié";
      default:
        return method;
    }
  };

  // Imprimer la commande
  const handlePrint = () => {
    window.print();
  };

  // Contacter le client
  const handleContact = (type: "email" | "phone" | "whatsapp") => {
    if (!commande) return;

    if (type === "email" && commande.client.email) {
      window.location.href = `mailto:${commande.client.email}?subject=Commande ${commande.numero_commande}`;
    } else if (type === "phone" && commande.client.telephone) {
      const phone = commande.client.telephone.replace(/\s/g, "");
      window.location.href = `tel:${phone}`;
    } else if (type === "whatsapp" && commande.client.telephone) {
      const phone = commande.client.telephone.replace(/\D/g, "");
      window.open(
        `https://wa.me/${phone}?text=Bonjour, concernant votre commande ${commande.numero_commande}`,
        "_blank",
      );
    }
  };

  // Calculer le total
  const calculateTotal = () => {
    if (!commande) return 0;
    return commande.items.reduce(
      (sum, item) => sum + parseFloat(item.sous_total),
      0,
    );
  };

  // Ouvrir l'image en grand
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Fermer le modal d'image
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Sauvegarder la note
  const saveNote = () => {
    if (note.trim()) {
      localStorage.setItem(`note-commande-${commandeUuid}`, note);
      alert("Note sauvegardée localement");
    }
  };

  // Timeline des statuts
  const statusTimeline = [
    {
      status: "en_attente" as CommandeStatut,
      label: "En attente",
      icon: faHourglassHalf,
    },
    {
      status: "confirmee" as CommandeStatut,
      label: "Confirmée",
      icon: faCheckCircle,
    },
    {
      status: "en_preparation" as CommandeStatut,
      label: "En préparation",
      icon: faBoxes,
    },
    {
      status: "expediee" as CommandeStatut,
      label: "Expédiée",
      icon: faTruckLoading,
    },
    {
      status: "livree" as CommandeStatut,
      label: "Livrée",
      icon: faCheckDouble,
    },
  ];

  // Calculer la progression basée sur le statut actuel
  const calculateProgress = () => {
    if (!commande) return 0;
    const currentStatus = commande.statut as CommandeStatut;
    const statusInfo = getStatusInfo(currentStatus);
    return statusInfo.progress;
  };

  // Obtenir les statuts disponibles pour la transition
  const getAvailableStatuses = (
    currentStatus: CommandeStatut,
  ): CommandeStatut[] => {
    const statusFlow: Record<CommandeStatut, CommandeStatut[]> = {
      en_attente: ["confirmee", "annulee", "refusee"],
      confirmee: ["en_preparation", "annulee"],
      en_preparation: ["expediee", "annulee"],
      expediee: ["livree"],
      livree: [],
      annulee: [],
      refusee: [],
    };

    return statusFlow[currentStatus] || [];
  };

  // Obtenir le prochain statut recommandé
  const getNextRecommendedStatus = (
    currentStatus: CommandeStatut,
  ): CommandeStatut | null => {
    const flowOrder: CommandeStatut[] = [
      "en_attente",
      "confirmee",
      "en_preparation",
      "expediee",
      "livree",
    ];
    const currentIndex = flowOrder.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex >= flowOrder.length - 1) {
      return null;
    }

    return flowOrder[currentIndex + 1];
  };

  // Obtenir la couleur de progression
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 50) return "bg-info";
    if (progress >= 20) return "bg-primary";
    return "bg-warning";
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="mt-4 text-primary">Chargement de la commande...</h4>
          <p className="text-muted">Préparation des détails et des images</p>
        </div>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="text-danger display-1"
                  />
                </div>
                <h2 className="card-title mb-3">
                  Oups ! Une erreur est survenue
                </h2>
                <p className="card-text text-muted mb-4">
                  {error || "Commande non trouvée"}
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link
                    href="/dashboard-vendeur/commandes/nouvelles"
                    className="btn btn-primary btn-lg"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour aux commandes
                  </Link>
                  <button
                    onClick={fetchCommandeDetail}
                    className="btn btn-outline-primary btn-lg"
                  >
                    <FontAwesomeIcon icon={faRedo} className="me-2" />
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = commande.statut as CommandeStatut;
  const statusInfo = getStatusInfo(currentStatus);
  const paymentInfo = getPaymentInfo(commande.statut_paiement);
  const progress = calculateProgress();
  const totalAmount = calculateTotal();
  const availableStatuses = getAvailableStatuses(currentStatus);
  const nextRecommendedStatus = getNextRecommendedStatus(currentStatus);
  const progressColor = getProgressColor(progress);

  return (
    <>
      {/* Modal pour changer le statut */}
      {showStatusModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                  Changer le statut de la commande
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <p className="text-muted">
                    Sélectionnez le nouveau statut pour la commande{" "}
                    <strong>{commande.numero_commande}</strong>
                  </p>
                  <div className="alert alert-info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Statut actuel: <strong>{statusInfo.label}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nouveau statut
                  </label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value={currentStatus}>
                      {statusInfo.label} (actuel)
                    </option>
                    {availableStatuses.map((status) => {
                      const info = getStatusInfo(status);
                      return (
                        <option key={status} value={status}>
                          {info.label}{" "}
                          {status === nextRecommendedStatus && "→ (Recommandé)"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedStatus !== currentStatus && (
                  <div className="alert alert-warning">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="me-2"
                    />
                    Vous êtes sur le point de passer de{" "}
                    <strong>{statusInfo.label}</strong> à{" "}
                    <strong>
                      {getStatusInfo(selectedStatus as CommandeStatut).label}
                    </strong>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleUpdateStatus(selectedStatus as CommandeStatut)
                    }
                    disabled={selectedStatus === currentStatus || updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        Confirmer le changement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour image agrandie */}
      {selectedImage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 bg-transparent">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeImageModal}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage}
                  alt="Produit"
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid py-4">
        {/* Message de mise à jour */}
        {updateMessage && (
          <div className="row mb-3">
            <div className="col">
              <div
                className="alert alert-success alert-dismissible fade show shadow-sm"
                role="alert"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                <strong>Succès !</strong> {updateMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUpdateMessage(null)}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Header avec actions principales */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <Link
                        href="/dashboard-vendeur/commandes/nouvelles"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Retour
                      </Link>
                      <div className="vr d-none d-md-block"></div>
                      <h1 className="h3 mb-0 text-primary">
                        <FontAwesomeIcon icon={faReceipt} className="me-2" />
                        Commande {commande.numero_commande}
                      </h1>
                    </div>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        <FontAwesomeIcon icon={faCalendar} className="me-2" />
                        {formatDate(commande.created_at)}
                      </span>
                      <span
                        className={`badge ${statusInfo.bgOpacityColor} ${statusInfo.textColor}`}
                      >
                        <FontAwesomeIcon
                          icon={statusInfo.icon}
                          className="me-2"
                        />
                        {statusInfo.label}
                      </span>
                      <span
                        className={`badge ${paymentInfo.bgOpacityColor} ${paymentInfo.iconColor}`}
                      >
                        <FontAwesomeIcon
                          icon={paymentInfo.icon}
                          className="me-2"
                        />
                        {paymentInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={handlePrint}
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPrint} />
                      <span className="d-none d-md-inline">Imprimer</span>
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-success dropdown-toggle d-flex align-items-center gap-2"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className="d-none d-md-inline">Contacter</span>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleContact("email")}
                            disabled={!commande.client.email}
                          >
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="me-2 text-primary"
                            />
                            Email
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleContact("phone")}
                            disabled={!commande.client.telephone}
                          >
                            <FontAwesomeIcon
                              icon={faPhone}
                              className="me-2 text-success"
                            />
                            Téléphone
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleContact("whatsapp")}
                            disabled={!commande.client.telephone}
                          >
                            <FontAwesomeIcon
                              icon={faCommentDots}
                              className="me-2 text-success"
                            />
                            WhatsApp
                          </button>
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={fetchCommandeDetail}
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRedo} />
                      <span className="d-none d-md-inline">Actualiser</span>
                    </button>
                  </div>
                </div>

                {/* Barre de progression avec info */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <small className="text-muted">
                        Progression de la commande
                      </small>
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                          icon={statusInfo.icon}
                          className={statusInfo.iconColor}
                        />
                        <span className="fw-semibold">{statusInfo.label}</span>
                        <span className="text-muted">•</span>
                        <small className="text-muted">
                          {statusInfo.description}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-primary fs-4">
                        {progress}%
                      </div>
                      <small className="text-muted">Complétion</small>
                    </div>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "12px", borderRadius: "6px" }}
                  >
                    <div
                      className={`progress-bar ${progressColor} progress-bar-striped progress-bar-animated`}
                      role="progressbar"
                      style={{ width: `${progress}%`, borderRadius: "6px" }}
                    ></div>
                  </div>

                  {/* Timeline des statuts */}
                  <div className="d-flex justify-content-between mt-3 position-relative">
                    {statusTimeline.map((step, index) => {
                      const stepStatus = step.status;
                      const stepInfo = getStatusInfo(stepStatus);
                      const isCompleted = statusTimeline
                        .slice(0, index + 1)
                        .some(
                          (s) =>
                            statusTimeline.findIndex(
                              (st) => st.status === currentStatus,
                            ) >= index,
                        );
                      const isCurrent = stepStatus === currentStatus;
                      const isAvailable =
                        getAvailableStatuses(currentStatus).includes(
                          stepStatus,
                        );

                      return (
                        <div
                          key={stepStatus}
                          className="d-flex flex-column align-items-center position-relative"
                          style={{ flex: 1 }}
                        >
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center border-2 ${
                              isCurrent
                                ? "border-primary border-3"
                                : isCompleted
                                  ? "border-success"
                                  : "border-light"
                            } ${isCompleted ? stepInfo.bgColor : "bg-light"}`}
                            style={{
                              width: "50px",
                              height: "50px",
                              zIndex: 2,
                              cursor: isAvailable ? "pointer" : "default",
                            }}
                            onClick={() =>
                              isAvailable && handleUpdateStatus(stepStatus)
                            }
                            title={
                              isAvailable
                                ? `Passer à ${stepInfo.label}`
                                : stepInfo.description
                            }
                          >
                            <FontAwesomeIcon
                              icon={step.icon}
                              className={`${isCompleted ? "text-white" : isCurrent ? stepInfo.iconColor : "text-muted"}`}
                            />
                          </div>
                          <span
                            className={`mt-2 text-center fw-semibold ${isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted"}`}
                          >
                            {step.label}
                          </span>
                          {index < statusTimeline.length - 1 && (
                            <div
                              className={`position-absolute top-6 start-50 w-100 h-2 ${isCompleted ? "bg-success" : "bg-light"}`}
                              style={{ zIndex: 1 }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bouton pour changer le statut */}
                <div className="mt-4">
                  <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={() => setShowStatusModal(true)}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    <span>Changer le statut de la commande</span>
                  </button>
                  {nextRecommendedStatus && (
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Prochaine étape recommandée:{" "}
                        <button
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() =>
                            handleUpdateStatus(nextRecommendedStatus)
                          }
                        >
                          <strong className="text-primary">
                            {getStatusInfo(nextRecommendedStatus).label}
                          </strong>
                        </button>
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section statuts disponibles */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <FontAwesomeIcon
                    icon={faPlayCircle}
                    className="me-2 text-success"
                  />
                  Actions rapides sur le statut
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {availableStatuses.map((status) => {
                    const info = getStatusInfo(status);
                    const isRecommended = status === nextRecommendedStatus;

                    return (
                      <div key={status} className="col-md-3 col-6">
                        <button
                          className={`btn ${info.bgColor} text-white w-100 h-100 p-3 d-flex flex-column align-items-center justify-content-center ${isRecommended ? "border-3 border-warning" : ""}`}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={updating}
                        >
                          <FontAwesomeIcon
                            icon={info.icon}
                            className="fs-2 mb-2"
                          />
                          <span className="fw-semibold">{info.label}</span>
                          {isRecommended && (
                            <small className="mt-1">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-warning me-1"
                              />
                              Recommandé
                            </small>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Boutons annuler/refuser */}
                  {currentStatus !== "annulee" &&
                    currentStatus !== "refusee" && (
                      <>
                        <div className="col-md-3 col-6">
                          <button
                            className="btn btn-danger w-100 h-100 p-3 d-flex flex-column align-items-center justify-content-center"
                            onClick={() => handleUpdateStatus("annulee")}
                            disabled={updating}
                          >
                            <FontAwesomeIcon
                              icon={faBanSolid}
                              className="fs-2 mb-2"
                            />
                            <span className="fw-semibold">Annuler</span>
                          </button>
                        </div>
                        <div className="col-md-3 col-6">
                          <button
                            className="btn btn-danger w-100 h-100 p-3 d-flex flex-column align-items-center justify-content-center"
                            onClick={() => handleUpdateStatus("refusee")}
                            disabled={updating}
                          >
                            <FontAwesomeIcon
                              icon={faHandPaper}
                              className="fs-2 mb-2"
                            />
                            <span className="fw-semibold">Refuser</span>
                          </button>
                        </div>
                      </>
                    )}
                </div>

                {/* Légende */}
                <div className="mt-3 pt-3 border-top">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="bg-success rounded-circle"
                          style={{ width: "12px", height: "12px" }}
                        ></div>
                        <small className="text-muted">Statut actuel</small>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="bg-primary rounded-circle"
                          style={{ width: "12px", height: "12px" }}
                        ></div>
                        <small className="text-muted">Disponible</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="bg-warning rounded-circle"
                          style={{ width: "12px", height: "12px" }}
                        ></div>
                        <small className="text-muted">Recommandé</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="bg-light border rounded-circle"
                          style={{ width: "12px", height: "12px" }}
                        ></div>
                        <small className="text-muted">Non disponible</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale avec images en premier */}
        <div className="row mb-4">
          {/* Colonne des images des produits */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="me-2 text-primary"
                  />
                  Produits commandés
                </h3>
                <p className="text-muted mb-0 small">
                  {commande.items.length} article(s)
                </p>
              </div>
              <div className="card-body p-0">
                <div className="row g-2 p-3">
                  {commande.items.map((item, index) => (
                    <div key={item.uuid} className="col-6">
                      <div className="card border h-100 hover-lift">
                        <div
                          className="position-relative"
                          style={{ cursor: "pointer" }}
                          onClick={() => openImageModal(item.produit.image)}
                        >
                          <img
                            src={item.produit.image}
                            alt={item.produit.libelle}
                            className="card-img-top rounded-top"
                            style={{
                              height: "150px",
                              objectFit: "cover",
                              backgroundColor: "#f8f9fa",
                            }}
                            onLoad={() => index === 0 && setImageLoaded(true)}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-primary rounded-pill">
                              {item.quantite}
                            </span>
                          </div>
                        </div>
                        <div className="card-body p-3">
                          <h6
                            className="card-title text-truncate mb-2"
                            title={item.produit.libelle}
                          >
                            {item.produit.libelle}
                          </h6>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-primary fw-bold">
                              {formatPrice(item.prix_unitaire_vendu)}
                            </span>
                            <small className="text-muted">
                              ×{item.quantite}
                            </small>
                          </div>
                          <div className="mt-2">
                            <small className="text-success fw-semibold">
                              {formatPrice(item.sous_total)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer bg-white border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total produits</span>
                  <span className="h5 mb-0 text-success">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne des informations et actions */}
          <div className="col-lg-8">
            <div className="row">
              {/* Informations client */}
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h3 className="h5 mb-0">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="me-2 text-info"
                      />
                      Informations client
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-4">
                      <div className="flex-shrink-0">
                        <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center p-3">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-info fs-4"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h5 className="mb-1">{commande.client.nom_complet}</h5>
                        <div className="mb-2">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className="text-muted me-2"
                          />
                          <a
                            href={`mailto:${commande.client.email}`}
                            className="text-decoration-none"
                          >
                            {commande.client.email}
                          </a>
                        </div>
                        <div>
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="text-muted me-2"
                          />
                          <a
                            href={`tel:${commande.client.telephone}`}
                            className="text-decoration-none"
                          >
                            {commande.client.telephone}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        onClick={() => handleContact("email")}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                        Email
                      </button>
                      <button
                        onClick={() => handleContact("phone")}
                        className="btn btn-outline-success btn-sm"
                      >
                        <FontAwesomeIcon icon={faPhone} className="me-1" />
                        Appeler
                      </button>
                      <Link
                        href={`/dashboard-vendeur/messages?client=${commande.client.uuid}`}
                        className="btn btn-outline-info btn-sm"
                      >
                        <FontAwesomeIcon
                          icon={faCommentDots}
                          className="me-1"
                        />
                        Message
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de livraison */}
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-0">
                    <h3 className="h5 mb-0">
                      <FontAwesomeIcon
                        icon={faShippingFast}
                        className="me-2 text-warning"
                      />
                      Livraison
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex align-items-start">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-warning mt-1 me-2"
                        />
                        <div>
                          <div className="fw-semibold">Adresse</div>
                          <p className="mb-0">
                            {commande.informations_livraison.adresse}
                          </p>
                        </div>
                      </div>
                    </div>
                    {commande.informations_livraison.instructions && (
                      <div className="mb-3">
                        <div className="d-flex align-items-start">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-info mt-1 me-2"
                          />
                          <div>
                            <div className="fw-semibold">Instructions</div>
                            <p className="mb-0 text-muted">
                              {commande.informations_livraison.instructions}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <button className="btn btn-outline-warning w-100">
                        <FontAwesomeIcon icon={faTruck} className="me-2" />
                        Mettre à jour le suivi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets détaillés */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <ul className="nav nav-pills nav-fill" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "produits" ? "active" : ""}`}
                      onClick={() => setActiveTab("produits")}
                    >
                      <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                      Produits détaillés
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "financier" ? "active" : ""}`}
                      onClick={() => setActiveTab("financier")}
                    >
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      Récapitulatif financier
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "historique" ? "active" : ""}`}
                      onClick={() => setActiveTab("historique")}
                    >
                      <FontAwesomeIcon icon={faHistory} className="me-2" />
                      Historique
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body p-0">
                {/* Onglet Produits détaillés */}
                {activeTab === "produits" && (
                  <div className="p-4">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th
                              className="text-center"
                              style={{ width: "60px" }}
                            >
                              <FontAwesomeIcon icon={faQrcode} />
                            </th>
                            <th>Produit</th>
                            <th className="text-center">Quantité</th>
                            <th className="text-end">Prix unitaire</th>
                            <th className="text-end">Sous-total</th>
                            <th className="text-center">Boutique</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commande.items.map((item, index) => (
                            <tr key={item.uuid} className="hover-row">
                              <td className="text-center">
                                <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                  {index + 1}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    className="position-relative me-3"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      openImageModal(item.produit.image)
                                    }
                                  >
                                    <img
                                      src={item.produit.image}
                                      alt={item.produit.libelle}
                                      className="rounded"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div className="position-absolute top-0 start-0 bg-primary text-white px-1 rounded">
                                      {item.quantite}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="fw-semibold">
                                      {item.produit.libelle}
                                    </div>
                                    <small className="text-muted d-block">
                                      <FontAwesomeIcon
                                        icon={faTag}
                                        className="me-1"
                                      />
                                      Réf: {item.produit.uuid.substring(0, 8)}
                                      ...
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-primary rounded-pill px-3 py-1 fs-6">
                                  {item.quantite}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="fw-semibold">
                                  {formatPrice(item.prix_unitaire_vendu)}
                                </div>
                                <small className="text-muted d-block">
                                  <s>
                                    {formatPrice(item.produit.prix_original)}
                                  </s>
                                </small>
                              </td>
                              <td className="text-end">
                                <div className="fw-bold text-success fs-5">
                                  {formatPrice(item.sous_total)}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column align-items-center">
                                  <img
                                    src={item.boutique.logo}
                                    alt={item.boutique.nom}
                                    className="rounded-circle mb-1 border"
                                    style={{ width: "40px", height: "40px" }}
                                  />
                                  <small className="text-muted">
                                    {item.boutique.nom}
                                  </small>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    title="Voir le produit"
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                  <button
                                    className="btn btn-outline-success"
                                    title="Contacter"
                                  >
                                    <FontAwesomeIcon icon={faEnvelope} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={2} className="text-end">
                              <strong>Totaux</strong>
                            </td>
                            <td className="text-center">
                              <strong className="text-primary fs-5">
                                {commande.statistiques.quantite_totale}
                              </strong>
                            </td>
                            <td></td>
                            <td className="text-end">
                              <div className="fw-bold text-success fs-4">
                                {formatPrice(totalAmount)}
                              </div>
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Onglet Récapitulatif financier */}
                {activeTab === "financier" && (
                  <div className="p-4">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card border-0 bg-light-subtle mb-4">
                          <div className="card-body">
                            <h5 className="card-title text-primary mb-4">
                              <FontAwesomeIcon
                                icon={faCalculator}
                                className="me-2"
                              />
                              Détails financiers
                            </h5>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">
                                  Sous-total produits
                                </span>
                                <span className="fw-semibold">
                                  {formatPrice(totalAmount)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">
                                  Frais de livraison
                                </span>
                                <span className="fw-semibold">
                                  {formatPrice(0)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Taxes</span>
                                <span className="fw-semibold">
                                  {formatPrice(0)}
                                </span>
                              </div>
                              <hr />
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-dark fw-bold fs-5">
                                  Total commande
                                </span>
                                <span className="text-success fw-bold fs-4">
                                  {formatPrice(totalAmount)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 bg-light-subtle mb-4">
                          <div className="card-body">
                            <h5 className="card-title text-success mb-4">
                              <FontAwesomeIcon
                                icon={faMoneyBill}
                                className="me-2"
                              />
                              Votre revenu
                            </h5>
                            <div className="text-center py-3">
                              <div className="display-4 text-success fw-bold mb-2">
                                {formatPrice(commande.total_vendeur)}
                              </div>
                              <p className="text-muted">
                                Montant qui vous revient
                              </p>
                            </div>
                            <div className="mt-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">
                                  Commission plateforme
                                </span>
                                <span className="text-danger">
                                  {formatPrice(
                                    totalAmount - commande.total_vendeur,
                                  )}
                                </span>
                              </div>
                              <div
                                className="progress mb-3"
                                style={{ height: "6px" }}
                              >
                                <div
                                  className="progress-bar bg-success"
                                  style={{
                                    width: `${(commande.total_vendeur / totalAmount) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Historique */}
                {activeTab === "historique" && (
                  <div className="p-4">
                    <div className="card border-0">
                      <div className="card-body">
                        <h5 className="card-title text-primary mb-4">
                          <FontAwesomeIcon icon={faHistory} className="me-2" />
                          Historique des modifications
                        </h5>
                        <div className="timeline">
                          <div className="timeline-item">
                            <div className="timeline-badge bg-primary">
                              <FontAwesomeIcon icon={faShoppingCart} />
                            </div>
                            <div className="timeline-panel">
                              <div className="timeline-heading">
                                <h6 className="timeline-title">
                                  Commande créée
                                </h6>
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="me-1"
                                  />
                                  {formatDate(commande.created_at)}
                                </small>
                              </div>
                              <div className="timeline-body">
                                <p className="mb-0">
                                  La commande a été passée par le client
                                </p>
                              </div>
                            </div>
                          </div>
                          {commande.updated_at && (
                            <div className="timeline-item">
                              <div className="timeline-badge bg-success">
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </div>
                              <div className="timeline-panel">
                                <div className="timeline-heading">
                                  <h6 className="timeline-title">
                                    Dernière mise à jour
                                  </h6>
                                  <small className="text-muted">
                                    <FontAwesomeIcon
                                      icon={faCalendar}
                                      className="me-1"
                                    />
                                    {formatDate(commande.updated_at)}
                                  </small>
                                </div>
                                <div className="timeline-body">
                                  <p className="mb-0">
                                    Statut:{" "}
                                    <span
                                      className={`badge ${statusInfo.bgOpacityColor} ${statusInfo.textColor}`}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section notes et informations */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    className="me-2 text-info"
                  />
                  Notes internes
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Ajoutez vos notes internes ici..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <button onClick={saveNote} className="btn btn-primary">
                  <FontAwesomeIcon icon={faPaperclip} className="me-2" />
                  Sauvegarder la note
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-warning"
                  />
                  Informations techniques
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label text-muted">
                    ID de la commande
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={commande.uuid}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        navigator.clipboard.writeText(commande.uuid)
                      }
                    >
                      <FontAwesomeIcon icon={faPaperclip} />
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label text-muted">
                        Mode de paiement
                      </label>
                      <div className="fw-semibold">
                        {getPaymentMethod(commande.mode_paiement)}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label text-muted">
                        Nombre d'articles
                      </label>
                      <div className="fw-semibold">
                        {commande.statistiques.nombre_items}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }

        .hover-lift {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .hover-row:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
          cursor: pointer;
        }

        .nav-pills .nav-link {
          color: #6c757d;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          margin: 0 0.25rem;
        }

        .nav-pills .nav-link.active {
          background-color: #0d6efd;
          color: white;
          box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
        }

        .nav-pills .nav-link:hover:not(.active) {
          color: #0d6efd;
          background-color: rgba(13, 110, 253, 0.05);
        }

        .badge {
          border-radius: 0.375rem;
          font-weight: 500;
        }

        .bg-opacity-10 {
          background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
        }

        .timeline {
          position: relative;
          padding: 20px 0;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 25px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 30px;
        }

        .timeline-badge {
          position: absolute;
          left: 15px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
        }

        .timeline-panel {
          margin-left: 60px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          border: 1px solid #e9ecef;
        }

        .timeline-heading {
          margin-bottom: 10px;
        }

        .timeline-title {
          margin-bottom: 5px;
          font-weight: 600;
        }

        .progress-bar {
          border-radius: 0.375rem;
          transition: width 0.6s ease;
        }

        .progress-bar-animated {
          animation: progress-bar-stripes 1s linear infinite;
        }

        @keyframes progress-bar-stripes {
          0% {
            background-position: 1rem 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        .progress-bar-striped {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
        }

        .card {
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .table th {
          font-weight: 600;
          color: #495057;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          border-bottom: 2px solid #dee2e6;
        }

        .table td {
          padding: 1rem 0.75rem;
          vertical-align: middle;
          border-top: 1px solid #f0f0f0;
        }

        .table tbody tr:last-child td {
          border-bottom: 1px solid #dee2e6;
        }

        .dropdown-menu {
          border-radius: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .dropdown-item {
          padding: 0.5rem 1rem;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .vr {
          width: 1px;
          background-color: #dee2e6;
          opacity: 1;
          height: 24px;
        }

        .border-3 {
          border-width: 3px !important;
        }

        .border-2 {
          border-width: 2px !important;
        }

        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }

          .table-responsive {
            font-size: 0.875rem;
          }

          .btn-group-sm > .btn {
            padding: 0.25rem 0.4rem;
            font-size: 0.75rem;
          }

          .progress {
            height: 8px !important;
          }
        }
      `}</style>
    </>
  );
}
