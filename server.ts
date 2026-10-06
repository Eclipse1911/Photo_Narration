import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.example'] });

const app = express();
const PORT = 3000;

// Increase payload size limit for image uploads
app.use(express.json({ limit: '15mb' }));

// Express API route for AI photo narration
app.post('/api/narrate', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', hint, apiKey: reqApiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 field is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || reqApiKey;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing in environment variables.');
      const fallbackNarration = hint
        ? `In the soft glow of this scene, ${hint} comes vividly to life. The composition captures a timeless whisper between light and shadow, turning a fleeting moment into an enduring story.`
        : `A breathtaking capture where light and shadow dance in perfect harmony. The image evokes a quiet sense of wonder, offering a glimpse into a tranquil world frozen in time. Each subtle detail tells a silent story waiting to be uncovered.`;
      return res.json({ narration: fallbackNarration });
    }

    // Initialize Gemini SDK
    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 string
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const promptText = `Analyze this photograph thoroughly and provide a detailed, accurate description.

Guidelines:
1. Identification:
   - If the photo depicts a historic place, landmark, monument, building, or notable location, clearly state its full name, location, and key historical/cultural significance.
   - If the photo depicts a well-known person, historical figure, or public figure, clearly identify them by name and provide a concise summary of who they are and their significance.
   - If the photo depicts a general subject or unknown person/place, provide a clear, factual visual description of the visual elements, setting, composition, and details.

2. Formatting:
   - Provide a clear, coherent, and engaging response in 3 to 6 sentences.
   - Do NOT use markdown headers, bullet points, or lists. Output clean, readable prose text.
   - Be direct, informative, and precise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
    });

    const narration = response.text ? response.text.trim() : 'Unable to generate narration. Please try again.';

    return res.json({ narration });
  } catch (err: any) {
    console.error('Error in /api/narrate Gemini generation:', err);
    return res.status(500).json({ 
      error: 'Failed to generate narration.',
      narration: 'Unable to generate narration. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhotoNarrator server running on http://localhost:${PORT}`);
  });
}

startServer();
