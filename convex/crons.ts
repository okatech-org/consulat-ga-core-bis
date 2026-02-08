import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// NOTE: refresh-org-stats cron removed — stats are now computed in real-time
// via the Aggregate component (requestsByOrg, membershipsByOrg, orgServicesByOrg).

// Check for expiring documents daily
crons.daily(
  "check-expiring-documents",
  { hourUTC: 8, minuteUTC: 0 }, // Run at 8am UTC
  internal.crons.expiration.checkDocuments,
);

// Send appointment reminders daily at 9am UTC (10am Paris)
crons.daily(
  "send-appointment-reminders",
  { hourUTC: 9, minuteUTC: 0 },
  internal.functions.notifications.sendAppointmentReminders,
);

export default crons;
