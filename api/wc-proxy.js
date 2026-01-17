// Proxy pour contourner CORS avec WooCommerce
export default async function handler(req, res) {
  // Headers CORS
  const allowedOrigins = ['https://sgi.maghreboffice.com', 'https://maghreboffice.vercel.app', 'http://localhost:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-WC-URL, X-WC-Consumer-Key, X-WC-Consumer-Secret');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Gérer preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Récupérer les paramètres
    const wcUrl = req.headers['x-wc-url'];
    const consumerKey = req.headers['x-wc-consumer-key'];
    const consumerSecret = req.headers['x-wc-consumer-secret'];
    const endpoint = req.query.endpoint;

    if (!wcUrl || !consumerKey || !consumerSecret || !endpoint) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Construire l'URL WooCommerce
    const url = new URL(endpoint, wcUrl);
    url.searchParams.set('consumer_key', consumerKey);
    url.searchParams.set('consumer_secret', consumerSecret);

    // Copier les autres query params
    Object.keys(req.query).forEach(key => {
      if (key !== 'endpoint') {
        url.searchParams.set(key, req.query[key]);
      }
    });

    // Faire la requête vers WooCommerce
    const wcResponse = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await wcResponse.json();

    return res.status(wcResponse.status).json(data);
  } catch (error) {
    console.error('Erreur proxy WooCommerce:', error);
    return res.status(500).json({ error: error.message });
  }
}
