"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faUpload,
  faDownload,
  faEye,
  faHistory,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faFileImage,
  faFileAlt,
  faTrash,
  faInfoCircle,
  faRefresh,
  faSearch,
  faCalendarAlt,
  faUser,
  faClock,
  faLink,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// ============================================
// TYPES
// ============================================

interface RegistreCommerce {
  url: string;           // Format: "registres-commerce%2F1773068608380-449337069-..."
  key: string;           // Format: "registres-commerce/1773068608380-449337069-..."
  original_name: string;
  size: number;
  mimetype: string;
  uploaded_at?: string;
}

interface UploadHistoryItem {
  id: string;
  filename: string;
  date: string;
  size: number;
  status: "succès" | "échec";
  url?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: RegistreCommerce;
}

// ============================================
// FONCTIONS UTILITAIRES DE FORMATAGE
// ============================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    
    return date.toLocaleDateString("fr-FR", options).replace(" à ", " à ");
  } catch {
    return dateString;
  }
};

const getFileIcon = (mimetype: string) => {
  if (mimetype.includes("pdf")) return faFilePdf;
  if (mimetype.includes("image")) return faFileImage;
  return faFileAlt;
};

// ============================================
// FONCTION: Construire l'URL complète pour l'affichage
// ============================================
const getFileUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Si c'est déjà une URL complète, la retourner
  if (url.startsWith('http')) {
    return url;
  }
  
  // Si l'URL contient %2F (encodé), l'utiliser directement
  if (url.includes('%2F')) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    return `${API_URL}/api/files/${url}`;
  }
  
  // Sinon, encoder le chemin
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const encodedPath = encodeURIComponent(url);
  return `${API_URL}/api/files/${encodedPath}`;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function RegistreCommercePage() {
  // États
  const [currentRegistre, setCurrentRegistre] = useState<RegistreCommerce | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"consultation" | "upload" | "historique">("consultation");
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Charger les données initiales
  useEffect(() => {
    fetchCurrentRegistre();
    fetchUploadHistory();
  }, []);

  // Mettre à jour l'URL d'affichage quand le registre change
  useEffect(() => {
    if (currentRegistre?.url) {
      setDisplayUrl(getFileUrl(currentRegistre.url));
    } else {
      setDisplayUrl(null);
    }
  }, [currentRegistre]);

  // Nettoyer les previews
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ============================================
  // FONCTIONS API
  // ============================================

  const fetchCurrentRegistre = async () => {
    try {
      setLoading(true);
      
      // Récupérer le profil du vendeur connecté
      const token = localStorage.getItem('access_token') || localStorage.getItem('oskar_token');
      
      if (!token) {
        console.log("⚠️ Aucun token trouvé");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const response = await fetch(`${API_URL}/auth/vendeur/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Profil vendeur chargé:", data);
        
        // Vérifier si le vendeur a un registre de commerce
        if (data.data?.registre_commerce) {
          const registreData: RegistreCommerce = {
            url: data.data.registre_commerce,
            key: data.data.registre_commerce_key || data.data.registre_commerce.replace(/%2F/g, '/'),
            original_name: data.data.registre_commerce_original_name || 'Registre de commerce',
            size: data.data.registre_commerce_size || 0,
            mimetype: data.data.registre_commerce_mimetype || 'application/pdf',
            uploaded_at: data.data.registre_commerce_uploaded_at
          };
          setCurrentRegistre(registreData);
          
          // Sauvegarder dans localStorage pour persistence
          localStorage.setItem("currentRegistre", JSON.stringify(registreData));
        } else {
          console.log("ℹ️ Aucun registre de commerce trouvé");
        }
      } else {
        console.error("❌ Erreur chargement profil:", response.status);
      }
      
      // Fallback sur localStorage pour le développement
      const mockRegistre = localStorage.getItem("currentRegistre");
      if (mockRegistre && !currentRegistre) {
        setCurrentRegistre(JSON.parse(mockRegistre));
      }
    } catch (err) {
      console.error("❌ Erreur chargement registre:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      // Pour l'instant, utiliser localStorage
      const mockHistory = localStorage.getItem("uploadHistory");
      if (mockHistory) {
        setUploadHistory(JSON.parse(mockHistory));
      } else {
        // Données de démonstration
        const demoHistory: UploadHistoryItem[] = [
          {
            id: "1",
            filename: "registre_commerce_2024.pdf",
            date: new Date().toISOString(),
            size: 245760,
            status: "succès",
            url: currentRegistre?.url || "registres-commerce%2Fdemo.pdf",
          },
          {
            id: "2",
            filename: "registre_commerce_2023.pdf",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            size: 189440,
            status: "succès",
            url: "registres-commerce%2Fdemo_2023.pdf",
          },
        ];
        setUploadHistory(demoHistory);
      }
    } catch (err) {
      console.error("❌ Erreur chargement historique:", err);
    }
  };

  const uploadRegistre = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Simuler la progression
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Créer le FormData
      const formData = new FormData();
      formData.append("registre_commerce", file);

      console.log("📤 Upload du fichier:", file.name, file.size, file.type);

      // ✅ Utiliser le bon endpoint API_ENDPOINTS.VENDEURS.UPLOADER_REGISTRE_COMMERCE
      const response = await api.post<UploadResponse>(
        API_ENDPOINTS.VENDEURS.UPLOADER_REGISTRE_COMMERCE,
        formData,
        { isFormData: true }
      );

      clearInterval(interval);
      setUploadProgress(100);

      console.log("✅ Réponse upload:", response);

      if (response.success) {
        setCurrentRegistre(response.data);
        
        // Sauvegarder dans localStorage test
        localStorage.setItem("currentRegistre", JSON.stringify(response.data));

        // Ajouter à l'historique
        const historyItem: UploadHistoryItem = {
          id: Date.now().toString(),
          filename: response.data.original_name,
          date: new Date().toISOString(),
          size: response.data.size,
          status: "succès",
          url: response.data.url,
        };

        const updatedHistory = [historyItem, ...uploadHistory];
        setUploadHistory(updatedHistory);
        localStorage.setItem("uploadHistory", JSON.stringify(updatedHistory));

        setSuccessMessage("✅ Registre de commerce uploadé avec succès !");
        setTimeout(() => setSuccessMessage(null), 5000);

        // Passer à l'onglet consultation après 2 secondes
        setTimeout(() => {
          setActiveTab("consultation");
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Erreur upload:", err);
      setError(err.message || "Erreur lors de l'upload du registre");
      
      // Ajouter à l'historique comme échec
      const historyItem: UploadHistoryItem = {
        id: Date.now().toString(),
        filename: file.name,
        date: new Date().toISOString(),
        size: file.size,
        status: "échec",
      };

      const updatedHistory = [historyItem, ...uploadHistory];
      setUploadHistory(updatedHistory);
      localStorage.setItem("uploadHistory", JSON.stringify(updatedHistory));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ============================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validation du type de fichier
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError("Format de fichier non supporté. Utilisez PDF, JPEG, PNG, GIF ou WEBP.");
      return;
    }

    // Validation de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("Le fichier est trop volumineux. Taille maximum : 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Créer une prévisualisation
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    await uploadRegistre(selectedFile);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyLink = () => {
    if (displayUrl) {
      navigator.clipboard.writeText(displayUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setError("Erreur lors de la copie du lien");
        });
    }
  };

  // ============================================
  // RENDU
  // ============================================

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="row">
        <div className="col-12">
          {/* En-tête */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: colors.oskar.green + "20",
                color: colors.oskar.green,
                fontSize: "1.5rem",
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </div>
            <div>
              <h1 className="display-6 fw-bold mb-1" style={{ color: colors.oskar.black }}>
                Registre de Commerce
              </h1>
              <p className="text-muted mb-0">
                Gérez votre registre de commerce : consultez, mettez à jour et suivez l'historique
              </p>
            </div>
          </div>

          {/* Messages de notification */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-3 mb-4 rounded-3 border-0 shadow-sm"
                 style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
              <FontAwesomeIcon icon={faExclamationCircle} className="fs-5" />
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="btn-close" onClick={() => setError(null)} />
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-3 mb-4 rounded-3 border-0 shadow-sm"
                 style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>
              <FontAwesomeIcon icon={faCheckCircle} className="fs-5" />
              <div className="flex-grow-1">{successMessage}</div>
              <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} />
            </div>
          )}

          {/* Navigation par onglets */}
          <div className="bg-white rounded-3 shadow-sm mb-4 p-2">
            <div className="d-flex gap-2">
              <button
                className={`btn flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === "consultation" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "consultation" ? colors.oskar.green : "transparent",
                  color: activeTab === "consultation" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setActiveTab("consultation")}
                onMouseEnter={(e) => {
                  if (activeTab !== "consultation") {
                    e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "consultation") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <FontAwesomeIcon icon={faEye} />
                <span>Consultation</span>
              </button>

              <button
                className={`btn flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === "upload" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "upload" ? colors.oskar.green : "transparent",
                  color: activeTab === "upload" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setActiveTab("upload")}
                onMouseEnter={(e) => {
                  if (activeTab !== "upload") {
                    e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "upload") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Mettre à jour</span>
              </button>

              <button
                className={`btn flex-grow-1 py-3 d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === "historique" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "historique" ? colors.oskar.green : "transparent",
                  color: activeTab === "historique" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setActiveTab("historique")}
                onMouseEnter={(e) => {
                  if (activeTab !== "historique") {
                    e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "historique") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <FontAwesomeIcon icon={faHistory} />
                <span>Historique</span>
              </button>
            </div>
          </div>

          {/* Contenu principal selon l'onglet */}
          <div className="bg-white rounded-4 shadow-sm p-4">
            {activeTab === "consultation" && (
              <div>
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-3">
                  <FontAwesomeIcon icon={faEye} style={{ color: colors.oskar.green }} />
                  Consultation du registre de commerce
                </h4>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted">Chargement du registre...</p>
                  </div>
                ) : currentRegistre ? (
                  <div className="row">
                    <div className="col-md-8">
                      <div
                        className="rounded-4 overflow-hidden mb-4 border"
                        style={{
                          backgroundColor: colors.oskar.lightGrey,
                          minHeight: "400px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => displayUrl && window.open(displayUrl, "_blank")}
                      >
                        {currentRegistre.mimetype.startsWith("image/") && displayUrl ? (
                          <img
                            src={displayUrl}
                            alt="Registre de commerce"
                            className="img-fluid"
                            style={{
                              maxHeight: "500px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error("❌ Erreur chargement image:", displayUrl);
                              e.currentTarget.style.display = 'none';
                              // Afficher un placeholder
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'text-center p-5';
                                placeholder.innerHTML = `
                                  <div class="rounded-circle mx-auto mb-3" style="width:80px;height:80px;background-color:${colors.oskar.green}20;color:${colors.oskar.green};font-size:2rem;display:flex;align-items:center;justify-content:center">
                                    <i class="fas fa-file-pdf"></i>
                                  </div>
                                  <h5 class="fw-semibold mb-2">Image non disponible</h5>
                                  <p class="text-muted small mb-3">Cliquez pour télécharger le fichier</p>
                                `;
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center p-5">
                            <div
                              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: "80px",
                                height: "80px",
                                backgroundColor: colors.oskar.green + "20",
                                color: colors.oskar.green,
                                fontSize: "2rem",
                              }}
                            >
                              <FontAwesomeIcon icon={faFilePdf} />
                            </div>
                            <h5 className="fw-semibold mb-2">Document PDF</h5>
                            <p className="text-muted small mb-3">
                              Cliquez pour ouvrir le document
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="bg-light rounded-4 p-4">
                        <h5 className="fw-bold mb-3">Informations</h5>
                        
                        <div className="d-flex flex-column gap-3">
                          <div>
                            <p className="small text-muted mb-1">Nom du fichier</p>
                            <p className="fw-semibold mb-0 text-break">
                              {currentRegistre.original_name}
                            </p>
                          </div>

                          <div>
                            <p className="small text-muted mb-1">Taille</p>
                            <p className="fw-semibold mb-0">
                              {formatFileSize(currentRegistre.size)}
                            </p>
                          </div>

                          <div>
                            <p className="small text-muted mb-1">Type</p>
                            <p className="fw-semibold mb-0">
                              {currentRegistre.mimetype}
                            </p>
                          </div>

                          {currentRegistre.uploaded_at && (
                            <div>
                              <p className="small text-muted mb-1">Date d'upload</p>
                              <p className="fw-semibold mb-0">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                                {formatDate(currentRegistre.uploaded_at)}
                              </p>
                            </div>
                          )}

                          <div className="d-grid gap-2 mt-3">
                            {displayUrl && (
                              <>
                                <a
                                  href={displayUrl}
                                  download={currentRegistre.original_name}
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-3"
                                  style={{
                                    backgroundColor: colors.oskar.green,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    transition: "all 0.2s ease",
                                    fontWeight: "500",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                                  }}
                                >
                                  <FontAwesomeIcon icon={faDownload} />
                                  <span>Télécharger</span>
                                </a>

                                <a
                                  href={displayUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-3"
                                  style={{
                                    backgroundColor: colors.oskar.blue + "10",
                                    color: colors.oskar.blue,
                                    border: `1px solid ${colors.oskar.blue}30`,
                                    borderRadius: "10px",
                                    transition: "all 0.2s ease",
                                    fontWeight: "500",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "20";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "10";
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  <span>Ouvrir</span>
                                </a>

                                <button
                                  onClick={handleCopyLink}
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-3"
                                  style={{
                                    backgroundColor: "transparent",
                                    color: colors.oskar.grey,
                                    border: `1px solid ${colors.oskar.lightGrey}`,
                                    borderRadius: "10px",
                                    transition: "all 0.2s ease",
                                    fontWeight: "500",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} />
                                  <span>{copied ? "Copié !" : "Copier le lien"}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div
                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: colors.oskar.lightGrey,
                        color: colors.oskar.grey,
                        fontSize: "2rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                    </div>
                    <h5 className="fw-semibold mb-2">Aucun registre trouvé</h5>
                    <p className="text-muted mb-3">
                      Vous n'avez pas encore uploadé votre registre de commerce.
                    </p>
                    <button
                      className="btn d-inline-flex align-items-center gap-2 px-4 py-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                      }}
                      onClick={() => setActiveTab("upload")}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span>Uploader mon registre</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "upload" && (
              <div>
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-3">
                  <FontAwesomeIcon icon={faUpload} style={{ color: colors.oskar.green }} />
                  Mettre à jour le registre de commerce
                </h4>

                <div className="row">
                  <div className="col-md-8 mx-auto">
                    {/* Zone de drop */}
                    <div
                      ref={dropZoneRef}
                      className={`border-2 border-dashed rounded-4 p-5 mb-4 text-center ${
                        dragActive ? "bg-light" : ""
                      }`}
                      style={{
                        borderColor: dragActive ? colors.oskar.green : colors.oskar.lightGrey,
                        backgroundColor: dragActive ? colors.oskar.green + "10" : "white",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileSelect}
                      />

                      {selectedFile ? (
                        <div className="text-center">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Aperçu"
                              className="rounded-3 mb-3"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "200px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: "80px",
                                height: "80px",
                                backgroundColor: colors.oskar.green + "20",
                                color: colors.oskar.green,
                                fontSize: "2rem",
                              }}
                            >
                              <FontAwesomeIcon icon={faFilePdf} />
                            </div>
                          )}

                          <h5 className="fw-semibold mb-2">{selectedFile.name}</h5>
                          <p className="text-muted small mb-3">
                            {formatFileSize(selectedFile.size)}
                          </p>

                          <button
                            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile();
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: colors.oskar.green + "20",
                              color: colors.oskar.green,
                              fontSize: "2rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faUpload} />
                          </div>
                          <h5 className="fw-semibold mb-2">
                            Glissez-déposez votre fichier ici
                          </h5>
                          <p className="text-muted mb-3">
                            ou cliquez pour parcourir
                          </p>
                          <p className="small text-muted">
                            Formats acceptés : PDF, JPEG, PNG, GIF, WEBP (max 10MB)
                          </p>
                        </>
                      )}
                    </div>

                    {/* Barre de progression */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted">Upload en cours...</span>
                          <span className="small fw-semibold">{uploadProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${uploadProgress}%`,
                              backgroundColor: colors.oskar.green,
                              transition: "width 0.2s ease",
                            }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    )}

                    {/* Bouton d'upload */}
                    <button
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        transition: "all 0.2s ease",
                        fontWeight: "500",
                        opacity: loading || !selectedFile ? 0.5 : 1,
                        cursor: loading || !selectedFile ? "not-allowed" : "pointer",
                      }}
                      onClick={handleUpload}
                      disabled={loading || !selectedFile}
                      onMouseEnter={(e) => {
                        if (!loading && selectedFile) {
                          e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading && selectedFile) {
                          e.currentTarget.style.backgroundColor = colors.oskar.green;
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <FontAwesomeIcon icon={faRefresh} spin />
                          <span>Upload en cours...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUpload} />
                          <span>Uploader le registre</span>
                        </>
                      )}
                    </button>

                    {/* Informations */}
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        backgroundColor: colors.oskar.blue + "10",
                        border: `1px solid ${colors.oskar.blue}30`,
                      }}
                    >
                      <div className="d-flex gap-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          style={{ color: colors.oskar.blue }}
                        />
                        <div>
                          <h6 className="fw-semibold mb-2">Important</h6>
                          <p className="small text-muted mb-0">
                            Le registre de commerce est un document officiel requis pour
                            les vendeurs professionnels. Assurez-vous que le document est
                            lisible et à jour. Les formats acceptés sont PDF, JPEG, PNG, GIF et WEBP.
                            Taille maximum : 10MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "historique" && (
              <div>
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-3">
                  <FontAwesomeIcon icon={faHistory} style={{ color: colors.oskar.green }} />
                  Historique des uploads
                </h4>

                {uploadHistory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th className="px-4 py-3 border-0">Fichier</th>
                          <th className="px-4 py-3 border-0">Date</th>
                          <th className="px-4 py-3 border-0">Taille</th>
                          <th className="px-4 py-3 border-0">Statut</th>
                          <th className="px-4 py-3 border-0 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadHistory.map((item) => (
                          <tr key={item.id} className="border-bottom">
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor:
                                      item.status === "succès"
                                        ? colors.oskar.green + "20"
                                        : "#FEE2E2",
                                    color:
                                      item.status === "succès"
                                        ? colors.oskar.green
                                        : "#DC2626",
                                  }}
                                >
                                  <FontAwesomeIcon icon={getFileIcon(item.url?.includes('pdf') ? 'application/pdf' : 'image/jpeg')} />
                                </div>
                                <div>
                                  <p className="fw-semibold mb-1">{item.filename}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                />
                                <span className="small">{formatDate(item.date)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="small">{formatFileSize(item.size)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="badge d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                                style={{
                                  backgroundColor:
                                    item.status === "succès" ? "#D1FAE5" : "#FEE2E2",
                                  color:
                                    item.status === "succès" ? "#065F46" : "#991B1B",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={item.status === "succès" ? faCheckCircle : faExclamationCircle}
                                  style={{ fontSize: "0.65rem" }}
                                />
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-end">
                              {item.status === "succès" && item.url && (
                                <a
                                  href={getFileUrl(item.url) || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm d-inline-flex align-items-center gap-2"
                                  style={{
                                    backgroundColor: colors.oskar.blue + "10",
                                    color: colors.oskar.blue,
                                    border: `1px solid ${colors.oskar.blue}30`,
                                    borderRadius: "6px",
                                    padding: "0.25rem 0.75rem",
                                    textDecoration: "none",
                                    fontSize: "0.75rem",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "20";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "10";
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  <span>Voir</span>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div
                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: colors.oskar.lightGrey,
                        color: colors.oskar.grey,
                        fontSize: "2rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faHistory} />
                    </div>
                    <h5 className="fw-semibold mb-2">Aucun historique</h5>
                    <p className="text-muted mb-3">
                      Vous n'avez pas encore effectué d'upload de registre.
                    </p>
                    <button
                      className="btn d-inline-flex align-items-center gap-2 px-4 py-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                      }}
                      onClick={() => setActiveTab("upload")}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span>Uploader mon premier registre</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .border-dashed {
          border-style: dashed !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .object-fit-contain {
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}