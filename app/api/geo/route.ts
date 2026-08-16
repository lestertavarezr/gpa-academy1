import { NextRequest, NextResponse } from "next/server";

// Server-side geolocation lookup. Keeps GEOLOCATION_API_KEY out of the
// client bundle: the browser calls this internal route, and this route
// calls the external geolocation provider using a server-only env var.
export async function GET(request: NextRequest) {
  const apiUrl = process.env.GEOLOCATION_API_URL;
  const apiKey = process.env.GEOLOCATION_API_KEY;

  // Best-effort visitor IP extraction behind proxies/CDNs.
  const forwardedFor = request.headers.get("x-forwarded-for");
  const visitorIp = forwardedFor?.split(",")[0]?.trim();

  if (!apiUrl || !apiKey) {
    // No provider configured yet (placeholders in .env) — degrade gracefully.
    return NextResponse.json(
      { countryCode: null, source: "unconfigured" },
      { status: 200 }
    );
  }

  try {
    const params = new URLSearchParams({ apiKey });
    if (visitorIp) params.set("ip", visitorIp);

    const res = await fetch(`${apiUrl}?${params.toString()}`, {
      // Geolocation barely changes; a short edge cache avoids hammering
      // the provider without staling out real traffic shifts.
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Geolocation API status ${res.status}`);

    const data = await res.json();
    const countryCode: string | null =
      data.country_code2 || data.country_code || data.countryCode || null;

    return NextResponse.json({ countryCode, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { countryCode: null, source: "error" },
      { status: 200 }
    );
  }
}
