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

// Style transformation prompts for image editing
const stylePrompts = {
  'farmer': "Transform this person into a friendly farmer character. Add overalls, a straw hat, and place them in a rural farm setting with rolling hills and a red barn in the background. Keep their facial features recognizable while applying realistic portrait style with warm lighting and earthy tones.",
  'pharaonic': "Transform this person into an ancient Egyptian pharaoh. Add elaborate golden headdress, ornate jewelry, and royal Egyptian attire. Place them in an ancient Egyptian palace with hieroglyphics on the walls. Keep their facial features recognizable while applying majestic portrait style with golden lighting and rich colors.",
  'basha': "Transform this person into an elegant Ottoman basha. Add traditional Ottoman robes, a turban with feathers, and ornate decorations. Place them in a luxurious Ottoman palace setting. Keep their facial features recognizable while applying regal portrait style with warm lighting and rich fabrics.",
  'beach': "Transform this person into a relaxed beach character. Add casual beach attire and sunglasses, keep their cheerful expression. Place them on a beautiful tropical beach with palm trees and crystal blue water. Keep their facial features recognizable while applying bright portrait style with sunny lighting and vibrant colors.",
  'pixar': "Transform this person into a Pixar-style animated character. Apply exaggerated features, bright colors, and expressive facial features typical of Pixar animation. Keep their basic facial structure recognizable while converting to 3D animated character style that's colorful and family-friendly."
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
    
    console.log('Using transformation prompt:', stylePrompt);
    
    // Convert base64 image to blob
    let base64Data, imageBytes, imageBlob;
    try {
      base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      console.log('Base64 data length after cleanup:', base64Data.length);
      
      imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      imageBlob = new Blob([imageBytes], { type: 'image/png' });
      console.log('Image blob created, size:', imageBlob.size);
    } catch (imageError) {
      console.error('Error processing image data:', imageError);
      return new Response(JSON.stringify({ 
        error: 'Invalid image data',
        details: 'Could not process the provided image data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create FormData for image editing endpoint
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', stylePrompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('response_format', 'b64_json');

    console.log('Calling OpenAI DALL-E 2 edits API to transform user image');
    
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
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