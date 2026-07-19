# AeroPulse UP | Predictive Air Quality Actuation & Command Network

AeroPulse UP is a predictive air quality actuation and compliance command dashboard built with Next.js for municipal administrators in Uttar Pradesh (UP), India (covering Lucknow, Kanpur, Noida, Ghaziabad, and Varanasi). It goes beyond passive data visualization to integrate **generative AI predictive forecasting** and **policy-backed compliance RAG (Retrieval-Augmented Generation)**, empowering authorities to trigger localized IoT mitigation systems (smog towers, mist cannons, traffic rerouting) before critical pollution thresholds are crossed.

---

## Core Features & System Capabilities

### 1. Live Telemetry & IoT Control Deck
- **OpenAQ API Integration:** Fetches live real-time air quality metrics ($PM_{2.5}$, $PM_{10}$, $NO_2$, $CO$, and $SO_2$) for target municipalities.
- **IoT Relays Deck:** Offers interactive toggles representing physical city actuation systems (Mist Cannons, Traffic Rerouting, Industrial Power Caps, and Public Broadcast systems) to react to current warnings.
- **Visual Node Telemetry:** Modern dashboards indicating current AQI levels, thresholds, and wind dynamics.

### 2. Gen-AI 3-Hour Projections
- **Interactive Micro-Climate Simulation:** Leverages range sliders to simulate variables including traffic volume density, industrial output cap percentages, stubble burning (parali) index, and mist cannon active rate.
- **Dynamic Scenario Graphing:** Queries a serverless API running the **Google Gemini 3.5 Flash** model (with strict JSON Schema enforcement) to project comparative curves (+180 minutes) representing the predicted air quality under:
  - **Baseline Projections** (no action taken)
  - **Optimized Forecasts** (with active misting/diversions)

### 3. Regulatory compliance RAG Command Center
- **Bylaw Vector Database:** Embedded statutory compliance database storing key local and national regulations (UP Air Pollution Control Act 1981, Lucknow Municipal Code 2025, National Clean Air Programme Industrial Protocol).
- **Semantic Vector Match:** Uses Google's **`gemini-embedding-001`** model to vectorize search queries and telemetry inputs, executing cosine similarity checks to match the active violation with the exact governing statutory law.
- **Emergency Directive Compilation:** Feeds matched bylaw texts to **Gemini 3.5 Flash** to compile official, policy-validated municipal directive mandates. Letters are generated with reference numbers, specific code citations, action instructions, and a cryptographic SHA-256 validation signature.

---

## Technical Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **AI Core:** Google Gemini API via `@google/generative-ai` SDK
  - **Text Generation & Projections:** `gemini-3.5-flash`
  - **Vector Semantic Embeddings:** `gemini-embedding-001` (3072 dimensions)
- **UI Components:** React, Tailwind CSS, Lucide React icons
- **Data Visualization:** Recharts (Dynamic projection curves & telemetry histories)

---
