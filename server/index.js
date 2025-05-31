import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in .env file. Please set it.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Configuration for the Gemini model
// Using gemini-2.5-flash-preview-04-17 as per guidelines for text
const modelConfig = {
    model: 'gemini-2.5-flash-preview-04-17',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, model: requestedModel } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }
    
    // Model choice flexibility or default to text model
    const currentModelName = requestedModel || modelConfig.model;


    // Correct way to get the model instance for generateContent
    // As per @google/genai guidelines, use ai.models.generateContent directly.
    // The old getGenerativeModel then model.generateContent is for older APIs or different use cases.
    // However, since we are on the backend with @google/generative-ai,
    // genAI.getGenerativeModel({ model: currentModelName }) is correct here.
    const modelInstance = genAI.getGenerativeModel({ model: currentModelName, safetySettings });


    const generationConfig = {
        temperature: 0.7, // Adjust for creativity vs. factuality
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192, // Increased for potentially longer reports
    };

    const result = await modelInstance.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig, // Pass the generationConfig here
    });
    
    // Correct way to access text from GenerateContentResponse
    const text = result.response.text();
    res.json({ result: text });

  } catch (e) {
    console.error('Error processing Gemini request:', e);
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini-Proxy (Node.js/Express server) running on http://localhost:${PORT}`);
});
