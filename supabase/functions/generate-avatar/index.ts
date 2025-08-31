import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
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
    // Verify OpenAI API key with enhanced logging
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key status:', openAIApiKey ? `Present (${openAIApiKey.substring(0, 7)}...)` : 'Missing');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        status: 'configuration_error'
      }), {
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
    console.log('Starting vision analysis with gpt-4o-mini...');
    
    let visionResponse;
    try {
      visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
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
                  text: 'Describe this person in detail focusing on facial features, hair, skin tone, age, gender, and distinctive characteristics. Be specific and detailed for avatar creation.'
                },
                {
                  type: 'image_url',
                  image_url: { url: image }
                }
              ]
            }
          ],
          max_tokens: 300
        }),
      });
    } catch (fetchError) {
      console.error('Vision API fetch error:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to vision API',
        status: 'api_connection_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    
    // DALL-E-3 has a 4000 character limit
    const finalPrompt = prompt.length > 4000 ? prompt.substring(0, 4000) + '...' : prompt;

    console.log('Generating image with DALL-E-3...');
    console.log('Prompt length:', finalPrompt.length);

    let imageResponse;
    try {
      imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: finalPrompt,
          size: '1024x1024',
          quality: 'hd',
          n: 1
        }),
      });
    } catch (fetchError) {
      console.error('Image generation fetch error:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to image generation API',
        status: 'api_connection_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text();
      console.error('Image generation error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate avatar image', details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageData = await imageResponse.json();
    
    if (!imageData.data || !imageData.data[0] || !imageData.data[0].url) {
      console.error('No image data received from OpenAI');
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DALL-E-3 returns a URL, we need to fetch it and convert to base64
    const imageUrl = imageData.data[0].url;
    console.log('Fetching generated image from URL...');
    
    const imageDownloadResponse = await fetch(imageUrl);
    if (!imageDownloadResponse.ok) {
      console.error('Failed to download generated image');
      return new Response(JSON.stringify({ error: 'Failed to download generated image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Converting image to base64...');
    const imageBuffer = await imageDownloadResponse.arrayBuffer();
    
    // Use Buffer.from() instead of btoa() to handle large images properly
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

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
