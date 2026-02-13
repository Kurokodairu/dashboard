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
    // Get credentials from request headers (sent by client after user authentication)
    const authorization = req.headers.authorization;
    const clientId = req.headers['client-id'];
    const userId = req.query.user_id;

    if (!authorization || !clientId) {
      res.status(401).json({ error: 'Missing authorization headers' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'Missing required parameter: user_id' });
      return;
    }

    // Make request to Twitch API using user's access token
    const twitchResponse = await fetch(
      `https://api.twitch.tv/helix/streams/followed?user_id=${encodeURIComponent(userId)}`,
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
    console.error('Twitch API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Twitch data',
      message: error.message 
    });
  }
}