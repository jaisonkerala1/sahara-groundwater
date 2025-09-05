# Sahara Groundwater - Deployment Guide

## 🚀 Stable Deployment Process

### Current Working Setup
- **Hosting**: Hostinger PHP hosting
- **Domain**: `report.saharagroundwater.com`
- **Deployment Path**: `public_html/report/`
- **File Type**: Static React build files

### ✅ What's Working
- Contact info updates (phone: +91 80503 81803, email: support@saharagroundwater.com)
- Mobile profile section for logged-in users
- Static file hosting on PHP server
- All UI components and functionality

### 📁 Files to Deploy
Deploy these files from `client/build/` to `public_html/report/`:

#### Root Files:
- `index.html` (main React app)
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `sw.js` (service worker)
- `asset-manifest.json`

#### Static Folder:
- `static/css/main.[hash].css`
- `static/css/main.[hash].css.map`
- `static/js/main.[hash].js`
- `static/js/main.[hash].js.LICENSE.txt`
- `static/js/main.[hash].js.map`

### 🔄 Deployment Steps

#### Method 1: Manual Upload (Recommended)
1. **Build the app**: `cd client && npm run build`
2. **Go to Hostinger File Manager**
3. **Navigate to `public_html/report/`**
4. **Upload all files from `client/build/`**
5. **Test**: Visit `https://report.saharagroundwater.com/`

#### Method 2: Git + Manual Build
1. **Push code changes**: `git add . && git commit -m "message" && git push`
2. **Build locally**: `cd client && npm run build`
3. **Upload build files** to Hostinger File Manager
4. **Test the deployment**

### ⚠️ Important Notes
- **DO NOT** rely on Git auto-deployment alone
- **ALWAYS** build the React app before deploying
- **PHP hosting** cannot run Node.js source code
- **Static files only** work on this hosting setup

### 🐛 Troubleshooting
- **White screen**: Missing build files or wrong file paths
- **Old content showing**: Browser cache - try incognito mode
- **Changes not visible**: Files not properly uploaded to correct directory

### 📞 Contact Information (Current)
- **Phone**: +91 80503 81803
- **Email**: support@saharagroundwater.com
- **Location**: Kerala, India

### 🔧 Technical Details
- **React Version**: Latest
- **Build Tool**: Create React App
- **Hosting**: Hostinger PHP
- **Domain**: report.saharagroundwater.com
- **Deployment**: Static files only

---
**Last Updated**: January 2025
**Status**: ✅ Stable and Working
