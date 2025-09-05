# 🚀 Quick Deployment Guide

## For Future Updates

### Step 1: Make Your Changes
- Edit files in `client/src/` (App.js, Footer.js, etc.)
- Update contact info, add features, etc.

### Step 2: Build the App
```bash
npm run deploy
```
This will build the React app and remind you to upload files.

### Step 3: Upload to Hostinger
1. Go to **Hostinger File Manager**
2. Navigate to **`public_html/report/`**
3. Upload **ALL files** from **`client/build/`** folder
4. Replace existing files

### Step 4: Test
Visit: `https://report.saharagroundwater.com/`

## ⚡ One-Line Commands

**Build only**: `npm run build-only`
**Full deploy reminder**: `npm run deploy`

## 📁 Always Upload These Files
- All files from `client/build/` folder
- Make sure `static/` folder is uploaded completely
- Replace `index.html` in the root

## ✅ Current Working Contact Info
- **Phone**: +91 80503 81803
- **Email**: support@saharagroundwater.com

---
**Remember**: Git deployment alone won't work - you need to upload the build files manually!
