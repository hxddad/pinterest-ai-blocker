// Get config from window object
const CONFIG = window.EXTENSION_CONFIG;
const API_USER = CONFIG.API_USER;
const API_SECRET = CONFIG.API_SECRET;

// Rate limiting utility
// Add progress tracking
let processedCount = 0;
let totalImages = 0;
let aiDetectedCount = 0;

// Add processed URLs tracking at the top level
const processedUrls = new Set();

// Add to top of file
const resultCache = {
    async get(imageUrl) {
        try {
            const cache = JSON.parse(localStorage.getItem('ai-detection-cache') || '{}');
            return cache[imageUrl];
        } catch {
            return null;
        }
    },
    
    async set(imageUrl, result) {
        try {
            const cache = JSON.parse(localStorage.getItem('ai-detection-cache') || '{}');
            cache[imageUrl] = result;
            localStorage.setItem('ai-detection-cache', JSON.stringify(cache));
        } catch {
            console.warn('Failed to cache result');
        }
    }
};

const rateLimiter = {
    queue: [],
    processing: false,
    lastCall: 0,
    minDelay: 500, // Increase to 5 seconds between calls
    maxConcurrent: 3, // Maximum concurrent requests

    async add(imageUrl) {
        if (!this.queue.includes(imageUrl)) {
            this.queue.push(imageUrl);
            if (!this.processing) {
                this.processing = true;
                await this.processQueue();
            }
        }
    },

    async processQueue() {
        const activeRequests = new Set();
        
        while (this.queue.length > 0) {
            // Remove completed requests
            for (const request of activeRequests) {
                if (request.completed) {
                    activeRequests.delete(request);
                }
            }
            
            // Process new requests if under limit
            while (activeRequests.size < this.maxConcurrent && this.queue.length > 0) {
                const imageUrl = this.queue.shift();
                const request = this.processImage(imageUrl);
                activeRequests.add(request);
            }
            
            // Wait for at least one request to complete
            await Promise.race([...activeRequests].map(r => r.promise));
        }
        this.processing = false;
        
        if (processedCount === totalImages) {
            console.log(`Processing complete. Found ${aiDetectedCount} AI-generated images out of ${totalImages} total images.`);
        }
    },

    async processImage(imageUrl) {
        const request = {
            completed: false,
            promise: null
        };

        request.promise = (async () => {
            try {
                const result = await analyzeImageWithSightengine(imageUrl);
                if (result?.ai_generated?.prob >= 0.5) {
                    markImageAsAI(imageUrl);
                    aiDetectedCount++;
                }
                processedCount++;
            } catch (error) {
                console.warn('Failed to process image:', imageUrl, error);
                processedCount++;
            } finally {
                request.completed = true;
            }
        })();

        return request;
    }
};

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Update extractImageUrls to be more efficient
function extractImageUrls() {
    const images = document.querySelectorAll('img');
    
    // Convert to array and add viewport checking
    return Array.from(images)
        .sort((a, b) => {
            const aVisible = isInViewport(a);
            const bVisible = isInViewport(b);
            return (bVisible - aVisible); // Visible images first
        })
        .map(img => img.src)
        .filter(src => {
            if (!src || processedUrls.has(src)) return false;
            const isValid = !src.includes('data:image') && 
                          !src.includes('75x75_RS') &&
                          !src.includes('_50x.') &&
                          !src.includes('_75x.');
            return isValid;
        });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}

// Update analyzeImageWithSightengine to provide more detailed logging
async function analyzeImageWithSightengine(imageUrl) {
    // Check cache first
    const cached = await resultCache.get(imageUrl);
    if (cached) {
        return cached;
    }

    try {
        // Skip if already processed
        if (processedUrls.has(imageUrl)) {
            return null;
        }
        processedUrls.add(imageUrl);

        // Add timeout to fetch requests
        const timeout = 30000; // 30 seconds timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // First fetch the image with proper headers
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.pinterest.com/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
            },
            signal: controller.signal
        });

        if (!imageResponse.ok) {
            clearTimeout(timeoutId);
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Convert the image to blob
        const blob = await imageResponse.blob();
        const formData = new FormData();
        formData.append('media', blob, 'image.jpg');
        formData.append('models', 'genai'); // Ensure this matches exactly
        formData.append('api_user', API_USER);
        formData.append('api_secret', API_SECRET);

        console.log('Sending request with FormData:', {
            models: formData.get('models'),
            api_user: formData.get('api_user'),
            api_secret: '***'
        });

        // Send the image directly to Sightengine with timeout
        const response = await fetch('https://api.sightengine.com/1.0/check.json', {
            method: 'POST',
            headers: {
                'User-Agent': 'Pinterest-AI-Blocker/1.0',
                'Accept': 'application/json'
            },
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Response Error:', {
                status: response.status,
                text: errorText
            });
            
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return analyzeImageWithSightengine(imageUrl);
            }
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            console.log('API Response:', data); // Debug log
            
            // Access the ai_generated probability from type
            const result = {
                ai_generated: {
                    prob: data.type?.ai_generated || 0
                }
            };
            await resultCache.set(imageUrl, result);
            return result;
        }

        throw new Error(`API Error: ${JSON.stringify(data.error)}`);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Request timed out:', imageUrl);
            return null;
        }
        if (error.message.includes('429')) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            return analyzeImageWithSightengine(imageUrl);
        }
        console.error('Detailed API error:', error);
        console.error('API Request Failed:', {
            url: imageUrl,
            error: error.message
        });
        return null;
    }
}

// Update processImages to handle errors more gracefully
async function processImages() {
    try {
        const imageUrls = extractImageUrls().filter(url => !processedUrls.has(url));
        if (imageUrls.length === 0) {
            console.log('No new images to process');
            return;
        }

        totalImages = imageUrls.length;
        processedCount = 0;
        aiDetectedCount = 0;
        
        console.log(`Starting to analyze ${totalImages} new images for AI content...`);
        
        for (const imageUrl of imageUrls) {
            await rateLimiter.add(imageUrl);
        }
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

function markImageAsAI(imageUrl) {
    const img = document.querySelector(`img[src="${imageUrl}"]`);
    if (img) {
        // Add transition for smooth visual effect
        img.style.transition = 'filter 0.3s ease-in-out';
        img.classList.add('ai-blur');

        const label = document.createElement('div');
        label.classList.add('ai-label');
        label.textContent = 'AI Generated';
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.3s ease-in-out';

        img.parentElement.style.position = 'relative';
        img.parentElement.appendChild(label);

        // Trigger animation
        requestAnimationFrame(() => {
            label.style.opacity = '1';
        });
    }
}

(async function () {
    console.log('Starting AI detection...');
    await processImages();
    console.log('AI detection complete.');
})();

// Update observer with debouncing
const debouncedProcessImages = debounce(() => {
    processImages();
}, 2000);

const observer = new MutationObserver((mutations) => {
    const hasNewImages = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
            node.nodeName === 'IMG' || node.querySelector?.('img')
        )
    );

    if (hasNewImages) {
        debouncedProcessImages();
    }
});

// Start observation
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
});

// Initial processing with delay
setTimeout(() => {
    processImages();
}, 2000);


