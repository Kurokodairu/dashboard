import { parseStringPromise } from 'xml2js'

let lastSummarized = null
let summaryCache = new Map()

const VG_RSS_URL = 'https://www.vg.no/rss/feed'
const TTL = 1000 * 60 * 30 // 30 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  // Return cached data if available (graceful fallback when no API key)
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not configured, returning cached data')
    if (summaryCache.size > 0) {
      return res.status(200).json({
        source: 'cache',
        cached: true,
        summaries: Array.from(summaryCache.values())
      })
    }
    // No cached data and no API key
    return res.status(200).json({
      source: 'none',
      summaries: [],
      message: 'VG API not configured'
    })
  }

  // Use cache if valid
  if (lastSummarized && Date.now() - lastSummarized < TTL && summaryCache.size > 0) {
    return res.status(200).json({
      source: 'cache',
      summaries: Array.from(summaryCache.values())
    })
  }

  try {
    const feedRes = await fetch(VG_RSS_URL, {
      headers: { 'User-Agent': 'DashboardApp/1.0' }
    })
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
  const summaries = []

  for (const article of articles) {
    const prompt = `You are a helpful Norwegian news summarizer, give the summary in Norwegian. Given this VG.no headline and description, write a concise 1-2 sentence summary. Do not repeat the headline, provide additional context or background information. Use as few words as possible while being informative.`

    const content = `Headline: ${article.title}\nDescription: ${article.description || 'No description available'}`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You summarize Norwegian news articles concisely.' },
            { role: 'user', content: `${prompt}\n\n${content}` }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('OpenAI response text:', text)
        summaries.push('Summary not available')
        continue
      }

      const data = await response.json()
      const summary = data.choices?.[0]?.message?.content?.trim() || 'Summary not available'
      summaries.push(summary)

    } catch (error) {
      console.error('Error summarizing article:', article.title, error)
      summaries.push('Summary not available')
    }
  }

  return summaries
}