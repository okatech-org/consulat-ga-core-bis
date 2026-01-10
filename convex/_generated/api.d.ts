/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as appointments from "../appointments.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as orgRequests from "../orgRequests.js";
import type * as orgServices from "../orgServices.js";
import type * as orgs from "../orgs.js";
import type * as profiles from "../profiles.js";
import type * as schemas_appointments from "../schemas/appointments.js";
import type * as schemas_auditLogs from "../schemas/auditLogs.js";
import type * as schemas_commonServices from "../schemas/commonServices.js";
import type * as schemas_documents from "../schemas/documents.js";
import type * as schemas_index from "../schemas/index.js";
import type * as schemas_orgMembers from "../schemas/orgMembers.js";
import type * as schemas_orgs from "../schemas/orgs.js";
import type * as schemas_profiles from "../schemas/profiles.js";
import type * as schemas_serviceRequests from "../schemas/serviceRequests.js";
import type * as schemas_services from "../schemas/services.js";
import type * as schemas_users from "../schemas/users.js";
import type * as serviceRequests from "../serviceRequests.js";
import type * as services from "../services.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  appointments: typeof appointments;
  documents: typeof documents;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/constants": typeof lib_constants;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/types": typeof lib_types;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  orgRequests: typeof orgRequests;
  orgServices: typeof orgServices;
  orgs: typeof orgs;
  profiles: typeof profiles;
  "schemas/appointments": typeof schemas_appointments;
  "schemas/auditLogs": typeof schemas_auditLogs;
  "schemas/commonServices": typeof schemas_commonServices;
  "schemas/documents": typeof schemas_documents;
  "schemas/index": typeof schemas_index;
  "schemas/orgMembers": typeof schemas_orgMembers;
  "schemas/orgs": typeof schemas_orgs;
  "schemas/profiles": typeof schemas_profiles;
  "schemas/serviceRequests": typeof schemas_serviceRequests;
  "schemas/services": typeof schemas_services;
  "schemas/users": typeof schemas_users;
  serviceRequests: typeof serviceRequests;
  services: typeof services;
  users: typeof users;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
