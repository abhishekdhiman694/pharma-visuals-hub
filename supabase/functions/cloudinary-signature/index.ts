import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function toHex(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return toHex(digest);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { folder } = await req.json().catch(() => ({ folder: 'products' }));

    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME') ?? Deno.env.get('CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY') ?? Deno.env.get('API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET') ?? Deno.env.get('API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary secrets.');
      return new Response(
        JSON.stringify({ error: 'Cloudinary is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build string to sign: params sorted alphabetically, exclude file/signature
    // We'll sign only the minimal required fields: folder and timestamp
    const params: Record<string, string> = { timestamp: String(timestamp) };
    if (folder) params.folder = String(folder);

    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const signature = await sha1Hex(`${toSign}${apiSecret}`);

    const payload = {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder: folder || 'products',
    };

    return new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (e) {
    console.error('cloudinary-signature error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
});
