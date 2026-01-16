"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
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
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

// Composant pour les alertes stylées
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
    success: faCheckCircle,
    error: faTimesCircle,
    warning: faExclamationTriangle,
    info: faInfoCircle,
  };

  const colors = {
    success: "success",
    error: "danger",
    warning: "warning",
    info: "info",
  };

  return (
    <div
      className={`alert alert-${colors[type]} alert-dismissible fade show shadow-lg`}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={icons[type]} className="me-3 fs-4" />
        <div>
          <h5 className="alert-heading mb-1">{title}</h5>
          <p className="mb-0">{message}</p>
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
        aria-label="Close"
      ></button>
    </div>
  );
};

// Composant pour les confirmations stylées
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
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-warning fs-4"
                />
              </div>
              <p className="mb-0">{message}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Confirmer
            </button>
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

  // Image par défaut pour les dons
  const getDonImage = () => {
    if (don?.image) {
      return don.image;
    }
    // Image de don générique adaptée
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

  const handleValidate = async () => {
    try {
      setActionLoading(true);
      await api.post(`/dons/${uuid}/validate`, {});
      showAlert("success", "Succès", "Don validé avec succès !");
      await fetchDon();
    } catch (err: any) {
      console.error("Erreur lors de la validation:", err);
      showAlert(
        "error",
        "Erreur",
        `Erreur lors de la validation: ${err.message}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await api.post(`/dons/${uuid}/reject`, {});
      showAlert("success", "Succès", "Don rejeté avec succès !");
      await fetchDon();
    } catch (err: any) {
      console.error("Erreur lors du rejet:", err);
      showAlert("error", "Erreur", `Erreur lors du rejet: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.DONS.PUBLISH, {
        donUuid: uuid,
        est_publie: !don.estPublie,
      });
      showAlert(
        "success",
        "Succès",
        don.estPublie
          ? "Don dépublié avec succès !"
          : "Don publié avec succès !",
      );
      await fetchDon();
    } catch (err: any) {
      console.error("Erreur lors de la publication:", err);
      showAlert(
        "error",
        "Erreur",
        `Erreur lors de la publication: ${err.message}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    showConfirm(
      "Confirmation de suppression",
      "Êtes-vous sûr de vouloir supprimer définitivement ce don ? Cette action est irréversible.",
      async () => {
        try {
          setActionLoading(true);
          setConfirmDialog(null);
          await api.delete(API_ENDPOINTS.DONS.DELETE(uuid));
          showAlert("success", "Succès", "Don supprimé avec succès !");
          setTimeout(() => {
            router.push("/annonces");
          }, 1500);
        } catch (err: any) {
          console.error("Erreur lors de la suppression:", err);
          showAlert(
            "error",
            "Erreur",
            `Erreur lors de la suppression: ${err.message}`,
          );
        } finally {
          setActionLoading(false);
        }
      },
    );
  };

  const handleBlock = async () => {
    showConfirm(
      "Confirmation de blocage",
      "Êtes-vous sûr de vouloir bloquer ce don ? Le don ne sera plus visible par les utilisateurs.",
      async () => {
        try {
          setActionLoading(true);
          setConfirmDialog(null);
          await api.post(`/dons/${uuid}/block`, {});
          showAlert("success", "Succès", "Don bloqué avec succès !");
          await fetchDon();
        } catch (err: any) {
          console.error("Erreur lors du blocage:", err);
          showAlert(
            "error",
            "Erreur",
            `Erreur lors du blocage: ${err.message}`,
          );
        } finally {
          setActionLoading(false);
        }
      },
    );
  };

  const handlePrint = () => {
    window.open(`/print/don/${uuid}`, "_blank");
    showAlert("info", "Impression", "Lancement de l'impression...");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showAlert("success", "Partage", "Lien copié dans le presse-papier !");
  };

  const formatDate = (dateString: string) => {
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
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="text-primary mb-2">Chargement du don</h4>
          <p className="text-muted">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="card border-danger shadow-lg">
          <div className="card-header bg-danger text-white">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Erreur de chargement
          </div>
          <div className="card-body">
            <h5 className="card-title">Une erreur est survenue</h5>
            <p className="card-text">{error}</p>
            <div className="d-flex gap-3">
              <button className="btn btn-danger" onClick={fetchDon}>
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
        <div className="card border-warning shadow-lg">
          <div className="card-header bg-warning text-dark">
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
    <div className="container-fluid px-lg-5 py-4 bg-light min-vh-100">
      {/* Alertes */}
      {alert && (
        <div
          className="position-fixed top-0 end-0 p-3"
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
          className="bg-white rounded shadow-sm p-3 mb-3"
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
            <li className="breadcrumb-item">
              <a href="/annonces" className="text-decoration-none">
                Annonces
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {don.nom || "Détails du don"}
            </li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-1 fw-bold text-primary">
              <FontAwesomeIcon icon={faGift} className="me-3" />
              {don.nom || "Don sans nom"}
            </h1>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`badge ${don.estPublie ? "bg-success" : "bg-warning"} fs-6 px-3 py-2`}
              >
                {don.estPublie ? "🟢 Publié" : "🟡 Non publié"}
              </span>
              <span
                className={`badge ${don.statut === "disponible" ? "bg-info" : "bg-secondary"} fs-6 px-3 py-2`}
              >
                {don.statut || "En attente"}
              </span>
              <span
                className={`badge ${don.disponible ? "bg-success" : "bg-danger"} fs-6 px-3 py-2`}
              >
                {don.disponible ? "📦 Disponible" : "⏸️ Indisponible"}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-lg"
              onClick={handlePrint}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Imprimer
            </button>
            <button
              className="btn btn-outline-success btn-lg"
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
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faCube}
                    className="me-2 text-primary"
                  />
                  Visualisation 3D du Don
                </h3>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${autoRotate ? "btn-success" : "btn-outline-success"}`}
                    onClick={toggleAutoRotate}
                  >
                    <FontAwesomeIcon
                      icon={autoRotate ? faRotate : faRotate}
                      className="me-2"
                    />
                    {autoRotate ? "Auto ON" : "Auto OFF"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={toggleFullscreen}
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
                  >
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {/* Conteneur 3D principal */}
              <div
                ref={imageContainerRef}
                className="position-relative bg-gradient-don rounded-3 overflow-hidden mb-4"
                style={{
                  height: "500px",
                  background:
                    "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
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
                      src={getDonImage()}
                      alt={`${don.nom} - Vue 3D`}
                      className="img-fluid rounded-3 shadow-3d-don"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        boxShadow:
                          rotation.y > 90 && rotation.y < 270
                            ? "-20px 20px 60px rgba(0,0,0,0.5)"
                            : "20px 20px 60px rgba(0,0,0,0.5)",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/800x600/0d9488/ffffff?text=${encodeURIComponent(don.nom?.charAt(0) || "D")}`;
                      }}
                    />

                    {/* Badge don sur l'image */}
                    <div
                      className="position-absolute top-0 start-0 m-3 bg-success bg-opacity-75 text-white rounded-pill px-3 py-2 shadow"
                      style={{ backdropFilter: "blur(5px)" }}
                    >
                      <FontAwesomeIcon icon={faGift} className="me-2" />
                      DON
                    </div>
                  </div>
                </div>

                {/* Contrôles de navigation */}
                <button
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle shadow"
                  style={{ width: "50px", height: "50px" }}
                  onClick={prevPerspective}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle shadow"
                  style={{ width: "50px", height: "50px" }}
                  onClick={nextPerspective}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>

                {/* Contrôles de zoom */}
                <div className="position-absolute bottom-0 end-0 m-3">
                  <div className="btn-group-vertical">
                    <button
                      className="btn btn-light btn-sm rounded-circle mb-1"
                      style={{ width: "35px", height: "35px" }}
                      onClick={handleZoomIn}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button
                      className="btn btn-light btn-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
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
                  <div className="bg-dark bg-opacity-75 text-white px-3 py-2 rounded shadow">
                    <div className="small">
                      <strong>Rotation:</strong> X: {rotation.x.toFixed(0)}° Y:{" "}
                      {rotation.y.toFixed(0)}°
                    </div>
                    <div className="extra-small mt-1">
                      <strong>Zoom:</strong> {zoom.toFixed(1)}x
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {activePerspective === 0 && (
                  <div className="position-absolute top-0 end-0 m-3">
                    <div className="bg-dark bg-opacity-75 text-white px-3 py-2 rounded shadow">
                      <div className="small">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2"
                        />
                        Cliquez-maintenez pour tourner
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sélecteur de perspectives */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
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
                            ? "btn-primary shadow-sm"
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
                        }}
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
                  <div className="p-3 bg-white border rounded-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2"
                        />
                        Rotation X
                      </label>
                      <span className="badge bg-primary">
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
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>-90°</span>
                      <span>0°</span>
                      <span>90°</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-white border rounded-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="me-2"
                        />
                        Rotation Y
                      </label>
                      <span className="badge bg-primary">
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
                  <div className="p-3 bg-white border rounded-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small text-muted mb-0">
                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                        Zoom
                      </label>
                      <span className="badge bg-success">
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
          <div className="card border-0 shadow-lg mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="text-muted">Type de don</div>
                  <h2 className="text-primary fw-bold display-6">
                    {don.type_don || "Non spécifié"}
                  </h2>
                  <div className="text-muted">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Donateur: {don.nom_donataire || "Anonyme"}
                  </div>
                </div>
                <div className="text-end">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FontAwesomeIcon
                      icon={faGift}
                      className="text-primary fs-2"
                    />
                  </div>
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded">
                    <div className="h6 fw-bold mb-1">
                      {don.nombre_vues || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faEye} /> Vues
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded">
                    <div className="h6 fw-bold mb-1">
                      {don.nombre_favoris || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faHeart} /> Favoris
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded">
                    <div className="h6 fw-bold mb-1">
                      {don.nombre_demandes || 0}
                    </div>
                    <div className="text-muted extra-small">
                      <FontAwesomeIcon icon={faUser} /> Demandes
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger btn-lg">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Ajouter aux favoris
                </button>
              </div>
            </div>
          </div>

          {/* Carte d'informations détaillées */}
          <div className="card border-0 shadow-lg mb-4">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-primary"
                  />
                  Informations détaillées
                </h3>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <FontAwesomeIcon
                    icon={showDetails ? faAngleUp : faAngleDown}
                  />
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-primary fs-4"
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
                    <div className="d-flex align-items-center p-3 bg-light rounded-3 h-100">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                        <FontAwesomeIcon
                          icon={faTag}
                          className="text-warning fs-4"
                        />
                      </div>
                      <div>
                        <div className="text-muted small">Catégorie</div>
                        <div className="h4 fw-bold mb-0">
                          {don.categorie || "Général"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="mb-3">Description</h5>
                  <div className="p-3 bg-light rounded-3">
                    <p className="mb-0">
                      {don.description || "Aucune description disponible"}
                    </p>
                  </div>
                </div>

                {/* Localisation et contact */}
                <div className="mt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded-3">
                        <div className="text-muted small mb-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Lieu de retrait
                        </div>
                        <div className="fw-bold">
                          {don.lieu_retrait || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-3">
                        <div className="text-muted small mb-2">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Contact
                        </div>
                        <div className="fw-bold">
                          {don.numero || "Non disponible"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 border rounded-3">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faCalendar} className="me-2" />
                          Date de début
                        </div>
                        <div className="fw-bold">
                          {formatDate(don.date_debut || don.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 border rounded-3">
                        <div className="text-muted small">
                          <FontAwesomeIcon icon={faClock} className="me-2" />
                          Date de fin
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
                        className="me-2 text-primary"
                      />
                      Conditions de retrait
                    </h5>
                    <div className="p-3 bg-light rounded-3">
                      <p className="mb-0">{don.conditions_retrait}</p>
                    </div>
                  </div>
                )}

                {/* Informations supplémentaires */}
                <div className="mt-4">
                  <div className="p-3 border rounded-3">
                    <h6 className="mb-3">Informations complémentaires</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted">État</small>
                        <div className="fw-bold">{don.etat || "Bon état"}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Dimensions</small>
                        <div className="fw-bold">
                          {don.dimensions || "Non spécifié"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Poids</small>
                        <div className="fw-bold">
                          {don.poids || "Non spécifié"}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Marque</small>
                        <div className="fw-bold">
                          {don.marque || "Non spécifié"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Carte des actions d'administration */}
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-white border-0 py-3">
              <h3 className="h5 mb-0">
                <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
                Actions d'administration
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="d-grid gap-3">
                {/* Validation/Rejet */}
                {(don.statut === "en_attente" ||
                  don.statut === "en-attente") && (
                  <>
                    <div className="row g-2">
                      <div className="col">
                        <button
                          className="btn btn-success w-100 py-3"
                          onClick={handleValidate}
                          disabled={actionLoading}
                        >
                          <FontAwesomeIcon icon={faCheck} className="me-2" />
                          Valider le don
                        </button>
                      </div>
                      <div className="col">
                        <button
                          className="btn btn-danger w-100 py-3"
                          onClick={handleReject}
                          disabled={actionLoading}
                        >
                          <FontAwesomeIcon icon={faXmark} className="me-2" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Publication/Dépublication */}
                <button
                  className={`btn ${don.estPublie ? "btn-warning" : "btn-success"} w-100 py-3`}
                  onClick={handlePublish}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={don.estPublie ? faTimesCircle : faCheckCircle}
                    className="me-2"
                  />
                  {don.estPublie ? "Dépublier le don" : "Publier le don"}
                </button>

                {/* Blocage */}
                <button
                  className="btn btn-outline-danger w-100 py-3"
                  onClick={handleBlock}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faBan} className="me-2" />
                  Bloquer le don
                </button>

                {/* Suppression */}
                <button
                  className="btn btn-danger w-100 py-3"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section UUID et métadonnées */}
      <div className="mt-4">
        <div className="card border-0 bg-dark text-white">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="small">
                <span className="text-muted">UUID:</span> {don.uuid}
              </div>
              <div className="small">
                <span className="text-muted">Créé le:</span>{" "}
                {formatDate(don.createdAt)}
              </div>
              <div className="small">
                <span className="text-muted">Dernière mise à jour:</span>{" "}
                {formatDate(don.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .bg-gradient-don {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        }

        .object-fit-cover {
          object-fit: cover;
        }

        .shadow-3d-don {
          box-shadow:
            0 25px 75px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: box-shadow 0.3s ease;
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

          .bg-gradient-don {
            height: 350px !important;
          }
        }
      `}</style>
    </div>
  );
}
