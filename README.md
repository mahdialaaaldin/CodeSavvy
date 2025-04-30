# **CodeSavvy Extension** <img src="Icons/ai-logo.gif" width="24" height="24" align="center" alt="Animated logo">

A developer-focused browser extension for real-time web page manipulation with essential tools for debugging and design.

---

## **Features**

### **Core Tools**
- **Unlock Elements**: Remove `disabled` attributes and classes  
- **Remove Input Limits**: Delete `maxlength` restrictions  
- **Reveal Passwords**: Show hidden password fields  
- **Edit Mode**: Toggle `document.designMode` for content editing  
- **Change Fonts**: Apply 30+ fonts to page content  
- **Disable Loaders**: Hide loading indicators (Vanrise-specific)  
- **AI-Powered Text Improvement**: Correct spelling and grammar via Gemini API  

### **Utilities**
- **Clear Cache**: One-click cache cleanup with auto-reload  
- **Screenshot**: Capture visible page area  
- **Fullscreen**: Enter fullscreen mode  

### **Text Actions** (Right-click menu)
Context menu with text transformations for selected text:
- **Improve Text**: AI-powered grammar and spelling correction  
- **Highlight Text**: Yellow background highlighting (currently in **Beta**)  
- **Case Conversions**: Eight case styles (sentence, lower, upper, title, etc)  
- **Slugify**: URL-friendly formatting  

---

## **Preview**

Below is a preview of the CodeSavvy extension interface:

![image](https://github.com/user-attachments/assets/83c07683-213e-4646-9e9e-e9caae92e802)

---

## **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/vr-malaadin/CodeSavvy.git
```

### 2. Load the Extension
1. Open Chrome and go to `chrome://extensions/`  
2. Enable **Developer mode** in the top-right corner  
3. Click **Load unpacked** and select the project folder  

---

## **Usage**

### Popup Tools
- **Unlock Elements**: Makes disabled elements editable  
- **Unlimited MaxLength**: Removes character limits in input fields  
- **Toggle Design Mode**: Edit page content directly  
- **Take Screenshot**: Captures and saves the visible part of the active tab as an image  
- **Make Page Full Screen**: Expands the active tab's webpage to full screen mode  
- **Reveal Passwords**: Converts password fields to text for easy viewing  
- **Change Font**: 30+ font options with Google Fonts integration  
- **Clear Cache**: Instant cache cleanup and reload  
- **AI Text Correction**: Requires a valid Gemini API key  

### Context Menu Text Actions
1. Select text > Right-click > **Text Actions**  
2. Choose from:
   - Case transformations (Sentence, Lower, Upper, Title, etc)  
   - Highlight selected text  
   - AI-powered text improvement  
   - Slug generation for URLs  

---

## **Options & API Setup**

Access and configure settings on the extension’s options page:

### 1. API Key Configuration
- Navigate to the extension settings via the ⚙️ icon  
- Enter your **Gemini API Key** (used for AI-powered text correction)  
- The key is stored securely in `chrome.storage.local`  
- Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Advanced Settings
Checkbox toggles for optional features:
- **Vanrise Mode**  
  - Description: Enables features specific to Vanrise systems  
  - Effect: Shows the **Disable Loaders** button in the popup when enabled  
- **Inspirational Quote**  
  - Description: Toggles display of a motivational quote in the extension popup  
  - Default: Enabled  
  - Fallback quote (if API is unreachable):  
    _"Make it work, make it right, make it fast."_  

### 3. Save Settings
- Click the **Save Settings** button to persist your configuration  

---

### ** Keyboard Shortcuts** (Customizable)

| Shortcut          | Action                          |
|-------------------|---------------------------------|
| `Ctrl+Shift+E`    | Unlock elements                 |
| `Ctrl+Shift+Y`    | Toggle edit mode                |
| `Ctrl+Shift+L`    | Improve selected text (AI)      |
| `Ctrl+Shift+R`    | Clear cache and reload          |

### **Note**
Shortcuts may conflict with default Chrome or Edge bindings – customize if unavailable.

### **How to Customize**
1. Open `chrome://extensions/shortcuts` in your browser.  
2. Locate **CodeSavvy Pro** in the list.  
3. Click the shortcut field for the desired action and enter your preferred key combination.  
4. Changes take effect immediately—no restart required.  


---

## **File Structure**

```
CodeSavvy/
├── popup.html        # Main interface
├── popup.js          # UI functionality
├── apiService.js     # Gemini API interactions
├── background.js     # Context menu handlers
├── coreFunctions.js  # Centralized core logic
├── manifest.json     # Extension configuration
├── options.html      # Settings page
├── options.js        # API key and settings management
├── Icons/            # Visual assets
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ...other icons
└── README.md         # Documentation
```

---

## **Permissions**

Required Chrome permissions:
- `activeTab`: Modify current webpage  
- `scripting`: Inject content scripts  
- `storage`: Save API key and configurations  
- `contextMenus`: Create text action menu  
- `browsingData`: Clear cache functionality  
- `notifications`: Show status messages  

---

## **Technical Notes**
- API key stored using `chrome.storage.local`  
- Fallback quote when API is unavailable: _"Make it work, make it right, make it fast."_  
- Dark and light mode support based on system preference  
- Core functionality centralized in `coreFunctions.js` for maintainability  

---

## **Contributing**
Contributions are welcome:
1. Fork the repository  
2. Create a feature branch (`feature/your-feature`)  
3. Submit a pull request  

---

## **License**

Copyright © 2025 vr-malaadin | mahdialaaaldin (Mahdi).  
All rights reserved.  
No part of this project may be used, copied, modified, or distributed without explicit written permission from the author.

---

## **Third-Party Assets**

Some icons and visual elements are sourced from FormWeb via Flaticon. Unauthorized use or duplication may result in legal action.

---

## **Contact**

For inquiries or feedback, contact:  
**[mahdialaaaldin+codesavvy@gmail.com](mailto:mahdialaaaldin+codesavvy@gmail.com)**
