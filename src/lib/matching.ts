export interface WasteListing {
  id: string;
  factoryId: string;
  factoryName?: string;
  wasteType: string;
  quantity: number;
  unit: string;
  frequency: string;
  location: string;
  latitude: number;
  longitude: number;
  hazardous: boolean;
  availabilityStart: string;
  availabilityEnd: string;
  createdAt?: any;
}

export interface MatchResult {
  wasteListingId: string;
  buyerFactoryId: string;
  buyerFactoryName: string;
  wasteType: string;
  compatibilityScore: number;
  distanceKm: number;
  co2Saved: number;
  quantityMatch: number;
}

const WASTE_COMPATIBILITY: Record<string, string[]> = {
  "plastic scrap": ["plastic scrap", "recycled plastic", "plastic pellets"],
  "fly ash": ["fly ash", "cement aggregate", "construction fill"],
  "metal scrap": ["metal scrap", "recycled metal", "steel scrap"],
  "chemical waste": ["chemical waste", "chemical byproduct"],
  "textile waste": ["textile waste", "recycled fiber", "cotton waste"],
  "organic waste": ["organic waste", "biomass", "compost material"],
  "glass waste": ["glass waste", "recycled glass", "glass cullet"],
  "rubber waste": ["rubber waste", "recycled rubber"],
  "wood waste": ["wood waste", "biomass", "wood chips"],
  "e-waste": ["e-waste", "electronic scrap"],
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function materialScore(wasteType: string, buyerNeeds: string): number {
  const wt = wasteType.toLowerCase();
  const bn = buyerNeeds.toLowerCase();
  if (wt === bn) return 100;
  const compatible = WASTE_COMPATIBILITY[wt] || [];
  if (compatible.some((c) => bn.includes(c) || c.includes(bn))) return 75;
  return 0;
}

function proximityScore(distKm: number): number {
  if (distKm < 50) return 100;
  if (distKm < 150) return 80;
  if (distKm < 500) return 50;
  if (distKm < 1000) return 25;
  return 10;
}

export function calculateMatch(
  listing: WasteListing,
  buyerListing: WasteListing
): MatchResult | null {
  const matScore = materialScore(listing.wasteType, buyerListing.wasteType);
  if (matScore === 0) return null;

  const dist = getDistance(listing.latitude, listing.longitude, buyerListing.latitude, buyerListing.longitude);
  const proxScore = proximityScore(dist);
  const qtyMatch = Math.min(listing.quantity, buyerListing.quantity) / Math.max(listing.quantity, buyerListing.quantity);
  const qtyScore = qtyMatch * 100;

  const score = Math.round(matScore * 0.4 + proxScore * 0.3 + qtyScore * 0.3);

  return {
    wasteListingId: listing.id,
    buyerFactoryId: buyerListing.factoryId,
    buyerFactoryName: buyerListing.factoryName || "",
    wasteType: listing.wasteType,
    compatibilityScore: score,
    distanceKm: Math.round(dist),
    co2Saved: Math.round(listing.quantity * 0.5 * (proxScore / 100)),
    quantityMatch: Math.round(qtyMatch * 100),
  };
}

export function calculateImpact(quantity: number) {
  return {
    co2Saved: Math.round(quantity * 0.5 * 10) / 10,
    wasteDiverted: quantity,
    energySaved: Math.round(quantity * 0.3 * 10) / 10,
  };
}
