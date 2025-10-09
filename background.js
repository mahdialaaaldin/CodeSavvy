importScripts('coreFunctions.js');
chrome.contextMenus.create({
    id: "textActions",
    title: "Text Actions",
    contexts: ["selection"],
});

// Define all menu options (AI enhancements and other text actions)
const menuOptions = [
    { id: "improveText", title: "Improve Text" },
    { id: "enhanceProfessionally", title: "Enhance Professionally" },
    { id: "addHumor", title: "Add Humor" },
    { id: "sarcasticMode", title: "Sarcastic Mode" },
    { id: "promptEngineer", title: "Prompt Engineer" },
    { id: "advancedImproveText", title: "Advanced Improve Text" },
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
    { id: "highlightText", title: "Highlight Text (Beta)" }
];

// Create all menu items under "Text Actions"
menuOptions.forEach((action) => {
    const menuItem = {
        id: action.id,
        parentId: "textActions",
        contexts: ["selection"]
    };

    if (action.type === "separator") {
        menuItem.type = "separator";
    } else {
        menuItem.title = action.title;
    }

    chrome.contextMenus.create(menuItem);
});

// Listen for clicks on the context menu items
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "highlightText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: highlightSelectedText,
        });
    } else if (["improveText", "enhanceProfessionally", "addHumor", "sarcasticMode", "advancedImproveText", "promptEngineer"].includes(info.menuItemId)) {
        const apiKey = await getGeminiApiKey();
        if (!apiKey) {
            console.error("API key is missing.");
            return;
        }
        let prompt;
        switch (info.menuItemId) {
            case "improveText":
                prompt = `Correct the spelling and grammar of the following text. Return plain text without any formatting or additional content. Text: "${info.selectionText}"`;
                break;
            case "enhanceProfessionally":
                prompt = `Rephrase the following text to sound more professional and formal. Return plain text without any formatting. Text: "${info.selectionText}"`;
                break;
            case "addHumor":
                prompt = `Rewrite the following text to be hilariously funny and witty, incorporating clever wordplay, absurd twists, and light-hearted humor while preserving the original meaning. Keep it playful and family-friendly. Return only the funny version as plain text, with no additional formatting or comments. Text: "${info.selectionText}"`;
                break;
            case "sarcasticMode":
                prompt = `Rewrite the following text to be extremely rude and offensive, incorporating profanity, bad words, and aggressive insults liberally while preserving the original meaning. Make it as insulting and crude as possible. Return only the rude version as plain text, with no additional formatting or comments. Text: "${info.selectionText}"`;
                break;
            case "advancedImproveText":
                prompt = `Act as a professional English editor. Improve the following text by correcting spelling, grammar, and punctuation, and enhancing clarity, flow, and readability. Do not add comments or explanations. Return only the edited text as plain text. Text: "${info.selectionText}"`;
                break;
            case "promptEngineer":
                prompt = `You are an expert prompt creator. Your task is to craft an optimized prompt based on the user-provided input for use with ChatGPT, GPT-3, or GPT-4. The output prompt should:
                    - Be clear, concise, and specific.
                    - Include instructions to match the user's communication style.
                    - Be written from the user's perspective, requesting assistance from an AI.
                    - Avoid ambiguity and ensure actionable instructions.
                    Input text: "${info.selectionText}"
                    Return only the optimized prompt as plain text.`;
                break;
        }
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: enhanceTextWithAI,
            args: [apiKey, prompt],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertCase,
            args: [info.menuItemId],
        });
    }
});

// Fetch API key from storage
async function getGeminiApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

// AI text enhancement function
async function enhanceTextWithAI(apiKey, prompt) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    async function getEnhancedText(textPrompt) {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: textPrompt }] }],
                generationConfig: { temperature: 0.7 }
            }),
        });

        const data = await response.json();
        const enhanced = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!enhanced) throw new Error("No enhanced text received");
        return enhanced;
    }

    const activeEl = document.activeElement;

    if ((activeEl.tagName === "TEXTAREA" ||
        (activeEl.tagName === "INPUT" && activeEl.type === "text")) &&
        typeof activeEl.selectionStart === "number") {

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const originalText = activeEl.value.substring(start, end);

        if (!originalText.trim()) return;

        const enhancedText = await getEnhancedText(prompt);

        console.log(enhancedText);
        console.log(originalText);

        activeEl.setRangeText(enhancedText, start, end, "end");
        return;
    }

    // Selection in regular DOM content
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    let fullText = '', node;
    while (node = walker.nextNode()) {
        fullText += node.textContent;
    }

    if (!fullText.trim()) return;

    const enhancedText = await getEnhancedText(prompt);

    const enhancedNode = document.createTextNode(enhancedText);
    range.deleteContents();
    range.insertNode(enhancedNode);
    selection.removeAllRanges();
}

// Highlight selected text function
function highlightSelectedText() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.style.color = 'black';

    try {
        range.surroundContents(span);
    } catch (e) {
        console.error('Could not highlight text:', e);
    }
}

// Case conversion function
function convertCase(caseType) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    // Process all text nodes within the selection
    const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        let text = node.textContent;
        let convertedText = '';

        switch (caseType) {
            case 'sentenceCase':
                convertedText = text.toLowerCase();
                convertedText = convertedText.charAt(0).toUpperCase() + convertedText.slice(1);
                break;

            case 'lowerCase':
                convertedText = text.toLowerCase();
                break;

            case 'upperCase':
                convertedText = text.toUpperCase();
                break;

            case 'capitalizedCase':
                convertedText = text.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                break;

            case 'alternatingCase':
                convertedText = text.split('')
                    .map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
                    .join('');
                break;

            case 'inverseCase':
                convertedText = text.split('')
                    .map(char => {
                        if (char === char.toUpperCase()) return char.toLowerCase();
                        return char.toUpperCase();
                    })
                    .join('');
                break;

            case 'titleCase':
                convertedText = text.toLowerCase().split(' ')
                    .map((word, index) => {
                        // Don't capitalize certain small words unless they're the first word
                        const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
                        if (index > 0 && smallWords.includes(word)) return word;
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    })
                    .join(' ');
                break;

            case 'slugify':
                convertedText = text.toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-')     // Replace spaces with hyphens
                    .replace(/-+/g, '-');     // Remove consecutive hyphens
                break;
        }

        node.textContent = convertedText;
    }

    // Replace the selected content with the modified content
    range.deleteContents();
    range.insertNode(tempDiv);

    // Remove the temporary div but keep its contents
    const parent = tempDiv.parentNode;
    while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, tempDiv);
    }
    parent.removeChild(tempDiv);
}

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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
            const apiKey = await getGeminiApiKey();
            if (!apiKey) {
                console.error("API key missing");
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;
                    const text = selection.toString();
                    if (!text.trim()) return;
                    return text;
                }
            }).then(async (results) => {
                const selectedText = results[0].result;
                if (selectedText) {
                    const prompt = `Correct the spelling and grammar of the following text. Return plain text without any formatting or additional content. Text: "${selectedText}"`;
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: enhanceTextWithAI,
                        args: [apiKey, prompt]
                    });
                }
            }).catch((error) => {
                console.error("Error getting selected text:", error);
            });
            break;

        case 'clear-cache':
            await chrome.browsingData.remove({ since: 0 }, { cache: true });
            chrome.tabs.reload(tab.id);
            break;
    }
});