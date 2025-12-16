// Client-side safe stub for getLogisticsForecast.
// The real Gemini (Google GenAI) SDK is server-side and shouldn't be imported into the browser bundle.
// For development and client-side usage we return a mock analysis. Replace with a server-side
// endpoint if you want real AI results.

interface AnalysisContext {
  totalShipments: number;
  revenue: number;
  activeIncidents: number;
  recentDestinations: string[];
}

export const getLogisticsForecast = async (context: AnalysisContext): Promise<string> => {
  console.warn('getLogisticsForecast: returning mock response (Gemini disabled in client bundle)');
  const summary = `Executive Summary:\n- Shipments this period: ${context.totalShipments}\n- Revenue: €${context.revenue.toLocaleString()}\n- Active incidents: ${context.activeIncidents}\n\nForecast (7 days):\nExpect stable demand with slight growth to major destinations: ${context.recentDestinations.join(', ')}. Plan for an approximate 5-10% increase in weekly shipments.\n\nRecommendations:\n1) Rebalance capacity to high-demand routes.\n2) Increase preventive checks during peak days to reduce incidents.\n3) Prioritize digital handoffs to reduce delays.`;
  // Simulate latency similar to an API call
  await new Promise((res) => setTimeout(res, 700));
  return summary;
};
