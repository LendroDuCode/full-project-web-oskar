import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

interface RecommendationItem {
  id: number;
  image: string;
  alt: string;
  tag: string;
  tagColor: string;
  textColor: string;
  title: string;
  description: string;
  price: string;
  priceColor: string;
  isExchange: boolean;
}

export default function RecommendationsSection() {
  const recommendations: RecommendationItem[] = [
    {
      id: 1,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/c469af199f-ae988da9c77b99ff9fb9.png",
      alt: "modern gaming console on entertainment center, product photography",
      tag: "For Sale",
      tagColor: "bg-success-subtle",
      textColor: "text-success",
      title: "PlayStation 5",
      description: "Like new condition with 2 controllers",
      price: "400,000 FCFA",
      priceColor: "text-success",
      isExchange: false,
    },
    {
      id: 2,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/5b1bebe9e8-b90058a194ce8b960d26.png",
      alt: "professional camera lens on table, photography equipment",
      tag: "For Sale",
      tagColor: "bg-success-subtle",
      textColor: "text-success",
      title: "Canon 50mm Lens",
      description: "Perfect for portrait photography",
      price: "85,000 FCFA",
      priceColor: "text-success",
      isExchange: false,
    },
    {
      id: 3,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/e3e6b7884a-318e0a58338c882427c8.png",
      alt: "office desk with computer monitor and keyboard, modern workspace",
      tag: "Exchange",
      tagColor: "bg-primary-subtle",
      textColor: "text-primary",
      title: "Office Desk Setup",
      description: "Looking to exchange for standing desk",
      price: "Exchange",
      priceColor: "text-dark",
      isExchange: true,
    },
    {
      id: 4,
      image:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/ce10728a5b-56812a2959c21cd4db15.png",
      alt: "electric guitar with amplifier, musical instruments",
      tag: "For Sale",
      tagColor: "bg-success-subtle",
      textColor: "text-success",
      title: "Electric Guitar",
      description: "Fender Stratocaster with case",
      price: "150,000 FCFA",
      priceColor: "text-success",
      isExchange: false,
    },
  ];

  return (
    <section className="bg-white py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold text-dark mb-3">
            Recommended For You
          </h2>
          <p className="text-muted">Based on your interests and activity</p>
        </div>

        <div className="row g-4">
          {recommendations.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-3">
              <div className="bg-white border-2 border-light-subtle rounded-3 overflow-hidden hover-border-warning hover-shadow-lg transition-all h-100">
                <div className="position-relative" style={{ height: "192px" }}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <span
                    className={`d-inline-block ${item.tagColor} ${item.textColor} small fw-semibold px-2 py-1 rounded mb-2`}
                  >
                    {item.tag}
                  </span>
                  <h3 className="fw-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-muted small mb-3">{item.description}</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className={`fs-5 fw-bold mb-0 ${item.priceColor}`}>
                      {item.price}
                    </p>
                    <button
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center border-0"
                      style={{
                        width: "32px",
                        height: "32px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FontAwesomeIcon icon={faHeart} className="text-muted" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hover-border-warning:hover {
          border-color: #ffc107 !important;
        }

        .hover-shadow-lg:hover {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }

        .transition-all {
          transition: all 0.3s ease;
        }

        button:hover {
          background-color: #ffc107 !important;
        }

        button:hover svg {
          color: white !important;
        }
      `}</style>
    </section>
  );
}
