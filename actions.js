import { pinContainsKeywords } from './scanner.js';

export function removeBadPins() {
  const pins = document.querySelectorAll('div[data-test-id="pin"]');
  pins.forEach(pin => {
    if (pinContainsKeywords(pin)) {
      pin.remove();
    }
  });
}

export function closeAndRemovePin() {
  const closeButton = document.querySelector('[data-test-id="closeup-close-button"]');
  if (closeButton) {
    closeButton.click();
  }
  removeBadPins();
}
