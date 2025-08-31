import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!openAIApiKey) {
      console.error("OpenAI API key missing");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          details: "OpenAI API key is not set.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Avatar generation started with prompt:", style);

    let base64Data;
    try {
      base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
    } catch (imageError) {
      console.error("Image base64 processing error:", imageError);
      return new Response(
        JSON.stringify({
          error: "Invalid image data",
          details: "Could not process the provided image.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Convert to binary
    const imageBytes = Uint8Array.from(
      atob(base64Data),
      (c) => c.charCodeAt(0),
    );

    // Call OpenAI Image Variations API with DALL-E 2
    const formData = new FormData();
    formData.append("image", new Blob([imageBytes], { type: "image/png" }), "image.png");
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    formData.append("response_format", "b64_json");

    console.log("Calling OpenAI Image Variations API...");
    const response = await fetch("https://api.openai.com/v1/images/variations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    const responseData = await response.json();
    console.log("OpenAI API response status:", response.status);

    if (!response.ok) {
      console.error("OpenAI API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar variation",
          details: responseData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`,
          openai_error: responseData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!responseData?.data?.[0]?.b64_json) {
      throw new Error("No image data received from OpenAI");
    }

    const generatedImage = `data:image/png;base64,${responseData.data[0].b64_json}`;

    return new Response(
      JSON.stringify({ generatedImage, style }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unhandled error in generate-avatar:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate avatar",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
