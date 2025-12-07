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
import colors from "../../shared/style-global/colors";
import Breadcrumb from "../../shared/components/Breadcrumb";
import ProductDetailPage from "./components/ProductDetailPage";
import ProductDetail from "./components/ProductDetailPage";
import ProductDetailMain from "./components/ProductDetailPage";
import RecentlyViewedSection from "./components/RecentlyViewedSection";
import TrustBadgesSection from "./components/TrustBadgesSection";
import FAQSection from "../pages/contacts/components/FAQSection";
import CTASection from "../pages/contacts/components/CTASection";

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

  return <div></div>;
};

export default ProductDetails;
