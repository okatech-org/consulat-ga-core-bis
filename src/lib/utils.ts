import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CountryCode } from "@convex/lib/constants"
import { type ComboboxOption } from "@/components/ui/combobox"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCountryOptions(locale = 'fr'): ComboboxOption<CountryCode>[] {
  const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
  
  return Object.values(CountryCode).map((code) => {
    const flag = code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    return {
      value: code,
      label: displayNames.of(code) || code,
      icon: flag
    }
  }).sort((a, b) => a.label.localeCompare(b.label, locale))
}
