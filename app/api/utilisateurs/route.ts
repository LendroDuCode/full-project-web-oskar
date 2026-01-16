// app/api/utilisateurs/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("=== API ROUTE EXECUTÉE ===");

  try {
    // 1. Vérifier si le backend est accessible
    const backendUrl = "http://localhost:3005/admin/liste-utilisateurs";
    console.log("🌐 Appel backend vers:", backendUrl);

    // 2. Essayer d'abord SANS authentification (comme dans Postman)
    let response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("📡 Réponse backend (sans auth) - Status:", response.status);

    // Si ça fonctionne sans auth, retourner les données
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Données reçues du backend, count:", data.count || 0);
      return NextResponse.json(data);
    }

    // 3. Si échec sans auth, essayer AVEC le token du header
    if (response.status === 401) {
      console.log("🔄 Tentative avec authentification...");

      // Extraire le token du header Authorization
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const authToken = authHeader.substring(7);
        console.log("🔑 Token trouvé, longueur:", authToken.length);

        // Réessayer avec le token
        response = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          cache: "no-store",
        });

        console.log(
          "📡 Réponse backend (avec auth) - Status:",
          response.status,
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Données reçues du backend avec auth");
          return NextResponse.json(data);
        }
      }
    }

    // 4. Si toujours échec, vérifier si le backend est accessible
    console.log("🔍 Vérification de l'accessibilité du backend...");

    // Test de connexion simple
    const testResponse = await fetch("http://localhost:3005/", {
      method: "GET",
      headers: { Accept: "application/json" },
    }).catch(() => null);

    if (!testResponse || !testResponse.ok) {
      throw new Error(
        "Backend NestJS inaccessible. Vérifiez qu'il tourne sur le port 3005.",
      );
    }

    // 5. Si on arrive ici, c'est une autre erreur
    let errorDetails = "";
    try {
      errorDetails = await response.text();
    } catch (e) {
      errorDetails = "Impossible de lire le message d'erreur";
    }

    throw new Error(
      `Erreur backend ${response.status}: ${errorDetails.substring(0, 200)}`,
    );
  } catch (error: any) {
    console.error("🔥 Erreur:", error.message);

    // Retourner une erreur claire
    return NextResponse.json(
      {
        error: "Failed to fetch users from backend",
        message: error.message || "Erreur inconnue",
        status: "error",
      },
      { status: 500 },
    );
  }
}
