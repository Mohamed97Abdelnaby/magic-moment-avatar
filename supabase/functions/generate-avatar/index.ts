import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const avatarPrompts = {
  pixar: "Create a stylized avatar of the person in the image.",
  farmer: "Transform the detected people into Pixar-style Egyptian farmers.",
  pharaonic: "Transform the detected people into ancient Egyptian royalty.",
  basha: "Transform the detected people into early 20th-century Egyptian aristocrats.",
  beach: "Transform the detected people into Mediterranean-style beach characters.",
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

    const prompt = avatarPrompts[style] || avatarPrompts.pixar;

    // Handle image: base64 or URL
    let imageBlob: Blob;
    if (image.startsWith("http")) {
      console.log("Fetching image from URL:", image);
      const imgRes = await fetch(image);
      if (!imgRes.ok) throw new Error(`Failed to fetch image from URL: ${imgRes.status}`);
      const buffer = await imgRes.arrayBuffer();
      imageBlob = new Blob([buffer], { type: imgRes.headers.get("content-type") || "image/png" });
    } else if (image.startsWith("data:image")) {
      console.log("Detected base64 image input");
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      imageBlob = new Blob([bytes], { type: "image/png" });
    } else {
      throw new Error("Unsupported image format: must be base64 or URL");
    }

    // Send to OpenAI Image Generation API
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", imageBlob, "image.png");
    formData.append("prompt", `${prompt} Keep their identity intact.`);
    formData.append("size", "1024x1024");
    formData.append("n", "1");
    formData.append("response_format", "b64_json");

    const imageResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}` },
      body: formData,
    });

    const imageData = await imageResponse.json();
    console.log("OpenAI Image API response:", imageResponse.status);

    if (!imageResponse.ok) {
      console.error("OpenAI Image API error:", imageData);
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar image",
          details: imageData.error?.message || `OpenAI Image API error: ${imageResponse.status}`,
        }),
        {
          status: imageResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!imageData?.data?.[0]?.b64_json) {
      throw new Error("No image data received from OpenAI Image API");
    }

    const generatedImage = `data:image/png;base64,${imageData.data[0].b64_json}`;

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
