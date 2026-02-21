# punarCYCLE AI Matching System

## Overview
A real-time, rule-based AI-assisted matching system for the punarCYCLE B2B industrial waste marketplace. The system automatically generates compatibility matches when new waste listings are created.

## How It Works

### Data Structures

**Waste Listings** (`wasteListings` collection):
```typescript
{
  id: string;
  wasteType: string;        // e.g., "plastic scrap", "metal scrap"
  quantity: number;         // amount available
  city: string;            // location
  hazardous: boolean;      // safety classification
  createdBy: string;       // factory ID of seller
}
```

**Factories** (`factories` collection):
```typescript
{
  id: string;
  factoryName: string;
  city: string;
  acceptedWasteTypes: string[];  // what they can process
  minQuantity: number;          // minimum they accept
  maxQuantity: number;          // maximum they can handle
  role: "consumer" | "producer" | "both";
}
```

**Matches** (`matches` collection):
```typescript
{
  wasteListingId: string;
  buyerFactoryId: string;
  compatibilityScore: number;  // 0-100
  reasons: string[];          // why they match
  createdAt: Date;
}
```

### Matching Algorithm

The system uses a deterministic rule-based scoring system:

| Criteria | Points | Condition |
|----------|--------|-----------|
| Waste Type Match | +40 | wasteType in buyer's acceptedWasteTypes |
| Same City | +25 | exact city match |
| Quantity Fit | +15 | quantity within buyer's min/max range |
| Non-Hazardous | +10 | waste.hazardous === false |
| Industry Relevance | +10 | fallback compatibility |

**Only matches with score ≥ 60 are saved.**

### API Functions

#### `calculateMatchScore(waste, buyer)`
Returns compatibility score and reasoning.

#### `generateMatchesForWaste(wasteListingId)`
- Fetches the waste listing
- Queries all buyer factories (role: "consumer" or "both")
- Calculates scores for each buyer
- Saves qualifying matches to Firestore

### Usage

1. **Create Buyer Factories** (run once):
   ```typescript
   import { seedDemoFactories } from "./lib/seedFactories";
   await seedDemoFactories();
   ```

2. **Create Waste Listing** (triggers matching):
   - User creates listing in WasteListings page
   - `generateMatchesForWaste()` runs automatically
   - Matches appear in Matches page

3. **View Matches**:
   - Matches page shows AI-generated matches
   - Each match shows compatibility score and reasons
   - Users can initiate deals from matches

### Example Match Output

```
Compatibility: 100%
Reasons:
- Waste type 'plastic scrap' matches buyer's accepted types
- Same city location: Mumbai
- Quantity 500 fits within buyer's range (100-1000)
- Non-hazardous waste (safer to handle)
- Industry relevance: plastic scrap suitable for industrial processing
```

### Technical Implementation

- **Frontend**: React + TypeScript + Vite
- **Backend**: Firebase Firestore
- **Matching**: Pure functions, no ML/AI APIs
- **Real-time**: Matches generated on listing creation
- **Deterministic**: Same inputs always produce same results

### Testing

Run the test script:
```bash
npx tsx src/lib/testMatching.ts
```

This demonstrates the scoring logic with sample data.

### Production Notes

- The system is designed for reliability and transparency
- All matches include human-readable reasoning
- No external API dependencies
- Scales with Firestore's query capabilities
- Maintains data integrity through transactions