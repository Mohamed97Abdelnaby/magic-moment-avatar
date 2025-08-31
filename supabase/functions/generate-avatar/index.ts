console.log("Here!")
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('Environment check:');
console.log('Available env keys:', Object.keys(Deno.env.toObject()).filter(key => key.includes('OPENAI')));
console.log('OPENAI_API_KEY exists:', !!openAIApiKey);
console.log('OPENAI_API_KEY length:', openAIApiKey?.length || 0);

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://f04b2339-5de6-477e-b8aa-36a296858f11.sandbox.lovable.dev',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Style transformation prompts for image generation
const stylePrompts = {
  'farmer': "A professional portrait of a person as a friendly farmer character wearing overalls and a straw hat, standing in a rural farm setting with rolling hills and a red barn in the background. Realistic portrait style with warm lighting and earthy tones. High quality headshot.",
  'pharaonic': "A professional portrait of a person as an ancient Egyptian pharaoh wearing elaborate golden headdress, ornate jewelry, and royal Egyptian attire, in an ancient Egyptian palace with hieroglyphics on the walls. Majestic portrait style with golden lighting and rich colors. High quality headshot.",
  'basha': "A professional portrait of a person as an elegant Ottoman basha wearing traditional Ottoman robes, a turban with feathers, and ornate decorations, in a luxurious Ottoman palace setting. Regal portrait style with warm lighting and rich fabrics. High quality headshot.",
  'beach': "A professional portrait of a person as a relaxed beach character wearing casual beach attire and sunglasses, with a cheerful expression, on a beautiful tropical beach with palm trees and crystal blue water. Bright portrait style with sunny lighting and vibrant colors. High quality headshot.",
  'pixar': "A professional portrait of a person in Pixar-style animation with exaggerated features, bright colors, and expressive facial features typical of Pixar animation. 3D animated character style that's colorful and family-friendly. High quality character design."
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
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
    console.log('Image data length:', image?.length || 0);

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      console.error('All environment variables:', Object.keys(Deno.env.toObject()));
      return new Response(JSON.stringify({ 
        error: 'Server configuration error',
        details: 'OpenAI API key not configured. Please check your Supabase function secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the appropriate prompt for the style
    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.pixar;
    
    console.log('Using generation prompt:', stylePrompt);
    
    console.log('Calling OpenAI image generation API');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: stylePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png',
        response_format: 'b64_json'
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error status:', response.status);
      console.error('OpenAI API error response:', responseData);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate avatar',
        details: responseData.error?.message || `API Error: ${response.status}`,
        apiStatus: response.status
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Avatar generated successfully');
    console.log('Response data structure:', Object.keys(responseData));

    // Handle image generation response format
    if (responseData.data && responseData.data[0]) {
      let generatedImage;
      
      if (responseData.data[0].b64_json) {
        // If we get base64 directly
        generatedImage = `data:image/png;base64,${responseData.data[0].b64_json}`;
        console.log('Generated image base64 length:', responseData.data[0].b64_json.length);
      } else if (responseData.data[0].url) {
        // If we get a URL, fetch it and convert to base64
        console.log('Fetching image from URL:', responseData.data[0].url);
        const imageResponse = await fetch(responseData.data[0].url);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        generatedImage = `data:image/png;base64,${base64}`;
        console.log('Converted URL image to base64, length:', base64.length);
      } else {
        console.error('No image data in response:', responseData.data[0]);
        throw new Error('No image data received from OpenAI');
      }

      return new Response(JSON.stringify({ 
        generatedImage,
        style 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.error('Invalid response structure:', responseData);
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