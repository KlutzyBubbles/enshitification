/**
 * Common types get a fixed, thematic colour. Anything else falls back to
 * a deterministic hash into the same decay palette, so new/custom `type`
 * values from the data file still look intentional rather than grey.
 */
const KNOWN_TYPE_COLORS: Record<string, string> = {
    "feature-removal": "var(--rust)",
    "price-increase": "var(--sludge)",
    "free-removal": "var(--algae)",
};

const FALLBACK_PALETTE = [
    "var(--rust)",
    "var(--sludge)",
    "var(--algae)",
    "var(--mold)",
    "var(--corrosion)",
];

export function colorForType(type: string): string {
    const key = type.trim().toLowerCase();
    if (KNOWN_TYPE_COLORS[key]) {
        return KNOWN_TYPE_COLORS[key];
    }
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}

export function labelForType(type: string): string {
    return type.trim().replace(/[-_]+/g, " ");
}
