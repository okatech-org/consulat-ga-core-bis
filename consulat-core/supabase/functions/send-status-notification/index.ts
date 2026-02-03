import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  request_id: string;
  new_status: string;
  old_status?: string;
  citizen_email: string;
  citizen_name: string;
  subject: string;
  notes?: string;
}

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours de traitement",
  AWAITING_DOCUMENTS: "Documents requis",
  VALIDATED: "Validée",
  REJECTED: "Rejetée",
  COMPLETED: "Terminée",
};

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  AWAITING_DOCUMENTS: "#f97316",
  VALIDATED: "#22c55e",
  REJECTED: "#ef4444",
  COMPLETED: "#10b981",
};

function getEmailContent(data: StatusNotificationRequest) {
  const statusLabel = statusLabels[data.new_status] || data.new_status;
  const statusColor = statusColors[data.new_status] || "#6b7280";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Consulat du Gabon</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Mise à jour de votre demande</p>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin-bottom: 20px;">Bonjour <strong>${data.citizen_name}</strong>,</p>
        
        <p style="margin-bottom: 20px;">Le statut de votre demande a été mis à jour :</p>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Objet de la demande :</p>
          <p style="margin: 0 0 15px 0; font-weight: 600; font-size: 16px;">${data.subject}</p>
          
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Nouveau statut :</p>
          <span style="display: inline-block; background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
            ${statusLabel}
          </span>
        </div>
        
        ${data.notes ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 5px 0; font-weight: 600; color: #92400e;">Note de l'agent :</p>
          <p style="margin: 0; color: #92400e;">${data.notes}</p>
        </div>
        ` : ''}
        
        <p style="margin-bottom: 20px;">Vous pouvez suivre l'évolution de votre demande en vous connectant à votre espace personnel.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://consulat.ga/mes-demandes" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Voir ma demande
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Cordialement,<br>
          L'équipe consulaire
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          Consulat du Gabon<br>
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusNotificationRequest = await req.json();
    console.log("Sending status notification email:", { 
      request_id: data.request_id, 
      new_status: data.new_status,
      citizen_email: data.citizen_email 
    });

    const emailResponse = await resend.emails.send({
      from: "Consulat du Gabon <onboarding@resend.dev>",
      to: [data.citizen_email],
      subject: `Mise à jour de votre demande - ${statusLabels[data.new_status] || data.new_status}`,
      html: getEmailContent(data),
    });

    console.log("Email sent successfully:", emailResponse);

    // Also create an in-app notification
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: requestData } = await supabase
      .from("requests")
      .select("citizen_id")
      .eq("id", data.request_id)
      .single();

    if (requestData?.citizen_id) {
      await supabase.from("notifications").insert({
        user_id: requestData.citizen_id,
        type: "updated",
        channel: "app",
        status: "pending",
        title: "Mise à jour de votre demande",
        message: `Le statut de votre demande "${data.subject}" est passé à "${statusLabels[data.new_status] || data.new_status}"`,
        request_id: data.request_id,
        metadata: { new_status: data.new_status, old_status: data.old_status }
      });
      console.log("In-app notification created for user:", requestData.citizen_id);
    }

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
