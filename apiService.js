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
        return getRandomFallback();
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
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

        const data = await response.json();
        return cleanResponse(data) || getRandomFallback();
    } catch (error) {
        console.error("Error fetching quote:", error);
        return getRandomFallback();
    }
}

function cleanResponse(data) {
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    // Remove quotation marks and author mentions if present
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

