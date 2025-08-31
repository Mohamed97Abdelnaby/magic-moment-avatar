import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stylePrompts = {
  pixar: "Transform this person into a Pixar/Disney 3D animated character with big expressive eyes, smooth colorful features, and cheerful cartoon styling while maintaining their facial structure and identity.",
  farmer: "Transform this person into an Egyptian farmer wearing traditional galabiya, keffiyeh headwrap, working in lush green fields with the Nile in background, realistic oil painting style.",
  pharaonic: "Transform this person into an ancient Egyptian pharaoh with golden headdress, ornate collar jewelry, dramatic eye makeup, desert pyramid background, classical Egyptian art style.",
  basha: "Transform this person into an elegant Egyptian basha (nobleman) wearing fez hat, formal Ottoman-era clothing, distinguished mustache, seated in ornate palace setting, vintage portrait style.",
  beach: "Transform this person into a relaxed beach vacation look with sunglasses, casual summer clothing, tropical beach background with palm trees and blue ocean, bright sunny photography style."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();
    console.log('Received request:', { hasImage: !!image, style });

    if (!image || !style) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: image and style' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing image with GPT-4 Vision...');
    
    // Step 1: Analyze the image with GPT-4 Vision
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this person\'s key facial features, age, gender, and overall appearance in detail for avatar generation. Focus on distinctive characteristics.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!visionResponse.ok) {
      console.error('Vision API error:', await visionResponse.text());
      throw new Error('Failed to analyze image');
    }

    const visionData = await visionResponse.json();
    const personDescription = visionData.choices[0].message.content;
    console.log('Person analysis complete:', personDescription.substring(0, 100) + '...');

    // Step 2: Generate styled avatar
    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts];
    if (!stylePrompt) {
      throw new Error(`Invalid style: ${style}`);
    }

    const fullPrompt = `${stylePrompt} Person details: ${personDescription}`;
    console.log('Generating avatar with style:', style);

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      }),
    });

    if (!imageResponse.ok) {
      console.error('Image generation error:', await imageResponse.text());
      throw new Error('Failed to generate avatar');
    }

    const imageData = await imageResponse.json();
    const generatedImage = `data:image/png;base64,${imageData.data[0].b64_json}`;
    
    console.log('Avatar generation successful');

    return new Response(JSON.stringify({ 
      generatedImage 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Avatar generation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});