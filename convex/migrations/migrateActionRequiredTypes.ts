import { internalMutation } from "../_generated/server";

/**
 * Migration: Update actionRequired types
 * Old types: "documents", "info", "payment"
 * New types: "upload_document", "complete_info", "schedule_appointment", "make_payment", "confirm_info"
 */
export const migrateActionRequiredTypes = internalMutation({
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").collect();
    
    const typeMapping: Record<string, string> = {
      "documents": "upload_document",
      "info": "complete_info",
      "payment": "make_payment",
    };
    
    let migrated = 0;
    
    for (const request of requests) {
      if (request.actionRequired && typeMapping[request.actionRequired.type]) {
        await ctx.db.patch(request._id, {
          actionRequired: {
            ...request.actionRequired,
            type: typeMapping[request.actionRequired.type] as any,
          },
        });
        migrated++;
      }
    }
    
    return { migrated };
  },
});
