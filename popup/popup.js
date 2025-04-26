document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-extension');
    if (!toggleSwitch) {
      console.error("Toggle element not found!");
      return;
    }
  
    chrome.storage.local.get(['extensionEnabled'], (result) => {
      toggleSwitch.checked = result.extensionEnabled || false;
    });
  
    toggleSwitch.addEventListener('change', () => {
      const isEnabled = toggleSwitch.checked;
      chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
        console.log(`Extension is now ${isEnabled ? 'ON' : 'OFF'}`);
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
        console.log("Popup loaded");
      
        const toggleSwitch = document.getElementById('toggle-extension');
        if (!toggleSwitch) {
          console.error("Toggle element not found!");
          return;
        }
      
        chrome.storage.local.get(['extensionEnabled'], (result) => {
          console.log("Loaded state from storage:", result);
          toggleSwitch.checked = result.extensionEnabled || false;
        });
      
        toggleSwitch.addEventListener('change', () => {
          console.log("Toggle was changed!");
          
          const isEnabled = toggleSwitch.checked;
          console.log(`New toggle state: ${isEnabled}`);
      
          chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
            console.log(`Extension is now ${isEnabled ? 'ON' : 'OFF'}`);
          });
        });
      });

      
  });
  