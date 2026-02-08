/**
 * Aggregate definitions for denormalized counts/stats.
 *
 * Each TableAggregate keeps a B-tree structure in sync with a source table,
 * enabling O(log n) count/sum/min/max queries instead of full table scans.
 *
 * @see https://www.convex.dev/components/aggregate
 */
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";

// ---------------------------------------------------------------------------
// 1. Requests by Org — count by status, by time range, etc.
//    Namespace: orgId
//    SortKey:   [status, _creationTime]
//    SumValue:  1 (just counting)
// ---------------------------------------------------------------------------
export const requestsByOrg = new TableAggregate<{
  Namespace: string; // orgId as string
  Key: [string, number]; // [status, _creationTime]
  DataModel: DataModel;
  TableName: "requests";
}>(components.requestsByOrg, {
  namespace: (doc) => doc.orgId,
  sortKey: (doc) => [doc.status, doc._creationTime],
});

// ---------------------------------------------------------------------------
// 2. Memberships by Org — count active members per org
//    Namespace: orgId
//    SortKey:   _creationTime
//    Only tracks non-deleted memberships (deletedAt === undefined)
// ---------------------------------------------------------------------------
export const membershipsByOrg = new TableAggregate<{
  Namespace: string; // orgId as string
  Key: number; // _creationTime
  DataModel: DataModel;
  TableName: "memberships";
}>(components.membershipsByOrg, {
  namespace: (doc) => doc.orgId,
  sortKey: (doc) => doc._creationTime,
});

// ---------------------------------------------------------------------------
// 3. OrgServices by Org — count active services per org
//    Namespace: orgId
//    SortKey:   isActive (boolean → 0/1 for sorting)
// ---------------------------------------------------------------------------
export const orgServicesByOrg = new TableAggregate<{
  Namespace: string; // orgId as string
  Key: number; // isActive as 0|1
  DataModel: DataModel;
  TableName: "orgServices";
}>(components.orgServicesByOrg, {
  namespace: (doc) => doc.orgId,
  sortKey: (doc) => (doc.isActive ? 1 : 0),
});

// ---------------------------------------------------------------------------
// 4. Global counts — used by admin dashboard
//    No namespace, sortKey encodes [tableName] for partitioning.
//    We use a standalone Aggregate (not TableAggregate) approach:
//    each table inserts items keyed by table name.
//
//    Actually, we'll use separate TableAggregates per table for simplicity,
//    but since the admin only needs 4 global counts and they're rarely updated,
//    we reuse the existing aggregates:
//      - requests total  → requestsByOrg.count(ctx)      (global, no namespace)
//      - memberships     → membershipsByOrg.count(ctx)    (global, no namespace)
//      - orgServices     → orgServicesByOrg.count(ctx)    (global, no namespace)
//
//    For users + orgs, we create one more instance.
// ---------------------------------------------------------------------------
export const globalCounts = new TableAggregate<{
  Key: number; // _creationTime
  DataModel: DataModel;
  TableName: "users";
}>(components.globalCounts, {
  sortKey: (doc) => doc._creationTime,
});
