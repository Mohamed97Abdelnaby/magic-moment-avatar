import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Static configuration
const INSTANCE_ID = "instance136415";
const TOKEN = "19cdejkhli8lwz4d";
const DEFAULT_MESSAGE = "Check out my awesome avatar! 🎨✨";

interface WhatsAppRequest {
  phoneNumber: string;
  imageData: string; // base64 image data
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, imageData }: WhatsAppRequest = await req.json();
    
    console.log('WhatsApp request received:', { 
      phoneNumber: phoneNumber?.substring(0, 5) + '***', 
      instanceId: INSTANCE_ID, 
      hasImage: !!imageData 
    });

    // Validate required fields
    if (!phoneNumber || !imageData) {
      const missing = [];
      if (!phoneNumber) missing.push('phoneNumber');
      if (!imageData) missing.push('imageData');
      console.error('Missing required fields:', missing);
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Clean and format phone number
    let cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (!cleanPhoneNumber.startsWith('+')) {
      cleanPhoneNumber = '+' + cleanPhoneNumber;
    }
    console.log('Phone number formatted:', cleanPhoneNumber.substring(0, 5) + '***');

    console.log('Sending request to UltraMsg API...');
    // Send image via UltraMsg API using form-encoded data
    const apiUrl = `https://api.ultramsg.com/${INSTANCE_ID}/messages/image`;
    console.log('API URL:', apiUrl);

    // Prepare form data
    const params = new URLSearchParams();
    params.append('token', TOKEN);
    params.append('to', cleanPhoneNumber);
    params.append('image', imageData); // Send full data URL with base64
    params.append('caption', DEFAULT_MESSAGE);
    
    console.log('Request payload prepared with token and caption');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log('UltraMsg response status:', response.status);
    const result = await response.json();
    console.log('UltraMsg response data:', result);

    // Check if the response indicates success
    if (!response.ok) {
      console.error('UltraMsg API error:', result);
      throw new Error(result.error || result.message || `API request failed with status ${response.status}`);
    }

    // Additional validation for UltraMsg specific responses
    if (result.sent === false) {
      console.error('UltraMsg reported send failure:', result);
      throw new Error(result.message || 'Message failed to send according to UltraMsg');
    }

    console.log('Message sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        messageId: result.id || result.messageId,
        status: result.status
      }),
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
        error: error.message || 'Failed to send WhatsApp message',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});