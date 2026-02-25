// app/(back-office)/dashboard-agent/annonces/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Annonces() {
  const router = useRouter();
  const [allData, setAllData] = useState<any[]>([]);
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
  const countNonPublie = useCallback((data: any[]) => {
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
  // FONCTION D'AFFICHAGE D'ALERTE FLASH POUR LES ÉLÉMENTS NON PUBLIÉS
  // ============================================
  const showNonPublieAlert = useCallback((data: any[]) => {
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

    // Filtrer ceux qui n'ont pas encore été signalés
    const newNonPublie = nonPublie.filter((item) => {
      const key = `${item.type}-${item.uuid}`;
      return !nonPublieAlertShown.current?.has(key);
    });

    if (newNonPublie.length === 0) return;

    // Mettre à jour le Set des alertes déjà montrées
    newNonPublie.forEach((item) => {
      const key = `${item.type}-${item.uuid}`;
      nonPublieAlertShown.current?.add(key);
    });

    // Grouper par type pour l'affichage
    const groupedByType = {
      produits: newNonPublie.filter((item) => item.type === "produit"),
      dons: newNonPublie.filter((item) => item.type === "don"),
      echanges: newNonPublie.filter((item) => item.type === "echange"),
    };

    // Afficher les alertes flash
    const totalCount = newNonPublie.length;

    // Alerte principale
    toast.info(
      <div style={{ padding: "8px" }}>
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "10px",
            fontSize: "1.1rem",
          }}
        >
          📋 {totalCount} annonce(s) en attente de publication
        </div>

        {groupedByType.produits.length > 0 && (
          <div
            style={{
              marginBottom: "8px",
              padding: "5px",
              background: "#f3f4f6",
              borderRadius: "6px",
            }}
          >
            <span style={{ color: "#10b981", fontWeight: "600" }}>
              📦 Produits: {groupedByType.produits.length}
            </span>
            <div
              style={{
                fontSize: "0.85rem",
                marginTop: "3px",
                color: "#4b5563",
              }}
            >
              {groupedByType.produits
                .slice(0, 3)
                .map((p) => p.libelle || p.nom)
                .join(", ")}
              {groupedByType.produits.length > 3 &&
                ` et ${groupedByType.produits.length - 3} autre(s)`}
            </div>
          </div>
        )}

        {groupedByType.dons.length > 0 && (
          <div
            style={{
              marginBottom: "8px",
              padding: "5px",
              background: "#f3f4f6",
              borderRadius: "6px",
            }}
          >
            <span style={{ color: "#8b5cf6", fontWeight: "600" }}>
              🎁 Dons: {groupedByType.dons.length}
            </span>
            <div
              style={{
                fontSize: "0.85rem",
                marginTop: "3px",
                color: "#4b5563",
              }}
            >
              {groupedByType.dons
                .slice(0, 3)
                .map((d) => d.nom || d.titre)
                .join(", ")}
              {groupedByType.dons.length > 3 &&
                ` et ${groupedByType.dons.length - 3} autre(s)`}
            </div>
          </div>
        )}

        {groupedByType.echanges.length > 0 && (
          <div
            style={{
              marginBottom: "8px",
              padding: "5px",
              background: "#f3f4f6",
              borderRadius: "6px",
            }}
          >
            <span style={{ color: "#f59e0b", fontWeight: "600" }}>
              🔄 Échanges: {groupedByType.echanges.length}
            </span>
            <div
              style={{
                fontSize: "0.85rem",
                marginTop: "3px",
                color: "#4b5563",
              }}
            >
              {groupedByType.echanges
                .slice(0, 3)
                .map((e) => e.nomElementEchange || e.objetPropose)
                .join(", ")}
              {groupedByType.echanges.length > 3 &&
                ` et ${groupedByType.echanges.length - 3} autre(s)`}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => {
              toast.dismiss();
              setSelectedStatus("en-attente");
              setTimeout(() => {
                const tableElement =
                  document.querySelector(".table-responsive");
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

    // Alertes individuelles pour chaque type
    if (groupedByType.produits.length > 0) {
      toast.success(
        <div>
          📦 {groupedByType.produits.length} nouveau(x) produit(s) en attente de
          validation
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    }

    if (groupedByType.dons.length > 0) {
      toast.success(
        <div>
          🎁 {groupedByType.dons.length} nouveau(x) don(s) en attente de
          validation
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    }

    if (groupedByType.echanges.length > 0) {
      toast.success(
        <div>
          🔄 {groupedByType.echanges.length} nouvel(le) échange(s) en attente de
          validation
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    }
  }, []);

  // ============================================
  // FONCTION D'AFFICHAGE D'ALERTE FLASH POUR NOUVELLE CRÉATION
  // ============================================
  const showCreationAlert = useCallback(
    (item: any, type: string) => {
      let title = "";
      let creatorName = "";
      let itemType = "";
      let itemIcon = "";
      let color = "";

      // Déterminer le titre et les informations selon le type
      if (type === "produit") {
        title = item.libelle || item.nom || "Produit sans nom";
        creatorName = item.vendeur
          ? `${item.vendeur.prenoms || ""} ${item.vendeur.nom || ""}`.trim()
          : item.nom_vendeur || "Vendeur";
        itemType = "Produit";
        itemIcon = "📦";
        color = "#10b981";
      } else if (type === "don") {
        title = item.nom || item.titre || "Don sans nom";
        creatorName = item.nom_donataire || item.createur_nom || "Donateur";
        itemType = "Don";
        itemIcon = "🎁";
        color = "#8b5cf6";
      } else if (type === "echange") {
        title =
          item.nomElementEchange ||
          item.objetPropose ||
          item.titre ||
          "Échange sans nom";
        creatorName = item.nom_initiateur || item.createur_nom || "Initiateur";
        itemType = "Échange";
        itemIcon = "🔄";
        color = "#f59e0b";
      }

      const isPublished = item.estPublie || false;
      const statusText = isPublished
        ? "✅ Publié"
        : "⏳ En attente de publication";
      const statusColor = isPublished ? "#10b981" : "#f59e0b";

      toast.info(
        <div style={{ padding: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                background: `${color}15`,
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{itemIcon}</span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "#1f2937",
                }}
              >
                Nouveau {itemType}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: statusColor,
                  fontWeight: "500",
                }}
              >
                {statusText}
              </div>
            </div>
          </div>

          <div
            style={{
              marginBottom: "8px",
              padding: "8px",
              background: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "8px" }}>👤 {creatorName}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              onClick={() => {
                toast.dismiss();
                if (item.uuid) {
                  let basePath = "/dashboard-agent/annonces";
                  switch (type) {
                    case "produit":
                      router.push(
                        isPublished
                          ? `${basePath}/produit/${item.uuid}`
                          : `${basePath}/produit/non-publie/${item.uuid}`,
                      );
                      break;
                    case "don":
                      router.push(
                        isPublished
                          ? `${basePath}/don/${item.uuid}`
                          : `${basePath}/don/non-publie/${item.uuid}`,
                      );
                      break;
                    case "echange":
                      router.push(
                        isPublished
                          ? `${basePath}/echange/${item.uuid}`
                          : `${basePath}/echange/${item.uuid}`,
                      );
                      break;
                  }
                }
              }}
              style={{
                background: color,
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              Voir l'annonce
            </button>
            <button
              onClick={() => toast.dismiss()}
              style={{
                background: "#f3f4f6",
                color: "#6b7280",
                border: "none",
                padding: "6px 12px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Fermer
            </button>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          style: {
            width: "400px",
            background: "white",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "12px",
            border: "none",
          },
        },
      );
    },
    [router],
  );

  // ============================================
  // FONCTION DE DÉTECTION DES NOUVEAUX ARTICLES
  // ============================================
  const detectNewItems = useCallback(
    (oldData: any[], newData: any[]) => {
      const oldIds = new Set(oldData.map((item) => item.uuid || item.id));
      const newItems = newData.filter(
        (item) => !oldIds.has(item.uuid || item.id),
      );

      if (newItems.length > 0) {
        console.log(`📢 ${newItems.length} nouvelle(s) annonce(s) détectée(s)`);

        // Compter les non publiés parmi les nouveaux
        const newNonPublie = newItems.filter((item) => !item.estPublie);
        if (newNonPublie.length > 0) {
          console.log(
            `📋 ${newNonPublie.length} nouvelle(s) annonce(s) non publiée(s)`,
          );
        }

        newItems.forEach((item) => {
          let type = "produit";

          // Déterminer le type
          if (item.type) {
            type = item.type;
          } else if (item.libelle) {
            type = "produit";
          } else if (
            item.nom &&
            !item.libelle &&
            !item.nomElementEchange &&
            !item.objetPropose
          ) {
            type = "don";
          } else if (
            item.nomElementEchange ||
            item.objetPropose ||
            item.typeEchange
          ) {
            type = "echange";
          }

          // Afficher l'alerte
          showCreationAlert(item, type);
        });
      }

      // Vérifier les éléments non publiés dans l'ensemble des données
      showNonPublieAlert(newData);
    },
    [showCreationAlert, showNonPublieAlert],
  );

  // ============================================
  // FONCTION POUR EXTRAIRE UN TABLEAU D'UNE RÉPONSE API
  // ============================================
  const extractArrayFromResponse = (response: any): any[] => {
    if (!response) return [];

    // Si c'est déjà un tableau
    if (Array.isArray(response)) {
      return response;
    }

    // Si la réponse a une propriété 'data' qui est un tableau
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    // Si la réponse a une propriété 'results' qui est un tableau
    if (response.results && Array.isArray(response.results)) {
      return response.results;
    }

    // Si la réponse a une propriété 'items' qui est un tableau
    if (response.items && Array.isArray(response.items)) {
      return response.items;
    }

    // Si la réponse a une propriété 'content' qui est un tableau
    if (response.content && Array.isArray(response.content)) {
      return response.content;
    }

    console.warn("Structure de réponse inattendue:", response);
    return [];
  };

  // ============================================
  // FONCTION DE CHARGEMENT DES DONNÉES - CORRIGÉE
  // ============================================
  const fetchAllData = useCallback(
    async (isInitial = false, force = false) => {
      try {
        setLoading(true);
        setError(null);

        // Sauvegarder les anciennes données pour détecter les nouveaux items
        const oldData = [...allData];

        // Charger les produits - avec extraction du tableau
        const produitsResponse = await api.get<any>(API_ENDPOINTS.PRODUCTS.ALL);
        const produits = extractArrayFromResponse(produitsResponse);
        console.log("Produits chargés:", produits.length);

        // Charger les dons
        const donsResponse = await api.get<any>(API_ENDPOINTS.DONS.LIST);
        const dons = extractArrayFromResponse(donsResponse);
        console.log("Dons chargés:", dons.length);

        // Charger les échanges
        const echangesResponse = await api.get<any>(
          API_ENDPOINTS.ECHANGES.LIST,
        );
        const echanges = extractArrayFromResponse(echangesResponse);
        console.log("Échanges chargés:", echanges.length);

        // Ajouter le type à chaque élément
        const produitsWithType = (produits || []).map((item: any) => ({
          ...item,
          type: "produit",
          uuid: item.uuid || `prod-${Date.now()}-${Math.random()}`,
        }));

        const donsWithType = (dons || []).map((item: any) => ({
          ...item,
          type: "don",
          uuid: item.uuid || `don-${Date.now()}-${Math.random()}`,
        }));

        const echangesWithType = (echanges || []).map((item: any) => ({
          ...item,
          type: "echange",
          uuid: item.uuid || `ech-${Date.now()}-${Math.random()}`,
        }));

        // Combiner toutes les données
        const combinedData = [
          ...produitsWithType,
          ...donsWithType,
          ...echangesWithType,
        ];

        console.log("Total combiné:", combinedData.length);

        // Détecter les nouveaux items (sauf au chargement initial)
        if (!isInitial && oldData.length > 0) {
          detectNewItems(oldData, combinedData);
        } else if (isInitial) {
          // Au chargement initial, afficher seulement les non publiés existants
          const nonPublieCount = countNonPublie(combinedData);
          if (nonPublieCount.total > 0) {
            showNonPublieAlert(combinedData);
          }
        }

        setAllData(combinedData);
        setLastFetchTime(new Date());
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          err.message ||
            "Une erreur est survenue lors du chargement des données",
        );
        setAllData([]);
      } finally {
        setLoading(false);
      }
    },
    [allData, detectNewItems, countNonPublie, showNonPublieAlert],
  );

  // Écouter l'événement de nouvelle annonce
  useEffect(() => {
    const handleNewAnnonce = (event: CustomEvent) => {
      console.log("📢 Événement de nouvelle annonce reçu", event.detail);

      // Récupérer les données de l'annonce si disponibles
      const annonceData = event.detail;

      // Rafraîchir les données immédiatement
      fetchAllData(false, true);

      // Si les données de l'annonce sont fournies, on peut directement afficher l'alerte
      if (annonceData && annonceData.item) {
        const type = annonceData.type || "produit";
        showCreationAlert(annonceData.item, type);
      }
    };

    // @ts-ignore
    window.addEventListener("annonce-created", handleNewAnnonce);

    return () => {
      // @ts-ignore
      window.removeEventListener("annonce-created", handleNewAnnonce);
    };
  }, [fetchAllData, showCreationAlert]);

  // Chargement initial
  useEffect(() => {
    fetchAllData(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling pour détecter les nouveaux items toutes les 30 secondes
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

  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    if (!allData.length) return [];

    let filtered = allData;

    // Filtre par type
    if (selectedType !== "tous") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Filtre par statut
    if (selectedStatus !== "tous") {
      filtered = filtered.filter((item) => {
        let itemStatus = "";

        if (item.type === "produit") {
          itemStatus = item.disponible ? "disponible" : "en-attente";
          if (item.estPublie) itemStatus = "publie";
          if (item.statut) itemStatus = item.statut.toLowerCase();
        } else if (item.type === "don") {
          itemStatus = item.statut?.toLowerCase() || "en-attente";
        } else if (item.type === "echange") {
          itemStatus = item.statut?.toLowerCase() || "en-attente";
        }

        // Normaliser les statuts
        if (itemStatus === "en_attente") itemStatus = "en-attente";

        return itemStatus === selectedStatus;
      });
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title =
          item.nom ||
          item.libelle ||
          item.nomElementEchange ||
          item.titre ||
          "";
        const description = item.description || "";
        const sellerName =
          item.vendeur?.nom || item.nom_donataire || item.nom_initiateur || "";

        return (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          sellerName.toLowerCase().includes(query)
        );
      });
    }

    // ✅ TRI PAR DATE (du plus récent au plus ancien) - CORRIGÉ
    const sorted = [...filtered].sort((a, b) => {
      // Déterminer la date de chaque élément de manière robuste
      const getDate = (item: any): number => {
        // Pour les produits, essayer toutes les sources possibles
        if (item.type === "produit") {
          // Priorité: createdAt, updatedAt, ou date par défaut
          const dateStr =
            item.createdAt ||
            item.updatedAt ||
            item.date_debut ||
            item.dateProposition;
          if (dateStr) {
            const date = new Date(dateStr).getTime();
            return isNaN(date) ? 0 : date;
          }
          return 0;
        }
        // Pour les dons
        else if (item.type === "don") {
          const dateStr = item.date_debut || item.createdAt || item.updatedAt;
          if (dateStr) {
            const date = new Date(dateStr).getTime();
            return isNaN(date) ? 0 : date;
          }
          return 0;
        }
        // Pour les échanges
        else if (item.type === "echange") {
          const dateStr =
            item.dateProposition || item.createdAt || item.updatedAt;
          if (dateStr) {
            const date = new Date(dateStr).getTime();
            return isNaN(date) ? 0 : date;
          }
          return 0;
        }

        // Fallback: essayer createdAt ou updatedAt pour tous les types
        const fallbackDate = item.createdAt || item.updatedAt;
        if (fallbackDate) {
          const date = new Date(fallbackDate).getTime();
          return isNaN(date) ? 0 : date;
        }

        return 0;
      };

      const dateA = getDate(a);
      const dateB = getDate(b);

      // Trier du plus récent (date la plus grande) au plus ancien (date la plus petite)
      return dateB - dateA;
    });

    return sorted;
  }, [allData, selectedType, selectedStatus, searchQuery]);

  // Préparer les données pour le DataTable (sans la colonne vendeur)
  const preparedData = useMemo(() => {
    return filteredAndSortedData.map((item) => {
      let title = "";
      let description = "";
      let image = "";
      let status = "";
      let date = new Date().toISOString();

      if (item.type === "produit") {
        title = item.libelle || "Produit sans nom";
        description = item.description || "";
        status =
          item.statut?.toLowerCase() ||
          (item.estPublie ? "publie" : "en-attente");
        date = item.createdAt || item.updatedAt || new Date().toISOString();

        // Construction correcte de l'URL de l'image
        if (item.image && item.image.startsWith("/")) {
          image = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
        } else if (item.image) {
          image = item.image;
        } else {
          image = `https://via.placeholder.com/64?text=P`;
        }
      } else if (item.type === "don") {
        title = item.nom || "Don sans nom";
        description = item.description || "";
        status = item.statut?.toLowerCase() || "en-attente";
        date = item.date_debut || new Date().toISOString();

        if (item.image && item.image.startsWith("/")) {
          image = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
        } else if (item.image) {
          image = item.image;
        } else {
          image = `https://via.placeholder.com/64?text=D`;
        }
      } else if (item.type === "echange") {
        title =
          item.nomElementEchange ||
          `${item.objetPropose || ""} vs ${item.objetDemande || ""}`.trim() ||
          "Échange sans nom";
        description = item.description || "";
        status = item.statut?.toLowerCase() || "en-attente";
        date = item.dateProposition || new Date().toISOString();

        if (item.image && item.image.startsWith("/")) {
          image = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
        } else if (item.image) {
          image = item.image;
        } else {
          image = `https://via.placeholder.com/64?text=E`;
        }
      }

      return {
        id: item.id?.toString() || item.uuid,
        uuid: item.uuid,
        title,
        description,
        image,
        status,
        type: item.type,
        date,
        category: item.categorie_uuid || item.categorieUuid,
        quantite: item.quantite,
        prix: item.prix,
        estPublie: item.estPublie || false,
        estBloque: item.estBloque || item.est_bloque || false,
        originalData: item,
      };
    });
  }, [filteredAndSortedData]);

  const handleValidate = useCallback(
    async (id: string, type: string) => {
      try {
        console.log("Validation:", id, type);

        let endpoint = "";
        let data = { uuid: id };

        switch (type) {
          case "produit":
            endpoint = API_ENDPOINTS.PRODUCTS.PUBLLIER;
            break;
          case "don":
            endpoint = API_ENDPOINTS.DONS.PUBLISH;
            break;
          case "echange":
            endpoint = API_ENDPOINTS.ECHANGES.PUBLISH;
            break;
        }

        if (endpoint) {
          await api.post(endpoint, data);

          // Afficher une alerte de succès
          toast.success("✅ Annonce validée avec succès", {
            position: "top-right",
            autoClose: 3000,
          });

          // Rafraîchir les données
          await fetchAllData(false);
        }
      } catch (err) {
        console.error("Erreur lors de la validation:", err);
        toast.error("❌ Impossible de valider l'annonce", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    },
    [fetchAllData],
  );

  const handleReject = useCallback(
    async (id: string, type: string) => {
      try {
        console.log("Rejet:", id, type);

        let endpoint = "";

        switch (type) {
          case "produit":
            endpoint = API_ENDPOINTS.PRODUCTS.DELETE(id);
            break;
          case "don":
            endpoint = API_ENDPOINTS.DONS.DELETE(id);
            break;
          case "echange":
            endpoint = API_ENDPOINTS.ECHANGES.DELETE(id);
            break;
        }

        if (endpoint) {
          await api.delete(endpoint);

          // Afficher une alerte
          toast.info("🗑️ Annonce rejetée", {
            position: "top-right",
            autoClose: 3000,
          });

          // Rafraîchir les données
          await fetchAllData(false);
        }
      } catch (err) {
        console.error("Erreur lors du rejet:", err);
        toast.error("❌ Impossible de rejeter l'annonce", {
          position: "top-right",
          autoClose: 3000,
        });
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
    toast.info("🔄 Filtres réinitialisés", {
      position: "top-right",
      autoClose: 2000,
    });
  }, []);

  // ============================================
  // BOUTON POUR AFFICHER LES ANNONCES NON PUBLIÉES
  // ============================================
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
                Gérez et modérez toutes les annonces (produits, dons et
                échanges) en un seul endroit
              </p>
            </div>

            {/* Bouton pour les annonces non publiées */}
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

            {/* Badges pour les non publiés */}
            {nonPublieCount.total > 0 && (
              <div className="d-flex gap-2">
                {nonPublieCount.produits > 0 && (
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                    📦 Produits: {nonPublieCount.produits}
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

        {/* Barre de filtres */}
        <div className="mb-4">
          <FilterBar
            onStatusChange={setSelectedStatus}
            onContentTypeChange={setSelectedType}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            selectedContentType={selectedType}
          />
        </div>

        {/* Informations sur les filtres */}
        {!loading && !error && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted small">
              {preparedData.length} annonce(s) trouvée(s)
              {searchQuery && ` pour "${searchQuery}"`}
              {selectedType !== "tous" && (
                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  Type: {selectedType}
                </span>
              )}
              {selectedStatus !== "tous" && (
                <span className="ms-2 badge bg-info bg-opacity-10 text-info px-3 py-2">
                  Statut: {selectedStatus}
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

        {/* Tableau de données */}
        <div className="mb-4">
          {selectedType === "tous" ? (
            // Si "tous" est sélectionné, afficher un DataTable pour chaque type
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-0">
                    <div className="p-3 bg-primary bg-opacity-10 border-bottom">
                      <h5 className="card-title mb-0 d-flex align-items-center">
                        <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
                        Toutes les annonces
                        {nonPublieCount.total > 0 &&
                          selectedStatus === "tous" && (
                            <span className="badge bg-warning ms-3 px-3 py-2">
                              ⏳ {nonPublieCount.total} en attente
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
                      hideVendeurColumn={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Si un type spécifique est sélectionné, utiliser le DataTable avec ce type
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <DataTable
                  contentType={selectedType as "produit" | "don" | "echange"}
                  statusFilter={selectedStatus}
                  searchQuery={searchQuery}
                  onValidate={handleValidate}
                  onReject={handleReject}
                  onView={handleView}
                  data={preparedData}
                  loading={loading}
                  hideVendeurColumn={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Message si pas de données */}
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
              {searchQuery ||
              selectedStatus !== "tous" ||
              selectedType !== "tous"
                ? "Aucune annonce ne correspond à vos critères de recherche."
                : "Aucune annonce disponible pour le moment."}
            </p>
            {(searchQuery ||
              selectedStatus !== "tous" ||
              selectedType !== "tous") && (
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

        {/* Styles supplémentaires */}
        <style jsx>{`
          .bg-purple {
            background-color: #8b5cf6 !important;
          }
          .bg-opacity-10 {
            opacity: 0.1;
          }
          .text-purple {
            color: #8b5cf6 !important;
          }
        `}</style>
      </main>
    </>
  );
}
