/**
 * Parses a DD/MM/YYYY date string. Falls back to epoch 0 (with a console
 * warning) if the string can't be parsed, so one bad entry never crashes
 * the whole timeline.
 */
export function parseDate(input: string): Date {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input.trim());
    if (!match) {
        console.warn(`Could not parse date "${input}", expected DD/MM/YYYY.`);
        return new Date(0);
    }
    const [, dayStr, monthStr, yearStr] = match;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isValid =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;

    if (!isValid) {
        console.warn(`Date "${input}" is out of range, expected DD/MM/YYYY.`);
        return new Date(0);
    }

    return date;
}

const DISPLAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

export function formatDateDisplay(date: Date): string {
    return DISPLAY_FORMATTER.format(date);
}
