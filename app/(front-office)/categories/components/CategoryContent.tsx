"use client";

import { useState, useEffect } from "react";
import colors from "@/app/shared/constants/colors";
import Link from "next/link";
import CategoryListGrid from "./CategoryListGrid";
import CategoryFilterStatsBar from "./CategoryFilterStatsBar";
import CategoryFiltersSidebar from "./CategoryFiltersSidebar";
import Pagination from "../../home/components/Pagination";

interface CategoryContentProps {
  category: {
    uuid: string;
    libelle: string;
    slug: string;
    description?: string;
    image?: string;
  };
  stats: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
  subCategories?: any[];
  isSubCategory?: boolean;
  parentCategory?: {
    libelle: string;
    slug: string;
    uuid: string;
  };
  currentFilterType?: "all" | "don" | "echange" | "produit";
  onFilterChange?: (type: "all" | "don" | "echange" | "produit") => void;
}

export default function CategoryContent({
  category,
  stats: initialStats,
  subCategories = [],
  isSubCategory = false,
  parentCategory,
  currentFilterType = "all",
  onFilterChange,
}: CategoryContentProps) {
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState<string>(currentFilterType);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(initialStats.totalItems || 0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [categoryStats, setCategoryStats] = useState({
    dons: initialStats.totalDons,
    echanges: initialStats.totalEchanges,
    produits: initialStats.totalProduits,
    total: initialStats.totalItems,
  });

  // Mettre à jour les stats quand initialStats change
  useEffect(() => {
    setCategoryStats({
      dons: initialStats.totalDons,
      echanges: initialStats.totalEchanges,
      produits: initialStats.totalProduits,
      total: initialStats.totalItems,
    });
    setTotalItems(initialStats.totalItems);
  }, [initialStats]);

  // Mettre à jour le filtre actif quand currentFilterType change
  useEffect(() => {
    setActiveFilter(currentFilterType);
  }, [currentFilterType]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
    
    // Notifier le parent si la fonction existe
    if (onFilterChange) {
      onFilterChange(filterId as any);
    }
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleSidebarFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleDataLoaded = (stats: { total: number; dons: number; echanges: number; produits: number }) => {
    setCategoryStats(stats);
    setTotalItems(stats.total);
  };

  const getCategoryConfig = () => {
    const configs: Record<string, { color: string; icon: string; gradient: string }> = {
      Électronique: { 
        color: "#10b981", 
        icon: "fa-microchip",
        gradient: "from-emerald-500 to-teal-600"
      },
      "Vêtements & Chaussures": { 
        color: "#f59e0b", 
        icon: "fa-shirt",
        gradient: "from-amber-500 to-orange-600"
      },
      "Don & Échange": { 
        color: "#8b5cf6", 
        icon: "fa-hand-holding-heart",
        gradient: "from-violet-500 to-purple-600"
      },
      "Éducation & Culture": { 
        color: "#3b82f6", 
        icon: "fa-graduation-cap",
        gradient: "from-blue-500 to-indigo-600"
      },
      "Services de proximité": { 
        color: "#6b7280", 
        icon: "fa-broom",
        gradient: "from-gray-500 to-slate-600"
      },
      Autres: { 
        color: colors.oskar.green, 
        icon: "fa-tag",
        gradient: "from-emerald-600 to-green-700"
      },
    };
    return (
      configs[category.libelle] || { 
        color: colors.oskar.green, 
        icon: "fa-tag",
        gradient: "from-emerald-600 to-green-700"
      }
    );
  };

  const config = getCategoryConfig();

  return (
    <>
      {/* Hero Section avec design moderne */}
      <section
        className={`py-5 py-md-6 position-relative overflow-hidden bg-gradient-${config.gradient}`}
        style={{
          background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
          color: "white",
          marginTop: "-1px",
        }}
      >
        {/* Éléments décoratifs */}
        <div className="position-absolute top-0 end-0 w-50 h-100 opacity-10 d-none d-md-block">
          <div className="position-relative w-100 h-100">
            <div className="position-absolute" style={{ top: '10%', right: '10%', fontSize: '10rem' }}>
              <i className={`fas ${config.icon}`}></i>
            </div>
          </div>
        </div>
        
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-3">
                  <li className="breadcrumb-item">
                    <Link href="/" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all">
                      <i className="fas fa-home me-1"></i>
                      Accueil
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="/categories" className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all">
                      Catégories
                    </Link>
                  </li>
                  {isSubCategory && parentCategory && (
                    <li className="breadcrumb-item">
                      <Link href={`/categories/${parentCategory.slug}`} className="text-white text-decoration-none opacity-75 hover-opacity-100 transition-all">
                        {parentCategory.libelle}
                      </Link>
                    </li>
                  )}
                  <li className="breadcrumb-item active text-white fw-semibold" aria-current="page">
                    {category.libelle}
                  </li>
                </ol>
              </nav>

              <div className="mb-4">
                <h1 className="display-4 fw-bold mb-3 text-shadow">{category.libelle}</h1>
                <p className="lead mb-4 opacity-90 fs-5 lh-base" style={{ maxWidth: '90%' }}>
                  {category.description ||
                    `Découvrez une sélection exceptionnelle d'articles dans la catégorie ${category.libelle}. Des milliers d'offres vous attendent !`}
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  width: "160px",
                  height: "160px",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <i className={`fas ${config.icon} fa-5x`} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques avec design épuré */}
      <section className="py-3 border-bottom bg-white">
        <div className="container">
          <div className="row g-3">
            {[
              { 
                label: "Total annonces", 
                value: categoryStats.total, 
                color: colors.oskar.green, 
                icon: "fa-chart-line" 
              },
              { 
                label: "Ventes", 
                value: categoryStats.produits, 
                color: colors.oskar.green,
                icon: "fa-basket-shopping"
              },
              { 
                label: "Dons", 
                value: categoryStats.dons, 
                color: "#8b5cf6",
                icon: "fa-gift" 
              },
              { 
                label: "Échanges", 
                value: categoryStats.echanges, 
                color: "#3b82f6",
                icon: "fa-arrows-rotate" 
              },
            ].map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="card border-0 bg-light bg-opacity-50 h-100">
                  <div className="card-body p-3 d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        backgroundColor: `${stat.color}15`,
                        color: stat.color
                      }}
                    >
                      <i className={`fas ${stat.icon} fa-lg`}></i>
                    </div>
                    <div>
                      <div className="fs-4 fw-bold lh-1 mb-1" style={{ color: stat.color }}>
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-muted small">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sous-catégories avec design moderne */}
      {subCategories && subCategories.length > 0 && (
        <section className="py-4 bg-light">
          <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-semibold text-dark mb-0">
                <i className="fas fa-folder-tree me-2" style={{ color: config.color }}></i>
                Explorer les sous-catégories
              </h6>
              <span className="badge bg-white text-dark px-3 py-2 rounded-pill shadow-sm">
                <i className="fas fa-tag me-1" style={{ color: config.color }}></i>
                {subCategories.length} sous-catégories
              </span>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              {subCategories.slice(0, 8).map((subCat) => (
                <Link
                  key={subCat.uuid}
                  href={`/categories/${category.slug}/${subCat.slug}`}
                  className="text-decoration-none"
                >
                  <div 
                    className="bg-white px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 border hover-scale transition-all"
                    style={{ 
                      borderColor: `${config.color}30`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="fas fa-angle-right" style={{ color: config.color, fontSize: "0.8rem" }}></i>
                    <span className="fw-medium" style={{ color: colors.oskar.black }}>{subCat.libelle}</span>
                    <span className="badge bg-light text-dark ms-1" style={{ fontSize: "0.7rem" }}>
                      {Math.floor(Math.random() * 50) + 5}
                    </span>
                  </div>
                </Link>
              ))}
              {subCategories.length > 8 && (
                <span className="bg-white px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2">
                  <i className="fas fa-ellipsis-h text-muted"></i>
                  <span className="text-muted">+{subCategories.length - 8}</span>
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contenu principal */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Sidebar des filtres - desktop seulement */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="position-sticky" style={{ top: "100px" }}>
                <CategoryFiltersSidebar
                  categoryUuid={category.uuid}
                  onFilterChange={handleSidebarFilterChange}
                  stats={{
                    dons: categoryStats.dons,
                    echanges: categoryStats.echanges,
                    produits: categoryStats.produits,
                  }}
                />
              </div>
            </div>

            {/* Contenu principal */}
            <div className="col-lg-9">
              <div className="bg-white rounded-4 shadow-sm p-4">
                {/* Barre de filtres - desktop seulement */}
                <div className="d-none d-md-block">
                  <CategoryFilterStatsBar
                    totalItems={totalItems}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    sortOption={sortOption}
                    onSortChange={handleSortChange}
                    stats={{
                      dons: categoryStats.dons,
                      echanges: categoryStats.echanges,
                      produits: categoryStats.produits,
                    }}
                  />
                </div>

                <div className="mt-4">
                  <CategoryListGrid
                    key={`${category.uuid}-${activeFilter}-${sortOption}-${JSON.stringify(filters)}`}
                    categoryUuid={category.uuid}
                    categorySlug={category.slug}
                    parentSlug={parentCategory?.slug}
                    isSubCategory={isSubCategory}
                    filterType={activeFilter as any}
                    viewMode={viewMode}
                    sortOption={sortOption}
                    onDataLoaded={handleDataLoaded}
                  />
                </div>

                {totalItems > 0 && (
                  <div className="mt-4 pt-3 border-top">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalItems / 12)}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bouton mobile flottant */}
      <div className="d-lg-none">
        <button
          className="btn btn-primary btn-lg rounded-pill shadow-lg position-fixed"
          style={{
            bottom: "20px",
            right: "20px",
            zIndex: 1050,
            backgroundColor: colors.oskar.green,
            border: "none",
            padding: "12px 24px",
            boxShadow: `0 4px 15px ${colors.oskar.green}80`,
          }}
          onClick={() => setShowMobileFilters(true)}
        >
          <i className="fa-solid fa-sliders me-2"></i>
          Filtres
        </button>
      </div>

      {/* Modal mobile */}
      {showMobileFilters && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
            style={{ 
              zIndex: 1051, 
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(5px)",
            }}
            onClick={() => setShowMobileFilters(false)}
          />
          
          <div
            className="position-fixed bottom-0 start-0 w-100 bg-white rounded-top-4 shadow-lg"
            style={{
              zIndex: 1052,
              maxHeight: "85vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">Filtres</h5>
                <p className="text-muted small mb-0">Affinez votre recherche</p>
              </div>
              <button
                className="btn btn-light rounded-circle p-2"
                onClick={() => setShowMobileFilters(false)}
                style={{ width: "40px", height: "40px" }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="p-4">
              <CategoryFiltersSidebar
                categoryUuid={category.uuid}
                onFilterChange={(newFilters) => {
                  handleSidebarFilterChange(newFilters);
                  setShowMobileFilters(false);
                }}
                stats={{
                  dons: categoryStats.dons,
                  echanges: categoryStats.echanges,
                  produits: categoryStats.produits,
                }}
              />
            </div>
            
            <div className="p-3 border-top bg-light">
              <button
                className="btn btn-success w-100 py-3 rounded-pill fw-semibold"
                onClick={() => setShowMobileFilters(false)}
                style={{ backgroundColor: colors.oskar.green }}
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-scale:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
          border-color: ${config.color} !important;
        }
        
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
        
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .position-sticky {
          position: sticky;
          top: 100px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        
        .position-sticky::-webkit-scrollbar {
          width: 4px;
        }
        
        .position-sticky::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .position-sticky::-webkit-scrollbar-thumb {
          background: ${colors.oskar.orange}80;
          border-radius: 4px;
        }
        
        .position-sticky::-webkit-scrollbar-thumb:hover {
          background: ${colors.oskar.orange};
        }
      `}</style>
    </>
  );
}