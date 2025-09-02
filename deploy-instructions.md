# Sahara Groundwater Kerala - Hostinger Deployment Guide

## Files to Upload to Hostinger

### 1. Core Application Files
- `deploy-server.js` → Rename to `server.js`
- `deploy-package.json` → Rename to `package.json`
- `deploy-env.example` → Rename to `.env` (and add your API key)

### 2. Frontend Build Files
Upload the entire `client/build/` folder contents to your subdomain root directory.

### 3. Directory Structure on Hostinger
```
report.saharagroundwater.com/
├── server.js (renamed from deploy-server.js)
├── package.json (renamed from deploy-package.json)
├── .env (renamed from deploy-env.example + your API key)
└── build/ (contents of client/build/)
    ├── index.html
    ├── static/
    │   ├── css/
    │   └── js/
    └── ...
```

## Step-by-Step Deployment

### Step 1: Create Subdomain
1. In Hostinger control panel, create subdomain `report.saharagroundwater.com`
2. **Don't check** "Custom folder for subdomain" (use default directory)
3. Click "Create"

### Step 2: Upload Files via File Manager
1. Go to File Manager in Hostinger
2. Navigate to your subdomain directory
3. Upload the files as described above

### Step 3: Install Dependencies
1. Go to Node.js section in Hostinger
2. Select your subdomain
3. Run: `npm install`

### Step 4: Set Environment Variables
1. In Hostinger Node.js section
2. Add environment variables:
   - `OPENROUTER_API_KEY` = your actual API key
   - `NODE_ENV` = production
   - `PORT` = 5000

### Step 5: Start Application
1. In Node.js section, start the application
2. Your app will be available at `https://report.saharagroundwater.com`

## Important Notes

- Make sure to get your OpenRouter API key from https://openrouter.ai/
- The app supports both image and PDF file uploads
- File size limit is 25MB for PDFs, 10MB for images
- The app will work without API key but analysis features won't function

## Testing
After deployment, test:
1. Visit `https://report.saharagroundwater.com`
2. Upload a test image or PDF
3. Check if analysis works (requires API key)
