// ListingsGrid.tsx
"use client";

import ListingCard from "./ListingCard";
import colors from "../../../shared/constants/colors";

interface Listing {
  id: number;
  title: string;
  price: string | number;
  type: "sale" | "donation" | "exchange";
  description: string;
  location: string;
  time: string;
  seller: {
    name: string;
    avatar: string;
  };
  image: string;
  featured?: boolean;
}

const ListingsGrid = () => {
  const featuredListings: Listing[] = [
    {
      id: 1,
      title: "Samsung Galaxy S21 Ultra",
      price: "125,000 FCFA",
      type: "sale",
      description:
        "Excellent état, à peine utilisé pendant 6 mois. Boîte d'origine et tous les accessoires inclus.",
      location: "Cocody, Abidjan",
      time: "Il y a 2 heures",
      seller: {
        name: "Kouadio M.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/94558bf494-94784575e745ed18a444.png",
      featured: true,
    },
    {
      id: 2,
      title: "Canapé 3 places en cuir",
      price: "85,000 FCFA",
      type: "sale",
      description:
        "Cuir de première qualité, état comme neuf. Déménagement dans un appartement plus petit.",
      location: "Plateau, Abidjan",
      time: "Il y a 5 heures",
      seller: {
        name: "Fatoumata S.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/a106df82aa-a18536c1c9f0310aa02c.png",
      featured: true,
    },
    {
      id: 3,
      title: 'MacBook Pro 13" 2021',
      price: "450,000 FCFA",
      type: "sale",
      description:
        "Puce M1, 8 Go de RAM, 256 Go de SSD. Parfait état de fonctionnement avec chargeur d'origine.",
      location: "Marcory, Abidjan",
      time: "Il y a 1 jour",
      seller: {
        name: "Yao K.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/ce7a54047e-588f05de06476bdef999.png",
      featured: true,
    },
  ];

  const allListings: Listing[] = [
    {
      id: 4,
      title: "Collection de manuels universitaires",
      price: "Gratuit",
      type: "donation",
      description:
        "Diverses matières dont les mathématiques, les sciences et la littérature. Idéal pour les étudiants.",
      location: "Yopougon, Abidjan",
      time: "Il y a 3 heures",
      seller: {
        name: "Aminata K.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/d210f8db1d-f3d8eb8cc1f841d5d191.png",
    },
    {
      id: 5,
      title: "VTT - Bon état",
      price: "Troc",
      type: "exchange",
      description:
        "Cherche à échanger contre un vélo de route ou du matériel de sport.",
      location: "Adjamé, Abidjan",
      time: "Il y a 6 heures",
      seller: {
        name: "Ibrahim D.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/66cf084f99-6704444acdd891e21d67.png",
    },
    {
      id: 6,
      title: "Ensemble de tenues traditionnelles en pagne",
      price: "35,000 FCFA",
      type: "sale",
      description:
        "Belles tenues traditionnelles faites à la main, jamais portées. Parfaites pour les occasions spéciales.",
      location: "Abobo, Abidjan",
      time: "Il y a 8 heures",
      seller: {
        name: "Aya B.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/31539501dc-c2ab835ccb7b1f4ddd09.png",
    },
    {
      id: 7,
      title: "PlayStation 4 avec jeux",
      price: "95,000 FCFA",
      type: "sale",
      description: "Modèle 500 Go avec 2 manettes et 5 jeux populaires inclus.",
      location: "Cocody, Abidjan",
      time: "Il y a 12 heures",
      seller: {
        name: "Sekou T.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/e46b7c8430-94b7298daa7bb9d30364.png",
    },
    {
      id: 8,
      title: "Lot d'appareils de cuisine",
      price: "Gratuit",
      type: "donation",
      description:
        "Micro-ondes, grille-pain et mixeur. Tous fonctionnent parfaitement.",
      location: "Plateau, Abidjan",
      time: "Il y a 1 jour",
      seller: {
        name: "Marie L.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/f423c3f819-2b532738dd34cc9ebd18.png",
    },
    {
      id: 9,
      title: "Ensemble bureau et chaise",
      price: "55,000 FCFA",
      type: "sale",
      description:
        "Mobilier de bureau ergonomique, parfait pour une installation de télétravail.",
      location: "Marcory, Abidjan",
      time: "Il y a 1 jour",
      seller: {
        name: "Adama F.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/41f657070d-d11c741b2f4e7d66d092.png",
    },
    {
      id: 10,
      title: "Poussette pour bébé - Excellent état",
      price: "Troc",
      type: "exchange",
      description:
        "Cherche à échanger contre des vêtements pour bébé ou des jouets pour enfants plus âgés.",
      location: "Yopougon, Abidjan",
      time: "Il y a 2 jours",
      seller: {
        name: "Aïcha M.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/8ec0816171-10a1bb7972abceb17f3c.png",
    },
    {
      id: 11,
      title: "Ventilateur sur pied - Comme neuf",
      price: "18,000 FCFA",
      type: "sale",
      description:
        "Refroidissement puissant, 3 vitesses, utilisé pendant seulement 2 mois.",
      location: "Adjamé, Abidjan",
      time: "Il y a 2 jours",
      seller: {
        name: "Moussa K.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/55e0627714-058d729481451ab033b5.png",
    },
    {
      id: 12,
      title: "Guitare acoustique avec étui",
      price: "42,000 FCFA",
      type: "sale",
      description:
        "Marque Yamaha, excellente qualité sonore, comprend un étui de transport et des médiators.",
      location: "Cocody, Abidjan",
      time: "Il y a 3 jours",
      seller: {
        name: "Karim B.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/4f6082cad3-f932392f72a71174a9cd.png",
    },
    {
      id: 13,
      title: "Collection de chaussures pour femmes",
      price: "Gratuit",
      type: "donation",
      description:
        "5 paires de chaussures pour femmes légèrement utilisées, tailles 38-40.",
      location: "Plateau, Abidjan",
      time: "Il y a 3 jours",
      seller: {
        name: "Nadia S.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/8b1a77caa9-cfe254b68a8a740ee915.png",
    },
    {
      id: 14,
      title: "iPad Air 4ème génération",
      price: "225,000 FCFA",
      type: "sale",
      description:
        "64 Go, modèle WiFi, comprend un étui compatible avec l'Apple Pencil.",
      location: "Marcory, Abidjan",
      time: "Il y a 4 jours",
      seller: {
        name: "Oumar T.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/b6add6a72e-22691cb6f90115219a3b.png",
    },
    {
      id: 15,
      title: "Ensemble table à manger 6 places",
      price: "Troc",
      type: "exchange",
      description:
        "Cherche à échanger contre un ensemble plus petit de 4 places ou des meubles de salon.",
      location: "Abobo, Abidjan",
      time: "Il y a 5 jours",
      seller: {
        name: "Mariam D.",
        avatar:
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      },
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/43cbdc21bc-0a933dc9c425cc1b8403.png",
    },
  ];

  return (
    <div id="listings-content">
      {/* Annonces à la Une */}
      <section id="featured-listings" className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="featured-title">
            <i className="fa-solid fa-star me-2" />
            Annonces à la Une
          </h2>
        </div>
        <div className="row g-4">
          {featuredListings.map((listing) => (
            <div key={listing.id} className="col-md-6 col-lg-4">
              <ListingCard listing={listing} featured={true} />
            </div>
          ))}
        </div>
      </section>

      {/* Toutes les annonces */}
      <section id="all-listings" className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h2 className="all-listings-title mb-2 mb-md-0">
            Toutes les annonces
          </h2>
          <p className="all-listings-count text-muted mb-0">
            Affichage de 1-24 sur 2,847 résultats
          </p>
        </div>
        <div className="row g-4">
          {allListings.map((listing) => (
            <div key={listing.id} className="col-md-6 col-lg-4">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .featured-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${colors.oskar.black};
          margin: 0;
        }

        .featured-title i {
          color: ${colors.oskar.green};
        }

        .all-listings-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${colors.oskar.black};
          margin: 0;
        }

        .all-listings-count {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ListingsGrid;
