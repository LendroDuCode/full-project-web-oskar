"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faSpinner,
  faImage,
  faTag,
  faUpload,
  faCheckCircle,
  faExclamationTriangle,
  faTrash,
  faEdit,
  faList,
  faSearch,
  faChevronDown,
  faBox,
  faHandHoldingHeart,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface EditEchangeModalProps {
  isOpen: boolean;
  echange: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEchangeModal({
  isOpen,
  echange,
  onClose,
  onSuccess,
}: EditEchangeModalProps) {
  const [formData, setFormData] = useState({
    nomElementEchange: "",
    objetPropose: "",
    objetDemande: "",
    message: "",
    prix: "",
    categorie_uuid: "",
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ uuid: string; libelle: string }>>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          setCategories(response.map((item) => ({
            uuid: item.uuid,
            libelle: item.libelle || item.type || "Sans nom",
          })));
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const filteredCategories = categories.filter((cat) =>
    cat.libelle.toLowerCase().includes(searchCategory.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && echange) {
      setFormData({
        nomElementEchange: echange.nomElementEchange || "",
        objetPropose: echange.objetPropose || "",
        objetDemande: echange.objetDemande || "",
        message: echange.message || "",
        prix: echange.prix?.toString().replace(".00", "") || "",
        categorie_uuid: echange.categorie_uuid || "",
        image: null,
      });
      if (echange.image) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
        setImagePreview(`${apiUrl}${filesUrl}/${echange.image}`);
      } else if (echange.image_key) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
        setImagePreview(`${apiUrl}${filesUrl}/${echange.image_key}`);
      }
      setError(null);
      setSuccess(null);
      setValidationErrors({});
      setSearchCategory("");
      setIsCategoryDropdownOpen(false);
    }
  }, [isOpen, echange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) handleClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nomElementEchange.trim()) errors.nomElementEchange = "Le titre est obligatoire";
    if (!formData.objetPropose.trim()) errors.objetPropose = "L'objet proposé est obligatoire";
    if (!formData.objetDemande.trim()) errors.objetDemande = "L'objet demandé est obligatoire";
    if (!formData.categorie_uuid) errors.categorie_uuid = "La catégorie est obligatoire";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const selectCategory = (uuid: string) => {
    setFormData((prev) => ({ ...prev, categorie_uuid: uuid }));
    setSearchCategory("");
    setIsCategoryDropdownOpen(false);
    if (validationErrors.categorie_uuid) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.categorie_uuid;
        return newErrors;
      });
    }
  };

  const getSelectedCategoryLabel = (): string => {
    if (!formData.categorie_uuid) return "Sélectionnez une catégorie...";
    const selected = categories.find(c => c.uuid === formData.categorie_uuid);
    return selected?.libelle || "Sélectionnez une catégorie...";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (echange?.image) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
      const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
      setImagePreview(`${apiUrl}${filesUrl}/${echange.image}`);
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nomElementEchange", formData.nomElementEchange);
      formDataToSend.append("objetPropose", formData.objetPropose);
      formDataToSend.append("objetDemande", formData.objetDemande);
      formDataToSend.append("categorie_uuid", formData.categorie_uuid);
      formDataToSend.append("prix", formData.prix || "0");
      if (formData.message) formDataToSend.append("message", formData.message);
      if (formData.image) formDataToSend.append("image", formData.image);

      const response = await api.putFormData(
        API_ENDPOINTS.ECHANGES.UPDATE(echange.uuid),
        formDataToSend
      );

      if (response && response.success !== false) {
        setSuccess(response.message || "Échange modifié avec succès !");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error(response?.message || "Erreur lors de la modification");
      }
    } catch (err: any) {
      console.error("Erreur modification échange:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    const hasChanges = formData.nomElementEchange !== (echange?.nomElementEchange || "") || formData.image !== null;
    if (hasChanges && !confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) return;
    onClose();
  };

  if (!isOpen || !echange) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-md" ref={modalRef}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          <div className="modal-header text-white border-0" style={{ background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`, padding: "1.5rem 2rem" }}>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3"><FontAwesomeIcon icon={faEdit} className="fs-5" /></div>
              <div><h5 className="modal-title mb-0 fw-bold">Modifier l'échange</h5><p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>Modifiez les informations de votre échange</p></div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose} disabled={loading} />
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                <div className="d-flex align-items-center"><FontAwesomeIcon icon={faExclamationTriangle} className="text-danger fs-5 me-3" /><div><h6 className="alert-heading mb-1 fw-bold">Erreur</h6><p className="mb-0">{error}</p></div></div>
              </div>
            )}
            {success && (
              <div className="alert alert-success border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
                <div className="d-flex align-items-center"><FontAwesomeIcon icon={faCheckCircle} className="text-success fs-5 me-3" /><div><h6 className="alert-heading mb-1 fw-bold">Succès !</h6><p className="mb-0">{success}</p></div></div>
              </div>
            )}

            <form encType="multipart/form-data">
              <div className="mb-4">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faImage} className="me-2 text-primary" />Photo de l'échange</label>
                {imagePreview ? (
                  <div className="position-relative d-inline-block">
                    <img src={imagePreview} alt="Aperçu" className="img-fluid rounded-3 shadow" style={{ maxHeight: "150px", objectFit: "cover" }} />
                    <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={removeImage} disabled={loading} style={{ width: "28px", height: "28px", borderRadius: "50%", padding: 0 }}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                ) : (
                  <div className="border rounded-3 p-4 text-center" style={{ borderStyle: "dashed", borderColor: colors.oskar.grey, cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                    <FontAwesomeIcon icon={faImage} className="fs-2 text-muted mb-2" />
                    <p className="mb-0 small">Cliquez pour ajouter une photo</p>
                    <p className="text-muted mb-0" style={{ fontSize: "0.7rem" }}>JPG, PNG, WEBP, GIF (max 5MB)</p>
                    <input ref={fileInputRef} type="file" className="d-none" accept="image/*" onChange={handleImageUpload} />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faTag} className="me-2 text-primary" />Titre de l'échange *</label>
                <input type="text" name="nomElementEchange" className={`form-control ${validationErrors.nomElementEchange ? "is-invalid" : ""}`} value={formData.nomElementEchange} onChange={handleChange} disabled={loading} style={{ borderRadius: "10px", padding: "0.75rem 1rem" }} />
                {validationErrors.nomElementEchange && <div className="invalid-feedback">{validationErrors.nomElementEchange}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faBox} className="me-2 text-primary" />Objet que vous proposez *</label>
                <input type="text" name="objetPropose" className={`form-control ${validationErrors.objetPropose ? "is-invalid" : ""}`} value={formData.objetPropose} onChange={handleChange} disabled={loading} style={{ borderRadius: "10px", padding: "0.75rem 1rem" }} />
                {validationErrors.objetPropose && <div className="invalid-feedback">{validationErrors.objetPropose}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faHandHoldingHeart} className="me-2 text-primary" />Objet que vous recherchez *</label>
                <input type="text" name="objetDemande" className={`form-control ${validationErrors.objetDemande ? "is-invalid" : ""}`} value={formData.objetDemande} onChange={handleChange} disabled={loading} style={{ borderRadius: "10px", padding: "0.75rem 1rem" }} />
                {validationErrors.objetDemande && <div className="invalid-feedback">{validationErrors.objetDemande}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faList} className="me-2 text-primary" />Catégorie *</label>
                <div className="dropdown" ref={categoryDropdownRef}>
                  <button type="button" className={`form-select text-start d-flex align-items-center justify-content-between ${validationErrors.categorie_uuid ? "is-invalid" : ""}`} onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}>
                    <span className={!formData.categorie_uuid ? "text-muted" : ""}>{getSelectedCategoryLabel()}</span>
                    <FontAwesomeIcon icon={faChevronDown} className="text-muted" />
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="dropdown-menu show w-100 p-3" style={{ maxHeight: "250px", overflowY: "auto", position: "absolute", top: "100%", left: 0, zIndex: 1000 }}>
                      <div className="mb-2">
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0"><FontAwesomeIcon icon={faSearch} className="text-muted" /></span>
                          <input type="text" className="form-control" placeholder="Rechercher une catégorie..." value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} style={{ borderLeft: 0 }} autoFocus />
                        </div>
                      </div>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <button key={cat.uuid} type="button" className={`dropdown-item ${formData.categorie_uuid === cat.uuid ? "active" : ""}`} onClick={() => selectCategory(cat.uuid)}>{cat.libelle}</button>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">Aucune catégorie trouvée</div>
                      )}
                    </div>
                  )}
                </div>
                {validationErrors.categorie_uuid && <div className="invalid-feedback d-block">{validationErrors.categorie_uuid}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold"><FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />Prix estimé (FCFA)</label>
                <input type="number" name="prix" className="form-control" value={formData.prix} onChange={handleChange} disabled={loading} min="0" step="1" style={{ borderRadius: "10px", padding: "0.75rem 1rem" }} />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Message</label>
                <textarea name="message" className="form-control" rows={3} value={formData.message} onChange={handleChange} disabled={loading} placeholder="Les livres sont en excellent état, jamais lus. Je préfère un échange en ..." style={{ borderRadius: "10px", padding: "0.75rem 1rem" }} />
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4 pt-2 border-top">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={handleClose} disabled={loading} style={{ borderRadius: "10px" }}><FontAwesomeIcon icon={faTimes} className="me-2" />Annuler</button>
                <button type="button" className="btn text-white px-4" onClick={handleSubmit} disabled={loading} style={{ background: colors.oskar.green, borderRadius: "10px" }}>
                  {loading ? <><FontAwesomeIcon icon={faSpinner} spin className="me-2" />Enregistrement...</> : <><FontAwesomeIcon icon={faSave} className="me-2" />Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}