// Data structures for the punarCYCLE matching system

export interface WasteListing {
  id: string;
  wasteType: string;
  quantity: number;
  unit?: string;
  city: string;
  hazardous: boolean;
  createdBy: string; // factoryId
  factoryId?: string; // fallback for some existing code
  frequency?: string;
}

export interface Factory {
  id: string;
  factoryName: string;
  city: string;
  acceptedWasteTypes: string[];
  minQuantity: number;
  maxQuantity: number;
  role: 'consumer' | 'producer' | 'both';
  pricePerKg?: number; // Price they are willing to pay/charge per kg
}

export interface Match {
  wasteListingId: string;
  buyerFactoryId: string;
  buyerFactoryName?: string;
  compatibilityScore: number;
  reasons: string[];
  createdAt: any;
  pricePerKg?: number;
  requiredQuantity?: number;
  distanceKm?: number;
  wasteType?: string;
  co2Saved?: number;
}

/**
 * Calculates the compatibility score between a waste listing and a buyer factory
 */
export function calculateMatchScore(waste: WasteListing, buyer: Factory): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Waste type compatibility (+40 points)
  if (buyer.acceptedWasteTypes?.some(acceptedType =>
    acceptedType.toLowerCase() === waste.wasteType.toLowerCase()
  )) {
    score += 40;
    reasons.push(`Material '${waste.wasteType}' matches industrial processing capacity`);
  }

  // 2. Same city bonus (+25 points)
  if (waste.city.toLowerCase() === buyer.city.toLowerCase()) {
    score += 25;
    reasons.push(`Strategic regional proximity: ${waste.city}`);
  }

  // 3. Quantity within buyer's range (+15 points)
  if (waste.quantity >= (buyer.minQuantity || 0) && waste.quantity <= (buyer.maxQuantity || Infinity)) {
    score += 15;
    reasons.push(`Supply volume fits optimal operational threshold`);
  }

  // 4. Non-hazardous waste bonus (+10 points)
  if (!waste.hazardous) {
    score += 10;
    reasons.push('Standard material handling (Non-hazardous)');
  }

  // 5. Industry relevance or fallback compatibility (+10 points)
  score += 10;
  reasons.push('Circular integration potential');

  return { score: Math.min(score, 100), reasons: reasons.slice(0, 3) };
}

import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { analyzeMatchWithGemini } from "./gemini";

/**
 * Generates matches for a new waste listing
 */
export async function generateMatchesForWaste(wasteListingId: string): Promise<void> {
  try {
    const wasteDoc = await getDoc(doc(db, "wasteListings", wasteListingId));
    if (!wasteDoc.exists()) throw new Error(`Waste listing ${wasteListingId} not found`);

    const waste = { id: wasteDoc.id, ...wasteDoc.data() } as WasteListing;

    const factoriesQuery = query(collection(db, "factories"), where("role", "in", ["consumer", "both"]));
    const factoriesSnapshot = await getDocs(factoriesQuery);
    const buyerFactories = factoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Factory[];

    for (const buyer of buyerFactories) {
      if (buyer.id === (waste.createdBy || waste.factoryId)) continue;

      let score, reasons;
      try {
        const aiResult = await analyzeMatchWithGemini(waste, buyer);
        if (aiResult) {
          score = aiResult.score;
          reasons = aiResult.reasons;
        } else {
          const localResult = calculateMatchScore(waste, buyer);
          score = localResult.score;
          reasons = localResult.reasons;
        }
      } catch (e) {
        const localResult = calculateMatchScore(waste, buyer);
        score = localResult.score;
        reasons = localResult.reasons;
      }

      if (score >= 60) {
        await addDoc(collection(db, "matches"), {
          wasteListingId: waste.id,
          buyerFactoryId: buyer.id,
          buyerFactoryName: buyer.factoryName,
          compatibilityScore: score,
          reasons,
          pricePerKg: buyer.pricePerKg || 45,
          requiredQuantity: buyer.maxQuantity || waste.quantity,
          createdAt: serverTimestamp(),
          wasteType: waste.wasteType,
          co2Saved: Math.round(waste.quantity * 0.5)
        });
      }
    }
  } catch (error) {
    console.error("Error generating matches:", error);
  }
}

/**
 * Compatibility shim for legacy code
 */
export function calculateMatch(listing: WasteListing, otherListing: WasteListing): any {
  // Mocking a match between two listings for existing legacy pages
  if (listing.wasteType.toLowerCase() === otherListing.wasteType.toLowerCase()) {
    return {
      wasteListingId: listing.id,
      buyerFactoryId: otherListing.createdBy || otherListing.factoryId,
      buyerFactoryName: "Industrial Partner",
      compatibilityScore: 85,
      reasons: ["Material Type Match", "Regional Capacity"],
      distanceKm: 12,
      wasteType: listing.wasteType,
      co2Saved: Math.round(listing.quantity * 0.5),
      quantityMatch: 100
    };
  }
  return null;
}

export function calculateImpact(quantity: number) {
  return {
    co2Saved: Math.round(quantity * 0.5 * 10) / 10,
    wasteDiverted: quantity,
    energySaved: Math.round(quantity * 0.3 * 10) / 10,
  };
}
