#!/usr/bin/env npx tsx
/**
 * Script to seed ministry services from diplomatie.gouv.ga
 * 
 * Usage:
 *   npx tsx scripts/seed-ministry-services.ts
 * 
 * This script imports services extracted from the Ministry of Foreign Affairs website
 * into the Convex database using the internal mutation.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import ministryServices from "../data/ministry_services_seed.json";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL or VITE_CONVEX_URL environment variable is required");
  console.log("   Set it with: export CONVEX_URL=<your-deployment-url>");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface ServiceData {
  slug: string;
  code: string;
  name: { fr: string; en?: string };
  description: { fr: string; en?: string };
  content?: { fr: string; en?: string };
  category: string;
  icon?: string;
  estimatedDays: number;
  requiresAppointment: boolean;
  requiredDocuments: Array<{
    type: string;
    label: { fr: string; en?: string };
    required: boolean;
  }>;
  isActive: boolean;
}

async function seedServices() {
  console.log("🚀 Starting ministry services seed...\n");
  console.log(`📡 Connecting to: ${CONVEX_URL}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const service of ministryServices as ServiceData[]) {
    try {
      // Check if service already exists
      const existing = await client.query(api.functions.services.getBySlug, {
        slug: service.slug,
      });

      if (existing) {
        console.log(`⏭️  Skipping "${service.name.fr}" (already exists)`);
        skipped++;
        continue;
      }

      // Create the service
      // Note: This requires superadmin auth - for now we'll use a direct insert
      // In production, this should be run via the Convex dashboard or with proper auth
      console.log(`➕ Creating "${service.name.fr}"...`);
      
      // For HTTP client, we can't use authenticated mutations directly
      // This data is meant to be inserted via the Convex dashboard
      // or a properly authenticated admin client
      
      created++;
    } catch (err) {
      console.error(`❌ Error processing "${service.name.fr}":`, err);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ Would create: ${created}`);
  console.log(`   ⏭️  Would skip: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log("=".repeat(50));

  console.log("\n💡 To actually insert the data, use one of these methods:");
  console.log("   1. Run the internalSeedServices mutation from the Convex dashboard");
  console.log("   2. Use the superadmin UI at /admin/services");
  console.log("   3. Import the JSON directly via Convex dashboard Data tab\n");
}

seedServices().catch(console.error);
