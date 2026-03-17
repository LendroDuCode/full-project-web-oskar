"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { annonceService, Annonce } from "./services/annonce.service";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Annonces() {
  const router = useRouter();
  const [allData, setAllData] = useState<Annonce[]>([]);
  const [selectedType, setSelectedType] = useState<string>("tous");
  const [selectedStatus, setSelectedStatus] = useState<string>("tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const nonPublieAlertShown = useRef<Set<string>>(new Set());

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // FONCTION DE COMPTAGE DES ÉLÉMENTS NON PUBLIÉS
  // ============================================
  const countNonPublie = useCallback((data: Annonce[]) => {
    const nonPublie = data.filter(
      (item) =>
        !item.estPublie &&
        !item.estBloque &&
        item.statut !== "rejeté" &&
        item.statut !== "refuse",
    );

    const produits = nonPublie.filter((item) => item.type === "produit").length;
    const dons = nonPublie.filter((item) => item.type === "don").length;
    const echanges = nonPublie.filter((item) => item.type === "echange").length;

    return {
      total: nonPublie.length,
      produits,
      dons,
      echanges,
      items: nonPublie,
    };
  }, []);

  // ============================================
  // FONCTION D'AFFICHAGE D'ALERTE FLASH
  // ============================================
  const showNonPublieAlert = useCallback((data: Annonce[]) => {
    const nonPublie = data.filter(
      (item) =>
        !item.estPublie &&
        !item.estBloque &&
        item.statut !== "rejeté" &&
        item.statut !== "refuse",
    );

    if (nonPublie.length === 0) return;

    if (!nonPublieAlertShown.current) {
      nonPublieAlertShown.current = new Set();
    }

    const newNonPublie = nonPublie.filter((item) => {
      const key = `${item.type}-${item.uuid}`;
      return !nonPublieAlertShown.current?.has(key);
    });

    if (newNonPublie.length === 0) return;

    newNonPublie.forEach((item) => {
      const key = `${item.type}-${item.uuid}`;
      nonPublieAlertShown.current?.add(key);
    });

    const groupedByType = {
      produits: newNonPublie.filter((item) => item.type === "produit"),
      dons: newNonPublie.filter((item) => item.type === "don"),
      echanges: newNonPublie.filter((item) => item.type === "echange"),
    };

    const totalCount = newNonPublie.length;

    toast.info(
      <div style={{ padding: "8px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.1rem" }}>
          📢 {totalCount} annonce(s) en attente de publication
        </div>

        {groupedByType.produits.length > 0 && (
          <div style={{ marginBottom: "8px", padding: "5px", background: "#f3f4f6", borderRadius: "6px" }}>
            <span style={{ color: "#10b981", fontWeight: "600" }}>
              🏷️ Produits: {groupedByType.produits.length}
            </span>
          </div>
        )}

        {groupedByType.dons.length > 0 && (
          <div style={{ marginBottom: "8px", padding: "5px", background: "#f3f4f6", borderRadius: "6px" }}>
            <span style={{ color: "#8b5cf6", fontWeight: "600" }}>
              🎁 Dons: {groupedByType.dons.length}
            </span>
          </div>
        )}

        {groupedByType.echanges.length > 0 && (
          <div style={{ marginBottom: "8px", padding: "5px", background: "#f3f4f6", borderRadius: "6px" }}>
            <span style={{ color: "#f59e0b", fontWeight: "600" }}>
              🔄 Échanges: {groupedByType.echanges.length}
            </span>
          </div>
        )}

        <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              toast.dismiss();
              setSelectedStatus("en-attente");
              setTimeout(() => {
                const tableElement = document.querySelector(".table-responsive");
                if (tableElement) {
                  tableElement.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            }}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            Voir toutes les annonces en attente
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "450px",
          background: "white",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "12px",
          border: "none",
        },
      },
    );
  }, []);

  // ============================================
  // FONCTION DE CHARGEMENT DES DONNÉES - OPTIMISÉE
  // ============================================
  const fetchAllData = useCallback(
    async (isInitial = false) => {
      try {
        setLoading(true);
        setError(null);

        const oldData = [...allData];

        // Utiliser le service pour charger les données selon les filtres
        let combinedData: Annonce[] = [];

        if (selectedType === "tous") {
          // Charger tous les types
          const [produits, dons, echanges] = await Promise.all([
            annonceService.loadProduitsByStatus(selectedStatus as any),
            annonceService.loadDonsByStatus(selectedStatus as any),
            annonceService.loadEchangesByStatus(selectedStatus as any),
          ]);

          combinedData = [
            ...produits.map(p => ({ ...p, type: "produit" as const })),
            ...dons.map(d => ({ ...d, type: "don" as const })),
            ...echanges.map(e => ({ ...e, type: "echange" as const })),
          ];
        } else {
          // Charger un type spécifique
          const data = await annonceService.loadByTypeAndStatus(
            selectedType as any,
            selectedStatus as any
          );
          combinedData = data.map(item => ({
            ...item,
            type: selectedType as any,
          }));
        }

        console.log("Total combiné:", combinedData.length);

        // Détection des nouveaux items (sauf au chargement initial)
        if (!isInitial && oldData.length > 0) {
          const oldIds = new Set(oldData.map((item) => item.uuid));
          const newItems = combinedData.filter(
            (item) => !oldIds.has(item.uuid)
          );

          if (newItems.length > 0) {
            console.log(`📢 ${newItems.length} nouvelle(s) annonce(s) détectée(s)`);
          }
        } else if (isInitial) {
          const nonPublieCount = countNonPublie(combinedData);
          if (nonPublieCount.total > 0) {
            showNonPublieAlert(combinedData);
          }
        }

        setAllData(combinedData);
        setLastFetchTime(new Date());
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des données");
        setAllData([]);
      } finally {
        setLoading(false);
      }
    },
    [allData, selectedType, selectedStatus, countNonPublie, showNonPublieAlert],
  );

  // Chargement initial et quand les filtres changent
  useEffect(() => {
    fetchAllData(true);
  }, [selectedType, selectedStatus]); // Recharger quand les filtres changent

  // Polling pour détecter les nouveaux items
  useEffect(() => {
    pollingInterval.current = setInterval(() => {
      fetchAllData(false);
    }, 30000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [fetchAllData]);

  // Filtrer et trier les données (recherche uniquement, car le reste est déjà filtré par API)
  const filteredAndSortedData = useMemo(() => {
    let filtered = allData;

    // Filtre par recherche uniquement
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title =
          item.nom ||
          item.libelle ||
          (item as any).nomElementEchange ||
          item.titre ||
          "";
        const description = item.description || "";

        return (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query)
        );
      });
    }

    // Tri par date
    return [...filtered].sort((a, b) => {
      const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
      const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
      return dateB - dateA;
    });
  }, [allData, searchQuery]);

  // FONCTION POUR OBTENIR L'URL DE L'IMAGE
  const getItemImageUrl = useCallback((item: Annonce): string => {
    if (!item) return `https://via.placeholder.com/64?text=?`;
    
    let imagePath = item.image || item.image_key;
    
    if (imagePath) {
      const url = buildImageUrl(imagePath);
      if (url) return url;
    }
    
    // Fallback par type
    if (item.type === "produit") {
      return `https://via.placeholder.com/64/10b981/ffffff?text=P`;
    } else if (item.type === "don") {
      return `https://via.placeholder.com/64/8b5cf6/ffffff?text=D`;
    } else if (item.type === "echange") {
      return `https://via.placeholder.com/64/f59e0b/ffffff?text=E`;
    }
    
    return `https://via.placeholder.com/64/6c757d/ffffff?text=?`;
  }, []);

  // Préparer les données pour le DataTable
  const preparedData = useMemo(() => {
    return filteredAndSortedData.map((item) => {
      let title = "";
      let description = "";
      let date = new Date().toISOString();

      if (item.type === "produit") {
        title = item.libelle || "Produit sans nom";
        description = item.description || "";
        date = item.dateCreation || new Date().toISOString();
      } else if (item.type === "don") {
        title = item.nom || "Don sans nom";
        description = item.description || "";
        date = item.dateCreation || new Date().toISOString();
      } else if (item.type === "echange") {
        title =
          (item as any).nomElementEchange ||
          `${(item as any).objetPropose || ""} vs ${(item as any).objetDemande || ""}`.trim() ||
          "Échange sans nom";
        description = item.description || "";
        date = item.dateCreation || new Date().toISOString();
      }

      const image = getItemImageUrl(item);

      return {
        id: item.id?.toString() || item.uuid,
        uuid: item.uuid,
        title,
        description,
        image,
        status: item.statut?.toLowerCase() || (item.estPublie ? "publie" : "en-attente"),
        type: item.type,
        date,
        category: item.categorie_uuid,
        quantite: item.quantite,
        prix: item.prix?.toString(),
        estPublie: item.estPublie || false,
        estBloque: item.estBloque || false,
        originalData: item,
      };
    });
  }, [filteredAndSortedData, getItemImageUrl]);

  const handleValidate = useCallback(
    async (id: string, type: string) => {
      try {
        await annonceService.validerAnnonce(id, type);
        await fetchAllData(false);
        toast.success("✅ Annonce validée avec succès");
      } catch (err: any) {
        console.error("Erreur lors de la validation:", err);
        toast.error(`❌ ${err.message || "Impossible de valider l'annonce"}`);
      }
    },
    [fetchAllData],
  );

  const handleReject = useCallback(
    async (id: string, type: string) => {
      try {
        await annonceService.rejeterAnnonce(id, type);
        await fetchAllData(false);
        toast.info("❌ Annonce rejetée");
      } catch (err: any) {
        console.error("Erreur lors du rejet:", err);
        toast.error(`❌ ${err.message || "Impossible de rejeter l'annonce"}`);
      }
    },
    [fetchAllData],
  );

  const handlePublish = useCallback(
    async (id: string, type: string, estPublie: boolean) => {
      try {
        await annonceService.publierAnnonce(id, type, estPublie);
        await fetchAllData(false);
        toast.success(estPublie ? "📢 Annonce publiée" : "🔇 Annonce dépubliée");
      } catch (err: any) {
        console.error("Erreur lors de la publication:", err);
        toast.error(`❌ ${err.message || "Impossible de modifier la publication"}`);
      }
    },
    [fetchAllData],
  );

  const handleBlock = useCallback(
    async (id: string, type: string, estBloque: boolean) => {
      try {
        await annonceService.bloquerAnnonce(id, type, estBloque);
        await fetchAllData(false);
        toast.success(estBloque ? "🔒 Annonce bloquée" : "🔓 Annonce débloquée");
      } catch (err: any) {
        console.error("Erreur lors du blocage:", err);
        toast.error(`❌ ${err.message || "Impossible de modifier le blocage"}`);
      }
    },
    [fetchAllData],
  );

  const handleDelete = useCallback(
    async (id: string, type: string) => {
      try {
        await annonceService.supprimerAnnonce(id, type);
        await fetchAllData(false);
        toast.error("🗑️ Annonce supprimée définitivement");
      } catch (err: any) {
        console.error("Erreur lors de la suppression:", err);
        toast.error(`❌ ${err.message || "Impossible de supprimer l'annonce"}`);
      }
    },
    [fetchAllData],
  );

  const handleView = useCallback(
    (id: string, type: string) => {
      router.push(`/dashboard-agent/annonces/${type}/${id}`);
    },
    [router],
  );

  const handleResetFilters = useCallback(() => {
    setSelectedType("tous");
    setSelectedStatus("tous");
    setSearchQuery("");
    toast.info("🔄 Filtres réinitialisés");
  }, []);

  const handleShowNonPublie = useCallback(() => {
    setSelectedStatus("en-attente");
    setTimeout(() => {
      const tableElement = document.querySelector(".table-responsive");
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  const nonPublieCount = useMemo(
    () => countNonPublie(allData),
    [allData, countNonPublie],
  );

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
      />

      <main className="p-4 bg-light min-vh-100">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h2 fw-bold mb-2">Gestion des Annonces</h1>
              <p className="text-muted mb-4">
                Gérez et modérez toutes les annonces (produits, dons et échanges)
              </p>
            </div>

            {nonPublieCount.total > 0 && (
              <button
                className="btn btn-warning btn-lg position-relative"
                onClick={handleShowNonPublie}
                style={{ borderRadius: "50px", padding: "12px 24px" }}
              >
                <i className="bi bi-bell-fill me-2"></i>
                {nonPublieCount.total} annonce(s) en attente
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {nonPublieCount.total}
                </span>
              </button>
            )}
          </div>

          <div className="d-flex gap-3 mt-3">
            <small className="text-success d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill text-success"></i>
              Dernière mise à jour: {lastFetchTime.toLocaleTimeString()}
            </small>

            {nonPublieCount.total > 0 && (
              <div className="d-flex gap-2">
                {nonPublieCount.produits > 0 && (
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                    🏷️ Produits: {nonPublieCount.produits}
                  </span>
                )}
                {nonPublieCount.dons > 0 && (
                  <span className="badge bg-purple bg-opacity-10 text-purple px-3 py-2">
                    🎁 Dons: {nonPublieCount.dons}
                  </span>
                )}
                {nonPublieCount.echanges > 0 && (
                  <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2">
                    🔄 Échanges: {nonPublieCount.echanges}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4 d-flex align-items-center justify-content-between">
            <div>
              <strong>Erreur:</strong> {error}
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => fetchAllData(false)}
            >
              Réessayer
            </button>
          </div>
        )}

        <div className="mb-4">
          <FilterBar
            onStatusChange={setSelectedStatus}
            onContentTypeChange={setSelectedType}
            onSearchChange={setSearchQuery}
            onRefresh={() => fetchAllData(false)}
            onReset={handleResetFilters}
            selectedStatus={selectedStatus}
            selectedContentType={selectedType}
            loading={loading}
            totalItems={preparedData.length}
          />
        </div>

        {!loading && !error && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted small">
              {preparedData.length} annonce(s) trouvée(s)
              {searchQuery && ` pour "${searchQuery}"`}
              {selectedType !== "tous" && (
                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  Type: {selectedType === "produit" ? "Produit" : selectedType === "don" ? "Don" : "Échange"}
                </span>
              )}
              {selectedStatus !== "tous" && (
                <span className="ms-2 badge bg-info bg-opacity-10 text-info px-3 py-2">
                  Statut: {selectedStatus === "publie" ? "Publié" : 
                           selectedStatus === "en-attente" ? "En attente" : 
                           selectedStatus === "bloque" ? "Bloqué" : selectedStatus}
                </span>
              )}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                onClick={() => fetchAllData(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Rafraîchir
                  </>
                )}
              </button>
              <button
                className="btn btn-sm btn-outline-warning d-flex align-items-center"
                onClick={handleResetFilters}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="p-3 bg-primary bg-opacity-10 border-bottom">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                  {selectedType === "tous" ? "Toutes les annonces" : 
                   selectedType === "produit" ? "Produits" :
                   selectedType === "don" ? "Dons" : "Échanges"}
                  {selectedStatus !== "tous" && (
                    <span className="badge ms-3 px-3 py-2" style={{
                      backgroundColor: selectedStatus === "publie" ? "#10b98120" :
                                     selectedStatus === "en-attente" ? "#f59e0b20" :
                                     selectedStatus === "bloque" ? "#ef444420" : "#6b728020",
                      color: selectedStatus === "publie" ? "#10b981" :
                             selectedStatus === "en-attente" ? "#f59e0b" :
                             selectedStatus === "bloque" ? "#ef4444" : "#6b7280",
                    }}>
                      {selectedStatus === "publie" ? "📢 Publié" :
                       selectedStatus === "en-attente" ? "⏳ En attente" :
                       selectedStatus === "bloque" ? "🔒 Bloqué" : selectedStatus}
                    </span>
                  )}
                </h5>
              </div>
              <DataTable
                data={preparedData}
                loading={loading}
                onValidate={handleValidate}
                onReject={handleReject}
                onView={handleView}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onBlock={handleBlock}
                hideVendeurColumn={true}
                onDataChange={() => fetchAllData(false)}
              />
            </div>
          </div>
        </div>

        {!loading && !error && preparedData.length === 0 && (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm">
            <div className="mb-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                  fontSize: "2rem",
                  border: "2px solid #dee2e6",
                }}
              >
                <i className="bi bi-search"></i>
              </div>
            </div>
            <h5 className="fw-semibold text-dark mb-2">
              Aucune annonce trouvée
            </h5>
            <p className="text-muted mb-3">
              {searchQuery || selectedStatus !== "tous" || selectedType !== "tous"
                ? "Aucune annonce ne correspond à vos critères."
                : "Aucune annonce disponible pour le moment."}
            </p>
            {(searchQuery || selectedStatus !== "tous" || selectedType !== "tous") && (
              <button
                className="btn btn-primary px-4 py-2"
                onClick={handleResetFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Afficher toutes les annonces
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}