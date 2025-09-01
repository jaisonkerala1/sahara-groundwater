# 💧 Sahara Groundwater Report Analysis Using AI

A professional groundwater survey and borewell analysis platform that uses AI to analyze survey reports and provide expert insights on water availability, drilling recommendations, and geological conditions for Kerala, India.

This platform transforms uploaded survey reports and geological data into comprehensive analysis reports following the professional format used by Sahara Groundwater Kerala, including customer details, geophysical survey results, technical analysis, and actionable recommendations.

## ✨ Features

- **Survey Report Upload**: Upload PDF reports, images, or field data from groundwater surveys
- **AI-Powered Analysis**: Uses OpenRouter AI models to analyze geological and hydrogeological data
- **Comprehensive Insights**: Get detailed analysis including:
  - Water probability assessment
  - Suggested drilling depth
  - Geological interpretation
  - Recommended well type (borewell/openwell)
  - Water quality predictions
  - Cost estimates
  - Professional warnings and recommendations
- **Professional Dashboard**: Track survey history and performance metrics
- **Export & Share**: Download reports and share analysis results
- **Kerala-Focused**: Specialized for Kerala's geological conditions

## 🛠️ Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Service**: OpenRouter API (supports GPT-4o-mini, Mistral, and other vision models)
- **File Handling**: Multer for survey report uploads (PDF + Images)
- **Styling**: Professional design system optimized for groundwater industry

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenRouter API key

### Method 1: Automated Setup (Recommended)

```powershell
# Clone the repository
git clone https://github.com/jaisonkerala1/sahara-groundwater.git
cd sahara-groundwater

# Run automated setup
.\quick-setup.ps1

# Start the application
.\start.bat
```

### Method 2: Manual Setup

#### 1. Clone and Install Dependencies

```bash
# Clone from GitHub
git clone https://github.com/jaisonkerala1/sahara-groundwater.git
cd sahara-groundwater

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env

# Edit .env with your OpenRouter API key
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env` file

#### 4. Run the Application

```bash
# Option A: Automated start (Windows) - RECOMMENDED
.\start.bat

# Option B: PowerShell script
.\start.ps1

# Option C: Manual (two terminals)
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📱 Usage

1. **Upload Survey Report**: Click "Select File" to upload PDF reports or survey images
2. **Capture Field Data**: Click "Open Camera" to photograph equipment readings
3. **Drag & Drop**: Drag survey files directly onto the upload area
4. **Analyze**: Click "Analyze Survey Report" to get AI-powered insights
5. **View Results**: See comprehensive groundwater analysis with drilling recommendations

## 🎨 Design System

The app follows a comprehensive design system with:

- **Color Palette**: Primary green (#7ED321), secondary orange (#FF6B35), and neutral grays
- **Typography**: SF Pro Display/Text with consistent scale and weights
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable card, button, and form components
- **Responsive**: Mobile-first design with breakpoint adaptations

## 🔧 Configuration

### OpenRouter Models

You can easily switch between different AI models by changing the `OPENROUTER_MODEL` in your `.env`:

```bash
# Vision-capable models
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_MODEL=mistral/mistral-large
OPENROUTER_MODEL=anthropic/claude-3-5-sonnet
```

### API Endpoints

- `POST /api/analyze-survey` - Analyze groundwater survey reports
- `GET /api/health` - Health check endpoint

## 🚀 Deployment

### Heroku

```bash
# Build the app
npm run build

# Deploy to Heroku
git push heroku main
```

### Vercel/Netlify

```bash
# Build the frontend
cd client
npm run build

# Deploy the build folder
```

## 📁 Project Structure

```
food-analyzer-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server.js              # Express backend
├── package.json           # Backend dependencies
├── .env                   # Environment variables
└── README.md             # This file
```

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- File type validation (images only)
- File size limits (10MB max)
- Environment variable protection

## 🧪 Testing

```bash
# Test the backend
npm test

# Test the frontend
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your OpenRouter API key is correct
3. Ensure the image file is valid and under 10MB
4. Check that your OpenRouter account has sufficient credits

## 🔮 Future Enhancements

- [ ] User accounts and food history
- [ ] Barcode scanning for packaged foods
- [ ] Meal planning and tracking
- [ ] Export results to PDF/CSV
- [ ] Multiple language support
- [ ] Offline mode with cached results
- [ ] Integration with fitness apps
- [ ] Recipe suggestions based on ingredients

---

Built with ❤️ using React, Node.js, and OpenRouter AI
