import type { NormalizedEvent } from "./types.js";

export interface FilterState {
    search: string;
    activeTypes: Set<string>;
}

export function uniqueTypes(events: NormalizedEvent[]): string[] {
    const seen = new Set<string>();
    events.forEach((event) => seen.add(event.type));
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function applyFilters(
    events: NormalizedEvent[],
    filters: FilterState,
): NormalizedEvent[] {
    const query = filters.search.trim().toLowerCase();

    return events.filter((event) => {
        if (
            filters.activeTypes.size > 0 &&
            !filters.activeTypes.has(event.type)
        ) {
            return false;
        }
        if (!query) return true;

        const haystack = [
            event.title,
            event.description,
            event.companyRef.name,
            event.type,
        ]
            .join(" ")
            .toLowerCase();
        return haystack.includes(query);
    });
}
