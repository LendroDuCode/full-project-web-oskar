"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Badge,
  Table,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
  Container,
  Breadcrumb,
  ButtonGroup,
  ProgressBar,
  Tooltip,
  OverlayTrigger,
  ButtonToolbar,
  InputGroup,
  Pagination,
  Modal,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaPencilAlt,
  FaEye,
  FaTrash,
  FaPlusCircle,
  FaTags,
  FaCalendar,
  FaCalendarCheck,
  FaLink,
  FaStore,
  FaImage,
  FaBoxOpen,
  FaStar,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaDoorClosed,
  FaInfoCircle,
  FaChartBar,
  FaChevronLeft,
  FaSync,
  FaCheck,
  FaBan,
  FaFilter,
  FaTimes,
  FaEyeSlash,
  FaShoppingBag,
  FaPercent,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUsers,
  FaClock,
  FaShareAlt,
  FaCopy,
  FaEllipsisV,
  FaChevronRight,
  FaChevronDown,
  FaRegStar,
  FaRegHeart,
  FaBox,
  FaLayerGroup,
  FaWarehouse,
  FaUndo,
  FaExclamationTriangle,
  FaSearch,
  FaLockOpen,
} from "react-icons/fa";

interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  image: string;
  image_key: string;
  statut: string;
}

interface Categorie {
  uuid: string;
  libelle: string;
  image: string;
  image_key: string;
  is_deleted?: boolean;
}

interface Produit {
  uuid: string;
  libelle: string;
  slug: string;
  image: string;
  image_key: string;
  prix: string;
  description: string | null;
  statut: string;
  quantite: number;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
  disponible: boolean;
  categorie: Categorie;
  estPublie: boolean;
  estBloque: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  is_favoris?: boolean;
}

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  logo: string;
  banniere: string;
  statut: string;
  type_boutique: TypeBoutique;
  produits: Produit[];
  est_bloque: boolean;
  est_ferme: boolean;
  created_at: string;
  updated_at: string;
  vendeurUuid?: string;
  agentUuid?: string;
  horaires?: any[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const BoutiqueDetail: React.FC = () => {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [productSort, setProductSort] = useState("nom");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      const pathSegments = window.location.pathname.split("/");
      const uuid = pathSegments[pathSegments.length - 1];

      if (uuid && uuid !== "[uuid]") {
        setId(uuid);
        await fetchBoutiqueData(uuid);
      } else {
        setError("ID de boutique non valide");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchBoutiqueData = async (boutiqueId: string) => {
    try {
      setLoading(true);
      setRefreshLoading(true);

      const endpoint = API_ENDPOINTS.BOUTIQUES.DETAIL(boutiqueId);
      console.log("📡 Appel API:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Boutique non trouvée");
        } else if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter");
        } else if (response.status === 403) {
          throw new Error("Accès interdit");
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      const data = await response.json();
      const boutiqueData = data.data || data;
      setBoutique(boutiqueData);
      setError(null);

      console.log("✅ Boutique chargée:", boutiqueData.nom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error("❌ Erreur lors du chargement:", err);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string,
  ) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const showConfirmation = (
    title: string,
    message: string,
    action: () => Promise<void>,
  ) => {
    setConfirmAction({ title, message, action });
    setShowConfirmModal(true);
  };

  const handleProductSelect = (productUuid: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productUuid)) {
        return prev.filter((uuid) => uuid !== productUuid);
      } else {
        return [...prev, productUuid];
      }
    });
  };

  const handleSelectAll = () => {
    if (!boutique) return;
    const filteredProducts = getFilteredProducts();

    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.uuid));
    }
  };

  const handleSelectAllCurrentPage = () => {
    const currentProducts = getCurrentPageProducts();
    const newSelected = [
      ...new Set([...selectedProducts, ...currentProducts.map((p) => p.uuid)]),
    ];
    setSelectedProducts(newSelected);
  };

  const getStatusBadge = (produit: Produit) => {
    if (produit.is_deleted) {
      return (
        <Badge
          bg="dark"
          className="d-flex align-items-center px-3 py-2"
          style={{ fontSize: "0.85rem", fontWeight: 500 }}
        >
          <FaTimes className="me-2" />
          <span>Supprimé</span>
        </Badge>
      );
    }

    if (produit.estBloque) {
      return (
        <Badge
          bg="danger"
          className="d-flex align-items-center px-3 py-2"
          style={{ fontSize: "0.85rem", fontWeight: 500 }}
        >
          <FaLock className="me-2" />
          <span>Bloqué</span>
        </Badge>
      );
    }

    if (produit.estPublie) {
      return (
        <Badge
          bg="success"
          className="d-flex align-items-center px-3 py-2"
          style={{ fontSize: "0.85rem", fontWeight: 500 }}
        >
          <FaEye className="me-2" />
          <span>Publié</span>
        </Badge>
      );
    }

    return (
      <Badge
        bg="secondary"
        className="d-flex align-items-center px-3 py-2"
        style={{ fontSize: "0.85rem", fontWeight: 500 }}
      >
        <FaEyeSlash className="me-2" />
        <span>Non publié</span>
      </Badge>
    );
  };

  const getBoutiqueStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: string; label: string; icon: React.ReactNode }
    > = {
      en_review: {
        variant: "warning",
        label: "En Revue",
        icon: <FaClock className="me-2" />,
      },
      actif: {
        variant: "success",
        label: "Actif",
        icon: <FaCheckCircle className="me-2" />,
      },
      inactif: {
        variant: "secondary",
        label: "Inactif",
        icon: <FaTimesCircle className="me-2" />,
      },
      bloque: {
        variant: "danger",
        label: "Bloqué",
        icon: <FaLock className="me-2" />,
      },
    };

    const statusInfo = statusMap[status] || {
      variant: "secondary",
      label: status,
      icon: <FaInfoCircle className="me-2" />,
    };

    return (
      <Badge
        bg={statusInfo.variant}
        className="d-flex align-items-center px-3 py-2"
        style={{ fontSize: "0.85rem", fontWeight: 500 }}
      >
        {statusInfo.icon}
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  const formatPrice = (price: string) => {
    try {
      const numericPrice = parseFloat(price);
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericPrice || 0);
    } catch {
      return "0 XOF";
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchBoutiqueData(id);
    }
  };

  const removeProductFromList = (productUuid: string) => {
    if (boutique) {
      setBoutique({
        ...boutique,
        produits: boutique.produits.filter((p) => p.uuid !== productUuid),
      });
    }
  };

  const handleApiResponse = async (
    response: Response,
  ): Promise<ApiResponse> => {
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || response.status === 204) {
      return { success: true, message: "Opération réussie" };
    }

    try {
      const text = await response.text();
      if (!text || text.trim() === "") {
        return { success: true, message: "Opération réussie" };
      }
      return JSON.parse(text);
    } catch (err) {
      if (response.ok) {
        return { success: true, message: "Opération réussie" };
      }
      throw new Error(
        `Erreur de parsing JSON: ${err instanceof Error ? err.message : "Réponse invalide"}`,
      );
    }
  };

  const handleDeleteProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const response = await fetch(
        `${API_ENDPOINTS.PRODUCTS.DELETE(productUuid)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit supprimé avec succès");
        removeProductFromList(productUuid);
        setSelectedProducts((prev) =>
          prev.filter((uuid) => uuid !== productUuid),
        );
      } else {
        throw new Error(result.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const endpoint =
        API_ENDPOINTS.PRODUCTS.RESTORE?.(productUuid) ||
        `/produits/${productUuid}/restore`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit restauré avec succès");
        if (id) {
          await fetchBoutiqueData(id);
        }
      } else {
        throw new Error(result.message || "Erreur lors de la restauration");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors de la restauration",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const endpoint =
        API_ENDPOINTS.PRODUCTS.PUBLISH?.(productUuid) ||
        `/produits/${productUuid}/publish`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estPublie: true }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit publié avec succès");
        if (id) {
          await fetchBoutiqueData(id);
        }
      } else {
        throw new Error(result.message || "Erreur lors de la publication");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors de la publication",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublishProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const endpoint =
        API_ENDPOINTS.PRODUCTS.UNPUBLISH?.(productUuid) ||
        `/produits/${productUuid}/unpublish`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estPublie: false }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit dépublié avec succès");
        if (id) {
          await fetchBoutiqueData(id);
        }
      } else {
        throw new Error(result.message || "Erreur lors de la dépublication");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors de la dépublication",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const endpoint =
        API_ENDPOINTS.PRODUCTS.BLOCK?.(productUuid) ||
        `/produits/${productUuid}/block`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estBloque: true }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit bloqué avec succès");
        if (id) {
          await fetchBoutiqueData(id);
        }
      } else {
        throw new Error(result.message || "Erreur lors du blocage");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors du blocage",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockProduct = async (productUuid: string) => {
    try {
      setActionLoading(productUuid);

      const endpoint =
        API_ENDPOINTS.PRODUCTS.UNBLOCK?.(productUuid) ||
        `/produits/${productUuid}/unblock`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estBloque: false }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await handleApiResponse(response);

      if (result.success) {
        showAlert("success", "Produit débloqué avec succès");
        if (id) {
          await fetchBoutiqueData(id);
        }
      } else {
        throw new Error(result.message || "Erreur lors du déblocage");
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Erreur lors du déblocage",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;

    showConfirmation(
      "Supprimer les produits sélectionnés",
      `Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ? Cette action est irréversible.`,
      async () => {
        try {
          for (const productUuid of selectedProducts) {
            await handleDeleteProduct(productUuid);
          }
          setSelectedProducts([]);
          setShowConfirmModal(false);
        } catch (err) {
          console.error("Erreur lors de la suppression multiple:", err);
          showAlert("error", "Erreur lors de la suppression multiple");
        }
      },
    );
  };

  const handleRestoreSelected = () => {
    if (selectedProducts.length === 0) return;

    showConfirmation(
      "Restaurer les produits sélectionnés",
      `Êtes-vous sûr de vouloir restaurer ${selectedProducts.length} produit(s) ?`,
      async () => {
        try {
          const restorePromises = selectedProducts.map((productUuid) =>
            handleRestoreProduct(productUuid),
          );
          await Promise.all(restorePromises);
          setSelectedProducts([]);
          setShowConfirmModal(false);
        } catch (err) {
          console.error("Erreur lors de la restauration multiple:", err);
          showAlert("error", "Erreur lors de la restauration multiple");
        }
      },
    );
  };

  const handlePublishSelected = () => {
    if (selectedProducts.length === 0) return;

    showConfirmation(
      "Publier les produits sélectionnés",
      `Êtes-vous sûr de vouloir publier ${selectedProducts.length} produit(s) ?`,
      async () => {
        try {
          const publishPromises = selectedProducts.map((productUuid) =>
            handlePublishProduct(productUuid),
          );
          await Promise.all(publishPromises);
          setSelectedProducts([]);
          setShowConfirmModal(false);
        } catch (err) {
          console.error("Erreur lors de la publication multiple:", err);
          showAlert("error", "Erreur lors de la publication multiple");
        }
      },
    );
  };

  const calculateStats = () => {
    if (!boutique) return null;

    const totalProduits = boutique.produits.length;
    const produitsActifs = boutique.produits.filter(
      (p) => p.estPublie && !p.estBloque && !p.is_deleted,
    ).length;
    const produitsEnStock = boutique.produits.filter(
      (p) => p.quantite > 0 && !p.is_deleted,
    ).length;
    const produitsSupprimes = boutique.produits.filter(
      (p) => p.is_deleted,
    ).length;
    const totalValeurStock = boutique.produits
      .filter((p) => !p.is_deleted)
      .reduce((sum, p) => sum + parseFloat(p.prix) * p.quantite, 0);
    const produitsNote = boutique.produits.filter(
      (p) => parseFloat(p.note_moyenne) > 0,
    );
    const noteMoyenne =
      produitsNote.length > 0
        ? produitsNote.reduce((sum, p) => sum + parseFloat(p.note_moyenne), 0) /
          produitsNote.length
        : 0;

    return {
      totalProduits,
      produitsActifs,
      produitsEnStock,
      produitsSupprimes,
      totalValeurStock,
      noteMoyenne: noteMoyenne.toFixed(1),
    };
  };

  const getFilteredProducts = () => {
    if (!boutique) return [];

    let filtered = [...boutique.produits].filter((p) => !p.is_deleted);

    if (searchProduct) {
      filtered = filtered.filter(
        (p) =>
          p.libelle.toLowerCase().includes(searchProduct.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchProduct.toLowerCase())),
      );
    }

    switch (productSort) {
      case "nom":
        filtered.sort((a, b) => a.libelle.localeCompare(b.libelle));
        break;
      case "prix-croissant":
        filtered.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
        break;
      case "prix-decroissant":
        filtered.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
        break;
      case "stock":
        filtered.sort((a, b) => b.quantite - a.quantite);
        break;
      case "note":
        filtered.sort(
          (a, b) =>
            parseFloat(b.note_moyenne || "0") -
            parseFloat(a.note_moyenne || "0"),
        );
        break;
      case "date":
        filtered.sort(
          (a, b) =>
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime(),
        );
        break;
    }

    return filtered;
  };

  const getCurrentPageProducts = () => {
    const filteredProducts = getFilteredProducts();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(getFilteredProducts().length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>,
      );
    }

    return (
      <Pagination className="mb-0">
        <Pagination.First
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {pages}
        <Pagination.Next
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const renderLoadingState = () => {
    return (
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="text-muted">
            Chargement des détails de la boutique...
          </h4>
        </div>
      </Container>
    );
  };

  const renderErrorState = () => {
    return (
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      >
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
            <Alert
              variant="danger"
              className="text-center shadow-lg border-0 rounded-4 p-5"
            >
              <FaTimesCircle className="display-1 text-danger mb-4" />
              <Alert.Heading className="h2 mb-3">
                Erreur de chargement
              </Alert.Heading>
              <p className="mb-4 fs-5">{error}</p>
              <ButtonToolbar className="justify-content-center gap-3">
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={() => router.back()}
                >
                  <FaArrowLeft className="me-2" />
                  Retour
                </Button>
                <Button variant="primary" size="lg" onClick={handleRefresh}>
                  <FaSync className="me-2" />
                  Réessayer
                </Button>
              </ButtonToolbar>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  };

  const renderNotFoundState = () => {
    return (
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      >
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
            <Alert
              variant="warning"
              className="text-center shadow-lg border-0 rounded-4 p-5"
            >
              <FaStore className="display-1 text-warning mb-4" />
              <Alert.Heading className="h2 mb-3">
                Boutique non trouvée
              </Alert.Heading>
              <p className="mb-4 fs-5">
                La boutique demandée n'existe pas ou a été supprimée.
              </p>
              <Button
                variant="outline-warning"
                size="lg"
                onClick={() => router.back()}
              >
                <FaArrowLeft className="me-2" />
                Retour à la liste
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  };

  const renderContent = () => {
    const stats = calculateStats();
    const filteredProducts = getFilteredProducts();
    const currentProducts = getCurrentPageProducts();

    return (
      <>
        {/* Alertes flottantes */}
        {alert && (
          <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: 1060 }}
          >
            <Alert
              variant={alert.type}
              onClose={() => setAlert(null)}
              dismissible
              className="shadow-lg border-0"
              style={{ minWidth: "300px" }}
            >
              <div className="d-flex align-items-center">
                {alert.type === "success" && (
                  <FaCheckCircle className="me-2 fs-4" />
                )}
                {alert.type === "error" && (
                  <FaTimesCircle className="me-2 fs-4" />
                )}
                {alert.type === "warning" && (
                  <FaExclamationTriangle className="me-2 fs-4" />
                )}
                <div>
                  <strong className="d-block mb-1">
                    {alert.type === "success" && "Succès"}
                    {alert.type === "error" && "Erreur"}
                    {alert.type === "warning" && "Attention"}
                  </strong>
                  <span>{alert.message}</span>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Modal de confirmation */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
          className="modal-confirm"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="d-flex align-items-center text-warning">
              <FaExclamationTriangle className="me-2" />
              {confirmAction?.title || "Confirmation"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-3">
            <p className="fs-5 mb-0">{confirmAction?.message}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              className="px-4"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmAction?.action()}
              className="px-4"
            >
              Confirmer
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Contenu principal */}
        <Container fluid className="px-4 py-3 bg-light min-vh-100">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4 bg-white p-3 rounded-3 shadow-sm">
            <Breadcrumb.Item
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              className="text-decoration-none"
            >
              <FaChevronLeft className="me-2" />
              Boutiques
            </Breadcrumb.Item>
            <Breadcrumb.Item active className="fw-semibold">
              {boutique?.nom}
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-4">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-3">
                    <FaStore className="text-primary fs-1" />
                  </div>
                  <div>
                    <h1 className="display-6 fw-bold mb-2">{boutique!.nom}</h1>
                    <div className="d-flex flex-wrap gap-3">
                      <span className="text-muted d-flex align-items-center">
                        <FaTags className="me-2 text-primary" />
                        {boutique!.type_boutique.libelle}
                      </span>
                      <span className="text-muted d-flex align-items-center">
                        <FaBoxOpen className="me-2 text-success" />
                        {
                          boutique!.produits.filter((p) => !p.is_deleted).length
                        }{" "}
                        produits
                      </span>
                      <span className="text-muted d-flex align-items-center">
                        <FaCalendar className="me-2 text-info" />
                        Créée le{" "}
                        {new Date(boutique!.created_at).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <ButtonToolbar className="gap-2">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Actualiser</Tooltip>}
                  >
                    <Button
                      variant="outline-secondary"
                      onClick={handleRefresh}
                      disabled={refreshLoading}
                      className="rounded-3"
                    >
                      <FaSync className={refreshLoading ? "fa-spin" : ""} />
                    </Button>
                  </OverlayTrigger>
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center rounded-3"
                    onClick={() =>
                      router.push(
                        `/dashboard-agent/boutiques/edit/${boutique!.uuid}`,
                      )
                    }
                  >
                    <FaPencilAlt className="me-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="primary"
                    className="d-flex align-items-center rounded-3"
                    onClick={() =>
                      router.push(
                        `/dashboard-agent/produits/create?boutique=${boutique!.uuid}`,
                      )
                    }
                  >
                    <FaPlusCircle className="me-2" />
                    Nouveau produit
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </div>

          {/* Status Bar */}
          <div className="bg-white rounded-4 shadow-sm p-3 mb-4">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex flex-wrap align-items-center gap-3">
                  {getBoutiqueStatusBadge(boutique!.statut)}
                  {boutique!.est_bloque && (
                    <Badge
                      bg="danger"
                      className="px-4 py-2 d-flex align-items-center rounded-pill"
                    >
                      <FaLock className="me-2" />
                      Bloqué
                    </Badge>
                  )}
                  {boutique!.est_ferme && (
                    <Badge
                      bg="secondary"
                      className="px-4 py-2 d-flex align-items-center rounded-pill"
                    >
                      <FaDoorClosed className="me-2" />
                      Fermé
                    </Badge>
                  )}
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <Button
                  variant="link"
                  className="text-decoration-none"
                  onClick={() => router.back()}
                >
                  <FaArrowLeft className="me-2" />
                  Retour à la liste
                </Button>
              </Col>
            </Row>
          </div>

          <Row className="g-4">
            {/* Colonne principale */}
            <Col lg={8}>
              {/* Banner et Logo */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div
                  className="position-relative"
                  style={{
                    height: "250px",
                    backgroundImage: `url(${boutique!.banniere || "https://via.placeholder.com/1200x400/0d6efd/ffffff?text=Bannière+de+la+boutique"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="position-absolute top-0 end-0 m-3">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Partager</Tooltip>}
                    >
                      <Badge
                        bg="light"
                        text="dark"
                        className="px-4 py-3 rounded-pill shadow-sm"
                      >
                        <FaShareAlt className="me-2" />
                        Partager
                      </Badge>
                    </OverlayTrigger>
                  </div>
                </div>
                <Card.Body className="p-4">
                  <Row className="align-items-end">
                    <Col xs="auto">
                      <div
                        className="rounded-4 border border-4 border-white shadow-lg bg-white"
                        style={{
                          width: "140px",
                          height: "140px",
                          marginTop: "-80px",
                        }}
                      >
                        {boutique!.logo ? (
                          <img
                            src={boutique!.logo}
                            alt={`Logo ${boutique!.nom}`}
                            className="w-100 h-100 rounded-3 object-fit-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="w-100 h-100 d-flex align-items-center justify-content-center bg-light rounded-3"><FaStore className="text-muted fs-1" /></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light rounded-3">
                            <FaStore className="text-muted fs-1" />
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h2 className="h3 fw-bold mb-2">{boutique!.nom}</h2>
                          <p className="text-muted mb-0 fs-5">
                            {boutique!.description}
                          </p>
                        </div>
                        <OverlayTrigger
                          placement="bottom"
                          overlay={<Tooltip>Copier le lien</Tooltip>}
                        >
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-circle"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.href,
                              );
                              showAlert(
                                "success",
                                "Lien copié dans le presse-papier",
                              );
                            }}
                          >
                            <FaCopy />
                          </Button>
                        </OverlayTrigger>
                      </div>
                      <div className="mt-3 d-flex flex-wrap gap-4">
                        <span className="text-muted d-flex align-items-center">
                          <FaLink className="me-2 text-primary" />
                          <code className="bg-light p-2 rounded">
                            {boutique!.slug}
                          </code>
                        </span>
                        <span className="text-muted d-flex align-items-center">
                          <FaCalendarCheck className="me-2 text-success" />
                          Mise à jour:{" "}
                          {new Date(boutique!.updated_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Statistiques */}
              {stats && (
                <Row className="g-3 mb-4">
                  <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-gradient-primary">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-uppercase text-muted small mb-2">
                              Total Produits
                            </h6>
                            <h2 className="mb-0 fw-bold">
                              {stats.totalProduits}
                            </h2>
                          </div>
                          <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                            <FaBoxOpen className="text-primary fs-2" />
                          </div>
                        </div>
                        <ProgressBar
                          now={
                            (stats.produitsActifs / stats.totalProduits) * 100
                          }
                          variant="primary"
                          className="mt-3 rounded-pill"
                          style={{ height: "6px" }}
                        />
                        <small className="text-muted mt-2 d-block">
                          {stats.produitsActifs} produits actifs
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-gradient-success">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-uppercase text-muted small mb-2">
                              En Stock
                            </h6>
                            <h2 className="mb-0 fw-bold">
                              {stats.produitsEnStock}
                            </h2>
                          </div>
                          <div className="bg-success bg-opacity-10 p-3 rounded-3">
                            <FaWarehouse className="text-success fs-2" />
                          </div>
                        </div>
                        <ProgressBar
                          now={
                            (stats.produitsEnStock / stats.totalProduits) * 100
                          }
                          variant="success"
                          className="mt-3 rounded-pill"
                          style={{ height: "6px" }}
                        />
                        <small className="text-muted mt-2 d-block">
                          {(
                            (stats.produitsEnStock / stats.totalProduits) *
                            100
                          ).toFixed(0)}
                          % du stock
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-gradient-info">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-uppercase text-muted small mb-2">
                              Valeur Stock
                            </h6>
                            <h2 className="mb-0 fw-bold">
                              {formatPrice(stats.totalValeurStock.toString())}
                            </h2>
                          </div>
                          <div className="bg-info bg-opacity-10 p-3 rounded-3">
                            <FaMoneyBillWave className="text-info fs-2" />
                          </div>
                        </div>
                        <small className="text-muted mt-3 d-block">
                          Valeur totale des produits
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 bg-gradient-warning">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-uppercase text-muted small mb-2">
                              Note Moyenne
                            </h6>
                            <h2 className="mb-0 fw-bold">
                              {stats.noteMoyenne}
                              <small className="fs-6 text-muted ms-1">/5</small>
                            </h2>
                          </div>
                          <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                            <FaStar className="text-warning fs-2" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="d-flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`${i < Math.floor(parseFloat(stats.noteMoyenne)) ? "text-warning" : "text-muted"} fs-5`}
                              />
                            ))}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Produits */}
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 rounded-top-4 p-4">
                  <Row className="align-items-center">
                    <Col>
                      <h4 className="mb-0 d-flex align-items-center">
                        <FaBoxOpen className="text-primary me-3" />
                        Produits de la boutique
                        <Badge bg="primary" pill className="ms-3 px-3 py-2">
                          {filteredProducts.length}
                        </Badge>
                      </h4>
                    </Col>
                    <Col xs="auto">
                      {selectedProducts.length > 0 && (
                        <ButtonGroup size="sm" className="me-3">
                          <Button
                            variant="outline-danger"
                            className="d-flex align-items-center rounded-start-3"
                            onClick={handleDeleteSelected}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading ? (
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                            ) : (
                              <FaTrash className="me-2" />
                            )}
                            Supprimer ({selectedProducts.length})
                          </Button>
                          <Button
                            variant="outline-success"
                            className="d-flex align-items-center"
                            onClick={handleRestoreSelected}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading ? (
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                            ) : (
                              <FaUndo className="me-2" />
                            )}
                            Restaurer ({selectedProducts.length})
                          </Button>
                          <Button
                            variant="outline-primary"
                            className="d-flex align-items-center rounded-end-3"
                            onClick={handlePublishSelected}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading ? (
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                            ) : (
                              <FaEye className="me-2" />
                            )}
                            Publier ({selectedProducts.length})
                          </Button>
                        </ButtonGroup>
                      )}
                      <Button
                        variant="primary"
                        className="d-flex align-items-center rounded-3 px-4"
                        onClick={() =>
                          router.push(
                            `/dashboard-agent/produits/create?boutique=${boutique!.uuid}`,
                          )
                        }
                      >
                        <FaPlusCircle className="me-2" />
                        Nouveau produit
                      </Button>
                    </Col>
                  </Row>
                </Card.Header>

                {/* Filtres */}
                <Card.Body className="p-0">
                  <div className="p-4 bg-light border-bottom">
                    <Row className="g-3">
                      <Col md={6}>
                        <InputGroup className="shadow-sm">
                          <InputGroup.Text className="bg-white border-end-0">
                            <FaSearch className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            placeholder="Rechercher un produit..."
                            value={searchProduct}
                            onChange={(e) => {
                              setSearchProduct(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="border-start-0"
                          />
                          {searchProduct && (
                            <Button
                              variant="outline-secondary"
                              onClick={() => setSearchProduct("")}
                              className="border-start-0"
                            >
                              <FaTimes />
                            </Button>
                          )}
                        </InputGroup>
                      </Col>
                      <Col md={6}>
                        <InputGroup className="shadow-sm">
                          <InputGroup.Text className="bg-white border-end-0">
                            <FaFilter className="text-muted" />
                          </InputGroup.Text>
                          <Form.Select
                            value={productSort}
                            onChange={(e) => {
                              setProductSort(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="border-start-0"
                          >
                            <option value="nom">Trier par nom (A-Z)</option>
                            <option value="prix-croissant">
                              Prix (Croissant)
                            </option>
                            <option value="prix-decroissant">
                              Prix (Décroissant)
                            </option>
                            <option value="stock">Stock</option>
                            <option value="note">Note</option>
                            <option value="date">Date récente</option>
                          </Form.Select>
                        </InputGroup>
                      </Col>
                    </Row>
                  </div>

                  {/* Tableau des produits */}
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle p-4 d-inline-flex mb-4">
                        <FaBoxOpen
                          className="text-muted"
                          style={{ fontSize: "4rem" }}
                        />
                      </div>
                      <h5 className="text-muted mb-3">Aucun produit trouvé</h5>
                      <p className="text-muted mb-4">
                        {searchProduct
                          ? "Aucun produit ne correspond à votre recherche."
                          : "Cette boutique n'a pas encore de produits."}
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        className="px-5 rounded-3"
                        onClick={() =>
                          router.push(
                            `/dashboard-agent/produits/create?boutique=${boutique!.uuid}`,
                          )
                        }
                      >
                        <FaPlusCircle className="me-2" />
                        Ajouter un produit
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table hover className="align-middle mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="ps-4" style={{ width: "60px" }}>
                                <div className="d-flex align-items-center">
                                  <Form.Check
                                    type="checkbox"
                                    checked={
                                      selectedProducts.length ===
                                        currentProducts.length &&
                                      currentProducts.length > 0
                                    }
                                    onChange={handleSelectAllCurrentPage}
                                    className="form-check-lg me-2"
                                  />
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>Sélectionner tout</Tooltip>
                                    }
                                  >
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0"
                                      onClick={handleSelectAll}
                                    >
                                      <FaChevronDown />
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </th>
                              <th className="py-3">Produit</th>
                              <th className="py-3">Prix</th>
                              <th className="py-3">Stock</th>
                              <th className="py-3">Statut</th>
                              <th className="py-3">Notes</th>
                              <th className="py-3 text-end pe-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentProducts.map((produit) => (
                              <tr
                                key={produit.uuid}
                                className={
                                  selectedProducts.includes(produit.uuid)
                                    ? "table-active"
                                    : ""
                                }
                              >
                                <td className="ps-4">
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedProducts.includes(
                                      produit.uuid,
                                    )}
                                    onChange={() =>
                                      handleProductSelect(produit.uuid)
                                    }
                                    className="form-check-lg"
                                    disabled={actionLoading === produit.uuid}
                                  />
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div
                                      className="rounded-3 border bg-light me-3 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {produit.image ? (
                                        <img
                                          src={produit.image}
                                          alt={produit.libelle}
                                          className="w-100 h-100 object-fit-cover rounded-3"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.style.display = "none";
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.innerHTML =
                                                '<div class="w-100 h-100 d-flex align-items-center justify-content-center"><FaBox className="text-muted fs-4" /></div>';
                                            }
                                          }}
                                        />
                                      ) : (
                                        <FaBox className="text-muted fs-4" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="fw-semibold fs-6 mb-1">
                                        {produit.libelle}
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <Badge
                                          bg="light"
                                          text="dark"
                                          className="border rounded-pill px-3 py-2"
                                        >
                                          <FaTags className="me-2" />
                                          {produit.categorie?.libelle ||
                                            "Non catégorisé"}
                                        </Badge>
                                        {produit.description && (
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip>
                                                {produit.description}
                                              </Tooltip>
                                            }
                                          >
                                            <span className="text-muted cursor-pointer">
                                              <FaInfoCircle />
                                            </span>
                                          </OverlayTrigger>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-bold text-primary fs-6">
                                    {formatPrice(produit.prix)}
                                  </div>
                                </td>
                                <td>
                                  <Badge
                                    bg={
                                      produit.quantite > 0
                                        ? "success"
                                        : "danger"
                                    }
                                    className="d-flex align-items-center px-3 py-2 rounded-pill"
                                  >
                                    {produit.quantite > 0 ? (
                                      <FaCheckCircle className="me-2" />
                                    ) : (
                                      <FaTimesCircle className="me-2" />
                                    )}
                                    {produit.quantite}
                                  </Badge>
                                </td>
                                <td>{getStatusBadge(produit)}</td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                      <FaStar className="text-warning me-2" />
                                      <span className="fw-semibold">
                                        {produit.note_moyenne || "0.0"}
                                      </span>
                                      <span className="text-muted small ms-2">
                                        ({produit.nombre_avis} avis)
                                      </span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <FaHeart className="text-danger me-2" />
                                      <span className="text-muted small">
                                        {produit.nombre_favoris} favoris
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-end pe-4">
                                  <div className="d-flex justify-content-end gap-2">
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Voir détails</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="rounded-circle"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard-agent/annonces/produit/${produit.uuid}`,
                                          )
                                        }
                                        disabled={
                                          actionLoading === produit.uuid
                                        }
                                      >
                                        <FaEye />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Modifier</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="rounded-circle"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard-agent/produits/edit/${produit.uuid}`,
                                          )
                                        }
                                        disabled={
                                          actionLoading === produit.uuid
                                        }
                                      >
                                        <FaPencilAlt />
                                      </Button>
                                    </OverlayTrigger>
                                    {produit.estBloque ? (
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Débloquer</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-info"
                                          size="sm"
                                          className="rounded-circle"
                                          onClick={() =>
                                            showConfirmation(
                                              "Débloquer le produit",
                                              `Êtes-vous sûr de vouloir débloquer "${produit.libelle}" ?`,
                                              () =>
                                                handleUnblockProduct(
                                                  produit.uuid,
                                                ),
                                            )
                                          }
                                          disabled={
                                            actionLoading === produit.uuid
                                          }
                                        >
                                          {actionLoading === produit.uuid ? (
                                            <Spinner
                                              animation="border"
                                              size="sm"
                                            />
                                          ) : (
                                            <FaLockOpen />
                                          )}
                                        </Button>
                                      </OverlayTrigger>
                                    ) : (
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Bloquer</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          className="rounded-circle"
                                          onClick={() =>
                                            showConfirmation(
                                              "Bloquer le produit",
                                              `Êtes-vous sûr de vouloir bloquer "${produit.libelle}" ?`,
                                              () =>
                                                handleBlockProduct(
                                                  produit.uuid,
                                                ),
                                            )
                                          }
                                          disabled={
                                            actionLoading === produit.uuid
                                          }
                                        >
                                          {actionLoading === produit.uuid ? (
                                            <Spinner
                                              animation="border"
                                              size="sm"
                                            />
                                          ) : (
                                            <FaLock />
                                          )}
                                        </Button>
                                      </OverlayTrigger>
                                    )}
                                    {produit.estPublie ? (
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Dépublier</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="rounded-circle"
                                          onClick={() =>
                                            showConfirmation(
                                              "Dépublier le produit",
                                              `Êtes-vous sûr de vouloir dépublié "${produit.libelle}" ?`,
                                              () =>
                                                handleUnpublishProduct(
                                                  produit.uuid,
                                                ),
                                            )
                                          }
                                          disabled={
                                            actionLoading === produit.uuid
                                          }
                                        >
                                          {actionLoading === produit.uuid ? (
                                            <Spinner
                                              animation="border"
                                              size="sm"
                                            />
                                          ) : (
                                            <FaEyeSlash />
                                          )}
                                        </Button>
                                      </OverlayTrigger>
                                    ) : (
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Publier</Tooltip>}
                                      >
                                        <Button
                                          variant="outline-success"
                                          size="sm"
                                          className="rounded-circle"
                                          onClick={() =>
                                            showConfirmation(
                                              "Publier le produit",
                                              `Êtes-vous sûr de vouloir publier "${produit.libelle}" ?`,
                                              () =>
                                                handlePublishProduct(
                                                  produit.uuid,
                                                ),
                                            )
                                          }
                                          disabled={
                                            actionLoading === produit.uuid
                                          }
                                        >
                                          {actionLoading === produit.uuid ? (
                                            <Spinner
                                              animation="border"
                                              size="sm"
                                            />
                                          ) : (
                                            <FaEye />
                                          )}
                                        </Button>
                                      </OverlayTrigger>
                                    )}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Supprimer</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="rounded-circle"
                                        onClick={() =>
                                          showConfirmation(
                                            "Supprimer le produit",
                                            `Êtes-vous sûr de vouloir supprimer définitivement "${produit.libelle}" ? Cette action est irréversible.`,
                                            () =>
                                              handleDeleteProduct(produit.uuid),
                                          )
                                        }
                                        disabled={
                                          actionLoading === produit.uuid
                                        }
                                      >
                                        {actionLoading === produit.uuid ? (
                                          <Spinner
                                            animation="border"
                                            size="sm"
                                          />
                                        ) : (
                                          <FaTrash />
                                        )}
                                      </Button>
                                    </OverlayTrigger>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <Card.Footer className="bg-white border-0 p-4">
                          <Row className="align-items-center">
                            <Col>
                              <div className="text-muted">
                                Affichage{" "}
                                {Math.min(
                                  (currentPage - 1) * itemsPerPage + 1,
                                  filteredProducts.length,
                                )}{" "}
                                à{" "}
                                {Math.min(
                                  currentPage * itemsPerPage,
                                  filteredProducts.length,
                                )}{" "}
                                sur {filteredProducts.length} produit(s)
                                {selectedProducts.length > 0 && (
                                  <span className="text-primary fw-semibold ms-3">
                                    ({selectedProducts.length} sélectionné(s))
                                  </span>
                                )}
                              </div>
                            </Col>
                            <Col xs="auto">{renderPagination()}</Col>
                            <Col xs="auto">
                              <Form.Select
                                size="sm"
                                value={itemsPerPage}
                                onChange={() => setCurrentPage(1)}
                                className="rounded-3 border-0 bg-light"
                                style={{ width: "80px" }}
                              >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                              </Form.Select>
                            </Col>
                          </Row>
                        </Card.Footer>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              {/* Type de boutique */}
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-0 rounded-top-4 p-4">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaTags className="text-primary me-3" />
                    Type de boutique
                  </h5>
                </Card.Header>
                <Card.Body className="p-4 text-center">
                  <div
                    className="rounded-4 overflow-hidden mx-auto mb-4 shadow-sm"
                    style={{ width: "120px", height: "120px" }}
                  >
                    {boutique!.type_boutique.image ? (
                      <img
                        src={boutique!.type_boutique.image}
                        alt={boutique!.type_boutique.libelle}
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                        <FaTags className="text-muted fs-1" />
                      </div>
                    )}
                  </div>
                  <h4 className="mb-2">{boutique!.type_boutique.libelle}</h4>
                  <Badge bg="info" className="px-4 py-2 rounded-pill">
                    {boutique!.type_boutique.code}
                  </Badge>
                  <div className="mt-4 text-muted d-flex align-items-center justify-content-center">
                    <FaCheckCircle className="me-2 text-success" />
                    Boutique active et vérifiée
                  </div>
                </Card.Body>
              </Card>

              {/* Actions rapides */}
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-0 rounded-top-4 p-4">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaShieldAlt className="text-primary me-3" />
                    Actions rapides
                  </h5>
                </Card.Header>
                <Card.Body className="p-3">
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      className="text-start d-flex align-items-center p-3 rounded-3"
                      onClick={() =>
                        router.push(
                          `/dashboard-agent/boutiques/statistiques/${boutique!.uuid}`,
                        )
                      }
                    >
                      <FaChartBar className="me-3 fs-5" />
                      <div>
                        <div className="fw-semibold">Voir les statistiques</div>
                        <small className="text-muted">
                          Analyses et rapports
                        </small>
                      </div>
                    </Button>
                    <Button
                      variant="outline-success"
                      className="text-start d-flex align-items-center p-3 rounded-3"
                      onClick={() =>
                        router.push(
                          `/dashboard-agent/vendeurs/${boutique!.vendeurUuid}`,
                        )
                      }
                    >
                      <FaUsers className="me-3 fs-5" />
                      <div>
                        <div className="fw-semibold">Gérer le vendeur</div>
                        <small className="text-muted">
                          Informations du vendeur
                        </small>
                      </div>
                    </Button>
                    <Button
                      variant="outline-warning"
                      className="text-start d-flex align-items-center p-3 rounded-3"
                      onClick={() =>
                        router.push(
                          `/dashboard-agent/boutiques/horaires/${boutique!.uuid}`,
                        )
                      }
                    >
                      <FaClock className="me-3 fs-5" />
                      <div>
                        <div className="fw-semibold">Modifier les horaires</div>
                        <small className="text-muted">
                          Jours et heures d'ouverture
                        </small>
                      </div>
                    </Button>
                    <Button
                      variant="outline-info"
                      className="text-start d-flex align-items-center p-3 rounded-3"
                      onClick={() => router.push(`/dashboard-agent/categories`)}
                    >
                      <FaLayerGroup className="me-3 fs-5" />
                      <div>
                        <div className="fw-semibold">
                          Catégories de produits
                        </div>
                        <small className="text-muted">
                          Gestion des catégories
                        </small>
                      </div>
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Activité récente */}
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 rounded-top-4 p-4">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaClock className="text-primary me-3" />
                    Activité récente
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="timeline">
                    <div className="timeline-item mb-4">
                      <div className="timeline-badge bg-primary"></div>
                      <div className="timeline-content">
                        <small className="text-muted d-block mb-2">
                          {new Date(boutique!.updated_at).toLocaleString(
                            "fr-FR",
                          )}
                        </small>
                        <p className="mb-0 fw-semibold">
                          Dernière mise à jour de la boutique
                        </p>
                      </div>
                    </div>
                    <div className="timeline-item mb-4">
                      <div className="timeline-badge bg-success"></div>
                      <div className="timeline-content">
                        <small className="text-muted d-block mb-2">
                          Aujourd'hui
                        </small>
                        <p className="mb-0 fw-semibold">
                          {filteredProducts.length} produits disponibles
                        </p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-badge bg-info"></div>
                      <div className="timeline-content">
                        <small className="text-muted d-block mb-2">
                          {new Date().toLocaleDateString("fr-FR")}
                        </small>
                        <p className="mb-0 fw-semibold">
                          Dernière visite:{" "}
                          {new Date().toLocaleTimeString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-light border-0 rounded-bottom-4 p-3 text-center">
                  <small className="text-muted d-flex align-items-center justify-content-center">
                    <FaInfoCircle className="me-2" />
                    Dernière actualisation:{" "}
                    {new Date().toLocaleTimeString("fr-FR")}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>

        <style jsx>{`
          .timeline {
            position: relative;
            padding-left: 30px;
          }
          .timeline::before {
            content: "";
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #0d6efd, #20c997, #0dcaf0);
          }
          .timeline-item {
            position: relative;
          }
          .timeline-badge {
            position: absolute;
            left: -30px;
            top: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .timeline-content {
            margin-left: 20px;
          }
          .object-fit-cover {
            object-fit: cover;
          }
          .fa-spin {
            animation: fa-spin 2s infinite linear;
          }
          @keyframes fa-spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(359deg);
            }
          }
          .cursor-pointer {
            cursor: pointer;
          }
          .form-check-lg .form-check-input {
            width: 1.3rem;
            height: 1.3rem;
            margin-top: 0.15rem;
          }
          .bg-gradient-primary {
            background: linear-gradient(135deg, #f8f9ff 0%, #e7f1ff 100%);
          }
          .bg-gradient-success {
            background: linear-gradient(135deg, #f8fff9 0%, #e3f9e5 100%);
          }
          .bg-gradient-info {
            background: linear-gradient(135deg, #f8fcff 0%, #e1f3fe 100%);
          }
          .bg-gradient-warning {
            background: linear-gradient(135deg, #fff9f0 0%, #ffeed9 100%);
          }
          .modal-confirm .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </>
    );
  };

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (!boutique) {
    return renderNotFoundState();
  }

  return renderContent();
};

export default BoutiqueDetail;
