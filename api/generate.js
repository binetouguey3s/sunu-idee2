
/// test pour forcer le modele    a vercel      
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { titre, description } = req.body || {};
    if (!titre || !description) return res.status(400).json({ error: 'Missing titre or description' });

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not defined');
      return res.status(500).json({ error: { message: 'OPENROUTER_API_KEY is missing on the server' } });
    }

    const prompt = `Choisis UNE catégorie parmi: Pedagogie, Evenement, Vie de campus, Amelioration technique.\nTitre: ${titre}\nDescription: ${description}\nRéponds uniquement par la catégorie qui correspond à celle appropriée au titre et la description donnée.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'poolside/laguna-m.1:free', stream: false, messages: [{ role: 'user', content: prompt }] })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenRouter returned error', response.status, data);
      return res.status(response.status).json({ error: data.error || data });
    }
    return res.status(200).json({ data });
  } catch (err) {
    console.error('OpenRouter proxy error', err);
    return res.status(500).json({ error: 'openrouter_error' });
  }
}