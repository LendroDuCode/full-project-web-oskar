// app/api/utilisateurs/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // 1. Récupérer le token JWT depuis les cookies
    const cookieStore = await cookies();

    // Chercher les différents noms de cookies possibles
    const possibleTokenNames = [
      "access_token",
      "jwt_token",
      "auth_token",
      "token",
      "oskar_token", // D'après vos logs
    ];

    let authToken: string | undefined;

    for (const cookieName of possibleTokenNames) {
      const cookie = cookieStore.get(cookieName);
      if (cookie?.value) {
        authToken = cookie.value;
        console.log(`Token trouvé dans cookie: ${cookieName}`);
        break;
      }
    }

    // 2. Si pas dans les cookies, vérifier l'Authorization header
    if (!authToken) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        authToken = authHeader.substring(7);
        console.log("Token trouvé dans Authorization header");
      }
    }

    console.log("Token disponible:", !!authToken);

    // 3. Préparer les headers pour le backend
    const backendHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // 4. Ajouter le token JWT si disponible
    if (authToken) {
      backendHeaders["Authorization"] = `Bearer ${authToken}`;
    } else {
      // Si aucun token n'est trouvé, retourner une erreur 401
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Veuillez vous connecter pour accéder à cette ressource",
        },
        { status: 401 },
      );
    }

    // 5. Transmettre tous les cookies au backend (pour la session)
    const allCookies = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    if (allCookies) {
      backendHeaders["Cookie"] = allCookies;
    }

    // 6. Appeler le backend NestJS
    const backendUrl = "http://localhost:3005/admin/liste-utilisateurs";
    console.log("Appel backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: backendHeaders,
      cache: "no-store", // Important pour les données dynamiques
    });

    // 7. Traiter la réponse du backend
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);

      return NextResponse.json(
        {
          error: `Backend error: ${response.status}`,
          details: errorText,
          status: "error",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users from backend",
        message: "Erreur de connexion au serveur",
        status: "error",
      },
      { status: 500 },
    );
  }
}
