// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [count, setCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Détecter si on est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Données de démonstration
  const features = [
    {
      id: 1,
      title: 'Routing App',
      description: 'Système de routing basé sur le système de fichiers',
      icon: '🚀'
    },
    {
      id: 2,
      title: 'Server Components',
      description: 'Composants serveur par défaut pour de meilleures performances',
      icon: '⚡'
    },
    {
      id: 3,
      title: 'Optimisation d\'images',
      description: 'Optimisation automatique avec le composant Image',
      icon: '🖼️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold">Next.js App</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-blue-600">
              Accueil
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600">
              À propos
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600">
              Contact
            </Link>
          </nav>
          
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Commencer
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Bienvenue sur votre{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              application Next.js
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Une page de démarrage moderne avec Tailwind CSS, composants interactifs
            et toutes les fonctionnalités essentielles de Next.js 14.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Explorer le tableau de bord
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Lire la documentation
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Fonctionnalités principales</h2>
              <p className="mt-4 text-lg text-gray-600">
                Découvrez les capacités puissantes de Next.js 14
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Counter Component */}
        <section className="mt-20">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Composant interactif</h2>
              <p className="mt-2 text-gray-600">
                Exemple de composant client avec useState et useEffect
              </p>
              
              <div className="mt-8">
                <div className="inline-flex items-center gap-4 rounded-lg bg-white px-6 py-4 shadow-sm">
                  <span className="text-lg font-medium text-gray-700">Compteur :</span>
                  <span className="text-3xl font-bold text-blue-600">{count}</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCount(count - 1)}
                      className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setCount(count + 1)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setCount(0)}
                      className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-500">
                  {isClient ? 'Côté client ✓' : 'Côté serveur...'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Fetching Example */}
        <section className="mt-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Récupération de données</h2>
            <p className="mt-2 text-gray-600 text-center">
              Exemple de récupération de données côté client
            </p>
            
            <div className="mt-8">
              {/* Vous pouvez remplacer cette section par un vrai fetch API */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Liste des utilisateurs (exemple)</h3>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    API Ready
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Jean Dupont', role: 'Admin', status: 'Actif' },
                    { id: 2, name: 'Marie Curie', role: 'Éditeur', status: 'Actif' },
                    { id: 3, name: 'Paul Martin', role: 'Utilisateur', status: 'Inactif' }
                  ].map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="font-bold text-white">N</span>
                </div>
                <span className="text-lg font-bold">Next.js App</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Construit avec Next.js 14 et Tailwind CSS
              </p>
            </div>
            
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                Confidentialité
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                Conditions
              </Link>
              <Link href="https://nextjs.org" className="text-sm text-gray-600 hover:text-blue-600" target="_blank">
                Documentation Next.js
              </Link>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Votre application Next.js. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}