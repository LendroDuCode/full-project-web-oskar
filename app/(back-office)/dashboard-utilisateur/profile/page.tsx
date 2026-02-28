// app/(back-office)/dashboard-utilisateur/profile/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

interface ProfileData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string | null;
  date_naissance: string | null;
  avatar: string | null;
  created_at?: string;
}

interface Civilité {
  uuid: string;
  libelle: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [civilites, setCivilites] = useState<Civilité[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "security">(
    "personal",
  );
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    nom: "",
    prenoms: "",
    email: "",
    telephone: null,
    date_naissance: null,
    avatar: null,
    created_at: undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
      router.push("/login");
    }
  }, [isLoggedIn, openLoginModal, router]);

  // 🔴 Récupérer les civilités - CORRIGÉ
  useEffect(() => {
    const fetchCivilites = async () => {
      try {
        console.log("📥 Chargement des civilités...");
        const response = await fetch(API_ENDPOINTS.CIVILITES.ACTIVES);
        const data = await response.json();

        console.log("✅ Réponse civilités:", data);

        // Extraire le tableau de données selon la structure
        let civilitesData: Civilité[] = [];

        if (data?.data && Array.isArray(data.data)) {
          // Structure: { data: [...] }
          civilitesData = data.data;
        } else if (data?.data?.data && Array.isArray(data.data.data)) {
          // Structure: { data: { data: [...] } }
          civilitesData = data.data.data;
        } else if (Array.isArray(data)) {
          // Structure directe: [...]
          civilitesData = data;
        } else if (data?.civilites && Array.isArray(data.civilites)) {
          // Structure: { civilites: [...] }
          civilitesData = data.civilites;
        }

        console.log("📋 Civilités extraites:", civilitesData);
        setCivilites(civilitesData);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des civilités:", err);
        setCivilites([]); // Mettre un tableau vide en cas d'erreur
      }
    };

    fetchCivilites();
  }, []);

  // Fonction pour faire des appels API authentifiés
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("oskar_token");

    if (!token) {
      throw new Error("Token manquant");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    return response.json();
  };

  // Fonction pour uploader avec FormData
  const authUpload = async (url: string, formData: FormData) => {
    const token = localStorage.getItem("oskar_token");

    if (!token) {
      throw new Error("Token manquant");
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    return response.json();
  };

  // Récupérer le profil
  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(null);
      setImageError(false);

      const data = await authFetch(API_ENDPOINTS.AUTH.UTILISATEUR.PROFILE);
      const profileData = data.data || data;

      if (profileData) {
        setFormData({
          nom: profileData.nom || "",
          prenoms: profileData.prenoms || "",
          email: profileData.email || "",
          telephone: profileData.telephone || null,
          date_naissance: profileData.date_naissance || null,
          avatar: profileData.avatar || profileData.photo || null,
          created_at: profileData.created_at || profileData.createdAt,
        });

        // Construire l'URL de l'avatar avec buildImageUrl si disponible
        if (profileData.avatar || profileData.photo) {
          const avatarUrl = buildImageUrl(profileData.avatar || profileData.photo);
          setPreviewUrl(avatarUrl);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil:", err);
      setError(err.message || "Impossible de charger le profil");

      if (err.message.includes("Token") || err.message.includes("401")) {
        openLoginModal();
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, openLoginModal]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, fetchProfile]);

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

  const handleImageError = () => {
    setImageError(true);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving || !isLoggedIn) return;

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

      if (formData.date_naissance) {
        formDataToSend.append("date_naissance", formData.date_naissance);
      }

      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      // Utiliser authUpload au lieu de api.put
      const response = await authUpload(
        API_ENDPOINTS.AUTH.UTILISATEUR.UPDATE_PROFILE,
        formDataToSend,
      );

      setSuccess(response.message || "Profil mis à jour avec succès");

      // Rafraîchir les données
      setTimeout(() => {
        fetchProfile();
        setSelectedFile(null);
      }, 1000);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour");

      if (err.message.includes("Token") || err.message.includes("401")) {
        openLoginModal();
      }
    } finally {
      setSaving(false);
    }
  };

  // Formater la date d'inscription
  const formatMemberSince = (dateString: string | undefined) => {
    if (!dateString) return "Janvier 2024";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Janvier 2024";
    }
  };

  // Avatar par défaut
  const getDefaultAvatar = () => {
    const firstChar = formData.prenoms?.charAt(0) || "";
    const secondChar = formData.nom?.charAt(0) || "";

    if (!firstChar && !secondChar) {
      return "https://ui-avatars.com/api/?name=User&background=16a34a&color=fff&size=150";
    }

    const initials = `${firstChar}${secondChar}`.toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=150`;
  };

  // Obtenir la source de l'avatar
  const getAvatarSrc = () => {
    if (previewUrl && !imageError) {
      return previewUrl;
    }
    return getDefaultAvatar();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* En-tête de la page avec breadcrumb amélioré */}
            <div className="mb-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb p-3 bg-white rounded-3 shadow-sm">
                  <li className="breadcrumb-item">
                    <a
                      href="/dashboard-utilisateur"
                      className="text-decoration-none text-success"
                    >
                      <i className="fa-solid fa-home me-1"></i>
                      Tableau de bord
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    <i className="fa-solid fa-user me-1"></i>
                    Mon profil
                  </li>
                </ol>
              </nav>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                      <h1
                        className="h2 fw-bold mb-2"
                        style={{ color: "#16a34a" }}
                      >
                        <i className="fa-solid fa-user-circle me-2"></i>
                        Gestion du profil
                      </h1>
                      <p className="text-muted mb-0">
                        Gérez vos informations personnelles et vos paramètres de
                        sécurité
                      </p>
                    </div>
                    <div className="mt-3 mt-md-0">
                      <button
                        onClick={() => router.push("/dashboard-utilisateur")}
                        className="btn btn-outline-secondary"
                      >
                        <i className="fa-solid fa-arrow-left me-1"></i>
                        Retour au tableau de bord
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 p-0">
                <ul className="nav nav-tabs nav-fill border-0">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "personal" ? "active" : ""}`}
                      onClick={() => setActiveTab("personal")}
                    >
                      <i className="fa-solid fa-user-pen me-2"></i>
                      Informations personnelles
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                      onClick={() => setActiveTab("security")}
                    >
                      <i className="fa-solid fa-shield-halved me-2"></i>
                      Sécurité du compte
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show d-flex align-items-center"
                role="alert"
              >
                <i className="fa-solid fa-circle-exclamation fs-5 me-3"></i>
                <div className="flex-grow-1">{error}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success alert-dismissible fade show d-flex align-items-center"
                role="alert"
              >
                <i className="fa-solid fa-circle-check fs-5 me-3"></i>
                <div className="flex-grow-1">{success}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Contenu des onglets */}
            <div className="tab-content">
              {/* Onglet Informations personnelles */}
              <div
                className={`tab-pane fade ${activeTab === "personal" ? "show active" : ""}`}
              >
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-4">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-id-card text-success me-2"></i>
                      Vos informations personnelles
                    </h5>
                    <p className="text-muted mb-0 mt-2 small">
                      Mettez à jour vos informations de contact et votre photo
                      de profil
                    </p>
                  </div>
                  <div className="card-body p-4">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-success"
                          style={{ width: "3rem", height: "3rem" }}
                          role="status"
                        >
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3 text-muted fs-5">
                          Chargement de votre profil...
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Colonne gauche - Avatar */}
                          <div className="col-12 col-md-4 mb-4 mb-md-0">
                            <div className="sticky-top" style={{ top: "20px" }}>
                              <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                  <div className="mb-4">
                                    <div className="position-relative d-inline-block">
                                      <div className="avatar-upload-wrapper">
                                        <img
                                          src={getAvatarSrc()}
                                          alt="Avatar"
                                          className="rounded-circle border border-4 border-success shadow"
                                          style={{
                                            width: "180px",
                                            height: "180px",
                                            objectFit: "cover",
                                          }}
                                          onError={handleImageError}
                                        />
                                        <div className="avatar-overlay rounded-circle">
                                          <label
                                            htmlFor="avatar-upload"
                                            className="btn btn-success btn-lg rounded-circle shadow-lg"
                                            style={{
                                              width: "50px",
                                              height: "50px",
                                            }}
                                            title="Changer la photo"
                                          >
                                            <i className="fa-solid fa-camera fa-lg"></i>
                                            <span className="visually-hidden">
                                              Changer la photo
                                            </span>
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
                                  </div>

                                  <div className="mb-4">
                                    <h6 className="fw-bold mb-2">
                                      Photo de profil
                                    </h6>
                                    <p className="text-muted small mb-2">
                                      JPG, PNG ou GIF (Max 5MB)
                                    </p>
                                    {selectedFile && (
                                      <div className="alert alert-success py-2 px-3 small">
                                        <i className="fa-solid fa-check-circle me-2"></i>
                                        {selectedFile.name}
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-start">
                                    <h6 className="fw-bold mb-3 text-success">
                                      <i className="fa-solid fa-lightbulb me-2"></i>
                                      Recommandations :
                                    </h6>
                                    <ul className="list-unstyled text-muted">
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>
                                          Photo récente et de bonne qualité
                                        </span>
                                      </li>
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Visage clairement visible</span>
                                      </li>
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Format carré recommandé</span>
                                      </li>
                                      <li className="d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Arrière-plan neutre</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Colonne droite - Formulaire */}
                          <div className="col-12 col-md-8">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-body p-4">
                                <div className="row g-4">
                                  {/* Civilité */}
                                  <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">
                                      <i className="fa-solid fa-venus-mars me-2 text-muted"></i>
                                      Civilité
                                    </label>
                                    <select
                                      className="form-select form-select-lg"
                                      disabled={saving}
                                      name="civilite"
                                      value=""
                                    >
                                      <option value="">
                                        Sélectionnez une civilité
                                      </option>
                                      {/* 🔴 Vérification que civilites est un tableau */}
                                      {Array.isArray(civilites) &&
                                      civilites.length > 0 ? (
                                        civilites.map((civilite) => (
                                          <option
                                            key={civilite.uuid}
                                            value={civilite.uuid}
                                          >
                                            {civilite.libelle}
                                          </option>
                                        ))
                                      ) : (
                                        <option disabled>
                                          Chargement des civilités...
                                        </option>
                                      )}
                                    </select>
                                    {/* Message de debug (à retirer en production) */}
                                    {!Array.isArray(civilites) && (
                                      <p className="text-danger small mt-1">
                                        Erreur: les civilités ne sont pas un
                                        tableau
                                      </p>
                                    )}
                                  </div>

                                  {/* Nom */}
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="nom"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-signature me-2 text-muted"></i>
                                      Nom *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-user text-muted"></i>
                                      </span>
                                      <input
                                        type="text"
                                        id="nom"
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
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="prenoms"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-user-tag me-2 text-muted"></i>
                                      Prénoms *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-user-pen text-muted"></i>
                                      </span>
                                      <input
                                        type="text"
                                        id="prenoms"
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
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="date_naissance"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-cake-candles me-2 text-muted"></i>
                                      Date de naissance
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-calendar text-muted"></i>
                                      </span>
                                      <input
                                        type="date"
                                        id="date_naissance"
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
                                    <label
                                      htmlFor="email"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-at me-2 text-muted"></i>
                                      Email *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-envelope text-muted"></i>
                                      </span>
                                      <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        placeholder="votre@email.com"
                                        required
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Téléphone */}
                                  <div className="col-12">
                                    <label
                                      htmlFor="telephone"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-mobile-screen me-2 text-muted"></i>
                                      Téléphone
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-phone text-muted"></i>
                                      </span>
                                      <input
                                        type="tel"
                                        id="telephone"
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
                                    <div className="card bg-light border-0 mt-2">
                                      <div className="card-body">
                                        <h6 className="fw-bold mb-3 text-success">
                                          <i className="fa-solid fa-circle-info me-2"></i>
                                          Informations de compte
                                        </h6>
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                                <i className="fa-solid fa-user-check text-success fa-lg"></i>
                                              </div>
                                              <div>
                                                <p className="fw-medium mb-0">
                                                  Statut du compte
                                                </p>
                                                <p className="text-muted small mb-0">
                                                  Actif
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                                <i className="fa-solid fa-calendar-days text-info fa-lg"></i>
                                              </div>
                                              <div>
                                                <p className="fw-medium mb-0">
                                                  Membre depuis
                                                </p>
                                                <p className="text-muted small mb-0">
                                                  {formatMemberSince(
                                                    formData.created_at,
                                                  )}
                                                </p>
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

                        {/* Boutons d'action */}
                        <div className="row mt-4">
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                  <div className="text-center text-md-start">
                                    <p className="text-muted mb-0 small">
                                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                      Les champs marqués d'un * sont
                                      obligatoires
                                    </p>
                                  </div>
                                  <div className="d-flex flex-wrap justify-content-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push("/dashboard-utilisateur")
                                      }
                                      className="btn btn-outline-secondary btn-lg"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-times me-2"></i>
                                      Annuler
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          "/dashboard-utilisateur/parametres/password",
                                        )
                                      }
                                      className="btn btn-outline-primary btn-lg"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-key me-2"></i>
                                      Changer mot de passe
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
                                          <i className="fa-solid fa-floppy-disk me-2"></i>
                                          Enregistrer les modifications
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Onglet Sécurité */}
              <div
                className={`tab-pane fade ${activeTab === "security" ? "show active" : ""}`}
              >
                <div className="row">
                  <div className="col-12 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-0 py-4">
                        <h5 className="mb-0">
                          <i className="fa-solid fa-key text-warning me-2"></i>
                          Mot de passe
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-4">
                          <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-shield-alt text-warning fa-2x"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">
                              Sécurité du mot de passe
                            </h6>
                            <p className="text-muted small mb-0">
                              Dernière modification : Il y a 30 jours
                            </p>
                          </div>
                        </div>
                        <div
                          className="progress mb-4"
                          style={{ height: "10px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "85%" }}
                            aria-valuenow={85}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                        <button
                          onClick={() =>
                            router.push(
                              "/dashboard-utilisateur/parametres/password",
                            )
                          }
                          className="btn btn-warning w-100"
                        >
                          <i className="fa-solid fa-lock me-2"></i>
                          Modifier le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-0 py-4">
                        <h5 className="mb-0">
                          <i className="fa-solid fa-envelope-circle-check text-primary me-2"></i>
                          Vérification email
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-4">
                          <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-envelope-open-text text-primary fa-2x"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">Email vérifié</h6>
                            <p className="text-muted small mb-0">
                              Votre email est confirmé et sécurisé
                            </p>
                          </div>
                        </div>
                        <div className="alert alert-success">
                          <div className="d-flex align-items-center">
                            <i className="fa-solid fa-check-circle me-3"></i>
                            <div>
                              <p className="mb-0 fw-medium">
                                Email vérifié avec succès
                              </p>
                              <p className="mb-0 small">{formData.email}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-primary w-100"
                          disabled
                        >
                          <i className="fa-solid fa-paper-plane me-2"></i>
                          Renvoyer l'email de vérification
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 py-4">
                        <h5 className="mb-0">
                          <i className="fa-solid fa-shield-halved text-danger me-2"></i>
                          Sécurité avancée
                        </h5>
                      </div>
                      <div className="card-body p-4">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <div className="card border h-100">
                              <div className="card-body text-center p-4">
                                <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-mobile-screen-button text-danger fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">
                                  Authentification à deux facteurs
                                </h6>
                                <p className="text-muted small mb-3">
                                  Ajoutez une couche de sécurité supplémentaire
                                </p>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  disabled
                                >
                                  Activer
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4 mb-3">
                            <div className="card border h-100">
                              <div className="card-body text-center p-4">
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-laptop-code text-info fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">
                                  Sessions actives
                                </h6>
                                <p className="text-muted small mb-3">
                                  Gérez vos connexions actives
                                </p>
                                <button
                                  className="btn btn-outline-info btn-sm"
                                  disabled
                                >
                                  Voir les sessions
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4 mb-3">
                            <div className="card border h-100">
                              <div className="card-body text-center p-4">
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                  <i className="fa-solid fa-bell text-success fa-2x"></i>
                                </div>
                                <h6 className="fw-bold mb-2">
                                  Alertes de sécurité
                                </h6>
                                <p className="text-muted small mb-3">
                                  Recevez des notifications de sécurité
                                </p>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  disabled
                                >
                                  Configurer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="alert alert-info mt-4">
                          <div className="d-flex">
                            <i className="fa-solid fa-circle-info fa-lg me-3 mt-1"></i>
                            <div>
                              <h6 className="alert-heading fw-bold mb-2">
                                Conseils de sécurité
                              </h6>
                              <ul className="mb-0">
                                <li>
                                  Utilisez un mot de passe unique et complexe
                                </li>
                                <li>
                                  Activez l'authentification à deux facteurs
                                </li>
                                <li>
                                  Mettez régulièrement à jour vos informations
                                  de sécurité
                                </li>
                                <li>
                                  Vérifiez régulièrement vos sessions actives
                                </li>
                              </ul>
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
          background-color: transparent;
          padding: 0;
        }

        .breadcrumb-item.active {
          color: #16a34a;
        }

        .card {
          border-radius: 15px;
          transition: transform 0.2s ease-in-out;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 0.25rem rgba(22, 163, 74, 0.25);
        }

        .btn-success {
          background-color: #16a34a;
          border-color: #16a34a;
        }

        .btn-success:hover {
          background-color: #15803d;
          border-color: #15803d;
        }

        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          border-bottom: 3px solid transparent;
          padding: 1rem 1.5rem;
          font-weight: 500;
        }

        .nav-tabs .nav-link.active {
          color: #16a34a;
          border-bottom: 3px solid #16a34a;
          background-color: transparent;
        }

        .nav-tabs .nav-link:hover:not(.active) {
          color: #16a34a;
          border-bottom-color: rgba(22, 163, 74, 0.3);
        }

        .avatar-upload-wrapper {
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
          border: 4px solid transparent;
        }

        .avatar-upload-wrapper:hover .avatar-overlay {
          opacity: 1;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }

        .progress {
          background-color: #e9ecef;
          border-radius: 10px;
        }

        .progress-bar {
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}