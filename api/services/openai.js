import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAI(network, tone, niche, count) {
  const prompt = `
Génère ${count} scripts ultra viraux pour ${network}.
Niche : ${niche}
Ton : ${tone}

Format JSON propre :
[
  {
    "title": "",
    "script": "",
    "cta": "",
    "hashtags": []
  }
]
`;

  const result = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 800
  });

  const content = result.choices[0].message.content;

  // On nettoie le JSON renvoyé par GPT
  try {
    const jsonStart = content.indexOf("[");
    const json = content.slice(jsonStart);
    return JSON.parse(json);
  } catch {
    return [{ title: "Erreur JSON", script: content }];
  }
}
