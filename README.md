# **CodeSavvy Extension** <img src="src/assets/icons/icon48.png" width="32" height="32" align="center" alt="CodeSavvy logo">

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-v2.0.1-blue.svg?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/codesavvy/jenendhnlcnokliclhccikgeohdgfhml)
[![Manifest Version](https://img.shields.io/badge/Manifest-V3-emerald.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red.svg)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](#contributing)

A developer-focused browser extension for real-time web page manipulation, DOM debugging, and AI-powered text enhancement. Take control of any webpage, bypass restrictions, and boost your text-editing productivity with local AI integrations.

---

## 🚀 **Key Features**

### 🛠️ **Core Web Manipulation Tools**
*   **Unlock Elements**: Instantly remove `disabled`, `readonly`, and `aria-disabled` attributes from buttons, inputs, and form controls.
*   **Remove Input Limits**: Delete `maxlength` restrictions on any text field with a single click.
*   **Reveal Passwords**: Safely convert input password fields into plain readable text for debugging.
*   **Toggle Edit Mode**: Enable `document.designMode` to freely edit any webpage content on the fly.
*   **Change Fonts**: Instantly apply over 15+ clean Google Fonts (e.g., Poppins, Lexend, Montserrat) and system typography to the page.

### 🤖 **AI-Powered Text Actions (Google Gemini API)**
Right-click on any selected text to trigger context-aware AI text actions:
*   **Improve Text**: Clean up spelling, punctuation, and grammar mistakes.
*   **Advanced Improve Text**: Enhance readability, clarity, and overall phrasing.
*   **Enhance Professionally**: Rephrase selected text into a formal, corporate tone.
*   **Prompt Engineer**: Refactor rough drafts into optimized prompts for LLMs.
*   **Add Humor**: Inject light-hearted jokes, puns, or witty references.
*   **Roasted Mode**: Rewrite text with a witty, highly sarcastic, and mock-developer roast.

### 📋 **Text Case Transformations**
Instantly convert selection case via the right-click context menu:
*   Convert text casing seamlessly across plain paragraphs, inputs, and textareas.
*   Supported conversions: Sentence case, Lowercase, Uppercase, Capitalized Case, Alternating Case, Inverse Case, Title Case, and Slugify.

### ⚡ **Productivity Utilities**
*   **Clear Cache**: Empty your browser cache and reload the active tab instantly to fetch the latest code version.
*   **Screenshot Utility**: Capture the visible area of the active tab and save it as a high-quality PNG.
*   **Fullscreen Mode**: Expand the webpage to full screen for presentations, testing, or mockups.

---

## 📸 **Preview**

A look at **CodeSavvy** in action — from the main popup interface to the extension’s options page.

### 🔹 Extension Popup Interface
The popup provides quick access to core utilities, page actions, and typography options.

<p align="left">
  <img width="362" height="448" alt="CodeSavvy Popup" src="https://github.com/user-attachments/assets/0b8b92fd-218e-401d-95cf-3a084b2528bf" />
</p>

### ⚙️ Extension Options & Settings
The options page allows you to configure API keys, toggle popup features, and manage preferences.

<p align="left">
  <img width="610" height="626" alt="CodeSavvy Options" src="https://github.com/user-attachments/assets/59d3387c-61fc-45d4-9147-5def14991a3d" />
</p>

---

## 📦 **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/mahdialaaaldin/CodeSavvy.git
```

### 2. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left.
4. Select the project root folder (`CodeSavvy`) containing your `manifest.json`.

---

## ⚙️ **Options & API Setup**

Configure settings via the extension’s options page (click the gear icon ⚙️ in the popup):

1.  **API Key Configuration**
    *   Enter your **Google Gemini API Key** to enable the AI text enhancement features.
    *   Keys are stored securely in local browser storage and sent directly to Google endpoints.
    *   Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Advanced Settings**
    *   **Inspirational Quote**: Toggle the motivational quote displayed at the bottom of the popup interface. (Default: *Enabled*).

---

## ⌨️ **Keyboard Shortcuts**

Quickly trigger core functions using keyboard combinations.

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Shift + E` | Unlock webpage elements |
| `Ctrl + Shift + Y` | Toggle Page Edit Mode (`designMode`) |
| `Ctrl + Shift + L` | Improve selected text using Gemini AI |
| `Ctrl + Shift + R` | Clear cache and reload active tab |

> [!TIP]
> You can customize these shortcuts at any time by visiting `chrome://extensions/shortcuts` in Google Chrome.

---

## 📁 **File Structure**

This project is organized as follows:

```
CodeSavvy/
├── manifest.json         # Extension configuration (Manifest V3)
├── README.md             # Documentation (This file)
└── src/                  # Source Code
    ├── assets/
    │   └── icons/        # Visual icons & assets
    ├── background/
    │   └── background.js # Extension background service worker
    ├── options/
    │   ├── options.html  # Options page interface
    │   └── options.js    # Options logic & storage management
    ├── popup/
    │   ├── popup.html    # Main popup layout
    │   └── popup.js      # Main popup interactive logic
    └── shared/           # Common utilities and functions
```

---

## 🔒 **Security & Privacy**

We believe in strict user data privacy and data minimization.
*   **No Remote Code**: The extension executes 100% locally bundled code, in compliance with Chrome Web Store MV3 guidelines.
*   **Direct API Calls**: Your Gemini API Key is stored safely on your browser profile via `chrome.storage.local`. When utilizing AI features, selected text is sent directly to Google Gemini API endpoints without routing through any intermediary developer servers.
*   **No Tracking**: We do not collect, store, or sell any of your personal details, browsing history, or website activities.

For a detailed review of our privacy practices, read our [PRIVACY_POLICY.md](PRIVACY_POLICY.md) or visit our publicly hosted [Privacy Policy Page](https://mahdialaaaldin.github.io/codesavvy-docs/privacy.html). 

For extension testing and demonstration, you can access the live [CodeSavvy Sandbox Hub](https://mahdialaaaldin.github.io/codesavvy-docs/index.html).

---

## 🛠️ **Required Permissions**

CodeSavvy requests the following permissions for operational purposes:

*   `activeTab`: Required to interact with and edit the tab currently in focus.
*   `scripting`: Used to inject styling scripts (changing fonts, unlocking elements) into the page.
*   `storage`: Necessary to store your option choices and API key securely on your device.
*   `tabs`: Utilized to capture screenshots and perform tab refreshes securely.
*   `browsingData`: Used to programmatically clear browser cache upon request.
*   `contextMenus`: Required to register right-click options for text manipulations.
*   `notifications`: Displays minor completion alerts for background tasks.
*   `downloads`: Enables the screenshot tool to save files directly to your device.

---

## 🤝 **Contributing**

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "feat: add some feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---

## 📄 **License**

Copyright © 2025-2026 mahdialaaaldin.  
All rights reserved.  
No part of this project may be used, copied, modified, or distributed without explicit written permission from the owner.

---

## 📬 **Contact**

For bug reports, questions, or general feedback, reach out via:
*   **Email**: [mahdialaaaldin+codesavvy@gmail.com](mailto:mahdialaaaldin+codesavvy@gmail.com)
