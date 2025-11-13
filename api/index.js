const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DreamFlow API - OpenAI' });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { network, language, count, topic } = req.body;
    
    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a viral script generator. Always return ONLY valid JSON array.' },
        { role: 'user', content: `Generate exactly ${count} viral ${network} scripts in ${language} about "${topic || 'trending topics'}". 

Return ONLY this JSON format, nothing else:
[
  {"id": 1, "title": "Script 1", "content": "[HOOK]...[BODY]...[CTA]..."},
  {"id": 2, "title": "Script 2", "content": "[HOOK]...[BODY]...[CTA]..."}
]` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let responseText = message.choices[0].message.content.trim();
    
    // Nettoyer le JSON
    if (responseText.startsWith('```json')) responseText = responseText.slice(7);
    if (responseText.startsWith('```')) responseText = responseText.slice(3);
    if (responseText.endsWith('```')) responseText = responseText.slice(0, -3);
    responseText = responseText.trim();
    
    let scripts = JSON.parse(responseText);

    res.json({ success: true, network, language, model: 'GPT-4o Mini', scripts });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ DreamFlow API (OpenAI) running on http://localhost:${PORT}`);
});
