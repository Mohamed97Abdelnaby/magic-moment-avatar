import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image, style } = await req.json();

    // Validate input parameters
    if (!image || !style) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: image and style' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate image data URL format
    if (!image.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image format. Expected data URL.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting avatar generation process...');
    console.log('Style requested:', style);

    // Step 1: Analyze the input image using vision model
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this person in detail focusing on facial features, hair, skin tone, age, gender, and distinctive characteristics. Be specific and detailed for avatar creation.'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_completion_tokens: 300
      }),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.text();
      console.error('Vision API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to analyze image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const visionData = await visionResponse.json();
    const personDescription = visionData.choices[0].message.content;
    console.log('Person description:', personDescription);

    // Step 2: Generate avatar using the detailed style prompts
    const stylePrompts = {
      'pixar': `Create a Pixar-style 3D animated avatar of ${personDescription}. Use Pixar's signature style with rounded features, expressive eyes, smooth textures, and vibrant colors. The character should have a friendly, approachable appearance with exaggerated proportions typical of Pixar characters.`,
      'cartoon': `Create a cartoon-style avatar of ${personDescription}. Use bold outlines, simplified features, bright colors, and a playful art style. The character should have exaggerated expressions and a fun, animated appearance.`,
      'anime': `Create an anime-style avatar of ${personDescription}. Use large expressive eyes, detailed hair, clean line art, and vibrant colors typical of anime characters. Include subtle shading and highlights.`,
      'realistic': `Create a photorealistic portrait avatar of ${personDescription}. Use natural lighting, realistic skin textures, and accurate proportions. The image should look like a professional headshot with crisp details.`,
      'oil-painting': `Create an oil painting style portrait of ${personDescription}. Use rich, textured brushstrokes, warm color palette, and classical painting techniques reminiscent of Renaissance portraiture.`,
      'watercolor': `Create a watercolor painting style avatar of ${personDescription}. Use soft, flowing brushstrokes, translucent colors, and the characteristic bleeding effects of watercolor techniques.`
    };

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['cartoon'];
    
    // Truncate prompt if it's too long (gpt-image-1 has character limits)
    const finalPrompt = prompt.length > 1000 ? prompt.substring(0, 1000) + '...' : prompt;

    console.log('Generating image with prompt:', finalPrompt);

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: finalPrompt,
        size: '1024x1024',
        quality: 'high',
        n: 1
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text();
      console.error('Image generation error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate avatar image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageData = await imageResponse.json();
    
    if (!imageData.data || !imageData.data[0]) {
      console.error('No image data received from OpenAI');
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // gpt-image-1 returns base64 data directly
    const generatedImage = imageData.data[0].b64_json;
    const imageDataUrl = `data:image/png;base64,${generatedImage}`;

    console.log('Avatar generated successfully');

    return new Response(JSON.stringify({ 
      generatedImage: imageDataUrl,
      success: true 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: 'Avatar generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
