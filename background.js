chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  const tabId = tabs[0].id; 
  console.log('Active tab ID:', tabId);
});
