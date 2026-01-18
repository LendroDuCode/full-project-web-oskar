'use client'; // Optionnel - seulement si vous avez besoin de hooks React côté client

import { useState } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Bienvenue sur Next.js !</h1>
      <p className="description">
        Ceci est une page basique générée avec Next.js 14
      </p>
      
      <div className="card">
        <h2>Compteur interactif</h2>
        <p>Compteur : {count}</p>
        <div className="button-group">
          <button 
            onClick={() => setCount(count + 1)}
            className="button"
          >
            Incrémenter
          </button>
          <button 
            onClick={() => setCount(0)}
            className="button secondary"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="features">
        <h2>Fonctionnalités Next.js</h2>
        <ul>
          <li>✓ Rend côté serveur (SSR)</li>
          <li>✓ Génération de sites statiques (SSG)</li>
          <li>✓ Routing automatique</li>
          <li>✓ Optimisation des images</li>
          <li>✓ Support TypeScript natif</li>
        </ul>
      </div>

      <div className="link-card">
        <h3>Documentation</h3>
        <p>
          Consultez la{' '}
          <a 
            href="https://nextjs.org/docs" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            documentation officielle
          </a>
        </p>
      </div>
    </div>
  );
}