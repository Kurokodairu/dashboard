import { parseStringPromise } from 'xml2js'

let lastSummarized = null
let summaryCache = new Map()

const VG_RSS_URL = 'https://www.vg.no/rss/feed'
const TTL = 1000 * 60 * 30 // 30 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  // Use cache if valid
  if (lastSummarized && Date.now() - lastSummarized < TTL && summaryCache.size > 0) {
    return res.status(200).json({
      source: 'cache',
      summaries: Array.from(summaryCache.values())
    })
  }

  try {
    const feedRes = await fetch(VG_RSS_URL)
    const xml = await feedRes.text()
    const json = await parseStringPromise(xml)

    const allowedCategories = ['Innenriks', 'Utenriks', 'Politikk', 'Nyheter', 'Teknologi', 'Forbruker']

    const allItems = json.rss.channel[0].item
    const relevantItems = allItems.filter(item => {
      const categories = item.category?.map(c => c.toLowerCase()) || []
      return categories.some(cat => allowedCategories.map(c => c.toLowerCase()).includes(cat))
    })

    const items = relevantItems.slice(0, 5)
    const newItems = []

    for (const item of items) {
      const guid = item.guid?.[0] || item.link?.[0]
      if (!summaryCache.has(guid)) {
        newItems.push({
          guid,
          title: item.title?.[0],
          link: item.link?.[0],
          pubDate: item.pubDate?.[0],
          description: item.description?.[0] || null,
        })
      }
    }

    if (newItems.length > 0) {
      const summaries = await summarizeWithOpenAI(newItems)

      summaries.forEach((summary, i) => {
        const item = newItems[i]
        summaryCache.set(item.guid, { ...item, summary })
      })

      lastSummarized = Date.now()
    }

    // Maintain order
    const orderedSummaries = items.map(item => {
      const guid = item.guid?.[0] || item.link?.[0]
      return summaryCache.get(guid)
    }).filter(Boolean)

    res.status(200).json({
      source: 'fresh',
      updated: new Date().toISOString(),
      summaries: orderedSummaries,
    })

  } catch (error) {
    console.error('VG summary error:', error)
    res.status(500).json({ error: 'Failed to summarize VG feed' })
  }
}

async function summarizeWithOpenAI(articles) {
  const headlines = articles.map(a => `- ${a.title}`).join('\n')

  const prompt = `You are a helpful Norwegian news summarizer. Given today's VG.no headlines, write 3-4 concise bullet points summarizing the main stories. Do not type the headline in the description, use new information only. Use as few words as possible. Add more background context if it's ongoing or political.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You summarize Norwegian news for a dashboard.' },
        { role: 'user', content: `${prompt}\n\nHeadlines:\n${headlines}` }
      ],
      temperature: 0.5,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('OpenAI response text:', text)
    throw new Error(`OpenAI error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  const bullets = content
    .split(/\n+/)
    .filter(line => line.startsWith('-') || line.startsWith('•'))

  // Fallback: reuse if too few bullets
  return articles.map((_, i) => bullets[i] || bullets[i % bullets.length] || '...')
}
