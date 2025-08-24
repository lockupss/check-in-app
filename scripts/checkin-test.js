// Simple test script to POST to /api/checkin
// Usage: node scripts/checkin-test.js [userId]
// Default userId: demo@example.com

const DEFAULT = 'demo@example.com'
const userId = process.argv[2] || DEFAULT
const url = process.env.CHECKIN_URL || 'http://localhost:3000/api/checkin'

async function main() {
  console.log(`POST ${url} with userId=${userId}`)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    console.log('Status:', res.status)
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      console.log('Response JSON:', JSON.stringify(json, null, 2))
    } catch {
      console.log('Response Text:', text)
    }

    process.exit(res.ok ? 0 : 2)
  } catch (err) {
    if (err.name === 'AbortError') console.error('Request timed out')
    else console.error('Request failed:', err.message || err)
    process.exit(1)
  }
}

main()
