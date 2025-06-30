export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Client-Id');

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
    const { ids } = req.query;
    const authorization = req.headers.authorization;
    const clientId = req.headers['client-id'];

    if (!authorization || !clientId) {
      res.status(401).json({ error: 'Missing authorization headers' });
      return;
    }

    if (!ids) {
      res.status(400).json({ error: 'Missing required parameter: ids' });
      return;
    }

    // Convert comma-separated IDs to query parameters
    const idParams = ids.split(',').map(id => `id=${id}`).join('&');

    // Make request to Twitch API
    const twitchResponse = await fetch(
      `https://api.twitch.tv/helix/users?${idParams}`,
      {
        headers: {
          'Authorization': authorization,
          'Client-Id': clientId,
          'Accept': 'application/json',
        }
      }
    );

    if (!twitchResponse.ok) {
      throw new Error(`Twitch API responded with status: ${twitchResponse.status}`);
    }

    const twitchData = await twitchResponse.json();
    
    // Return the Twitch data
    res.status(200).json(twitchData);
  } catch (error) {
    console.error('Twitch Users API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Twitch users data',
      message: error.message 
    });
  }
}