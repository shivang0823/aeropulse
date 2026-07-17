import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENAQ_API_KEY || "6b473d0d7254c087d483ddef97c171ded6a0663fe5333765cb65c6166df5bf9f";

  try {
    // Fetch Location Details
    const locRes = await fetch(`https://api.openaq.org/v3/locations/${locationId}`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!locRes.ok) {
      return NextResponse.json(
        { error: `Location fetch failed: ${locRes.statusText}` }, 
        { status: locRes.status }
      );
    }

    const locData = await locRes.json();

    // Fetch Latest Measurements
    const latestRes = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`, {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 30 } // Cache latest measurements for 30 seconds
    });

    if (!latestRes.ok) {
      return NextResponse.json(
        { error: `Latest fetch failed: ${latestRes.statusText}` }, 
        { status: latestRes.status }
      );
    }

    const latestData = await latestRes.json();

    return NextResponse.json({
      location: locData.results?.[0] || null,
      latest: latestData.results || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
