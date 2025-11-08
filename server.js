import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-script', (req, res) => {
  const { trend, duration, format } = req.body;
  const script = `🎬 SCRIPT: "${trend}" - ${duration} - ${format}\n\nHOOK: "Attends tu sais pas ça? 👀"\n\nSCRIPT:\n[0-3s] Hook\n[3-15s] Contenu\n[15-end] CTA\n\nVIRAL_ELEMENTS:\n✅ Question rhétorique\n✅ Transition rapide\n✅ Call to action\n\nCTA: "Like + Follow!"`;
  res.json({ success: true, script, viralScore: '87/100', viewsPrediction: '650K vues' });
});

app.listen(3000, () => console.log('🚀 DEMO running!'));
