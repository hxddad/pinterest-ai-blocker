// Import the configuration
// Ensure `config.js` is included in your HTML or extension manifest
const API_USER = CONFIG.API_USER;
const API_SECRET = CONFIG.API_SECRET;

function extractImageUrls() {
    const images = document.querySelectorAll('img');
    return Array.from(images).map(img => img.src).filter(src => src);
}

async function analyzeImageWithSightengine(imageUrl) {
    const apiUser = API_USER;
    const apiSecret = API_SECRET;

    const url = `https://api.sightengine.com/1.0/check.json?models=ai-generated&url=${encodeURIComponent(imageUrl)}&api_user=${apiUser}&api_secret=${apiSecret}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            return data;
        } else {
            console.error('Error from Sightengine API:', data);
            return null;
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
        return null;
    }
}

async function processImages() {
    const imageUrls = extractImageUrls();

    for (const imageUrl of imageUrls) {
        console.log(`Analyzing image: ${imageUrl}`);
        const result = await analyzeImageWithSightengine(imageUrl);

        if (result && result.ai_generated && result.ai_generated.prob > 0.5) {
            console.log(`AI-generated image detected: ${imageUrl}`);
            markImageAsAI(imageUrl);
        } else {
            console.log(`Image is not AI-generated: ${imageUrl}`);
        }
    }
}

function markImageAsAI(imageUrl) {
    const img = document.querySelector(`img[src="${imageUrl}"]`);
    if (img) {
        img.style.filter = 'blur(5px)';
        img.style.border = '2px solid red';

        const label = document.createElement('div');
        label.textContent = 'AI Generated';
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '0';
        label.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        label.style.color = 'white';
        label.style.padding = '2px 4px';
        label.style.fontSize = '12px';
        label.style.zIndex = '1000';
        img.parentElement.style.position = 'relative';
        img.parentElement.appendChild(label);
    }
}

(async function () {
    console.log('Starting AI detection...');
    await processImages();
    console.log('AI detection complete.');
})();


