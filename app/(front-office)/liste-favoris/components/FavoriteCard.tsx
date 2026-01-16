// app/(front-office)/liste-favoris/components/FavoritesGrid.tsx
"use client";

import { useState } from "react";

interface FavoriteItem {
  id: number;
  title: string;
  price: string;
  priceColor: string;
  description: string;
  location: string;
  timeAgo: string;
  imageSrc: string;
  imageAlt: string;
  tag: "vente" | "échange" | "don";
  tagColor: string;
  buttonText: string;
  buttonColor: string;
  buttonHoverColor: string;
  negotiable?: boolean;
}

interface FavoritesGridProps {
  displayedCount?: number; // AJOUTEZ CETTE PROP
}

const favoriteItems: FavoriteItem[] = [
  {
    id: 1,
    title: "Samsung Galaxy S22",
    price: "245,000 FCFA",
    priceColor: "text-success",
    description:
      "Excellent état, à peine utilisé pendant 6 mois. Livré avec la boîte d'origine et tous les accessoires.",
    location: "Cocody, Abidjan",
    timeAgo: "Il y a 2 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/fd3c4ff41a-2523f8862d320243aff8.png",
    imageAlt:
      "modern smartphone with sleek design on white background, product photography style",
    tag: "vente",
    tagColor: "bg-success",
    buttonText: "Contacter",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
  {
    id: 2,
    title: "Canapé 3 places en cuir",
    price: "Troc",
    priceColor: "text-primary",
    description:
      "Canapé en cuir marron en excellent état. Cherche à échanger contre un ensemble table à manger ou un bureau.",
    location: "Marcory, Abidjan",
    timeAgo: "Il y a 5 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/a9bc073f05-ef048e30fc0a1f108ebd.png",
    imageAlt:
      "elegant leather sofa in modern living room, interior design photography",
    tag: "échange",
    tagColor: "bg-primary",
    buttonText: "Proposer",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
  {
    id: 3,
    title: "Manuels universitaires",
    price: "Gratuit",
    priceColor: "text-purple-600",
    description:
      "Collection de manuels d'ingénierie. Parfait pour les étudiants. Gratuit pour toute personne en ayant besoin.",
    location: "Plateau, Abidjan",
    timeAgo: "Il y a 1 semaine",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/2b93121d55-4377ad53bb19fec29c92.png",
    imageAlt:
      "stack of educational textbooks and school supplies, academic setting",
    tag: "don",
    tagColor: "bg-purple-600",
    buttonText: "Intéresser",
    buttonColor: "btn-purple",
    buttonHoverColor: "",
  },
  {
    id: 4,
    title: "Ordinateur Portable HP Pavilion",
    price: "180,000 FCFA",
    priceColor: "text-primary",
    description:
      "Core i5, 8Go RAM, 256Go SSD. Parfait pour le travail et les études. Prix négociable.",
    location: "Yopougon, Abidjan",
    timeAgo: "Il y a 3 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/aa8dc22bbb-80025297f788f44ce05a.png",
    imageAlt:
      "modern laptop computer with accessories on desk, workspace photography",
    tag: "vente",
    tagColor: "bg-success",
    buttonText: "Contacter",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
    negotiable: true,
  },
  {
    id: 5,
    title: "Sac à main de créateur",
    price: "85,000 FCFA",
    priceColor: "text-primary",
    description:
      "Sac à main de créateur authentique, utilisé deux fois. Excellent état avec emballage d'origine.",
    location: "Cocody, Abidjan",
    timeAgo: "Il y a 4 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/cdb6a94d2a-6c392bfa2015dda9612b.png",
    imageAlt: "stylish women's designer handbag",
    tag: "vente",
    tagColor: "bg-success",
    buttonText: "Contacter",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
  {
    id: 6,
    title: "Kit Appareil Photo Canon DSLR",
    price: "Troc",
    priceColor: "text-primary",
    description:
      "Appareil photo professionnel avec 2 objectifs. Cherche à échanger contre du matériel vidéo ou un ordinateur portable.",
    location: "Adjamé, Abidjan",
    timeAgo: "Il y a 1 semaine",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/ef44a3a5cb-681f9535d543ec2f160c.png",
    imageAlt:
      "professional camera equipment and photography gear, studio setup",
    tag: "échange",
    tagColor: "bg-primary",
    buttonText: "Proposer",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
  {
    id: 7,
    title: "Ensemble d'appareils de cuisine",
    price: "125,000 FCFA",
    priceColor: "text-primary",
    description:
      "Mixeur, grille-pain et batteur. Tous en excellent état de fonctionnement. Parfait pour les nouvelles maisons.",
    location: "Cocody, Abidjan",
    timeAgo: "Il y a 6 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/d62b8b2257-dbf185d3e81f3c505f72.png",
    imageAlt:
      "modern kitchen appliances and cookware set, clean product photography",
    tag: "vente",
    tagColor: "bg-success",
    buttonText: "Contacter",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
  {
    id: 8,
    title: "Lot de jouets pour enfants",
    price: "gratuit",
    priceColor: "text-purple-600",
    description:
      "Jouets variés pour les 3-8 ans. Propres et en bon état. Gratuits pour les familles dans le besoin.",
    location: "Marcory, Abidjan",
    timeAgo: "Il y a 2 semaines",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/c8369c86b8-16acab602eae0eb2139c.png",
    imageAlt: "children's toys collection",
    tag: "don",
    tagColor: "bg-purple-600",
    buttonText: "Intéresser",
    buttonColor: "btn-purple",
    buttonHoverColor: "",
  },
  {
    id: 9,
    title: "VTT",
    price: "95,000 FCFA",
    priceColor: "text-primary",
    description:
      "VTT 21 vitesses en excellent état. Parfait pour les sentiers et la ville.",
    location: "Abobo, Abidjan",
    timeAgo: "Il y a 5 jours",
    imageSrc:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/cdc5284f71-5f6b9c6e82f9ad6a841f.png",
    imageAlt: "mountain bicycle with modern design, outdoor sports equipment",
    tag: "vente",
    tagColor: "bg-success",
    buttonText: "Contacter",
    buttonColor: "btn-primary",
    buttonHoverColor: "",
  },
];

const FavoriteCard = ({ item }: { item: FavoriteItem }) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getTagIcon = (tag: FavoriteItem["tag"]) => {
    switch (tag) {
      case "vente":
        return "fa-tag";
      case "échange":
        return "fa-exchange-alt";
      case "don":
        return "fa-gift";
      default:
        return "fa-tag";
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
      <div
        className="position-relative overflow-hidden"
        style={{ height: "256px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={item.imageSrc}
          alt={item.imageAlt}
          className="w-100 h-100 object-cover"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Badge */}
        <div className="position-absolute top-3 start-3">
          <span
            className={`${item.tagColor} text-white px-3 py-2 rounded-pill d-flex align-items-center gap-2`}
            style={{ fontSize: "0.75rem" }}
          >
            <i className={`fas ${getTagIcon(item.tag)}`}></i>
            {item.tag}
          </span>
        </div>

        {/* Actions */}
        <div className="position-absolute top-3 end-3 d-flex gap-2">
          <button
            className="btn btn-light rounded-circle p-2 shadow-sm"
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ width: "40px", height: "40px" }}
            aria-label={
              isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
          >
            <i
              className={`${isFavorite ? "fas" : "far"} fa-heart`}
              style={{ color: isFavorite ? "#EF5350" : "#6B7280" }}
            ></i>
          </button>

          <button
            className="btn btn-light rounded-circle p-2 shadow-sm"
            style={{ width: "40px", height: "40px" }}
            aria-label="Partager"
          >
            <i className="fas fa-share-nodes text-secondary"></i>
          </button>
        </div>

        {/* Badge négociable */}
        {item.negotiable && (
          <div className="position-absolute bottom-3 start-3">
            <span
              className="bg-danger text-white px-3 py-2 rounded-pill"
              style={{ fontSize: "0.75rem" }}
            >
              Négociable
            </span>
          </div>
        )}
      </div>

      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="card-title fw-bold mb-0 text-dark">{item.title}</h5>
          <div
            className={`fw-bold ${item.priceColor}`}
            style={{ fontSize: "1.25rem" }}
          >
            {item.price}
          </div>
        </div>

        <p
          className="card-text text-secondary mb-3"
          style={{
            fontSize: "0.875rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "1.4",
          }}
        >
          {item.description}
        </p>

        <div className="d-flex justify-content-between text-secondary mb-4">
          <div className="d-flex align-items-center gap-2">
            <i
              className="fas fa-location-dot"
              style={{ fontSize: "0.875rem" }}
            ></i>
            <span style={{ fontSize: "0.875rem" }}>{item.location}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="far fa-clock" style={{ fontSize: "0.875rem" }}></i>
            <span style={{ fontSize: "0.875rem" }}>{item.timeAgo}</span>
          </div>
        </div>

        <button
          className={`btn w-100 ${item.buttonColor} text-white fw-semibold py-2`}
          style={{ borderRadius: "8px" }}
        >
          {item.buttonText}
        </button>
      </div>
    </div>
  );
};

export default function FavoritesGrid({
  displayedCount = 9,
}: FavoritesGridProps) {
  // Limiter les éléments affichés selon displayedCount
  const itemsToShow = favoriteItems.slice(0, displayedCount);

  return (
    <div className="container py-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {itemsToShow.map((item) => (
          <div key={item.id} className="col">
            <FavoriteCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
