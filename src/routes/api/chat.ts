import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = await request.json();
          const GROQ_API_KEY = process.env.GROQ_API_KEY;
          if (!GROQ_API_KEY) {
            return new Response(JSON.stringify({ error: "GROQ_API_KEY is not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const systemPrompt =
            "You are FraudShield AI, an expert assistant on fraud detection, UPI scams, and Indian payment security. Help users understand fraud patterns, suspicious behaviors (like OTP sharing, new device logins, rapid transactions, VPN usage), and best practices to stay safe. Keep responses concise, clear, and actionable. Use markdown for formatting when helpful.";

          const groqMessages = [{ role: "system", content: systemPrompt }].concat(messages);

          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + GROQ_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: groqMessages,
              stream: true,
              max_tokens: 1024,
            }),
          });

          if (!response.ok) {
            if (response.status === 429) {
              return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
              });
            }
            const t = await response.text();
            console.error("Groq API error:", response.status, t);
            return new Response(JSON.stringify({ error: "AI API error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(response.body, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          console.error("chat error:", e);
          return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});