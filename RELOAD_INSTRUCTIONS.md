# 🔄 How to Reload the Extension After Changes

Follow these steps EXACTLY to ensure the extension reloads properly:

## Step 1: Clear Stored Data
1. Open the extension popup (click the extension icon)
2. Click "Clear Data" button if you see any old data
3. Close the popup

## Step 2: Reload the Extension
1. Go to `chrome://extensions/` in Chrome
2. Find "Blueflame AI Chat Data Capture"
3. Click the **circular reload icon** (🔄) on the extension card
4. You should see a brief "Loading..." message

## Step 3: Close ALL Blueflame AI Tabs
1. Close every tab with `app.blueflame.ai`
2. This ensures the old scripts are completely unloaded

## Step 4: Clear Chrome Cache (Optional but Recommended)
1. Press `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
2. Select "Cached images and files"
3. Click "Clear data"

## Step 5: Open Fresh Blueflame Tab
1. Open a NEW tab
2. Navigate to `https://app.blueflame.ai/dashboard/chat/details/[any-chat-id]`
3. Open DevTools (F12 or Cmd+Option+I)
4. Go to Console tab

## Step 6: Verify Installation
You should see these messages in Console:
```
✅ Blueflame AI: Content script loaded
✅ Blueflame AI: Injected script running in page context
✅ Blueflame AI: Interceptors installed in page context
```

## Step 7: Test Capture
1. Trigger an API call on the Blueflame page (navigate to a chat, load messages, etc.)
2. Watch the Console for:
   - `Blueflame AI: Intercepted fetch to https://api.blueflame.ai/...`
   - `Blueflame AI: Response data` (with the actual data)
   - `Blueflame AI: ChatThread data captured and sent` (if entityType matches)
3. Click the extension icon
4. You should see the captured data in the collapsible JSON viewer

## Troubleshooting

### If you don't see console messages:
- Make sure content scripts are enabled in extension settings
- Check that the URL matches `https://app.blueflame.ai/dashboard/chat/details/*`
- Try disabling and re-enabling the extension

### If you see "Intercepted fetch" but no "ChatThread data captured":
- Check the response data in console
- Verify it contains `entityType: "blueflame_common.entities.ChatThread"`
- The extension is working correctly, the API response just doesn't have that entityType

### If nothing works:
1. Remove the extension completely
2. Go to `chrome://extensions/`
3. Click "Remove" on the extension
4. Click "Load unpacked" again
5. Select the `/Users/haluk.oksuzgonul/bfai-chrome` folder

