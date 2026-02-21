// Test the matching system
// This file demonstrates how the AI matching system works

import { calculateMatchScore } from "./matching";

const testWaste: any = {
  id: "test-waste-1",
  wasteType: "plastic scrap",
  quantity: 500,
  city: "Mumbai",
  hazardous: false,
  createdBy: "test-user"
};

const testBuyer: any = {
  id: "test-buyer-1",
  factoryName: "GreenBuild Construction",
  city: "Mumbai",
  acceptedWasteTypes: ["plastic scrap", "metal scrap"],
  minQuantity: 100,
  maxQuantity: 1000,
  role: "consumer"
};

console.log("Testing AI Matching System:");
console.log("Waste:", testWaste);
console.log("Buyer:", testBuyer);

const result = calculateMatchScore(testWaste, testBuyer);
console.log("Match Result:", result);

// Expected: score >= 60 (40 + 25 + 15 + 10 + 10 = 110, but capped at 100)
// Reasons should include: waste type match, same city, quantity fit, non-hazardous, industry relevance