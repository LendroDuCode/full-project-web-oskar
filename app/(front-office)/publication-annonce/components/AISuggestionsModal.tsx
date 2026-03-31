"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faLightbulb,
  faCheckCircle,
  faTimesCircle,
  faSpellCheck,
  faMagic,
  faArrowRight,
  faExclamationTriangle,
  faShield,
  faTimes,
  faInfoCircle,
  faCheck,
  faSquare,
  faCheckSquare,
  faStar,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

export interface Suggestion {
  id: string;
  type: 'orthographe' | 'clarte' | 'amelioration';
  originalText: string;
  suggestedText: string;
  explication: string;
  champ: 'titre' | 'description' | 'localisation';
  confiance: number;
}

interface AISuggestionsModalProps {
  visible: boolean;
  suggestions: Suggestion[];
  onAcceptSuggestion: (suggestion: Suggestion) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onClose: () => void;
  type: "don" | "exchange" | "sale";
  moderationResult?: any;
}

const colors = {
  primary: "#10b981",
  primaryDark: "#059669",
  primaryLight: "#d1fae5",
  primaryBg: "#ecfdf5",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  gray: "#6b7280",
};

export default function AISuggestionsModal({
  visible,
  suggestions,
  onAcceptSuggestion,
  onAcceptAll,
  onRejectAll,
  onClose,
  type,
  moderationResult,
}: AISuggestionsModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filtrer les suggestions pour exclure celles sur la localisation
  const filteredSuggestions = suggestions.filter(
    (suggestion) => suggestion.champ !== 'localisation'
  );

  // État pour suivre les suggestions sélectionnées
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  // État pour la validation groupée
  const [isValidatingSelected, setIsValidatingSelected] = useState(false);

  if (!visible) return null;

  const typeLabel = type === "don" ? "Don" : type === "exchange" ? "Échange" : "Produit";

  const toggleSelection = (id: string) => {
    if (acceptedIds.has(id)) return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filteredSuggestions.map(s => s.id));
    const availableIds = new Set([...allIds].filter(id => !acceptedIds.has(id)));
    setSelectedIds(availableIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleValidateSelected = async () => {
    if (selectedIds.size === 0) return;
    
    setIsValidatingSelected(true);
    
    for (const suggestion of filteredSuggestions) {
      if (selectedIds.has(suggestion.id)) {
        await onAcceptSuggestion(suggestion);
        setAcceptedIds(prev => new Set(prev).add(suggestion.id));
      }
    }
    
    setIsValidatingSelected(false);
    setSelectedIds(new Set());
  };

  const handleAcceptSingle = async (suggestion: Suggestion) => {
    await onAcceptSuggestion(suggestion);
    setAcceptedIds(prev => new Set(prev).add(suggestion.id));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestion.id);
      return newSet;
    });
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "orthographe":
        return faSpellCheck;
      case "clarte":
        return faLightbulb;
      case "amelioration":
        return faMagic;
      default:
        return faLightbulb;
    }
  };

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case "orthographe":
        return "✏️ Orthographe";
      case "clarte":
        return "💡 Clarté";
      case "amelioration":
        return "✨ Amélioration";
      default:
        return "📝 Suggestion";
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "orthographe":
        return colors.warning;
      case "clarte":
        return colors.info;
      case "amelioration":
        return colors.success;
      default:
        return colors.gray;
    }
  };

  const selectedCount = selectedIds.size;
  const totalCount = filteredSuggestions.length;
  const acceptedCount = acceptedIds.size;

  if (filteredSuggestions.length === 0) {
    return (
      <>
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1060, backdropFilter: "blur(5px)" }}
          onClick={onClose}
        />
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ zIndex: 1070 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">
              <div
                className="modal-header border-0 py-3 py-md-4 px-4 px-md-5"
                style={{ background: colors.primaryLight }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle p-2 p-md-3 me-2 me-md-3 d-flex align-items-center justify-content-center"
                    style={{
                      background: colors.primary,
                      color: "white",
                      width: isMobile ? "45px" : "60px",
                      height: isMobile ? "45px" : "60px",
                    }}
                  >
                    <FontAwesomeIcon icon={faRobot} size={isMobile ? "lg" : "2x"} />
                  </div>
                  <div>
                    <h3 className="modal-title fw-bold mb-1" style={{ color: colors.primaryDark, fontSize: isMobile ? "1.25rem" : "1.5rem" }}>
                      ✨ IA OSKAR - Analyse de votre {typeLabel}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                      Votre annonce est conforme ! Aucune suggestion disponible.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Fermer"
                />
              </div>
              <div className="modal-body p-4 p-md-5 text-center">
                <div
                  className="rounded-circle p-3 p-md-4 d-inline-flex align-items-center justify-content-center mb-3 mb-md-4"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success" style={{ fontSize: isMobile ? "2rem" : "3rem" }} />
                </div>
                <h4 className="fw-bold mb-2 mb-md-3" style={{ color: colors.primaryDark, fontSize: isMobile ? "1.3rem" : "1.5rem" }}>✅ Annonce conforme !</h4>
                <p className="text-muted mb-3 mb-md-4" style={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                  Notre IA a analysé votre annonce et n'a détecté aucun problème à améliorer.
                </p>
                <button
                  className="btn rounded-pill px-4 px-md-5 py-2 py-md-3 fw-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    color: "white",
                    border: "none",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Continuer
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1060, backdropFilter: "blur(5px)" }}
        onClick={onClose}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1070 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">
            <div
              className="modal-header border-0 py-3 py-md-4 px-4 px-md-5"
              style={{ background: colors.primaryLight }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle p-2 p-md-3 me-2 me-md-3 d-flex align-items-center justify-content-center"
                  style={{
                    background: colors.primary,
                    color: "white",
                    width: isMobile ? "45px" : "60px",
                    height: isMobile ? "45px" : "60px",
                  }}
                >
                  <FontAwesomeIcon icon={faRobot} size={isMobile ? "lg" : "2x"} />
                </div>
                <div>
                  <h3 className="modal-title fw-bold mb-1" style={{ color: colors.primaryDark, fontSize: isMobile ? "1.1rem" : "1.5rem" }}>
                    ✨ IA OSKAR - Optimisation de votre {typeLabel}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: isMobile ? "0.75rem" : "0.9rem" }}>
                    {filteredSuggestions.length} suggestion(s) pour améliorer votre annonce
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fermer"
              />
            </div>

            <div className="modal-body p-0">
              {/* Score de confiance */}
              {filteredSuggestions.length > 0 && (
                <div className="px-3 px-md-4 pt-3 pt-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>Score de confiance IA</span>
                    <span className="small fw-bold text-success" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                      {Math.round(filteredSuggestions.reduce((sum, s) => sum + s.confiance, 0) / filteredSuggestions.length * 100)}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: isMobile ? "4px" : "6px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${filteredSuggestions.reduce((sum, s) => sum + s.confiance, 0) / filteredSuggestions.length * 100}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Affichage du score de modération */}
              {moderationResult?.ai_moderation_scores && (
                <div className="p-3 p-md-4 border-bottom" style={{ background: "#f8f9fa" }}>
                  <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: colors.primary, fontSize: isMobile ? "0.85rem" : "1rem" }}>
                    <FontAwesomeIcon icon={faShield} className="me-2" />
                    Scores de modération IA OSKAR
                  </h6>
                  <div className="row g-2">
                    {Object.entries(moderationResult.ai_moderation_scores)
                      .filter(([key, value]) => 
                        !['qualite_texte', 'orthographe', 'coherence_image_texte'].includes(key) && 
                        Number(value) > 0
                      )
                      .map(([key, value]) => (
                        <div key={key} className="col-12 col-sm-6">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                              {key === 'illicit' ? 'Contenu illicite' :
                               key === 'scam' ? 'Arnaque' :
                               key === 'vague' ? 'Description vague' :
                               key === 'inappropriate' ? 'Contenu inapproprié' :
                               key === 'violence' ? 'Violence' :
                               key === 'hate' ? 'Discours haineux' :
                               key}
                            </span>
                            <span className={`badge ${Number(value) > 0.5 ? 'bg-danger' : 'bg-success'} rounded-pill px-2 px-md-3 py-1 py-md-2`} style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                              {Math.round(Number(value) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="p-3 p-md-4">
                {/* Barre d'actions */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2 gap-md-0">
                  <div className="w-100 w-md-auto">
                    <h5 className="fw-bold mb-0" style={{ color: colors.primaryDark, fontSize: isMobile ? "1rem" : "1.1rem" }}>
                      <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                      Suggestions d'amélioration
                    </h5>
                    {acceptedCount > 0 && (
                      <small className="text-success d-block mt-1" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        {acceptedCount} suggestion(s) déjà acceptée(s)
                      </small>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedCount > 0 && (
                      <>
                        <span className="badge rounded-pill px-2 px-md-3 py-1 py-md-2" style={{ backgroundColor: colors.primaryLight, color: colors.primaryDark, fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                          <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                          {selectedCount} sélectionnée(s)
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2 px-md-3 py-1 py-md-2"
                          onClick={deselectAll}
                          disabled={isValidatingSelected}
                          style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                          <span className="d-none d-sm-inline">Tout désélectionner</span>
                        </button>
                        <button
                          className="btn btn-sm rounded-pill px-2 px-md-3 py-1 py-md-2 text-white"
                          style={{ backgroundColor: colors.primary, border: "none", fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                          onClick={handleValidateSelected}
                          disabled={isValidatingSelected}
                        >
                          {isValidatingSelected ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" />
                              <span className="d-none d-sm-inline">Validation...</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCheck} className="me-1" />
                              <span className="d-none d-sm-inline">Valider la sélection</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-2 px-md-3 py-1 py-md-2"
                      onClick={selectAll}
                      disabled={selectedCount === totalCount - acceptedCount || isValidatingSelected}
                      style={{ borderColor: colors.primary, color: colors.primary, fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                    >
                      <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                      <span className="d-none d-sm-inline">Tout sélectionner</span>
                    </button>
                    <button
                      className="btn btn-sm rounded-pill px-2 px-md-3 py-1 py-md-2 text-white"
                      style={{ backgroundColor: colors.primary, border: "none", fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                      onClick={onAcceptAll}
                      disabled={isValidatingSelected}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      <span className="d-none d-sm-inline">Tout accepter</span>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill px-2 px-md-3 py-1 py-md-2"
                      onClick={onRejectAll}
                      disabled={isValidatingSelected}
                      style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                      <span className="d-none d-sm-inline">Tout refuser</span>
                    </button>
                  </div>
                </div>

                <div className="suggestions-list" style={{ maxHeight: isMobile ? "400px" : "500px", overflowY: "auto" }}>
                  {filteredSuggestions.map((suggestion, index) => {
                    const isSelected = selectedIds.has(suggestion.id);
                    const isAccepted = acceptedIds.has(suggestion.id);
                    const suggestionColor = getSuggestionColor(suggestion.type);
                    const suggestionIcon = getSuggestionIcon(suggestion.type);
                    const suggestionLabel = getSuggestionLabel(suggestion.type);

                    return (
                      <div
                        key={suggestion.id}
                        className={`card mb-3 mb-md-4 border-0 shadow-sm transition-all ${isSelected ? 'border-primary' : ''} ${isAccepted ? 'opacity-75' : ''}`}
                        style={{
                          borderRadius: "16px",
                          borderLeft: `4px solid ${isSelected ? colors.primary : suggestionColor}`,
                          transition: "all 0.3s ease",
                          animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
                          backgroundColor: isSelected ? `${colors.primary}08` : 'white',
                        }}
                      >
                        <div className="card-body p-3 p-md-4">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3 mb-3">
                            <div className="d-flex align-items-center gap-2 gap-md-3 w-100 w-sm-auto">
                              {!isAccepted ? (
                                <div
                                  className="rounded-circle p-1 p-md-2 d-flex align-items-center justify-content-center flex-shrink-0 cursor-pointer"
                                  style={{
                                    width: isMobile ? "28px" : "32px",
                                    height: isMobile ? "28px" : "32px",
                                    backgroundColor: isSelected ? colors.primary : `${suggestionColor}20`,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                  }}
                                  onClick={() => toggleSelection(suggestion.id)}
                                >
                                  <FontAwesomeIcon
                                    icon={isSelected ? faCheckSquare : faSquare}
                                    style={{ color: isSelected ? "white" : suggestionColor, fontSize: isMobile ? "0.8rem" : "1rem" }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="rounded-circle p-1 p-md-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: isMobile ? "28px" : "32px",
                                    height: isMobile ? "28px" : "32px",
                                    backgroundColor: `${colors.success}20`,
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} style={{ color: colors.success, fontSize: isMobile ? "0.8rem" : "1rem" }} />
                                </div>
                              )}
                              <div className="flex-grow-1">
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                  <span
                                    className="badge rounded-pill px-2 px-md-3 py-1 py-md-2"
                                    style={{
                                      background: suggestionColor,
                                      color: "white",
                                      fontSize: isMobile ? "0.65rem" : "0.75rem",
                                    }}
                                  >
                                    {suggestionLabel}
                                  </span>
                                  <span className="text-muted small" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                    Confiance: {Math.round(suggestion.confiance * 100)}%
                                  </span>
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 px-md-3 py-1 py-md-2" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                    Champ: {suggestion.champ === "titre" ? "Titre" : "Description"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {!isAccepted && (
                              <button
                                className="btn btn-sm rounded-pill px-2 px-md-3 py-1 py-md-2 text-white w-100 w-sm-auto"
                                style={{
                                  background: suggestionColor,
                                  color: "white",
                                  border: "none",
                                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                                }}
                                onClick={() => handleAcceptSingle(suggestion)}
                                disabled={isValidatingSelected}
                              >
                                <FontAwesomeIcon icon={faArrowRight} className="me-1" />
                                Appliquer
                              </button>
                            )}
                            {isAccepted && (
                              <span className="text-success small fw-semibold">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                Acceptée
                              </span>
                            )}
                          </div>

                          <div className="row g-2 g-md-3 mt-2">
                            <div className="col-12 col-md-5">
                              <div
                                className="p-2 p-md-3 bg-light rounded-3"
                                style={{ borderLeft: "3px solid #ef4444" }}
                              >
                                <small className="text-danger fw-bold mb-1 d-block" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                  ❌ Texte original
                                </small>
                                <p className="mb-0 text-muted" style={{ fontSize: isMobile ? "0.8rem" : "0.85rem" }}>
                                  {suggestion.originalText || "(vide)"}
                                </p>
                              </div>
                            </div>
                            <div className="col-12 col-md-2 d-flex align-items-center justify-content-center">
                              <FontAwesomeIcon icon={faArrowRight} className="text-secondary" style={{ fontSize: isMobile ? "1rem" : "1.2rem" }} />
                            </div>
                            <div className="col-12 col-md-5">
                              <div
                                className="p-2 p-md-3 bg-light rounded-3"
                                style={{ borderLeft: "3px solid #10b981" }}
                              >
                                <small className="text-success fw-bold mb-1 d-block" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                                  ✅ Suggestion IA OSKAR
                                </small>
                                <p className="mb-0 fw-bold" style={{ color: suggestionColor, fontSize: isMobile ? "0.8rem" : "0.85rem" }}>
                                  {suggestion.suggestedText}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 pt-1 text-muted small d-flex align-items-start gap-2">
                            <FontAwesomeIcon icon={faInfoCircle} className="mt-1 flex-shrink-0" style={{ color: colors.primary, fontSize: isMobile ? "0.7rem" : "0.8rem" }} />
                            <span style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>{suggestion.explication}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="alert border-0 rounded-4 mt-3 mt-md-4 p-3 p-md-4"
                  style={{ background: colors.primaryLight }}
                >
                  <div className="d-flex flex-column flex-sm-row align-items-start gap-2 gap-md-3">
                    <FontAwesomeIcon
                      icon={faRobot}
                      className="fs-3 flex-shrink-0"
                      style={{ color: colors.primary }}
                    />
                    <div>
                      <h6 className="fw-bold mb-2" style={{ color: colors.primaryDark, fontSize: isMobile ? "0.9rem" : "1rem" }}>
                        <FontAwesomeIcon icon={faCrown} className="me-1" /> IA OSKAR - Intelligence Artificielle
                      </h6>
                      <p className="small mb-0 text-muted" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                        L'IA OSKAR analyse votre annonce en temps réel et propose des améliorations.
                        Vous pouvez sélectionner les suggestions une par une et les valider ensemble,
                        ou les accepter individuellement. Les suggestions sur la localisation ne sont pas prises en compte.
                      </p>
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        <span className="badge bg-white text-success rounded-pill px-2 py-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                          <FontAwesomeIcon icon={faStar} className="me-1" />
                          Précision élevée
                        </span>
                        <span className="badge bg-white text-success rounded-pill px-2 py-1" style={{ fontSize: isMobile ? "0.65rem" : "0.7rem" }}>
                          <FontAwesomeIcon icon={faMagic} className="me-1" />
                          Optimisation automatique
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 p-3 p-md-4" style={{ background: colors.primaryLight }}>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-2 gap-sm-0">
                <div>
                  <small className="text-muted" style={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                    <FontAwesomeIcon icon={faRobot} className="me-1" />
                    IA OSKAR v1.0 - Propulsé par OSKAR AI
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light rounded-pill px-3 px-md-4 py-1 py-md-2"
                    onClick={onClose}
                    disabled={isValidatingSelected}
                    style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Fermer
                  </button>
                  <button
                    className="btn rounded-pill px-4 px-md-5 py-1 py-md-2 fw-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                      border: "none",
                      fontSize: isMobile ? "0.8rem" : "0.9rem",
                    }}
                    onClick={onClose}
                    disabled={isValidatingSelected}
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="me-2" />
                    Continuer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .suggestions-list::-webkit-scrollbar {
          width: 4px;
        }
        
        @media (min-width: 768px) {
          .suggestions-list::-webkit-scrollbar {
            width: 6px;
          }
        }
        
        .suggestions-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb {
          background: ${colors.primaryLight};
          border-radius: 10px;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary};
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .progress-bar {
          border-radius: 10px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .modal-content {
            border-radius: 12px !important;
          }
          
          .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
}