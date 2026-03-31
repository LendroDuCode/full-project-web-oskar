"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faEye,
  faTrash,
  faEdit,
  faBan,
  faCheck,
  faTimes,
  faRefresh,
  faFilter,
  faSearch,
  faCheckCircle,
  faExclamationTriangle,
  faTag,
  faMoneyBillWave,
  faEnvelope,
  faPhone,
  faCalendar,
  faHeart,
  faSpinner,
  faPlus,
  faUser,
  faClock,
  faGift,
  faExchangeAlt,
  faBoxes,
  faBoxOpen,
  faUserCircle,
  faInfoCircle,
  faLocationDot,
  faStore,
  faCalendarAlt,
  faPercent,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Interfaces
interface Utilisateur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
  telephone?: string;
}

interface ProduitUtilisateur {
  uuid: string;
  libelle: string;
  description: string | null;
  prix: string | null;
  statut: string;
  estPublie: boolean;
  createdAt: string | null;
  image: string;
  categorie?: { libelle: string } | string;
}

interface Don {
  uuid: string;
  nom: string;
  prix: number | null;
  statut: string;
  estPublie: boolean;
  dateCreation: string | null;
  image: string;
  categorie?: string | { libelle: string };
  localisation?: string;
  lieu_retrait?: string;
  description?: string;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  prix: string;
  statut: string;
  estPublie: boolean | null;
  dateCreation: string | null;
  image: string;
  objetPropose?: string;
  objetDemande?: string;
  message?: string;
}

interface FavoriItem {
  uuid: string;
  type: "produit" | "don" | "echange";
  produit?: ProduitUtilisateur;
  don?: Don;
  echange?: Echange;
  createdAt: string;
}

interface SectionStats {
  total: number;
  publies: number;
  nonPublies: number;
  bloques: number;
  valeurTotale: number;
}

interface DashboardStats {
  produits: SectionStats;
  dons: SectionStats;
  echanges: SectionStats;
  favoris: { total: number };
}

const formatPrix = (prix: string | number | null) => {
  if (prix === null || prix === "0" || prix === "") return "Gratuit";
  const montant = typeof prix === "string" ? parseFloat(prix) : prix;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(montant || 0);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Non spécifié";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "Date invalide";
  }
};

// Fonction utilitaire pour obtenir le libellé de la catégorie
const getCategorieLibelle = (categorie: any): string => {
  if (!categorie) return "Non catégorisé";
  if (typeof categorie === "string") return categorie;
  if (categorie.libelle) return categorie.libelle;
  return "Non catégorisé";
};

const LoadingSpinner = () => (
  <div className="container-fluid py-5">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-lg text-center py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: "4rem", height: "4rem" }} role="status" />
          <h3 className="fw-bold mb-2">Chargement de vos données</h3>
          <p className="text-muted">Veuillez patienter...</p>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <div className="card border-0 shadow-sm h-100 hover-lift">
    <div className="card-body p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="text-uppercase text-muted mb-1 small fw-semibold">{title}</h6>
          <h3 className="fw-bold mb-0 text-dark">{value}</h3>
        </div>
        <div className={`rounded-circle p-3 bg-${color} bg-opacity-10`}>
          <FontAwesomeIcon icon={icon} className={`fs-4 text-${color}`} />
        </div>
      </div>
    </div>
  </div>
);

// Modal de détails
const DetailModal = ({ show, onClose, item, type }: { show: boolean; onClose: () => void; item: any; type: string }) => {
  if (!show || !item) return null;

  const isProduit = type === "produits";
  const isDon = type === "dons";
  const isEchange = type === "echanges";

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          {/* En-tête */}
          <div className="modal-header border-0" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)", borderRadius: "20px 20px 0 0" }}>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                {isProduit && <FontAwesomeIcon icon={faBox} className="text-white fs-5" />}
                {isDon && <FontAwesomeIcon icon={faGift} className="text-white fs-5" />}
                {isEchange && <FontAwesomeIcon icon={faExchangeAlt} className="text-white fs-5" />}
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Détails de l'annonce</h5>
                <p className="text-white-50 mb-0 small">{item.libelle || item.nom || item.nomElementEchange}</p>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Corps */}
          <div className="modal-body p-4">
            <div className="row">
              {/* Image */}
              <div className="col-md-5 mb-3 mb-md-0">
                <div className="rounded-4 overflow-hidden bg-light" style={{ height: "250px" }}>
                  {item.image ? (
                    <img src={buildImageUrl(item.image) || ''} alt={item.libelle || item.nom} className="w-100 h-100 object-cover" />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-muted fs-1" />
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <span className={`badge ${item.estPublie ? "bg-success" : "bg-warning"} px-3 py-2`}>
                    {item.estPublie ? <><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Publié</> : <><FontAwesomeIcon icon={faClock} className="me-1" /> Non publié</>}
                  </span>
                  {item.statut === "Bloqué" && (
                    <span className="badge bg-danger ms-2 px-3 py-2"><FontAwesomeIcon icon={faBan} className="me-1" /> Bloqué</span>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="col-md-7">
                <h4 className="fw-bold mb-3">{item.libelle || item.nom || item.nomElementEchange}</h4>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faTag} className="text-primary me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Catégorie :</span>
                    <span className="ms-2 text-muted">{getCategorieLibelle(item.categorie)}</span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-success me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Prix :</span>
                    <span className="ms-2 text-muted">{formatPrix(item.prix)}</span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-info me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Date de création :</span>
                    <span className="ms-2 text-muted">{formatDate(item.date)}</span>
                  </div>

                  {isDon && item.localisation && (
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faLocationDot} className="text-danger me-2" style={{ width: "20px" }} />
                      <span className="fw-semibold">Localisation :</span>
                      <span className="ms-2 text-muted">{item.localisation}</span>
                    </div>
                  )}

                  {isDon && item.lieu_retrait && (
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faStore} className="text-warning me-2" style={{ width: "20px" }} />
                      <span className="fw-semibold">Lieu de retrait :</span>
                      <span className="ms-2 text-muted">{item.lieu_retrait}</span>
                    </div>
                  )}

                  {isEchange && item.objetPropose && (
                    <div className="d-flex align-items-start mb-2">
                      <FontAwesomeIcon icon={faBox} className="text-primary me-2 mt-1" style={{ width: "20px" }} />
                      <div><span className="fw-semibold">Objet proposé :</span><br /><span className="text-muted small">{item.objetPropose}</span></div>
                    </div>
                  )}

                  {isEchange && item.objetDemande && (
                    <div className="d-flex align-items-start mb-2">
                      <FontAwesomeIcon icon={faHandHoldingHeart} className="text-success me-2 mt-1" style={{ width: "20px" }} />
                      <div><span className="fw-semibold">Objet demandé :</span><br /><span className="text-muted small">{item.objetDemande}</span></div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <h6 className="fw-bold mb-2"><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Description</h6>
                    <p className="text-muted mb-0 small">{item.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 justify-content-center pb-4">
            <button className="btn btn-outline-secondary px-4" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} className="me-2" /> Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardUtilisateur() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Données par section
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);
  const [produitsBloques, setProduitsBloques] = useState<ProduitUtilisateur[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [donsBloques, setDonsBloques] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [echangesBloques, setEchangesBloques] = useState<Echange[]>([]);
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);

  const [activeSection, setActiveSection] = useState<"produits" | "dons" | "echanges" | "favoris">("produits");
  const [activeTab, setActiveTab] = useState<"tous" | "publies" | "bloques">("tous");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<string>("");

  const [stats, setStats] = useState<DashboardStats>({
    produits: { total: 0, publies: 0, nonPublies: 0, bloques: 0, valeurTotale: 0 },
    dons: { total: 0, publies: 0, nonPublies: 0, bloques: 0, valeurTotale: 0 },
    echanges: { total: 0, publies: 0, nonPublies: 0, bloques: 0, valeurTotale: 0 },
    favoris: { total: 0 },
  });

  // Récupérer le profil utilisateur
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get<any>("/auth/utilisateur/profile");
      if (response?.data) {
        setUtilisateur({
          uuid: response.data.uuid,
          nom: response.data.nom,
          prenoms: response.data.prenoms,
          avatar: response.data.avatar,
          email: response.data.email,
          telephone: response.data.telephone,
        });
      }
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    }
  }, []);

  // Charger les favoris
  const fetchFavoris = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.FAVORIS.LIST);
      let favorisData: FavoriItem[] = [];
      if (response?.data && Array.isArray(response.data)) favorisData = response.data;
      else if (response?.favoris && Array.isArray(response.favoris)) favorisData = response.favoris;
      else if (Array.isArray(response)) favorisData = response;
      setFavoris(favorisData || []);
    } catch (err) {
      console.error("Erreur chargement favoris:", err);
      setFavoris([]);
    }
  }, []);

  // Calculer les statistiques par section
  const calculateStats = useCallback(() => {
    const produitsPublies = produits.filter(p => p.estPublie === true).length;
    const produitsNonPublies = produits.filter(p => p.estPublie === false && p.statut !== "Bloqué").length;
    const valeurTotaleProduits = produits.reduce((sum, p) => sum + (p.prix ? parseFloat(p.prix) : 0), 0);
    
    const donsPublies = dons.filter(d => d.estPublie === true).length;
    const donsNonPublies = dons.filter(d => d.estPublie === false && d.statut !== "Bloqué").length;
    
    const echangesPublies = echanges.filter(e => e.estPublie === true).length;
    const echangesNonPublies = echanges.filter(e => e.estPublie === false && e.statut !== "Bloquée").length;
    const valeurTotaleEchanges = echanges.reduce((sum, e) => sum + (parseFloat(e.prix) || 0), 0);

    setStats({
      produits: {
        total: produits.length + produitsBloques.length,
        publies: produitsPublies,
        nonPublies: produitsNonPublies,
        bloques: produitsBloques.length,
        valeurTotale: valeurTotaleProduits,
      },
      dons: {
        total: dons.length + donsBloques.length,
        publies: donsPublies,
        nonPublies: donsNonPublies,
        bloques: donsBloques.length,
        valeurTotale: 0,
      },
      echanges: {
        total: echanges.length + echangesBloques.length,
        publies: echangesPublies,
        nonPublies: echangesNonPublies,
        bloques: echangesBloques.length,
        valeurTotale: valeurTotaleEchanges,
      },
      favoris: { total: favoris.length },
    });
  }, [produits, produitsBloques, dons, donsBloques, echanges, echangesBloques, favoris]);

  // Charger toutes les données
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchUserProfile();

      // Produits
      const produitsRes = await api.get<any>("/produits/liste-mes-utilisateur-produits");
      if (produitsRes?.data) setProduits(produitsRes.data);
      const produitsBloquesRes = await api.get<any>("/produits/produits-utilisateur-bloques");
      if (produitsBloquesRes?.data) setProduitsBloques(produitsBloquesRes.data);

      // Dons
      const donsRes = await api.get<any>("/dons/liste-don-utilisateur");
      if (donsRes?.data) setDons(donsRes.data);
      const donsBloquesRes = await api.get<any>("/dons/liste-dons-bloques-utilisateur");
      if (donsBloquesRes?.data) setDonsBloques(donsBloquesRes.data);

      // Échanges
      const echangesRes = await api.get<any>("/echanges/liste-echange-utilisateur");
      if (echangesRes?.data) setEchanges(echangesRes.data);
      const echangesBloquesRes = await api.get<any>("/echanges/liste-echange-bloquees-utilisateur");
      if (echangesBloquesRes?.data) setEchangesBloques(echangesBloquesRes.data);

      await fetchFavoris();
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, fetchFavoris]);

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => { calculateStats(); }, [produits, produitsBloques, dons, donsBloques, echanges, echangesBloques, favoris]);

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setSelectedItemType(activeSection);
    setShowDetailModal(true);
  };

  const hasAnyData = stats.produits.total > 0 || stats.dons.total > 0 || stats.echanges.total > 0 || stats.favoris.total > 0;

  const getFilteredData = () => {
    let data: any[] = [];
    switch (activeSection) {
      case "produits":
        if (activeTab === "publies") data = produits.filter(p => p.estPublie === true);
        else if (activeTab === "bloques") data = produitsBloques;
        else data = produits;
        break;
      case "dons":
        if (activeTab === "publies") data = dons.filter(d => d.estPublie === true);
        else if (activeTab === "bloques") data = donsBloques;
        else data = dons;
        break;
      case "echanges":
        if (activeTab === "publies") data = echanges.filter(e => e.estPublie === true);
        else if (activeTab === "bloques") data = echangesBloques;
        else data = echanges;
        break;
      case "favoris":
        data = favoris;
        break;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((item: any) => {
        const name = item.libelle || item.nom || item.nomElementEchange || "";
        return name.toLowerCase().includes(term);
      });
    }
    return data;
  };

  const getDisplayData = (item: any) => {
    if (activeSection === "favoris") {
      const fav = item as FavoriItem;
      if (fav.type === "produit" && fav.produit) {
        return { 
          ...fav.produit, 
          uuid: fav.uuid, 
          date: fav.createdAt, 
          libelle: fav.produit.libelle,
          categorie: getCategorieLibelle(fav.produit.categorie)
        };
      }
      if (fav.type === "don" && fav.don) {
        return { 
          ...fav.don, 
          uuid: fav.uuid, 
          date: fav.createdAt, 
          libelle: fav.don.nom,
          categorie: getCategorieLibelle(fav.don.categorie)
        };
      }
      if (fav.type === "echange" && fav.echange) {
        return { 
          ...fav.echange, 
          uuid: fav.uuid, 
          date: fav.createdAt, 
          libelle: fav.echange.nomElementEchange,
          categorie: "Non catégorisé"
        };
      }
      return { uuid: fav.uuid, libelle: "Élément", description: "", image: null, prix: null, estPublie: false, statut: "inconnu", categorie: "Non catégorisé", date: fav.createdAt };
    }
    
    return {
      ...item,
      libelle: item.libelle || item.nom || item.nomElementEchange || "Sans nom",
      description: item.description || item.message || "",
      categorie: getCategorieLibelle(item.categorie),
      date: item.createdAt || item.dateCreation,
    };
  };

  const filteredData = getFilteredData();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid py-3 py-md-4">
      {/* Modal de détails */}
      <DetailModal show={showDetailModal} onClose={() => setShowDetailModal(false)} item={selectedItem} type={selectedItemType} />

      {/* Header avec bienvenue */}
      <div className="mb-4">
        <div className="rounded-4 p-3 p-md-4 shadow-lg hero-gradient">
          <div className="d-flex align-items-center flex-wrap gap-3">
            <div className="position-relative">
              {utilisateur?.avatar && !imageErrors[utilisateur.avatar] ? (
                <img src={buildImageUrl(utilisateur.avatar) || ''} alt={`${utilisateur.prenoms} ${utilisateur.nom}`}
                  className="rounded-circle border border-3 border-white shadow"
                  style={{ width: "70px", height: "70px", objectFit: "cover" }}
                  onError={() => utilisateur?.avatar && setImageErrors(prev => ({ ...prev, [utilisateur.avatar!]: true }))} />
              ) : (
                <div className="rounded-circle border border-3 border-white shadow bg-primary d-flex align-items-center justify-content-center" style={{ width: "70px", height: "70px" }}>
                  <FontAwesomeIcon icon={faUserCircle} className="text-white fs-1" />
                </div>
              )}
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: "18px", height: "18px" }}>
                <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: "8px" }} />
              </span>
            </div>
            <div className="flex-grow-1">
              <h1 className="h3 fw-bold text-white mb-0">Bienvenue, {utilisateur?.prenoms || "Utilisateur"} {utilisateur?.nom || ""} !</h1>
              <p className="text-white-50 mb-0 mt-1">
                <FontAwesomeIcon icon={faEnvelope} className="me-1" /> {utilisateur?.email || "Email non disponible"}
                {utilisateur?.telephone && <span className="ms-3"><FontAwesomeIcon icon={faPhone} className="me-1" /> {utilisateur.telephone}</span>}
              </p>
            </div>
            <button onClick={fetchDashboardData} className="btn btn-outline-light" disabled={loading}>
              <FontAwesomeIcon icon={faRefresh} spin={loading} className="me-2" /> Actualiser
            </button>
          </div>
        </div>
      </div>

      {hasAnyData ? (
        <>
          {/* Cartes de statistiques */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3"><StatCard title="Produits" value={stats.produits.total} icon={faBoxes} color="primary" /></div>
            <div className="col-6 col-md-3"><StatCard title="Valeur Produits" value={formatPrix(stats.produits.valeurTotale)} icon={faMoneyBillWave} color="success" /></div>
            <div className="col-6 col-md-3"><StatCard title="Dons" value={stats.dons.total} icon={faGift} color="info" /></div>
            <div className="col-6 col-md-3"><StatCard title="Échanges" value={stats.echanges.total} icon={faExchangeAlt} color="warning" /></div>
            <div className="col-6 col-md-3"><StatCard title="Favoris" value={stats.favoris.total} icon={faHeart} color="danger" /></div>
            <div className="col-6 col-md-3"><StatCard title="Produits Publiés" value={stats.produits.publies} icon={faCheckCircle} color="success" /></div>
            <div className="col-6 col-md-3"><StatCard title="Non Publiés" value={stats.produits.nonPublies + stats.dons.nonPublies + stats.echanges.nonPublies} icon={faClock} color="secondary" /></div>
            <div className="col-6 col-md-3"><StatCard title="Bloqués" value={stats.produits.bloques + stats.dons.bloques + stats.echanges.bloques} icon={faBan} color="danger" /></div>
          </div>

          {/* Navigation */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex flex-wrap gap-2">
                <button className={`btn ${activeSection === "produits" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => { setActiveSection("produits"); setActiveTab("tous"); setSearchTerm(""); }}>
                  <FontAwesomeIcon icon={faBox} className="me-1" /> Produits ({stats.produits.total})
                </button>
                <button className={`btn ${activeSection === "dons" ? "btn-success" : "btn-outline-success"}`} onClick={() => { setActiveSection("dons"); setActiveTab("tous"); setSearchTerm(""); }}>
                  <FontAwesomeIcon icon={faGift} className="me-1" /> Dons ({stats.dons.total})
                </button>
                <button className={`btn ${activeSection === "echanges" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => { setActiveSection("echanges"); setActiveTab("tous"); setSearchTerm(""); }}>
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-1" /> Échanges ({stats.echanges.total})
                </button>
                <button className={`btn ${activeSection === "favoris" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => { setActiveSection("favoris"); setActiveTab("tous"); setSearchTerm(""); }}>
                  <FontAwesomeIcon icon={faHeart} className="me-1" /> Favoris ({stats.favoris.total})
                </button>
              </div>
            </div>
          </div>

          {/* Onglets (sauf favoris) */}
          {activeSection !== "favoris" && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex flex-wrap gap-2">
                  <button className={`btn btn-sm ${activeTab === "tous" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setActiveTab("tous")}>
                    Tous ({activeSection === "produits" ? stats.produits.total : activeSection === "dons" ? stats.dons.total : stats.echanges.total})
                  </button>
                  <button className={`btn btn-sm ${activeTab === "publies" ? "btn-success" : "btn-outline-success"}`} onClick={() => setActiveTab("publies")}>
                    Publiés ({activeSection === "produits" ? stats.produits.publies : activeSection === "dons" ? stats.dons.publies : stats.echanges.publies})
                  </button>
                  <button className={`btn btn-sm ${activeTab === "bloques" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setActiveTab("bloques")}>
                    Bloqués ({activeSection === "produits" ? stats.produits.bloques : activeSection === "dons" ? stats.dons.bloques : stats.echanges.bloques})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recherche */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-2 p-md-3">
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><FontAwesomeIcon icon={faSearch} className="text-primary" /></span>
                    <input type="text" className="form-control border-start-0" placeholder={`Rechercher ${activeSection === "produits" ? "un produit" : activeSection === "dons" ? "un don" : activeSection === "echanges" ? "un échange" : "un favori"}...`}
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {searchTerm && <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}><FontAwesomeIcon icon={faTimes} /></button>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    {activeSection === "produits" && <Link href="/dashboard-utilisateur/mes-produits/nouveau" className="btn btn-primary"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau produit</Link>}
                    {activeSection === "dons" && <Link href="/dashboard-utilisateur/mes-dons/nouveau" className="btn btn-success"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau don</Link>}
                    {activeSection === "echanges" && <Link href="/dashboard-utilisateur/mes-echanges/nouveau" className="btn btn-warning"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouvel échange</Link>}
                    <button className="btn btn-outline-secondary" onClick={() => { setSearchTerm(""); }}>
                      <FontAwesomeIcon icon={faFilter} className="me-1" /> Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {filteredData.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-muted mb-3 fs-1" />
                  <h4 className="fw-bold mb-2">Aucun élément trouvé</h4>
                  <p className="text-muted">Aucun résultat ne correspond à votre recherche.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Nom</th>
                        <th style={{ width: "100px" }}>Prix</th>
                        <th style={{ width: "90px" }}>Statut</th>
                        <th style={{ width: "120px" }}>Catégorie</th>
                        <th style={{ width: "100px" }}>Date</th>
                        <th style={{ width: "80px" }} className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 10).map((item: any) => {
                        const display = getDisplayData(item);
                        return (
                          <tr key={display.uuid}>
                            <td>
                              <div style={{ width: "50px", height: "50px" }} className="rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                {display.image ? (
                                  <img src={buildImageUrl(display.image) || ''} alt={display.libelle} className="w-100 h-100 object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/50?text=${display.libelle?.charAt(0) || '?'}`; }} />
                                ) : <span className="fw-bold text-muted">{display.libelle?.charAt(0) || '?'}</span>}
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold">{display.libelle}</div>
                              <small className="text-muted">{display.description?.substring(0, 40)}</small>
                            </td>
                            <td><span className="fw-bold text-primary">{formatPrix(display.prix)}</span></td>
                            <td>
                              {display.estPublie ? (
                                <span className="badge bg-success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Publié</span>
                              ) : display.statut === "Bloqué" ? (
                                <span className="badge bg-danger"><FontAwesomeIcon icon={faBan} className="me-1" /> Bloqué</span>
                              ) : (
                                <span className="badge bg-warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Non publié</span>
                              )}
                            </td>
                            <td><span className="badge bg-info">{display.categorie}</span></td>
                            <td><small className="text-muted">{formatDate(display.date)}</small></td>
                            <td className="text-center">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewDetails(display)} title="Voir les détails">
                                <FontAwesomeIcon icon={faEye} className="me-1" /> Voir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faBoxOpen} className="text-muted mb-4 fs-1" />
          <h3 className="fw-bold mb-3">Bienvenue sur votre tableau de bord !</h3>
          <p className="text-muted mb-4">Vous n'avez pas encore créé d'annonces. Commencez dès maintenant !</p>
          {/* <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link href="/dashboard-utilisateur/mes-produits/nouveau" className="btn btn-primary btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un produit</Link>
            <Link href="/dashboard-utilisateur/mes-dons/nouveau" className="btn btn-success btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un don</Link>
            <Link href="/dashboard-utilisateur/mes-echanges/nouveau" className="btn btn-warning btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un échange</Link>
          </div> */}
        </div>
      )}

      <style jsx global>{`
        .hero-gradient { background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.1) !important; }
        .object-cover { object-fit: cover; }
      `}</style>
    </div>
  );
}