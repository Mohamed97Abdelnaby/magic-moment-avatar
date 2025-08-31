// supabase/functions/generate-avatar/index.ts
// Deno Deploy Edge Function for avatar generation with proper CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://f04b2339-5de6-477e-b8aa-36a296858f11.sandbox.lovable.dev",
  "http://localhost:3000", // Optional for local dev
];

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  // Handle preflight CORS requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST method is allowed" }),
        {
          status: 405,
          headers: {
            "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.json();
    const { userId, options } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId in request body" }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --- Your avatar generation logic goes here ---
    // For example: Call external AI API or generate avatar data
    const generatedAvatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${userId}`;

    return new Response(
      JSON.stringify({ success: true, avatarUrl: generatedAvatarUrl }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate avatar" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
