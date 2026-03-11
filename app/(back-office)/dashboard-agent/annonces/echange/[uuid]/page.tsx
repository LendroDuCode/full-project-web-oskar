"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRightArrowLeft,
  faUser,
  faCalendar,
  faPhone,
  faMessage,
  faInfoCircle,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faPrint,
  faCheck,
  faXmark,
  faBan,
  faBox,
  faMoneyBill,
  faExchangeAlt,
  faMapMarkerAlt,
  faTag,
  faEye,
  faAngleUp,
  faAngleDown,
  faHeart,
  faShareAlt,
  faCog,
  faClock,
  faSearch,
  faMinus,
  faPlus,
  faSync,
  faChevronLeft,
  faChevronRight,
  faExpand,
  faCompress,
  faCube,
  faLayerGroup,
  faArrowsRotate,
  faRocket,
  faShield,
  faTrash,
  faLock,
  faUnlock,
  faBell,
  faEnvelope,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

// Interface TypeScript
interface Echange {
  uuid: string;
  nomElementEchange?: string;
  typeEchange?: string;
  description?: string;
  estPublie: boolean;
  estBloque: boolean;
  statut: string;
  disponible: boolean;
  quantite: number;
  categorie?: string;
  image?: string;
  objetPropose?: string;
  objetDemande?: string;
  valeurPropose?: number | string;
  valeurDemande?: number | string;
  descriptionPropose?: string;
  descriptionDemande?: string;
  prix?: number | string;
  nom_initiateur?: string;
  numero?: string;
  localisation?: string;
  dateProposition?: string;
  dureeValidite?: string;
  message?: string;
  typeDestinataire?: string;
  modeRemise?: string;
  etat?: string;
  conditions?: string;
  nombre_vues?: number;
  nombre_favoris?: number;
  nombre_propositions?: number;
  createdAt: string;
  updatedAt: string;
}

interface Perspective {
  name: string;
  rotation: { x: number; y: number };
  zoom: number;
}

// ✅ ALERTES AMÉLIORÉES - Plus belles et plus parlantes
const CustomAlert = ({
  type,
  title,
  message,
  onClose,
}: {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose: () => void;
}) => {
  const icons = {
    success: faRocket,
    error: faExclamationTriangle,
    warning: faFlag,
    info: faBell,
  };

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  const backgrounds = {
    success: "rgba(16, 185, 129, 0.1)",
    error: "rgba(239, 68, 68, 0.1)",
    warning: "rgba(245, 158, 11, 0.1)",
    info: "rgba(59, 130, 246, 0.1)",
  };

  return (
    <div
      className="alert slide-in-right shadow-lg border-0"
      style={{
        backgroundColor: backgrounds[type],
        borderLeft: `5px solid ${colors[type]}`,
        borderRadius: "16px",
        minWidth: "350px",
        maxWidth: "450px",
        animation: "slideInRight 0.3s ease-out",
      }}
      role="alert"
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: `${colors[type]}20`,
            color: colors[type],
          }}
        >
          <FontAwesomeIcon icon={icons[type]} style={{ fontSize: "1.5rem" }} />
        </div>
        <div className="flex-grow-1">
          <h5 className="fw-bold mb-1" style={{ color: "#1f2937" }}>
            {title}
          </h5>
          <p className="mb-0" style={{ color: "#4b5563", fontSize: "0.9rem" }}>
            {message}
          </p>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
          style={{
            opacity: 0.5,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
        />
      </div>
    </div>
  );
};

// ✅ CONFIRMATION AMÉLIORÉE - Plus moderne
const CustomConfirm = ({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
        <div className="modal-content border-0 shadow-xl" style={{ borderRadius: "24px" }}>
          <div className="modal-body p-4 text-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: "2.5rem" }} />
            </div>
            <h4 className="fw-bold mb-2">{title}</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
              {message}
            </p>
            <div className="d-flex gap-3">
              <button
                className="btn btn-light flex-grow-1 py-3"
                onClick={onCancel}
                style={{
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger flex-grow-1 py-3"
                onClick={onConfirm}
                style={{
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [echange, setEchange] = useState<Echange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  // États pour la visualisation 3D
  const [activePerspective, setActivePerspective] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isRotating, setIsRotating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Perspectives 3D pour l'échange
  const perspectives: Perspective[] = [
    { name: "Vue de face", rotation: { x: -20, y: 45 }, zoom: 1 },
    { name: "Vue de côté", rotation: { x: -10, y: 90 }, zoom: 1 },
    { name: "Vue de dessus", rotation: { x: -70, y: 45 }, zoom: 1.2 },
    { name: "Vue de l'objet proposé", rotation: { x: -20, y: 180 }, zoom: 1.3 },
    { name: "Vue de l'objet demandé", rotation: { x: -20, y: 0 }, zoom: 1.3 },
    { name: "Vue d'ensemble", rotation: { x: -30, y: 135 }, zoom: 0.9 },
  ];

  // ✅ Image par défaut avec arrière-plan blanc
  const getEchangeImage = useCallback(() => {
    if (imageError) {
      return `https://via.placeholder.com/800x600/f8fafc/1e293b?text=${encodeURIComponent(echange?.nomElementEchange?.charAt(0) || "E")}`;
    }

    if (echange?.image) {
      const url = buildImageUrl(echange.image);
      if (url) return url;
    }
    
    return "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&fit=crop";
  }, [echange?.image, echange?.nomElementEchange, imageError]);

  useEffect(() => {
    fetchEchange();
  }, [uuid]);

  useEffect(() => {
    if (autoRotate && !isRotating && activePerspective === 0) {
      startAutoRotation();
    } else {
      stopAutoRotation();
    }

    return () => {
      stopAutoRotation();
    };
  }, [autoRotate, isRotating, activePerspective]);

  // ✅ ALERTES AMÉLIORÉES - Messages plus parlants
  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    setAlert({ type, title, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setConfirmDialog({ title, message, onConfirm });
  };

  const fetchEchange = async () => {
    try {
      setLoading(true);
      setError(null);
      setImageError(false);
      setImageKey(Date.now());
      const response = await api.get<Echange>(
        API_ENDPOINTS.ECHANGES.DETAIL_NON_PUBLIE(uuid),
      );
      setEchange(response);
    } catch (err: any) {
      console.error("Erreur lors du chargement de l'échange:", err);
      setError(err.message || "Erreur lors du chargement de l'échange");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const startAutoRotation = () => {
    if (rotationIntervalRef.current) return;

    rotationIntervalRef.current = setInterval(() => {
      setRotation((prev) => ({
        ...prev,
        y: prev.y + 1,
      }));
    }, 50);
  };

  const stopAutoRotation = () => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  };

  const handlePerspectiveClick = (index: number) => {
    setActivePerspective(index);
    setAutoRotate(index === 0);
    setRotation(perspectives[index].rotation);
    setZoom(perspectives[index].zoom);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!imageContainerRef.current || !isRotating || activePerspective !== 0)
        return;

      const container = imageContainerRef.current;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 2 - 1;
      const y = ((e.clientY - top) / height) * 2 - 1;

      setRotation({
        x: -20 + y * 40,
        y: 45 + x * 40,
      });
    },
    [isRotating, activePerspective],
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextPerspective = () => {
    const nextIndex = (activePerspective + 1) % perspectives.length;
    handlePerspectiveClick(nextIndex);
  };

  const prevPerspective = () => {
    const prevIndex =
      (activePerspective - 1 + perspectives.length) % perspectives.length;
    handlePerspectiveClick(prevIndex);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  const resetRotation = () => {
    setRotation(perspectives[activePerspective].rotation);
    setZoom(perspectives[activePerspective].zoom);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  // ✅ VALIDATION - Message d'alerte amélioré
  const handleValidate = async () => {
    try {
      setActionLoading(true);
      await api.post(`/echanges/${uuid}/validate`, {});
      showAlert(
        "success",
        "🎉 Échange validé avec succès !",
        "L'échange a été approuvé et est maintenant visible par tous les utilisateurs.",
      );
      await fetchEchange();
    } catch (err: any) {
      console.error("Erreur lors de la validation:", err);
      showAlert(
        "error",
        "❌ Erreur de validation",
        `Impossible de valider l'échange : ${err.message || "Erreur serveur"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ REJET - Message d'alerte amélioré
  const handleReject = async () => {
    try {
      setActionLoading(true);
      await api.post(`/echanges/${uuid}/reject`, {});
      showAlert(
        "warning",
        "⚠️ Échange rejeté",
        "L'échange a été rejeté. L'utilisateur sera notifié de cette décision.",
      );
      await fetchEchange();
    } catch (err: any) {
      console.error("Erreur lors du rejet:", err);
      showAlert(
        "error",
        "❌ Erreur",
        `Erreur lors du rejet: ${err.message}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ PUBLICATION/DÉPUBLICATION - Couleur dynamique
  const handlePublish = async () => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.ECHANGES.PUBLISH, {
        echangeUuid: uuid,
        est_publie: !echange!.estPublie,
      });
      
      if (echange!.estPublie) {
        showAlert(
          "info",
          "📭 Échange dépublié",
          "L'échange a été retiré de la liste publique. Il n'est plus visible.",
        );
      } else {
        showAlert(
          "success",
          "🚀 Échange publié !",
          "Félicitations ! Votre échange est maintenant visible par tous les utilisateurs.",
        );
      }
      await fetchEchange();
    } catch (err: any) {
      console.error("Erreur lors de la publication:", err);
      showAlert(
        "error",
        "❌ Erreur",
        `Erreur lors de la publication: ${err.message}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ SUPPRESSION - Confirmation améliorée
  const handleDelete = async () => {
    showConfirm(
      "Supprimer définitivement ?",
      "Cette action est irréversible. L'échange et toutes ses données associées seront définitivement effacés.",
      async () => {
        try {
          setActionLoading(true);
          setConfirmDialog(null);
          await api.delete(API_ENDPOINTS.ECHANGES.DELETE(uuid));
          showAlert(
            "error",
            "🗑️ Échange supprimé",
            "L'échange a été supprimé définitivement. Redirection vers la liste...",
          );
          setTimeout(() => {
            router.push("/annonces");
          }, 2000);
        } catch (err: any) {
          console.error("Erreur lors de la suppression:", err);
          showAlert(
            "error",
            "❌ Erreur",
            `Erreur lors de la suppression: ${err.message}`,
          );
        } finally {
          setActionLoading(false);
        }
      },
    );
  };

  // ✅ BLOCAGE/DÉBLOCAGE - Couleur dynamique
  const handleBlock = async () => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE, {
        echangeUuid: uuid,
        est_bloque: !echange!.estBloque,
      });
      
      if (echange!.estBloque) {
        showAlert(
          "success",
          "🔓 Échange débloqué",
          "L'échange a été débloqué et est de nouveau accessible.",
        );
      } else {
        showAlert(
          "error",
          "🔒 Échange bloqué",
          "L'échange a été bloqué et n'est plus accessible aux utilisateurs.",
        );
      }
      await fetchEchange();
    } catch (err: any) {
      console.error("Erreur lors du blocage/déblocage:", err);
      showAlert(
        "error",
        "❌ Erreur",
        `Erreur lors de l'opération: ${err.message}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/print/echange/${uuid}`, "_blank");
    showAlert("info", "🖨️ Impression", "Lancement de l'impression...");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showAlert("success", "🔗 Lien copié !", "Le lien de l'échange a été copié dans le presse-papier.");
  };

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "Non spécifié";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-CI", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="text-primary mb-2">Chargement de l'échange</h4>
          <p className="text-muted">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="card border-danger shadow-lg" style={{ borderRadius: "24px" }}>
          <div className="card-header bg-danger text-white" style={{ borderRadius: "24px 24px 0 0" }}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Erreur de chargement
          </div>
          <div className="card-body p-4">
            <h5 className="card-title">Une erreur est survenue</h5>
            <p className="card-text">{error}</p>
            <div className="d-flex gap-3">
              <button className="btn btn-danger" onClick={fetchEchange}>
                <FontAwesomeIcon icon={faSpinner} className="me-2" />
                Réessayer
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => router.back()}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!echange) {
    return (
      <div className="container py-5">
        <div className="card border-warning shadow-lg" style={{ borderRadius: "24px" }}>
          <div className="card-header bg-warning text-dark" style={{ borderRadius: "24px 24px 0 0" }}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Échange introuvable
          </div>
          <div className="card-body text-center py-5">
            <FontAwesomeIcon
              icon={faExchangeAlt}
              size="3x"
              className="text-warning mb-3"
            />
            <h4 className="mb-3">Cet échange n'existe pas ou a été supprimé</h4>
            <button className="btn btn-primary" onClick={() => router.back()}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Retour aux annonces
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 py-4 bg-white min-vh-100">
      {/* ✅ ALERTES AMÉLIORÉES - Position fixe en haut à droite */}
      {alert && (
        <div
          className="position-fixed top-0 end-0 p-4"
          style={{ zIndex: 1050 }}
        >
          <CustomAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Dialogue de confirmation */}
      {confirmDialog && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1060 }}
        >
          <CustomConfirm
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        </div>
      )}

      {/* En-tête */}
      <div className="mb-4">
        <nav
          aria-label="breadcrumb"
          className="bg-white rounded-4 shadow-sm p-3 mb-3 border"
          style={{ borderRadius: "16px !important" }}
        >
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a
                href="#"
                className="text-decoration-none"
                onClick={() => router.back()}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Retour
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {echange.nomElementEchange || "Détails de l'échange"}
            </li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-3 fw-bold text-primary">
              <FontAwesomeIcon icon={faExchangeAlt} className="me-3" />
              {echange.nomElementEchange || "Échange sans nom"}
            </h1>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* ✅ Badge Publication avec couleur dynamique */}
              <span
                className={`badge ${echange.estPublie ? "bg-success" : "bg-secondary"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: echange.estPublie ? "#10b981" : "#94a3b8",
                }}
              >
                <FontAwesomeIcon icon={echange.estPublie ? faCheckCircle : faTimesCircle} className="me-2" />
                {echange.estPublie ? "Publié" : "Non publié"}
              </span>

              {/* ✅ Badge Blocage avec couleur dynamique */}
              <span
                className={`badge ${echange.estBloque ? "bg-danger" : "bg-success"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: echange.estBloque ? "#ef4444" : "#10b981",
                }}
              >
                <FontAwesomeIcon icon={echange.estBloque ? faLock : faUnlock} className="me-2" />
                {echange.estBloque ? "Bloqué" : "Actif"}
              </span>

              {/* ✅ Badge Statut */}
              <span
                className="badge bg-info fs-6 px-4 py-2 rounded-pill"
                style={{ backgroundColor: "#3b82f6" }}
              >
                <FontAwesomeIcon icon={faTag} className="me-2" />
                {echange.statut || "En attente"}
              </span>

              {/* ✅ Badge Disponibilité */}
              <span
                className={`badge ${echange.disponible ? "bg-success" : "bg-secondary"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: echange.disponible ? "#10b981" : "#94a3b8",
                }}
              >
                <FontAwesomeIcon icon={echange.disponible ? faCheckCircle : faTimesCircle} className="me-2" />
                {echange.disponible ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-lg"
              style={{
                borderRadius: "12px",
                padding: "12px 24px",
                borderWidth: "2px",
              }}
              onClick={handleShare}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faShareAlt} className="me-2" />
              Partager
            </button>
           
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="row g-4">
        {/* Colonne de gauche - Visualisation 3D */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faCube}
                    className="me-2 text-primary"
                  />
                  Visualisation 3D de l'Échange
                </h3>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${autoRotate ? "btn-success" : "btn-outline-success"}`}
                    onClick={toggleAutoRotate}
                    aria-label={
                      autoRotate
                        ? "Désactiver rotation auto"
                        : "Activer rotation auto"
                    }
                    style={{ borderRadius: "20px" }}
                  >
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    {autoRotate ? "Auto ON" : "Auto OFF"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? "Quitter plein écran" : "Plein écran"
                    }
                    style={{ borderRadius: "20px" }}
                  >
                    <FontAwesomeIcon
                      icon={isFullscreen ? faCompress : faExpand}
                      className="me-2"
                    />
                    {isFullscreen ? "Réduire" : "Plein écran"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={resetRotation}
                    aria-label="Réinitialiser la rotation"
                    style={{ borderRadius: "20px" }}
                  >
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {/* ✅ Conteneur 3D - Arrière-plan blanc */}
              <div
                ref={imageContainerRef}
                className="position-relative bg-white rounded-4 overflow-hidden mb-4 border"
                style={{
                  height: "500px",
                  background: "#ffffff",
                  cursor:
                    isRotating && activePerspective === 0 ? "grab" : "default",
                  perspective: "1200px",
                }}
                onMouseMove={handleMouseMove}
                onMouseDown={() =>
                  activePerspective === 0 && setIsRotating(true)
                }
                onMouseUp={() => setIsRotating(false)}
                onMouseLeave={() => setIsRotating(false)}
              >
                {/* Conteneur de l'image avec effet 3D */}
                <div
                  className="position-absolute top-50 start-50 translate-middle"
                  style={{
                    transform: `translateZ(150px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
                    transition:
                      isRotating || autoRotate ? "none" : "transform 0.5s ease",
                    width: "80%",
                    height: "80%",
                  }}
                >
                  {/* Image principale avec effet 3D */}
                  <div className="position-relative w-100 h-100">
                    <img
                      key={imageKey}
                      src={getEchangeImage()}
                      alt={`${echange.nomElementEchange} - Vue 3D`}
                      className="img-fluid rounded-4"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        boxShadow:
                          rotation.y > 90 && rotation.y < 270
                            ? "-20px 20px 40px rgba(0,0,0,0.15)"
                            : "20px 20px 40px rgba(0,0,0,0.15)",
                      }}
                      onError={handleImageError}
                    />

                    {/* Badge échange sur l'image */}
                    <div
                      className="position-absolute top-0 start-0 m-3 bg-primary text-white rounded-pill px-4 py-2 shadow"
                      style={{ backdropFilter: "blur(5px)" }}
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                      ÉCHANGE
                    </div>
                  </div>
                </div>

                {/* Contrôles de navigation */}
                <button
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle shadow"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                  onClick={prevPerspective}
                  aria-label="Perspective précédente"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle shadow"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                  }}
                  onClick={nextPerspective}
                  aria-label="Perspective suivante"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>

                {/* Contrôles de zoom */}
                <div className="position-absolute bottom-0 end-0 m-3">
                  <div className="btn-group-vertical">
                    <button
                      className="btn btn-light btn-sm rounded-circle mb-1 shadow"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                      }}
                      onClick={handleZoomIn}
                      aria-label="Zoom avant"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button
                      className="btn btn-light btn-sm rounded-circle shadow"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                      }}
                      onClick={handleZoomOut}
                      aria-label="Zoom arrière"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  </div>
                </div>

                {/* Indicateur de perspective active */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                  <div className="bg-dark bg-opacity-75 text-white px-4 py-2 rounded-pill shadow">
                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                    {perspectives[activePerspective].name}
                  </div>
                </div>

                {/* Coordonnées de rotation */}
                <div className="position-absolute top-0 start-0 m-3">
                  <div className="bg-white shadow-sm px-3 py-2 rounded-3 border">
                    <div className="small fw-bold">
                      Rotation: X: {rotation.x.toFixed(0)}° Y:{" "}
                      {rotation.y.toFixed(0)}°
                    </div>
                    <div className="extra-small text-muted mt-1">
                      Zoom: {zoom.toFixed(1)}x
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {activePerspective === 0 && (
                  <div className="position-absolute top-0 end-0 m-3">
                    <div className="bg-white shadow-sm px-3 py-2 rounded-3 border">
                      <div className="small">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2 text-primary"
                        />
                        Cliquez-maintenez pour tourner
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sélecteur de perspectives */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <FontAwesomeIcon
                      icon={faEye}
                      className="me-2 text-primary"
                    />
                    Sélectionnez une perspective
                  </h6>
                  <small className="text-muted">
                    {activePerspective + 1}/{perspectives.length}
                  </small>
                </div>
                <div className="row g-2">
                  {perspectives.map((perspective, index) => (
                    <div className="col-6 col-md-4 col-lg-2" key={index}>
                      <button
                        className={`btn w-100 ${
                          activePerspective === index
                            ? "btn-primary"
                            : "btn-outline-primary"
                        } p-2`}
                        onClick={() => handlePerspectiveClick(index)}
                        style={{
                          fontSize: "0.8rem",
                          height: "70px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "12px",
                        }}
                        aria-label={`Sélectionner ${perspective.name}`}
                      >
                        <div className="mb-1">
                          <FontAwesomeIcon
                            icon={faCube}
                            className={
                              activePerspective === index
                                ? "text-white"
                                : "text-primary"
                            }
                          />
                        </div>
                        <div className="small fw-bold">
                          {perspective.name.split(" ").pop()}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contrôles de rotation */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-white border rounded-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2"
                        />
                        Rotation X
                      </label>
                      <span className="badge bg-primary rounded-pill">
                        {rotation.x.toFixed(0)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="-90"
                      max="90"
                      value={rotation.x}
                      onChange={(e) =>
                        setRotation((prev) => ({
                          ...prev,
                          x: parseInt(e.target.value),
                        }))
                      }
                      style={{ cursor: "pointer" }}
                      aria-label="Rotation horizontale"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>-90°</span>
                      <span>0°</span>
                      <span>90°</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-white border rounded-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2"
                        />
                        Rotation Y
                      </label>
                      <span className="badge bg-primary rounded-pill">
                        {rotation.y.toFixed(0)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="360"
                      value={rotation.y}
                      onChange={(e) =>
                        setRotation((prev) => ({
                          ...prev,
                          y: parseInt(e.target.value),
                        }))
                      }
                      style={{ cursor: "pointer" }}
                      aria-label="Rotation verticale"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>0°</span>
                      <span>180°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contrôle de zoom */}
              <div className="row mt-3">
                <div className="col-12">
                  <div className="p-3 bg-white border rounded-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                        Zoom
                      </label>
                      <span className="badge bg-success rounded-pill">
                        {zoom.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      style={{ cursor: "pointer" }}
                      aria-label="Niveau de zoom"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Informations et actions */}
        <div className="col-lg-4">
          {/* Carte d'informations principales */}
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="text-muted mb-1">Type d'échange</div>
                  <h2 className="text-primary fw-bold display-6 mb-2">
                    {echange.typeEchange || "Non spécifié"}
                  </h2>
                  <div className="text-success h4 mb-2">
                    {formatPrice(echange.prix)}
                  </div>
                  <div className="text-muted">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Initiateur: {echange.nom_initiateur || "Anonyme"}
                  </div>
                </div>
                <div className="text-end">
                  <div className="bg-primary bg-opacity-10 rounded-4 p-3">
                    <FontAwesomeIcon
                      icon={faMoneyBill}
                      className="text-primary fs-2"
                    />
                  </div>
                </div>
              </div>

              {/* Comparaison objet proposé/demandé */}
              <div className="mb-3">
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded-4">
                      <div className="h6 fw-bold mb-1 text-success">
                        {echange.objetPropose || "?"}
                      </div>
                      <div className="text-muted extra-small">
                        <FontAwesomeIcon icon={faBox} /> Proposé
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded-4">
                      <div className="h6 fw-bold mb-1 text-warning">
                        {echange.objetDemande || "?"}
                      </div>
                      <div className="text-muted extra-small">
                        <FontAwesomeIcon icon={faBox} /> Demandé
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faExchangeAlt}
                    className="text-primary fs-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Carte d'informations détaillées */}
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-primary"
                  />
                  Informations détaillées
                </h3>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill"
                  onClick={() => setShowDetails(!showDetails)}
                  aria-label={
                    showDetails ? "Masquer les détails" : "Afficher les détails"
                  }
                >
                  <FontAwesomeIcon
                    icon={showDetails ? faAngleUp : faAngleDown}
                    className="me-2"
                  />
                  {showDetails ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-4 h-100">
                      <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-primary fs-4"
                        />
                      </div>
                      <div>
                        <div className="text-muted small">Quantité</div>
                        <div className="h4 fw-bold mb-0">
                          {echange.quantite || 1}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-4 h-100">
                      <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                        <FontAwesomeIcon
                          icon={faTag}
                          className="text-warning fs-4"
                        />
                      </div>
                      <div>
                        <div className="text-muted small">Catégorie</div>
                        <div className="h4 fw-bold mb-0">
                          {echange.categorie || "Général"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations sur l'initiateur */}
                <div className="mt-4">
                  <h5 className="mb-3">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-2 text-primary"
                    />
                    Informations initiateur
                  </h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faUser} className="me-2" />
                          Nom de l'initiateur
                        </div>
                        <div className="fw-bold">
                          {echange.nom_initiateur || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Contact
                        </div>
                        <div className="fw-bold">
                          {echange.numero || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Localisation
                        </div>
                        <div className="fw-bold">
                          {echange.localisation || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations temporelles */}
                <div className="mt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faCalendar} className="me-2" />
                          Date de proposition
                        </div>
                        <div className="fw-bold">
                          {formatDate(
                            echange.dateProposition || echange.createdAt,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faClock} className="me-2" />
                          Durée de validité
                        </div>
                        <div className="fw-bold">
                          {echange.dureeValidite || "Illimitée"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message de l'initiateur */}
                {echange.message && (
                  <div className="mt-4">
                    <h5 className="mb-3">
                      <FontAwesomeIcon
                        icon={faMessage}
                        className="me-2 text-primary"
                      />
                      Message de l'initiateur
                    </h5>
                    <div className="p-3 bg-light rounded-4">
                      <p className="mb-0">{echange.message}</p>
                    </div>
                  </div>
                )}

                {/* Conditions de l'échange */}
                <div className="mt-4">
                  <div className="p-3 border rounded-4">
                    <h6 className="mb-3">Conditions de l'échange</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted">
                          Type de destinataire
                        </small>
                        <div className="fw-bold">
                          {echange.typeDestinataire || "Tout public"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Mode de remise</small>
                        <div className="fw-bold">
                          {echange.modeRemise || "À convenir"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">État de l'objet</small>
                        <div className="fw-bold">
                          {echange.etat || "Bon état"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Conditions</small>
                        <div className="fw-bold">
                          {echange.conditions || "À discuter"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Carte des actions d'administration avec couleurs dynamiques */}
          <div className="card border-0 shadow-lg" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0">
                <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
                Actions d'administration
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="d-grid gap-3">
                {/* Validation/Rejet */}
                {(echange.statut === "en_attente" ||
                  echange.statut === "en-attente") && (
                  <div className="row g-2">
                    <div className="col">
                      <button
                        className="btn w-100 py-3"
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          borderRadius: "12px",
                          border: "none",
                          fontWeight: "600",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f9d6e")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
                        onClick={handleValidate}
                        disabled={actionLoading}
                      >
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Valider l'échange
                      </button>
                    </div>
                    <div className="col">
                      <button
                        className="btn w-100 py-3"
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          borderRadius: "12px",
                          border: "none",
                          fontWeight: "600",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                        onClick={handleReject}
                        disabled={actionLoading}
                      >
                        <FontAwesomeIcon icon={faXmark} className="me-2" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ Publication/Dépublication - Couleur dynamique */}
                <button
                  className="btn w-100 py-3"
                  style={{
                    backgroundColor: echange.estPublie ? "#f59e0b" : "#10b981",
                    color: "white",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = echange.estPublie ? "#d97706" : "#0f9d6e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = echange.estPublie ? "#f59e0b" : "#10b981";
                  }}
                  onClick={handlePublish}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={echange.estPublie ? faTimesCircle : faCheckCircle}
                    className="me-2"
                  />
                  {echange.estPublie ? "Dépublier l'échange" : "Publier l'échange"}
                </button>

                {/* ✅ Blocage/Déblocage - Couleur dynamique */}
                <button
                  className="btn w-100 py-3"
                  style={{
                    backgroundColor: echange.estBloque ? "#10b981" : "#ef4444",
                    color: "white",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = echange.estBloque ? "#0f9d6e" : "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = echange.estBloque ? "#10b981" : "#ef4444";
                  }}
                  onClick={handleBlock}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={echange.estBloque ? faUnlock : faLock}
                    className="me-2"
                  />
                  {echange.estBloque ? "Débloquer l'échange" : "Bloquer l'échange"}
                </button>

                {/* ✅ Suppression - Rouge fixe */}
                <button
                  className="btn w-100 py-3"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .bg-white {
          background-color: #ffffff !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.1) !important;
        }

        .extra-small {
          font-size: 0.65rem;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        @media (max-width: 768px) {
          .card-body p-4 {
            padding: 1rem !important;
          }

          .h2 {
            font-size: 1.5rem;
          }

          .display-6 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}