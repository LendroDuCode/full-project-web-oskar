// app/agent/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

interface AgentProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone?: string;
  avatar?: string;
  civilite_uuid?: string;
  est_bloque: boolean;
  is_admin: boolean;
  statut: string;
  role_uuid: string;
  created_at: string;
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
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form data - initialisé avec des valeurs par défaut
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
    civilite_uuid: "",
  });

  // Récupérer le profil
  useEffect(() => {
    fetchProfile();
    fetchCivilites();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("oskar_token");
      if (!token) {
        router.push("/connexion");
        return;
      }

      const response = await api.get(API_ENDPOINTS.AUTH.AGENT.PROFILE);

      if (response.data?.type === "success" && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        // Pré-remplir le formulaire avec les données du profil
        setFormData({
          nom: profileData.nom || "",
          prenoms: profileData.prenoms || "",
          email: profileData.email || "",
          telephone: profileData.telephone || "",
          civilite_uuid: profileData.civilite_uuid || "",
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du profil:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement du profil",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCivilites = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CIVILITES.ACTIVES);
      if (response.data?.data) {
        setCivilites(response.data.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des civilités:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setAvatarFile(file);

      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Créer FormData pour l'envoi
      const formDataToSend = new FormData();

      // Ajouter les champs textuels
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenoms", formData.prenoms);
      formDataToSend.append("email", formData.email);
      if (formData.telephone) {
        formDataToSend.append("telephone", formData.telephone);
      }
      if (formData.civilite_uuid) {
        formDataToSend.append("civilite_uuid", formData.civilite_uuid);
      }

      // Ajouter l'avatar s'il y en a un nouveau
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      // Appeler l'API de mise à jour
      const response = await api.put(
        API_ENDPOINTS.AUTH.AGENT.UPDATE_PROFILE,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.type === "success") {
        setSuccess(response.data.message || "Profil mis à jour avec succès");

        // Mettre à jour le profil local
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...formData,
                avatar: response.data.data?.avatar || prev.avatar,
                civilite:
                  civilites.find((c) => c.uuid === formData.civilite_uuid) ||
                  prev.civilite,
              }
            : null,
        );

        // Réinitialiser le fichier d'avatar
        setAvatarFile(null);
        setAvatarPreview(null);

        // Rafraîchir la page après 2 secondes
        setTimeout(() => {
          fetchProfile();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      )
    ) {
      // TODO: Implémenter la suppression du compte
      alert("Fonctionnalité de suppression en cours de développement");
    }
  };

  const getDefaultAvatar = (nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=200`;
  };

  const getAvatarUrl = () => {
    if (!profile) return getDefaultAvatar("", "");
    if (avatarPreview) return avatarPreview;
    if (!profile.avatar) return getDefaultAvatar(profile.nom, profile.prenoms);
    return profile.avatar;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-gradient-light">
        <div className="container py-5">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "400px" }}
          >
            <div className="text-center">
              <div
                className="spinner-border text-success mb-3"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <h4 className="text-muted mb-2">Chargement de votre profil...</h4>
              <p className="text-muted">
                Veuillez patienter pendant que nous récupérons vos informations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gradient-light">
      {/* Header avec Breadcrumb */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container py-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a
                  href="/agent/dashboard"
                  className="text-decoration-none text-muted"
                >
                  <i className="fas fa-home me-1"></i>
                  Tableau de bord
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i className="fas fa-user me-1"></i>
                Mon profil
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <h1 className="h3 fw-bold mb-1">Mon profil agent</h1>
              <p className="text-muted mb-0">
                Gérez vos informations personnelles et vos paramètres de compte
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => router.back()}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
              <button
                className="btn btn-success"
                onClick={() => router.push("/agent/dashboard")}
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Messages d'alerte */}
        <div className="row mb-4">
          <div className="col-12">
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show shadow-sm"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading mb-1">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {success && (
              <div
                className="alert alert-success alert-dismissible fade show shadow-sm"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle me-3 fs-4"></i>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading mb-1">Succès</h6>
                    <p className="mb-0">{success}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess(null)}
                ></button>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Colonne gauche - Carte profil */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-header bg-gradient-success text-white py-4 border-0">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="position-relative">
                      <img
                        src={getAvatarUrl()}
                        alt={`${profile?.prenoms} ${profile?.nom}`}
                        className="rounded-circle border border-4 border-white"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-2 border border-3 border-white">
                        <i className="fas fa-user-check"></i>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-4">
                    <h4 className="card-title mb-1">
                      {profile?.prenoms} {profile?.nom}
                    </h4>
                    <p className="card-text opacity-75 mb-0">
                      <i className="fas fa-envelope me-2"></i>
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Statut du compte */}
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted mb-3">
                    <i className="fas fa-user-shield me-2"></i>
                    Statut du compte
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    <span
                      className={`badge ${profile?.est_bloque ? "bg-danger" : "bg-success"}`}
                      style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                    >
                      <i className="fas fa-circle me-1"></i>
                      {profile?.est_bloque ? "Compte bloqué" : "Compte actif"}
                    </span>
                    {profile?.is_admin && (
                      <span
                        className="badge bg-info"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.5rem 0.75rem",
                        }}
                      >
                        <i className="fas fa-crown me-1"></i>
                        Administrateur
                      </span>
                    )}
                    <span
                      className="badge bg-secondary"
                      style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                    >
                      <i className="fas fa-user-tie me-1"></i>
                      Agent
                    </span>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted mb-3">
                    <i className="fas fa-address-card me-2"></i>
                    Informations de contact
                  </h6>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <i className="fas fa-phone text-success"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Téléphone
                          </small>
                          <span className="fw-medium">
                            {profile?.telephone || "Non renseigné"}
                          </span>
                        </div>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <i className="fas fa-venus-mars text-success"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">Civilité</small>
                          <span className="fw-medium">
                            {profile?.civilite?.libelle || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                    </li>
                    <li className="mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <i className="fas fa-calendar text-success"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Membre depuis
                          </small>
                          <span className="fw-medium">
                            {profile ? formatDate(profile.created_at) : ""}
                          </span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <i className="fas fa-clock text-success"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Dernière mise à jour
                          </small>
                          <span className="fw-medium">
                            {profile ? formatDate(profile.updated_at) : ""}
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Identifiant unique */}
                <div className="border-top pt-4">
                  <h6 className="text-uppercase text-muted mb-2">
                    <i className="fas fa-fingerprint me-2"></i>
                    Identifiant unique
                  </h6>
                  <div className="bg-light rounded p-3">
                    <code className="text-muted small">
                      {profile?.uuid || "Non disponible"}
                    </code>
                  </div>
                </div>
              </div>

              <div className="card-footer bg-transparent border-0 py-4">
                <button
                  type="button"
                  className="btn btn-danger w-100"
                  onClick={handleDeleteAccount}
                >
                  <i className="fas fa-trash-alt me-2"></i>
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire de modification */}
          <div className="col-lg-8">
            {/* Formulaire principal */}
            <div className="card border-0 shadow-lg mb-4">
              <div className="card-header bg-white py-4 border-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="h4 fw-bold mb-1">
                      <i className="fas fa-user-edit text-success me-2"></i>
                      Modifier mes informations
                    </h3>
                    <p className="text-muted mb-0">
                      Mettez à jour vos informations personnelles
                    </p>
                  </div>
                  <div className="avatar-upload">
                    <label
                      htmlFor="avatar-upload"
                      className="btn btn-outline-success btn-sm"
                      title="Changer la photo de profil"
                    >
                      <i className="fas fa-camera me-2"></i>
                      Changer la photo
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="d-none"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Civilité */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="civilite_uuid"
                        className="form-label fw-medium"
                      >
                        <i className="fas fa-venus-mars me-2 text-muted"></i>
                        Civilité
                      </label>
                      <select
                        id="civilite_uuid"
                        name="civilite_uuid"
                        className="form-select form-select-lg"
                        value={formData.civilite_uuid}
                        onChange={handleInputChange}
                      >
                        <option value="">Sélectionnez une civilité</option>
                        {civilites.map((civilite) => (
                          <option key={civilite.uuid} value={civilite.uuid}>
                            {civilite.libelle}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nom */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="nom" className="form-label fw-medium">
                        <i className="fas fa-user me-2 text-muted"></i>
                        Nom *
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        className="form-control form-control-lg"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        placeholder="Votre nom"
                      />
                    </div>

                    {/* Prénoms */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="prenoms" className="form-label fw-medium">
                        <i className="fas fa-user me-2 text-muted"></i>
                        Prénoms *
                      </label>
                      <input
                        type="text"
                        id="prenoms"
                        name="prenoms"
                        className="form-control form-control-lg"
                        value={formData.prenoms}
                        onChange={handleInputChange}
                        required
                        placeholder="Vos prénoms"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-6 mb-4">
                      <label htmlFor="email" className="form-label fw-medium">
                        <i className="fas fa-envelope me-2 text-muted"></i>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-lg"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>

                    {/* Téléphone */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="telephone"
                        className="form-label fw-medium"
                      >
                        <i className="fas fa-phone me-2 text-muted"></i>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        className="form-control form-control-lg"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="+225 XX XX XX XX"
                      />
                    </div>

                    {/* Nouvelle photo de profil */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-medium">
                        <i className="fas fa-image me-2 text-muted"></i>
                        Nouvelle photo de profil
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <span className="input-group-text bg-light">
                          <i className="fas fa-image text-muted"></i>
                        </span>
                      </div>
                      <div className="form-text text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Formats acceptés : JPG, PNG, GIF (max 5MB)
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => router.back()}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Annuler
                    </button>

                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-warning btn-lg"
                        onClick={() => {
                          setFormData({
                            nom: profile?.nom || "",
                            prenoms: profile?.prenoms || "",
                            email: profile?.email || "",
                            telephone: profile?.telephone || "",
                            civilite_uuid: profile?.civilite_uuid || "",
                          });
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                      >
                        <i className="fas fa-undo me-2"></i>
                        Réinitialiser
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
                            <i className="fas fa-save me-2"></i>
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Section sécurité */}
            <div className="card border-0 shadow-lg mb-4">
              <div className="card-header bg-white py-4 border-0">
                <h3 className="h4 fw-bold mb-1">
                  <i className="fas fa-shield-alt text-warning me-2"></i>
                  Sécurité du compte
                </h3>
                <p className="text-muted mb-0">
                  Gérez la sécurité de votre compte
                </p>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  {/* Mot de passe */}
                  <div className="col-md-6">
                    <div className="card border h-100 hover-shadow">
                      <div className="card-body text-center p-4">
                        <div
                          className="bg-gradient-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <i className="fas fa-key text-warning fs-3"></i>
                        </div>
                        <h5 className="card-title fw-bold">Mot de passe</h5>
                        <p className="card-text text-muted small mb-4">
                          Mettez à jour votre mot de passe régulièrement
                        </p>
                        <button
                          className="btn btn-outline-warning w-100"
                          onClick={() => router.push("/agent/change-password")}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Modifier le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sessions actives */}
                  <div className="col-md-6">
                    <div className="card border h-100 hover-shadow">
                      <div className="card-body text-center p-4">
                        <div
                          className="bg-gradient-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <i className="fas fa-desktop text-info fs-3"></i>
                        </div>
                        <h5 className="card-title fw-bold">Sessions actives</h5>
                        <p className="card-text text-muted small mb-4">
                          Gérez vos appareils connectés
                        </p>
                        <button
                          className="btn btn-outline-info w-100"
                          onClick={() => router.push("/agent/sessions")}
                        >
                          <i className="fas fa-list me-2"></i>
                          Voir les sessions
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Authentification à deux facteurs */}
                  <div className="col-md-6">
                    <div className="card border h-100 hover-shadow">
                      <div className="card-body text-center p-4">
                        <div
                          className="bg-gradient-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <i className="fas fa-mobile-alt text-danger fs-3"></i>
                        </div>
                        <h5 className="card-title fw-bold">
                          Authentification 2FA
                        </h5>
                        <p className="card-text text-muted small mb-4">
                          Ajoutez une couche de sécurité supplémentaire
                        </p>
                        <button
                          className="btn btn-outline-danger w-100"
                          onClick={() => router.push("/agent/2fa")}
                        >
                          <i className="fas fa-lock me-2"></i>
                          Activer la 2FA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications de sécurité */}
                  <div className="col-md-6">
                    <div className="card border h-100 hover-shadow">
                      <div className="card-body text-center p-4">
                        <div
                          className="bg-gradient-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <i className="fas fa-bell text-success fs-3"></i>
                        </div>
                        <h5 className="card-title fw-bold">Notifications</h5>
                        <p className="card-text text-muted small mb-4">
                          Recevez des alertes de sécurité
                        </p>
                        <button
                          className="btn btn-outline-success w-100"
                          onClick={() => router.push("/agent/notifications")}
                        >
                          <i className="fas fa-cog me-2"></i>
                          Configurer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section statistiques */}
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white py-4 border-0">
                <h3 className="h4 fw-bold mb-1">
                  <i className="fas fa-chart-bar text-primary me-2"></i>
                  Mes statistiques
                </h3>
                <p className="text-muted mb-0">
                  Vue d'ensemble de votre activité
                </p>
              </div>

              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div
                        className="bg-gradient-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "70px", height: "70px" }}
                      >
                        <i className="fas fa-bullhorn text-primary fs-2"></i>
                      </div>
                      <h3 className="fw-bold mb-1">12</h3>
                      <p className="text-muted mb-0">Annonces</p>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div
                        className="bg-gradient-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "70px", height: "70px" }}
                      >
                        <i className="fas fa-shopping-cart text-success fs-2"></i>
                      </div>
                      <h3 className="fw-bold mb-1">48</h3>
                      <p className="text-muted mb-0">Commandes</p>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div
                        className="bg-gradient-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "70px", height: "70px" }}
                      >
                        <i className="fas fa-envelope text-warning fs-2"></i>
                      </div>
                      <h3 className="fw-bold mb-1">23</h3>
                      <p className="text-muted mb-0">Messages</p>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="text-center">
                      <div
                        className="bg-gradient-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "70px", height: "70px" }}
                      >
                        <i className="fas fa-eye text-info fs-2"></i>
                      </div>
                      <h3 className="fw-bold mb-1">1.2K</h3>
                      <p className="text-muted mb-0">Vues</p>
                    </div>
                  </div>
                </div>

                {/* Graphique de progression */}
                <div className="mt-5 pt-4 border-top">
                  <h6 className="fw-bold mb-3">Progression mensuelle</h6>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: "75%" }}
                      aria-valuenow={75}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                      Objectif : 100 annonces
                    </small>
                    <small className="text-success fw-bold">75% atteint</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">Espace Agent OSKAR</h5>
              <p className="text-white-50 mb-0">
                Gérez efficacement votre activité sur la plateforme OSKAR
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-white-50 mb-2">
                © {new Date().getFullYear()} OSKAR. Tous droits réservés.
              </p>
              <div className="d-flex justify-content-md-end gap-3">
                <a href="#" className="text-white-50 text-decoration-none">
                  <i className="fas fa-shield-alt me-1"></i> Sécurité
                </a>
                <a href="#" className="text-white-50 text-decoration-none">
                  <i className="fas fa-question-circle me-1"></i> Aide
                </a>
                <a href="#" className="text-white-50 text-decoration-none">
                  <i className="fas fa-file-contract me-1"></i> Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Styles additionnels */}
      <style jsx>{`
        .bg-gradient-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .bg-gradient-success {
          background: linear-gradient(135deg, #16a34a 0%, #0d8b3a 100%);
        }

        .hover-shadow {
          transition: all 0.3s ease;
        }

        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .card {
          border-radius: 15px;
          overflow: hidden;
        }

        .form-control-lg:focus,
        .form-select-lg:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 0.25rem rgba(22, 163, 74, 0.25);
        }

        .progress-bar {
          border-radius: 5px;
        }

        .avatar-upload label {
          cursor: pointer;
        }

        .bg-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
        }

        .bg-gradient-warning {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }

        .bg-gradient-info {
          background: linear-gradient(135deg, #0dcaf0 0%, #0bb5d4 100%);
        }

        .bg-gradient-danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
      `}</style>
    </div>
  );
}
