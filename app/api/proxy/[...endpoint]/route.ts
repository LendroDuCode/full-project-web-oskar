// app/api/proxy/[...endpoint]/route.ts - VERSION AVEC LOGGING DÉTAILLÉ
import { NextRequest, NextResponse } from "next/server";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

// Fonction pour extraire les params de manière compatible
async function extractParams(context: {
  params: Promise<{ endpoint: string[] }>;
}): Promise<string[]> {
  try {
    const params = await context.params;
    console.log("📦 Params extraits:", params);

    // Vérifier et normaliser les params
    if (!params || typeof params !== "object") {
      throw new Error("Params invalides");
    }

    const endpointArray = params.endpoint;



    // S'assurer que tous les éléments sont des strings
    return endpointArray.filter(item => typeof item === "string");
  } catch (error) {
    console.error("❌ Erreur extraction params:", error);
    throw error;
  }
}

// Fonction pour logger les détails de la requête
function logRequestDetails(
  method: string,
  requestUrl: string,
  backendUrl: string,
  headers: Headers,
  endpointParts: string[],
) {
  console.log("=".repeat(80));
  console.log("🚀 PROXY REQUEST DETAILS");
  console.log("=".repeat(80));
  console.log("📡 URL originale (Next.js):", requestUrl);
  console.log("🔗 URL backend:", backendUrl);
  console.log("⚡ Méthode:", method);
  console.log("📍 Endpoint parts:", endpointParts);
  console.log("📋 Headers envoyés:", Object.fromEntries(headers.entries()));
  console.log("=".repeat(80));
}

// Fonction pour analyser la réponse du backend
async function analyzeBackendResponse(response: Response, backendUrl: string) {
  console.log("=".repeat(80));
  console.log("📥 BACKEND RESPONSE ANALYSIS");
  console.log("=".repeat(80));
  console.log("🔗 Backend URL:", backendUrl);
  console.log("📊 Status:", response.status, response.statusText);

  const headers = Object.fromEntries(response.headers.entries());
  console.log("📋 Headers reçus:", headers);

  const contentType = headers["content-type"] || "";
  console.log("📄 Content-Type:", contentType);
  console.log("✅ Est-ce du JSON?", contentType.includes("application/json"));

  // Cloner la réponse pour lire le contenu
  const responseClone = response.clone();
  let responseText = "";

  try {
    responseText = await responseClone.text();
  } catch (error) {
    console.error("❌ Impossible de lire le contenu de la réponse:", error);
    responseText = "[CONTENU INDISPONIBLE]";
  }

  console.log("📏 Taille de la réponse:", responseText.length, "caractères");
  console.log("🔍 Début de la réponse (300 premiers caractères):");
  console.log(responseText.substring(0, 300));

  // Détecter si c'est du HTML
  const isHtml =
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.includes("<html") ||
    responseText.includes("<head>") ||
    (contentType.includes("text/html") &&
      !contentType.includes("application/json"));

  console.log("❓ Est-ce du HTML?", isHtml);

  if (isHtml) {
    console.error("❌ CRITIQUE: Le backend retourne du HTML au lieu de JSON!");

    // Analyser le type de HTML
    if (responseText.includes("404") || responseText.includes("Not Found")) {
      console.error(
        "⚠️  Détecté: Page d'erreur 404 - La route n'existe probablement pas",
      );
    }
    if (
      responseText.includes("Cannot GET") ||
      responseText.includes("Cannot POST")
    ) {
      console.error(
        "⚠️  Détecté: Message 'Cannot GET/POST' - Route inexistante",
      );
    }
    if (responseText.includes("<title>") && responseText.includes("</title>")) {
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        console.error("⚠️  Titre de la page HTML:", titleMatch[1]);
      }
    }
  }

  // Vérifier si c'est une erreur JSON
  const isJsonError =
    responseText.includes('"error"') ||
    responseText.includes('"message"') ||
    responseText.startsWith("{") ||
    responseText.startsWith("[");

  console.log("❓ Ressemble à du JSON?", isJsonError);

  // Vérifier les redirections
  if (response.status >= 300 && response.status < 400) {
    const location = headers["location"];
    console.error("⚠️  Détecté: Redirection vers", location);
  }

  console.log("=".repeat(80));

  return {
    contentType,
    responseText,
    isHtml,
    isJsonError,
    headers,
  };
}

// Fonction principale
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
  method: string,
) {
  const requestStartTime = Date.now();

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `🚀 NOUVELLE REQUÊTE PROXY - ${method} - ${new Date().toISOString()}`,
    );
    console.log(`${"=".repeat(80)}`);

    // Extraire les params
    let endpointParts: string[];
    try {
      endpointParts = await extractParams(context);
      console.log("✅ Endpoint parts extraits:", endpointParts);
    } catch (error: any) {
      console.error("❌ Erreur extraction params:", error);
      return NextResponse.json(
        {
          error: "Erreur de paramètres",
          message: error.message,
          diagnostic: {
            errorType: "ParamsExtractionError",
            timestamp: new Date().toISOString(),
          }
        },
        { status: 400 },
      );
    }

    // Vérifier qu'on a des parties
    if (!endpointParts || endpointParts.length === 0) {
      console.warn("⚠️  Endpoint parts est vide");
      return NextResponse.json(
        {
          error: "Endpoint manquant",
          message: "Veuillez spécifier un endpoint",
          diagnostic: {
            errorType: "EmptyEndpoint",
            timestamp: new Date().toISOString(),
          }
        },
        { status: 400 },
      );
    }

    // Vérifier que tous les éléments sont des strings
    const invalidParts = endpointParts.filter(item => typeof item !== "string");
    if (invalidParts.length > 0) {
      console.error("❌ Endpoint contient des éléments non-string:", invalidParts);
      return NextResponse.json(
        {
          error: "Endpoint invalide",
          message: "Les parties de l'endpoint doivent être des strings",
          diagnostic: {
            errorType: "InvalidEndpointType",
            invalidParts,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 400 },
      );
    }

    // Reconstruire le chemin
    const endpoint = `/${endpointParts.join("/")}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${API_BASE_URL}${endpoint}${searchParams ? `?${searchParams}` : ""}`;

    // Préparer les headers
    const headers = new Headers();

    // Copier les headers importants
    const copyHeaders = [
      "authorization",
      "content-type",
      "accept",
      "content-length",
      "user-agent",
      "referer",
      "accept-language",
      "accept-encoding",
    ];

    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (copyHeaders.includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    // FORCER les headers pour éviter les réponses HTML
    headers.set("Accept", "application/json, text/plain, */*");
    if (!headers.has("content-type")) {
      headers.set("Content-Type", "application/json");
    }

    // Ajouter un header pour identifier le proxy
    headers.set("X-Requested-With", "XMLHttpRequest");
    headers.set("X-Proxy-Source", "nextjs-proxy");

    // Logger les détails de la requête
    logRequestDetails(method, request.url, backendUrl, headers, endpointParts);

    // Gérer le body
    let body: BodyInit | null = null;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      try {
        body = await request.text();
        console.log(
          "📦 Body de la requête:",
          body ? `${body.length} caractères` : "vide",
        );
        if (body && !headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }
      } catch {
        body = null;
      }
    }

    // Options de fetch avec timeout
    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    };

    // Faire la requête avec timeout
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      fetchOptions.signal = controller.signal;

      response = await fetch(backendUrl, fetchOptions);

      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      console.error("❌ Erreur fetch:", fetchError);

      const errorMessage =
        fetchError.name === "AbortError"
          ? "Timeout: Le backend n'a pas répondu dans les 10 secondes"
          : fetchError.message;

      return NextResponse.json(
        {
          error: "Impossible de joindre le backend",
          message: errorMessage,
          backendUrl,
          timestamp: new Date().toISOString(),
          diagnostic: {
            errorType: fetchError.name === "AbortError" ? "TimeoutError" : "FetchError",
            duration: `${Date.now() - requestStartTime}ms`,
          }
        },
        { status: 502 },
      );
    }

    // Analyser la réponse du backend
    const analysis = await analyzeBackendResponse(response, backendUrl);

    // Traiter la réponse en fonction de l'analyse
    const responseHeaders = new Headers(response.headers);

    // Ajouter CORS
    responseHeaders.set("access-control-allow-origin", "*");
    responseHeaders.set("access-control-allow-credentials", "true");
    responseHeaders.set(
      "access-control-allow-methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    responseHeaders.set(
      "access-control-allow-headers",
      "authorization, content-type, accept, x-requested-with",
    );

    // Si le backend retourne du HTML au lieu de JSON
    if (analysis.isHtml && !analysis.isJsonError) {
      console.error(
        "🔥 ERREUR: Le backend retourne du HTML. Conversion en erreur JSON.",
      );

      return NextResponse.json(
        {
          error: "Backend returned HTML instead of JSON",
          message: `The backend at ${backendUrl} returned HTML content (${response.status} ${response.statusText}). This usually means the route doesn't exist or there's a server configuration issue.`,
          backendUrl,
          contentType: analysis.contentType,
          responsePreview: analysis.responseText.substring(0, 300),
          status: response.status,
          proxyDiagnostic: {
            endpoint: endpointParts.join("/"),
            requestMethod: method,
            isHtml: true,
            isJsonError: false,
            responseSize: analysis.responseText.length,
          },
        },
        {
          status: 502, // Bad Gateway
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
          },
        },
      );
    }

    // Si c'est une redirection
    if (response.status >= 300 && response.status < 400) {
      const location = responseHeaders.get("location");
      if (location) {
        responseHeaders.set("location", location);
        console.log("↪️  Redirection détectée vers:", location);
      }
    }

    // Lire et parser le corps de la réponse
    let responseBody;

    try {
      // Essayer de parser comme JSON d'abord
      if (
        analysis.responseText &&
        (analysis.contentType.includes("application/json") ||
          analysis.isJsonError ||
          analysis.responseText.trim().startsWith("{") ||
          analysis.responseText.trim().startsWith("["))
      ) {
        responseBody = JSON.parse(analysis.responseText);
        console.log("✅ Réponse parsée avec succès comme JSON");
      } else if (analysis.contentType.includes("text/")) {
        // Si c'est du texte mais pas du JSON
        responseBody = {
          text: analysis.responseText,
          _warning: "Response was plain text, wrapped in JSON by proxy",
        };
        console.log("⚠️  Réponse texte convertie en JSON");
      } else {
        // Pour les binaires
        responseBody = await response.blob();
        console.log("📦 Réponse binaire (Blob)");
      }
    } catch (parseError: any) {
      console.error("❌ Erreur parsing réponse:", parseError);

      // Si l'analyse indique que c'est du JSON mais le parsing échoue
      responseBody = {
        error: "Invalid JSON response",
        message: parseError.message,
        backendUrl,
        rawResponsePreview: analysis.responseText.substring(0, 500),
        contentType: analysis.contentType,
        status: response.status,
        proxyDiagnostic: {
          parseError: true,
          endpoint: endpointParts.join("/"),
          responseLength: analysis.responseText.length,
        },
      };
    }

    // Construire la réponse Next.js
    const nextResponseOptions = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };

    const requestDuration = Date.now() - requestStartTime;
    console.log(`⏱️  Durée totale de la requête proxy: ${requestDuration}ms`);
    console.log(`✅ Proxy terminé avec status: ${response.status}\n`);

    // Retourner la réponse appropriée
    if (responseBody instanceof Blob) {
      return new NextResponse(responseBody, nextResponseOptions);
    }

    // Ajouter des métadonnées de proxy pour le débogage
    const finalResponse = {
      ...(typeof responseBody === "object" && responseBody !== null
        ? responseBody
        : { data: responseBody }),
      _proxyMeta: {
        backendUrl,
        proxyTimestamp: new Date().toISOString(),
        requestDuration: `${requestDuration}ms`,
        status: response.status,
      },
    };

    return NextResponse.json(finalResponse, nextResponseOptions);
  } catch (error: any) {
    console.error("🔥 Erreur interne du proxy:", {
      message: error.message,
      stack: error.stack,
    });

    const errorDuration = Date.now() - requestStartTime;

    return NextResponse.json(
      {
        error: "Erreur interne du proxy",
        message: error.message,
        timestamp: new Date().toISOString(),
        proxyDiagnostic: {
          errorType: "InternalProxyError",
          duration: `${errorDuration}ms`,
          stack: error.stack?.split("\n").slice(0, 3).join("\n"),
        },
      },
      {
        status: 500,
        headers: {
          "access-control-allow-origin": "*",
          "content-type": "application/json",
        },
      },
    );
  }
}

// Export handlers
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
) {
  return handleRequest(request, context, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
) {
  return handleRequest(request, context, "POST");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
) {
  return handleRequest(request, context, "PUT");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
) {
  return handleRequest(request, context, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ endpoint: string[] }> },
) {
  return handleRequest(request, context, "DELETE");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers":
        "authorization, content-type, accept, x-requested-with, x-proxy-source",
      "access-control-max-age": "86400",
    },
  });
}

// Fonction pour tester directement le backend (optionnel)
export async function GET_TEST() {
  // Cette route permet de tester directement le backend
  // Accédez à: /api/proxy/_test
  console.log("🧪 Route de test du proxy activée");

  const testUrls = [
    `${API_BASE_URL}/categories`,
    `${API_BASE_URL}/admin/profile`,
    `${API_BASE_URL}/test`,
  ];

  const results = [];

  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      const isHtml =
        text.trim().startsWith("<!DOCTYPE") || text.includes("<html");

      results.push({
        url,
        status: response.status,
        contentType: response.headers.get("content-type"),
        isHtml,
        preview: text.substring(0, 200),
      });
    } catch (error: any) {
      results.push({
        url,
        error: error.message,
        status: "ERROR",
      });
    }
  }

  return NextResponse.json({
    message: "Test des routes backend",
    backendUrl: API_BASE_URL,
    results,
    timestamp: new Date().toISOString(),
  });
}