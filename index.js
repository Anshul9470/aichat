import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* ========= MIDDLEWARE ========= */
app.use(cors());
app.use(express.json());

/* ========= ROOT ROUTE ========= */
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
      return res.status(400).json({ reply: "❌ Message is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "❌ GROQ API key missing" });
    }

    const systemPrompt = PERSONAS[persona] || PERSONAS.gandhi;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "❌ No response from AI";

    res.json({ reply });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ reply: "❌ Server error" });
  }
});

/* ========= SERVER ========= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});