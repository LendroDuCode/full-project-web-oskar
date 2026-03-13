// app/(back-office)/dashboard-vendeur/registre-commerce/page.tsx
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
  faFile,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileArchive,
  faFileCode,
  faFileVideo,
  faFileAudio,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";


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
  errorMessage?: string;
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

const getFileIcon = (mimetype: string, filename: string = "") => {
  if (mimetype.includes("pdf")) return faFilePdf;
  if (mimetype.includes("image")) return faFileImage;
  if (mimetype.includes("word") || mimetype.includes("document") || filename.endsWith('.doc') || filename.endsWith('.docx')) return faFileWord;
  if (mimetype.includes("excel") || mimetype.includes("spreadsheet") || filename.endsWith('.xls') || filename.endsWith('.xlsx')) return faFileExcel;
  if (mimetype.includes("powerpoint") || mimetype.includes("presentation") || filename.endsWith('.ppt') || filename.endsWith('.pptx')) return faFilePowerpoint;
  if (mimetype.includes("zip") || mimetype.includes("rar") || mimetype.includes("tar") || mimetype.includes("7z")) return faFileArchive;
  if (mimetype.includes("text") || mimetype.includes("json") || mimetype.includes("xml") || mimetype.includes("javascript")) return faFileCode;
  if (mimetype.includes("video")) return faFileVideo;
  if (mimetype.includes("audio")) return faFileAudio;
  return faFileAlt;
};


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

// Fonction pour parser l'erreur 413 et autres erreurs serveur
const parseUploadError = (err: any): string => {
  // Erreur 413 (Request Entity Too Large)
  if (err.response?.status === 413 || err.message?.includes('413') || err.response?.data?.includes('413')) {
    return "Le fichier est trop volumineux pour le serveur. Veuillez contacter l'administrateur pour augmenter la limite d'upload (client_max_body_size dans Nginx).";
  }
  
  // Erreur de connexion
  if (err.message?.includes('Network Error') || err.code === 'ECONNABORTED') {
    return "Problème de connexion au serveur. Vérifiez votre connexion internet et réessayez.";
  }
  
  // Erreur de timeout
  if (err.message?.includes('timeout') || err.code === 'ECONNABORTED') {
    return "Le téléchargement a pris trop de temps. Réessayez avec un fichier plus petit ou une meilleure connexion.";
  }
  
  // Erreur de type de fichier (si gérée par le backend)
  if (err.response?.status === 415) {
    return "Type de fichier non supporté. Veuillez utiliser un format de fichier valide.";
  }
  
  // Autres erreurs
  return err.message || err.response?.data?.message || "Erreur lors de l'upload du fichier";
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function RegistreCommercePage() {
  // États
  const [isMobile, setIsMobile] = useState(false);
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
  const [fileTooLarge, setFileTooLarge] = useState(false);
  const [serverLimit, setServerLimit] = useState<string>("inconnue");
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    fetchCurrentRegistre();
    fetchUploadHistory();
    detectServerLimit();
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

  const detectServerLimit = async () => {
    try {
      // Tenter de détecter la limite du serveur
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      
      const response = await fetch(`${API_URL}/api/config/upload-limit`, {
        method: 'HEAD',
      }).catch(() => null);
      
      if (response?.headers) {
        const limit = response.headers.get('X-Upload-Limit');
        if (limit) {
          setServerLimit(limit);
        }
      }
    } catch (err) {
      console.log("Impossible de détecter la limite serveur");
    }
  };

  const fetchCurrentRegistre = async () => {
    try {
      setLoading(true);
      
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
          
          localStorage.setItem("currentRegistre", JSON.stringify(registreData));
        } else {
          console.log("ℹ️ Aucun registre de commerce trouvé");
        }
      } else {
        console.error("❌ Erreur chargement profil:", response.status);
      }
      
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
      const mockHistory = localStorage.getItem("uploadHistory");
      if (mockHistory) {
        setUploadHistory(JSON.parse(mockHistory));
      } else {
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
      setFileTooLarge(false);

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

      // Utiliser le bon endpoint - SANS l'option timeout qui n'existe pas
      const response = await api.post<UploadResponse>(
        API_ENDPOINTS.VENDEURS.UPLOADER_REGISTRE_COMMERCE,
        formData,
        { 
          isFormData: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      clearInterval(interval);
      setUploadProgress(100);

      console.log("✅ Réponse upload:", response);

      if (response.success) {
        setCurrentRegistre(response.data);
        
        localStorage.setItem("currentRegistre", JSON.stringify(response.data));

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

        setTimeout(() => {
          setActiveTab("consultation");
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Erreur upload:", err);
      
      const errorMessage = parseUploadError(err);
      
      if (err.response?.status === 413 || err.message?.includes('413') || err.response?.data?.includes('413')) {
        setFileTooLarge(true);
        
        const limitMatch = err.response?.data?.match(/limit (\d+)/i) || err.message?.match(/limit (\d+)/i);
        if (limitMatch) {
          const limitBytes = parseInt(limitMatch[1]) * 1024 * 1024;
          setServerLimit(formatFileSize(limitBytes));
        }
      }
      
      setError(errorMessage);
      
      const historyItem: UploadHistoryItem = {
        id: Date.now().toString(),
        filename: file.name,
        date: new Date().toISOString(),
        size: file.size,
        status: "échec",
        errorMessage: errorMessage,
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
    setError(null);
    setFileTooLarge(false);

    // ACCEPTER TOUS LES TYPES DE FICHIERS
    // Plus de restriction sur les types
    
    // Validation de la taille (avertissement seulement)
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      setFileTooLarge(true);
      setError(`⚠️ Attention: Le fichier est volumineux (${formatFileSize(file.size)}). 
               La limite du serveur est actuellement ${serverLimit !== "inconnue" ? serverLimit : "inconnue"}. 
               Si l'upload échoue, veuillez contacter l'administrateur.`);
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileTooLarge(false);
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
    <div className="container-fluid py-2 py-md-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="row">
        <div className="col-12">
          {/* En-tête */}
          <div className="d-flex align-items-center gap-2 gap-md-3 mb-3 mb-md-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: isMobile ? "48px" : "56px",
                height: isMobile ? "48px" : "56px",
                backgroundColor: colors.oskar.green + "20",
                color: colors.oskar.green,
                fontSize: isMobile ? "1.2rem" : "1.5rem",
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </div>
            <div>
              <h1 className={`${isMobile ? "h4" : "display-6"} fw-bold mb-0 mb-md-1`} style={{ color: colors.oskar.black }}>
                Registre de Commerce
              </h1>
              <p className="text-muted mb-0" style={{ fontSize: isMobile ? "0.8rem" : "1rem" }}>
                {isMobile ? "Gérez votre registre" : "Gérez votre registre de commerce : consultez, mettez à jour et suivez l'historique"}
              </p>
            </div>
          </div>

          {/* Messages de notification */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 gap-md-3 mb-3 mb-md-4 rounded-3 border-0 shadow-sm"
                 style={{ backgroundColor: "#FEE2E2", color: "#991B1B", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
              <FontAwesomeIcon icon={faExclamationCircle} className={isMobile ? "fs-6" : "fs-5"} />
              <div className="flex-grow-1" style={{ whiteSpace: "pre-line" }}>{error}</div>
              <button type="button" className="btn-close" onClick={() => setError(null)} />
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 gap-md-3 mb-3 mb-md-4 rounded-3 border-0 shadow-sm"
                 style={{ backgroundColor: "#D1FAE5", color: "#065F46", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
              <FontAwesomeIcon icon={faCheckCircle} className={isMobile ? "fs-6" : "fs-5"} />
              <div className="flex-grow-1">{successMessage}</div>
              <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} />
            </div>
          )}

          {/* Navigation par onglets */}
          <div className="bg-white rounded-3 shadow-sm mb-3 mb-md-4 p-2">
            <div className="d-flex gap-1 gap-md-2">
              <button
                className={`btn flex-grow-1 py-2 py-md-3 d-flex align-items-center justify-content-center gap-1 gap-md-2 ${
                  activeTab === "consultation" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "consultation" ? colors.oskar.green : "transparent",
                  color: activeTab === "consultation" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  fontSize: isMobile ? "0.75rem" : "0.9rem",
                  padding: isMobile ? "0.5rem 0.25rem" : "0.75rem 1rem",
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
                <FontAwesomeIcon icon={faEye} style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                <span className={isMobile ? "d-none d-sm-inline" : ""}>Consultation</span>
                {isMobile && <span className="d-sm-none">Voir</span>}
              </button>

              <button
                className={`btn flex-grow-1 py-2 py-md-3 d-flex align-items-center justify-content-center gap-1 gap-md-2 ${
                  activeTab === "upload" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "upload" ? colors.oskar.green : "transparent",
                  color: activeTab === "upload" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  fontSize: isMobile ? "0.75rem" : "0.9rem",
                  padding: isMobile ? "0.5rem 0.25rem" : "0.75rem 1rem",
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
                <FontAwesomeIcon icon={faUpload} style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                <span className={isMobile ? "d-none d-sm-inline" : ""}>Mettre à jour</span>
                {isMobile && <span className="d-sm-none">Upload</span>}
              </button>

              <button
                className={`btn flex-grow-1 py-2 py-md-3 d-flex align-items-center justify-content-center gap-1 gap-md-2 ${
                  activeTab === "historique" ? "active" : ""
                }`}
                style={{
                  backgroundColor: activeTab === "historique" ? colors.oskar.green : "transparent",
                  color: activeTab === "historique" ? "white" : colors.oskar.grey,
                  border: "none",
                  borderRadius: "10px",
                  fontSize: isMobile ? "0.75rem" : "0.9rem",
                  padding: isMobile ? "0.5rem 0.25rem" : "0.75rem 1rem",
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
                <FontAwesomeIcon icon={faHistory} style={{ fontSize: isMobile ? "0.7rem" : "0.9rem" }} />
                <span className={isMobile ? "d-none d-sm-inline" : ""}>Historique</span>
                {isMobile && <span className="d-sm-none">Hist.</span>}
              </button>
            </div>
          </div>

          {/* Contenu principal selon l'onglet */}
          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
            {activeTab === "consultation" && (
              <div>
                <h4 className={`fw-bold mb-3 mb-md-4 d-flex align-items-center gap-2 border-bottom pb-2 pb-md-3`} style={{ fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                  <FontAwesomeIcon icon={faEye} style={{ color: colors.oskar.green, fontSize: isMobile ? "1rem" : "1.2rem" }} />
                  Consultation du registre de commerce
                </h4>

                {loading ? (
                  <div className="text-center py-4 py-md-5">
                    <div className="spinner-border text-primary mb-2 mb-md-3" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Chargement du registre...</p>
                  </div>
                ) : currentRegistre ? (
                  <div className="row g-3 g-md-4">
                    <div className="col-md-8">
                      <div
                        className="rounded-4 overflow-hidden mb-3 mb-md-4 border"
                        style={{
                          backgroundColor: colors.oskar.lightGrey,
                          minHeight: isMobile ? "250px" : "400px",
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
                              maxHeight: isMobile ? "300px" : "500px",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error("❌ Erreur chargement image:", displayUrl);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'text-center p-3 p-md-5';
                                placeholder.innerHTML = `
                                  <div class="rounded-circle mx-auto mb-2 mb-md-3" style="width:60px;height:60px;background-color:${colors.oskar.green}20;color:${colors.oskar.green};font-size:1.5rem;display:flex;align-items:center;justify-content-center">
                                    <i class="fas fa-file-pdf"></i>
                                  </div>
                                  <h5 class="fw-semibold mb-1" style="font-size:1rem">Image non disponible</h5>
                                  <p class="text-muted small mb-2" style="font-size:0.8rem">Cliquez pour télécharger le fichier</p>
                                `;
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <div className="text-center p-3 p-md-5">
                            <div
                              className="rounded-circle mx-auto mb-2 mb-md-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "60px" : "80px",
                                height: isMobile ? "60px" : "80px",
                                backgroundColor: colors.oskar.green + "20",
                                color: colors.oskar.green,
                                fontSize: isMobile ? "1.5rem" : "2rem",
                              }}
                            >
                              <FontAwesomeIcon icon={getFileIcon(currentRegistre.mimetype, currentRegistre.original_name)} />
                            </div>
                            <h5 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "1rem" : "1.2rem" }}>{currentRegistre.original_name}</h5>
                            <p className="text-muted small mb-2 mb-md-3" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                              Cliquez pour ouvrir le document
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="bg-light rounded-4 p-3 p-md-4">
                        <h5 className="fw-bold mb-2 mb-md-3" style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Informations</h5>
                        
                        <div className="d-flex flex-column gap-2 gap-md-3">
                          <div>
                            <p className="small text-muted mb-0 mb-md-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>Nom du fichier</p>
                            <p className="fw-semibold mb-0 text-break" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                              {currentRegistre.original_name}
                            </p>
                          </div>

                          <div>
                            <p className="small text-muted mb-0 mb-md-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>Taille</p>
                            <p className="fw-semibold mb-0" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                              {formatFileSize(currentRegistre.size)}
                            </p>
                          </div>

                          <div>
                            <p className="small text-muted mb-0 mb-md-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>Type</p>
                            <p className="fw-semibold mb-0" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                              {currentRegistre.mimetype}
                            </p>
                          </div>

                          {currentRegistre.uploaded_at && (
                            <div>
                              <p className="small text-muted mb-0 mb-md-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>Date d'upload</p>
                              <p className="fw-semibold mb-0" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1 me-md-2" style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }} />
                                {formatDate(currentRegistre.uploaded_at)}
                              </p>
                            </div>
                          )}

                          <div className="d-grid gap-2 mt-2 mt-md-3">
                            {displayUrl && (
                              <>
                                <a
                                  href={displayUrl}
                                  download={currentRegistre.original_name}
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-2 py-md-3"
                                  style={{
                                    backgroundColor: colors.oskar.green,
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                                  }}
                                >
                                  <FontAwesomeIcon icon={faDownload} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                                  <span>Télécharger</span>
                                </a>

                                <a
                                  href={displayUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-2 py-md-3"
                                  style={{
                                    backgroundColor: colors.oskar.blue + "10",
                                    color: colors.oskar.blue,
                                    border: `1px solid ${colors.oskar.blue}30`,
                                    borderRadius: "10px",
                                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "20";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.blue + "10";
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                                  <span>Ouvrir</span>
                                </a>

                                <button
                                  onClick={handleCopyLink}
                                  className="btn d-flex align-items-center justify-content-center gap-2 py-2 py-md-3"
                                  style={{
                                    backgroundColor: "transparent",
                                    color: colors.oskar.grey,
                                    border: `1px solid ${colors.oskar.lightGrey}`,
                                    borderRadius: "10px",
                                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
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
                  <div className="text-center py-4 py-md-5">
                    <div
                      className="rounded-circle mx-auto mb-2 mb-md-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: isMobile ? "60px" : "80px",
                        height: isMobile ? "60px" : "80px",
                        backgroundColor: colors.oskar.lightGrey,
                        color: colors.oskar.grey,
                        fontSize: isMobile ? "1.5rem" : "2rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                    </div>
                    <h5 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Aucun registre trouvé</h5>
                    <p className="text-muted mb-2 mb-md-3" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                      Vous n'avez pas encore uploadé votre registre de commerce.
                    </p>
                    <button
                      className="btn d-inline-flex align-items-center gap-1 gap-md-2 px-3 px-md-4 py-2 py-md-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: isMobile ? "0.8rem" : "0.9rem",
                      }}
                      onClick={() => setActiveTab("upload")}
                    >
                      <FontAwesomeIcon icon={faUpload} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                      <span>Uploader mon registre</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "upload" && (
              <div>
                <h4 className={`fw-bold mb-3 mb-md-4 d-flex align-items-center gap-2 border-bottom pb-2 pb-md-3`} style={{ fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                  <FontAwesomeIcon icon={faUpload} style={{ color: colors.oskar.green, fontSize: isMobile ? "1rem" : "1.2rem" }} />
                  Mettre à jour le registre de commerce
                </h4>

                <div className="row">
                  <div className="col-md-8 mx-auto">
                    {/* Zone de drop */}
                    <div
                      ref={dropZoneRef}
                      className={`border-2 border-dashed rounded-4 p-3 p-md-5 mb-3 mb-md-4 text-center ${
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
                        accept="*" // Accepter tous les types de fichiers
                        onChange={handleFileSelect}
                      />

                      {selectedFile ? (
                        <div className="text-center">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Aperçu"
                              className="rounded-3 mb-2 mb-md-3"
                              style={{
                                maxWidth: isMobile ? "150px" : "200px",
                                maxHeight: isMobile ? "150px" : "200px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle mx-auto mb-2 mb-md-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? "60px" : "80px",
                                height: isMobile ? "60px" : "80px",
                                backgroundColor: colors.oskar.green + "20",
                                color: colors.oskar.green,
                                fontSize: isMobile ? "1.5rem" : "2rem",
                              }}
                            >
                              <FontAwesomeIcon icon={getFileIcon(selectedFile.type, selectedFile.name)} />
                            </div>
                          )}

                          <h5 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>{selectedFile.name}</h5>
                          <p className="text-muted small mb-2 mb-md-3" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            {formatFileSize(selectedFile.size)} • {selectedFile.type || "Type inconnu"}
                          </p>

                          {fileTooLarge && (
                            <div className="alert alert-warning py-2 mb-3" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                              <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                              ⚠️ Fichier volumineux ({formatFileSize(selectedFile.size)}). 
                              Limite serveur actuelle: {serverLimit !== "inconnue" ? serverLimit : "inconnue"}.
                              Si l'upload échoue, contactez l'administrateur pour augmenter la limite Nginx (client_max_body_size).
                            </div>
                          )}

                          <button
                            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile();
                            }}
                            style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", padding: isMobile ? "0.25rem 0.5rem" : "0.25rem 0.75rem" }}
                          >
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="rounded-circle mx-auto mb-2 mb-md-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: isMobile ? "60px" : "80px",
                              height: isMobile ? "60px" : "80px",
                              backgroundColor: colors.oskar.green + "20",
                              color: colors.oskar.green,
                              fontSize: isMobile ? "1.5rem" : "2rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faUpload} />
                          </div>
                          <h5 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                            {isMobile ? "Appuyez pour uploader" : "Glissez-déposez votre fichier ici"}
                          </h5>
                          <p className="text-muted mb-2" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            ou cliquez pour parcourir
                          </p>
                          <p className="small text-muted" style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}>
                            Tous les formats acceptés • Limite serveur: {serverLimit !== "inconnue" ? serverLimit : "inconnue"}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Barre de progression */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mb-3 mb-md-4">
                        <div className="d-flex justify-content-between align-items-center mb-1 mb-md-2">
                          <span className="small text-muted" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>Upload en cours...</span>
                          <span className="small fw-semibold" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>{uploadProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: isMobile ? "6px" : "8px" }}>
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
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 py-md-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: isMobile ? "0.8rem" : "0.9rem",
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
                          <FontAwesomeIcon icon={faRefresh} spin style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                          <span>Upload en cours...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faUpload} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                          <span>Uploader le registre</span>
                        </>
                      )}
                    </button>

                    {/* Informations */}
                    <div
                      className="mt-3 mt-md-4 p-2 p-md-3 rounded-3"
                      style={{
                        backgroundColor: colors.oskar.blue + "10",
                        border: `1px solid ${colors.oskar.blue}30`,
                      }}
                    >
                      <div className="d-flex gap-2 gap-md-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          style={{ color: colors.oskar.blue, fontSize: isMobile ? "0.8rem" : "1rem" }}
                        />
                        <div>
                          <h6 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Important</h6>
                          <p className="small text-muted mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            Le registre de commerce est un document officiel requis pour les vendeurs professionnels.
                          </p>
                          {serverLimit !== "inconnue" && (
                            <p className="small text-muted mb-0" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                              <strong>Limite serveur actuelle:</strong> {serverLimit}
                            </p>
                          )}
                          {fileTooLarge && (
                            <p className="small text-danger mt-2" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                              <strong>💡 Solution:</strong> Demandez à l'administrateur d'augmenter 
                              <code> client_max_body_size</code> dans la configuration Nginx.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "historique" && (
              <div>
                <h4 className={`fw-bold mb-3 mb-md-4 d-flex align-items-center gap-2 border-bottom pb-2 pb-md-3`} style={{ fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
                  <FontAwesomeIcon icon={faHistory} style={{ color: colors.oskar.green, fontSize: isMobile ? "1rem" : "1.2rem" }} />
                  Historique des uploads
                </h4>

                {uploadHistory.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                      <thead className="bg-light">
                        <tr>
                          <th className="px-2 px-md-4 py-2 py-md-3 border-0">Fichier</th>
                          <th className="px-2 px-md-4 py-2 py-md-3 border-0">Date</th>
                          <th className="px-2 px-md-4 py-2 py-md-3 border-0">Taille</th>
                          <th className="px-2 px-md-4 py-2 py-md-3 border-0">Statut</th>
                          <th className="px-2 px-md-4 py-2 py-md-3 border-0 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadHistory.map((item) => (
                          <tr key={item.id} className="border-bottom">
                            <td className="px-2 px-md-4 py-2 py-md-3">
                              <div className="d-flex align-items-center gap-2 gap-md-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: isMobile ? "30px" : "40px",
                                    height: isMobile ? "30px" : "40px",
                                    backgroundColor:
                                      item.status === "succès"
                                        ? colors.oskar.green + "20"
                                        : "#FEE2E2",
                                    color:
                                      item.status === "succès"
                                        ? colors.oskar.green
                                        : "#DC2626",
                                    fontSize: isMobile ? "0.7rem" : "0.9rem",
                                  }}
                                >
                                  <FontAwesomeIcon icon={getFileIcon(item.url?.includes('pdf') ? 'application/pdf' : 'image/jpeg', item.filename)} />
                                </div>
                                <div className="text-truncate" style={{ maxWidth: isMobile ? "100px" : "200px" }}>
                                  <p className="fw-semibold mb-0 text-truncate" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>{item.filename}</p>
                                  {item.status === "échec" && item.errorMessage && (
                                    <small className="text-danger d-block text-truncate" style={{ fontSize: isMobile ? "0.55rem" : "0.65rem" }}>
                                      {item.errorMessage.substring(0, 50)}...
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 px-md-4 py-2 py-md-3">
                              <div className="d-flex align-items-center gap-1 gap-md-2">
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className="text-muted"
                                  style={{ fontSize: isMobile ? "0.5rem" : "0.6rem" }}
                                />
                                <span className="small" style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}>{formatDate(item.date)}</span>
                              </div>
                            </td>
                            <td className="px-2 px-md-4 py-2 py-md-3">
                              <span className="small" style={{ fontSize: isMobile ? "0.6rem" : "0.7rem" }}>{formatFileSize(item.size)}</span>
                            </td>
                            <td className="px-2 px-md-4 py-2 py-md-3">
                              <span
                                className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                                style={{
                                  backgroundColor:
                                    item.status === "succès" ? "#D1FAE5" : "#FEE2E2",
                                  color:
                                    item.status === "succès" ? "#065F46" : "#991B1B",
                                  fontSize: isMobile ? "0.55rem" : "0.65rem",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={item.status === "succès" ? faCheckCircle : faExclamationCircle}
                                  style={{ fontSize: isMobile ? "0.45rem" : "0.55rem" }}
                                />
                                {item.status}
                              </span>
                            </td>
                            <td className="px-2 px-md-4 py-2 py-md-3 text-end">
                              {item.status === "succès" && item.url && (
                                <a
                                  href={getFileUrl(item.url) || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm d-inline-flex align-items-center gap-1"
                                  style={{
                                    backgroundColor: colors.oskar.blue + "10",
                                    color: colors.oskar.blue,
                                    border: `1px solid ${colors.oskar.blue}30`,
                                    borderRadius: "6px",
                                    padding: isMobile ? "0.15rem 0.4rem" : "0.25rem 0.6rem",
                                    fontSize: isMobile ? "0.55rem" : "0.65rem",
                                    textDecoration: "none",
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} style={{ fontSize: isMobile ? "0.45rem" : "0.55rem" }} />
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
                  <div className="text-center py-4 py-md-5">
                    <div
                      className="rounded-circle mx-auto mb-2 mb-md-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: isMobile ? "60px" : "80px",
                        height: isMobile ? "60px" : "80px",
                        backgroundColor: colors.oskar.lightGrey,
                        color: colors.oskar.grey,
                        fontSize: isMobile ? "1.5rem" : "2rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faHistory} />
                    </div>
                    <h5 className="fw-semibold mb-1" style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>Aucun historique</h5>
                    <p className="text-muted mb-2 mb-md-3" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                      Vous n'avez pas encore effectué d'upload de registre.
                    </p>
                    <button
                      className="btn d-inline-flex align-items-center gap-1 gap-md-2 px-3 px-md-4 py-2 py-md-3"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: isMobile ? "0.8rem" : "0.9rem",
                      }}
                      onClick={() => setActiveTab("upload")}
                    >
                      <FontAwesomeIcon icon={faUpload} style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
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
        
        @media (max-width: 768px) {
          .table {
            font-size: 0.7rem;
          }
          .btn {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}