async function getGeminiApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

async function getQuote() {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        console.log("No API key found");
        return "Make it work, make it right, make it fast.";
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Generate a short joke (max 10 words). Just send the joke without any additional words. " }] }],
                generationConfig: { temperature: 1.5 }
            }),
        });

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Make it work, make it right, make it fast.";  // Static fallback quote
    } catch (error) {
        console.error("Error fetching quote:", error);
        return "Make it work, make it right, make it fast.";  // Static fallback quote
    }
}

