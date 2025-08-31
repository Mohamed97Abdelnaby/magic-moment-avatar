import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Detailed prompts for avatar generation
const avatarPrompts = {
  "pixar": "Create a stylized 3D avatar in Pixar/DreamWorks animation style. Preserve all original facial features, expressions, age, gender, and identity. Transform into a colorful, expressive cartoon character with slightly exaggerated features but maintaining the person's likeness. Use bright, vibrant colors and smooth, clean rendering typical of animated films.",
  
  "farmer": "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, gender, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as a modern Egyptian farmer. For males: dress them in traditional light or neutral-colored galabeyas with a white or patterned headscarf. For females: dress them in female-style galabeyas with colorful headscarves and modest traditional detailing. Set the background in a vibrant green agricultural field under warm, natural sunlight. Include authentic rural Egyptian village elements in the scene such as palm trees, clay houses, farming tools, or common farm animals like donkeys and cows. The visual style should be slightly exaggerated and emotionally expressive like Pixar or DreamWorks, with soft, clean rendering. The overall tone should remain respectful, warm, and culturally authentic with a wholesome, storybook-like atmosphere.",
  
  "pharaonic": "Create a 3D-stylized avatar (Pixar or DreamWorks style) of a person using face and age detection. Keep the original facial features, expressions, and age intact with no changes to identity. Transform the person into an ancient Egyptian (Pharaonic) character, wearing traditional royal or noble clothing from the Pharaonic era: For men: dress in a linen kilt, wide beaded collar, royal headdress (nemes or khepresh), and sandals. For women: dress in a white linen dress with gold accessories, wide beaded collar, and a decorative headdress or braided hairstyle. Set the scene in an ancient Egyptian environment — like beside a temple, on the Nile riverbank, or in front of pyramids — under warm golden sunlight. Style should be culturally respectful, semi-realistic, and slightly exaggerated in the expressive and colorful style of Pixar or animated film characters.",
  
  "basha": "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as 'El Basha' (الباشا بالطاربوش) — a noble or upper-class Egyptian figure from the early 20th century: Dress each person in an elegant dark suit or traditional Egyptian formal wear appropriate to their gender, status, and time period. Add a red tarboosh (fez) to each character. Optional accessories may include a classic cane, monocle, or pocket watch, depending on the person's age and look. For women, adapt the look to match elite fashion of early 1900s Egyptian aristocratic women — refined dresses, tasteful jewelry, elegant hairstyles or headwear that align with cultural norms of the time. Set the scene in a refined background inspired by early 1900s Cairo or Alexandria, including: Old mansions or royal palaces, Vintage cafés or French-style shops, Historic tram lines, Cobblestone streets under warm, golden vintage lighting. The art style should be: Slightly exaggerated and emotionally expressive like Pixar or DreamWorks, Refined, culturally respectful, and dignified, With clean, detailed rendering and a warm, nostalgic tone.",
  
  "beach": "Automatically detect all people in the image using face and age detection. For each individual detected — and only those individuals — generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Do not invent or add any people who are not present in the image. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled for a summery, joyful Mediterranean or Egyptian beach scene: Dress each person in relaxed and culturally-appropriate beachwear that reflects their age and gender. For men: casual short-sleeve shirts, tank tops, swim trunks, sandals, straw hats, or sunglasses. For women (non-hijabi): stylish yet modest summer dresses, beach wraps, swimwear with light cover-ups, wide-brimmed hats, or colorful scarves. For hijabi women: modern, modest beachwear such as colorful burkinis or lightweight tunics with swim-appropriate hijabs or light scarves. For children or elders: simple, age-appropriate summer clothing with light beach accessories like sandals, towels, or sun hats. Optional items (if appropriate): sunglasses, beach bags, ice cream cones, floaties, or books. Set the scene in a warm, sunny coastal environment inspired by Mediterranean or Egyptian beaches, featuring golden sand, clear waves, palm trees, colorful umbrellas, and relaxed seaside cafés. Ensure the background is peaceful and realistic — do not add people or fictional characters beyond those detected in the original photo. The art style should be slightly exaggerated and emotionally expressive, like Pixar or DreamWorks; rendered in a bright, clean, and vibrant animation style that captures warmth, fun, and cultural authenticity."
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();

    if (!image) {
      console.error("No image provided in request");
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!openAIApiKey) {
      console.error("OpenAI API key missing from environment");
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

    // Get the appropriate prompt for the style
    const prompt = avatarPrompts[style] || avatarPrompts["pixar"];
    console.log("Avatar generation started:", { 
      style, 
      promptLength: prompt.length,
      imageType: image.substring(0, 30) + "..."
    });

    // Step 1: Use GPT-4 Vision to analyze the input image
    console.log("Step 1: Analyzing input image with GPT-4 Vision...");
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and describe the person or people in detail including their age, gender, facial features, expression, and any distinctive characteristics. Be very specific about their appearance so I can recreate them in a different style while preserving their identity."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    const visionData = await visionResponse.json();
    console.log("Vision API response status:", visionResponse.status);

    if (!visionResponse.ok) {
      console.error("OpenAI Vision API error:", {
        status: visionResponse.status,
        error: visionData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to analyze input image",
          details: visionData.error?.message || `Vision API error: ${visionResponse.status}`,
          openai_error: visionData,
        }),
        {
          status: visionResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const personDescription = visionData.choices[0].message.content;
    console.log("Person analysis complete:", personDescription.substring(0, 100) + "...");

    // Step 2: Generate the styled avatar using the detailed prompt + person description
    const fullPrompt = `${prompt}

Based on this detailed description of the person in the original image: "${personDescription}"

Create the styled avatar maintaining all the specific facial features, age, gender, and identity characteristics described above.`;

    console.log("Step 2: Generating styled avatar with DALL-E...");
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "high",
        output_format: "png"
      }),
    });

    const imageData = await imageResponse.json();
    console.log("Image Generation API response status:", imageResponse.status);

    if (!imageResponse.ok) {
      console.error("OpenAI Image Generation API error:", {
        status: imageResponse.status,
        error: imageData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar image",
          details: imageData.error?.message || `Image Generation API error: ${imageResponse.status}`,
          openai_error: imageData,
        }),
        {
          status: imageResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // gpt-image-1 returns base64 directly, no need for b64_json format
    if (!imageData?.data?.[0]) {
      throw new Error("No image data received from OpenAI Image Generation API");
    }

    // The response format varies - handle both base64 string and b64_json format
    let generatedImageData;
    if (typeof imageData.data[0] === 'string') {
      generatedImageData = imageData.data[0];
    } else if (imageData.data[0].b64_json) {
      generatedImageData = imageData.data[0].b64_json;
    } else {
      throw new Error("Unexpected image data format from OpenAI");
    }

    const generatedImage = generatedImageData.startsWith('data:') 
      ? generatedImageData 
      : `data:image/png;base64,${generatedImageData}`;

    console.log("Avatar generation successful for style:", style);

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