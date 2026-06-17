importScripts('../shared/utils/coreFunctions.js');
// Define all menu options (AI enhancements and other text actions)
const menuOptions = [
    { id: "improveText", title: "Improve Text" },
    { id: "advancedImproveText", title: "Advanced Improve Text" },
    { id: "enhanceProfessionally", title: "Enhance Professionally" },
    { id: "promptEngineer", title: "Prompt Engineer" },
    { id: "addHumor", title: "Add Humor" },
    { id: "brutalMode", title: "Roasted Mode" },
    { id: "separator_ai_tools", type: "separator" },
    { id: "sentenceCase", title: "Sentence case" },
    { id: "lowerCase", title: "lower case" },
    { id: "upperCase", title: "UPPER CASE" },
    { id: "capitalizedCase", title: "Capitalized Case" },
    { id: "alternatingCase", title: "altErNaTiNg CASE" },
    { id: "inverseCase", title: "InVeRsE CaSe" },
    { id: "titleCase", title: "Title Case" },
    { id: "slugify", title: "Slugify" },
    { id: "separator_text_transform", type: "separator" },
    { id: "convertArabicToEnglish", title: "Convert Arabic to English (Beta)" },
    { id: "convertEnglishToArabic", title: "Convert English to Arabic (Beta)" },
    { id: "highlightText", title: "Highlight Text" }
];

// Register context menus on installation or update to avoid duplicate ID errors
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "textActions",
        title: "Text Actions",
        contexts: [ "selection" ],
    });

    menuOptions.forEach((action) => {
        const menuItem = {
            id: action.id,
            parentId: "textActions",
            contexts: [ "selection" ]
        };

        if (action.type === "separator") {
            menuItem.type = "separator";
        } else {
            menuItem.title = action.title;
        }

        chrome.contextMenus.create(menuItem);
    });
});

// Helper function to get selected API provider
async function getSelectedApiProvider () {
    return new Promise((resolve) => {
        chrome.storage.local.get([ 'apiProvider' ], (result) => {
            resolve(result.apiProvider || 'gemini');
        });
    });
}

// Fetch API key from storage
async function getGeminiApiKey () {
    return new Promise((resolve) => {
        chrome.storage.local.get([ 'geminiApiKey' ], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

// AI text enhancement function with dual API support and automatic fallback
async function getEnhancedTextFromGemini (apiKey, prompt) {
    const models = [
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-3-flash-preview",
        "gemini-2.5-pro",
        "gemini-3.1-pro-preview"
    ];

    const payload = {
        contents: [ { parts: [ { text: prompt } ] } ],
        generationConfig: { temperature: 0.7 }
    };

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    async function tryModel (model) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log(`Calling Gemini model: ${model}`);
        for (let attempt = 1; attempt <= 2; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const status = response.status;
                    const msg = errData.error?.message || `HTTP ${status}`;

                    // Only retry on rate limits (429) or transient server issues (5xx)
                    const retryable = status === 429 || status >= 500;

                    if (attempt === 1 && retryable) {
                        await sleep(1000 * attempt);
                        continue;
                    }

                    // Throw immediately on non-retryable errors (e.g. 400, 403)
                    throw new Error(`${model} failed (${status}): ${msg}`);
                }

                const data = await response.json();
                const resultText = data?.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text?.trim();

                if (!resultText) throw new Error(`Empty response from ${model}`);

                return resultText;

            } catch (err) {
                clearTimeout(timeoutId);

                // Do not retry locally if it's our explicit non-retryable error
                if (err.message.includes("failed (")) {
                    throw err;
                }

                const isLastAttempt = attempt === 2;

                if (err.name === 'AbortError') {
                    console.warn(`${model} timed out on attempt ${attempt}`);
                }

                if (!isLastAttempt) {
                    await sleep(1000 * attempt);
                    continue;
                }
                throw err;
            }
        }
    }

    let lastError;
    for (const model of models) {
        try {
            return await tryModel(model);
        } catch (err) {
            console.warn(`Fallback - ${err.message}`);
            lastError = err;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

function getCleanText (str) {
    if (!str) return "";

    // Unescape JSON symbols
    let clean = str.replace(/\\([nrtbf"'\\])/g, (match, character) => {
        switch (character) {
            case 'n': return "\n"; // New Line
            case 'r': return "\r"; // Carriage Return
            case 't': return "\t"; // Tab
            case 'b': return "\b"; // Backspace
            case 'f': return "\f"; // Form Feed
            case '"': return "\""; // Double Quote
            case "'": return "'";  // Single Quote
            case '\\': return "\\"; // Backslash
            default: return match;
        }
    });

    // CRITICAL: Standardize newlines. 
    // Windows uses \r\n, Mac uses \n. 
    // We convert EVERYTHING to simple \n to avoid "double space" issues.
    return clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function getSelectedTextFromPage() {
    const activeEl = document.activeElement;
    const selection = window.getSelection();

    // Get the text to enhance
    let textToEnhance = '';

    if ((activeEl.tagName === "TEXTAREA" ||
        (activeEl.tagName === "INPUT" && activeEl.type === "text")) &&
        typeof activeEl.selectionStart === "number") {

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        textToEnhance = activeEl.value.substring(start, end);
    } else if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);

        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            textToEnhance += node.textContent;
        }
    }
    return textToEnhance;
}

function insertTextInPage (cleanText) {
    const activeEl = document.activeElement;
    const selection = window.getSelection();

    if (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT") {
        // CASE 1: Standard Inputs
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        activeEl.setRangeText(cleanText, start, end, "end");
        // Notify frameworks (React, Angular, etc.) that input changed
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));

    } else if (activeEl.isContentEditable) {
        // CASE 2: Rich Text Editors (The tricky part)
        activeEl.focus();

        // Check if this is the "Quill" editor (the one that broke with <br>)
        const isQuill = activeEl.classList.contains('ql-editor');

        if (isQuill) {
            // STRATEGY A: For Quill (and most modern editors)
            // Quill listens for "text" events and handles the \n conversion internally.
            // It strictly forbids <br> tags, so we MUST use insertText.
            document.execCommand('insertText', false, cleanText);
        } else {
            // STRATEGY B: For ChatGPT / Others
            // We try insertText first (it's the standard). 
            document.execCommand('insertText', false, cleanText);
        }

    } else if (selection.rangeCount) {
        // CASE 3: Static HTML (Divs/Spans)
        // Here we manually split lines to ensure they appear visually
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const fragment = document.createDocumentFragment();
        const lines = cleanText.split('\n');

        lines.forEach((line, index) => {
            fragment.appendChild(document.createTextNode(line));
            if (index < lines.length - 1) {
                fragment.appendChild(document.createElement('br'));
            }
        });

        range.insertNode(fragment);
        selection.removeAllRanges();
    }
}

async function handleTextEnhancement(tab, promptId, infoSelectionText) {
    const apiProvider = await getSelectedApiProvider();
    const geminiApiKey = await getGeminiApiKey();

    if (apiProvider === 'gemini' && !geminiApiKey) {
        console.error("Gemini API key is missing.");
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/src/assets/icons/Icons/icon48.png',
            title: 'CodeSavvy - API Key Required',
            message: 'Please set your Gemini API key in the extension settings to use Gemini AI features.'
        });
        return;
    }

    let selectedText = infoSelectionText;
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getSelectedTextFromPage
        });
        if (results?.[0]?.result) {
            selectedText = results[0].result;
        }
    } catch (err) {
        console.warn("Failed to get text selection via scripting, using info selection text:", err);
    }

    if (!selectedText || !selectedText.trim()) {
        console.log("No text selected.");
        return;
    }

    let prompt = "";
    switch (promptId) {
        case "improveText":
            prompt = `Correct the spelling and grammar of the following text. Return plain text without any formatting or additional content. Text: "${selectedText}"`;
            break;
        case "advancedImproveText":
            prompt = `Act as a professional English editor. Improve the following text by correcting spelling, grammar, and punctuation, and enhancing clarity, flow, and readability. Do not add comments or explanations. Return only the edited text as plain text. Text: "${selectedText}"`;
            break;
        case "enhanceProfessionally":
            prompt = `Rephrase the following text to sound more professional and formal. Return plain text without any formatting. Text: "${selectedText}"`;
            break;
        case "promptEngineer":
            prompt = `You are an expert prompt creator. Your task is to craft an optimized prompt based on the user-provided input for use with ChatGPT, GPT-3, or GPT-4. The output prompt should:
                - Be clear, concise, and specific.
                - Include instructions to match the user's communication style.
                - Be written from the user's perspective, requesting assistance from an AI.
                - Avoid ambiguity and ensure actionable instructions.
                Input text: "${selectedText}"
                Return only the optimized prompt as plain text.`;
            break;
        case "addHumor":
            prompt = `Rewrite the following text to be hilariously funny and witty, incorporating clever wordplay, absurd twists, and light-hearted humor while preserving the original meaning. Keep it playful and family-friendly. Return only the funny version as plain text, with no additional formatting or comments. Text: "${selectedText}"`;
            break;
        case "brutalMode":
            prompt = `Rewrite the following text to be a brutally honest, highly sarcastic, and witty roast, incorporating extreme sarcasm and playful mockery while preserving the original meaning. Keep it family-friendly and free of actual profanity, slurs, or hate speech. Return only the roasted version as plain text, with no additional formatting or comments. Text: "${selectedText}"`;
            break;
    }

    try {
        const enhancedText = await getEnhancedTextFromGemini(geminiApiKey, prompt);
        if (!enhancedText) {
            console.log("Empty or failed response from Gemini.");
            return;
        }

        const cleanText = getCleanText(enhancedText);

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: insertTextInPage,
            args: [ cleanText ]
        });

    } catch (error) {
        console.error("AI text enhancement failed:", error);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/src/assets/icons/Icons/icon48.png',
            title: 'CodeSavvy - Error',
            message: `AI enhancement failed: ${error.message}`
        });
    }
}


// Highlight selected text function
function highlightSelectedText () {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    function getTextNodesInRange(range) {
        const textNodes = [];
        const root = range.commonAncestorContainer;
        if (root.nodeType === 3) { // Node.TEXT_NODE === 3
            textNodes.push(root);
            return textNodes;
        }
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (range.intersectsNode(node)) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    const textNodes = getTextNodesInRange(range);

    textNodes.forEach(node => {
        const start = (node === range.startContainer) ? range.startOffset : 0;
        const end = (node === range.endContainer) ? range.endOffset : node.nodeValue.length;
        
        if (start === end) return; // Empty selection in this node
        
        let highlightNode;
        if (start > 0 && end < node.nodeValue.length) {
            const part2 = node.splitText(start);
            part2.splitText(end - start);
            highlightNode = part2;
        } else if (start > 0) {
            highlightNode = node.splitText(start);
        } else if (end < node.nodeValue.length) {
            node.splitText(end);
            highlightNode = node;
        } else {
            highlightNode = node;
        }

        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.style.color = 'black';
        span.className = 'codesavvy-highlight';
        
        highlightNode.parentNode.insertBefore(span, highlightNode);
        span.appendChild(highlightNode);
    });

    selection.removeAllRanges();
}

// Case conversion function
function convertCase (caseType) {
    const activeEl = document.activeElement;
    
    // 1. Handle selection inside inputs/textareas
    if (
        activeEl &&
        (activeEl.tagName === "TEXTAREA" ||
            (activeEl.tagName === "INPUT" && ["text", "search", "url", "tel", "email"].includes(activeEl.type))) &&
        typeof activeEl.selectionStart === "number"
    ) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        if (start !== end) {
            const selectedText = activeEl.value.substring(start, end);
            const convertedText = convertTextString(selectedText, caseType);
            activeEl.setRangeText(convertedText, start, end, "end");
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
    }

    // 2. Handle selection in static HTML / contenteditable
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    function getTextNodesInRange(range) {
        const textNodes = [];
        const root = range.commonAncestorContainer;
        if (root.nodeType === 3) { // Node.TEXT_NODE === 3
            textNodes.push(root);
            return textNodes;
        }
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (range.intersectsNode(node)) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    function convertTextString(text, type) {
        switch (type) {
            case 'sentenceCase': {
                const lower = text.toLowerCase();
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            }
            case 'lowerCase':
                return text.toLowerCase();

            case 'upperCase':
                return text.toUpperCase();

            case 'capitalizedCase':
                return text.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

            case 'alternatingCase':
                return text.split('')
                    .map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
                    .join('');

            case 'inverseCase':
                return text.split('')
                    .map(char => {
                        if (char === char.toUpperCase()) return char.toLowerCase();
                        return char.toUpperCase();
                    })
                    .join('');

            case 'titleCase':
                return text.toLowerCase().split(' ')
                    .map((word, index) => {
                        const smallWords = [ 'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet' ];
                        if (index > 0 && smallWords.includes(word)) return word;
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    })
                    .join(' ');

            case 'slugify':
                return text.toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-')     // Replace spaces with hyphens
                    .replace(/-+/g, '-');     // Remove consecutive hyphens
            
            default:
                return text;
        }
    }

    const textNodes = getTextNodesInRange(range);

    textNodes.forEach(node => {
        const start = (node === range.startContainer) ? range.startOffset : 0;
        const end = (node === range.endContainer) ? range.endOffset : node.nodeValue.length;
        
        if (start === end) return; // Empty selection in this node
        
        let targetNode;
        if (start > 0 && end < node.nodeValue.length) {
            const part2 = node.splitText(start);
            part2.splitText(end - start);
            targetNode = part2;
        } else if (start > 0) {
            targetNode = node.splitText(start);
        } else if (end < node.nodeValue.length) {
            node.splitText(end);
            targetNode = node;
        } else {
            targetNode = node;
        }

        const originalText = targetNode.nodeValue;
        const convertedText = convertTextString(originalText, caseType);
        targetNode.nodeValue = convertedText;
    });

    selection.removeAllRanges();
}

function convertKeyboardLayoutInSelection (direction, selectedText) {
    // Define keyboard layout conversion maps
    const englishToArabicMap = { '`': 'ذ', 'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج', ']': 'د', 'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط', 'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ' };
    const arabicToEnglishMap = { 'ذ': '`', 'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p', 'ج': '[', 'د': ']', 'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'm': 'l', 'ك': ';', 'ط': "'", 'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'لا': 'b', 'ى': 'n', 'ة': 'm', 'و': ',', 'ز': '.', 'ظ': '/' };

    const activeEl = document.activeElement;
    
    function convertKeyboardLayout (text, direction) {
        const map = direction === 'arabic-to-english' ? arabicToEnglishMap : englishToArabicMap;
        let output = '';
        for (let char of text) {
            output += map[ char ] || char;
        }
        return output;
    }

    // 1. Handle selection inside inputs/textareas
    if (
        activeEl &&
        (activeEl.tagName === "TEXTAREA" ||
            (activeEl.tagName === "INPUT" && ["text", "search", "url", "tel", "email"].includes(activeEl.type))) &&
        typeof activeEl.selectionStart === "number"
    ) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        if (start !== end) {
            const selectedText = activeEl.value.substring(start, end);
            const convertedText = convertKeyboardLayout(selectedText, direction);
            activeEl.setRangeText(convertedText, start, end, "end");
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
    }

    // 2. Handle static HTML / contenteditable
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    function getTextNodesInRange(range) {
        const textNodes = [];
        const root = range.commonAncestorContainer;
        if (root.nodeType === 3) { // Node.TEXT_NODE === 3
            textNodes.push(root);
            return textNodes;
        }
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (range.intersectsNode(node)) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    const textNodes = getTextNodesInRange(range);

    textNodes.forEach(node => {
        const start = (node === range.startContainer) ? range.startOffset : 0;
        const end = (node === range.endContainer) ? range.endOffset : node.nodeValue.length;
        
        if (start === end) return; // Empty selection in this node
        
        let targetNode;
        if (start > 0 && end < node.nodeValue.length) {
            const part2 = node.splitText(start);
            part2.splitText(end - start);
            targetNode = part2;
        } else if (start > 0) {
            targetNode = node.splitText(start);
        } else if (end < node.nodeValue.length) {
            node.splitText(end);
            targetNode = node;
        } else {
            targetNode = node;
        }

        const originalText = targetNode.nodeValue;
        const convertedText = convertKeyboardLayout(originalText, direction);
        targetNode.nodeValue = convertedText;
    });

    selection.removeAllRanges();

    // Send notification
    chrome.runtime.sendMessage({
        action: 'showNotification',
        message: `Text converted to ${direction === 'arabic-to-english' ? 'English' : 'Arabic'} layout`
    });
}

// Listen for clicks on the context menu items
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "highlightText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: highlightSelectedText,
        });
    } else if ([ "improveText", "enhanceProfessionally", "addHumor", "brutalMode", "advancedImproveText", "promptEngineer" ].includes(info.menuItemId)) {
        await handleTextEnhancement(tab, info.menuItemId, info.selectionText);
    } else if ([ "convertArabicToEnglish", "convertEnglishToArabic" ].includes(info.menuItemId)) {
        const direction = info.menuItemId === "convertArabicToEnglish" ? "arabic-to-english" : "english-to-arabic";
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertKeyboardLayoutInSelection,
            args: [ direction, info.selectionText ],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertCase,
            args: [ info.menuItemId ],
        });
    }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    const [ tab ] = await chrome.tabs.query({ active: true, currentWindow: true });

    switch (command) {
        case 'unlock-elements':
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: CoreTools.unlockElements
            });
            break;

        case 'toggle-design-mode':
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: CoreTools.toggleDesignMode
            });
            break;

        case 'improve-text':
            await handleTextEnhancement(tab, 'improveText', '');
            break;

        case 'clear-cache':
            await chrome.browsingData.remove({ since: 0 }, { cache: true });
            chrome.tabs.reload(tab.id);
            break;
    }
});

// Handle notification messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/src/assets/icons/Icons/icon48.png',
            title: 'CodeSavvy',
            message: request.message
        });
    } else if (request.action === 'showFallbackNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/src/assets/icons/Icons/icon48.png',
            title: 'CodeSavvy - API Fallback',
            message: request.message
        });
    }
});