import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Style prompts for avatar generation
const stylePrompts = {
  farmer: "Transform this person into a friendly farmer character wearing overalls, straw hat, and standing in a farm setting with crops in the background. Maintain the person's facial features and expression while adding the farmer aesthetic.",
  pharaonic: "Transform this person into an ancient Egyptian pharaoh with golden headdress, ornate jewelry, and royal Egyptian attire. Keep the person's face but add the majestic pharaonic styling and ancient Egyptian background.",
  basha: "Transform this person into an elegant Ottoman-era Turkish nobleman (basha) wearing traditional Ottoman clothing, fez hat, and ornate decorations. Maintain facial features while adding the distinguished Ottoman aesthetic.",
  beach: "Transform this person into a relaxed beach character wearing summer clothes, sunglasses, with a tropical beach background. Keep their face while adding the casual beach vacation vibe.",
  pixar: "Transform this person into a Pixar-style animated character with the characteristic 3D animation look, vibrant colors, and expressive features while maintaining their recognizable facial structure."
};

function validateImageFormat(base64Data: string): boolean {
  // Check if it's a valid base64 image (PNG, JPEG, or WebP)
  const imagePattern = /^data:image\/(png|jpeg|jpg|webp);base64,/i;
  return imagePattern.test(base64Data);
}

function getImageSizeFromBase64(base64Data: string): { width: number; height: number; sizeInBytes: number } {
  // Remove data URL prefix to get pure base64
  const base64Content = base64Data.split(',')[1];
  
  // Calculate file size (base64 is ~4/3 larger than original)
  const sizeInBytes = (base64Content.length * 3) / 4;
  
  // For actual dimensions, we'd need to decode the image header
  // For now, we'll estimate based on common resolutions
  // This is a simplified approach - in production you might want more precise validation
  
  return {
    width: 1024, // Default assumption
    height: 1024, // Default assumption  
    sizeInBytes
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();
    
    console.log(`Received request: { hasImage: ${!!image}, style: "${style}" }`);

    if (!image || !style) {
      console.error("Missing required parameters:", { hasImage: !!image, hasStyle: !!style });
      return new Response(JSON.stringify({ error: "Missing image or style parameter" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate image format
    if (!validateImageFormat(image)) {
      console.error("Invalid image format");
      return new Response(JSON.stringify({ error: "Image must be PNG, JPEG, or WebP format" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate image size and resolution
    const imageStats = getImageSizeFromBase64(image);
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB
    const maxResolution = 4096;

    if (imageStats.sizeInBytes > maxSizeBytes) {
      console.error(`Image too large: ${imageStats.sizeInBytes} bytes`);
      return new Response(JSON.stringify({ error: "Image size exceeds 20MB limit" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (imageStats.width > maxResolution || imageStats.height > maxResolution) {
      console.error(`Image resolution too high: ${imageStats.width}x${imageStats.height}`);
      return new Response(JSON.stringify({ error: "Image resolution exceeds 4096x4096 pixels" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate style
    if (!stylePrompts[style.toLowerCase()]) {
      console.error(`Invalid style: ${style}`);
      return new Response(JSON.stringify({ error: "Invalid style. Must be one of: farmer, pharaonic, basha, beach, pixar" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("OpenAI API key not found");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert base64 to blob for OpenAI API
    const base64Content = image.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    // Create form data for OpenAI image edit API
    const formData = new FormData();
    formData.append('image', new Blob([imageBytes], { type: 'image/png' }), 'image.png');
    formData.append('prompt', stylePrompts[style.toLowerCase()]);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');
    formData.append('quality', 'high');

    console.log(`Sending request to OpenAI for ${style} style transformation`);

    // Call OpenAI Image Edit API
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate avatar', details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('OpenAI response received successfully');

    // OpenAI returns base64 for gpt-image-1
    if (result.data && result.data.length > 0) {
      return new Response(JSON.stringify({ 
        success: true,
        image: result.data[0].b64_json ? `data:image/png;base64,${result.data[0].b64_json}` : result.data[0].url,
        style: style
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('No image data in OpenAI response');
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});