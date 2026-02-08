/**
 * Backfill migration for Aggregate component.
 *
 * Populates the 4 aggregate B-trees from existing table data.
 * Uses idempotent operations so it's safe to re-run.
 *
 * Run via Convex dashboard: npx convex run migrations/backfillAggregates:backfill
 */
import { internalMutation } from "../_generated/server";
import {
  requestsByOrg,
  membershipsByOrg,
  orgServicesByOrg,
  globalCounts,
} from "../lib/aggregates";

const BATCH_SIZE = 200;

/**
 * Main backfill entry point — processes all 4 tables.
 * Uses cursor-based pagination to handle large datasets within Convex limits.
 */
export const backfill = internalMutation({
  args: {},
  handler: async (ctx) => {
    let totalProcessed = 0;

    // 1. Backfill requests → requestsByOrg
    let requests = await ctx.db.query("requests").take(BATCH_SIZE);
    while (requests.length > 0) {
      for (const doc of requests) {
        await requestsByOrg.insertIfDoesNotExist(ctx, doc);
      }
      totalProcessed += requests.length;
      if (requests.length < BATCH_SIZE) break;
      const lastId = requests[requests.length - 1]._id;
      requests = await ctx.db
        .query("requests")
        .filter((q) => q.gt(q.field("_id"), lastId))
        .take(BATCH_SIZE);
    }
    console.log(`Backfilled ${totalProcessed} requests`);

    // 2. Backfill memberships → membershipsByOrg
    totalProcessed = 0;
    let memberships = await ctx.db.query("memberships").take(BATCH_SIZE);
    while (memberships.length > 0) {
      for (const doc of memberships) {
        await membershipsByOrg.insertIfDoesNotExist(ctx, doc);
      }
      totalProcessed += memberships.length;
      if (memberships.length < BATCH_SIZE) break;
      const lastId = memberships[memberships.length - 1]._id;
      memberships = await ctx.db
        .query("memberships")
        .filter((q) => q.gt(q.field("_id"), lastId))
        .take(BATCH_SIZE);
    }
    console.log(`Backfilled ${totalProcessed} memberships`);

    // 3. Backfill orgServices → orgServicesByOrg
    totalProcessed = 0;
    let orgServices = await ctx.db.query("orgServices").take(BATCH_SIZE);
    while (orgServices.length > 0) {
      for (const doc of orgServices) {
        await orgServicesByOrg.insertIfDoesNotExist(ctx, doc);
      }
      totalProcessed += orgServices.length;
      if (orgServices.length < BATCH_SIZE) break;
      const lastId = orgServices[orgServices.length - 1]._id;
      orgServices = await ctx.db
        .query("orgServices")
        .filter((q) => q.gt(q.field("_id"), lastId))
        .take(BATCH_SIZE);
    }
    console.log(`Backfilled ${totalProcessed} orgServices`);

    // 4. Backfill users → globalCounts
    totalProcessed = 0;
    let users = await ctx.db.query("users").take(BATCH_SIZE);
    while (users.length > 0) {
      for (const doc of users) {
        await globalCounts.insertIfDoesNotExist(ctx, doc);
      }
      totalProcessed += users.length;
      if (users.length < BATCH_SIZE) break;
      const lastId = users[users.length - 1]._id;
      users = await ctx.db
        .query("users")
        .filter((q) => q.gt(q.field("_id"), lastId))
        .take(BATCH_SIZE);
    }
    console.log(`Backfilled ${totalProcessed} users`);

    console.log("✅ All aggregates backfilled successfully");
  },
});

/**
 * Clear all aggregate data — use only if you need to re-init from scratch.
 */
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    await requestsByOrg.clearAll(ctx);
    await membershipsByOrg.clearAll(ctx);
    await orgServicesByOrg.clearAll(ctx);
    await globalCounts.clearAll(ctx);
    console.log("🗑️ All aggregates cleared");
  },
});
