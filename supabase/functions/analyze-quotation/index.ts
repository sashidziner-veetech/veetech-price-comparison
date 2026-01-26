import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  location: z.string().min(1, "Location is required").max(200, "Location too long"),
  productName: z.string().min(1).max(500).optional(),
  specifications: z.string().max(2000).optional(),
  quotedPrice: z.number().min(0).max(999999999).optional(),
  mode: z.enum(['manual', 'quotation']).optional(),
  quotationText: z.string().max(50000).optional(),
}).refine(
  data => data.mode === 'manual' ? !!data.productName : !!data.quotationText,
  { message: 'Either productName (for manual mode) or quotationText is required' }
);

// Safe error messages - never expose internal details
const getSafeErrorMessage = (error: unknown): { message: string; code: string } => {
  console.error('Full error details:', error);
  
  if (error instanceof z.ZodError) {
    return {
      message: 'Invalid input parameters. Please check your request.',
      code: 'VALIDATION_ERROR'
    };
  }
  
  if (error instanceof Error) {
    if (error.message.includes('LOVABLE_API_KEY') || error.message.includes('SUPABASE')) {
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        code: 'SERVICE_CONFIG_ERROR'
      };
    }
    if (error.message.includes('rate limit')) {
      return {
        message: 'Too many requests. Please try again in a moment.',
        code: 'RATE_LIMIT_EXCEEDED'
      };
    }
    if (error.message.includes('AI Gateway') || error.message.includes('upstream')) {
      return {
        message: 'Analysis service unavailable. Please try again later.',
        code: 'UPSTREAM_ERROR'
      };
    }
  }
  
  return {
    message: 'An error occurred processing your request. Please try again.',
    code: 'INTERNAL_ERROR'
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      console.error('Auth validation failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Parse and validate input
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', code: 'INVALID_JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input parameters', 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { quotationText, location, productName, specifications, mode, quotedPrice } = validationResult.data;
    
    console.log('Processing request - Location:', location, 'Mode:', mode || 'quotation');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Different prompts for quotation analysis vs manual product search
    const isManualSearch = mode === 'manual';
    
    const userQuotedPrice = typeof quotedPrice === 'number' ? quotedPrice : 0;
    
    const systemPrompt = isManualSearch 
      ? `You are a price comparison research assistant for India. When given a product name and specifications, you must:

1. Research and provide realistic market price comparisons from vendors in the specified location
2. Include actual vendor names, realistic addresses, phone numbers, and price ranges
3. The user has provided a quoted price of ₹${userQuotedPrice} - include this in quotedItems and summary
4. Return structured data in this exact JSON format:

{
  "quotedItems": [
    {
      "name": "Product name from user",
      "specifications": "User provided specifications",
      "quotedPrice": ${userQuotedPrice}
    }
  ],
  "marketComparisons": [
    {
      "productName": "Product name with model/variant",
      "location": "Specific area/store location",
      "vendorName": "Vendor/Store name",
      "priceRange": { "min": 1000, "max": 1500 },
      "address": "Full address",
      "phone": "Contact number",
      "website": "https://vendorwebsite.com or null if not available",
      "notes": "Specifications, availability notes, special offers etc."
    }
  ],
  "summary": {
    "totalQuotedAmount": ${userQuotedPrice},
    "estimatedMarketRange": { "min": 10000, "max": 15000 },
    "recommendation": "Brief recommendation comparing the quoted price ₹${userQuotedPrice} against market prices"
  }
}

Provide 5-10 realistic vendor comparisons. Include department stores, local shops, authorized dealers, and online marketplaces commonly found in Indian cities. Use INR (₹) for all prices. Make vendor names, addresses and phone numbers realistic for the specified location.`
      : `You are a price comparison research assistant for India. When given a product quotation, you must:
1. Extract all products/items from the quotation with their prices
2. Research and provide realistic market price comparisons from other vendors in the specified location
3. Return structured data in this exact JSON format:

{
  "quotedItems": [
    {
      "name": "Product name from quotation",
      "specifications": "Brand, model, size, quantity, etc.",
      "quotedPrice": 1234.56,
      "hsnSac": "HSN/SAC code if available"
    }
  ],
  "marketComparisons": [
    {
      "productName": "Product name",
      "location": "Specific area/store location",
      "vendorName": "Vendor/Store name",
      "priceRange": { "min": 1000, "max": 1500 },
      "address": "Full address",
      "phone": "Contact number if known",
      "website": "https://vendorwebsite.com or null if not available",
      "notes": "Any relevant notes about availability, quality, etc."
    }
  ],
  "summary": {
    "totalQuotedAmount": 12345.67,
    "estimatedMarketRange": { "min": 10000, "max": 15000 },
    "recommendation": "Brief recommendation about the quotation value"
  }
}

Be realistic and provide credible vendor names and locations for the Indian market. Include department stores, local shops, and online marketplaces commonly found in Indian cities. Use INR (₹) for all prices.`;

    // Build the user message based on mode - sanitize inputs
    const sanitizedLocation = location.slice(0, 200);
    const sanitizedProductName = productName?.slice(0, 500) || '';
    const sanitizedSpecifications = specifications?.slice(0, 2000) || 'None specified';
    const sanitizedQuotationText = quotationText?.slice(0, 50000) || '';

    const userMessage = isManualSearch
      ? `Find market prices for this product in location: ${sanitizedLocation}

Product Name: ${sanitizedProductName}
Specific Requirements: ${sanitizedSpecifications}

Please provide realistic vendor comparisons with actual store names, addresses, and contact numbers for this location.`
      : `Analyze this quotation for location: ${sanitizedLocation}\n\nQuotation Content:\n${sanitizedQuotationText}`;

    console.log('Sending request to AI gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.', code: 'RATE_LIMIT' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service quota exceeded. Please try again later.', code: 'QUOTA_EXCEEDED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI Gateway upstream error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response received, length:', content?.length || 0);

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw content if parsing fails
      analysisResult = { rawContent: content, parseError: true };
    }

    return new Response(
      JSON.stringify({ success: true, data: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const safeError = getSafeErrorMessage(error);
    return new Response(
      JSON.stringify({ error: safeError.message, code: safeError.code }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
