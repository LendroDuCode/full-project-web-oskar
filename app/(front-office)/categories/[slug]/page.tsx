// app/(front-office)/categories/[slug]/page.tsx
import { notFound } from "next/navigation";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import colors from "@/app/shared/constants/colors";
import FiltersSidebar from "../../home/components/FiltersSidebar";
import FilterStatsBar from "../../home/components/FilterStatsBar";
import ListingsGrid from "../../home/components/ListingsGrid";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fonction pour construire l'URL complète de l'API
const getFullApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  return `${baseUrl}${endpoint}`;
};

// Interface pour les données de catégorie
interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  description?: string;
  type: string;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const searchParamsObj = (await searchParams) || {};

  try {
    // Récupérer la catégorie par slug
    const response = await axios.get(
      getFullApiUrl(API_ENDPOINTS.CATEGORIES.BY_SLUG(slug)),
    );

    const category: Category = response.data;

    // Récupérer tous les éléments de cette catégorie (produits, dons, échanges)
    let categoryItems = [];

    try {
      const itemsResponse = await axios.get(
        getFullApiUrl(
          API_ENDPOINTS.CATEGORIES.WITH_ITEMS_BY_UUID(category.uuid),
        ),
      );
      categoryItems = itemsResponse.data;
    } catch (itemsError) {
      // Fallback : utiliser l'endpoint all elements
      try {
        const allElementsResponse = await axios.get(
          getFullApiUrl(API_ENDPOINTS.CATEGORIES.ALL_ELEMENTS(category.uuid)),
        );
        categoryItems = allElementsResponse.data;
      } catch (fallbackError) {
        console.error(
          "Erreur lors de la récupération des éléments:",
          fallbackError,
        );
        categoryItems = [];
      }
    }

    // Compter le nombre d'éléments par type
    const productCount = categoryItems.filter(
      (item: any) => item.type === "produit",
    ).length;
    const donationCount = categoryItems.filter(
      (item: any) => item.type === "don",
    ).length;
    const exchangeCount = categoryItems.filter(
      (item: any) => item.type === "echange",
    ).length;
    const totalItems = productCount + donationCount + exchangeCount;

    return (
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar avec filtres */}
          <div className="col-lg-3 d-none d-lg-block">
            <FiltersSidebar
              filters={{}}
              onFiltersChange={(filters) => {
                console.log("Filtres appliqués:", filters);
                // Ici vous pourriez mettre à jour l'URL avec les filtres
              }}
            />
          </div>

          {/* Contenu principal */}
          <div className="col-lg-9">
            {/* En-tête de la catégorie */}
            <div
              className="rounded-3 mb-4 p-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green}CC 100%)`,
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="display-6 fw-bold mb-2">{category.libelle}</h1>
                  {category.description && (
                    <p className="lead mb-3 opacity-90">
                      {category.description}
                    </p>
                  )}
                  <div className="d-flex gap-4 mt-3">
                    <div className="text-center">
                      <div className="fs-2 fw-bold">{totalItems}</div>
                      <div className="opacity-90">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="fs-2 fw-bold">{productCount}</div>
                      <div className="opacity-90">Ventes</div>
                    </div>
                    <div className="text-center">
                      <div className="fs-2 fw-bold">{donationCount}</div>
                      <div className="opacity-90">Dons</div>
                    </div>
                    <div className="text-center">
                      <div className="fs-2 fw-bold">{exchangeCount}</div>
                      <div className="opacity-90">Échanges</div>
                    </div>
                  </div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    fontSize: "2rem",
                  }}
                >
                  <i className="fas fa-tag"></i>
                </div>
              </div>
            </div>

            {/* Barre de filtres et statistiques */}
            <div className="mb-4">
              <FilterStatsBar
                totalItems={totalItems}
                activeFilter="all"
                onFilterChange={(filter) => {
                  console.log("Filtre changé:", filter);
                  // Mettre à jour l'URL avec le filtre
                }}
                viewMode="grid"
                onViewModeChange={(mode) => {
                  console.log("Mode de vue changé:", mode);
                }}
                sortOption="recent"
                onSortChange={(sort) => {
                  console.log("Tri changé:", sort);
                }}
              />
            </div>

            {/* Grille d'annonces avec filtre par catégorie */}
            <ListingsGrid
              filterType="all"
              viewMode="grid"
              sortOption="recent"
            />
          </div>
        </div>

        {/* Filtres mobile */}
        <div className="d-lg-none mt-4">
          <div className="card">
            <div className="card-header bg-white">
              <button
                className="btn btn-outline-success w-100 d-flex justify-content-between align-items-center"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mobileFilters"
              >
                <span>Filtres</span>
                <i className="fas fa-sliders-h"></i>
              </button>
            </div>
            <div className="collapse" id="mobileFilters">
              <div className="card-body">
                <FiltersSidebar
                  filters={{}}
                  onFiltersChange={(filters) => {
                    console.log("Filtres appliqués:", filters);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    // Fallback : essayer avec l'endpoint LIST
    try {
      const allResponse = await axios.get(
        getFullApiUrl(API_ENDPOINTS.CATEGORIES.LIST),
      );
      const allCategories = allResponse.data;
      const category = allCategories.find(
        (cat: any) =>
          cat.slug === slug && !cat.is_deleted && cat.deleted_at === null,
      );

      if (category) {
        return (
          <div className="container py-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">
                {category.libelle}
              </h1>
              <p className="mt-2 text-gray-600">{category.description}</p>
            </div>
          </div>
        );
      }
    } catch (fallbackError) {
      console.error("Erreur de fallback:", fallbackError);
    }

    notFound();
  }
}

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
    const response = await axios.get(
      `${baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`,
    );

    const categories = response.data.filter(
      (category: any) => !category.is_deleted && category.deleted_at === null,
    );

    return categories.map((category: any) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Erreur génération params:", error);
    return [];
  }
}
