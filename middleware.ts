import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  console.log(`🛡️ Middleware - Chemin: ${path}`);

  // Routes protégées (dashboards)
  const protectedPaths = [
    "/dashboard-admin",
    "/dashboard-agent",
    "/dashboard-vendeur",
    "/dashboard-utilisateur",
  ];

  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath),
  );

  // Vérifier les cookies
  const userCookie = request.cookies.get("oskar_user");
  const tokenCookie = request.cookies.get("oskar_token");

  console.log(
    `🛡️ Cookies présents: user=${!!userCookie?.value}, token=${!!tokenCookie?.value}`,
  );

  // Si l'utilisateur est connecté
  if (userCookie?.value && tokenCookie?.value) {
    try {
      const user = JSON.parse(userCookie.value);
      const userType = user.type;

      console.log(`🛡️ Utilisateur connecté: type=${userType}`);

      // Si l'utilisateur accède à une route protégée
      if (isProtectedPath) {
        const requiredType = path.split("/")[1].replace("dashboard-", "");

        console.log(`🛡️ Route protégée détectée, type requis: ${requiredType}`);

        if (userType === requiredType) {
          console.log(`🛡️ Accès autorisé à ${path}`);
          return NextResponse.next();
        } else {
          // Type utilisateur invalide pour cette route
          console.log(
            `🛡️ Type utilisateur invalide (${userType} ≠ ${requiredType})`,
          );
          const homeUrl = new URL("/", request.url);
          return NextResponse.redirect(homeUrl);
        }
      }

      // Si l'utilisateur est sur la page d'accueil (/), NE PAS rediriger
      // Laisser l'utilisateur sur la page d'accueil même s'il est connecté
      if (path === "/") {
        console.log(`🛡️ Utilisateur sur page d'accueil, pas de redirection`);
        return NextResponse.next();
      }

      // Pour les autres routes publiques, ne rien faire
      console.log(`🛡️ Route publique, accès autorisé`);
      return NextResponse.next();
    } catch (error) {
      console.error("❌ Middleware - Erreur parsing cookie:", error);
    }
  }
  // Si l'utilisateur n'est PAS connecté
  else {
    if (isProtectedPath) {
      console.log(`🛡️ Utilisateur non connecté tentant d'accéder à ${path}`);
      // Rediriger vers la page d'accueil
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    // Pour les routes publiques, autoriser l'accès
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard-admin/:path*",
    "/dashboard-agent/:path*",
    "/dashboard-vendeur/:path*",
    "/dashboard-utilisateur/:path*",
  ],
};
