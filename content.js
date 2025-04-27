// Predefined keywords with various formats
const AI_KEYWORDS = [
    'ai generated', 'ai-generated', 'ai art', 'aiart', 'ai created',
    'midjourney', 'dalle', 'dall-e', 'stable diffusion', 'leonardo ai',
    '#aigenerated', '#aiart', '#midjourneyart', 'generative ai'
];

// Normalize text for comparison
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9#]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

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

// Process pins to detect AI content
function processAIPins() {
    const selectors = [
        '[data-test-id="pin"]',
        '[data-test-id="pinWrapper"]',
        'div[role="listitem"]',
        '[class*="Pin__Wrapper"]'
    ].join(',');
    
    document.querySelectorAll(selectors).forEach(pin => {
        const pinText = normalizeText(pin.textContent);
        const isAI = AI_KEYWORDS.some(keyword => 
            pinText.includes(normalizeText(keyword))
        );
        
        if (isAI) wrapPinContent(pin);
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