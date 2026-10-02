import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "बहुत सारे सवाल भेजे गए हैं। कृपया एक मिनट बाद फिर कोशिश करें।" }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "सर्वर पर AI API key सेट नहीं है। Admin को environment variables सेट करने होंगे।" });
    }

    const incoming = req.body?.messages;
    if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 12) {
      return res.status(400).json({ error: "कृपया 1 से 12 चैट संदेश भेजें।" });
    }

    const messages = incoming.map((m) => {
      if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") {
        throw new Error("चैट संदेश का प्रारूप सही नहीं है।");
      }
      const content = m.content.trim();
      if (!content || content.length > 4000) throw new Error("हर संदेश 1 से 4000 अक्षरों के बीच होना चाहिए।");
      return { role: m.role, content };
    });

    // OpenRouter's free router selects from currently available free models.
    // Model availability and limits may change; configure a specific model via env if desired.
    const model = process.env.AI_MODEL || "openrouter/free";
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "Sameer AI"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are Sameer AI, a helpful assistant. Reply in the language the user uses, especially simple Hindi when appropriate. Be honest about uncertainty, do not invent facts, and explain steps clearly."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: AbortSignal.timeout(45000)
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // Do not return upstream headers, tokens, or internal details to the browser.
      console.error("AI provider returned status:", upstream.status);
      return res.status(502).json({ error: "AI सेवा ने जवाब नहीं दिया। कुछ देर बाद फिर कोशिश करें या मॉडल की उपलब्धता जाँचें।" });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "AI से खाली जवाब मिला। फिर कोशिश करें।" });
    }
    return res.json({ reply: reply.trim() });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return res.status(504).json({ error: "AI से जवाब आने में समय लग गया। फिर कोशिश करें।" });
    }
    if (error instanceof Error && (error.message.includes("प्रारूप") || error.message.includes("अक्षरों"))) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Chat route error:", error?.message || "unknown");
    return res.status(500).json({ error: "सर्वर में समस्या आई। कृपया बाद में फिर कोशिश करें।" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sameer AI server listening on port ${PORT}`);
});
