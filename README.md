# Blueflame AI Chat Data Capture Extension

A Chrome extension that captures and displays ChatThread data from Blueflame AI chat pages.

## Features

- 🎯 Automatically activates on Blueflame AI chat detail pages
- 🔍 Intercepts fetch and XMLHttpRequest calls to the Blueflame API
- 📊 Captures ChatThread entity data in real-time
- 💾 Stores the last captured data for easy access
- 📋 Copy captured data to clipboard
- 🎨 Beautiful, modern UI with collapsible JSON viewer

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `bfai-chrome` folder
5. The extension should now appear in your extensions list

## Usage

1. Navigate to a Blueflame AI chat details page:
   `https://app.blueflame.ai/dashboard/chat/details/{any-chat-id}`
   
   Example: `https://app.blueflame.ai/dashboard/chat/details/abc123`

2. Click the extension icon in your Chrome toolbar to open the popup

3. The extension will automatically capture any API responses from:
   `https://api.blueflame.ai/prod/v2/chat/{any-chat-id}`
   
   That contain `entityType: "blueflame_common.entities.ChatThread"`
   
   Note: The extension uses wildcard matching to capture requests for ANY chat ID

4. View the captured raw JSON data in the extension popup

5. Use the "Copy to Clipboard" button to copy the data

6. Use the "Clear Data" button to reset the captured data

## Files

- `manifest.json` - Extension configuration
- `content.js` - Bridge script that runs in isolated context
- `injected.js` - Script injected into page context to intercept fetch/XHR
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic and data display
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons
- `test.html` - Test page to verify interception works

## Notes

- The extension only captures data from the specific Blueflame AI URLs
- Data persists between popup opens/closes
- The extension console logs when data is captured
- Works with both fetch and XMLHttpRequest API calls

## Troubleshooting

If the extension isn't capturing data:

1. **Check Console Logs**
   - Open DevTools (F12) on the Blueflame chat page
   - Look for messages starting with "Blueflame AI:"
   - You should see: "Injected script running in page context" and "Interceptors installed"

2. **Verify URL Pattern**
   - Make sure you're on `https://app.blueflame.ai/dashboard/chat/details/{some-id}`
   - Check Network tab to confirm API calls to `https://api.blueflame.ai/prod/v2/chat/{some-id}`

3. **Check Response Data**
   - In Network tab, click on the chat API request
   - Verify the response contains `entityType: "blueflame_common.entities.ChatThread"`

4. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the reload icon on the extension
   - Refresh the Blueflame chat page

5. **Test with Test Page**
   - Open `test.html` in your browser
   - Click the test buttons to verify interception is working
   - Check the extension popup for captured data

## Icon Setup

The extension currently uses placeholder icons. To add custom icons:
1. Create PNG images sized 16x16, 48x48, and 128x128 pixels
2. Name them `icon16.png`, `icon48.png`, and `icon128.png`
3. Place them in the extension root directory

