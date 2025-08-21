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
    
    console.log('WhatsApp request received:', { phoneNumber: phoneNumber?.substring(0, 5) + '***', instanceId, hasImage: !!imageData });

    // Get the API token from secrets
    const token = Deno.env.get('ULTRAMSG_API_TOKEN');
    if (!token) {
      console.error('UltraMsg API token not found in environment');
      throw new Error('UltraMsg API token not configured');
    }
    console.log('API token retrieved successfully');

    // Validate required fields
    if (!phoneNumber || !imageData || !instanceId) {
      const missing = [];
      if (!phoneNumber) missing.push('phoneNumber');
      if (!imageData) missing.push('imageData');
      if (!instanceId) missing.push('instanceId');
      console.error('Missing required fields:', missing);
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Clean and format phone number
    let cleanPhoneNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (!cleanPhoneNumber.startsWith('+')) {
      cleanPhoneNumber = '+' + cleanPhoneNumber;
    }
    console.log('Phone number formatted:', cleanPhoneNumber.substring(0, 5) + '***');

    // Process and validate image data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    console.log('Base64 data preview:', base64Data.slice(0, 50) + '...');
    
    // Validate base64 and estimate size
    try {
      const imageBlob = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)));
      console.log('Image processed, size:', imageBlob.length, 'bytes');
      
      // Check image size (UltraMsg has limits)
      if (imageBlob.length > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image too large. Please use a smaller image (max 5MB)');
      }
    } catch (error) {
      console.error('Base64 validation failed:', error);
      throw new Error('Invalid image data format');
    }

    console.log('Sending request to UltraMsg API...');
    // Send image via UltraMsg API with token in URL (as required by UltraMsg)
    const apiUrl = `https://api.ultramsg.com/${instanceId}/messages/image?token=${encodeURIComponent(token)}`;
    console.log('API URL constructed:', apiUrl.replace(token, '***TOKEN***'));
    console.log('Token length:', token?.length || 0);
    console.log('Instance ID:', instanceId);

    // Try URL-encoded format first (common for UltraMsg)
    const params = new URLSearchParams();
    params.append('to', cleanPhoneNumber);
    params.append('image', imageData); // Send full data URL or base64
    if (message) {
      params.append('caption', message);
      console.log('Message caption added');
    }
    
    console.log('Request payload preview:', params.toString().slice(0, 200) + '...');
    
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