export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { q } = req.query

  if (!q) {
    return res.status(400).json({ error: 'Missing query' })
  }

  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`
    )

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch suggestions' })
    }

    const data = await response.json()
    const suggestions = data[1] // second item is the suggestions list

    res.status(200).json({ suggestions })
  } catch (err) {
    console.error('Suggest API error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
