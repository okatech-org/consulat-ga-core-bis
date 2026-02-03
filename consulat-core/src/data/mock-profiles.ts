import { LegacyProfile as Profile } from "@/types/profile";
import { ConsularRole } from "@/types/consular-roles";
import { MOCK_ORGANIZATIONS } from "./mock-organizations";

export const MOCK_PROFILES: Profile[] = [
    {
        id: "user-1",
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@consulat-gabon-france.com",
        role: ConsularRole.CONSUL_GENERAL,
        organization_id: "fr-consulat-paris",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: {
            name: MOCK_ORGANIZATIONS[0].name,
            metadata: MOCK_ORGANIZATIONS[0].metadata
        }
    },
    {
        id: "user-2",
        first_name: "Marie",
        last_name: "Curie",
        email: "marie.curie@gabonembassyusa.org",
        role: ConsularRole.CONSUL,
        organization_id: "us-ambassade-washington",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: {
            name: MOCK_ORGANIZATIONS[1].name,
            metadata: MOCK_ORGANIZATIONS[1].metadata
        }
    },
    {
        id: "user-3",
        first_name: "Pierre",
        last_name: "Martin",
        email: "pierre.martin@example.com",
        role: ConsularRole.CITIZEN,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
