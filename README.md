# ♻️ punarCYCLE – Industrial Circular Economy Platform

**Reuse • Trade • Sustain**

🌍 **punarCYCLE** is a B2B industrial sustainability platform that connects **industrial waste generators** with **waste consumers** using AI-powered matching, enabling a circular economy and reducing environmental impact.

🔗 **Live Demo:**  
👉 https://punarcycle-marketplace.vercel.app/

---

## 🚀 Problem Statement

Industrial waste management today is:
- Manual and broker-dependent  
- Costly to dispose  
- Environmentally damaging  
- Lacking sustainability visibility  

Factories often don’t know **who can reuse their waste**, while others spend more on raw materials.

---

## 💡 Our Solution

punarCYCLE creates a **digital circular economy marketplace** where:
- Factories list industrial waste
- Other factories discover reusable materials
- AI suggests suitable matches
- Deals are initiated digitally
- Environmental impact is tracked

**Waste → Resource → Value**

---

## 🧠 Key Features

### 🏭 Factory Registration
- Register as **Producer**, **Consumer**, or **Both**
- Simple onboarding flow

### 📦 Waste & Requirement Listings
- Producers list waste materials
- Consumers list raw material requirements

### 🤖 AI Matches (Demo)
- Matching based on:
  - Material type
  - Quantity
  - Location
- Compatibility score displayed

### 🤝 Deal Initiation
- One-click **Initiate Deal**
- Deal saved with **Pending** status
- Instantly visible in Deals dashboard

### 📊 Deal Management
- View active and completed deals
- Deal lifecycle:
  - Pending
  - Processing
  - Shipping
  - Completed

### 🌱 Environmental Impact (Demo)
- CO₂ emissions saved
- Waste diverted from landfills

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend & Database
- Firebase Authentication
- Firebase Firestore

### AI (Planned / Demo)
- Google Gemini API (AI-powered matching)

### Deployment
- Vercel

---

## 🧱 System Architecture (High-Level)

```text
User (Browser)
   ↓
React + Vite Frontend
   ↓
Firebase Authentication
   ↓
Firestore Database
   ↓
AI Matching Logic (Demo / Gemini)
   ↓
Deals & Impact Dashboard
