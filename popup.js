// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  loadCapturedData();
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DATA_CAPTURED') {
      displayData(message.data);
    }
  });
});

// Load captured data from storage
function loadCapturedData() {
  chrome.storage.local.get(['lastCapturedData'], function(result) {
    if (result.lastCapturedData) {
      displayData(result.lastCapturedData);
    }
  });
}

// Display captured data
function displayData(capturedData) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const dataContainer = document.getElementById('dataContainer');
  
  // Update status
  statusIndicator.classList.remove('no-data');
  statusText.textContent = 'Data captured successfully!';
  
  // Create data display
  const dataSection = document.createElement('div');
  dataSection.className = 'data-section';
  
  const title = document.createElement('h2');
  title.textContent = '📊 Captured ChatThread Data';
  dataSection.appendChild(title);
  
  const timestamp = document.createElement('div');
  timestamp.className = 'timestamp';
  timestamp.textContent = `Captured at: ${new Date(capturedData.timestamp).toLocaleString()}`;
  dataSection.appendChild(timestamp);
  
  const url = document.createElement('div');
  url.className = 'url';
  url.textContent = `API URL: ${capturedData.url}`;
  dataSection.appendChild(url);
  
  const jsonViewerWrapper = document.createElement('div');
  jsonViewerWrapper.className = 'json-viewer';
  
  const jsonContentScroll = document.createElement('div');
  jsonContentScroll.className = 'json-content-scroll';
  jsonContentScroll.appendChild(createJsonTree(capturedData.data, 0)); // Top level expanded, nested collapsed
  
  jsonViewerWrapper.appendChild(jsonContentScroll);
  dataSection.appendChild(jsonViewerWrapper);
  
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';
  
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy to Clipboard';
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(capturedData.data, null, 2));
    copyButton.textContent = '✓ Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy to Clipboard';
    }, 2000);
  });
  buttonGroup.appendChild(copyButton);
  
  const downloadButton = document.createElement('button');
  downloadButton.className = 'secondary';
  downloadButton.textContent = 'Download JSON';
  downloadButton.addEventListener('click', () => {
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(capturedData.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `blueflame-chat-data-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update button text temporarily
    downloadButton.textContent = '✓ Downloaded!';
    setTimeout(() => {
      downloadButton.textContent = 'Download JSON';
    }, 2000);
  });
  buttonGroup.appendChild(downloadButton);
  
  dataSection.appendChild(buttonGroup);
  
  dataContainer.innerHTML = '';
  dataContainer.appendChild(dataSection);
}

// Create collapsible JSON tree
let toggleCounter = 0;

function createJsonTree(obj, depth = 0) {
  const container = document.createElement('div');
  
  if (obj === null) {
    container.innerHTML = '<span class="json-null">null</span>';
    return container;
  }
  
  if (typeof obj !== 'object') {
    container.appendChild(formatValue(obj));
    return container;
  }
  
  const isArray = Array.isArray(obj);
  const entries = isArray ? obj.map((v, i) => [i, v]) : Object.entries(obj);
  
  if (entries.length === 0) {
    container.innerHTML = isArray ? '<span class="json-bracket">[]</span>' : '<span class="json-bracket">{}</span>';
    return container;
  }
  
  // Check if this object looks like a message (has content and/or role)
  const isMessage = !isArray && obj.content !== undefined;
  
  // Check if this is a messages array (parent object has "messages" key that is an array)
  const isMessagesArray = isArray && obj.length > 0 && obj[0] && obj[0].content !== undefined;
  
  // Top level (depth 0) is expanded, everything else is collapsed
  const startCollapsed = depth > 0;
  
  const contentId = `json-content-${toggleCounter++}`;
  
  const headerLine = document.createElement('div');
  headerLine.className = 'json-line';
  
  // Wrap in messages container if it's a messages array
  let wrapper;
  if (isMessagesArray) {
    wrapper = document.createElement('div');
    wrapper.className = 'json-messages-container';
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '1';
    headerLine.style.position = 'relative';
    headerLine.style.zIndex = '10';
    
    // Add copy task IDs button
    const copyTaskIdsBtn = document.createElement('button');
    copyTaskIdsBtn.className = 'json-copy-taskids-btn';
    copyTaskIdsBtn.textContent = 'Copy Task IDs';
    copyTaskIdsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskIds = obj
        .filter(msg => msg.ref_task_id !== undefined && msg.ref_task_id !== null)
        .map(msg => String(msg.ref_task_id))
        .join('\n');
      navigator.clipboard.writeText(taskIds);
      copyTaskIdsBtn.textContent = '✓ Copied!';
      copyTaskIdsBtn.classList.add('copied');
      setTimeout(() => {
        copyTaskIdsBtn.textContent = 'Copy Task IDs';
        copyTaskIdsBtn.classList.remove('copied');
      }, 2000);
    });
    headerLine.appendChild(copyTaskIdsBtn);
    
    // Add copy messages button
    const copyMessagesBtn = document.createElement('button');
    copyMessagesBtn.className = 'json-copy-messages-btn';
    copyMessagesBtn.textContent = 'Copy Messages';
    copyMessagesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const messagesJson = JSON.stringify(obj, null, 2);
      navigator.clipboard.writeText(messagesJson);
      copyMessagesBtn.textContent = '✓ Copied!';
      copyMessagesBtn.classList.add('copied');
      setTimeout(() => {
        copyMessagesBtn.textContent = 'Copy Messages';
        copyMessagesBtn.classList.remove('copied');
      }, 2000);
    });
    headerLine.appendChild(copyMessagesBtn);
  }
  // Wrap in message container if it's a single message
  else if (isMessage) {
    wrapper = document.createElement('div');
    wrapper.className = 'json-message-container';
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '1';
    headerLine.style.position = 'relative';
    headerLine.style.zIndex = '10';
    
    // Add copy task ID button if ref_task_id exists
    if (obj.ref_task_id !== undefined && obj.ref_task_id !== null) {
      const copyTaskBtn = document.createElement('button');
      copyTaskBtn.className = 'json-copy-task-btn';
      copyTaskBtn.textContent = 'Copy Task ID';
      copyTaskBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(obj.ref_task_id));
        copyTaskBtn.textContent = '✓ Copied!';
        copyTaskBtn.classList.add('copied');
        setTimeout(() => {
          copyTaskBtn.textContent = 'Copy Task ID';
          copyTaskBtn.classList.remove('copied');
        }, 2000);
      });
      headerLine.appendChild(copyTaskBtn);
    }
    
    // Add copy message button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'json-copy-btn';
    copyBtn.textContent = 'Copy Message';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const messageJson = JSON.stringify(obj, null, 2);
      navigator.clipboard.writeText(messageJson);
      copyBtn.textContent = '✓ Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Message';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
    headerLine.appendChild(copyBtn);
  } else {
    wrapper = container;
  }
  
  const toggle = document.createElement('span');
  toggle.className = startCollapsed ? 'json-toggle collapsed' : 'json-toggle';
  toggle.textContent = startCollapsed ? '▶' : '▼';
  toggle.setAttribute('data-content', contentId);
  toggle.addEventListener('click', () => {
    const content = document.getElementById(contentId);
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
      content.classList.remove('collapsed');
      toggle.classList.remove('collapsed');
      toggle.textContent = '▼';
    } else {
      content.classList.add('collapsed');
      toggle.classList.add('collapsed');
      toggle.textContent = '▶';
    }
  });
  
  headerLine.appendChild(toggle);
  
  const bracket = document.createElement('span');
  bracket.className = 'json-bracket';
  bracket.textContent = isArray ? '[' : '{';
  headerLine.appendChild(bracket);
  
  const preview = document.createElement('span');
  preview.className = 'json-collapsed-preview';
  preview.textContent = isArray ? ` ${entries.length} items` : ` ${entries.length} properties`;
  headerLine.appendChild(preview);
  
  (isMessagesArray || isMessage ? wrapper : container).appendChild(headerLine);
  
  const content = document.createElement('div');
  content.className = startCollapsed ? 'json-content collapsed' : 'json-content';
  content.id = contentId;
  
  entries.forEach(([key, value], index) => {
    const line = document.createElement('div');
    line.className = 'json-line';
    line.style.marginLeft = '20px';
    
    // Show key for objects or index for arrays
    const keySpan = document.createElement('span');
    keySpan.className = 'json-key';
    if (isArray) {
      // Check if this is a message object (has content property)
      const isMessageItem = value && typeof value === 'object' && value.content !== undefined;
      if (isMessageItem) {
        // Wrap the preview line in a message header container
        const messageHeaderContainer = document.createElement('div');
        messageHeaderContainer.className = 'json-message-header';
        messageHeaderContainer.style.display = 'inline-flex';
        messageHeaderContainer.style.alignItems = 'center';
        
        // For messages, show [index] [content preview] without colon
        keySpan.textContent = `[${key}]`;
        messageHeaderContainer.appendChild(keySpan);
        
        // Add content preview in square brackets
        const contentPreview = document.createElement('span');
        contentPreview.className = 'json-collapsed-preview';
        const previewText = typeof value.content === 'string' ? value.content : JSON.stringify(value.content);
        const truncated = previewText.length > 50 ? previewText.substring(0, 50) + '...' : previewText;
        contentPreview.textContent = ` [${truncated}]`;
        messageHeaderContainer.appendChild(contentPreview);
        
        line.appendChild(messageHeaderContainer);
        
        // Append the line with just the index and preview
        content.appendChild(line);
        
        // Create a new line for the object itself
        const objectLine = document.createElement('div');
        objectLine.className = 'json-line';
        objectLine.style.marginLeft = '20px';
        objectLine.appendChild(createJsonTree(value, depth + 1));
        
        if (index < entries.length - 1) {
          const comma = document.createElement('span');
          comma.className = 'json-bracket';
          comma.textContent = ',';
          objectLine.appendChild(comma);
        }
        
        content.appendChild(objectLine);
        
        // Wait for the tree to be created and find the message container
        setTimeout(() => {
          const messageContainer = objectLine.querySelector('.json-message-container');
          if (messageContainer) {
            // Add hover event listeners to show message buttons when hovering over the header
            messageHeaderContainer.addEventListener('mouseenter', () => {
              const copyBtn = messageContainer.querySelector('.json-copy-btn');
              const copyTaskBtn = messageContainer.querySelector('.json-copy-task-btn');
              if (copyBtn) copyBtn.style.opacity = '1';
              if (copyTaskBtn) copyTaskBtn.style.opacity = '1';
            });
            
            messageHeaderContainer.addEventListener('mouseleave', () => {
              const copyBtn = messageContainer.querySelector('.json-copy-btn');
              const copyTaskBtn = messageContainer.querySelector('.json-copy-task-btn');
              if (copyBtn) copyBtn.style.opacity = '0';
              if (copyTaskBtn) copyTaskBtn.style.opacity = '0';
            });
            
            // Also add hover event listeners directly on the message container
            messageContainer.addEventListener('mouseenter', () => {
              const copyBtn = messageContainer.querySelector('.json-copy-btn');
              const copyTaskBtn = messageContainer.querySelector('.json-copy-task-btn');
              if (copyBtn) copyBtn.style.opacity = '1';
              if (copyTaskBtn) copyTaskBtn.style.opacity = '1';
            });
            
            messageContainer.addEventListener('mouseleave', () => {
              const copyBtn = messageContainer.querySelector('.json-copy-btn');
              const copyTaskBtn = messageContainer.querySelector('.json-copy-task-btn');
              if (copyBtn) copyBtn.style.opacity = '0';
              if (copyTaskBtn) copyTaskBtn.style.opacity = '0';
            });
          }
        }, 0);
        
        return; // Skip the rest of the loop for this item
      } else {
        keySpan.textContent = `[${key}]:`;
      }
    } else {
      keySpan.textContent = `"${key}":`;
    }
    line.appendChild(keySpan);
    
    if (typeof value === 'object' && value !== null) {
      line.appendChild(createJsonTree(value, depth + 1));
    } else {
      line.appendChild(formatValue(value));
    }
    
    if (index < entries.length - 1) {
      const comma = document.createElement('span');
      comma.className = 'json-bracket';
      comma.textContent = ',';
      line.appendChild(comma);
    }
    
    content.appendChild(line);
  });
  
  (isMessagesArray || isMessage ? wrapper : container).appendChild(content);
  
  const closingLine = document.createElement('div');
  closingLine.className = 'json-line';
  const closingBracket = document.createElement('span');
  closingBracket.className = 'json-bracket';
  closingBracket.textContent = isArray ? ']' : '}';
  closingLine.appendChild(closingBracket);
  (isMessagesArray || isMessage ? wrapper : container).appendChild(closingLine);
  
  if (isMessagesArray || isMessage) {
    container.appendChild(wrapper);
  }
  
  return container;
}

function formatValue(value) {
  const span = document.createElement('span');
  
  if (typeof value === 'string') {
    span.className = 'json-string';
    span.textContent = `"${value}"`;
  } else if (typeof value === 'number') {
    span.className = 'json-number';
    span.textContent = value;
  } else if (typeof value === 'boolean') {
    span.className = 'json-boolean';
    span.textContent = value;
  } else if (value === null) {
    span.className = 'json-null';
    span.textContent = 'null';
  } else {
    span.textContent = String(value);
  }
  
  return span;
}

