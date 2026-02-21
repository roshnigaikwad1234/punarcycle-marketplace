/**
 * Mock marketplace companies: 10 producers, 10 consumers.
 * Used in Marketplace (browse all) and AI Matches (filtered by user's requirements).
 */
export type IndustryType = "Steel" | "Textile" | "Pharma" | "Electronics" | "Cement" | "Chemical" | "Other";

export interface MockCompany {
  id: string;
  companyName: string;
  city: string;
  role: "producer" | "consumer";
  materialType: string;
  quantity: number;
  pricePerKg: number;
  industryType: IndustryType;
}

export const MOCK_PRODUCERS: MockCompany[] = [
  { id: "prod-1", companyName: "Raj Steel Works", city: "Mumbai", role: "producer", materialType: "Steel slag", quantity: 5000, pricePerKg: 12, industryType: "Steel" },
  { id: "prod-2", companyName: "Shree Textiles Ltd", city: "Surat", role: "producer", materialType: "Cotton waste", quantity: 2000, pricePerKg: 8, industryType: "Textile" },
  { id: "prod-3", companyName: "MediPharm Labs", city: "Hyderabad", role: "producer", materialType: "Chemical effluents (treated)", quantity: 800, pricePerKg: 25, industryType: "Pharma" },
  { id: "prod-4", companyName: "TechRecycle India", city: "Bangalore", role: "producer", materialType: "E-waste (processed)", quantity: 1500, pricePerKg: 45, industryType: "Electronics" },
  { id: "prod-5", companyName: "GreenPlast Industries", city: "Pune", role: "producer", materialType: "Plastic scrap", quantity: 3000, pricePerKg: 18, industryType: "Chemical" },
  { id: "prod-6", companyName: "Bharat Cement Unit", city: "Raipur", role: "producer", materialType: "Ceramic waste", quantity: 4000, pricePerKg: 6, industryType: "Cement" },
  { id: "prod-7", companyName: "Southern Spinning Co", city: "Coimbatore", role: "producer", materialType: "Textile offcuts", quantity: 1200, pricePerKg: 10, industryType: "Textile" },
  { id: "prod-8", companyName: "Metalloy Foundry", city: "Jamshedpur", role: "producer", materialType: "Metal shavings", quantity: 2500, pricePerKg: 22, industryType: "Steel" },
  { id: "prod-9", companyName: "Sunrise Pharma Waste", city: "Ahmedabad", role: "producer", materialType: "Organic waste", quantity: 600, pricePerKg: 5, industryType: "Pharma" },
  { id: "prod-10", companyName: "EcoBattery Solutions", city: "Chennai", role: "producer", materialType: "Battery scrap", quantity: 900, pricePerKg: 55, industryType: "Electronics" },
];

export const MOCK_CONSUMERS: MockCompany[] = [
  { id: "cons-1", companyName: "National Steel Corp", city: "Mumbai", role: "consumer", materialType: "Steel slag", quantity: 6000, pricePerKg: 14, industryType: "Steel" },
  { id: "cons-2", companyName: "Premier Fabrics", city: "Surat", role: "consumer", materialType: "Cotton waste", quantity: 2500, pricePerKg: 9, industryType: "Textile" },
  { id: "cons-3", companyName: "LifeCare Pharmaceuticals", city: "Hyderabad", role: "consumer", materialType: "Chemical effluents (treated)", quantity: 1000, pricePerKg: 28, industryType: "Pharma" },
  { id: "cons-4", companyName: "Digital Components Ltd", city: "Bangalore", role: "consumer", materialType: "E-waste (processed)", quantity: 2000, pricePerKg: 48, industryType: "Electronics" },
  { id: "cons-5", companyName: "Polymer Solutions", city: "Pune", role: "consumer", materialType: "Plastic scrap", quantity: 4000, pricePerKg: 20, industryType: "Chemical" },
  { id: "cons-6", companyName: "Mega Cement Ltd", city: "Raipur", role: "consumer", materialType: "Ceramic waste", quantity: 5000, pricePerKg: 7, industryType: "Cement" },
  { id: "cons-7", companyName: "Weave India Exports", city: "Coimbatore", role: "consumer", materialType: "Textile offcuts", quantity: 1500, pricePerKg: 11, industryType: "Textile" },
  { id: "cons-8", companyName: "Alloy Manufacturing Co", city: "Jamshedpur", role: "consumer", materialType: "Metal shavings", quantity: 3000, pricePerKg: 24, industryType: "Steel" },
  { id: "cons-9", companyName: "BioPharm Research", city: "Ahmedabad", role: "consumer", materialType: "Organic waste", quantity: 800, pricePerKg: 6, industryType: "Pharma" },
  { id: "cons-10", companyName: "PowerCell Industries", city: "Chennai", role: "consumer", materialType: "Battery scrap", quantity: 1200, pricePerKg: 58, industryType: "Electronics" },
];

export const ALL_MOCK_COMPANIES: MockCompany[] = [...MOCK_PRODUCERS, ...MOCK_CONSUMERS];

/** Normalize material type for approximate matching (lowercase, trim). */
export function normalizeMaterial(s: string): string {
  return (s || "").toLowerCase().trim();
}

/** Check if two material types match approximately (exact or one contains the other). */
export function materialsMatch(a: string, b: string): boolean {
  const x = normalizeMaterial(a);
  const y = normalizeMaterial(b);
  if (x === y) return true;
  if (x.includes(y) || y.includes(x)) return true;
  const synonyms: Record<string, string[]> = {
    steel: ["steel slag", "metal shavings"],
    textile: ["cotton waste", "textile offcuts"],
    pharma: ["chemical effluents", "organic waste"],
    electronics: ["e-waste", "battery scrap"],
    plastic: ["plastic scrap"],
    ceramic: ["ceramic waste"],
  };
  for (const key of Object.keys(synonyms)) {
    const list = synonyms[key];
    if (list.some((t) => x.includes(t) || t.includes(x)) && list.some((t) => y.includes(t) || t.includes(y))) return true;
  }
  return false;
}

/** Check if quantity is in acceptable range (within ~50% or exact). */
export function quantityMatches(required: number, available: number): boolean {
  if (available >= required * 0.5 && available <= required * 2) return true;
  if (required >= available * 0.5 && required <= available * 2) return true;
  return false;
}

/** Check if city matches (exact or same region). */
export function locationMatches(cityA: string, cityB: string): boolean {
  const a = normalizeMaterial(cityA);
  const b = normalizeMaterial(cityB);
  if (a === b) return true;
  const sameRegion: Record<string, string[]> = {
    mumbai: ["pune", "thane", "navi mumbai"],
    bangalore: ["bengaluru", "mysore"],
    delhi: ["noida", "gurgaon", "gurugram", "faridabad"],
    chennai: ["tamil nadu"],
    hyderabad: ["secunderabad"],
    surat: ["gujarat"],
    ahmedabad: ["gujarat"],
    pune: ["mumbai", "maharashtra"],
    coimbatore: ["tamil nadu"],
    jamshedpur: ["jharkhand"],
    raipur: ["chhattisgarh"],
  };
  for (const key of Object.keys(sameRegion)) {
    const list = sameRegion[key];
    const inA = a === key || list.some((c) => a.includes(c));
    const inB = b === key || list.some((c) => b.includes(c));
    if (inA && inB) return true;
  }
  return false;
}

/**
 * Filter producers that match user's waste listing (material, quantity, location).
 */
export function filterProducersByWaste(
  producers: MockCompany[],
  waste: { wasteType: string; quantity: number; city: string }
): MockCompany[] {
  return producers.filter(
    (p) =>
      materialsMatch(p.materialType, waste.wasteType) &&
      quantityMatches(waste.quantity, p.quantity) &&
      locationMatches(p.city, waste.city)
  );
}

/**
 * Filter consumers that match user's consumer requirement (material, quantity, location).
 */
export function filterConsumersByRequirement(
  consumers: MockCompany[],
  req: { materialType: string; quantity: number; location: string }
): MockCompany[] {
  return consumers.filter(
    (c) =>
      materialsMatch(c.materialType, req.materialType) &&
      quantityMatches(req.quantity, c.quantity) &&
      locationMatches(c.city, req.location)
  );
}

/** Compute match score (0–100) and reasons for a consumer vs waste listing (producer tab). */
export function scoreConsumerMatch(
  consumer: MockCompany,
  waste: { wasteType: string; quantity: number; city: string }
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (materialsMatch(consumer.materialType, waste.wasteType)) {
    score += 40;
    reasons.push(`Material '${consumer.materialType}' matches your listing`);
  }
  if (quantityMatches(waste.quantity, consumer.quantity)) {
    score += 30;
    reasons.push("Quantity in acceptable range");
  }
  if (locationMatches(consumer.city, waste.city)) {
    score += 30;
    reasons.push(`Location: ${consumer.city}`);
  } else {
    score += 10;
    reasons.push("Different region — logistics can be arranged");
  }
  return { score: Math.min(score, 100), reasons: reasons.slice(0, 3) };
}

/** Compute match score and reasons for a producer vs consumer requirement (consumer tab). */
export function scoreProducerMatch(
  producer: MockCompany,
  req: { materialType: string; quantity: number; location: string }
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (materialsMatch(producer.materialType, req.materialType)) {
    score += 40;
    reasons.push(`Supplies '${producer.materialType}'`);
  }
  if (quantityMatches(req.quantity, producer.quantity)) {
    score += 30;
    reasons.push("Quantity matches your requirement");
  }
  if (locationMatches(producer.city, req.location)) {
    score += 30;
    reasons.push(`Location: ${producer.city}`);
  } else {
    score += 10;
    reasons.push("Different region — delivery possible");
  }
  return { score: Math.min(score, 100), reasons: reasons.slice(0, 3) };
}
