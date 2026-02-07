import { internalMutation } from "../_generated/server";

/**
 * Migration: Move formSchema from orgServices to their parent services.
 *
 * After running this, the `formSchema` field can be removed from the
 * orgServices schema entirely.
 *
 * Run via Convex dashboard or CLI:
 *   npx convex run functions/migrations:migrateFormSchemaToServices --prod
 */
export const migrateFormSchemaToServices = internalMutation({
  args: {},
  handler: async (ctx) => {
    const orgServices = await ctx.db.query("orgServices").collect();

    let migrated = 0;
    let skipped = 0;

    for (const orgService of orgServices) {
      // Skip if no formSchema on orgService
      if (!orgService.formSchema) {
        skipped++;
        continue;
      }

      // Get the parent service
      const service = await ctx.db.get(orgService.serviceId);
      if (!service) {
        console.warn(
          `Service ${orgService.serviceId} not found for orgService ${orgService._id}`,
        );
        continue;
      }

      // Only copy if the parent service doesn't already have a formSchema
      if (!service.formSchema) {
        await ctx.db.patch(service._id, {
          formSchema: orgService.formSchema,
          updatedAt: Date.now(),
        });
        console.log(
          `Migrated formSchema from orgService ${orgService._id} to service ${service._id} (${service.name?.fr})`,
        );
      }

      // Clear formSchema from orgService
      await ctx.db.patch(orgService._id, {
        formSchema: undefined,
        updatedAt: Date.now(),
      });

      migrated++;
    }

    console.log(
      `Migration complete: ${migrated} migrated, ${skipped} skipped (no formSchema)`,
    );
    return { migrated, skipped, total: orgServices.length };
  },
});
