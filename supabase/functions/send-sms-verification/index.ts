
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phone: string;
  action: 'send' | 'verify';
  code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { phone, action, code }: SMSRequest = await req.json();

    if (action === 'send') {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code in database
      const { error: dbError } = await supabaseClient
        .from('sms_verification_codes')
        .insert({
          phone: phone,
          code: verificationCode
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to store verification code');
      }

      // Send SMS using Twilio
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const body = new URLSearchParams({
        To: phone,
        From: twilioPhone!,
        Body: `Your Employee Portal verification code is: ${verificationCode}. This code expires in 10 minutes.`
      });

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!twilioResponse.ok) {
        const errorText = await twilioResponse.text();
        console.error('Twilio error:', errorText);
        throw new Error('Failed to send SMS');
      }

      console.log('SMS sent successfully to:', phone);

      return new Response(
        JSON.stringify({ success: true, message: 'Verification code sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'verify') {
      // Verify the code
      const { data: verificationRecord, error: queryError } = await supabaseClient
        .from('sms_verification_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        console.error('Query error:', queryError);
        throw new Error('Failed to verify code');
      }

      if (!verificationRecord) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid or expired verification code' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Mark code as used
      const { error: updateError } = await supabaseClient
        .from('sms_verification_codes')
        .update({ used: true })
        .eq('id', verificationRecord.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to mark code as used');
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Code verified successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('Error in send-sms-verification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
