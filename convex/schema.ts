import { defineSchema } from "convex/server";
import {
  usersTable,
  orgsTable,
  membershipsTable,
  servicesTable,
  orgServicesTable,
  profilesTable,
  requestsTable,
  eventsTable,
  documentsTable,
  postsTable,
  conversationsTable,
} from "./schemas";

export default defineSchema({
  users: usersTable,
  orgs: orgsTable,
  memberships: membershipsTable,
  services: servicesTable,
  orgServices: orgServicesTable,
  profiles: profilesTable,
  requests: requestsTable,
  events: eventsTable,
  documents: documentsTable,
  posts: postsTable,
  conversations: conversationsTable,
});
