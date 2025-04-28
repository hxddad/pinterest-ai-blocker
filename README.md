# 📸 BlurAI — Blur AI-Generated Images on Pinterest

BlurAI is a lightweight Google Chrome extension that automatically **detects and blurs AI-generated images** on your Pinterest feed using the powerful [Sightengine API](https://sightengine.com/).

> **Idea Inspired by:** [![Watch the video](https://img.youtube.com/vi/PR73xDbB24c/maxresdefault.jpg)](https://www.youtube.com/watch?v=PR73xDbB24c)
 on detecting AI images in the wild.

---

## ✨ Features
- 🧠 **AI Detection**: Analyzes each image in your Pinterest feed.
- 🫣 **Automatic Blurring**: Instantly blurs images detected as AI-generated.
- ⚡ **Fast & Lightweight**: Minimal performance impact on your browsing.
- 🔒 **Privacy First**: Only images' URLs are sent to the API — no personal data collected.

---

## 🔧 How It Works
1. The extension scans all visible images on your Pinterest feed.
2. Each image is sent to the [Sightengine](https://sightengine.com/) API for analysis.
3. If the image is classified as **AI-generated** (deepfake, synthetic, GAN, etc.), it is blurred automatically.
4. New images loaded as you scroll are also processed in real-time.

---

## 📷 Demo
*(Coming Soon)*

---

## 🚀 Installation

1. Clone or download this repository.
2. In Chrome, navigate to `chrome://extensions/`
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select this extension's folder.
5. Start browsing Pinterest!

---

## 🛠️ Tech Stack
- **JavaScript** (Vanilla)
- **Manifest v3** for Chrome Extensions
- **Sightengine API** for AI-content detection
- **CSS** for smooth blur effects


## 🛡️ License
[MIT](LICENSE)
