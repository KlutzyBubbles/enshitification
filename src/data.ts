import type {
    Company,
    NormalizedEvent,
    ShittifiedEvent,
    TimelineData,
} from "./types.js";
import { parseDate } from "./dateUtils.js";

export async function loadData(url: string): Promise<TimelineData> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(
            `Failed to load ${url}: ${response.status} ${response.statusText}`,
        );
    }
    return (await response.json()) as TimelineData;
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function generateId(event: ShittifiedEvent, index: number): string {
    const [d, m, y] = event.date.split("/");
    return `${slugify(event.company)}-${y}-${m}-${d}-${index}`;
}

function deriveTitle(event: ShittifiedEvent): string {
    if (event.title && event.title.trim()) return event.title.trim();
    const trimmed = event.description.trim();
    return trimmed.length > 90 ? `${trimmed.slice(0, 87)}…` : trimmed;
}

/**
 * Validates and enriches raw JSON into render-ready events: resolves each
 * event's company reference, parses its date, fills in a stable id/title,
 * and sorts newest-first. Entries referencing an unknown company are
 * skipped (with a console warning) rather than breaking the whole page.
 */
export function normalizeData(data: TimelineData): NormalizedEvent[] {
    const companiesById = new Map<string, Company>(
        data.companies.map((c) => [c.id, c]),
    );

    const normalized: NormalizedEvent[] = [];

    data.shittified.forEach((event, index) => {
        const companyRef = companiesById.get(event.company);
        if (!companyRef) {
            console.warn(
                `Skipping entry: unknown company id "${event.company}".`,
            );
            return;
        }
        normalized.push({
            id: event.id?.trim() || generateId(event, index),
            company: event.company,
            date: event.date,
            type: event.type,
            title: deriveTitle(event),
            description: event.description,
            source: event.source,
            parsedDate: parseDate(event.date),
            companyRef,
        });
    });

    normalized.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
    return normalized;
}
