import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh org stats every hour
crons.interval(
  "refresh-org-stats",
  { minutes: 60 },
  internal.crons.statsRefresh.refreshAll
);

// Check for expiring documents daily
crons.daily(
  "check-expiring-documents",
  { hourUTC: 8, minuteUTC: 0 }, // Run at 8am UTC
  internal.crons.expiration.checkDocuments
);

// Send appointment reminders daily at 9am UTC (10am Paris)
crons.daily(
  "send-appointment-reminders",
  { hourUTC: 9, minuteUTC: 0 },
  internal.functions.notifications.sendAppointmentReminders
);

export default crons;
