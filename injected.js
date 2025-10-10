// This script runs in the actual page context to intercept fetch/XHR
(function() {
  console.log('Blueflame AI: Injected script running in page context');
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Check if the request is to the target API (matches any chat ID)
    const url = args[0];
    const apiPattern = /https:\/\/api\.blueflame\.ai\/prod\/v2\/chat\/[^\/\s]+/;
    
    if (typeof url === 'string' && apiPattern.test(url)) {
      console.log('Blueflame AI: Intercepted fetch to', url);
      
      // Clone the response to read it
      const clonedResponse = response.clone();
      
      try {
        const data = await clonedResponse.json();
        console.log('Blueflame AI: Response data', data);
        
        // Check if entityType matches
        if (data && data.entityType === 'blueflame_common.entities.ChatThread') {
          const capturedData = {
            url: url,
            timestamp: new Date().toISOString(),
            data: data
          };
          
          // Send to content script via postMessage
          window.postMessage({
            type: 'BLUEFLAME_DATA_CAPTURED',
            payload: capturedData
          }, '*');
          
          console.log('Blueflame AI: ChatThread data captured and sent', data);
        }
      } catch (error) {
        console.error('Blueflame AI: Error processing response', error);
      }
    }
    
    return response;
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const apiPattern = /https:\/\/api\.blueflame\.ai\/prod\/v2\/chat\/[^\/\s]+/;
    
    if (this._url && apiPattern.test(this._url)) {
      console.log('Blueflame AI: Intercepted XHR to', this._url);
      
      this.addEventListener('load', function() {
        try {
          const data = JSON.parse(this.responseText);
          console.log('Blueflame AI: XHR Response data', data);
          
          // Check if entityType matches
          if (data && data.entityType === 'blueflame_common.entities.ChatThread') {
            const capturedData = {
              url: this._url,
              timestamp: new Date().toISOString(),
              data: data
            };
            
            // Send to content script via postMessage
            window.postMessage({
              type: 'BLUEFLAME_DATA_CAPTURED',
              payload: capturedData
            }, '*');
            
            console.log('Blueflame AI: ChatThread data captured via XHR and sent', data);
          }
        } catch (error) {
          console.error('Blueflame AI: Error processing XHR response', error);
        }
      });
    }
    
    return originalSend.apply(this, args);
  };
  
  console.log('Blueflame AI: Interceptors installed in page context');
})();

