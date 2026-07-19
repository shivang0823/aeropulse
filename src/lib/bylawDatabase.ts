import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface BylawRule {
  id: string;
  title: string;
  source: string;
  snippet: string;
  textToEmbed: string;
}

export const statutoryBylaws: BylawRule[] = [
  {
    id: "up-air-act-1981",
    title: "UP Air Pollution Control Act 1981 Section 21",
    source: "UP State Pollution Control Board",
    snippet: "Requires dust suppression water-mist arrays and traffic rerouting if SPM baseline hits > 500 µg/m³.",
    textToEmbed: "UP Air Pollution Control Act 1981 Section 21 Requires dust suppression water-mist arrays and traffic rerouting if SPM baseline hits > 500 µg/m³ SPM particulate matter."
  },
  {
    id: "lmc-code-2025",
    title: "Lucknow Municipal Code Amendment 2025",
    source: "Lucknow Municipal Corporation",
    snippet: "Mandates traffic signal flushing arrays when residential NO₂ gas values cross > 45 µg/m³ to clear car idling pockets.",
    textToEmbed: "Lucknow Municipal Code Amendment 2025 Mandates traffic signal flushing arrays when residential NO₂ gas values cross > 45 µg/m³ to clear car idling pockets nitrogen dioxide NO2."
  },
  {
    id: "ncap-protocol-4b",
    title: "National Clean Air Programme (NCAP) Industrial Protocol 4B",
    source: "National Clean Air Programme",
    snippet: "Explicitly dictates a 40% manufacturing output cap if ambient SO₂ levels exceed 25 µg/m³.",
    textToEmbed: "National Clean Air Programme (NCAP) Industrial Protocol 4B Explicitly dictates a 40% manufacturing output cap if ambient SO₂ levels exceed 25 µg/m³ sulfur dioxide SO2 industrial emission limit."
  }
];

// Cache of embedded bylaws to avoid redundant API calls
let embeddedBylawsCache: { rule: BylawRule; vector: number[] }[] | null = null;

// Helper to embed text using gemini-embedding-001
export async function embedText(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return a dummy zero vector if embedding fails
    return new Array(3072).fill(0);
  }
}

// Math helpers for vector operations
export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
}

export function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// Initialize cache
async function getEmbeddedBylaws() {
  if (embeddedBylawsCache) return embeddedBylawsCache;

  const cache = [];
  for (const rule of statutoryBylaws) {
    const vector = await embedText(rule.textToEmbed);
    cache.push({ rule, vector });
  }
  embeddedBylawsCache = cache;
  return embeddedBylawsCache;
}

// Retrieve the highest semantic match score string and rule
export async function retrieveBylawContext(query: string): Promise<{ rule: BylawRule; score: number }> {
  const queryVector = await embedText(query);
  const embeddedRules = await getEmbeddedBylaws();

  let bestRule = statutoryBylaws[0];
  let highestScore = -1;

  for (const item of embeddedRules) {
    const score = cosineSimilarity(queryVector, item.vector);
    if (score > highestScore) {
      highestScore = score;
      bestRule = item.rule;
    }
  }

  return { rule: bestRule, score: highestScore };
}
