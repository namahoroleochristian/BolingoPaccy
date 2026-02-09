// Create a new file: public/disable-clipboard.js
// Add this to your index.html or main HTML file:
// <script src="/disable-clipboard.js" defer></script>

(function() {
  'use strict';
  
  // Only run on premium content page
  if (!window.location.pathname.includes('/premium-content')) {
    return;
  }
  
  console.log('Premium Content Security: Clipboard protection activated');
  
  // Function to show security notification
  function showSecurityNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Disable copy/cut/paste events
  function disableClipboard(e) {
    e.preventDefault();
    
    const eventType = e.type;
    let message = '';
    
    switch(eventType) {
      case 'copy':
        message = 'Copying content is disabled on premium pages';
        break;
      case 'cut':
        message = 'Cutting content is disabled on premium pages';
        break;
      case 'paste':
        message = 'Pasting content is disabled on premium pages';
        break;
    }
    
    showSecurityNotification(message);
    return false;
  }
  
  // Disable right-click context menu
  function disableContextMenu(e) {
    e.preventDefault();
    showSecurityNotification('Right-click is disabled on premium content');
    return false;
  }
  
  // Disable keyboard shortcuts for copy/cut/paste
  function disableKeyboardShortcuts(e) {
    // Check for Ctrl+C, Ctrl+X, Ctrl+V, Cmd+C, Cmd+X, Cmd+V
    const isCopy = (e.ctrlKey || e.metaKey) && e.keyCode === 67;
    const isCut = (e.ctrlKey || e.metaKey) && e.keyCode === 88;
    const isPaste = (e.ctrlKey || e.metaKey) && e.keyCode === 86;
    
    if (isCopy || isCut || isPaste) {
      e.preventDefault();
      const action = isCopy ? 'Copy' : isCut ? 'Cut' : 'Paste';
      showSecurityNotification(`${action} shortcut (Ctrl+${String.fromCharCode(e.keyCode)}) is disabled`);
      return false;
    }
  }
  
  // Disable text selection
  function disableTextSelection(e) {
    e.preventDefault();
    return false;
  }
  
  // Disable drag and drop
  function disableDragStart(e) {
    e.preventDefault();
    return false;
  }
  
  // Add CSS to disable text selection
  function addNoSelectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body.premium-content-page {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      body.premium-content-page * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      /* Allow selection in input/textarea for login if needed */
      body.premium-content-page input,
      body.premium-content-page textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('premium-content-page');
  }
  
  // Block YouTube iframe context menu
  function blockIframeContextMenu() {
    // Set interval to constantly monitor and block iframe context menus
    const interval = setInterval(() => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          // Try to post message to disable context menu
          iframe.contentWindow?.postMessage({
            type: 'disable-context-menu',
            timestamp: Date.now()
          }, '*');
        } catch (e) {
          // Silently fail if cross-origin
        }
      });
    }, 1000);
    
    return interval;
  }
  
  // Disable Print Screen and other screenshot keys
  function disableScreenshotKeys(e) {
    // Print Screen key
    if (e.keyCode === 44 || e.key === 'PrintScreen') {
      e.preventDefault();
      showSecurityNotification('Screenshots are disabled on premium content');
      return false;
    }
    
    // Alt + Print Screen
    if (e.altKey && (e.keyCode === 44 || e.key === 'PrintScreen')) {
      e.preventDefault();
      showSecurityNotification('Screenshots are disabled on premium content');
      return false;
    }
    
    // Windows + Print Screen (Windows screenshot)
    if (e.key === 'PrintScreen' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      showSecurityNotification('Screenshots are disabled on premium content');
      return false;
    }
  }
  
  // Disable DevTools
  function disableDevTools() {
    // Disable F12
    document.addEventListener('keydown', function(e) {
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showSecurityNotification('Developer tools are disabled on premium content');
        return false;
      }
      
      // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67) {
          e.preventDefault();
          showSecurityNotification('Developer tools are disabled on premium content');
          return false;
        }
      }
      
      // Disable Ctrl+U (View source)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
        showSecurityNotification('View source is disabled on premium content');
        return false;
      }
    });
  }
  
  // Initialize all security measures
  function initializeSecurity() {
    console.log('Initializing premium content security measures...');
    
    // Add CSS styles
    addNoSelectStyles();
    
    // Add event listeners
    document.addEventListener('copy', disableClipboard);
    document.addEventListener('cut', disableClipboard);
    document.addEventListener('paste', disableClipboard);
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('selectstart', disableTextSelection);
    document.addEventListener('dragstart', disableDragStart);
    document.addEventListener('keydown', disableScreenshotKeys);
    
    // Disable DevTools
    disableDevTools();
    
    // Start blocking iframe context menus
    const iframeInterval = blockIframeContextMenu();
    
    // Show initial security notice
    setTimeout(() => {
      showSecurityNotification('🔒 Premium Content Protection Active: Copying, screenshots, and right-click are disabled');
    }, 1000);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
      clearInterval(iframeInterval);
      document.removeEventListener('copy', disableClipboard);
      document.removeEventListener('cut', disableClipboard);
      document.removeEventListener('paste', disableClipboard);
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('selectstart', disableTextSelection);
      document.removeEventListener('dragstart', disableDragStart);
      document.removeEventListener('keydown', disableScreenshotKeys);
    });
    
    console.log('Premium content security measures initialized');
  }
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurity);
  } else {
    initializeSecurity();
  }
  
  // Also add protection for dynamically loaded content
  const originalAppendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function() {
    const element = originalAppendChild.apply(this, arguments);
    
    // Re-apply security to new elements
    if (element.addEventListener) {
      element.addEventListener('copy', disableClipboard);
      element.addEventListener('cut', disableClipboard);
      element.addEventListener('paste', disableClipboard);
      element.addEventListener('contextmenu', disableContextMenu);
      element.addEventListener('selectstart', disableTextSelection);
      element.addEventListener('dragstart', disableDragStart);
    }
    
    return element;
  };
  
})();