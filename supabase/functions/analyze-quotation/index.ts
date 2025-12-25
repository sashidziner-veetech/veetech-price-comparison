import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quotationText, location } = await req.json();
    
    console.log('Analyzing quotation for location:', location);
    console.log('Quotation text length:', quotationText?.length || 0);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a price comparison research assistant for India. When given a product quotation, you must:

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
          { 
            role: 'user', 
            content: `Analyze this quotation for location: ${location}\n\nQuotation Content:\n${quotationText}` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
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
    console.error('Error in analyze-quotation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze quotation';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
