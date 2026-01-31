/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_chat from "../ai/chat.js";
import type * as ai_documentAnalysis from "../ai/documentAnalysis.js";
import type * as ai_rateLimiter from "../ai/rateLimiter.js";
import type * as ai_tools from "../ai/tools.js";
import type * as crons from "../crons.js";
import type * as crons_expiration from "../crons/expiration.js";
import type * as crons_statsRefresh from "../crons/statsRefresh.js";
import type * as functions_admin from "../functions/admin.js";
import type * as functions_appointments from "../functions/appointments.js";
import type * as functions_documents from "../functions/documents.js";
import type * as functions_events from "../functions/events.js";
import type * as functions_formTemplates from "../functions/formTemplates.js";
import type * as functions_memberships from "../functions/memberships.js";
import type * as functions_orgs from "../functions/orgs.js";
import type * as functions_posts from "../functions/posts.js";
import type * as functions_profiles from "../functions/profiles.js";
import type * as functions_requests from "../functions/requests.js";
import type * as functions_services from "../functions/services.js";
import type * as functions_users from "../functions/users.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_customFunctions from "../lib/customFunctions.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as schemas_conversations from "../schemas/conversations.js";
import type * as schemas_documents from "../schemas/documents.js";
import type * as schemas_events from "../schemas/events.js";
import type * as schemas_formTemplates from "../schemas/formTemplates.js";
import type * as schemas_index from "../schemas/index.js";
import type * as schemas_memberships from "../schemas/memberships.js";
import type * as schemas_orgServices from "../schemas/orgServices.js";
import type * as schemas_orgs from "../schemas/orgs.js";
import type * as schemas_posts from "../schemas/posts.js";
import type * as schemas_profiles from "../schemas/profiles.js";
import type * as schemas_requests from "../schemas/requests.js";
import type * as schemas_services from "../schemas/services.js";
import type * as schemas_users from "../schemas/users.js";
import type * as triggers_index from "../triggers/index.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/chat": typeof ai_chat;
  "ai/documentAnalysis": typeof ai_documentAnalysis;
  "ai/rateLimiter": typeof ai_rateLimiter;
  "ai/tools": typeof ai_tools;
  crons: typeof crons;
  "crons/expiration": typeof crons_expiration;
  "crons/statsRefresh": typeof crons_statsRefresh;
  "functions/admin": typeof functions_admin;
  "functions/appointments": typeof functions_appointments;
  "functions/documents": typeof functions_documents;
  "functions/events": typeof functions_events;
  "functions/formTemplates": typeof functions_formTemplates;
  "functions/memberships": typeof functions_memberships;
  "functions/orgs": typeof functions_orgs;
  "functions/posts": typeof functions_posts;
  "functions/profiles": typeof functions_profiles;
  "functions/requests": typeof functions_requests;
  "functions/services": typeof functions_services;
  "functions/users": typeof functions_users;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/constants": typeof lib_constants;
  "lib/customFunctions": typeof lib_customFunctions;
  "lib/errors": typeof lib_errors;
  "lib/users": typeof lib_users;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  "schemas/conversations": typeof schemas_conversations;
  "schemas/documents": typeof schemas_documents;
  "schemas/events": typeof schemas_events;
  "schemas/formTemplates": typeof schemas_formTemplates;
  "schemas/index": typeof schemas_index;
  "schemas/memberships": typeof schemas_memberships;
  "schemas/orgServices": typeof schemas_orgServices;
  "schemas/orgs": typeof schemas_orgs;
  "schemas/posts": typeof schemas_posts;
  "schemas/profiles": typeof schemas_profiles;
  "schemas/requests": typeof schemas_requests;
  "schemas/services": typeof schemas_services;
  "schemas/users": typeof schemas_users;
  "triggers/index": typeof triggers_index;
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

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
