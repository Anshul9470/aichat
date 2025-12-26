import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* ========= MIDDLEWARE ========= */
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* ========= ROOT ========= */
app.get("/", (req, res) => {
  res.send("🚀 AI Chat Backend is running successfully");
});

/* ========= PERSONAS ========= */
const PERSONAS = {
  elon:
    "You are Elon Musk. Speak like a bold futuristic tech entrepreneur. Short, sharp, visionary replies.",
  gandhi:
    "You are Mahatma Gandhi. Speak with peace, truth, simplicity and wisdom.",
  modi:
    "You are Narendra Modi. Speak like an Indian Prime Minister. Motivational, confident, nation-first tone.",
};

/* ========= CHAT API ========= */
app.post("/chat", async (req, res) => {
  try {
    const { message, persona } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message required" });
    }

    // persona prompt
    const systemPrompt =
      PERSONAS[persona] || "You are a helpful assistant.";

    const finalPrompt = `${systemPrompt}\n\nUser: ${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }],
            },
          ],
        }),
      }
    );

  const data = await response.json();

console.log("🟢 GEMINI RESPONSE:", JSON.stringify(data, null, 2));

const reply =
  data?.candidates?.[0]?.content?.parts
    ?.map(p => p.text)
    ?.join(" ");

if (!reply) {
  return res.json({
    reply: "❌ AI response nahi mila (Gemini returned empty)",
  });
}

res.json({ reply });
  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ reply: "Server error" });
  }
});

/* ========= SERVER ========= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});