import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phoneNumber: string;
  message: string;
  imageData: string; // base64 image data
  instanceId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, imageData, instanceId }: WhatsAppRequest = await req.json();

    // Get the API token from secrets
    const token = Deno.env.get('ULTRAMSG_API_TOKEN');
    if (!token) {
      throw new Error('UltraMsg API token not configured');
    }

    // Validate required fields
    if (!phoneNumber || !imageData || !instanceId) {
      throw new Error('Missing required fields: phoneNumber, imageData, or instanceId');
    }

    // Convert base64 to blob for image upload
    const base64Data = imageData.split(',')[1] || imageData;
    const imageBlob = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)));

    // Create form data for the API request
    const formData = new FormData();
    formData.append('token', token);
    formData.append('to', phoneNumber);
    formData.append('image', new Blob([imageBlob], { type: 'image/jpeg' }), 'photo.jpg');
    
    if (message) {
      formData.append('caption', message);
    }

    // Send image via UltraMsg API
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/image`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API request failed with status ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('WhatsApp send error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});