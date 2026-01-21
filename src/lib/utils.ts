import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CountryCode } from "@/lib/constants"
import { type ComboboxOption } from "@/components/ui/combobox"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCountryOptions(locale = 'fr'): ComboboxOption<CountryCode>[] {
  // Normalize locale (e.g., "fr-FR" -> "fr")
  const normalizedLocale = locale.split('-')[0]
  const displayNames = new Intl.DisplayNames([normalizedLocale], { type: 'region' })
  
  return Object.values(CountryCode).map((code) => {
    try {
      // Try to get the country name using Intl.DisplayNames
      const label = displayNames.of(code) || code
      return {
        value: code,
        label,
      }
    } catch (error) {
      // Fallback to code if Intl.DisplayNames fails
      return {
        value: code,
        label: code,
      }
    }
  }).sort((a, b) => a.label.localeCompare(b.label, normalizedLocale))
}
