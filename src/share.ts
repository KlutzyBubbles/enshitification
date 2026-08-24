import type { NormalizedEvent } from "./types.js";

export function urlForEvent(event: NormalizedEvent): string {
    const url = new URL(window.location.href);
    url.hash = `event/${event.id}`;
    return url.toString();
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for browsers/contexts without Clipboard API access.
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch {
            copied = false;
        }
        document.body.removeChild(textarea);
        return copied;
    }
}

export function canNativeShare(): boolean {
    return typeof navigator.share === "function";
}

export async function nativeShare(
    event: NormalizedEvent,
    url: string,
): Promise<void> {
    await navigator.share({
        title: `${event.companyRef.name}: ${event.title}`,
        text: event.title,
        url,
    });
}

export function xShareUrl(event: NormalizedEvent, url: string): string {
    const text = `${event.companyRef.name}: ${event.title}`;
    const params = new URLSearchParams({ text, url });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
}
