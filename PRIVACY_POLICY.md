# Privacy Policy for CodeSavvy

**Last Updated: June 13, 2026**

Your privacy is extremely important to us. This Privacy Policy describes how the **CodeSavvy** Chrome Extension (the "Extension") handles your data.

---

## 1. Overview
CodeSavvy is a developer toolbox designed to assist with web page manipulation, debugging, and text enhancements. The Extension is designed with a **privacy-first architecture**:
* It operates directly within your browser.
* It does **not** collect, store, or transmit your personal or sensitive user data to any external servers owned by the developer.

---

## 2. Information We Access and How It Is Used
The Extension accesses only the data necessary to perform its core functions:

### A. Local Storage (`chrome.storage.local`)
* **What we store**: Your settings, preferences, and your Google Gemini API Key.
* **How it is used**: To persist your preferences and allow the Extension to authenticate with Google's Gemini API.
* **Security**: This data is stored strictly on your local device within the browser's sandbox. It is never transmitted to the developer or any unauthorized third parties.

### B. Selected Text (via Context Menu)
* **What we access**: If you select text on a webpage, right-click, and choose an AI-powered text enhancement option (e.g., "Improve Text", "Roasted Mode"), the Extension reads the selected text.
* **How it is used**: The selected text is sent directly to Google's Gemini API along with your API key to perform the requested text transformation.
* **Destinations**: The text goes directly to Google's API endpoints. It is never routed through any intermediary servers. Please refer to [Google's Privacy Policy](https://policies.google.com/privacy) for details on how Google handles API requests.

---

## 3. Extension Permissions and Justification
In compliance with Chrome Web Store policies, we practice data minimization. We only request permissions necessary to provide the features:

* **`activeTab`**: Allows the Extension to temporarily access the webpage you are viewing so you can use features like "Unlock Elements", "Change Font", and "Toggle Edit Mode".
* **`scripting`**: Required to inject content scripts that modify fonts, unlock disabled buttons, and alter styles on the active webpage.
* **`storage`**: Needed to save your local settings, preferences, and Gemini API Key.
* **`tabs`**: Used to identify the active tab to execute screenshots and page reloads safely.
* **`browsingData`**: Necessary to clear the browser cache when you click the "Clear Cache" button.
* **`contextMenus`**: Allows CodeSavvy to register context menu items so you can perform AI text enhancements and case transformations by right-clicking selected text.
* **`notifications`**: Displays brief desktop alerts for status changes (e.g., when the cache is successfully cleared).
* **`downloads`**: Used to download and save screenshot files to your local system when using the "Take Screenshot" tool.

---

## 4. Third-Party Services
If you use the AI features of the Extension, you must provide your own **Google Gemini API Key**. 
* The Extension connects directly to Google's API servers.
* We do not control Google's data processing. You can learn more about how Google handles developer/user data in the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).

---

## 5. Security of Your Data
We employ industry-standard local sandboxing:
* Your API Key is kept in your private extension storage.
* Network requests are executed inside the Extension's background service worker, ensuring host pages cannot intercept your API Key.

---

## 6. Changes to This Policy
We may update this Privacy Policy from time to time to reflect changes in our Extension or legal requirements. When we do, we will update the "Last Updated" date at the top of this page.

---

## 7. Contact Us
If you have any questions or suggestions about this Privacy Policy, please contact us at:
* **Email**: [mahdialaaaldin+codesavvy@gmail.com](mailto:mahdialaaaldin+codesavvy@gmail.com)
