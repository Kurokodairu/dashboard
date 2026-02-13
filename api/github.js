export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, repos } = req.query

  if (!username) {
    return res.status(400).json({ error: 'Missing GitHub username' })
  }

  try {
    if (repos) {
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=3`, {
        headers: { 'User-Agent': 'DashboardApp/1.0' }
      })
      if (!response.ok) {
        return res.status(response.status).json({ error: `GitHub API error: ${response.status}` })
      }
      const data = await response.json()
      return res.status(200).json(data)
    }

    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'User-Agent': 'DashboardApp/1.0' }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.status}` })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('GitHub API error:', error)
    res.status(500).json({ error: 'Failed to fetch GitHub profile' })
  }
}

