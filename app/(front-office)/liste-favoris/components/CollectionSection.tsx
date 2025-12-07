"use client";

interface CollectionItem {
  id: number;
  title: string;
  description: string;
  itemCount: number;
  iconClass: string;
  iconBgColor: string;
}

export default function CollectionsSection() {
  // Données des collections
  const collections: CollectionItem[] = [
    {
      id: 1,
      title: "Électronique",
      description: "Phones, laptops, and gadgets I'm interested in",
      itemCount: 8,
      iconClass: "fa-solid fa-mobile-screen-button",
      iconBgColor: "bg-warning", // orange
    },
    {
      id: 2,
      title: "Maison & Meubles",
      description: "Furniture and home decor for my new apartment",
      itemCount: 7,
      iconClass: "fa-solid fa-couch",
      iconBgColor: "bg-primary", // blue
    },
    {
      id: 3,
      title: "Mode",
      description: "Clothing and accessories I want to buy",
      itemCount: 5,
      iconClass: "fa-solid fa-shirt",
      iconBgColor: "bg-success", // green
    },
    {
      id: 4,
      title: "Wishlist",
      description: "Items I'm saving for later consideration",
      itemCount: 4,
      iconClass: "fa-solid fa-heart",
      iconBgColor: "bg-purple", // purple (vous devrez définir cette classe)
    },
  ];

  const handleNewCollection = () => {
    console.log("Créer une nouvelle collection");
    // Logique pour créer une nouvelle collection
  };

  const handleCollectionClick = (collectionId: number) => {
    console.log(`Collection cliquée: ${collectionId}`);
    // Navigation ou ouverture de la collection
  };

  return (
    <section id="collections-section" className="bg-white py-5">
      <div className="container">
        {/* En-tête */}
        <div className="mb-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="h1 fw-bold text-dark mb-2">Mes Collections</h2>
              <p className="text-muted mb-0">
                Organisez vos favoris dans des collections personnalisées
              </p>
            </div>

            <button
              onClick={handleNewCollection}
              className="btn btn-primary btn-lg d-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Nouvelle Collection</span>
            </button>
          </div>
        </div>

        {/* Grille des collections */}
        <div className="row g-4">
          {collections.map((collection) => (
            <div key={collection.id} className="col-12 col-sm-6 col-lg-3">
              <div
                id={`collection-${collection.id}`}
                onClick={() => handleCollectionClick(collection.id)}
                className="card h-100 border-0 shadow-sm hover-shadow transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCollectionClick(collection.id);
                  }
                }}
              >
                <div className="card-body p-4">
                  {/* En-tête de la collection */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    {/* Icône */}
                    <div
                      className={`rounded d-flex align-items-center justify-content-center ${collection.iconBgColor}`}
                      style={{ width: "48px", height: "48px" }}
                    >
                      <i
                        className={`${collection.iconClass} text-white fs-5`}
                      ></i>
                    </div>

                    {/* Nombre d'items */}
                    <span className="badge bg-light text-dark px-3 py-2 rounded-pill fw-semibold">
                      {collection.itemCount} items
                    </span>
                  </div>

                  {/* Contenu de la collection */}
                  <h3 className="h5 fw-bold text-dark mb-2">
                    {collection.title}
                  </h3>
                  <p className="text-muted small mb-0">
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
