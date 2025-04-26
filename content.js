const keywords = ["ai", "ai generated", "artificial intelligence", "dalle", "midjourney"];
const delay = 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pinContainsKeywords(pin) {
  const text = pin.innerText.toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

async function scanAndRemovePins() {
  const pins = document.querySelectorAll('div[data-test-id="pin"]');

  for (const pin of pins) {
    try {
      pin.scrollIntoView({behavior: "smooth"});
      await sleep(300);

      if (pinContainsKeywords(pin)) {
        console.log("Removing unwanted pin...");
        pin.remove();
        await sleep(delay);
      }
    } catch (err) {
      console.error("Error processing a pin:", err);
    }
  }

  console.log("Finished scanning pins.");
}

// Run scan every few seconds
setInterval(scanAndRemovePins, 5000);
