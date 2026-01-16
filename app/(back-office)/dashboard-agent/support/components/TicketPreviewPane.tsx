// components/TicketPreviewPane.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCheck,
  faEllipsisVertical,
  faUserSlash,
  faRotateLeft,
  faPaperPlane,
  faImage,
  faFilePdf,
  faTriangleExclamation,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface Message {
  id: number;
  sender: "user" | "admin" | "system";
  avatar: string;
  name: string;
  time: string;
  content: string;
  attachments?: Array<{
    id: number;
    type: "image" | "pdf" | "document";
    thumbnail?: string;
  }>;
}

interface Ticket {
  id: number;
  priority: "high" | "medium" | "low";
  title: string;
  ticketNumber: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  userStatus: "verifie" | "non-verifie";
  memberSince: string;
  messages: Message[];
}

interface TicketPreviewPaneProps {
  isOpen?: boolean;
  ticket?: Ticket;
  onClose?: () => void;
  onMarkResolved?: (ticketId: number) => void;
  onBanSeller?: (ticketId: number) => void;
  onRefund?: (ticketId: number) => void;
  onSendReply?: (ticketId: number, message: string) => void;
  className?: string;
  width?: string | number;
}

const defaultTicket: Ticket = {
  id: 1,
  priority: "high",
  title: "Arnaque détectée",
  ticketNumber: "#TK-2847",
  userName: "Moussa Traoré",
  userAvatar:
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  userHandle: "@mtraoré",
  userStatus: "verifie",
  memberSince: "Client depuis 2 ans",
  messages: [
    {
      id: 1,
      sender: "user",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      name: "Moussa Traoré",
      time: "Il y a 30 min",
      content:
        "Bonjour, je pense avoir été victime d'une arnaque. J'ai acheté un iPhone 13 Pro et le vendeur a disparu après le paiement. Je n'ai jamais reçu le produit et il ne répond plus à mes messages.",
    },
    {
      id: 2,
      sender: "user",
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      name: "Moussa Traoré",
      time: "Il y a 28 min",
      content:
        "Voici les captures d'écran de notre conversation et la preuve de paiement. Le montant était de 450 000 FCFA.",
      attachments: [
        { id: 1, type: "image" },
        { id: 2, type: "pdf" },
      ],
    },
    {
      id: 3,
      sender: "system",
      avatar: "",
      name: "Système",
      time: "Il y a 25 min",
      content: "Ticket créé automatiquement - Nécessite une action rapide",
    },
  ],
};

export default function TicketPreviewPane({
  isOpen = false,
  ticket = defaultTicket,
  onClose,
  onMarkResolved,
  onBanSeller,
  onRefund,
  onSendReply,
  className = "",
  width = 500,
}: TicketPreviewPaneProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  if (!isOpen) {
    return null;
  }

  const getPriorityColor = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "high":
        return "#EF4444"; // rouge
      case "medium":
        return "#F59E0B"; // orange
      case "low":
        return "#10B981"; // vert
      default:
        return colors.oskar.grey;
    }
  };

  const getPriorityIcon = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "high":
        return faTriangleExclamation;
      default:
        return faCircle;
    }
  };

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      onSendReply?.(ticket.id, replyMessage);
      setReplyMessage("");
      setIsReplying(false);
    }
  };

  const handleMarkResolved = () => {
    onMarkResolved?.(ticket.id);
  };

  const handleBanSeller = () => {
    onBanSeller?.(ticket.id);
  };

  const handleRefund = () => {
    onRefund?.(ticket.id);
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return faImage;
      case "pdf":
        return faFilePdf;
      default:
        return faFilePdf;
    }
  };

  const getAttachmentColor = (type: string) => {
    switch (type) {
      case "image":
        return "#8B5CF6"; // violet
      case "pdf":
        return "#EF4444"; // rouge
      default:
        return colors.oskar.grey;
    }
  };

  return (
    <div
      className={`bg-white border-start border-light h-100 d-flex flex-column position-relative ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        minWidth: typeof width === "number" ? `${width}px` : width,
        boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.08)",
        zIndex: 1000,
      }}
    >
      {/* En-tête */}
      <div className="border-bottom border-light p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <FontAwesomeIcon
              icon={getPriorityIcon(ticket.priority)}
              style={{
                color: getPriorityColor(ticket.priority),
                fontSize: "0.75rem",
              }}
            />
            <div>
              <h3
                className="fw-bold mb-1"
                style={{ color: colors.oskar.black, fontSize: "1.125rem" }}
              >
                {ticket.title}
              </h3>
              <p className="small text-muted mb-0">{ticket.ticketNumber}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0"
            onClick={onClose}
            style={{
              color: colors.oskar.grey,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.oskar.black;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.oskar.grey;
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: "1.25rem" }} />
          </button>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div
        className="border-bottom border-light p-4"
        style={{ backgroundColor: colors.oskar.lightGrey }}
      >
        <div className="d-flex align-items-center gap-4">
          <div
            className="rounded-circle overflow-hidden"
            style={{ width: "56px", height: "56px", flexShrink: 0 }}
          >
            <img
              src={ticket.userAvatar}
              alt={ticket.userName}
              className="w-100 h-100 object-cover"
            />
          </div>
          <div className="flex-grow-1">
            <p
              className="fw-semibold mb-1"
              style={{ color: colors.oskar.black }}
            >
              {ticket.userName}
            </p>
            <p className="small text-muted mb-2">{ticket.userHandle}</p>
            <div className="d-flex gap-2 flex-wrap">
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor:
                    ticket.userStatus === "verifie"
                      ? colors.oskar.green + "20"
                      : colors.oskar.lightGrey,
                  color:
                    ticket.userStatus === "verifie"
                      ? colors.oskar.green
                      : colors.oskar.grey,
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  fontWeight: "600",
                }}
              >
                {ticket.userStatus === "verifie" ? "Vérifié" : "Non vérifié"}
              </span>
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: colors.oskar.blue + "20",
                  color: colors.oskar.blue,
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  fontWeight: "600",
                }}
              >
                {ticket.memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-grow-1 overflow-auto p-4">
        <div className="d-flex flex-column gap-4">
          {ticket.messages.map((message) => (
            <div key={message.id}>
              {message.sender === "system" ? (
                <div className="d-flex justify-content-center">
                  <div
                    className="rounded-3 px-4 py-3"
                    style={{
                      backgroundColor: "#FEF3C7",
                      border: "1px solid #FDE68A",
                      maxWidth: "80%",
                    }}
                  >
                    <p
                      className="small fw-medium mb-0 d-flex align-items-center gap-2"
                      style={{ color: "#92400E" }}
                    >
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      <span>{message.content}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="d-flex gap-3">
                  {/* Avatar */}
                  {message.sender === "user" && (
                    <div
                      className="rounded-circle overflow-hidden flex-shrink-0"
                      style={{ width: "36px", height: "36px" }}
                    >
                      <img
                        src={message.avatar}
                        alt={message.name}
                        className="w-100 h-100 object-cover"
                      />
                    </div>
                  )}

                  {/* Contenu du message */}
                  <div className="flex-grow-1">
                    {/* En-tête du message */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <p
                        className="fw-semibold small mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {message.name}
                      </p>
                      <p className="small text-muted mb-0">{message.time}</p>
                    </div>

                    {/* Corps du message */}
                    <div
                      className="rounded-3 p-3"
                      style={{
                        backgroundColor:
                          message.sender === "user"
                            ? colors.oskar.lightGrey
                            : colors.oskar.green + "10",
                        border:
                          message.sender === "admin"
                            ? `1px solid ${colors.oskar.green}30`
                            : "none",
                      }}
                    >
                      <p
                        className="small mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {message.content}
                      </p>

                      {/* Pièces jointes */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="d-flex gap-2 mt-3">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="rounded-3 d-flex flex-column align-items-center justify-content-center"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  backgroundColor:
                                    getAttachmentColor(attachment.type) + "10",
                                  border: `1px solid ${getAttachmentColor(attachment.type)}30`,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    getAttachmentColor(attachment.type) + "20";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    getAttachmentColor(attachment.type) + "10";
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={getAttachmentIcon(attachment.type)}
                                  style={{
                                    color: getAttachmentColor(attachment.type),
                                    fontSize: "1.5rem",
                                    marginBottom: "0.5rem",
                                  }}
                                />
                                <span
                                  className="small text-uppercase"
                                  style={{
                                    color: getAttachmentColor(attachment.type),
                                    fontWeight: "600",
                                  }}
                                >
                                  {attachment.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="border-top border-light p-4">
        <div className="d-flex flex-column gap-3">
          {/* Actions principales */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={handleMarkResolved}
              style={{
                backgroundColor: colors.oskar.green,
                color: "white",
                padding: "0.75rem 1rem",
                fontWeight: "600",
                border: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.green;
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>Marquer comme résolu</span>
            </button>
            <button
              type="button"
              className="btn d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                width: "48px",
                padding: "0.75rem",
                border: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
              }}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>

          {/* Actions secondaires */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={handleBanSeller}
              style={{
                backgroundColor: colors.oskar.blue + "10",
                color: colors.oskar.blue,
                padding: "0.5rem 1rem",
                fontWeight: "500",
                border: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.oskar.blue + "20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.oskar.blue + "10";
              }}
            >
              <FontAwesomeIcon icon={faUserSlash} />
              <span>Bannir le vendeur</span>
            </button>
            <button
              type="button"
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={handleRefund}
              style={{
                backgroundColor: colors.oskar.orange + "10",
                color: colors.oskar.orange,
                padding: "0.5rem 1rem",
                fontWeight: "500",
                border: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.oskar.orange + "20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.oskar.orange + "10";
              }}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              <span>Rembourser</span>
            </button>
          </div>

          {/* Zone de réponse */}
          <div className="position-relative">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onFocus={() => setIsReplying(true)}
              onBlur={() => !replyMessage.trim() && setIsReplying(false)}
              placeholder="Répondre au ticket..."
              className="form-control rounded-3"
              style={{
                padding: "0.75rem",
                paddingRight: "100px",
                minHeight: "80px",
                resize: "none",
                borderColor: isReplying
                  ? colors.oskar.green
                  : colors.oskar.lightGrey,
                transition: "all 0.2s ease",
              }}
              rows={3}
            />
            <button
              type="button"
              className="btn position-absolute d-flex align-items-center gap-2"
              onClick={handleSendReply}
              disabled={!replyMessage.trim()}
              style={{
                bottom: "0.75rem",
                right: "0.75rem",
                backgroundColor: replyMessage.trim()
                  ? colors.oskar.green
                  : colors.oskar.lightGrey,
                color: replyMessage.trim() ? "white" : colors.oskar.grey,
                padding: "0.375rem 1rem",
                fontWeight: "500",
                border: "none",
                transition: "all 0.2s ease",
                opacity: replyMessage.trim() ? 1 : 0.6,
                cursor: replyMessage.trim() ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (replyMessage.trim()) {
                  e.currentTarget.style.backgroundColor =
                    colors.oskar.greenHover;
                }
              }}
              onMouseLeave={(e) => {
                if (replyMessage.trim()) {
                  e.currentTarget.style.backgroundColor = colors.oskar.green;
                }
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
