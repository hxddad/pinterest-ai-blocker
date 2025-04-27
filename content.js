// Predefined keywords with various formats
const AI_KEYWORDS = [
  // Standard "ai" with spaces
  " ai ",      // Middle of sentence: "This was made with ai"
  "^ai ",      // Start of text: "ai generated art"
  " ai$",      // End of text: "created using ai"
  "#ai",       // start of text: "#ai" for hashtags


  // Punctuation after "ai"
  " ai.",      // Ends with period: "made with ai."
  " ai,",      // Ends with comma: "ai, the future of art"
  " ai!",      // Ends with exclamation: "powered by ai!"
  " ai?",      // Ends with question: "is this ai?"
  " ai;",      // Ends with semicolon: "tools: ai;"
  " ai:",      // Ends with colon: "technology: ai:"

  // Punctuation before "ai"
  "(ai ",      // After opening parenthesis: "(ai generated)"
  "[ai ",      // After opening bracket: "[ai]"
  "{ai ",      // After opening brace: "{ai}"
  "'ai ",      // After single quote: "'ai art'"
  "\"ai ",     // After double quote: "\"ai\""

  // Hyphenated/compound cases
  " ai-",     // Before hyphen: "ai-powered"
  "-ai ",     // After hyphen: "non-ai content"

  // Abbreviated forms (a.i.)
  " a.i. ",   // Standard abbreviation: "made with a.i."
  " a.i ",    // Missing end dot: "a.i generated"
  "^a.i. ",   // Start of text: "a.i. art"
  " a.i.$",   // End of text: "created via a.i."
  " a.i.",    // Ends with period: "a.i."
  " a.i,",    // Ends with comma: "a.i, the future"
  " a.i!",    // Ends with exclamation: "a.i!"
  " a.i?",    // Ends with question: "a.i?"

  // Edge cases (rare but possible)
  " ai/",     // Before slash: "ai/ml"
  "/ai ",     // After slash: "ml/ai"
  " ai&",     // Before ampersand: "ai&ml"
  "&ai ",     // After ampersand: "ml&ai"

  "ai modified",
  "ai-modified",
  "modified by ai",
  "modified with ai",
  "ai modification",
  "ai edit",
  "ai edited",
  "ai-edited",
    
    // Additional cases
  "modified using ai",
  "edited with ai",
  "edited by ai",
  "ai enhancement",
  "ai enhanced",
  "ai-enhanced"
];




// Wrap pin content for proper layering
function wrapPinContent(pinElement) {
    if (pinElement.classList.contains('ai-processed')) return;
    
    // Find the main visual content (image/video)
    const visualContent = pinElement.querySelector('img, video') || 
                         pinElement.querySelector('[data-test-id="pinrep-image"]');
    
    if (!visualContent) return;
    
    // Create container wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-pin-container';
    
    // Wrap the visual content
    visualContent.parentNode.insertBefore(wrapper, visualContent);
    wrapper.appendChild(visualContent);
    
    // Add label
    const label = document.createElement('div');
    label.className = 'ai-label';
    label.textContent = 'AI Generated';
    wrapper.appendChild(label);
    
    // Mark as processed
    pinElement.classList.add('ai-processed');
    visualContent.classList.add('ai-blur');
}

function markPinAsSuspicious(pinElement) {
    if (pinElement.classList.contains('suspicious-pin')) return;

    // Find the main visual content (image/video)
    const visualContent =  pinElement.querySelector('[data-test-id="pinrep-image"]');

    if (!visualContent) return;

    // Create container wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'suspicious-pin-container';

    // Wrap the visual content
    visualContent.parentNode.insertBefore(wrapper, visualContent);
    wrapper.appendChild(visualContent);

    // Add "Suspicious" label
    const label = document.createElement('div');
    label.className = 'suspicious-label';
    label.textContent = 'Suspicious Content';
    wrapper.appendChild(label);

    // Mark as processed
    pinElement.classList.add('suspicious-pin');
    visualContent.classList.add('suspicious-blur');
}

// Process pins to detect AI content
function processAIPins() {
    function normalizeText(text) {
        if (!text) return "";
        return text
            .toLowerCase() // Convert to lowercase
            .replace(/[^a-z0-9\s]/g, "") // Remove special characters
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .trim(); // Trim leading and trailing spaces
    }

    const selectors = [
        '[data-test-id="ai-generated-label"]',
        '[data-test-id="pin"]',
        '[data-test-id="pinWrapper"]',
        'div[role="listitem"]',
        '[class*="Pin__Wrapper"]'
    ].join(',');

    document.querySelectorAll(selectors).forEach(pin => {
        const pinText = normalizeText(pin.textContent);

        if (!pinText) {
            // Mark as suspicious if no text is found
            console.log("Suspicious pin detected: No text content.");
            markPinAsSuspicious(pin);
            return;
        }

        const isAI = AI_KEYWORDS.some(keyword =>
            pinText.includes(normalizeText(keyword))
        );

        if (isAI) {
            wrapPinContent(pin);
        }
    });
}

// Initial processing with delay
setTimeout(processAIPins, 800);

// Mutation observer for dynamic content
const observer = new MutationObserver(() => {
    requestAnimationFrame(processAIPins);
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

// Handle scroll loading
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(processAIPins, 300);
}, { passive: true });

