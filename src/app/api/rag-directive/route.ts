import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveBylawContext } from "@/lib/bylawDatabase";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetCity, pollutantType, acuteValue, violationType } = body;

    // Build RAG Query from telemetry violation
    const ragQuery = `${pollutantType} ${violationType} violation value ${acuteValue} µg/m³ in ${targetCity.name}`;

    // Perform vector semantic search
    const { rule: matchedBylaw, score } = await retrieveBylawContext(ragQuery);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const systemInstruction = `
You are a regulatory compliance dispatch system for the Uttar Pradesh State Pollution Control Board.
Generate a formal government emergency directive letter based on the following context.

Context (Matched Statutory Bylaw):
- Title: ${matchedBylaw.title}
- Source: ${matchedBylaw.source}
- Snippet: ${matchedBylaw.snippet}
- Vector Match Similarity Score: ${score.toFixed(4)}

Incident Details:
- Target City: ${targetCity.name}
- Violation Type: ${violationType}
- Pollutant: ${pollutantType}
- Measured Level: ${acuteValue} µg/m³

The letter must contain:
1. An official Reference Tracking Number (e.g. AP-UP/DIR/2026/LKO-4521)
2. Date of Issuance (use July 19, 2026)
3. Specific legal citations of the code violations (refer to ${matchedBylaw.title})
4. Clear action orders matching the bylaw (e.g. misting arrays, green lights traffic flushing, or 40% manufacturing cap)
5. A simulated cryptographic SHA-256 signature block at the bottom
6. Digitally Signed by: Shivang Srivastava (System Administrator)

Output only the formatted text of the letter.
    `;

    const response = await model.generateContent(systemInstruction);
    const directiveText = response.response.text();

    // Parse reference number from text or generate one if not found
    const refMatch = directiveText.match(/REFERENCE\s*(?:NO|NUMBER|CODE)?\s*:\s*([^\n\r]+)/i) || 
                     directiveText.match(/(AP-UP\/DIR\/2026\/[A-Z0-9-]+)/);
    const refNumber = refMatch ? refMatch[1].trim() : `AP-UP/DIR/2026/${targetCity.name.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      refNumber,
      generatedDirective: directiveText,
      matchedBylaw: {
        title: matchedBylaw.title,
        source: matchedBylaw.source,
        snippet: matchedBylaw.snippet,
        score
      }
    });
  } catch (error: any) {
    console.error("RAG route error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate RAG directive" }, { status: 500 });
  }
}
