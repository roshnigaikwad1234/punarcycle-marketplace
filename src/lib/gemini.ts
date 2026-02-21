import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Using the stable gemini-pro model as requested by the user 
 * to ensure maximum compatibility with the provided API key.
 */
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

let isApiAvailable = true;

/**
 * Bulletproof JSON extraction from Gemini response
 */
function extractJson(text: string) {
    try {
        const start = Math.min(
            text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
            text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
        );
        const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

        if (start === Infinity || end === -1) return null;

        const candidate = text.substring(start, end + 1);
        return JSON.parse(candidate);
    } catch (e) {
        return null;
    }
}

export async function analyzeMatchWithGemini(waste: any, factory: any) {
    if (!isApiAvailable) return null;

    try {
        const prompt = `Analyze compatibility for a circular economy.
        Waste: ${waste.wasteType} (${waste.quantity}kg) at ${waste.city}.
        Buyer: ${factory.factoryName} at ${factory.city}.
        Return ONLY a JSON object: {"score": number, "reasons": string[], "consultation": string}`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return extractJson(response.text());
    } catch (error: any) {
        console.warn("Gemini Pro Analysis Error. Falling back.");
        return null;
    }
}

export async function discoverBuyersWithGemini(waste: any) {
    if (!isApiAvailable) return null;

    try {
        const prompt = `Find 3 realistic industrial buyers in India for:
        Material: ${waste.wasteType}
        Quantity: ${waste.quantity} kg
        Location: ${waste.city || "Mumbai"}
        
        Return ONLY a JSON array of 3 objects: [{"factoryName": "...", "city": "...", "pricePerKg": number, "compatibilityScore": number, "reasons": ["...", "...", "..."], "requiredQuantity": number}]`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const data = extractJson(response.text());
        return (data && Array.isArray(data)) ? data : null;
    } catch (error: any) {
        if (error?.message?.includes('404')) {
            isApiAvailable = false;
        }
        return null;
    }
}
