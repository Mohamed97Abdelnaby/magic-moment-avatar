import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { image, style } = await req.json();
    if (!image || !style) {
      return new Response(JSON.stringify({ error: "Missing image or style" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ error: "Server misconfigured: Missing API key" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Simulate processing to confirm function is working
    return new Response(JSON.stringify({ success: true, message: "Function is reachable!" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});