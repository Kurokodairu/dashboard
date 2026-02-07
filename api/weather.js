export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const { lat, lon } = req.query;

    // Validate required parameters
    if (!lat || !lon) {
      res.status(400).json({ error: 'Missing required parameters: lat, lon' });
      return;
    }

    // Make request to yr.no API
    const weatherResponse = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      {
        headers: {
          'User-Agent': 'Dashboard App (kurokodairuwu@proton.me)'
        }
      }
    );

    if (!weatherResponse.ok) {
      throw new Error(`Weather API responded with status: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    
    // Return the weather data
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
}