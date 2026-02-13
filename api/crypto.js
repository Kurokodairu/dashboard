export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300')


  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { 
      ids = 'bitcoin,ethereum,monero,ripple',
      vs_currencies = 'usd',
      include_24hr_change = 'true'
    } = req.query;

    // Make request to CoinGecko API
    const cryptoResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs_currencies)}&include_24hr_change=${encodeURIComponent(include_24hr_change)}`,
      { headers: { 'User-Agent': 'DashboardApp/1.0' } }
    );

    if (!cryptoResponse.ok) {
      throw new Error(`CoinGecko API responded with status: ${cryptoResponse.status}`);
    }

    const cryptoData = await cryptoResponse.json();
    
    // Return the crypto data
    res.status(200).json(cryptoData);
  } catch (error) {
    console.error('Crypto API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crypto data',
      message: error.message 
    });
  }
}