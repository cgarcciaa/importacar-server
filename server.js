const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key no configurada' });
    }

    const body = {
      model: req.body.model || 'claude-sonnet-4-20250514',
      max_tokens: req.body.max_tokens || 1000,
      messages: req.body.messages
    };

    if (req.body.tools) {
      body.tools = req.body.tools;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch(e) {
      res.status(500).json({ error: 'Respuesta inválida del servidor: ' + text.substring(0, 200) });
    }

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('ImportaCar API funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en puerto ' + PORT));
