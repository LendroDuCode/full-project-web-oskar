// app/(front-office)/categories/[[...slug]]/page.tsx
"use client";

import { FC, useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORIES,
} from "@/app/shared/constants/categories";
import CategoryContent from "../components/CategoryContent";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: Category[];
  path?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
}

const CategoryPage: FC<PageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const slug = resolvedParams?.slug;

  // ============================================
  // CAS 1: PAS DE SLUG - PAGE D'ACCUEIL DES CATÉGORIES
  // ============================================
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return renderAllCategoriesPage();
  }

  // ============================================
  // CAS 2: AVEC SLUG - CATÉGORIE SPÉCIFIQUE
  // ============================================
  const isSubCategory = slug.length >= 2;
  const parentSlug = isSubCategory ? slug[0] : null;
  const currentSlug = isSubCategory ? slug[1] : slug[0];

  // Nettoyer le slug (enlever le timestamp)
  const cleanSlug = (dirtySlug: string): string => {
    return dirtySlug.replace(/-\d+$/, "");
  };

  const cleanCurrentSlug = cleanSlug(currentSlug);
  const cleanParentSlug = parentSlug ? cleanSlug(parentSlug) : null;

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Charger les catégories
        let cats: Category[] = [];
        try {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
          cats = Array.isArray(response) ? response : [];
          cats = cats.filter(
            (c: Category) => !c?.is_deleted && c?.deleted_at === null,
          );
        } catch (error) {
          console.error("🔴 Error fetching categories:", error);
          cats = DEFAULT_CATEGORIES as Category[];
        }

        setCategories(cats);

        // 2. Trouver la catégorie par slug
        const mainCategory = cats.find(
          (c: Category) =>
            c?.slug === currentSlug ||
            c?.slug?.replace(/-\d+$/, "") === cleanCurrentSlug ||
            c?.libelle?.toLowerCase() === cleanCurrentSlug?.toLowerCase()
        ) || DEFAULT_CATEGORIES.find(
          (c) =>
            c?.slug === currentSlug ||
            c?.slug?.replace(/-\d+$/, "") === cleanCurrentSlug ||
            c?.libelle?.toLowerCase() === cleanCurrentSlug?.toLowerCase()
        );

        if (mainCategory) {
          // Essayer de charger les statistiques de la catégorie
          try {
            // Utiliser l'endpoint standard pour récupérer les infos de la catégorie
            const categoryInfo = await api.get(API_ENDPOINTS.CATEGORIES.DETAIL(mainCategory.uuid));
            
            // Construire les stats à partir des données disponibles
            const stats = {
              totalDons: categoryInfo.stats?.dons || 0,
              totalEchanges: categoryInfo.stats?.echanges || 0,
              totalProduits: categoryInfo.stats?.produits || 0,
              totalItems: (categoryInfo.stats?.dons || 0) + 
                         (categoryInfo.stats?.echanges || 0) + 
                         (categoryInfo.stats?.produits || 0),
            };
            
            setCategoryData({ stats, category: categoryInfo });
          } catch (error) {
            console.warn("⚠️ Impossible de charger les stats détaillées, utilisation des valeurs par défaut");
            setCategoryData({
              stats: {
                totalDons: 0,
                totalEchanges: 0,
                totalProduits: 0,
                totalItems: 0,
              },
              category: mainCategory
            });
          }
        }
      } catch (error) {
        console.error("🔴 Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentSlug, isSubCategory, cleanCurrentSlug]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement de la catégorie...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // SOUS-CATÉGORIE
  // ============================================
  if (isSubCategory && cleanParentSlug) {
    return handleSubCategory(categories, cleanParentSlug, cleanCurrentSlug);
  }

  // ============================================
  // CATÉGORIE PRINCIPALE
  // ============================================
  return handleMainCategory(categories, cleanCurrentSlug, categoryData);
};

// ============================================
// GESTIONNAIRE CATÉGORIE PRINCIPALE
// ============================================
function handleMainCategory(
  categories: Category[],
  currentSlug: string,
  categoryData: any,
) {
  // Trouver la catégorie
  let mainCategory = categories.find(
    (c: Category) =>
      c?.slug === currentSlug || 
      c?.slug?.replace(/-\d+$/, "") === currentSlug ||
      c?.libelle?.toLowerCase() === currentSlug?.toLowerCase()
  );

  if (!mainCategory) {
    mainCategory = DEFAULT_CATEGORIES.find(
      (c) =>
        c?.slug === currentSlug ||
        c?.slug?.replace(/-\d+$/, "") === currentSlug ||
        c?.libelle?.toLowerCase() === currentSlug?.toLowerCase()
    );

    if (!mainCategory) {
      console.error(`🔴 Catégorie non trouvée: ${currentSlug}`);
      notFound();
    }
  }

  // Trouver les sous-catégories
  const subCategories = categories
    .filter((c: Category) => c?.path === mainCategory?.uuid)
    .filter(
      (c: Category, index: number, self: Category[]) =>
        index === self.findIndex((cat) => cat?.libelle === c?.libelle),
    );

  const stats = categoryData?.stats || {
    totalDons: 0,
    totalEchanges: 0,
    totalProduits: 0,
    totalItems: 0,
  };

  return (
    <CategoryContent
      category={{
        uuid: mainCategory.uuid,
        libelle: mainCategory.libelle,
        slug: mainCategory.slug,
        description: mainCategory.description,
        image: mainCategory.image,
      }}
      stats={stats}
      subCategories={
        subCategories.length > 0 ? subCategories : mainCategory.enfants || []
      }
    />
  );
}

// ============================================
// GESTIONNAIRE SOUS-CATÉGORIE
// ============================================
function handleSubCategory(
  categories: Category[],
  parentSlug: string,
  currentSlug: string,
) {
  // Trouver la catégorie parente
  let parentCategory = categories.find(
    (c: Category) =>
      c?.slug === parentSlug || 
      c?.slug?.replace(/-\d+$/, "") === parentSlug ||
      c?.libelle?.toLowerCase() === parentSlug?.toLowerCase()
  );

  if (!parentCategory) {
    parentCategory = DEFAULT_CATEGORIES.find(
      (c) =>
        c?.slug === parentSlug ||
        c?.slug?.replace(/-\d+$/, "") === parentSlug ||
        c?.libelle?.toLowerCase() === parentSlug?.toLowerCase()
    );

    if (!parentCategory) {
      console.error(`🔴 Catégorie parente non trouvée: ${parentSlug}`);
      notFound();
    }
  }

  // Trouver la sous-catégorie
  let subCategory = parentCategory.enfants?.find(
    (c) =>
      c?.slug === currentSlug || 
      c?.slug?.replace(/-\d+$/, "") === currentSlug ||
      c?.libelle?.toLowerCase() === currentSlug?.toLowerCase()
  );

  if (!subCategory) {
    console.error(`🔴 Sous-catégorie non trouvée: ${currentSlug}`);
    notFound();
  }

  // Créer un objet catégorie pour la sous-catégorie
  const subCategoryObj = {
    ...subCategory,
    uuid: subCategory.uuid || `sub-${Date.now()}`,
    description: subCategory.description || `Annonces de ${subCategory.libelle} dans la catégorie ${parentCategory.libelle}`,
  };

  // Stats pour sous-catégorie
  const stats = {
    totalDons: 0,
    totalEchanges: 0,
    totalProduits: 0,
    totalItems: 0,
  };

  return (
    <CategoryContent
      category={subCategoryObj}
      stats={stats}
      subCategories={[]}
      isSubCategory={true}
    />
  );
}

// ============================================
// PAGE D'ACCUEIL DES CATÉGORIES (AVEC CARTES CENTRÉES)
// ============================================
function renderAllCategoriesPage() {
  const mainCategories = DEFAULT_CATEGORIES;

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Toutes nos catégories</h1>
        <p className="text-muted fs-5">
          Parcourez des milliers d&apos;annonces dans nos différentes catégories
        </p>
      </div>

      {/* Grille avec cartes centrées */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 justify-content-center">
        {mainCategories.map((category) => {
          const config =
            CATEGORY_CONFIG[category.type as keyof typeof CATEGORY_CONFIG] ||
            CATEGORY_CONFIG["Autres"];
          const subCount = category.enfants?.length || 0;

          return (
            <div key={category.uuid} className="col">
              <Link
                href={`/categories/${category.slug}`}
                className="text-decoration-none"
              >
                <div className="card border-0 shadow-sm h-100 category-card overflow-hidden">
                  <div className="card-body text-center p-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 icon-container"
                      style={{
                        width: "80px",
                        height: "80px",
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      <i className={`fas ${config.icon} fa-2x`}></i>
                    </div>
                    <h5 className="fw-bold mb-2 text-dark category-title">
                      {category.libelle}
                    </h5>
                    {subCount > 0 && (
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                          fontSize: "0.8rem",
                        }}
                      >
                        <i className="fas fa-tag me-1"></i>
                        {subCount} sous-catégorie{subCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .category-card {
          transition: all 0.3s ease;
          cursor: pointer;
          border-radius: 16px;
          height: 100%;
        }
        
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        
        .category-card:hover .icon-container {
          transform: scale(1.1);
          background-color: ${colors.oskar.green} !important;
          color: white !important;
          transition: all 0.3s ease;
        }
        
        .category-title {
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .icon-container {
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .category-title {
            font-size: 0.9rem;
          }
          
          .icon-container {
            width: 60px !important;
            height: 60px !important;
          }
          
          .icon-container i {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CategoryPage;