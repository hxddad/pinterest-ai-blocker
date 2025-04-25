// Get the toggle switch element
const toggleSwitch = document.getElementById('toggle-extension');

// Load the saved state from chrome.storage.local
chrome.storage.local.get(['extensionEnabled'], (result) => {
  toggleSwitch.checked = result.extensionEnabled || false; // Default to false if not set
});

// Listen for changes to the toggle switch
toggleSwitch.addEventListener('change', () => {
  const isEnabled = toggleSwitch.checked;

  // Save the state to chrome.storage.local
  chrome.storage.local.set({ extensionEnabled: isEnabled }, () => {
    console.log(`Extension is now ${isEnabled ? 'ON' : 'OFF'}`);
  });
});