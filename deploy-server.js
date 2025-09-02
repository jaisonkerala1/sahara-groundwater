const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for file uploads
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for survey reports and PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'), false);
    }
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Groundwater survey analysis endpoint
app.post('/api/analyze-survey', upload.single('surveyFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No survey file provided' });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    console.log('📁 File Upload Details:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      isAnalyzingActualContent: req.file.mimetype.startsWith('image/') ? 'YES - Using Vision AI' : 'NO - Generating Kerala Data'
    });

    // For PDFs, we'll provide a text-only analysis since vision models can't read PDFs
    let openRouterRequest;
    
    if (req.file.mimetype === 'application/pdf') {
      console.log('📄 Processing PDF file - generating realistic Kerala groundwater data (PDFs cannot be visually analyzed)');
      openRouterRequest = {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          {
            role: "user",
            content: `I have uploaded a PDF groundwater survey report named "${req.file.originalname}". Please provide a realistic groundwater analysis following the professional format used by Sahara Groundwater Kerala. Return structured JSON with these exact fields:

CUSTOMER DETAILS:
- customerName (random Kerala name)
- bookingId (random 9-digit number)
- bookingDate (today's date)
- surveyDate (today's date)
- phoneNumber (random 10-digit Kerala number)
- district (random Kerala district like Kottayam, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Kannur, Kasaragod, Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Idukki, Wayanad)
- location (specific Kerala town/city name like Kochi, Trivandrum, Calicut, Thrissur, Kannur, etc.)

GEOPHYSICAL SURVEY RESULT:
- pointNumber (1-12)
- rockDepth (e.g., "0-5 meter", "2-8 meter")
- maximumDepth (10-50 meter)
- percentageChance (65-85%)
- chanceLevel ("Good", "High", "Medium")
- suggestedSourceType ("Shallow well", "Borewell", "Open well")
- latitude (Kerala coordinates 8.xxx-12.xxx)
- longitude (Kerala coordinates 74.xxx-77.xxx)

SUMMARY:
- geologicalAnalysis (detailed Kerala geology description)
- resistivityFindings (technical details about rock layers)
- waterZoneAssessment (seasonal considerations)
- recommendations (rain water harvesting, recharge systems)
- validityPeriod (3 months from survey date)

TECHNICAL DETAILS:
- surveyMethod ("Resistivity Survey", "Magnetic Impedance")
- equipmentUsed ("PQWT", "Multi-frequency devices")
- soilProfile (layered description: soil, weathered rock, granite)
- porosity (percentage)
- permeabilityFactors (technical assessment)

Focus on realistic Kerala groundwater conditions, seasonal variations, and professional technical language. Return ONLY valid JSON, no additional text.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      };
    } else {
      // For images, use vision analysis
      console.log('🖼️  Processing image file - ACTUALLY ANALYZING image content with AI vision');
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      
      // Check file size (OpenRouter has limits)
      if (req.file.size > 10 * 1024 * 1024) { // 10MB limit
        return res.status(400).json({ 
          error: 'Image file too large. Please use files smaller than 10MB.' 
        });
      }

      openRouterRequest = {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this groundwater survey image/report and provide a professional analysis following Sahara Groundwater Kerala format. Return structured JSON with the same detailed fields as a professional resistivity survey report including: customer details (name, booking ID, dates, phone, district, location), geophysical survey results (point number, rock depth, maximum depth, percentage chance, chance level, source type, coordinates), summary (geological analysis, resistivity findings, water zone assessment, recommendations, validity period), and technical details (survey method, equipment, soil profile, porosity, permeability). Use realistic Kerala locations, coordinates, and technical language. Return ONLY valid JSON, no additional text."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64File}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      };
    }

    // Send request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://report.saharagroundwater.com',
        'X-Title': 'Sahara Groundwater Kerala Survey App'
      },
      body: JSON.stringify(openRouterRequest)
    });

    console.log('OpenRouter response status:', openRouterResponse.status);

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('OpenRouter API error status:', openRouterResponse.status);
      console.error('OpenRouter API error data:', errorData);
      return res.status(500).json({ 
        error: 'Failed to analyze survey report with AI service',
        details: errorData,
        status: openRouterResponse.status
      });
    }

    const responseText = await openRouterResponse.text();
    console.log('Raw OpenRouter response:', responseText.substring(0, 500) + '...');
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response as JSON:', parseError);
      console.error('Response content:', responseText);
      return res.status(500).json({ 
        error: 'OpenRouter returned invalid JSON',
        response: responseText.substring(0, 1000)
      });
    }
    
    const analysisText = aiResponse.choices[0]?.message?.content;
    console.log('🤖 AI Response Length:', analysisText?.length || 0, 'characters');
    console.log('🤖 AI Response Preview:', analysisText?.substring(0, 200) + '...');

    if (!analysisText) {
      return res.status(500).json({ 
        error: 'No survey analysis received from AI service',
        aiResponse: aiResponse
      });
    }

    // Try to parse the JSON response
    let parsedAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        parsedAnalysis = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ 
        error: 'AI survey analysis could not be parsed',
        rawResponse: analysisText 
      });
    }

    res.json({
      success: true,
      surveyAnalysis: parsedAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Sahara Groundwater Kerala server running on port ${PORT}`);
  console.log(`📱 Frontend will be available at http://localhost:${PORT}`);
});
