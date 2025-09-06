import TryCatch from "../middlewares/TryCatch.js";
import axios from "axios";

export const chatWithAI = TryCatch(async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Missing message" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      message: "AI not configured. Set GEMINI_API_KEY to enable chatbot.",
    });
  }

  // Map history to Gemini contents
  const toGeminiRole = (r) => (r === 'assistant' ? 'model' : 'user');
  const historyContents = (history || []).slice(-8).map((m) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: String(m.content || '') }],
  }));

  const contents = [
    { role: 'user', parts: [{ text: 'You are a friendly educational tutor. Provide clear, concise answers with examples when useful.' }]},
    ...historyContents,
    { role: 'user', parts: [{ text: message }]},
  ];

  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    res.status(200).json({ reply });
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.error?.message || err.message || 'Gemini request failed';
    res.status(status).json({ message: `AI error: ${msg}` });
  }
});


