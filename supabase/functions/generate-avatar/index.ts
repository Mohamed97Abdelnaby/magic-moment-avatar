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
  "pixar": "Create a stylized avatar of the persons in the image",
  "farmer": "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, gender, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as a modern Egyptian farmer. For males: dress them in traditional light or neutral-colored galabeyas with a white or patterned headscarf. For females: dress them in female-style galabeyas with colorful headscarves and modest traditional detailing. Set the background in a vibrant green agricultural field under warm, natural sunlight. Include authentic rural Egyptian village elements in the scene such as palm trees, clay houses, farming tools, or common farm animals like donkeys and cows. The visual style should be slightly exaggerated and emotionally expressive like Pixar or DreamWorks, with soft, clean rendering. The overall tone should remain respectful, warm, and culturally authentic with a wholesome, storybook-like atmosphere.",
  "pharaonic": "Create a 3D-stylized avatar (Pixar or DreamWorks style) of a person using face and age detection. Keep the original facial features, expressions, and age intact with no changes to identity Transform the person into an ancient Egyptian (Pharaonic) character, wearing traditional royal or noble clothing from the Pharaonic era:– For men: dress in a linen kilt, wide beaded collar, royal headdress (nemes or khepresh), and sandals.– For women: dress in a white linen dress with gold accessories, wide beaded collar, and a decorative headdress or braided hairstyle.Set the scene in an ancient Egyptian environment — like beside a temple, on the Nile riverbank, or in front of pyramids — under warm golden sunlight.Style should be culturally respectful, semi-realistic, and slightly exaggerated in the expressive and colorful style of Pixar or animated film characters",
  "basha": "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style.Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as \"El Basha\" (الباشا بالطاربوش) — a noble or upper-class Egyptian figure from the early 20th century: Dress each person in an elegant dark suit or traditional Egyptian formal wear appropriate to their gender, status, and time period. Add a red tarboosh (fez) to each character. Optional accessories may include a classic cane, monocle, or pocket watch, depending on the person's age and look. For women, adapt the look to match elite fashion of early 1900s Egyptian aristocratic women — refined dresses, tasteful jewelry, elegant hairstyles or headwear that align with cultural norms of the time. Set the scene in a refined background inspired by early 1900s Cairo or Alexandria, including: Old mansions or royal palaces Vintage cafés or French-style shops Historic tram lines Cobblestone streets under warm, golden vintage lighting The art style should be: Slightly exaggerated and emotionally expressive like Pixar or DreamWorks Refined, culturally respectful, and dignified With clean, detailed rendering and a warm, nostalgic tone",
  "beach": "Automatically detect all people in the image using face and age detection. For each individual detected — and only those individuals — generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Do not invent or add any people who are not present in the image. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled for a summery, joyful Mediterranean or Egyptian beach scene: Dress each person in relaxed and culturally-appropriate beachwear that reflects their age and gender. For men: casual short-sleeve shirts, tank tops, swim trunks, sandals, straw hats, or sunglasses. For women (non-hijabi): stylish yet modest summer dresses, beach wraps, swimwear with light cover-ups, wide-brimmed hats, or colorful scarves. For hijabi women: modern, modest beachwear such as colorful burkinis or lightweight tunics with swim-appropriate hijabs or light scarves. For children or elders: simple, age-appropriate summer clothing with light beach accessories like sandals, towels, or sun hats. Optional items (if appropriate): sunglasses, beach bags, ice cream cones, floaties, or books. Set the scene in a warm, sunny coastal environment inspired by Mediterranean or Egyptian beaches, featuring golden sand, clear waves, palm trees, colorful umbrellas, and relaxed seaside cafés. Ensure the background is peaceful and realistic — do not add people or fictional characters beyond those detected in the original photo. The art style should be slightly exaggerated and emotionally expressive, like Pixar or DreamWorks; rendered in a bright, clean, and vibrant animation style that captures warmth, fun, and cultural authenticity."
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

    // Get the appropriate prompt for the style
    const prompt = avatarPrompts[style] || avatarPrompts["pixar"];
    console.log("Using prompt for style:", style, "- Prompt length:", prompt.length);

    // Create the full prompt that includes the input image as context
    const fullPrompt = `${prompt}

Based on the provided input image, create a new stylized avatar following the specifications above. The generated avatar should maintain the person's identity while applying the requested transformation style.`;

    console.log("Avatar generation started:", { style, promptLength: fullPrompt.length });

    // Call OpenAI Image Generations API with gpt-image-1 and vision input
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
                text: fullPrompt
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
        max_tokens: 1000
      }),
    });

    const responseData = await response.json();
    console.log("OpenAI Chat API response status:", response.status);

    if (!response.ok) {
      console.error("OpenAI API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar with prompt",
          details: responseData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`,
          openai_error: responseData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Now use the generated description to create an image with DALL-E
    const description = responseData.choices[0].message.content;
    console.log("Generated description for image:", description.substring(0, 200) + "...");

    // Generate the actual image using the description
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: description,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      }),
    });

    const imageData = await imageResponse.json();
    console.log("OpenAI Image Generation API response status:", imageResponse.status);

    if (!imageResponse.ok) {
      console.error("OpenAI Image API error details:", {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        error: imageData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to generate avatar image",
          details: imageData.error?.message || `OpenAI Image API error: ${imageResponse.status} ${imageResponse.statusText}`,
          openai_error: imageData,
        }),
        {
          status: imageResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!imageData?.data?.[0]?.b64_json) {
      throw new Error("No image data received from OpenAI Image Generation API");
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
