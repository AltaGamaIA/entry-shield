"use server";

/**
 * Triggers an external webhoook (like Slack, Discord, or Twilio) 
 * when a critical security event happens (e.g., Ban List match, Minor denied).
 */
export async function triggerSecurityAlert(visitorName: string, reason: string, propertyId?: string) {
  const webhookUrl = process.env.SECURITY_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("[WEBHOOK MOCK] Security Alert Triggered:", { visitorName, reason, propertyId });
    console.log("To send real requests, set SECURITY_WEBHOOK_URL in your .env");
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      text: `🚨 *ALERTA DE SEGURIDAD EntryShield* 🚨\n*Visitante:* ${visitorName}\n*Motivo:* ${reason}\n*ID Propiedad:* ${propertyId || 'Global'}\n*Hora:* ${new Date().toLocaleString()}`,
      visitor: visitorName,
      incident: reason,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return { success: true, simulated: false };
  } catch (error) {
    console.error("Failed to trigger security webhook:", error);
    return { success: false, error: "Failed to send webhook" };
  }
}
