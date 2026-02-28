// app/(back-office)/dashboard-agent/profile/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

interface AgentProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string | null;
  date_naissance: string | null;
  avatar: string | null;
  civilite_uuid: string | null;
  est_bloque: boolean;
  is_admin: boolean;
  statut: string;
  role_uuid: string;
  created_at: string | null;
  updated_at: string;
  civilite?: {
    uuid: string;
    libelle: string;
    slug: string;
  };
  adresse?: any;
}

interface Civilite {
  uuid: string;
  libelle: string;
  slug: string;
  statut: string;
}

export default function AgentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "security">(
    "personal",
  );
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    telephone: null as string | null,
    civilite_uuid: null as string | null,
    date_naissance: null as string | null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ✅ Obtenir l'URL de l'avatar
  const getAvatarUrl = (): string | null => {
    if (imageError) return null;

    if (previewUrl) return previewUrl;

    return null;
  };

  // Récupérer les civilités
  useEffect(() => {
    const fetchCivilites = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CIVILITES.ACTIVES);
        setCivilites(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des civilités:", err);
      }
    };

    fetchCivilites();
  }, []);

  // Récupérer le profil
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setImageError(false);

      const token = localStorage.getItem("oskar_token");
      if (!token) {
        router.push("/connexion");
        return;
      }

      const response = await api.get(API_ENDPOINTS.AUTH.AGENT.PROFILE);

      // Gérer les différents formats de réponse
      let data;
      if (response.data?.type === "success" && response.data.data) {
        data = response.data.data;
      } else if (response.data?.data) {
        data = response.data.data;
      } else if (response.data) {
        data = response.data;
      }

      if (data) {
        setFormData({
          nom: data.nom || "",
          prenoms: data.prenoms || "",
          email: data.email || "",
          telephone: data.telephone || null,
          civilite_uuid: data.civilite_uuid || null,
          date_naissance: data.date_naissance || null,
        });

        if (data.avatar) {
          const avatarUrl = buildImageUrl(data.avatar);
          setPreviewUrl(avatarUrl);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil:", err);
      setError(
        err.response?.data?.message || "Impossible de charger le profil",
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user");
        router.push("/connexion");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Gestion des changements de formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
    setError(null);
    setSuccess(null);
  };

  // Gestion du fichier avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    setSelectedFile(file);

    // Créer une URL de prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
    setSuccess(null);
    setImageError(false);
  };

  // Gestionnaire d'erreur d'image
  const handleImageError = () => {
    setImageError(true);
  };

  // Soumission du formulaire - VERSION CORRIGÉE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Valider les données
      if (!formData.nom.trim()) {
        throw new Error("Le nom est requis");
      }

      if (!formData.prenoms.trim()) {
        throw new Error("Le prénom est requis");
      }

      if (!formData.email.trim()) {
        throw new Error("L'email est requis");
      }

      // Créer FormData pour l'envoi
      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenoms", formData.prenoms);
      formDataToSend.append("email", formData.email);

      if (formData.telephone) {
        formDataToSend.append("telephone", formData.telephone);
      }

      if (formData.civilite_uuid) {
        formDataToSend.append("civilite_uuid", formData.civilite_uuid);
      }

      if (formData.date_naissance) {
        formDataToSend.append("date_naissance", formData.date_naissance);
      }

      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      // ✅ CORRECTION : Laisser l'api-client gérer les headers
      const response = await api.put(
        API_ENDPOINTS.AUTH.AGENT.UPDATE_PROFILE,
        formDataToSend,
        // Pas de troisième paramètre avec headers
      );

      setSuccess(response.data?.message || "Profil mis à jour avec succès");

      // Rafraîchir les données
      setTimeout(() => {
        fetchProfile();
        setSelectedFile(null); // Réinitialiser le fichier sélectionné
      }, 1000);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors de la mise à jour",
      );
    } finally {
      setSaving(false);
    }
  };

  // Avatar par défaut
  const getDefaultAvatar = () => {
    const initials =
      `${formData.prenoms?.charAt(0) || ""}${formData.nom?.charAt(0) || ""}`.toUpperCase() ||
      "A";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=150`;
  };

  // ✅ Obtenir la source de l'avatar
  const getAvatarSrc = () => {
    const avatarUrl = getAvatarUrl();
    if (avatarUrl && !imageError) {
      return avatarUrl;
    }
    return getDefaultAvatar();
  };

  // Formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* En-tête de la page avec breadcrumb amélioré */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <button
                  onClick={() => router.push("/agent/dashboard")}
                  className="btn btn-outline-secondary btn-sm rounded-circle me-3"
                  style={{ width: "40px", height: "40px" }}
                  title="Retour"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div>
                  <h1 className="h2 fw-bold mb-1" style={{ color: "#16a34a" }}>
                    <i className="fa-solid fa-user-tie me-2"></i>
                    Mon Profil Agent
                  </h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item">
                        <a
                          href="/agent/dashboard"
                          className="text-decoration-none text-muted"
                        >
                          Tableau de bord
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active text-success fw-semibold"
                        aria-current="page"
                      >
                        Profil
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>

              <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                <div className="card-body p-4 p-md-5">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="h4 fw-bold mb-2">
                        Gérez votre profil professionnel
                      </h2>
                      <p className="text-muted mb-0">
                        Mettez à jour vos informations personnelles et
                        paramétrez la sécurité de votre compte
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <div className="badge bg-success bg-opacity-10 text-success py-2 px-3 rounded-pill">
                        <i className="fa-solid fa-shield-check me-2"></i>
                        Compte Agent Sécurisé
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation par onglets améliorée */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="d-flex flex-column flex-md-row border-bottom">
                  <button
                    className={`nav-link flex-fill text-center py-4 px-3 ${activeTab === "personal" ? "active" : ""}`}
                    onClick={() => setActiveTab("personal")}
                    style={{
                      border: "none",
                      background:
                        activeTab === "personal"
                          ? "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
                          : "transparent",
                      color: activeTab === "personal" ? "white" : "#6c757d",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <i className="fa-solid fa-user-pen fa-lg mb-2"></i>
                      <span className="fw-semibold">
                        Informations personnelles
                      </span>
                    </div>
                  </button>
                  <button
                    className={`nav-link flex-fill text-center py-4 px-3 ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                    style={{
                      border: "none",
                      background:
                        activeTab === "security"
                          ? "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                          : "transparent",
                      color: activeTab === "security" ? "white" : "#6c757d",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="d-flex flex-column align-items-center">
                      <i className="fa-solid fa-shield-halved fa-lg mb-2"></i>
                      <span className="fw-semibold">Sécurité du compte</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages d'alerte améliorés */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fa-solid fa-circle-exclamation text-danger fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading fw-bold mb-1">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success alert-dismissible fade show border-0 shadow-sm mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="fa-solid fa-circle-check text-success fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading fw-bold mb-1">Succès</h6>
                    <p className="mb-0">{success}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccess(null)}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            )}

            {/* Contenu des onglets */}
            <div className="tab-content">
              {/* Onglet Informations personnelles */}
              <div
                className={`tab-pane fade ${activeTab === "personal" ? "show active" : ""}`}
              >
                {loading ? (
                  <div className="text-center py-5">
                    <div className="d-flex justify-content-center mb-3">
                      <div className="spinner-grow text-success" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                    <h5 className="text-muted">
                      Chargement de votre profil...
                    </h5>
                    <p className="text-muted">Veuillez patienter un instant</p>
                  </div>
                ) : (
                  <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                      <div className="row g-0">
                        {/* Colonne gauche - Avatar */}
                        <div className="col-12 col-lg-4 bg-light">
                          <div className="p-4 p-lg-5 h-100">
                            <div className="text-center mb-4">
                              <div className="position-relative d-inline-block">
                                <div className="avatar-wrapper">
                                  <img
                                    src={getAvatarSrc()}
                                    alt="Avatar Agent"
                                    className="rounded-circle border border-4 border-white shadow-lg"
                                    style={{
                                      width: "200px",
                                      height: "200px",
                                      objectFit: "cover",
                                    }}
                                    onError={handleImageError}
                                  />
                                  <div className="avatar-overlay rounded-circle">
                                    <label
                                      htmlFor="avatar-upload"
                                      className="btn btn-light btn-lg rounded-circle shadow-sm"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                      }}
                                      title="Changer la photo"
                                    >
                                      <i className="fa-solid fa-camera text-dark fa-lg"></i>
                                    </label>
                                    <input
                                      id="avatar-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                      className="visually-hidden"
                                    />
                                  </div>
                                </div>
                              </div>
                              <h4 className="mt-4 fw-bold">
                                {formData.prenoms} {formData.nom}
                              </h4>
                              <p className="text-muted">
                                <i className="fa-solid fa-briefcase me-1"></i>
                                Agent Professionnel
                              </p>
                            </div>

                            <div className="card border-0 bg-white shadow-sm rounded-3 mb-4">
                              <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                  <i className="fa-solid fa-upload me-2 text-success"></i>
                                  Upload de photo
                                </h6>
                                <p className="small text-muted mb-3">
                                  Formats supportés: JPG, PNG, GIF
                                  <br />
                                  Taille maximale: 5MB
                                </p>
                                {selectedFile && (
                                  <div className="alert alert-success alert-sm d-flex align-items-center py-2">
                                    <i className="fa-solid fa-check-circle me-2"></i>
                                    <small className="text-truncate">
                                      {selectedFile.name}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="card border-0 bg-white shadow-sm rounded-3">
                              <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                  <i className="fa-solid fa-lightbulb me-2 text-warning"></i>
                                  Conseils pour votre photo
                                </h6>
                                <ul className="list-unstyled mb-0">
                                  <li className="mb-2 d-flex align-items-start">
                                    <i className="fa-solid fa-check text-success me-2 mt-1"></i>
                                    <small>
                                      Photo professionnelle et récente
                                    </small>
                                  </li>
                                  <li className="mb-2 d-flex align-items-start">
                                    <i className="fa-solid fa-check text-success me-2 mt-1"></i>
                                    <small>Visage clairement visible</small>
                                  </li>
                                  <li className="mb-2 d-flex align-items-start">
                                    <i className="fa-solid fa-check text-success me-2 mt-1"></i>
                                    <small>Arrière-plan neutre et propre</small>
                                  </li>
                                  <li className="d-flex align-items-start">
                                    <i className="fa-solid fa-check text-success me-2 mt-1"></i>
                                    <small>Éclairage uniforme</small>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Colonne droite - Formulaire */}
                        <div className="col-12 col-lg-8">
                          <div className="p-4 p-lg-5">
                            <h4 className="fw-bold mb-4 border-bottom pb-3">
                              <i className="fa-solid fa-user-edit me-2 text-success"></i>
                              Modifier vos informations
                            </h4>

                            <form onSubmit={handleSubmit}>
                              <div className="row g-4">
                                {/* Civilité */}
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-venus-mars me-2 text-muted"></i>
                                    Civilité
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-user-tag text-muted"></i>
                                    </span>
                                    <select
                                      id="civilite_uuid"
                                      name="civilite_uuid"
                                      className="form-select border-start-0"
                                      value={formData.civilite_uuid || ""}
                                      onChange={handleInputChange}
                                      disabled={saving}
                                    >
                                      <option value="">
                                        Sélectionnez une civilité
                                      </option>
                                      {civilites.map((civilite) => (
                                        <option
                                          key={civilite.uuid}
                                          value={civilite.uuid}
                                        >
                                          {civilite.libelle}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Nom */}
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-signature me-2 text-muted"></i>
                                    Nom *
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-user text-muted"></i>
                                    </span>
                                    <input
                                      type="text"
                                      name="nom"
                                      value={formData.nom}
                                      onChange={handleInputChange}
                                      className="form-control border-start-0"
                                      placeholder="Votre nom"
                                      required
                                      disabled={saving}
                                    />
                                  </div>
                                </div>

                                {/* Prénoms */}
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-user-tag me-2 text-muted"></i>
                                    Prénoms *
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-user-pen text-muted"></i>
                                    </span>
                                    <input
                                      type="text"
                                      name="prenoms"
                                      value={formData.prenoms}
                                      onChange={handleInputChange}
                                      className="form-control border-start-0"
                                      placeholder="Vos prénoms"
                                      required
                                      disabled={saving}
                                    />
                                  </div>
                                </div>

                                {/* Date de naissance */}
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-cake-candles me-2 text-muted"></i>
                                    Date de naissance
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-calendar text-muted"></i>
                                    </span>
                                    <input
                                      type="date"
                                      name="date_naissance"
                                      value={formData.date_naissance || ""}
                                      onChange={handleInputChange}
                                      className="form-control border-start-0"
                                      disabled={saving}
                                    />
                                  </div>
                                </div>

                                {/* Email */}
                                <div className="col-12">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-envelope me-2 text-muted"></i>
                                    Email *
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-at text-muted"></i>
                                    </span>
                                    <input
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleInputChange}
                                      className="form-control border-start-0"
                                      placeholder="votre@email.com"
                                      required
                                      disabled={saving}
                                    />
                                    <span className="input-group-text bg-success bg-opacity-10 text-success border-start-0">
                                      <i className="fa-solid fa-check"></i>
                                      Vérifié
                                    </span>
                                  </div>
                                </div>

                                {/* Téléphone */}
                                <div className="col-12">
                                  <label className="form-label fw-semibold">
                                    <i className="fa-solid fa-phone me-2 text-muted"></i>
                                    Téléphone
                                  </label>
                                  <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="fa-solid fa-mobile-alt text-muted"></i>
                                    </span>
                                    <input
                                      type="tel"
                                      name="telephone"
                                      value={formData.telephone || ""}
                                      onChange={handleInputChange}
                                      className="form-control border-start-0"
                                      placeholder="+225 XX XX XX XX"
                                      disabled={saving}
                                    />
                                  </div>
                                </div>

                                {/* Informations de compte */}
                                <div className="col-12">
                                  <div className="card border-0 bg-gradient bg-opacity-10 rounded-3 mt-2">
                                    <div className="card-body">
                                      <h6 className="fw-bold mb-3 text-success">
                                        <i className="fa-solid fa-info-circle me-2"></i>
                                        Informations de compte
                                      </h6>
                                      <div className="row">
                                        <div className="col-md-4 mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                              <i className="fa-solid fa-user-check text-success"></i>
                                            </div>
                                            <div>
                                              <p className="fw-medium mb-0 small">
                                                Statut
                                              </p>
                                              <p className="text-muted small mb-0">
                                                Agent Actif
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                                              <i className="fa-solid fa-calendar-alt text-info"></i>
                                            </div>
                                            <div>
                                              <p className="fw-medium mb-0 small">
                                                Membre depuis
                                              </p>
                                              <p className="text-muted small mb-0">
                                                {formatDate(
                                                  new Date().toISOString(),
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                          <div className="d-flex align-items-center">
                                            <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                                              <i className="fa-solid fa-clock text-warning"></i>
                                            </div>
                                            <div>
                                              <p className="fw-medium mb-0 small">
                                                Dernière mise à jour
                                              </p>
                                              <p className="text-muted small mb-0">
                                                Aujourd'hui
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Boutons d'action */}
                              <div className="mt-5 pt-4 border-top">
                                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
                                  <div className="text-center text-lg-start">
                                    <p className="text-muted mb-0 small">
                                      <i className="fa-solid fa-asterisk text-danger me-1"></i>
                                      Les champs marqués d'un * sont
                                      obligatoires
                                    </p>
                                  </div>
                                  <div className="d-flex flex-wrap justify-content-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push("/agent/dashboard")
                                      }
                                      className="btn btn-outline-secondary btn-lg px-4"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-times me-2"></i>
                                      Annuler
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push("/agent/change-password")
                                      }
                                      className="btn btn-outline-primary btn-lg px-4"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-key me-2"></i>
                                      Mot de passe
                                    </button>
                                    <button
                                      type="submit"
                                      className="btn btn-success btn-lg px-5"
                                      disabled={saving}
                                    >
                                      {saving ? (
                                        <>
                                          <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                          ></span>
                                          Enregistrement...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fa-solid fa-save me-2"></i>
                                          Enregistrer
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Onglet Sécurité */}
              <div
                className={`tab-pane fade ${activeTab === "security" ? "show active" : ""}`}
              >
                <div className="row g-4">
                  {/* Carte Mot de passe */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-lg h-100 rounded-4 overflow-hidden">
                      <div
                        className="card-header bg-gradient py-4 border-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                            <i className="fa-solid fa-key text-white fa-lg"></i>
                          </div>
                          <div>
                            <h5 className="text-white mb-0">Mot de passe</h5>
                            <small className="text-white opacity-75">
                              Sécurité du compte
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-semibold">
                              Force du mot de passe
                            </span>
                            <span className="badge bg-success">Fort</span>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: "85%" }}
                              aria-valuenow={85}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                          <small className="text-muted mt-2 d-block">
                            Dernière modification: Il y a 30 jours
                          </small>
                        </div>
                        <button
                          onClick={() => router.push("/agent/change-password")}
                          className="btn btn-warning w-100 py-3 fw-semibold"
                        >
                          <i className="fa-solid fa-lock me-2"></i>
                          Modifier le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Carte Email */}
                  <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-lg h-100 rounded-4 overflow-hidden">
                      <div
                        className="card-header bg-gradient py-4 border-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                            <i className="fa-solid fa-envelope text-white fa-lg"></i>
                          </div>
                          <div>
                            <h5 className="text-white mb-0">Email</h5>
                            <small className="text-white opacity-75">
                              Vérification
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="mb-4">
                          <div className="alert alert-success border-0 bg-success bg-opacity-10 mb-3">
                            <div className="d-flex align-items-center">
                              <i className="fa-solid fa-check-circle text-success me-3"></i>
                              <div>
                                <p className="mb-0 fw-semibold">
                                  Email vérifié
                                </p>
                                <small className="text-muted">
                                  {formData.email}
                                </small>
                              </div>
                            </div>
                          </div>
                          <small className="text-muted">
                            Votre adresse email est confirmée et sécurisée
                          </small>
                        </div>
                        <button
                          className="btn btn-outline-primary w-100 py-3 fw-semibold"
                          disabled
                        >
                          <i className="fa-solid fa-paper-plane me-2"></i>
                          Renvoyer l'email de vérification
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sécurité avancée */}
                  <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                      <div className="card-header bg-white py-4 border-0">
                        <h5 className="mb-0">
                          <i className="fa-solid fa-shield-alt text-danger me-2"></i>
                          Sécurité avancée
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <div className="card border-0 bg-light h-100 transition-all hover-lift">
                              <div className="card-body text-center p-4">
                                <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-mobile-alt text-danger fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">2FA</h6>
                                <p className="text-muted small mb-3">
                                  Authentification à deux facteurs
                                </p>
                                <div className="badge bg-danger bg-opacity-10 text-danger py-2 px-3 rounded-pill">
                                  Non activé
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="card border-0 bg-light h-100 transition-all hover-lift">
                              <div className="card-body text-center p-4">
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-desktop text-info fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">Sessions</h6>
                                <p className="text-muted small mb-3">
                                  Connexions actives
                                </p>
                                <div className="badge bg-info bg-opacity-10 text-info py-2 px-3 rounded-pill">
                                  1 session active
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <div className="card border-0 bg-light h-100 transition-all hover-lift">
                              <div className="card-body text-center p-4">
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-bell text-success fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">Alertes</h6>
                                <p className="text-muted small mb-3">
                                  Notifications de sécurité
                                </p>
                                <div className="badge bg-success bg-opacity-10 text-success py-2 px-3 rounded-pill">
                                  Activées
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Conseils de sécurité */}
                        <div className="mt-5 pt-4 border-top">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <h6 className="fw-bold mb-2">
                                <i className="fa-solid fa-lightbulb text-warning me-2"></i>
                                Conseils de sécurité pour les Agents
                              </h6>
                              <ul className="list-unstyled mb-0">
                                <li className="mb-1">
                                  <small>
                                    <i className="fa-solid fa-check text-success me-2"></i>
                                    Utilisez des mots de passe complexes et
                                    uniques
                                  </small>
                                </li>
                                <li className="mb-1">
                                  <small>
                                    <i className="fa-solid fa-check text-success me-2"></i>
                                    Activez l'authentification à deux facteurs
                                  </small>
                                </li>
                                <li>
                                  <small>
                                    <i className="fa-solid fa-check text-success me-2"></i>
                                    Vérifiez régulièrement vos sessions actives
                                  </small>
                                </li>
                              </ul>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <button
                                className="btn btn-outline-danger btn-sm mt-3 mt-md-0"
                                onClick={() =>
                                  router.push("/agent/security-settings")
                                }
                              >
                                <i className="fa-solid fa-cog me-2"></i>
                                Paramètres avancés
                              </button>
                            </div>
                          </div>
                        </div>
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
        .breadcrumb {
          background: transparent;
        }

        .breadcrumb-item + .breadcrumb-item::before {
          content: "›";
          color: #6c757d;
        }

        .card {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-3px);
        }

        .avatar-wrapper {
          position: relative;
          display: inline-block;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 50%;
        }

        .avatar-wrapper:hover .avatar-overlay {
          opacity: 1;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 0.25rem rgba(22, 163, 74, 0.15);
        }

        .btn-success {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          border: none;
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
          transform: translateY(-2px);
        }

        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: white;
        }

        .progress {
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar {
          border-radius: 10px;
        }

        .transition-all {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .bg-gradient {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
        }

        .input-group-text {
          background-color: white;
          border-color: #dee2e6;
        }

        .alert {
          border-radius: 10px;
        }

        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}