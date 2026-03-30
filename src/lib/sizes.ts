// US Men → EU
const US_TO_EU: Record<string, string> = {
  "5":    "37.5",
  "5.5":  "38",
  "6":    "38.5",
  "6.5":  "39",
  "7":    "40",
  "7.5":  "40.5",
  "8":    "41",
  "8.5":  "42",
  "9":    "42.5",
  "9.5":  "43",
  "10":   "44",
  "10.5": "44.5",
  "11":   "45",
  "11.5": "45.5",
  "12":   "46",
  "12.5": "46.5",
  "13":   "47",
  "14":   "48",
};

// EU → US Men (reverse)
const EU_TO_US: Record<string, string> = Object.fromEntries(
  Object.entries(US_TO_EU).map(([us, eu]) => [eu, us])
);

/** Convert a US size string to EU. Returns the original if not found. */
export function usToEu(usSize: string): string {
  return US_TO_EU[usSize] ?? usSize;
}

/** Convert an EU size string to US. Returns the original if not found. */
export function euToUs(euSize: string): string {
  return EU_TO_US[euSize] ?? euSize;
}

/**
 * Check if a variant's stored size matches a saved EU size.
 * Handles both "EU size stored" and "US size stored" formats.
 */
export function sizeMatchesSaved(variantSize: string, savedEuSize: string): boolean {
  if (!savedEuSize) return false;
  // Direct match (EU stored in DB)
  if (variantSize === savedEuSize) return true;
  // US stored in DB → convert to EU and compare
  if (usToEu(variantSize) === savedEuSize) return true;
  return false;
}

/** Display label for a variant size — always shows EU. */
export function displaySize(variantSize: string): string {
  const eu = US_TO_EU[variantSize];
  return eu ?? variantSize; // if already EU or unknown, show as-is
}
