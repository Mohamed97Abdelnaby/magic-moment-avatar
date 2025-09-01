import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Static configuration
const INSTANCE_ID = "instance136415";
const API_TOKEN = "19cdejkhli8lwz4d";
const DEFAULT_MESSAGE = "Check out my awesome avatar! 🎨✨";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phoneNumber, imageData, caption } = await req.json();

    console.log("WhatsApp request received:", {
      phoneNumber: phoneNumber?.slice(0, 5) + "***",
      instanceId: INSTANCE_ID,
      hasImage: !!imageData
    });

    // Validate required fields
    if (!phoneNumber || !imageData) {
      const missing = [];
      if (!phoneNumber) missing.push("phoneNumber");
      if (!imageData) missing.push("imageData");
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    // Clean and format phone number
    let cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;
    console.log("Phone formatted:", cleanPhone.slice(0, 5) + "***");

    // Prepare base64 for UltraMsg
    let imageBase64 = imageData;
    if (imageBase64.startsWith("data:image")) {
      imageBase64 = imageBase64.split(",")[1];
    }

    // Prepare payload
    const params = new URLSearchParams();
    params.append("token", API_TOKEN);
    params.append("to", cleanPhone);
    params.append("image", imageBase64);
    params.append("caption", caption || DEFAULT_MESSAGE);

    console.log("Sending request to UltraMsg API...");
    const apiUrl = `https://api.ultramsg.com/${INSTANCE_ID}/messages/image`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.json();
    console.log("UltraMsg response:", result);

    if (!response.ok || result.sent === false) {
      throw new Error(result.error || result.message || `API request failed with status ${response.status}`);
    }

    console.log("Message sent successfully!");
    return new Response(JSON.stringify({
      success: true,
      messageId: result.id || result.messageId,
      status: result.status,
      data: result
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("WhatsApp send error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to send WhatsApp message",
      details: error.toString()
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
