// Proxy pour contourner CORS avec WooCommerce
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Autoriser uniquement les requêtes depuis votre domaine
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://sgi.maghreboffice.com', 'http://localhost:5173'];
  
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WC-URL, X-WC-Consumer-Key, X-WC-Consumer-Secret',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Gérer preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Récupérer les paramètres depuis les headers
    const wcUrl = request.headers.get('X-WC-URL');
    const consumerKey = request.headers.get('X-WC-Consumer-Key');
    const consumerSecret = request.headers.get('X-WC-Consumer-Secret');
    const endpoint = new URL(request.url).searchParams.get('endpoint');

    if (!wcUrl || !consumerKey || !consumerSecret || !endpoint) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construire l'URL WooCommerce avec authentification
    const url = new URL(endpoint, wcUrl);
    url.searchParams.set('consumer_key', consumerKey);
    url.searchParams.set('consumer_secret', consumerSecret);

    // Faire la requête vers WooCommerce
    const wcResponse = await fetch(url.toString(), {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const data = await wcResponse.text();

    return new Response(data, {
      status: wcResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
