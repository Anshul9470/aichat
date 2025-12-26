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

    let systemPrompt =
      "You are a helpful assistant. Reply in ONE SINGLE LINE only. Do NOT use line breaks. Keep the answer under 300 words.";

    if (persona === "gandhi") {
      systemPrompt =
        "You are Mahatma Gandhi. Speak with peace, truth and wisdom. Reply in ONE SINGLE LINE only. Keep it under 300 words.";
    } else if (persona === "elon") {
      systemPrompt =
        "You are Elon Musk. Speak like a bold futuristic tech entrepreneur. Reply in ONE SINGLE LINE only. Keep it under 300 words.";
    } else if (persona === "modi") {
      systemPrompt =
        "You are Narendra Modi. Speak in a motivational, nation-first tone. Reply in ONE SINGLE LINE only. Keep it under 300 words.";
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          max_tokens: 400, // 👈 roughly 300 words max
          temperature: 0.6,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();
    let reply = data?.choices?.[0]?.message?.content;

    // 🔒 EXTRA SAFETY: force single line
    if (reply) {
      reply = reply.replace(/\n+/g, " ").trim();
    }

    if (!reply) {
      return res.json({
        reply: "❌ AI se response nahi mila",
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