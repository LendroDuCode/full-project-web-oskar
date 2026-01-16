// app/(back-office)/dashboard-admin/utilisateurs/liste-utilisateurs/components/UserActionMenu.tsx
"use client";

import { useEffect, useRef } from "react";

interface User {
  id: number;
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  est_bloque: boolean;
}

interface UserActionMenuProps {
  user: User;
  position: { x: number; y: number };
  onAction: (action: string, user: User) => void;
  onClose: () => void;
}

export default function UserActionMenu({
  user,
  position,
  onAction,
  onClose,
}: UserActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Ajuster la position si le menu dépasse de l'écran
  const adjustedPosition = {
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <div
      ref={menuRef}
      className="position-fixed bg-white border rounded shadow-lg z-1050"
      style={{
        left: `${adjustedPosition.left}px`,
        top: `${adjustedPosition.top}px`,
        minWidth: "200px",
        zIndex: 1050,
      }}
    >
      <div className="p-3 border-bottom">
        <div className="fw-medium small">
          {user.nom} {user.prenoms}
        </div>
        <div className="text-muted extra-small">{user.email}</div>
      </div>

      <div className="py-2">
        <button
          onClick={() => onAction("view", user)}
          className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
        >
          <i className="fa-solid fa-eye text-primary"></i>
          <span>Voir détails</span>
        </button>

        <button
          onClick={() => onAction("edit", user)}
          className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
        >
          <i className="fa-solid fa-edit text-warning"></i>
          <span>Modifier</span>
        </button>

        {user.est_bloque ? (
          <button
            onClick={() => onAction("unblock", user)}
            className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
          >
            <i className="fa-solid fa-unlock text-success"></i>
            <span>Débloquer</span>
          </button>
        ) : (
          <button
            onClick={() => onAction("block", user)}
            className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
          >
            <i className="fa-solid fa-lock text-danger"></i>
            <span>Bloquer</span>
          </button>
        )}

        <button
          onClick={() => onAction("reset_password", user)}
          className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
        >
          <i className="fa-solid fa-key text-info"></i>
          <span>Réinitialiser MDP</span>
        </button>

        <div className="border-top my-2"></div>

        <button
          onClick={() => onAction("delete", user)}
          className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-3 w-100 px-3 py-2 hover-bg-light"
        >
          <i className="fa-solid fa-trash"></i>
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
}
