import { BIOMARKER_CONTENT } from "@/data/biomarkerContent";

/**
 * Maps a raw label as printed on a lab report to a canonical biomarker key.
 *
 * Deliberately EXACT-match-after-normalization only. There is no fuzzy
 * matching, no edit distance, no "closest guess." Mapping "Free T3" to
 * free_t4 because they're one character apart would attach a value to the
 * wrong biomarker and chart it against the wrong history — a worse failure
 * than showing an unmatched row for the user to resolve. Unmatched labels
 * return null and are stored verbatim.
 */

/** Lowercase, strip punctuation/whitespace variance, so "T4, Free" and "t4 free" both match. */
export function normalizeLabel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[(),./\\:;'"\-–—_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIAS_INDEX: Map<string, string> = (() => {
  const index = new Map<string, string>();
  for (const entry of BIOMARKER_CONTENT) {
    const labels = [entry.displayName, ...entry.aliases];
    for (const label of labels) {
      const key = normalizeLabel(label);
      if (!key) continue;
      const existing = index.get(key);
      if (existing && existing !== entry.biomarkerKey) {
        // Two biomarkers claiming the same normalized alias is a data bug —
        // resolving it silently would misfile results. Keep the first and
        // let the test suite catch it.
        continue;
      }
      index.set(key, entry.biomarkerKey);
    }
  }
  return index;
})();

/** Returns the canonical biomarker key for a printed label, or null if unrecognized. */
export function matchBiomarkerKey(rawLabel: string): string | null {
  const normalized = normalizeLabel(rawLabel);
  if (!normalized) return null;
  return ALIAS_INDEX.get(normalized) ?? null;
}

/** Every normalized alias currently claimed, for duplicate detection in tests. */
export function allNormalizedAliases(): { alias: string; biomarkerKey: string }[] {
  const out: { alias: string; biomarkerKey: string }[] = [];
  for (const entry of BIOMARKER_CONTENT) {
    for (const label of [entry.displayName, ...entry.aliases]) {
      const normalized = normalizeLabel(label);
      if (normalized) out.push({ alias: normalized, biomarkerKey: entry.biomarkerKey });
    }
  }
  return out;
}

/**
 * Unit ambiguity check. The spec is explicit: never silently convert an
 * ambiguous unit. If the extracted unit doesn't match either the
 * conventional or SI unit this app knows for that biomarker, we do NOT
 * convert — we flag it so the user confirms.
 */
export function isKnownUnit(biomarkerKey: string, unit: string): boolean {
  const entry = BIOMARKER_CONTENT.find((b) => b.biomarkerKey === biomarkerKey);
  if (!entry) return false;
  const normalized = normalizeUnit(unit);
  return (
    normalized === normalizeUnit(entry.conventionalUnit) ||
    normalized === normalizeUnit(entry.siUnit)
  );
}

/** Units vary cosmetically across labs (uIU vs µIU, x10E3 vs x10^3). */
export function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/µ|μ/g, "u")
    .replace(/\s+/g, "")
    .replace(/\*/g, "")
    .replace(/x10e(\d)/g, "x10^$1")
    .replace(/10\*(\d)/g, "10^$1");
}
