import { defineSchema } from "convex/server";
import {
  usersTable,
  orgsTable,
  orgMembersTable,
  servicesTable,
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
  services: servicesTable,
  serviceRequests: serviceRequestsTable,
  requestNotes: requestNotesTable,
  documents: documentsTable,
  appointments: appointmentsTable,
  auditLogs: auditLogsTable,
});
