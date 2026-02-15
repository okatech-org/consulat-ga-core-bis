import { 
  CountryCode, 

  OrganizationType
} from "../convex/lib/constants";

// Organization
export const consulateFrance = {
  slug: "consulat-general-paris",
  name: "Consulat Général du Gabon en France",
  type: OrganizationType.GeneralConsulate,
  country: CountryCode.FR,
  timezone: "Europe/Paris",
  address: {
    street: "26 bis Avenue Raphaël",
    city: "Paris",
    postalCode: "75016", // schema says postalCode, not zipCode
    country: CountryCode.FR
  },
  email: "contact@consulat.ga", 
  phone: "+33 1 42 99 68 68", 
  website: "https://www.consulatgabonfrance.com",
  description: "Représentation consulaire de la République Gabonaise en France.",
  logoUrl: "https://gabonaisdefrance.org/wp-content/uploads/2023/10/cropped-Logo-CGF-1.png",
  isActive: true,
};
