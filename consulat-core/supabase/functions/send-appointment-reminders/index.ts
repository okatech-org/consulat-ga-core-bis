import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Appointment {
  id: string;
  citizen_id: string;
  appointment_date: string;
  status: string;
  notes: string | null;
  citizen_email?: string;
  citizen_name?: string;
  service_name?: string;
  organization_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting appointment reminders job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get appointments scheduled for tomorrow (24h reminder)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    console.log(`Looking for appointments between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

    // Fetch appointments with related data
    const { data: appointments, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        id,
        citizen_id,
        appointment_date,
        status,
        notes,
        services:service_id (name),
        organizations:organization_id (name)
      `)
      .gte("appointment_date", tomorrowStart.toISOString())
      .lte("appointment_date", tomorrowEnd.toISOString())
      .in("status", ["SCHEDULED", "CONFIRMED"]);

    if (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments for tomorrow`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No appointments to remind", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profiles for citizens
    const citizenIds = [...new Set(appointments.map(a => a.citizen_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, email")
      .in("user_id", citizenIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    const profilesMap = new Map(
      (profiles || []).map(p => [p.user_id, p])
    );

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const appointment of appointments) {
      const profile = profilesMap.get(appointment.citizen_id);
      
      if (!profile?.email) {
        console.log(`No email found for citizen ${appointment.citizen_id}`);
        continue;
      }

      const appointmentDate = new Date(appointment.appointment_date);
      const formattedDate = appointmentDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const serviceName = (appointment as any).services?.name || "Service consulaire";
      const organizationName = (appointment as any).organizations?.name || "Consulat";

      try {
        const emailResponse = await resend.emails.send({
          from: "Consulat <onboarding@resend.dev>",
          to: [profile.email],
          subject: `Rappel: Votre rendez-vous du ${formattedDate}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
                .appointment-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .info-row { display: flex; margin: 10px 0; }
                .info-label { font-weight: 600; width: 120px; color: #64748b; }
                .info-value { color: #1e293b; }
                .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
                .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🏛️ Rappel de Rendez-vous</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${profile.first_name} ${profile.last_name}</strong>,</p>
                  <p>Nous vous rappelons que vous avez un rendez-vous prévu <strong>demain</strong> :</p>
                  
                  <div class="appointment-card">
                    <div class="info-row">
                      <span class="info-label">📅 Date</span>
                      <span class="info-value">${formattedDate}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">🕐 Heure</span>
                      <span class="info-value">${formattedTime}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">📋 Service</span>
                      <span class="info-value">${serviceName}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">🏢 Lieu</span>
                      <span class="info-value">${organizationName}</span>
                    </div>
                    ${appointment.notes ? `
                    <div class="info-row">
                      <span class="info-label">📝 Notes</span>
                      <span class="info-value">${appointment.notes}</span>
                    </div>
                    ` : ''}
                  </div>
                  
                  <p><strong>Documents à apporter :</strong></p>
                  <ul>
                    <li>Pièce d'identité valide</li>
                    <li>Documents relatifs à votre demande</li>
                    <li>Justificatif de domicile (si applicable)</li>
                  </ul>
                  
                  <p>Merci de vous présenter <strong>15 minutes avant</strong> l'heure de votre rendez-vous.</p>
                  
                  <p style="color: #64748b; font-size: 14px;">
                    En cas d'empêchement, veuillez nous contacter le plus tôt possible pour reprogrammer votre rendez-vous.
                  </p>
                </div>
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
                  <p>© ${new Date().getFullYear()} Réseau Consulaire Gabonais</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${profile.email}:`, emailResponse);

        // Create notification record
        await supabase.from("notifications").insert({
          user_id: appointment.citizen_id,
          type: "appointment_reminder",
          channel: "email",
          status: "sent",
          title: "Rappel de rendez-vous",
          message: `Votre rendez-vous pour ${serviceName} est prévu demain ${formattedDate} à ${formattedTime}`,
          appointment_id: appointment.id,
          sent_at: new Date().toISOString(),
          metadata: { email_response: JSON.stringify(emailResponse) },
        });

        sentCount++;
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        errors.push(`${profile.email}: ${emailError.message}`);
        failedCount++;
      }
    }

    console.log(`Reminder job completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Appointment reminders processed",
        sent: sentCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
