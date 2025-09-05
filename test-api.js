require('dotenv').config();

async function testAPI() {
  try {
    console.log('Testing OpenRouter API...');
    console.log('API Key loaded:', process.env.OPENROUTER_API_KEY ? 'YES' : 'NO');
    console.log('API Key length:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Sahara Groundwater Kerala Survey App'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello, test message' }],
        max_tokens: 50
      })
    });
    
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('API working! Response:', data.choices[0].message.content);
    } else {
      const error = await response.text();
      console.log('API Error:', error);
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testAPI();
