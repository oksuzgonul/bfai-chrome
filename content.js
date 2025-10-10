// Content script - acts as a bridge between injected script and extension
(function() {
  console.log('Blueflame AI: Content script loaded');

  // Check if Chrome APIs are available
  if (!chrome || !chrome.storage || !chrome.runtime) {
    console.error('Blueflame AI: Chrome APIs not available');
    return;
  }

  // Listen for messages from the injected script
  window.addEventListener('message', function(event) {
    try {
      // Only accept messages from same origin
      if (!event || event.source !== window) return;
      
      // Check if event.data exists and has the expected structure
      if (!event.data || typeof event.data !== 'object') return;
      
      // Only process our specific message type
      if (event.data.type !== 'BLUEFLAME_DATA_CAPTURED') return;
      
      const capturedData = event.data.payload;
      
      if (!capturedData) return;
      
      console.log('Blueflame AI: Data received from page', capturedData);
      
      // Store in chrome.storage
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 
          lastCapturedData: capturedData 
        }, function() {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.error('Blueflame AI: Storage error', chrome.runtime.lastError);
          }
        });
      }
      
      // Send message to popup if it's open
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'DATA_CAPTURED',
          data: capturedData
        }).catch(function() {
          // Popup might not be open, this is expected behavior
        });
      }
    } catch (error) {
      // Silently ignore all errors - many page messages will trigger this listener
    }
  });

  // Inject the interceptor script into the page context
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() {
      this.remove();
    };
    script.onerror = function() {
      console.error('Blueflame AI: Failed to load injected script');
    };
    
    // Insert the script before any other scripts to ensure interception works
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    console.error('Blueflame AI: Error injecting script', error.message);
  }
})();
