require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(__dirname));

// ✅ Configure OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, style } = req.body;

    // Modify system message based on style
    let systemMessage = messages.find(m => m.role === "system");
    if (systemMessage) {
      if (style === 'analytical') {
        systemMessage.content += " Provide data-driven analysis with statistics and logical reasoning.";
      } else if (style === 'creative') {
        systemMessage.content += " Be imaginative and provide unconventional ideas.";
      }
    }

    const completion = await openai.chat.completions.create({
  model: "openai/gpt-4.1-mini",   // ✅ cheaper & lighter model
  messages: messages,
  max_tokens: 1000,               // ✅ keep under 5000
  temperature: style === 'creative' ? 0.8 : 0.5,
  extra_headers: {
    "HTTP-Referer": "http://localhost",
    "X-Title": "Dual AI Chatbot"
  }
});


    res.json({
      response: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens || null
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Route root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Auto-pick free port if in use
const DEFAULT_PORT = process.env.PORT || 5000;
const server = app.listen(DEFAULT_PORT, () => {
  console.log(`✅ Server running on http://localhost:${server.address().port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${DEFAULT_PORT} in use, trying another...`);
    const tempServer = app.listen(0, () => {  // 0 = auto-assign free port
      console.log(`✅ Server running on http://localhost:${tempServer.address().port}`);
    });
  } else {
    throw err;
  }
});
