# Cache Clearing Instructions for Production Site

## Problem
The production site is still loading the old JavaScript bundle that contains WordPress SSO endpoints, causing "No route was found" errors.

## Solution Steps

### Step 1: Upload Updated Files
Upload these files to your production server:
- `client/build/index.html` (updated with cache-busting script)
- `client/build/sw.js` (updated with new cache version)
- `client/build/static/js/main.ab78bdfa.js` (new JavaScript bundle)
- `client/build/static/css/main.1ddc0111.css` (new CSS bundle)

### Step 2: Clear Browser Cache
Try these methods in order:

#### Method 1: Hard Refresh
1. Go to `https://report.saharagroundwater.com`
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. This bypasses cache and loads fresh files

#### Method 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click on the refresh button
3. Select "Empty Cache and Hard Reload"

#### Method 3: Clear All Browser Data
1. Go to Browser Settings
2. Clear browsing data
3. Select "All time" and check all boxes
4. Clear data

#### Method 4: Incognito/Private Mode
1. Open the site in incognito/private mode
2. This bypasses all cache

### Step 3: Verify Fix
After clearing cache, check:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for API calls - they should now be `/api/login` instead of WordPress endpoints
5. Check Console for "All caches cleared" message

### Step 4: If Still Not Working
If the issue persists:
1. Check if the new files are actually uploaded to the server
2. Verify the file paths are correct
3. Try accessing the JavaScript file directly: `https://report.saharagroundwater.com/static/js/main.ab78bdfa.js`
4. Check if the server is serving the correct files

## Files to Upload
- `index.html` (with cache-busting script)
- `sw.js` (updated cache version)
- `static/js/main.ab78bdfa.js` (new JavaScript bundle)
- `static/css/main.1ddc0111.css` (new CSS bundle)

## Expected Result
After clearing cache, the login should work with the new `/api/login` endpoint instead of the old WordPress SSO endpoint.
