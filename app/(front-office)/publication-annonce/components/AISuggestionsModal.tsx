// app/(front-office)/publication-annonce/components/AISuggestionsModal.tsx

"use client";

import { useState } from "react";
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

const colorsByType = {
  don: {
    primary: "#8b5cf6",
    light: "#ede9fe",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  },
  exchange: {
    primary: "#007aff",
    light: "#e6f2ff",
    gradient: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
  },
  sale: {
    primary: "#34c759",
    light: "#e6f7ec",
    gradient: "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
  },
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
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  if (!visible) return null;

  const colors = colorsByType[type];
  const typeLabel = type === "don" ? "Don" : type === "exchange" ? "Échange" : "Produit";

  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    setAcceptedIds(prev => new Set(prev).add(suggestion.id));
    onAcceptSuggestion(suggestion);
  };

  const handleAcceptAll = () => {
    const newAcceptedIds = new Set(acceptedIds);
    suggestions.forEach(s => newAcceptedIds.add(s.id));
    setAcceptedIds(newAcceptedIds);
    onAcceptAll();
  };

  const handleRejectAll = () => {
    setAcceptedIds(new Set());
    onRejectAll();
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
        return "#f59e0b";
      case "clarte":
        return "#3b82f6";
      case "amelioration":
        return "#10b981";
      default:
        return "#6c757d";
    }
  };

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
              className="modal-header border-0 py-4 px-5"
              style={{ background: colors.light }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle p-3 me-3 d-flex align-items-center justify-content-center"
                  style={{
                    background: colors.primary,
                    color: "white",
                    width: "60px",
                    height: "60px",
                  }}
                >
                  <FontAwesomeIcon icon={faRobot} size="lg" />
                </div>
                <div>
                  <h3 className="modal-title fw-bold mb-1">
                    ✨ Analyse IA de votre {typeLabel}
                  </h3>
                  <p className="text-muted mb-0">
                    {suggestions.length > 0
                      ? `Notre IA a trouvé ${suggestions.length} suggestion(s) pour améliorer votre annonce`
                      : "Votre annonce est conforme !"}
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
              {/* Affichage du score de modération */}
              {moderationResult?.ai_moderation_scores && (
                <div className="p-4 border-bottom" style={{ background: "#f8f9fa" }}>
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faShield} className="me-2 text-primary" />
                    Scores de modération
                  </h6>
                  <div className="row g-2">
                    {Object.entries(moderationResult.ai_moderation_scores)
                      .filter(([key, value]) => 
                        !['qualite_texte', 'orthographe', 'coherence_image_texte'].includes(key) && 
                        Number(value) > 0
                      )
                      .map(([key, value]) => (
                        <div key={key} className="col-6">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">
                              {key === 'illicit' ? 'Contenu illicite' :
                               key === 'scam' ? 'Arnaque' :
                               key === 'vague' ? 'Description vague' :
                               key === 'inappropriate' ? 'Contenu inapproprié' :
                               key === 'violence' ? 'Violence' :
                               key === 'hate' ? 'Discours haineux' :
                               key}
                            </span>
                            <span className={`badge ${Number(value) > 0.5 ? 'bg-danger' : 'bg-success'} rounded-pill px-3 py-2`}>
                              {Math.round(Number(value) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {suggestions.length > 0 ? (
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      <FontAwesomeIcon icon={faLightbulb} className="me-2 text-warning" />
                      {suggestions.length} suggestion(s) d'amélioration
                    </h5>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-success rounded-pill px-3 py-2"
                        onClick={handleAcceptAll}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Tout accepter
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2"
                        onClick={handleRejectAll}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                        Tout refuser
                      </button>
                    </div>
                  </div>

                  <div className="suggestions-list" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {suggestions.map((suggestion, index) => {
                      const isAccepted = acceptedIds.has(suggestion.id);
                      const suggestionColor = getSuggestionColor(suggestion.type);
                      const suggestionIcon = getSuggestionIcon(suggestion.type);
                      const suggestionLabel = getSuggestionLabel(suggestion.type);

                      return (
                        <div
                          key={suggestion.id}
                          className="card mb-4 border-0 shadow-sm"
                          style={{
                            borderRadius: "16px",
                            borderLeft: `5px solid ${suggestionColor}`,
                            transition: "all 0.3s ease",
                            opacity: isAccepted ? 0.7 : 1,
                            animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    background: `${suggestionColor}20`,
                                    width: "40px",
                                    height: "40px",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={suggestionIcon}
                                    style={{ color: suggestionColor, fontSize: "1.2rem" }}
                                  />
                                </div>
                                <div>
                                  <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={{
                                      background: suggestionColor,
                                      color: "white",
                                    }}
                                  >
                                    {suggestionLabel}
                                  </span>
                                  <span className="ms-2 text-muted small">
                                    Confiance: {Math.round(suggestion.confiance * 100)}%
                                  </span>
                                  <span className="ms-2 badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">
                                    Champ: {suggestion.champ}
                                  </span>
                                </div>
                              </div>
                              {!isAccepted && (
                                <button
                                  className="btn btn-sm rounded-pill px-4 py-2"
                                  style={{
                                    background: suggestionColor,
                                    color: "white",
                                    border: "none",
                                  }}
                                  onClick={() => handleAcceptSuggestion(suggestion)}
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

                            <div className="row g-3 mt-2">
                              <div className="col-md-5">
                                <div
                                  className="p-3 bg-light rounded-3"
                                  style={{ borderLeft: "3px solid #ef4444" }}
                                >
                                  <small className="text-danger fw-bold mb-2 d-block">
                                    ❌ Texte original
                                  </small>
                                  <p className="mb-0 text-muted">
                                    {suggestion.originalText || "(vide)"}
                                  </p>
                                </div>
                              </div>
                              <div className="col-md-2 d-flex align-items-center justify-content-center">
                                <FontAwesomeIcon icon={faArrowRight} className="text-secondary fa-lg" />
                              </div>
                              <div className="col-md-5">
                                <div
                                  className="p-3 bg-light rounded-3"
                                  style={{ borderLeft: "3px solid #10b981" }}
                                >
                                  <small className="text-success fw-bold mb-2 d-block">
                                    ✅ Suggestion
                                  </small>
                                  <p className="mb-0 fw-bold" style={{ color: suggestionColor }}>
                                    {suggestion.suggestedText}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 text-muted small d-flex align-items-start gap-2">
                              <FontAwesomeIcon icon={faInfoCircle} className="mt-1 text-primary" />
                              <span>{suggestion.explication}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="alert alert-info border-0 rounded-4 mt-4 p-4"
                    style={{ background: colors.light }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <FontAwesomeIcon
                        icon={faRobot}
                        className="fs-3"
                        style={{ color: colors.primary }}
                      />
                      <div>
                        <h6 className="fw-bold mb-2">Comment ça fonctionne ?</h6>
                        <p className="small mb-0">
                          L'IA analyse votre annonce et propose des améliorations.
                          Vous pouvez accepter chaque suggestion individuellement ou toutes en une fois.
                          Votre annonce sera automatiquement améliorée avant publication !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 px-4">
                  <div
                    className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-4"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1" />
                  </div>
                  <h4 className="fw-bold mb-3">✅ Annonce conforme !</h4>
                  <p className="text-muted mb-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
                    Notre IA a analysé votre annonce et n'a détecté aucun problème.
                    Elle va être publiée automatiquement.
                  </p>
                  <button
                    className="btn rounded-pill px-5 py-3 fw-bold"
                    style={{
                      background: colors.gradient,
                      color: "white",
                      border: "none",
                    }}
                    onClick={onClose}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Continuer
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-4 bg-light">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <small className="text-muted">
                    <FontAwesomeIcon icon={faRobot} className="me-1" />
                    IA propulsée par OSKAR AI
                  </small>
                </div>
                <div className="d-flex gap-3">
                  <button
                    className="btn btn-light rounded-pill px-4 py-2"
                    onClick={onClose}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Fermer
                  </button>
                  <button
                    className="btn rounded-pill px-5 py-2 fw-bold"
                    style={{
                      background: colors.gradient,
                      color: "white",
                      border: "none",
                    }}
                    onClick={onClose}
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
          width: 6px;
        }
        
        .suggestions-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .suggestions-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}