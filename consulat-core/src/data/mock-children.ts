import { ChildProfile, ParentalRole, ProfileStatus } from "@/types/auth/child";
import { MOCK_GABONAIS_CITIZENS } from "./mock-citizens";

const parent = MOCK_GABONAIS_CITIZENS[0];

export const MOCK_CHILDREN: ChildProfile[] = [
    {
        id: "CHILD-001",
        authorUserId: parent.id,
        status: ProfileStatus.ACTIVE,
        residenceCountry: "FR",
        personal: {
            firstName: "Junior",
            lastName: "Mba",
            birthDate: new Date("2015-06-10"),
            birthPlace: "Paris",
            birthCountry: "FR",
            gender: "M",
            nationality: "GA",
            acquisitionMode: "BIRTH"
        },
        parents: [
            {
                profileId: parent.id,
                role: ParentalRole.FATHER,
                firstName: parent.firstName,
                lastName: parent.lastName,
                email: parent.email,
                phoneNumber: parent.phone,
                address: parent.currentAddress
            }
        ],
        documents: {
            identityPicture: { id: "DOC-001", fileUrl: "/mock/child-photo.jpg" }
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20")
    }
];
