import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { UserRole } from "./lib/types";

// Mapping of calling codes to country codes (ISO 3166-1 alpha-2)
const callingCodeToCountry: Record<string, string> = {
  "93": "AF", "358": "FI", "355": "AL", "213": "DZ", "1684": "AS", "376": "AD", "244": "AO", "1264": "AI", "672": "NF", "1268": "AG", "54": "AR", "374": "AM", "297": "AW", "61": "AU", "43": "AT", "994": "AZ", "1242": "BS", "973": "BH", "880": "BD", "1246": "BB", "375": "BY", "32": "BE", "501": "BZ", "229": "BJ", "1441": "BM", "975": "BT", "591": "BO", "387": "BA", "267": "BW", "55": "BR", "246": "IO", "673": "BN", "359": "BG", "226": "BF", "257": "BI", "855": "KH", "237": "CM", "1": "US", "238": "CV", "345": "KY", "236": "CF", "235": "TD", "56": "CL", "86": "CN", "57": "CO", "269": "KM", "242": "CG", "243": "CD", "682": "CK", "506": "CR", "225": "CI", "385": "HR", "53": "CU", "357": "CY", "420": "CZ", "45": "DK", "253": "DJ", "1767": "DM", "1849": "DO", "593": "EC", "20": "EG", "503": "SV", "240": "GQ", "291": "ER", "372": "EE", "251": "ET", "500": "GS", "298": "FO", "679": "FJ", "33": "FR", "594": "GF", "689": "PF", "241": "GA", "220": "GM", "995": "GE", "49": "DE", "233": "GH", "350": "GI", "30": "GR", "299": "GL", "1473": "GD", "590": "MF", "1671": "GU", "502": "GT", "44": "GB", "224": "GN", "245": "GW", "595": "PY", "509": "HT", "379": "VA", "504": "HN", "852": "HK", "36": "HU", "354": "IS", "91": "IN", "62": "ID", "98": "IR", "964": "IQ", "353": "IE", "972": "IL", "39": "IT", "1876": "JM", "81": "JP", "962": "JO", "77": "KZ", "254": "KE", "686": "KI", "850": "KP", "82": "KR", "965": "KW", "996": "KG", "856": "LA", "371": "LV", "961": "LB", "266": "LS", "231": "LR", "218": "LY", "423": "LI", "370": "LT", "352": "LU", "853": "MO", "389": "MK", "261": "MG", "265": "MW", "60": "MY", "960": "MV", "223": "ML", "356": "MT", "692": "MH", "596": "MQ", "222": "MR", "230": "MU", "262": "RE", "52": "MX", "691": "FM", "373": "MD", "377": "MC", "976": "MN", "382": "ME", "1664": "MS", "212": "MA", "258": "MZ", "95": "MM", "264": "NA", "674": "NR", "977": "NP", "31": "NL", "599": "AN", "687": "NC", "64": "NZ", "505": "NI", "227": "NE", "234": "NG", "683": "NU", "1670": "MP", "47": "NO", "968": "OM", "92": "PK", "680": "PW", "970": "PS", "507": "PA", "675": "PG", "51": "PE", "63": "PH", "872": "PN", "48": "PL", "351": "PT", "1939": "PR", "974": "QA", "40": "RO", "7": "RU", "250": "RW", "290": "SH", "1869": "KN", "1758": "LC", "508": "PM", "1784": "VC", "685": "WS", "378": "SM", "239": "ST", "966": "SA", "381": "RS", "248": "SC", "232": "SL", "65": "SG", "421": "SK", "386": "SI", "677": "SB", "252": "SO", "27": "ZA", "211": "SS", "34": "ES", "94": "LK", "249": "SD", "597": "SR", "268": "SZ", "46": "SE", "41": "CH", "963": "SY", "886": "TW", "992": "TJ", "255": "TZ", "66": "TH", "670": "TL", "228": "TG", "690": "TK", "676": "TO", "1868": "TT", "216": "TN", "90": "TR", "993": "TM", "1649": "TC", "688": "TV", "256": "UG", "380": "UA", "971": "AE", "598": "UY", "998": "UZ", "678": "VU", "58": "VE", "84": "VN", "1284": "VG", "1340": "VI", "681": "WF", "967": "YE", "260": "ZM", "263": "ZW"
};

function inferCountryFromPhone(phoneNumber: string | undefined): string | undefined {
  if (!phoneNumber) return undefined;
  
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  
  const sortedCodes = Object.keys(callingCodeToCountry).sort((a, b) => b.length - a.length);

  for (const code of sortedCodes) {
    if (cleanPhone.startsWith(code)) {
      return callingCodeToCountry[code];
    }
  }

  return undefined;
}

/**
 * Internal mutation to create or update a user from Clerk webhook data.
 * Called when user.created or user.updated events are received.
 */
export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const residenceCountry = inferCountryFromPhone(args.phoneNumber);

    if (existingUser) {
      const patchData: any = {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        profileImageUrl: args.profileImageUrl,
        updatedAt: Date.now(),
      };
      
      // Update phone and country if provided
      if (args.phoneNumber) {
        patchData.phone = args.phoneNumber;
        if (residenceCountry) {
            patchData.residenceCountry = residenceCountry;
        }
      }

      await ctx.db.patch(existingUser._id, patchData);
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      profileImageUrl: args.profileImageUrl,
      phone: args.phoneNumber,
      residenceCountry: residenceCountry,
      role: UserRole.USER,
      isVerified: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Internal mutation to delete a user from the database.
 * Called when user.deleted events are received from Clerk.
 */
export const deleteUser = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }
  },
});
