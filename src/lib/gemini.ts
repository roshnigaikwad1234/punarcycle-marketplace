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

/** Consumer requirement: material type, quantity, location. Returns companies that supply/offer this. */
export async function discoverConsumersWithGemini(requirement: { materialType: string; quantity: number; location: string }) {
    if (!isApiAvailable) return null;
    try {
        const prompt = `Find 4 realistic industrial companies in India that CONSUME or need this raw material (buyers):
        Material type: ${requirement.materialType}
        Quantity needed: ${requirement.quantity} kg
        Preferred location: ${requirement.location}
        Return ONLY a JSON array of 4 objects, each: {"factoryName": "...", "city": "...", "pricePerKg": number, "compatibilityScore": number, "reasons": ["...", "..."], "requiredQuantity": number, "role": "consumer"}`;
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const data = extractJson(response.text());
        return (data && Array.isArray(data)) ? data : null;
    } catch (e: any) {
        if (e?.message?.includes('404')) isApiAvailable = false;
        return null;
    }
}

/** Marketplace: generate diverse companies (producers and consumers) with realistic data. */
export async function getMarketplaceCompaniesWithGemini() {
    if (!isApiAvailable) return null;
    try {
        const prompt = `Generate 8 realistic Indian industrial companies for a circular economy marketplace. Mix of producers (selling waste/surplus) and consumers (buying raw material). Return ONLY a JSON array of 8 objects, each: {"companyName": "...", "city": "...", "role": "producer" or "consumer", "materialType": "...", "quantity": number, "pricePerKg": number, "industryType": "Steel"|"Textile"|"Pharma"|"Electronics"}`;
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const data = extractJson(response.text());
        return (data && Array.isArray(data)) ? data : null;
    } catch (e: any) {
        if (e?.message?.includes('404')) isApiAvailable = false;
        return null;
    }
}

/** AI Matches: generate 3 sample match cards when user has no listings/requirements. */
export async function getSampleAiMatches(type: "producer" | "consumer") {
    if (!isApiAvailable) return null;
    try {
        const role = type === "producer" ? "buyers (companies that want to buy waste/surplus)" : "suppliers (companies that sell raw material)";
        const prompt = `Generate 3 realistic Indian industrial match cards for a circular economy platform. These are ${role}. Return ONLY a JSON array of exactly 3 objects. Each object must have: "companyName" (string, e.g. "Reliance Eco-Industrial"), "city" (string, uppercase e.g. "PUNE"), "materialType" (string, e.g. "Textile Waste" or "Plastic scrap"), "quantity" (number, e.g. 1000), "pricePerKg" (number, 30-80), "compatibilityScore" (number 85-99), "reasons" (array of exactly 3 short strings, e.g. "Strategic location match", "High material recovery efficiency", "Verified scale operations"). Use varied materials and cities.`;
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const data = extractJson(response.text());
        return (data && Array.isArray(data)) ? data : null;
    } catch (e: any) {
        if (e?.message?.includes('404')) isApiAvailable = false;
        return null;
    }
}
