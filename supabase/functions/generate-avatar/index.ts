import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
 const apiKey = Deno.env.get("OPENAI_API_KEY");
    // const apiKey = "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";
    
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Style prompts for avatar generation
const stylePrompts = {
  farmer: "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, gender, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as a modern Egyptian farmer. For males: dress them in traditional light or neutral-colored galabeyas with a white or patterned headscarf. For females: dress them in female-style galabeyas with colorful headscarves and modest traditional detailing. Set the background in a vibrant green agricultural field under warm, natural sunlight. Include authentic rural Egyptian village elements in the scene such as palm trees, clay houses, farming tools, or common farm animals like donkeys and cows. The visual style should be slightly exaggerated and emotionally expressive like Pixar or DreamWorks, with soft, clean rendering. The overall tone should remain respectful, warm, and culturally authentic with a wholesome, storybook-like atmosphere.",
  
  pharaonic: "Create a 3D-stylized avatar (Pixar or DreamWorks style) of a person using face and age detection. Keep the original facial features, expressions, and age intact with no changes to identity. Transform the person into an ancient Egyptian (Pharaonic) character, wearing traditional royal or noble clothing from the Pharaonic era: – For men: dress in a linen kilt, wide beaded collar, royal headdress (nemes or khepresh), and sandals. – For women: dress in a white linen dress with gold accessories, wide beaded collar, and a decorative headdress or braided hairstyle. Set the scene in an ancient Egyptian environment — like beside a temple, on the Nile riverbank, or in front of pyramids — under warm golden sunlight. Style should be culturally respectful, semi-realistic, and slightly exaggerated in the expressive and colorful style of Pixar or animated film characters.",
  
  basha: "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as “El Basha” (الباشا بالطاربوش) — a noble or upper-class Egyptian figure from the early 20th century: Dress each person in an elegant dark suit or traditional Egyptian formal wear appropriate to their gender, status, and time period. Add a red tarboosh (fez) to each character. Optional accessories may include a classic cane, monocle, or pocket watch, depending on the person's age and look. For women, adapt the look to match elite fashion of early 1900s Egyptian aristocratic women — refined dresses, tasteful jewelry, elegant hairstyles or headwear that align with cultural norms of the time. Set the scene in a refined background inspired by early 1900s Cairo or Alexandria, including: Old mansions or royal palaces, Vintage cafés or French-style shops, Historic tram lines, Cobblestone streets under warm, golden vintage lighting. The art style should be: Slightly exaggerated and emotionally expressive like Pixar or DreamWorks; Refined, culturally respectful, and dignified; With clean, detailed rendering and a warm, nostalgic tone.",
  
  beach: "Automatically detect all people in the image using face and age detection. For each individual detected — and only those individuals — generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Do not invent or add any people who are not present in the image. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled for a summery, joyful Mediterranean or Egyptian beach scene: Dress each person in relaxed and culturally-appropriate beachwear that reflects their age and gender. For men: casual short-sleeve shirts, tank tops, swim trunks, sandals, straw hats, or sunglasses. For women (non-hijabi): stylish yet modest summer dresses, beach wraps, swimwear with light cover-ups, wide-brimmed hats, or colorful scarves. For hijabi women: modern, modest beachwear such as colorful burkinis or lightweight tunics with swim-appropriate hijabs or light scarves. For children or elders: simple, age-appropriate summer clothing with light beach accessories like sandals, towels, or sun hats. Optional items (if appropriate): sunglasses, beach bags, ice cream cones, floaties, or books. Set the scene in a warm, sunny coastal environment inspired by Mediterranean or Egyptian beaches, featuring golden sand, clear waves, palm trees, colorful umbrellas, and relaxed seaside cafés. Ensure the background is peaceful and realistic — do not add people or fictional characters beyond those detected in the original photo. The art style should be slightly exaggerated and emotionally expressive, like Pixar or DreamWorks; rendered in a bright, clean, and vibrant animation style that captures warmth, fun, and cultural authenticity.",
  
  pixar: "Create a stylized avatar of the persons in the image."
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

   if (!apiKey) {
      console.error("OpenAI API key not found");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert base64 image to Blob
    const imageBlob = await (await fetch(image)).blob();
    
    // Create form data for OpenAI image edit API
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('image', imageBlob, 'input.png');
    formData.append('prompt', stylePrompts[style.toLowerCase()]);
    formData.append('size', '1024x1024');

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