export interface Company {
    id: string;
    name: string;
    description?: string;
    icon: string;
}

/**
 * Free-form on purpose. Common values used by the built-in colour
 * mapping are "feature-removal", "price-increase" and "free-removal",
 * but any string is accepted and will get a deterministic colour.
 */
export type ShittificationType = string;

export interface ShittifiedEvent {
    /** Stable id used for deep links. Auto-generated from company+date+index if omitted. */
    id?: string;
    /** References Company.id */
    company: string;
    /** DD/MM/YYYY */
    date: string;
    type: ShittificationType;
    /** Short headline shown on the card. Falls back to a truncated description. */
    title?: string;
    description: string;
    /** Optional URL to a source/article backing up the claim. */
    source?: string;
    additional?: string[];
}

export interface TimelineData {
    companies: Company[];
    shittified: ShittifiedEvent[];
}

/** A ShittifiedEvent after validation, id generation, date parsing and company lookup. */
export interface NormalizedEvent extends Required<
    Pick<ShittifiedEvent, "id" | "company" | "date" | "type" | "description">
> {
    title: string;
    source?: string;
    parsedDate: Date;
    companyRef: Company;
}
