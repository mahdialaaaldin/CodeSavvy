async function getGeminiApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

async function getSelectedApiProvider() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiProvider'], (result) => {
            resolve(result.apiProvider || 'gemini');
        });
    });
}

async function getQuote() {
    const apiProvider = await getSelectedApiProvider();

    if (apiProvider === 'pollinations') {
        try {
            return await getQuoteFromPollinations();
        } catch (pollinationsError) {
            console.warn(`Pollinations quote failed: ${pollinationsError.message}, trying Gemini...`);
            try {
                return await getQuoteFromGemini();
            } catch (geminiError) {
                console.warn(`Gemini quote also failed: ${geminiError.message}, using fallback`);
                return getRandomFallback();
            }
        }
    } else {
        try {
            return await getQuoteFromGemini();
        } catch (geminiError) {
            console.warn(`Gemini quote failed: ${geminiError.message}, trying Pollinations...`);
            try {
                return await getQuoteFromPollinations();
            } catch (pollinationsError) {
                console.warn(`Pollinations quote also failed: ${pollinationsError.message}, using fallback`);
                return getRandomFallback();
            }
        }
    }
}

async function getQuoteFromGemini() {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No Gemini API key found");
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const topics = [
            'programming', 'debugging', 'software architecture', 'code maintenance',
            'teamwork in tech', 'algorithms', 'clean code', 'technical debt',
            'innovation', 'AI development', 'open source', 'testing',
            'career growth', 'legacy systems', 'documentation'
        ];

        const angles = [
            'motivational', 'humorous', 'philosophical', 'practical',
            'controversial', 'historical', 'futuristic', 'minimalist'
        ];

        const styles = [
            'Add a programming metaphor',
            'Include a famous programmer name',
            'Use tech jargon creatively',
            'Reference a programming language',
            'Mention a computer science concept',
            'Compare to hardware components'
        ];

        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];

        const prompt = `Generate a unique ${randomAngle} quote about ${randomTopic} for developers. 
            Requirements: 
            - Maximum 15 words
            - ${randomStyle}
            - No clichés
            - Mix technical and life advice
            - Surprising combination
            - Add emoji at end if appropriate`;

        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 100
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const cleanedText = cleanResponse(data);

        if (!cleanedText) {
            throw new Error("Empty response from Gemini");
        }

        return cleanedText;
    } catch (error) {
        console.error("Error fetching quote from Gemini:", error);
        throw error; // Re-throw so caller can handle fallback
    }
}

async function getQuoteFromPollinations() {
    try {
        const topics = [
            'programming', 'debugging', 'software architecture', 'code maintenance',
            'teamwork in tech', 'algorithms', 'clean code', 'technical debt',
            'innovation', 'AI development', 'open source', 'testing',
            'career growth', 'legacy systems', 'documentation'
        ];

        const angles = [
            'motivational', 'humorous', 'philosophical', 'practical',
            'controversial', 'historical', 'futuristic', 'minimalist'
        ];

        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];

        const prompt = `Generate a short, inspiring quote (max 15 words) for developers about ${randomTopic} in a ${randomAngle} tone. Include a programming metaphor or tech reference. Note that this prompt is sent to you at ${new Date().toLocaleString()}`;

        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);

        if (!response.ok) {
            throw new Error(`Pollinations API Error: ${response.status}`);
        }

        const text = await response.text();
        const cleanedText = text.trim().replace(/["']/g, '').replace(/-.*$/, '').trim();

        if (!cleanedText || cleanedText === '') {
            throw new Error("Empty response from Pollinations");
        }

        return cleanedText;
    } catch (error) {
        console.error("Error fetching quote from Pollinations:", error);
        throw error; // Re-throw so caller can handle fallback
    }
}

function cleanResponse(data) {
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return rawText?.replace(/["']/g, '').replace(/-.*$/, '').trim();
}

function getRandomFallback() {
    const fallbacks = [
        "Refactor ruthlessly, but leave the campfire better than you found it. 🔥",
        "Code is poetry... until the compiler starts yelling haiku errors. 🐞",
        "Your best architecture emerges from deleted code. 💾",
        "Debugging: The art of being both detective and culprit simultaneously. 🕵️💻",
        "Technical debt compounds interest faster than crypto. Pay your dues daily. 💸"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Optional: Add a function to log when fallback is used (for debugging)
function logFallbackUsage(primaryProvider, secondaryProvider, error) {
    console.log(`Quote fallback used: ${primaryProvider} failed, tried ${secondaryProvider}, error: ${error.message}`);
}