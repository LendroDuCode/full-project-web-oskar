"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faGift,
  faUser,
  faCalendar,
  faLocationDot,
  faInfoCircle,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faPrint,
  faCheck,
  faXmark,
  faBan,
  faPhone,
  faEnvelope,
  faBox,
  faSync,
  faMapMarkerAlt,
  faClock,
  faTag,
  faHeart,
  faShareAlt,
  faCog,
  faEye,
  faAngleUp,
  faAngleDown,
  faExpand,
  faCompress,
  faChevronLeft,
  faChevronRight,
  faRotate,
  faCube,
  faSearch,
  faMinus,
  faPlus,
  faArrowsRotate,
  faLayerGroup,
  faRocket,
  faShield,
  faTrash,
  faLock,
  faUnlock,
  faBell,
  faFlag,
  faCommentDots,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
// ✅ WhatsApp et autres icônes de marques doivent être importées depuis brands
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

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
    info: "#8b5cf6", // Violet
  };

  const backgrounds = {
    success: "rgba(16, 185, 129, 0.1)",
    error: "rgba(239, 68, 68, 0.1)",
    warning: "rgba(245, 158, 11, 0.1)",
    info: "rgba(139, 92, 246, 0.1)", // Violet
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

export default function DonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { user } = useAuth(); // Récupérer l'utilisateur connecté

  const [don, setDon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activePerspective, setActivePerspective] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [isRotating, setIsRotating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [zoom, setZoom] = useState(1);
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

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Perspectives 3D pour le don
  const perspectives = [
    { name: "Vue de face", rotation: { x: -20, y: 45 }, zoom: 1 },
    { name: "Vue de côté gauche", rotation: { x: -10, y: 90 }, zoom: 1 },
    { name: "Vue de dessus", rotation: { x: -70, y: 45 }, zoom: 1.2 },
    { name: "Vue de dos", rotation: { x: -20, y: 225 }, zoom: 1 },
    { name: "Vue de côté droit", rotation: { x: -10, y: -90 }, zoom: 1 },
    { name: "Détails", rotation: { x: -30, y: 180 }, zoom: 1.5 },
  ];

  // ✅ Fonction pour obtenir le libellé de la catégorie
  const getCategoryName = () => {
    if (!don?.categorie) return "Général";
    if (typeof don.categorie === 'string') return don.categorie;
    if (don.categorie?.libelle) return don.categorie.libelle;
    return "Général";
  };

  // ✅ Image par défaut avec arrière-plan blanc
  const getDonImage = () => {
    if (imageError) {
      return `https://via.placeholder.com/800x600/f8fafc/1e293b?text=${encodeURIComponent(don?.nom?.charAt(0) || "D")}`;
    }

    if (don?.image) {
      return buildImageUrl(don.image) || `https://via.placeholder.com/800x600/f8fafc/1e293b?text=${encodeURIComponent(don?.nom?.charAt(0) || "D")}`;
    }

    return "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&q=80&fit=crop";
  };

  useEffect(() => {
    fetchDon();
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

  const fetchDon = async () => {
    try {
      setLoading(true);
      setError(null);
      setImageError(false);
      setImageKey(Date.now());
      const response = await api.get(
        API_ENDPOINTS.DONS.DETAIL_NON_PUBLIE(uuid),
      );
      setDon(response);
    } catch (err: any) {
      console.error("Erreur lors du chargement du don:", err);
      setError(err.message || "Erreur lors du chargement du don");
    } finally {
      setLoading(false);
    }
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

  const handleMouseMove = (e: React.MouseEvent) => {
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
  };

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

  const handleImageError = () => {
    setImageError(true);
  };

  // ✅ PUBLICATION/DÉPUBLICATION - Couleur dynamique
  const handlePublish = async () => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.DONS.PUBLISH, {
        donUuid: uuid,
        est_publie: !don.estPublie,
      });
      
      if (don.estPublie) {
        showAlert(
          "info",
          "📭 Don dépublié",
          "Le don a été retiré de la liste publique. Il n'est plus visible.",
        );
      } else {
        showAlert(
          "success",
          "🚀 Don publié !",
          "Félicitations ! Votre don est maintenant visible par tous les utilisateurs.",
        );
      }
      await fetchDon();
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
      "Cette action est irréversible. Le don et toutes ses données associées seront définitivement effacés.",
      async () => {
        try {
          setActionLoading(true);
          setConfirmDialog(null);
          await api.delete(API_ENDPOINTS.DONS.DELETE(uuid));
          showAlert(
            "error",
            "🗑️ Don supprimé",
            "Le don a été supprimé définitivement. Redirection vers la liste...",
          );
          setTimeout(() => {
            router.push("/dashboard-agent/annonces");
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
      await api.post(API_ENDPOINTS.DONS.BLOQUE_DON, {
        donUuid: uuid,
        est_bloque: !don.est_bloque,
      });
      
      if (don.est_bloque) {
        showAlert(
          "success",
          "🔓 Don débloqué",
          "Le don a été débloqué et est de nouveau accessible.",
        );
      } else {
        showAlert(
          "error",
          "🔒 Don bloqué",
          "Le don a été bloqué et n'est plus accessible aux utilisateurs.",
        );
      }
      await fetchDon();
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
    window.open(`/print/don/${uuid}`, "_blank");
    showAlert("info", "🖨️ Impression", "Lancement de l'impression...");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showAlert("success", "🔗 Lien copié !", "Le lien du don a été copié dans le presse-papier.");
  };

  // ✅ Redirection vers la messagerie interne (identique à la page front-office)
  const handleSendMessage = () => {
    if (!don?.createur) {
      showAlert("error", "Erreur", "Informations du donateur non disponibles");
      return;
    }

    // Récupérer le type d'utilisateur
    const userType = user?.type || "utilisateur";

    let dashboardPath = "";
    switch (userType) {
      case "admin":
        dashboardPath = "/dashboard-admin";
        break;
      case "agent":
        dashboardPath = "/dashboard-agent";
        break;
      case "vendeur":
        dashboardPath = "/dashboard-vendeur";
        break;
      case "utilisateur":
        dashboardPath = "/dashboard-utilisateur";
        break;
      default:
        dashboardPath = "/dashboard-utilisateur";
    }

    // Construction des paramètres avec l'image du don
    const params = new URLSearchParams({
      destinataireUuid: don.createur.uuid,
      destinataireEmail: don.createur.email || "",
      destinataireNom: `${don.createur.prenoms || ""} ${don.createur.nom || ""}`.trim(),
      sujet: `Question concernant votre don: ${don.nom}`,
      donUuid: don.uuid,
      donImage: don.image || "",
      donNom: don.nom || "",
    });

    // Redirection vers la messagerie
    router.push(`${dashboardPath}/messages?${params.toString()}`);
  };

  // ✅ Redirection vers WhatsApp
  const handleWhatsApp = () => {
    if (!don?.createur?.telephone) {
      showAlert("error", "Erreur", "Numéro de téléphone non disponible");
      return;
    }

    let phoneNumber = don.createur.telephone.replace(/\D/g, "");
    if (phoneNumber && !phoneNumber.startsWith("+")) {
      phoneNumber = `+225${phoneNumber}`;
    }
    
    const message = `Bonjour ${don.createur.prenoms || ""} ${don.createur.nom || ""}, je suis intéressé(e) par votre don "${don.nom}" sur OSKAR. Pourrions-nous discuter ?`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            style={{ width: "3rem", height: "3rem", color: "#8b5cf6" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="mb-2" style={{ color: "#8b5cf6" }}>Chargement du don</h4>
          <p className="text-muted">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="card shadow-lg" style={{ borderRadius: "24px", borderColor: "#8b5cf6" }}>
          <div className="card-header text-white" style={{ borderRadius: "24px 24px 0 0", backgroundColor: "#8b5cf6" }}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Erreur de chargement
          </div>
          <div className="card-body p-4">
            <h5 className="card-title">Une erreur est survenue</h5>
            <p className="card-text">{error}</p>
            <div className="d-flex gap-3">
              <button className="btn" style={{ backgroundColor: "#8b5cf6", color: "white" }} onClick={fetchDon}>
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

  if (!don) {
    return (
      <div className="container py-5">
        <div className="card border-warning shadow-lg" style={{ borderRadius: "24px" }}>
          <div className="card-header bg-warning text-dark" style={{ borderRadius: "24px 24px 0 0" }}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Don introuvable
          </div>
          <div className="card-body text-center py-5">
            <FontAwesomeIcon
              icon={faGift}
              size="3x"
              className="text-warning mb-3"
            />
            <h4 className="mb-3">Ce don n'existe pas ou a été supprimé</h4>
            <button className="btn" style={{ backgroundColor: "#8b5cf6", color: "white" }} onClick={() => router.back()}>
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

      {/* En-tête améliorée */}
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
                style={{ color: "#8b5cf6" }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Retour
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {don.nom || "Détails du don"}
            </li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-3 fw-bold" style={{ color: "#8b5cf6" }}>
              <FontAwesomeIcon icon={faGift} className="me-3" />
              {don.nom || "Don sans nom"}
            </h1>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* ✅ Badge Publication avec couleur dynamique */}
              <span
                className={`badge ${don.estPublie ? "bg-success" : "bg-secondary"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: don.estPublie ? "#10b981" : "#94a3b8",
                }}
              >
                <FontAwesomeIcon icon={don.estPublie ? faCheckCircle : faTimesCircle} className="me-2" />
                {don.estPublie ? "Publié" : "Non publié"}
              </span>

              {/* ✅ Badge Blocage avec couleur dynamique */}
              <span
                className={`badge ${don.est_bloque ? "bg-danger" : "bg-success"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: don.est_bloque ? "#ef4444" : "#10b981",
                }}
              >
                <FontAwesomeIcon icon={don.est_bloque ? faLock : faUnlock} className="me-2" />
                {don.est_bloque ? "Bloqué" : "Actif"}
              </span>

              {/* ✅ Badge Statut */}
              <span
                className="badge fs-6 px-4 py-2 rounded-pill"
                style={{ backgroundColor: "#8b5cf6" }}
              >
                <FontAwesomeIcon icon={faTag} className="me-2" />
                {don.statut || "En attente"}
              </span>

              {/* ✅ Badge Disponibilité */}
              <span
                className={`badge ${don.disponible ? "bg-success" : "bg-secondary"} fs-6 px-4 py-2 rounded-pill`}
                style={{
                  backgroundColor: don.disponible ? "#10b981" : "#94a3b8",
                }}
              >
                <FontAwesomeIcon icon={don.disponible ? faCheckCircle : faTimesCircle} className="me-2" />
                {don.disponible ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-violet btn-lg"
              style={{
                borderRadius: "12px",
                padding: "12px 24px",
                borderWidth: "2px",
                borderColor: "#8b5cf6",
                color: "#8b5cf6",
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

      <div className="row g-4">
        {/* Colonne de gauche - Vue 3D du don */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg h-100" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faCube}
                    className="me-2"
                    style={{ color: "#8b5cf6" }}
                  />
                  Visualisation 3D du Don
                </h3>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${autoRotate ? "btn-success" : "btn-outline-success"}`}
                    onClick={toggleAutoRotate}
                    style={{ borderRadius: "20px" }}
                  >
                    <FontAwesomeIcon icon={faRotate} className="me-2" />
                    {autoRotate ? "Auto ON" : "Auto OFF"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleFullscreen}
                    style={{ borderRadius: "20px", borderColor: "#8b5cf6", color: "#8b5cf6" }}
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
                      src={getDonImage()}
                      alt={`${don.nom} - Vue 3D`}
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

                    {/* Badge don sur l'image */}
                    <div
                      className="position-absolute top-0 start-0 m-3 text-white rounded-pill px-4 py-2 shadow"
                      style={{ backgroundColor: "#8b5cf6", backdropFilter: "blur(5px)" }}
                    >
                      <FontAwesomeIcon icon={faGift} className="me-2" />
                      DON
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
                    color: "#8b5cf6",
                  }}
                  onClick={prevPerspective}
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
                    color: "#8b5cf6",
                  }}
                  onClick={nextPerspective}
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
                        color: "#8b5cf6",
                      }}
                      onClick={handleZoomIn}
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
                        color: "#8b5cf6",
                      }}
                      onClick={handleZoomOut}
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
                          className="me-2"
                          style={{ color: "#8b5cf6" }}
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
                      className="me-2"
                      style={{ color: "#8b5cf6" }}
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
                            ? "btn-violet"
                            : "btn-outline-violet"
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
                          backgroundColor: activePerspective === index ? "#8b5cf6" : "transparent",
                          borderColor: "#8b5cf6",
                          color: activePerspective === index ? "white" : "#8b5cf6",
                        }}
                      >
                        <div className="mb-1">
                          <FontAwesomeIcon
                            icon={faCube}
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
                          style={{ color: "#8b5cf6" }}
                        />
                        Rotation X
                      </label>
                      <span className="badge rounded-pill" style={{ backgroundColor: "#8b5cf6" }}>
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
                      style={{ cursor: "pointer", accentColor: "#8b5cf6" }}
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
                          style={{ color: "#8b5cf6" }}
                        />
                        Rotation Y
                      </label>
                      <span className="badge rounded-pill" style={{ backgroundColor: "#8b5cf6" }}>
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
                      style={{ cursor: "pointer", accentColor: "#8b5cf6" }}
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
                        <FontAwesomeIcon icon={faSearch} className="me-2" style={{ color: "#8b5cf6" }} />
                        Zoom
                      </label>
                      <span className="badge rounded-pill" style={{ backgroundColor: "#10b981" }}>
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
                      style={{ cursor: "pointer", accentColor: "#8b5cf6" }}
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
          {/* ✅ Carte du donateur avec photo et boutons */}
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: "#8b5cf6" }} />
                À propos du donateur
              </h3>
            </div>
            <div className="card-body p-4 text-center">
              {/* Photo du donateur */}
              <div className="mb-3">
                {don.createur?.avatar ? (
                  <img
                    src={buildImageUrl(don.createur.avatar)}
                    alt={`${don.createur.prenoms || ""} ${don.createur.nom || ""}`}
                    className="rounded-circle border border-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderColor: "#8b5cf6 !important",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/120x120/8b5cf6/ffffff?text=User";
                    }}
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center border border-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderColor: "#8b5cf6",
                    }}
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="fa-4x" style={{ color: "#8b5cf6" }} />
                  </div>
                )}
              </div>

              {/* Informations du donateur */}
              <h4 className="fw-bold mb-2">
                {don.createur?.prenoms || ""} {don.createur?.nom || "Donateur"}
              </h4>
              {don.createur?.est_verifie && (
                <span className="badge mb-3 px-3 py-2" style={{ backgroundColor: "#8b5cf6" }}>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                  Vérifié
                </span>
              )}
              <p className="text-muted mb-3">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: "#8b5cf6" }} />
                {don.createur?.email || "Email non disponible"}
              </p>
              {don.createur?.telephone && (
                <p className="text-muted mb-4">
                  <FontAwesomeIcon icon={faPhone} className="me-2" style={{ color: "#8b5cf6" }} />
                  {don.createur.telephone}
                </p>
              )}

              {/* Boutons d'action */}
              <div className="d-grid gap-3">
                <button
                  onClick={handleSendMessage}
                  className="btn py-3 fw-bold text-white"
                  style={{ backgroundColor: "#8b5cf6", borderRadius: "12px" }}
                >
                  <FontAwesomeIcon icon={faCommentDots} className="me-2" />
                  Envoyer un message
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="btn py-3 fw-bold text-white"
                  style={{ backgroundColor: "#25D366", borderRadius: "12px" }}
                  disabled={!don.createur?.telephone}
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Carte d'informations principales */}
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="text-muted mb-1">Type de don</div>
                  <h2 className="fw-bold display-6 mb-2" style={{ color: "#8b5cf6" }}>
                    {don.type_don || "Non spécifié"}
                  </h2>
                </div>
                <div className="text-end">
                  <div className="rounded-4 p-3" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}>
                    <FontAwesomeIcon
                      icon={faGift}
                      className="fs-2"
                      style={{ color: "#8b5cf6" }}
                    />
                  </div>
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="text-center p-3 bg-light rounded-4">
                    <div className="h5 fw-bold mb-1" style={{ color: "#8b5cf6" }}>
                      {don.nombre_vues || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faEye} /> Vues
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-3 bg-light rounded-4">
                    <div className="h5 fw-bold mb-1 text-danger">
                      {don.nombreFavoris || don.nombre_favoris || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faHeart} /> Favoris
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-3 bg-light rounded-4">
                    <div className="h5 fw-bold mb-1 text-warning">
                      {don.nombre_demandes || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faUser} /> Demandes
                    </div>
                  </div>
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
                    className="me-2"
                    style={{ color: "#8b5cf6" }}
                  />
                  Informations détaillées
                </h3>
                <button
                  className="btn btn-sm rounded-pill"
                  onClick={() => setShowDetails(!showDetails)}
                  style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
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
                      <div className="rounded-3 p-2 me-3" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}>
                        <FontAwesomeIcon
                          icon={faBox}
                          className="fs-4"
                          style={{ color: "#8b5cf6" }}
                        />
                      </div>
                      <div>
                        <div className="text-muted small">Quantité</div>
                        <div className="h4 fw-bold mb-0">
                          {don.quantite || 1}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-4 h-100">
                      <div className="rounded-3 p-2 me-3" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}>
                        <FontAwesomeIcon
                          icon={faTag}
                          className="fs-4"
                          style={{ color: "#8b5cf6" }}
                        />
                      </div>
                      <div>
                        <div className="text-muted small">Catégorie</div>
                        <div className="h4 fw-bold mb-0">
                          {getCategoryName()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" style={{ color: "#8b5cf6" }} />
                    Description
                  </h5>
                  <div className="p-3 bg-light rounded-4">
                    <p className="mb-0">
                      {don.description || "Aucune description disponible"}
                    </p>
                  </div>
                </div>

                {/* Localisation et contact */}
                <div className="mt-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small mb-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                            style={{ color: "#8b5cf6" }}
                          />
                          Lieu de retrait
                        </div>
                        <div className="fw-bold">
                          {don.lieu_retrait || don.localisation || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faCalendar} className="me-2" style={{ color: "#8b5cf6" }} />
                          Date de création
                        </div>
                        <div className="fw-bold">
                          {formatDate(don.date_debut || don.createdAt || don.dateCreation)}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-4">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faClock} className="me-2" style={{ color: "#8b5cf6" }} />
                          Date d'expiration
                        </div>
                        <div className="fw-bold">
                          {don.date_fin
                            ? formatDate(don.date_fin)
                            : "Illimitée"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditions de retrait */}
                {don.conditions_retrait && (
                  <div className="mt-4">
                    <h5 className="mb-3">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="me-2"
                        style={{ color: "#8b5cf6" }}
                      />
                      Conditions de retrait
                    </h5>
                    <div className="p-3 bg-light rounded-4">
                      <p className="mb-0">{don.conditions_retrait}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ Carte des actions d'administration (sans validation/rejet) */}
          <div className="card border-0 shadow-lg" style={{ borderRadius: "24px" }}>
            <div className="card-header bg-white border-0 py-3 px-4">
              <h3 className="h5 mb-0">
                <FontAwesomeIcon icon={faCog} className="me-2" style={{ color: "#8b5cf6" }} />
                Actions d'administration
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="d-grid gap-3">
                {/* ✅ Publication/Dépublication - Couleur violet */}
                <button
                  className="btn w-100 py-3 text-white"
                  style={{
                    backgroundColor: don.estPublie ? "#f59e0b" : "#8b5cf6",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = don.estPublie ? "#d97706" : "#7c3aed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = don.estPublie ? "#f59e0b" : "#8b5cf6";
                  }}
                  onClick={handlePublish}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={don.estPublie ? faTimesCircle : faCheckCircle}
                    className="me-2"
                  />
                  {don.estPublie ? "Dépublier le don" : "Publier le don"}
                </button>

                {/* ✅ Blocage/Déblocage - Couleur dynamique */}
                <button
                  className="btn w-100 py-3 text-white"
                  style={{
                    backgroundColor: don.est_bloque ? "#10b981" : "#ef4444",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = don.est_bloque ? "#0f9d6e" : "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = don.est_bloque ? "#10b981" : "#ef4444";
                  }}
                  onClick={handleBlock}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={don.est_bloque ? faUnlock : faLock}
                    className="me-2"
                  />
                  {don.est_bloque ? "Débloquer le don" : "Bloquer le don"}
                </button>

                {/* ✅ Suppression - Rouge fixe */}
                <button
                  className="btn w-100 py-3 text-white"
                  style={{
                    backgroundColor: "#ef4444",
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

        .object-fit-cover {
          object-fit: cover;
        }

        .extra-small {
          font-size: 0.65rem;
        }

        .transition-all {
          transition: all 0.3s ease;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .btn-outline-violet {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .btn-outline-violet:hover {
          background-color: #8b5cf6;
          color: white;
        }

        .btn-violet {
          background-color: #8b5cf6;
          color: white;
        }

        .btn-violet:hover {
          background-color: #7c3aed;
          color: white;
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