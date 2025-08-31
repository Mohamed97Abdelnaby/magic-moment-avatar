import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  "https://f04b2339-5de6-477e-b8aa-36a296858f11.sandbox.lovable.dev", // your Lovable dev domain
  "https://your-production-domain.com" // add production domain here
];

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
        },
      });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: "Missing 'name' field" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
        },
      });
    }

    // === Replace this with your avatar generation logic ===
    const avatarUrl = `https://api.multiavatar.com/${encodeURIComponent(name)}.png`;
    // ======================================================

    return new Response(JSON.stringify({ avatar: avatarUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Fallback to allow debugging
      },
    });
  }
});
