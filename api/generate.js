
/// test pour forcer le modele    a vercel      
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { titre, description } = req.body || {};
    if (!titre || !description) return res.status(400).json({ error: 'Missing titre or description' });

    const prompt = `Choisis UNE catégorie parmi: Pedagogie, Evenement, Vie de campus, Amelioration technique.\nTitre: ${titre}\nDescription: ${description}\nRéponds uniquement par la catégorie (ex: Pedagogie).`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free', stream: false, messages: [{ role: 'user', content: prompt }] })
    });

    const data = await response.json();
    return res.status(200).json({ data });
  } catch (err) {
    console.error('OpenRouter proxy error', err);
    return res.status(500).json({ error: 'openrouter_error' });
  }
}