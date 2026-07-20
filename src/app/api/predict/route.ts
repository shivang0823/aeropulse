import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { city, traffic, industrial, misting, stubble } = body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          description: "An array of exactly 7 PM2.5 projections for 30-minute intervals",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              time: {
                type: SchemaType.STRING,
                description: "The time interval label: 'Now', '+30m', '+60m', '+90m', '+120m', '+150m', or '+180m'"
              },
              "Baseline Projection (No Action)": {
                type: SchemaType.INTEGER,
                description: "Estimated PM2.5 level without action"
              },
              "Optimized Forecast (With Mitigation)": {
                type: SchemaType.INTEGER,
                description: "Estimated PM2.5 level with misting/redirect mitigation"
              }
            },
            required: ["time", "Baseline Projection (No Action)", "Optimized Forecast (With Mitigation)"]
          }
        }
      },
    });

    const systemInstruction = `
You are a highly precise computational micro-climate engine for Uttar Pradesh cities.
Your task is to generate realistic, non-linear air quality projections (specifically SPM/PM2.5 levels) over a 3-hour (180-minute) window.
Calculate values for 7 coordinate records incremented by 30-minute steps: "Now", "+30m", "+60m", "+90m", "+120m", "+150m", "+180m".

Inputs:
- City: ${city.name} (Base PM2.5 level: ${city.base || 150})
- Traffic Density Slider Coefficient: ${traffic} (higher traffic increases PM2.5 non-linearly)
- Industrial Output Cap: ${industrial}% (higher percentage increases PM2.5)
- Stubble Burning (Parali) Index: ${stubble} (0-10 scale, high value drastically spikes PM2.5 over time)
- Mitigation Misting Run-Time: ${misting} min/hour (higher values reduce the optimized forecast, but don't affect baseline)

You must output exactly a JSON array containing 7 items matching the structure:
[
  {
    "time": "Now",
    "Baseline Projection (No Action)": number,
    "Optimized Forecast (With Mitigation)": number
  },
  ...
]

Ensure "Now" starts near the base level adjusted by current sliders, and values follow a realistic physical dispersion/accumulation pattern. Return ONLY the JSON array.
    `;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemInstruction }] }]
    });

    const text = response.response.text();
    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Predict route error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate prediction" }, { status: 500 });
  }
}
