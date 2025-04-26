import { keywords } from './utils.js';

export function pinContainsKeywords(pin) {
  let text = "";

  if (pin.innerText) text += pin.innerText.toLowerCase();

  const images = pin.querySelectorAll('img[alt]');
  images.forEach(img => {
    text += " " + img.alt.toLowerCase();
  });

  const badges = pin.querySelectorAll('[data-test-id="pinRepLabel"]');
  badges.forEach(badge => {
    text += " " + badge.innerText.toLowerCase();
  });

  const hashtags = pin.querySelectorAll('a[href*="/search/pins/?q="]');
  hashtags.forEach(tag => {
    text += " " + tag.innerText.toLowerCase();
  });

  return keywords.some(keyword => text.includes(keyword));
}

export function commentsContainKeywords(modal) {
  const comments = modal.querySelectorAll('[data-test-id="comment"]');
  for (const comment of comments) {
    if (comment.innerText) {
      const text = comment.innerText.toLowerCase();
      if (keywords.some(keyword => text.includes(keyword))) {
        return true;
      }
    }
  }
  return false;
}

export function profileContainsKeywords() {
  let text = "";

  const bio = document.querySelector('[data-test-id="user-bio"]');
  if (bio && bio.innerText) text += bio.innerText.toLowerCase();

  const pins = document.querySelectorAll('div[data-test-id="pin"]');
  pins.forEach(pin => {
    if (pin.innerText) text += " " + pin.innerText.toLowerCase();
  });

  return keywords.some(keyword => text.includes(keyword));
}
