import { countryDialCodes } from "./constants";
import { CountryCode } from "./types";

export function getCountryDialCode(countryCode: CountryCode) {
    return countryDialCodes.find((code) => code.code === countryCode)?.dial_code;
}

export function getCountryCodeFromPhoneNumber(phoneNumber: string) {
    return countryDialCodes.find((code) => phoneNumber.startsWith(`+${code.dial_code}`))?.code;
}