// app/components/Boutique.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorMessage from "./ui/ErrorMessage";

interface Produit {
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  description: string | null;
  prix: string | null;
  image: string;
  statut: string;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  estPublie: boolean;
  estBloque: boolean;
  categorie: {
    libelle: string;
    type: string;
  };
}

interface TypeBoutique {
  libelle: string;
  code: string;
  description: string | null;
  image: string;
}

interface BoutiqueData {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  logo: string;
  banniere: string;
  politique_retour: string;
  conditions_utilisation: string;
  statut: string;
  est_bloque: boolean;
  est_ferme: boolean;
  type_boutique: TypeBoutique;
  produits: Produit[];
  created_at: string;
}

interface BoutiqueProps {
  boutiqueData: BoutiqueData;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const Boutique: React.FC<BoutiqueProps> = ({
  boutiqueData,
  loading = false,
  error = null,
  onRetry,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleAddToCart = (produit: Produit) => {
    alert(`Ajouté au panier : ${produit.libelle}`);
    // Ici vous pourriez ajouter la logique pour ajouter au panier via votre API
  };

  const handleViewDetails = (produit: Produit) => {
    setSelectedProduct(produit);
    setShowModal(true);
  };

  const formatPrice = (price: string | null): string => {
    if (!price) return "Prix non disponible";
    const numericPrice = parseFloat(price);
    return `${numericPrice.toLocaleString("fr-FR")} FCFA`;
  };

  const getStatutBadge = (statut: string) => {
    const statutStyles: Record<string, string> = {
      en_review: "bg-yellow-100 text-yellow-800",
      actif: "bg-green-100 text-green-800",
      inactif: "bg-red-100 text-red-800",
      bloque: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statutStyles[statut] || "bg-gray-100 text-gray-800"}`}
      >
        {statut.replace("_", " ")}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  const data = boutiqueData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière de la boutique */}
      {data.banniere && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={data.banniere}
            alt={`Bannière ${data.nom}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec logo et infos */}
        <header className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {data.logo && (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
              <img
                src={data.logo}
                alt={`Logo ${data.nom}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {data.nom}
              </h1>
              {getStatutBadge(data.statut)}
              {data.est_bloque && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Bloquée
                </span>
              )}
              {data.est_ferme && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Fermée
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4 max-w-3xl">{data.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {data.type_boutique && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                    {data.type_boutique.libelle}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Créée le {formatDate(data.created_at)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <span>
                  <span className="font-semibold">{data.produits.length}</span>{" "}
                  produits
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Informations supplémentaires */}
        {(data.politique_retour || data.conditions_utilisation) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {data.politique_retour && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Politique de retour
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {data.politique_retour}
                </p>
              </div>
            )}

            {data.conditions_utilisation && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Conditions d'utilisation
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {data.conditions_utilisation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Liste des produits */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nos produits{" "}
              <span className="text-gray-500">({data.produits.length})</span>
            </h2>
            <div className="text-sm text-gray-500">
              {data.produits.filter((p) => !p.estBloque).length} disponibles
            </div>
          </div>

          {data.produits.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucun produit disponible
              </h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Cette boutique n'a pas encore publié de produits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.produits.map((produit) => (
                <div
                  key={produit.uuid}
                  className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image du produit */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={produit.image}
                      alt={produit.libelle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {produit.estBloque && (
                      <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-2 bg-red-500 text-white rounded-full text-xs font-medium shadow-lg">
                          Produit bloqué
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informations du produit */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                        {produit.categorie.libelle}
                      </span>
                      {produit.nombre_avis > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {"★".repeat(Math.floor(produit.note_moyenne))}
                            {produit.note_moyenne % 1 >= 0.5 && "⭐"}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {produit.note_moyenne.toFixed(1)}
                          </span>
                          <span className="text-gray-400 text-xs">
                            ({produit.nombre_avis})
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-lg">
                      {produit.libelle}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {produit.description || "Aucune description disponible"}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {produit.prix ? (
                            <span className="text-xl font-bold text-blue-600">
                              {formatPrice(produit.prix)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">
                              Prix sur demande
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Stock:</span>{" "}
                              {produit.quantite} unité
                              {produit.quantite !== 1 ? "s" : ""}
                            </div>
                            {produit.nombre_favoris > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <svg
                                  className="w-3 h-3 text-red-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {produit.nombre_favoris}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            onClick={() => handleViewDetails(produit)}
                          >
                            Détails
                          </button>
                          {produit.prix &&
                            !produit.estBloque &&
                            produit.quantite > 0 && (
                              <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                                onClick={() => handleAddToCart(produit)}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  Acheter
                                </div>
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de détails du produit */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedProduct.libelle}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.libelle}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Statut</div>
                      <div
                        className={`font-medium ${selectedProduct.estBloque ? "text-red-600" : "text-green-600"}`}
                      >
                        {selectedProduct.estBloque
                          ? "Bloqué"
                          : selectedProduct.estPublie
                            ? "Publié"
                            : "Non publié"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Stock</div>
                      <div className="font-medium">
                        {selectedProduct.quantite} unité
                        {selectedProduct.quantite !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                      Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProduct.description ||
                        "Aucune description disponible pour ce produit."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Catégorie</span>
                      <span className="font-medium">
                        {selectedProduct.categorie.libelle}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Prix</span>
                      <span className="font-bold text-blue-600 text-xl">
                        {formatPrice(selectedProduct.prix)}
                      </span>
                    </div>

                    {selectedProduct.nombre_avis > 0 && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Évaluation</span>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {selectedProduct.note_moyenne.toFixed(1)}
                            </div>
                            <div className="flex text-yellow-400 text-sm">
                              {"★".repeat(5)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            ({selectedProduct.nombre_avis} avis)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex gap-4">
                      {selectedProduct.prix &&
                        !selectedProduct.estBloque &&
                        selectedProduct.quantite > 0 && (
                          <button
                            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg flex items-center justify-center gap-3"
                            onClick={() => {
                              handleAddToCart(selectedProduct);
                              setShowModal(false);
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Ajouter au panier
                          </button>
                        )}
                      <button
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        onClick={() => setShowModal(false)}
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boutique;
