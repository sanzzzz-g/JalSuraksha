import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { region, population, avgTemp, avgRainfall } = await req.json();
    if (!region) {
      return new Response(JSON.stringify({ error: "Region is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a water security and drought prediction expert. Given regional parameters, provide a structured drought risk assessment. You MUST respond using the provided tool.`;

    const userPrompt = `Analyze drought risk and water security for:
- Region: ${region}
- Population: ${population}
- Average Temperature: ${avgTemp}°C
- Average Annual Rainfall: ${avgRainfall}mm

Provide drought risk level, rainfall forecast, water security score (0-100), detailed analysis, and actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "drought_prediction",
            description: "Return structured drought prediction results",
            parameters: {
              type: "object",
              properties: {
                droughtRisk: { type: "string", description: "Risk level: Low, Moderate, High, or Severe" },
                rainfallForecast: { type: "string", description: "Brief rainfall forecast, e.g., 'Below Average'" },
                waterSecurityScore: { type: "number", description: "Water security score from 0-100" },
                details: { type: "string", description: "Detailed analysis paragraph" },
                recommendations: { type: "array", items: { type: "string" }, description: "3-5 actionable recommendations" },
              },
              required: ["droughtRisk", "rainfallForecast", "waterSecurityScore", "details", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "drought_prediction" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted, please add funds" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error: " + status);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
