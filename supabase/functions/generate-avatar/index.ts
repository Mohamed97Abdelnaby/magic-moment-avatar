import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Style prompt mapping
const stylePrompts = {
  'farmer': "Create a portrait of a person as a friendly farmer character wearing overalls, a straw hat, with a warm welcoming expression, in a rural farm setting with rolling hills and a red barn in the background. Style: realistic portrait, warm lighting, earthy tones.",
  'pharaonic': "Create a portrait of a person as an ancient Egyptian pharaoh wearing elaborate golden headdress, ornate jewelry, and royal Egyptian attire, in an ancient Egyptian palace with hieroglyphics on the walls. Style: majestic portrait, golden lighting, rich colors.",
  'basha': "Create a portrait of a person as an elegant Ottoman basha wearing traditional Ottoman robes, a turban with feathers, and ornate decorations, in a luxurious Ottoman palace setting. Style: regal portrait, warm lighting, rich fabrics.",
  'beach': "Create a portrait of a person as a relaxed beach character wearing casual beach attire and sunglasses, with a cheerful expression, on a beautiful tropical beach with palm trees and crystal blue water. Style: bright portrait, sunny lighting, vibrant colors.",
  'pixar': "Create a portrait of a person as a Pixar-style animated character with exaggerated features, bright colors, and an expressive face typical of Pixar animation. Style: 3D animated character, colorful, family-friendly."
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating avatar with style:', style);
    console.log('OpenAI API key available:', openAIApiKey ? 'Yes' : 'No');

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        details: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the appropriate prompt for the style
    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.pixar;
    
    console.log('Using style prompt:', stylePrompt);
    
    // Use DALL-E 2 generations endpoint (creates image from text prompt)
    const requestBody = {
      model: 'dall-e-2',
      prompt: stylePrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    };

    console.log('Calling OpenAI DALL-E 2 generations API');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate avatar',
        details: responseData.error?.message || 'Unknown error'
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Avatar generated successfully');

    // Handle DALL-E 2 response format
    if (responseData.data && responseData.data[0]) {
      let generatedImage;
      
      if (responseData.data[0].b64_json) {
        // If we get base64 directly
        generatedImage = `data:image/png;base64,${responseData.data[0].b64_json}`;
      } else if (responseData.data[0].url) {
        // If we get a URL, fetch it and convert to base64
        const imageResponse = await fetch(responseData.data[0].url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        generatedImage = `data:image/png;base64,${base64}`;
      } else {
        throw new Error('No image data received from OpenAI');
      }

      return new Response(JSON.stringify({ 
        generatedImage,
        style 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No image data in response');

  } catch (error) {
    console.error('Error in generate-avatar function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate avatar',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});