// Deploy steps:
// 1. Get free Gemini API key at aistudio.google.com
// 2. Push this project to GitHub
// 3. Import repo at vercel.com → Deploy
// 4. Go to Settings → Environment Variables
// 5. Add GEMINI_API_KEY = your key
// 6. Redeploy — done!

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  let prompt;

  try {
    ({ prompt } = parseBody(req));
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A prompt string is required" });
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await geminiResponse.json();
    return res.status(geminiResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to contact Gemini" });
  }
};
