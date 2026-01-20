export const CountryCode = {
  GA: "GA",
  FR: "FR",
  // Add others as needed
} as const;
export type CountryCode = (typeof CountryCode)[keyof typeof CountryCode];
