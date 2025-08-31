import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace '*' with specific origin in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stylePrompts: Record<string, string> = {
  farmer:
    "Transform this photo into a friendly farmer avatar: overalls, straw hat, rural farm background.",
  pharaonic:
    "Transform this photo into an ancient Egyptian pharaoh: golden headdress, royal jewelry, palace setting.",
  basha:
    "Transform this photo into an Ottoman basha: robes, turban with feathers, luxurious palace.",
  beach:
    "Transform this photo into a relaxed beach character: beachwear, sunglasses, tropical beach background.",
  pixar:
    "Transform this photo into a Pixar-style animated character: colorful, expressive, 3D cartoon look.",
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

    const stylePrompt =
      stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.pixar;

    console.log("Avatar generation started:", { style });

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

    // Call OpenAI Image Generations API (gpt-image-1)
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append(
      "prompt",
      `${stylePrompt} Keep the person's facial features recognizable.`,
    );
    formData.append("image", new Blob([imageBytes], { type: "image/png" }), "image.png");
    formData.append("size", "1024x1024");
    formData.append("n", "1");
    formData.append("response_format", "b64_json");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar",
          details: responseData.error?.message || "Unknown OpenAI API error",
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
