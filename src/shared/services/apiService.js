async function getGeminiApiKey () {
    return new Promise((resolve) => {
        chrome.storage.local.get([ 'geminiApiKey' ], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

async function getSelectedApiProvider () {
    return new Promise((resolve) => {
        chrome.storage.local.get([ 'apiProvider' ], (result) => {
            resolve(result.apiProvider || 'gemini');
        });
    });
}

async function getQuote () {
    const apiProvider = await getSelectedApiProvider();

    if (apiProvider === 'gemini') {
        try {
            return await getQuoteFromGemini();
        } catch (geminiError) {
            console.warn(`Gemini quote failed: ${geminiError.message}`);
            return getRandomFallback();
        }
    }
}

async function getQuoteFromGemini () {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No Gemini API key found");
    }

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

        const randomTopic = topics[ Math.floor(Math.random() * topics.length) ];
        const randomAngle = angles[ Math.floor(Math.random() * angles.length) ];
        const randomStyle = styles[ Math.floor(Math.random() * styles.length) ];

        const prompt = `Generate a unique ${randomAngle} quote about ${randomTopic} for developers. 
            Requirements: 
            - Maximum 15 words
            - ${randomStyle}
            - No clichés
            - Mix technical and life advice
            - Surprising combination
            - Add emoji at end if appropriate`;

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
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 100
            }
        };

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        async function tryModel (model) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

                        const retryable = status === 429 || status >= 500;

                        if (attempt === 1 && retryable) {
                            await sleep(1000 * attempt);
                            continue;
                        }

                        throw new Error(`${model} failed (${status}): ${msg}`);
                    }

                    const data = await response.json();
                    const cleanedText = cleanResponse(data);

                    if (!cleanedText) {
                        throw new Error(`Empty response from ${model}`);
                    }

                    return cleanedText;

                } catch (err) {
                    clearTimeout(timeoutId);

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
                console.warn(`Quote Fallback - ${err.message}`);
                lastError = err;
            }
        }

        throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    } catch (error) {
        console.error("Error fetching quote from Gemini:", error);
        throw error; // Re-throw so caller can handle fallback
    }
}

function cleanResponse (data) {
    const rawText = data?.candidates?.[ 0 ]?.content?.parts?.[ 0 ]?.text?.trim();
    return rawText?.replace(/["']/g, '').replace(/-.*$/, '').trim();
}

function getRandomFallback () {
    const fallbacks = [
        "Refactor ruthlessly, but leave the campfire better than you found it. 🔥",
        "Code is poetry... until the compiler starts yelling haiku errors. 🐞",
        "Your best architecture emerges from deleted code. 💾",
        "Debugging: The art of being both detective and culprit simultaneously. 🕵️💻",
        "Technical debt compounds interest faster than crypto. Pay your dues daily. 💸"
    ];
    return fallbacks[ Math.floor(Math.random() * fallbacks.length) ];
}

// Optional: Add a function to log when fallback is used (for debugging)
function logFallbackUsage (primaryProvider, secondaryProvider, error) {
    console.log(`Quote fallback used: ${primaryProvider} failed, tried ${secondaryProvider}, error: ${error.message}`);
}