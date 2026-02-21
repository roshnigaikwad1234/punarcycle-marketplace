// Seed demo factories for testing the matching system
// Run this once to populate buyer factories in Firestore

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const demoFactories = [
  {
    factoryName: "GreenBuild Construction",
    city: "Mumbai",
    acceptedWasteTypes: ["plastic scrap", "metal scrap", "concrete waste"],
    minQuantity: 100,
    maxQuantity: 1000,
    role: "consumer"
  },
  {
    factoryName: "EcoCement Industries",
    city: "Pune",
    acceptedWasteTypes: ["fly ash", "steel slag", "concrete waste"],
    minQuantity: 500,
    maxQuantity: 5000,
    role: "consumer"
  },
  {
    factoryName: "CircularFabrics Ltd",
    city: "Ahmedabad",
    acceptedWasteTypes: ["textile waste", "cotton waste"],
    minQuantity: 50,
    maxQuantity: 500,
    role: "consumer"
  },
  {
    factoryName: "MetalWorks Recycling",
    city: "Delhi",
    acceptedWasteTypes: ["metal scrap", "steel scrap", "aluminum scrap"],
    minQuantity: 200,
    maxQuantity: 2000,
    role: "consumer"
  },
  {
    factoryName: "Organic Solutions",
    city: "Bangalore",
    acceptedWasteTypes: ["organic waste", "food waste", "biomass"],
    minQuantity: 100,
    maxQuantity: 1000,
    role: "consumer"
  }
];

export async function seedDemoFactories() {
  try {
    console.log("Seeding demo factories...");
    for (const factory of demoFactories) {
      await addDoc(collection(db, "factories"), factory);
    }
    console.log("Demo factories seeded successfully!");
  } catch (error) {
    console.error("Error seeding factories:", error);
  }
}

// Uncomment the line below and run this file to seed factories
// seedDemoFactories();