// content.js
import { sleep } from './utils.js';
import { pinContainsKeywords, commentsContainKeywords, profileContainsKeywords } from './scanner.js';
import { removeBadPins, closeAndRemovePin } from './actions.js';

async function handleOpenedPin() {
  const modal = document.querySelector('[data-test-id="closeup-content"]');
  if (!modal) return;

  if (pinContainsKeywords(modal)) {
    console.log("Bad pin content detected, removing...");
    closeAndRemovePin();
    return;
  }

  await sleep(500);
  if (commentsContainKeywords(modal)) {
    console.log("Bad comments detected, removing...");
    closeAndRemovePin();
    return;
  }

  const posterLink = modal.querySelector('a[href*="/user/"], a[href*="/profile/"], a[href*="/@"]');
  if (posterLink) {
    console.log("Navigating to poster profile...");
    posterLink.click();

    await sleep(1500);

    if (profileContainsKeywords()) {
      console.log("Bad poster profile detected, removing...");
      window.history.back();
      await sleep(1000);
      removeBadPins();
    } else {
      console.log("Profile looks clean.");
      window.history.back();
    }
  }
}

// Constantly clean feed
setInterval(() => {
  removeBadPins();
}, 2000);

// Detect click on pin
document.addEventListener('click', async (e) => {
  const pin = e.target.closest('div[data-test-id="pin"]');
  if (pin) {
    console.log("Pin clicked, handling...");
    await sleep(1000);
    await handleOpenedPin();
  }
});
