import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* ========= MIDDLEWARE ========= */
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

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
/* ========= CHAT API ========= */
app.post("/chat", async (req, res) => {
  try {
    const { message, persona } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "GROQ API key missing" });
    }

    const systemPrompt =
      persona === "gandhi"
        ? "You are Mahatma Gandhi. Speak with peace and wisdom."
        : "You are a helpful assistant.";

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
    console.log("🔥 GROQ FULL RESPONSE =", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.json({
        reply: `❌ Groq Error: ${data.error.message}`,
      });
    }

    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.delta?.content ||
      data?.choices?.[0]?.text;

    if (!reply) {
      reply = "AI se response nahi mila (free API / rate limit ho sakta hai)";
    }

    res.json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ reply: "Server error" });
  }
});
/* ========= SERVER ========= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});