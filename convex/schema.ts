import { defineSchema } from "convex/server";
import {
  usersTable,
  orgsTable,
  orgMembersTable,
  commonServicesTable,
  orgServicesTable,
  serviceRequestsTable,
  requestNotesTable,
  documentsTable,
  appointmentsTable,
  auditLogsTable,
} from "./schemas";

export default defineSchema({
  users: usersTable,
  orgs: orgsTable,
  orgMembers: orgMembersTable,
  commonServices: commonServicesTable,
  orgServices: orgServicesTable,
  serviceRequests: serviceRequestsTable,
  requestNotes: requestNotesTable,
  documents: documentsTable,
  appointments: appointmentsTable,
  auditLogs: auditLogsTable,
});

