// src/features/pages/product-details/ProductDetails.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Rating } from "primereact/rating";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShare,
  faMapMarkerAlt,
  faClock,
  faUser,
  faStar,
  faCheckCircle,
  faShieldAlt,
  faPhone,
  faComment,
  faArrowLeft,
  faEye,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

// Définir l'interface Product
interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  type: string;
  category: string;
  condition: string;
  description: string;
  location: string;
  time: string;
  views: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    memberSince: string;
    verified: boolean;
    responseRate: number;
    avgResponseTime: string;
  };
  images: string[];
  features: string[];
  tags: string[];
  delivery: boolean;
  negotiation: boolean;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Simuler le chargement des données du produit
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      // Données mockées avec des images de placeholder pour éviter les erreurs
      const mockProduct: Product = {
        id: id || "1",
        title: "Samsung Galaxy S21 Ultra - 256GB - Noir",
        price: "125,000 FCFA",
        originalPrice: "150,000 FCFA",
        type: "vente",
        category: "Électronique",
        condition: "Excellent état",
        description: `Ce Samsung Galaxy S21 Ultra est en excellent état, à peine utilisé pendant 6 mois. Il fonctionne parfaitement et ne présente aucune rayure ni défaut.

📱 **Caractéristiques principales :**
• Écran Dynamic AMOLED 2X 6.8"
• Processeur Exynos 2100
• 256 Go de stockage
• 12 Go de RAM
• Appareil photo quadruple 108MP + 10MP + 10MP + 12MP
• Batterie 5000 mAh
• Charge rapide 25W

📦 **Ce qui est inclus :**
• Smartphone Samsung Galaxy S21 Ultra
• Chargeur d'origine
• Câble USB-C
• Écouteurs (non utilisés)
• Boîte d'origine
• Documentation

💡 **Raison de la vente :**
Je vends car j'ai reçu un nouveau téléphone en cadeau. Ce téléphone a été utilisé avec une coque et un protecteur d'écran depuis le premier jour.`,
        location: "Cocody, Abidjan, Côte d'Ivoire",
        time: "Il y a 2 heures",
        views: 247,
        seller: {
          id: "user123",
          name: "Kouadio M.",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          rating: 4.7,
          reviews: 42,
          memberSince: "2023",
          verified: true,
          responseRate: 95,
          avgResponseTime: "2 heures",
        },
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
        ],
        features: [
          "Garantie 7 jours",
          "Facture disponible",
          "Test possible",
          "Livraison gratuite",
        ],
        tags: [
          "Samsung",
          "Galaxy S21",
          "Smartphone",
          "Téléphone",
          "Android",
          "5G",
        ],
        delivery: true,
        negotiation: true,
      };

      setTimeout(() => {
        setProduct(mockProduct);
        setLoading(false);
      }, 1000);
    };

    loadProduct();
  }, [id]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vente":
        return "À vendre";
      case "don":
        return "Don";
      case "échange":
        return "Échange";
      default:
        return "À vendre";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oskar-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h1>
          <Button
            label="Retour à l'accueil"
            icon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => navigate("/")}
            style={{
              backgroundColor: colors.oskar.green,
              borderColor: colors.oskar.green,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Button
          label="Retour"
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate(-1)}
          className="mb-6"
          style={{
            backgroundColor: "transparent",
            color: colors.oskar.green,
            border: `1px solid ${colors.oskar.green}`,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images du produit */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-4">
                <div className="h-96 rounded-lg overflow-hidden">
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-oskar-green"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-between items-center">
                <Button
                  icon={<FontAwesomeIcon icon={faHeart} />}
                  label={isFavorite ? "Favori" : "Ajouter aux favoris"}
                  onClick={() => setIsFavorite(!isFavorite)}
                  style={{
                    backgroundColor: isFavorite
                      ? colors.oskar.grey
                      : colors.oskar.green,
                    borderColor: isFavorite
                      ? colors.oskar.grey
                      : colors.oskar.green,
                  }}
                />
                <Button
                  icon={<FontAwesomeIcon icon={faShare} />}
                  label="Partager"
                  className="ml-2"
                  style={{
                    backgroundColor: colors.oskar.blue,
                    borderColor: colors.oskar.blue,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Informations du produit */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-oskar-green bg-opacity-10 text-oskar-green">
                  {getTypeLabel(product.type)}
                </span>
                <span className="ml-2 inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700">
                  {product.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>

              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-gray-400 mr-2"
                />
                <span className="text-gray-600">{product.location}</span>
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-gray-400 ml-4 mr-2"
                />
                <span className="text-gray-600">{product.time}</span>
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-gray-400 ml-4 mr-2"
                />
                <span className="text-gray-600">{product.views} vues</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-oskar-green">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-3 text-lg text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                    {product.condition}
                  </span>
                </div>
              </div>

              {/* Boutons d'action principaux */}
              <div className="space-y-3 mb-6">
                <Button
                  label="Contacter le vendeur"
                  icon={<FontAwesomeIcon icon={faComment} />}
                  className="w-full"
                  style={{
                    backgroundColor: colors.oskar.green,
                    borderColor: colors.oskar.green,
                  }}
                />
                <Button
                  label="Appeler le vendeur"
                  icon={<FontAwesomeIcon icon={faPhone} />}
                  className="w-full"
                  style={{
                    backgroundColor: colors.oskar.blue,
                    borderColor: colors.oskar.blue,
                  }}
                />
              </div>

              {/* Caractéristiques */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Ce que propose le vendeur
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-oskar-green mr-2"
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Options */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="text-2xl text-gray-400 mb-2"
                    />
                    <p className="text-sm text-gray-600">Achat sécurisé</p>
                  </div>
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={faHandshake}
                      className="text-2xl text-gray-400 mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      {product.negotiation
                        ? "Négociation possible"
                        : "Prix fixe"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
