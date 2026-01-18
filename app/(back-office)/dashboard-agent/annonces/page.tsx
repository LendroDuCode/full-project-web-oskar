// app/annonces/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";

export default function Annonces() {
  const [allData, setAllData] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("tous");
  const [selectedStatus, setSelectedStatus] = useState<string>("tous");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger TOUTES les données une seule fois
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les produits
      const produits = await api.get<any[]>(API_ENDPOINTS.PRODUCTS.ALL);

      // Charger les dons
      const dons = await api.get<any[]>(API_ENDPOINTS.DONS.LIST);

      // Charger les échanges
      const echanges = await api.get<any[]>(API_ENDPOINTS.ECHANGES.LIST);

      // Ajouter le type à chaque élément
      const produitsWithType = produits.map((item) => ({
        ...item,
        type: "produit",
        uuid: item.uuid || Math.random().toString(),
      }));

      const donsWithType = dons.map((item) => ({
        ...item,
        type: "don",
        uuid: item.uuid || Math.random().toString(),
      }));

      const echangesWithType = echanges.map((item) => ({
        ...item,
        type: "echange",
        uuid: item.uuid || Math.random().toString(),
      }));

      // Combiner toutes les données
      const combinedData = [
        ...produitsWithType,
        ...donsWithType,
        ...echangesWithType,
      ];

      setAllData(combinedData);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError(
        err.message || "Une erreur est survenue lors du chargement des données",
      );
      setAllData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filtrer les données en fonction des sélections
  const filteredData = useMemo(() => {
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

    return filtered;
  }, [allData, selectedType, selectedStatus, searchQuery]);

  // Préparer les données pour le DataTable
  const preparedData = useMemo(() => {
    return filteredData.map((item) => {
      let title = "";
      let description = "";
      let image = "";
      let status = "";
      let sellerName = "Inconnu";
      let sellerIsPro = false;
      let date = new Date().toISOString();

      if (item.type === "produit") {
        title = item.libelle || "Produit sans nom";
        description = item.description || "";
        status =
          item.statut?.toLowerCase() ||
          (item.estPublie ? "publie" : "en-attente");
        sellerName = item.vendeur
          ? `${item.vendeur.nom || ""} ${item.vendeur.prenoms || ""}`.trim()
          : "Vendeur";
        sellerIsPro = !!item.boutique?.nom;
        date = item.createdAt || item.updatedAt || new Date().toISOString();

        // Construction correcte de l'URL de l'image
        if (item.image && item.image.startsWith("/")) {
          image = `http://localhost:3005${item.image}`;
        } else if (item.image) {
          image = item.image;
        } else {
          image = `https://via.placeholder.com/64?text=P`;
        }
      } else if (item.type === "don") {
        title = item.nom || "Don sans nom";
        description = item.description || "";
        status = item.statut?.toLowerCase() || "en-attente";
        sellerName = item.nom_donataire || "Donateur";
        date = item.date_debut || new Date().toISOString();

        if (item.image && item.image.startsWith("/")) {
          image = `http://localhost:3005${item.image}`;
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
        sellerName = item.nom_initiateur || "Initié par";
        date = item.dateProposition || new Date().toISOString();

        if (item.image && item.image.startsWith("/")) {
          image = `http://localhost:3005${item.image}`;
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
        seller: {
          name: sellerName,
          avatar: item.vendeur?.avatar,
          isPro: sellerIsPro,
        },
        category: item.categorie_uuid || item.categorieUuid,
        quantite: item.quantite,
        prix: item.prix,
      };
    });
  }, [filteredData]);

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
          // Rafraîchir les données
          await fetchAllData();
        }
      } catch (err) {
        console.error("Erreur lors de la validation:", err);
        alert("Erreur lors de la validation. Veuillez réessayer.");
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
          // Rafraîchir les données
          await fetchAllData();
        }
      } catch (err) {
        console.error("Erreur lors du rejet:", err);
        alert("Erreur lors du rejet. Veuillez réessayer.");
      }
    },
    [fetchAllData],
  );

  const handleView = useCallback((id: string, type: string) => {
    console.log("Voir détails:", id, type);
    // router.push(`/dashboard/annonces/${type}/${id}`);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedType("tous");
    setSelectedStatus("tous");
    setSearchQuery("");
  }, []);

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-2">Gestion des Annonces</h1>
        <p className="text-muted mb-4">
          Gérez et modérez toutes les annonces (produits, dons et échanges) en
          un seul endroit
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <strong>Erreur:</strong> {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchAllData}
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
              <span className="ms-2">(type: {selectedType})</span>
            )}
            {selectedStatus !== "tous" && (
              <span className="ms-2">(statut: {selectedStatus})</span>
            )}
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={fetchAllData}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Rafraîchir"}
            </button>
            <button
              className="btn btn-sm btn-outline-warning"
              onClick={handleResetFilters}
              disabled={loading}
            >
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
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Toutes les annonces</h5>
                  <DataTable
                    data={preparedData}
                    loading={loading}
                    onValidate={handleValidate}
                    onReject={handleReject}
                    onView={handleView}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Si un type spécifique est sélectionné, utiliser le DataTable avec ce type
          <DataTable
            contentType={selectedType as "produit" | "don" | "echange"}
            statusFilter={selectedStatus}
            searchQuery={searchQuery}
            onValidate={handleValidate}
            onReject={handleReject}
            onView={handleView}
            data={preparedData}
            loading={loading}
          />
        )}
      </div>

      {/* Message si pas de données */}
      {!loading && !error && preparedData.length === 0 && (
        <div className="text-center py-5">
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
          <h5 className="fw-semibold text-dark mb-2">Aucune annonce trouvée</h5>
          <p className="text-muted mb-3">
            {searchQuery || selectedStatus !== "tous" || selectedType !== "tous"
              ? "Aucune annonce ne correspond à vos critères de recherche."
              : "Aucune annonce disponible pour le moment."}
          </p>
          {searchQuery ||
          selectedStatus !== "tous" ||
          selectedType !== "tous" ? (
            <button className="btn btn-primary" onClick={handleResetFilters}>
              Afficher toutes les annonces
            </button>
          ) : null}
        </div>
      )}
    </main>
  );
}
